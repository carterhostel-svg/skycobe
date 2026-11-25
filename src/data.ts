import { Property } from './types';

export interface ExtendedProperty extends Property {
  gpsCode?: string;
  walkingMin?: number;
  roomTiers?: {
    type: '1-in-a-room' | '2-in-a-room' | '3-in-a-room' | '4-in-a-room';
    label: string;
    pricePerSem: number;
    availableCount: number;
    hasAc: boolean;
    hasBath: 'Private' | 'Shared';
  }[];
}

export const PROPERTIES: ExtendedProperty[] = [
  {
    id: 1,
    name: 'The Haven Executive Residences',
    loc: 'Legon',
    lat: 5.6508,
    lng: -0.1869,
    price: 'GH₵6,500',
    priceNum: 6500,
    rating: 4.9,
    reviews: 148,
    tags: ['wifi', 'ac', 'sec', 'gen'],
    category: 'premium',
    avail: '2 suites left',
    gpsCode: 'GA-492-3810',
    walkingMin: 4,
    img: '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
    images: [
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
      '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg',
      '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg'
    ],
    panoramas: ['https://pannellum.org/images/bma-0.jpg'],
    desc: 'Flagship student residence featuring uninterrupted standby generator, 24/7 water, fiber Wi-Fi, and soundproof study rooms. Opposite Legon campus.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 8900, availableCount: 2, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 5800, availableCount: 4, hasAc: true, hasBath: 'Private' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 3600, availableCount: 6, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 2,
    name: 'Terra Hall Academic Living',
    loc: 'Legon',
    lat: 5.6471,
    lng: -0.1901,
    price: 'GH₵5,200',
    priceNum: 5200,
    rating: 4.8,
    reviews: 96,
    tags: ['wifi', 'sec', 'gen'],
    category: 'premium',
    avail: 'Available',
    gpsCode: 'GA-110-4492',
    walkingMin: 2,
    img: '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
    images: [
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
      '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg',
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg'
    ],
    panoramas: ['https://pannellum.org/images/library.jpg'],
    desc: 'Quiet academic residence situated inside Legon. Immediate walking distance to lecture halls and central library.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 7800, availableCount: 1, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 5200, availableCount: 5, hasAc: true, hasBath: 'Shared' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 3400, availableCount: 8, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 3,
    name: 'Pentagon & Bani Student Complex',
    loc: 'Legon',
    lat: 5.6510,
    lng: -0.1855,
    price: 'GH₵4,800',
    priceNum: 4800,
    rating: 4.7,
    reviews: 230,
    tags: ['wifi', 'sec', 'gen', 'ac'],
    category: 'standard',
    avail: '4 rooms left',
    gpsCode: 'GA-382-7104',
    walkingMin: 6,
    img: '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg',
    images: [
      '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg',
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
      '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg'
    ],
    panoramas: ['https://pannellum.org/images/jfk.jpg'],
    desc: 'Vibrant student community in Legon Diaspora. Fitted with rooftop terrace study pods, laundry services, mart, and shuttle connection.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room (Studio)', pricePerSem: 7500, availableCount: 3, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room (Standard)', pricePerSem: 4800, availableCount: 4, hasAc: true, hasBath: 'Private' },
      { type: '4-in-a-room', label: '4 in a Room (Value)', pricePerSem: 3100, availableCount: 10, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 4,
    name: 'The Study Hub & Studio Suites',
    loc: 'Legon',
    lat: 5.6582,
    lng: -0.1868,
    price: 'GH₵3,900',
    priceNum: 3900,
    rating: 4.6,
    reviews: 82,
    tags: ['wifi', 'gen'],
    category: 'budget',
    avail: '5 rooms left',
    gpsCode: 'GE-201-9943',
    walkingMin: 8,
    img: '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg',
    images: [
      '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg',
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg'
    ],
    panoramas: ['https://pannellum.org/images/bma-1.jpg'],
    desc: 'Modern student hostel featuring quiet reading rooms, reliable water reservoirs, and campus shuttle access.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 6200, availableCount: 2, hasAc: false, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 3900, availableCount: 5, hasAc: false, hasBath: 'Shared' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 2600, availableCount: 12, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 5,
    name: 'Evandy & TF Enclave Living',
    loc: 'Legon',
    lat: 5.6350,
    lng: -0.1850,
    price: 'GH₵4,600',
    priceNum: 4600,
    rating: 4.5,
    reviews: 114,
    tags: ['sec', 'gen', 'wifi'],
    category: 'standard',
    avail: 'Available',
    gpsCode: 'GA-510-1892',
    walkingMin: 5,
    img: '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
    images: [
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
      '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg',
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg'
    ],
    panoramas: ['https://pannellum.org/images/milan.jpg'],
    desc: 'Trusted student residence near South Gate. Known for tight security, cleanliness, and active student community.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 7200, availableCount: 1, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 4600, availableCount: 6, hasAc: true, hasBath: 'Private' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 3200, availableCount: 9, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 6,
    name: 'Kumasi Tech Apex Residences',
    loc: 'Ayeduase',
    lat: 6.6731,
    lng: -1.5654,
    price: 'GH₵4,200',
    priceNum: 4200,
    rating: 4.8,
    reviews: 175,
    tags: ['wifi', 'sec', 'ac', 'gen'],
    category: 'standard',
    avail: '3 rooms left',
    gpsCode: 'AK-391-4402',
    walkingMin: 4,
    img: '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
    images: [
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
      '/src/assets/images/hostel_study_lounge_hub_1793064307395.jpg',
      '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg'
    ],
    panoramas: [],
    desc: 'Top choice for KNUST engineering and science students in Ayeduase with backup power and security.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 6800, availableCount: 3, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 4200, availableCount: 5, hasAc: true, hasBath: 'Private' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 2900, availableCount: 8, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 7,
    name: 'Cape Coast Seaside Scholar Hostel',
    loc: 'Cape Coast',
    lat: 5.1155,
    lng: -1.2882,
    price: 'GH₵3,700',
    priceNum: 3700,
    rating: 4.7,
    reviews: 64,
    tags: ['wifi', 'sec', 'gen'],
    category: 'budget',
    avail: 'Available',
    gpsCode: 'CC-094-1183',
    walkingMin: 5,
    img: '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg',
    images: [
      '/src/assets/images/hostel_terrace_exterior_1793064306957.jpg',
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg'
    ],
    panoramas: [],
    desc: 'Scenic seaside campus accommodation for UCC students. Short walk to science lecture blocks.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 5800, availableCount: 2, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 3700, availableCount: 7, hasAc: false, hasBath: 'Shared' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 2400, availableCount: 10, hasAc: false, hasBath: 'Shared' }
    ]
  },
  {
    id: 8,
    name: 'UPSA Metro Student Tower',
    loc: 'Madina',
    lat: 5.6540,
    lng: -0.1650,
    price: 'GH₵4,900',
    priceNum: 4900,
    rating: 4.7,
    reviews: 89,
    tags: ['wifi', 'ac', 'sec', 'gen'],
    category: 'standard',
    avail: '4 rooms left',
    gpsCode: 'GA-712-9011',
    walkingMin: 3,
    img: '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
    images: [
      '/src/assets/images/hostel_room_premium_suite_1793064306621.jpg',
      '/src/assets/images/hero_student_residence_haven_1793064306511.jpg'
    ],
    panoramas: [],
    desc: 'High-rise residence opposite UPSA campus with backup electricity and security access.',
    roomTiers: [
      { type: '1-in-a-room', label: '1 in a Room', pricePerSem: 7600, availableCount: 2, hasAc: true, hasBath: 'Private' },
      { type: '2-in-a-room', label: '2 in a Room', pricePerSem: 4900, availableCount: 4, hasAc: true, hasBath: 'Private' },
      { type: '4-in-a-room', label: '4 in a Room', pricePerSem: 3300, availableCount: 8, hasAc: false, hasBath: 'Shared' }
    ]
  }
];