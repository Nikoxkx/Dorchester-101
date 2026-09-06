export interface NeighborhoodProfile {
  slug: string;
  name: string;
  description: string;
  transitAccess: string;
  landmarks: string[];
  schools: string[];
  history: string;
  currentDevelopments: string;
  zipHints: string[];
}

export const NEIGHBORHOODS: NeighborhoodProfile[] = [
  {
    slug: 'fields-corner',
    name: 'Fields Corner',
    description: 'Commercial heart of the Dot on the Red Line. Vietnamese businesses along Dorchester Avenue, Town Field, and a weekday crush of the 17/18 buses.',
    transitAccess: 'Red Line (Fields Corner); buses 17, 18, 210',
    landmarks: ['Fields Corner station', 'Dorchester Avenue restaurants', 'Town Field'],
    schools: ['Boston Latin Academy (nearby)', 'Jeremiah E. Burke High', 'Mildred Avenue K-8'],
    history: 'Named for the Fields family farm. The commercial strip grew with the elevated railway in 1927. Today it is one of the largest Vietnamese business districts on the East Coast.',
    currentDevelopments: 'Station-area housing and streetscape work. Check BPDA for live Article 80 filings.',
    zipHints: ['02122'],
  },
  {
    slug: 'savin-hill',
    name: 'Savin Hill',
    description: 'Hill and beach neighborhood between the Red Line and the harbor. Malibu Beach, Savin Hill Park, and a short walk to UMass Boston / JFK.',
    transitAccess: 'Red Line (Savin Hill); buses 17, 18',
    landmarks: ['Malibu Beach', 'Savin Hill Park', 'Dot Block'],
    schools: ['Lee Academy', 'Boston Collegiate Charter'],
    history: 'Once Old Hill; renamed for a sea captain. Victorian houses on the hill, triple-deckers on the flats.',
    currentDevelopments: 'Dot Block mixed-use next to the station.',
    zipHints: ['02125'],
  },
  {
    slug: 'uphams-corner',
    name: 'Uphams Corner',
    description: 'Old village center on Columbia Road. Strand Theatre, the library, and the Fairmount Line. Cape Verdean and Black-owned businesses on the square.',
    transitAccess: 'Fairmount Line (Uphams Corner); buses 15, 41',
    landmarks: ['Strand Theatre', 'Uphams Corner Library', 'Columbia Road'],
    schools: ['Orchard Gardens K-8', 'UP Academy Dorchester'],
    history: 'Village since the 1700s, named for postmaster Amos Upham. The Strand is one of Boston’s oldest theaters still in community use.',
    currentDevelopments: 'Arts-district and DBEDC housing along Columbia Road.',
    zipHints: ['02125'],
  },
  {
    slug: 'codman-square',
    name: 'Codman Square',
    description: 'Health center, library, and Washington Street businesses. A long-running CDC (CSNDC) and a lot of Haitian Creole and Cape Verdean on the sidewalk.',
    transitAccess: 'Buses 23, 26, 28; Fairmount Line nearby at Talbot / Four Corners',
    landmarks: ['Codman Square Health Center', 'Second Church in Dorchester', 'Codman Square Library'],
    schools: ['Codman Academy', 'Young Achievers'],
    history: 'Named for merchant John Codman. A center of community development work since the 1970s.',
    currentDevelopments: 'CSNDC housing and storefront work on Washington Street.',
    zipHints: ['02124'],
  },
  {
    slug: 'grove-hall',
    name: 'Grove Hall',
    description: 'Blue Hill Avenue corridor at the Roxbury line. Caribbean and African shops, the library, and the edge of Franklin Park.',
    transitAccess: 'Buses 23, 28, 45, 66',
    landmarks: ['Grove Hall Library', 'Franklin Park', 'Blue Hill Avenue'],
    schools: ['Frederick Pilot Middle', 'Lee K-8'],
    history: 'Victorian suburb that became a working-class neighborhood. Named for a tavern.',
    currentDevelopments: 'Blue Hill Avenue bus and street upgrades.',
    zipHints: ['02121'],
  },
  {
    slug: 'four-corners',
    name: 'Four Corners',
    description: 'Washington, Bowdoin, Harvard, and Geneva. Fairmount station at Four Corners/Geneva and a mix of triple-deckers and storefronts.',
    transitAccess: 'Fairmount Line (Four Corners/Geneva); buses 19, 23, 28',
    landmarks: ['Four Corners Main Streets', 'Geneva Cliffs Urban Wild'],
    schools: ['Dever-McCormack K-8', 'Boston Day and Evening Academy'],
    history: 'Named for the four-way intersection. A historic commercial node between Codman and Grove Hall.',
    currentDevelopments: 'Transit-oriented proposals around the Fairmount stop.',
    zipHints: ['02121', '02124'],
  },
  {
    slug: 'lower-mills',
    name: 'Lower Mills',
    description: 'Neponset River mill village. Baker Chocolate buildings, the river trail, and the Mattapan trolley just over the Milton line.',
    transitAccess: 'Mattapan Trolley (Milton / Central Ave); buses 27, 240',
    landmarks: ['Walter Baker Chocolate Factory', 'Neponset River Trail', 'Lower Mills Library'],
    schools: ['Holmes Elementary'],
    history: 'Site of the first chocolate mill in the country (Walter Baker, 1780). Mills are condos now.',
    currentDevelopments: 'Riverfront trail and small infill.',
    zipHints: ['02124'],
  },
  {
    slug: 'ashmont',
    name: 'Ashmont',
    description: 'Red Line terminus and Peabody Square. Ashmont Hill’s Victorians sit above the station and the Mattapan trolley yard.',
    transitAccess: 'Red Line & Mattapan Trolley (Ashmont); buses 22, 23, 26, 27, 215, 217, 240',
    landmarks: ['Ashmont station', 'Peabody Square', 'All Saints Church', 'Ashmont Hill'],
    schools: ['Mather Elementary', 'Henderson K-12'],
    history: 'Named for a 19th-century estate. Ashmont Hill has some of the finest wood-frame Victorians in the city.',
    currentDevelopments: 'Peabody Square streetscape work.',
    zipHints: ['02124'],
  },
  {
    slug: 'neponset',
    name: 'Neponset',
    description: 'Marsh and waterfront along the river and harbor. Pope John Paul II Park, Tenean Beach, and Harbor Point to the north.',
    transitAccess: 'Buses 201, 202 to Ashmont',
    landmarks: ['Neponset River Reservation', 'Pope John Paul II Park', 'Tenean Beach'],
    schools: ['Neighborhood House Charter'],
    history: 'Named for the Neponset people. Industrial in the 1800s; parkland now takes much of the shoreline.',
    currentDevelopments: 'Harbor Point and river reservation upkeep.',
    zipHints: ['02122'],
  },
  {
    slug: 'meeting-house-hill',
    name: 'Meeting House Hill',
    description: 'The 1743 First Parish meetinghouse sits on the hill above Fields Corner. Residential streets, parish hall, and a view toward the harbor.',
    transitAccess: 'Buses 17, 18; Fields Corner Red Line',
    landmarks: ['First Parish Dorchester', 'Dorchester Park nearby'],
    schools: ['Local BPS elementary schools'],
    history: 'Civic and religious center of 18th-century Dorchester. The congregation dates to 1630 — older than Boston’s annexation of the town.',
    currentDevelopments: 'Mostly residential; watch Article 80 for small infill.',
    zipHints: ['02122'],
  },
  {
    slug: 'adams-village',
    name: 'Adams Village',
    description: 'Small commercial square on Adams Street toward Neponset — bakeries, the post office, and bus connections to Ashmont.',
    transitAccess: 'Buses 201, 202, 210',
    landmarks: ['Adams Street shops', 'Cedar Grove Cemetery nearby'],
    schools: ['Nearby BPS schools'],
    history: 'A 20th-century neighborhood square serving the flats between Ashmont and Neponset.',
    currentDevelopments: 'Storefront turnover; no single large BPDA project.',
    zipHints: ['02122', '02124'],
  },
  {
    slug: 'port-norfolk',
    name: 'Port Norfolk',
    description: 'A small peninsula in the Neponset, almost a village of its own. Quiet streets, a yacht club, and the river on three sides.',
    transitAccess: 'Bus 201 / 202; long walk to Ashmont',
    landmarks: ['Port Norfolk waterfront', 'Neponset River'],
    schools: ['Neighborhood House Charter'],
    history: 'Shipbuilding and river industry. Now mostly residential.',
    currentDevelopments: 'Limited; flood and river-edge issues matter more than towers.',
    zipHints: ['02122'],
  },
];

