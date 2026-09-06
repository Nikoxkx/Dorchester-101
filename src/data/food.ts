export interface FoodSite {
  id: string;
  name: string;
  type: 'Food Pantry' | 'Hot Meals' | 'Mobile Market' | 'Hotline';
  address: string;
  neighborhood: string;
  phone: string;
  website: string | null;
  hours: Record<string, string>;
  languages: string[];
  foodTypes: string[];
  requirements: string;
  acceptsEbt: boolean;
  transitAccess: string;
  lastVerified: string;
  lat?: number;
  lng?: number;
}

export const FOOD_SITES: FoodSite[] = [
  {
    id: 'codman-pantry',
    name: 'Codman Square Health Center Food Pantry',
    type: 'Food Pantry',
    address: '637 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    phone: '(617) 825-9660',
    website: 'https://www.codman.org',
    hours: {
      monday: '10:00 AM - 2:00 PM',
      tuesday: '10:00 AM - 2:00 PM',
      wednesday: 'Closed',
      thursday: '10:00 AM - 2:00 PM',
      friday: '10:00 AM - 2:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole'],
    foodTypes: ['Produce', 'Canned goods', 'Diapers', 'Formula'],
    requirements: 'Proof of a Dorchester address (utility bill or mail). Call ahead — hours shift around holidays.',
    acceptsEbt: false,
    transitAccess: 'Bus 23, 26, 28 to Codman Square',
    lastVerified: '2026-06-01',
    lat: 42.288,
    lng: -71.0722,
  },
  {
    id: 'kroc',
    name: 'Salvation Army Kroc Center Pantry',
    type: 'Food Pantry',
    address: '650 Dudley Street, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    phone: '(617) 318-6900',
    website: 'https://easternusa.salvationarmy.org/massachusetts/boston-kroc/',
    hours: {
      monday: '9:00 AM - 12:00 PM',
      tuesday: '9:00 AM - 12:00 PM',
      wednesday: '9:00 AM - 12:00 PM',
      thursday: '9:00 AM - 12:00 PM',
      friday: 'Closed',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish', 'Haitian Creole'],
    foodTypes: ['Produce', 'Canned goods', 'Bakery'],
    requirements: 'Photo ID preferred, not required.',
    acceptsEbt: true,
    transitAccess: 'Bus 15, 41 near Uphams Corner',
    lastVerified: '2026-06-01',
    lat: 42.3145,
    lng: -71.0695,
  },
  {
    id: 'st-marks',
    name: "St. Mark's Community Meal",
    type: 'Hot Meals',
    address: '1725 Dorchester Avenue, Dorchester, MA 02124',
    neighborhood: 'Fields Corner',
    phone: '(617) 825-2851',
    website: null,
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: 'Closed',
      thursday: 'Closed',
      friday: 'Closed',
      saturday: '11:00 AM - 1:00 PM',
      sunday: 'Closed',
    },
    languages: ['English', 'Vietnamese'],
    foodTypes: ['Hot meals'],
    requirements: 'None. Walk in.',
    acceptsEbt: false,
    transitAccess: 'Fields Corner Red Line, ~2 min walk',
    lastVerified: '2026-06-01',
    lat: 42.2995,
    lng: -71.0615,
  },
  {
    id: 'first-parish',
    name: 'First Parish Dorchester Community Meal',
    type: 'Hot Meals',
    address: '10 Parish Street, Dorchester, MA 02122',
    neighborhood: 'Meeting House Hill',
    phone: '(617) 436-0527',
    website: 'https://www.firstparishdorchester.org',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: 'Closed',
      thursday: 'Closed',
      friday: 'Closed',
      saturday: 'Closed',
      sunday: 'Check parish calendar',
    },
    languages: ['English'],
    foodTypes: ['Hot meals'],
    requirements: 'Open to all. Confirm the current Sunday or midweek meal on the parish site.',
    acceptsEbt: false,
    transitAccess: 'Bus 17, 18; Fields Corner Red Line',
    lastVerified: '2026-06-01',
    lat: 42.3075,
    lng: -71.0619,
  },
  {
    id: 'gbfb-finder',
    name: 'Greater Boston Food Bank — site finder',
    type: 'Mobile Market',
    address: 'Rotating Dorchester sites (Codman, Uphams, Fields Corner)',
    neighborhood: 'Dorchester',
    phone: '(617) 427-5200',
    website: 'https://www.gbfb.org/need-food/',
    hours: {
      monday: 'See gbfb.org/need-food',
      tuesday: 'See gbfb.org/need-food',
      wednesday: 'See gbfb.org/need-food',
      thursday: 'See gbfb.org/need-food',
      friday: 'See gbfb.org/need-food',
      saturday: 'See gbfb.org/need-food',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish'],
    foodTypes: ['Produce', 'Shelf-stable', 'Protein'],
    requirements: 'Varies by partner site. Many require no ID.',
    acceptsEbt: false,
    transitAccess: 'Depends on the week’s site',
    lastVerified: '2026-06-01',
  },
];
