import L from 'leaflet';

export type CampusKey = 'all' | 'ug' | 'upsa' | 'knust' | 'ucc';

export interface CampusConfig {
  id: CampusKey;
  label: string;
  fullName: string;
  center: [number, number];
  zoom: number;
}

export const CAMPUS_OPTIONS: CampusConfig[] = [
  {
    id: 'all',
    label: 'Accra Hubs',
    fullName: 'UG Legon & UPSA East Legon',
    center: [5.652, -0.176],
    zoom: 14,
  },
  {
    id: 'ug',
    label: 'UG Legon',
    fullName: 'University of Ghana, Legon',
    center: [5.6508, -0.1869],
    zoom: 15,
  },
  {
    id: 'upsa',
    label: 'UPSA',
    fullName: 'UPSA & East Legon / Madina',
    center: [5.654, -0.165],
    zoom: 15,
  },
  {
    id: 'knust',
    label: 'KNUST',
    fullName: 'KNUST Ayeduase, Kumasi',
    center: [6.6731, -1.5654],
    zoom: 15,
  },
  {
    id: 'ucc',
    label: 'UCC',
    fullName: 'UCC Campus, Cape Coast',
    center: [5.1155, -1.2882],
    zoom: 15,
  },
];

export type PoiCategory = 'hospital' | 'university' | 'shopping' | 'hotel' | 'transit' | 'dining';

export interface MapLandmark {
  id: string;
  name: string;
  subtitle: string;
  category: PoiCategory;
  campus: Exclude<CampusKey, 'all'>;
  lat: number;
  lng: number;
}

export const CAMPUS_LANDMARKS: MapLandmark[] = [
  // UPSA / East Legon / Madina / Adjiringanor corridor (matches screenshot view)
  {
    id: 'upsa-main',
    name: 'UPSA Accra',
    subtitle: 'University of Professional Studies',
    category: 'university',
    campus: 'upsa',
    lat: 5.6584,
    lng: -0.1654,
  },
  {
    id: 'ac-mall',
    name: 'A&C Mall',
    subtitle: 'East Legon Shopping & Mart',
    category: 'shopping',
    campus: 'upsa',
    lat: 5.6431,
    lng: -0.1558,
  },
  {
    id: 'ah-hotel',
    name: 'AH Hotel & Conference',
    subtitle: 'Adjiringanor Hospitality',
    category: 'hotel',
    campus: 'upsa',
    lat: 5.6494,
    lng: -0.1538,
  },
  {
    id: 'madina-polyclinic',
    name: 'Madina Polyclinic',
    subtitle: '24/7 Campus Health Clinic',
    category: 'hospital',
    campus: 'upsa',
    lat: 5.6615,
    lng: -0.1602,
  },
  {
    id: 'madina-transit',
    name: 'School Junction Bus Stop',
    subtitle: 'Transit Interchange',
    category: 'transit',
    campus: 'upsa',
    lat: 5.6682,
    lng: -0.1455,
  },
  {
    id: 'east-legon-dining',
    name: 'Bawaleshi Cafés',
    subtitle: 'Student Dining & Takeout',
    category: 'dining',
    campus: 'upsa',
    lat: 5.6398,
    lng: -0.1682,
  },

  // UG Legon Campus Landmarks
  {
    id: 'ug-balme',
    name: 'Balme Library',
    subtitle: 'University of Ghana Central Library',
    category: 'university',
    campus: 'ug',
    lat: 5.6513,
    lng: -0.1862,
  },
  {
    id: 'legon-hospital',
    name: 'Legon Hospital',
    subtitle: 'University Health Services',
    category: 'hospital',
    campus: 'ug',
    lat: 5.6547,
    lng: -0.1806,
  },
  {
    id: 'night-market',
    name: 'Legon Night Market',
    subtitle: 'Student Food Court & Provisions',
    category: 'dining',
    campus: 'ug',
    lat: 5.6442,
    lng: -0.1892,
  },
  {
    id: 'okponglo-transit',
    name: 'Okponglo Station',
    subtitle: 'Shuttle & Bus Terminal',
    category: 'transit',
    campus: 'ug',
    lat: 5.6425,
    lng: -0.1791,
  },

  // KNUST Ayeduase Landmarks
  {
    id: 'knust-main',
    name: 'KNUST Great Hall',
    subtitle: 'Main Academic Campus',
    category: 'university',
    campus: 'knust',
    lat: 6.6745,
    lng: -1.5716,
  },
  {
    id: 'knust-hospital',
    name: 'KNUST Hospital',
    subtitle: 'University Health Centre',
    category: 'hospital',
    campus: 'knust',
    lat: 6.6808,
    lng: -1.5692,
  },
  {
    id: 'ayeduase-mart',
    name: 'Ayeduase Plaza',
    subtitle: 'Student Market & Stationery',
    category: 'shopping',
    campus: 'knust',
    lat: 6.6712,
    lng: -1.5618,
  },

  // UCC Cape Coast Landmarks
  {
    id: 'ucc-science',
    name: 'UCC Science Complex',
    subtitle: 'Main Lecture Halls',
    category: 'university',
    campus: 'ucc',
    lat: 5.1172,
    lng: -1.2904,
  },
  {
    id: 'ucc-hospital',
    name: 'UCC Hospital',
    subtitle: 'Campus Medical Center',
    category: 'hospital',
    campus: 'ucc',
    lat: 5.1128,
    lng: -1.2848,
  },
  {
    id: 'ucc-shuttle',
    name: 'Old Site Transit',
    subtitle: 'Shuttle & Coastal Road Stop',
    category: 'transit',
    campus: 'ucc',
    lat: 5.1105,
    lng: -1.2912,
  },
];