export const DORCHESTER_OVERVIEW = {
  settled: 1630,
  annexed: 1870,
  approxSqMiles: 6,
  zipCodes: ['02121', '02122', '02124', '02125'],
  redLineStops: ['JFK/UMass', 'Savin Hill', 'Fields Corner', 'Shawmut', 'Ashmont'],
  fairmountStops: ['Uphams Corner', 'Four Corners/Geneva', 'Talbot Avenue'],
  note: 'Dorchester is not a Census place. Population figures you see online mix ZIP codes, PUMAs, and planning districts. Treat “150,000” as a planning estimate, not a headcount.',
};

export const TRANSIT_GUIDE = {
  redLine: {
    stations: [
      { name: 'JFK/UMass', transfers: ['Commuter Rail', 'Bus 8, 16'] },
      { name: 'Savin Hill', transfers: ['Bus 17, 18'] },
      { name: 'Fields Corner', transfers: ['Bus 17, 18, 210'] },
      { name: 'Shawmut', transfers: ['Bus 22, 23'] },
      { name: 'Ashmont', transfers: ['Mattapan Trolley', 'Bus 22, 23, 26, 27, 215, 217, 240'] },
    ],
    frequency: 'About every 4–8 minutes in the peak, 8–12 off-peak — check the live board.',
  },
  fairmount: {
    stations: [
      { name: 'Uphams Corner', transfers: ['Bus 15, 41'] },
      { name: 'Four Corners/Geneva', transfers: ['Bus 19, 23, 28'] },
      { name: 'Talbot Avenue', transfers: ['Bus 23, 26, 28'] },
    ],
    note: 'Zone 1A commuter rail. Same $2.40 subway fare.',
  },
  busRoutes: [
    { route: '16', destination: 'Forest Hills via Columbia Rd', frequency: '10–15 min' },
    { route: '17', destination: 'Andrew via Fields Corner', frequency: '15–20 min' },
    { route: '18', destination: 'Andrew via Savin Hill', frequency: '15–20 min' },
    { route: '23', destination: 'Ruggles via Blue Hill Ave', frequency: '6–10 min' },
    { route: '26', destination: 'Ashmont via Talbot Ave', frequency: '15–20 min' },
    { route: '28', destination: 'Ruggles via Blue Hill Ave', frequency: '6–10 min' },
  ],
  farePrograms: [
    { name: 'CharlieCard / contactless', description: 'Subway $2.40, local bus $1.70. Monthly LinkPass $90.' },
    { name: 'Youth', description: 'BPS students have a youth pass — see MBTA youth fares.' },
    { name: 'Reduced fare', description: 'Seniors 65+ and riders with disabilities pay about half.' },
    { name: 'Income-eligible', description: 'MBTA means-tested fare program — apply on mbta.com/fares.' },
  ],
};

export const TENANT_RIGHTS = {
  sourceUrl: 'https://www.masslegalhelp.org/housing',
  sourceName: 'Massachusetts Legal Help',
  eviction: [
    'You get a court hearing before a legal eviction. A landlord cannot change the locks or dump your things.',
    '14-day notice for nonpayment; 30 days for most other no-fault or lease-violation cases (read the notice — some are different).',
    'You can ask for a jury trial.',
    'Free defense: Greater Boston Legal Services (617) 603-1700, intake weekday mornings. City Life / Vida Urbana (617) 524-3541.',
  ],
  habitability: [
    'Heat: 68°F in the day, 64°F at night, September 15–June 15.',
    'Hot water at least 110°F.',
    'Lead paint rules apply to pre-1978 buildings with children under 6.',
  ],
  deposits: [
    'Cap: first month, last month, one month security, and a lock-change fee.',
    'Security must sit in an interest-bearing account and come back within 30 days of move-out with an itemized list.',
  ],
};
