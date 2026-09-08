export interface DistrictInfo {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  highways: string[];
  terrain: string;
}

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  capital: string;
  lat: number;
  lng: number;
  zoom: number;
  districts: DistrictInfo[];
}

export const NER_REGIONS: StateInfo[] = [
  {
    id: "meghalaya",
    name: "Meghalaya",
    code: "ML",
    capital: "Shillong",
    lat: 25.5788,
    lng: 91.8933,
    zoom: 8.5,
    districts: [
      {
        name: "East Khasi Hills",
        lat: 25.5788,
        lng: 91.8933,
        zoom: 10,
        highways: ["NH-6", "Sohra-Shella Corridor"],
        terrain: "Steep Plateau & Sub-Himalayan Escarpments",
      },
      {
        name: "Ri-Bhoi",
        lat: 25.9031,
        lng: 91.8803,
        zoom: 9.8,
        highways: ["NH-6 Guwahati-Shillong Expressway"],
        terrain: "Rolling Foothills & High Soil Saturation",
      },
      {
        name: "West Khasi Hills",
        lat: 25.5204,
        lng: 91.2687,
        zoom: 9.8,
        highways: ["Mairang-Nongstoin Road"],
        terrain: "Dense Hill Slopes & Valley Basins",
      },
      {
        name: "South West Khasi Hills",
        lat: 25.3667,
        lng: 91.4552,
        zoom: 9.8,
        highways: ["Mawkyrwat-Ranikor Road"],
        terrain: "High Precipitation Mountain Belts",
      },
      {
        name: "West Jaintia Hills",
        lat: 25.4417,
        lng: 92.2033,
        zoom: 9.8,
        highways: ["NH-6 Jowai-Badarpur Corridor"],
        terrain: "Karst Limestone & Fractured Shale Formations",
      },
      {
        name: "East Jaintia Hills",
        lat: 25.3500,
        lng: 92.3667,
        zoom: 9.8,
        highways: ["NH-6 Khliehriat Bypass"],
        terrain: "Mining Impacted Unstable Slopes",
      },
      {
        name: "West Garo Hills",
        lat: 25.5200,
        lng: 90.2200,
        zoom: 9.8,
        highways: ["NH-51 Tura-Dalu Road"],
        terrain: "Weathered Granite & Laterite Hillocks",
      },
      {
        name: "East Garo Hills",
        lat: 25.6000,
        lng: 90.6167,
        zoom: 9.8,
        highways: ["Williamnagar-Nongalbibra Road"],
        terrain: "Riverine Valley Slopes",
      },
      {
        name: "South Garo Hills",
        lat: 25.2000,
        lng: 90.6300,
        zoom: 9.8,
        highways: ["Baghmara Border Highway"],
        terrain: "Border Fault Lines & Sandstone Ridges",
      },
    ],
  },
  {
    id: "assam",
    name: "Assam",
    code: "AS",
    capital: "Dispur (Guwahati)",
    lat: 26.1445,
    lng: 91.7362,
    zoom: 7.8,
    districts: [
      {
        name: "Kamrup Metropolitan",
        lat: 26.1445,
        lng: 91.7362,
        zoom: 10,
        highways: ["NH-27", "NH-17"],
        terrain: "Urban Hill Slopes & Brahmaputra Alluvium",
      },
      {
        name: "Dima Hasao",
        lat: 25.1833,
        lng: 93.0167,
        zoom: 9.5,
        highways: ["NH-54E Haflong-Silchar Link", "Lumding Railway Hill Section"],
        terrain: "Active Barail Range Thrust Faults & High Landslide Frequency",
      },
      {
        name: "Cachar",
        lat: 24.8333,
        lng: 92.7976,
        zoom: 9.5,
        highways: ["NH-37", "NH-6 Silchar Route"],
        terrain: "Barak Valley River Terrace & Mudstone Slopes",
      },
      {
        name: "Karbi Anglong",
        lat: 25.8400,
        lng: 93.4300,
        zoom: 9.2,
        highways: ["NH-29 Diphu-Dimapur Road"],
        terrain: "Mikir Hills Metamorphic Complex",
      },
      {
        name: "Hailakandi",
        lat: 24.6853,
        lng: 92.5642,
        zoom: 9.8,
        highways: ["NH-154"],
        terrain: "Low-lying Floodplains & Flank Ridges",
      },
      {
        name: "Karimganj",
        lat: 24.8700,
        lng: 92.3500,
        zoom: 9.8,
        highways: ["NH-8 Tripura Link"],
        terrain: "Southern Border Escarpments",
      },
      {
        name: "Dibrugarh",
        lat: 27.4728,
        lng: 94.9120,
        zoom: 9.5,
        highways: ["NH-15", "Bogibeel Corridor"],
        terrain: "Upper Assam Basin Sedimentary Formations",
      },
    ],
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    code: "AR",
    capital: "Itanagar",
    lat: 27.0844,
    lng: 93.6053,
    zoom: 7.5,
    districts: [
      {
        name: "Papum Pare",
        lat: 27.0844,
        lng: 93.6053,
        zoom: 10,
        highways: ["NH-415 Itanagar-Naharlagun Highway"],
        terrain: "Sub-Himalayan Siwalik Sandstone & Siltstone",
      },
      {
        name: "Tawang",
        lat: 27.5833,
        lng: 91.8667,
        zoom: 9.8,
        highways: ["NH-13 BCT Road", "Sela Tunnel Axis"],
        terrain: "High Altitude Glacial Moraines & Steep Gorges",
      },
      {
        name: "West Kameng",
        lat: 27.2667,
        lng: 92.4167,
        zoom: 9.5,
        highways: ["NH-13 Trans-Arunachal Highway"],
        terrain: "Lesser Himalayan Crystalline Gneiss",
      },
      {
        name: "Lower Subansiri",
        lat: 27.5833,
        lng: 93.8333,
        zoom: 9.5,
        highways: ["Ziro Valley Highway"],
        terrain: "Intermontane Plateau & Fractured Slopes",
      },
      {
        name: "East Siang",
        lat: 28.0700,
        lng: 95.3300,
        zoom: 9.5,
        highways: ["NH-515 Pasighat Axis"],
        terrain: "Siang River Canyon & Active Seismic Zone V",
      },
      {
        name: "Lohit",
        lat: 27.9167,
        lng: 96.1667,
        zoom: 9.5,
        highways: ["NH-13 Tezu-Hayuliang Road"],
        terrain: "Mishmi Hills Tectonic Zone",
      },
    ],
  },
  {
    id: "sikkim",
    name: "Sikkim",
    code: "SK",
    capital: "Gangtok",
    lat: 27.3389,
    lng: 88.6138,
    zoom: 8.8,
    districts: [
      {
        name: "East Sikkim (Gangtok)",
        lat: 27.3389,
        lng: 88.6138,
        zoom: 10.5,
        highways: ["NH-10 Siliguri-Gangtok Lifeline", "JN Road to Nathu La"],
        terrain: "Steep Phyllite & Schist Slopes with High Rainfall",
      },
      {
        name: "North Sikkim (Mangan)",
        lat: 27.5061,
        lng: 88.5282,
        zoom: 9.5,
        highways: ["Chungthang-Lachen-Lachung Highway"],
        terrain: "High Himalayan Gorges, Debris Flow Zones & Glacial Lakes",
      },
      {
        name: "South Sikkim (Namchi)",
        lat: 27.1666,
        lng: 88.3582,
        zoom: 10,
        highways: ["Jorethang-Namchi Route"],
        terrain: "Rangit River Catchment Slopes",
      },
      {
        name: "West Sikkim (Gyalshing)",
        lat: 27.2917,
        lng: 88.2562,
        zoom: 10,
        highways: ["Pelling-Gyalshing Axis"],
        terrain: "Folded Metasediments & Terraced Slopes",
      },
    ],
  },
  {
    id: "nagaland",
    name: "Nagaland",
    code: "NL",
    capital: "Kohima",
    lat: 25.6751,
    lng: 94.1086,
    zoom: 8.5,
    districts: [
      {
        name: "Kohima",
        lat: 25.6751,
        lng: 94.1086,
        zoom: 10,
        highways: ["NH-29 Dimapur-Kohima-Imphal Highway"],
        terrain: "Disang Shale Formation & Chronic Sinking Zones",
      },
      {
        name: "Dimapur",
        lat: 25.9060,
        lng: 93.7266,
        zoom: 10,
        highways: ["NH-29 Plains Entry"],
        terrain: "Alluvial Plain Bordering Foothills",
      },
      {
        name: "Mokokchung",
        lat: 26.3262,
        lng: 94.5262,
        zoom: 9.8,
        highways: ["NH-2 Mokokchung-Amguri Road"],
        terrain: "Linear Anticlinal Ridges",
      },
      {
        name: "Wokha",
        lat: 26.1000,
        lng: 94.2600,
        zoom: 9.8,
        highways: ["NH-2 Central Axis"],
        terrain: "Steep Sandstone Ridges & Tea Slopes",
      },
    ],
  },
  {
    id: "manipur",
    name: "Manipur",
    code: "MN",
    capital: "Imphal",
    lat: 24.8170,
    lng: 93.9368,
    zoom: 8.5,
    districts: [
      {
        name: "Imphal West",
        lat: 24.8170,
        lng: 93.9368,
        zoom: 10.2,
        highways: ["NH-2", "NH-37"],
        terrain: "Imphal Valley Basin & Surrounding Hills",
      },
      {
        name: "Senapati",
        lat: 25.2667,
        lng: 94.0167,
        zoom: 9.8,
        highways: ["NH-2 Kohima-Imphal Lifeline"],
        terrain: "High Mountain Passes & Vulnerable Cut Slopes",
      },
      {
        name: "Churachandpur",
        lat: 24.3300,
        lng: 93.6800,
        zoom: 9.8,
        highways: ["Tiddim Road", "NH-102B"],
        terrain: "Southern Hill Tracts & Soft Sedimentary Bedrock",
      },
      {
        name: "Tamenglong",
        lat: 24.9900,
        lng: 93.4900,
        zoom: 9.5,
        highways: ["NH-37 Imphal-Jiribam Lifeline"],
        terrain: "Deep Canyons, High Monsoonal Rainfall & Landslide Hotspot",
      },
    ],
  },
  {
    id: "mizoram",
    name: "Mizoram",
    code: "MZ",
    capital: "Aizawl",
    lat: 23.7271,
    lng: 92.7176,
    zoom: 8.5,
    districts: [
      {
        name: "Aizawl",
        lat: 23.7271,
        lng: 92.7176,
        zoom: 10.5,
        highways: ["NH-54 Silchar-Aizawl Lifeline"],
        terrain: "Steep North-South Parallel Ridges & High Urban Hazard",
      },
      {
        name: "Lunglei",
        lat: 22.8800,
        lng: 92.7300,
        zoom: 9.8,
        highways: ["NH-54 Southern Extension"],
        terrain: "Deeply Dissected Structural Hills",
      },
      {
        name: "Champhai",
        lat: 23.4700,
        lng: 93.3300,
        zoom: 9.8,
        highways: ["Indo-Myanmar Border Corridor"],
        terrain: "Eastern Plateau & Valley Terraces",
      },
      {
        name: "Kolasib",
        lat: 24.2300,
        lng: 92.6800,
        zoom: 9.8,
        highways: ["NH-54 Gateway Corridor"],
        terrain: "Northern Foothills with High Silt Content",
      },
    ],
  },
  {
    id: "tripura",
    name: "Tripura",
    code: "TR",
    capital: "Agartala",
    lat: 23.8315,
    lng: 91.2868,
    zoom: 8.8,
    districts: [
      {
        name: "West Tripura (Agartala)",
        lat: 23.8315,
        lng: 91.2868,
        zoom: 10,
        highways: ["NH-8 Assam-Agartala Highway"],
        terrain: "Low-lying Alluvial Valley & Gentle Uplands",
      },
      {
        name: "Dhalai",
        lat: 23.9200,
        lng: 91.8500,
        zoom: 9.5,
        highways: ["NH-8 Longtharai Range Axis"],
        terrain: "Longtharai & Atharamura Anticlines with Soil Creep",
      },
      {
        name: "North Tripura",
        lat: 24.3667,
        lng: 92.1667,
        zoom: 9.5,
        highways: ["NH-8 Dharmanagar Link"],
        terrain: "Jampui Hills Range Escarpment",
      },
    ],
  },
];

export function findDistrict(stateName?: string, districtName?: string): DistrictInfo | null {
  if (!districtName) return null;
  for (const state of NER_REGIONS) {
    if (!stateName || state.name.toLowerCase() === stateName.toLowerCase()) {
      const match = state.districts.find(
        (d) => d.name.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(d.name.toLowerCase())
      );
      if (match) return match;
    }
  }
  return null;
}