const CATEGORY_STYLE: Record<
  PoiCategory,
  { badgeBg: string; labelColor: string; svgGlyph: string }
> = {
  hospital: {
    badgeBg: '#ea4335',
    labelColor: '#d93025',
    svgGlyph:
      '<text x="16" y="19.5" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="800">H</text>',
  },
  university: {
    badgeBg: '#607d8b',
    labelColor: '#455a64',
    svgGlyph:
      '<path d="M16 10.5L9.5 13.8L16 17.1L22.5 13.8L16 10.5ZM11.8 15.8V18.8C11.8 19.9 13.7 21 16 21C18.3 21 20.2 19.9 20.2 18.8V15.8L16 18L11.8 15.8Z" fill="#ffffff"/>',
  },
  shopping: {
    badgeBg: '#1a73e8',
    labelColor: '#1a73e8',
    svgGlyph:
      '<path d="M12.2 13.5H19.8L20.4 20.2H11.6L12.2 13.5ZM14 13.5V12.6C14 11.5 14.9 10.6 16 10.6C17.1 10.6 18 11.5 18 12.6V13.5" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  hotel: {
    badgeBg: '#e52592',
    labelColor: '#d81b60',
    svgGlyph:
      '<path d="M10.5 18.8V12.8H12V15.6H20V13.8C20.9 13.8 21.5 14.4 21.5 15.3V18.8H20V17.4H12V18.8H10.5ZM14.2 14.9C13.4 14.9 12.8 14.3 12.8 13.5C12.8 12.7 13.4 12.1 14.2 12.1C15 12.1 15.6 12.7 15.6 13.5C15.6 14.3 15 14.9 14.2 14.9Z" fill="#ffffff"/>',
  },
  transit: {
    badgeBg: '#607d8b',
    labelColor: '#455a64',
    svgGlyph: '<circle cx="16" cy="15.2" r="3.8" fill="#ffffff"/>',
  },
  dining: {
    badgeBg: '#f97316',
    labelColor: '#ea580c',
    svgGlyph:
      '<path d="M13 10.5V14.2C13 15 13.6 15.6 14.2 15.7V20.2H15.2V15.7C15.8 15.6 16.4 15 16.4 14.2V10.5H15.6V13.6H15V10.5H14.3V13.6H13.8V10.5H13ZM18.4 10.5C17.6 11.4 17.5 13 17.5 15.3H18.4V20.2H19.4V10.5H18.4Z" fill="#ffffff"/>',
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Teardrop Google-Maps-style POI icon + haloed label matching the screenshot
export function createLandmarkTeardropIcon(landmark: MapLandmark, isActive: boolean) {
  const style = CATEGORY_STYLE[landmark.category];
  const scale = isActive ? 'scale(1.12)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-landmark-pin',
    html: `
      <div style="display:inline-flex;align-items:center;gap:5px;transform:${scale};transform-origin:16px 36px;transition:transform 0.18s ease;pointer-events:auto;">
        <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(17,19,21,0.24));">
          <path d="M16 1.5C8.54 1.5 2.5 7.54 2.5 15C2.5 23.8 13.3 33.7 15.3 35.4C15.7 35.75 16.3 35.75 16.7 35.4C18.7 33.7 29.5 23.8 29.5 15C29.5 7.54 23.46 1.5 16 1.5Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
          <circle cx="16" cy="15" r="10.2" fill="${style.badgeBg}"/>
          ${style.svgGlyph}
        </svg>
        <span class="skycobe-poi-label" style="font-size:12px;font-weight:600;line-height:1.15;color:${style.labelColor};white-space:nowrap;letter-spacing:-0.01em;">
          ${escapeHtml(landmark.name)}
        </span>
      </div>
    `,
    iconSize: [180, 38],
    iconAnchor: [16, 36],
  });
}

// Clean pill price marker (Google Hotels / Airbnb style) that keeps roads readable
export function createHostelPricePin(priceNum: number, isSelected: boolean) {
  const shortPrice =
    priceNum >= 1000
      ? `GH₵${(priceNum / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : `GH₵${priceNum}`;

  const bg = isSelected ? '#111315' : '#ffffff';
  const color = isSelected ? '#ccff00' : '#111315';
  const border = isSelected ? '2px solid #ffffff' : '1px solid rgba(17,19,21,0.12)';
  const shadow = isSelected
    ? '0 8px 20px rgba(17,19,21,0.34)'
    : '0 3px 10px rgba(17,19,21,0.18)';
  const scale = isSelected ? 'scale(1.1)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-hostel-pin',
    html: `
      <div style="display:inline-flex;flex-direction:column;align-items:center;transform:${scale};transform-origin:center bottom;transition:transform 0.18s cubic-bezier(0.16,1,0.3,1);">
        <div style="background:${bg};color:${color};border:${border};box-shadow:${shadow};padding:5px 11px;border-radius:9999px;font-size:12px;font-weight:700;letter-spacing:-0.01em;font-variant-numeric:tabular-nums;white-space:nowrap;line-height:1.15;">
          ${shortPrice}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bg};margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(17,19,21,0.14));"></div>
      </div>
    `,
    iconSize: [78, 34],
    iconAnchor: [39, 34],
  });
}
