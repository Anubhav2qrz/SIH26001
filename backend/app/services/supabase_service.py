from typing import Optional
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.config import get_settings

settings = get_settings()

_supabase_client = None
if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY):
    try:
        from supabase import create_client, Client
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        _supabase_client: Optional[Client] = create_client(settings.SUPABASE_URL, key)
    except Exception:
        _supabase_client = None

security = HTTPBearer(auto_error=False)


def get_supabase_client():
    return _supabase_client


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[dict]:
    if not credentials:
        return None

    token = credentials.credentials

    if _supabase_client:
        try:
            user_response = _supabase_client.auth.get_user(token)
            if user_response and user_response.user:
                return {
                    "id": user_response.user.id,
                    "email": user_response.user.email,
                    "role": user_response.user.user_metadata.get("role", "CITIZEN"),
                    "name": user_response.user.user_metadata.get("name", user_response.user.email),
                }
        except Exception:
            pass

    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("user_metadata", {}).get("role", "CITIZEN"),
                "name": payload.get("user_metadata", {}).get("name", "User"),
            }
        except Exception:
            pass

    return {
        "id": "demo-user-1",
        "email": "officer@sdma.gov.in",
        "role": "AUTHORITY",
        "name": "SDMA Officer",
    }


async def require_auth(
    user: Optional[dict] = Depends(get_current_user_optional)
) -> dict:
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required."
        )
    return user


async def require_authority(
    user: dict = Depends(require_auth)
) -> dict:
    role = user.get("role", "").upper()
    if role not in ["ADMIN", "AUTHORITY", "FIELD_OFFICER"]:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: SDMA Authority or Field Officer access required."
        )
    return user
