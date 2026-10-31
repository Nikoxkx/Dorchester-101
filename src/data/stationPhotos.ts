import type { CommonsCredit } from '@/components/sources/PhotoCredit';

export interface StationPhoto extends CommonsCredit {
  src: string;
  caption: string;
}

/** Location-identified photographs with per-file photographer and licence. */
export const STATION_PHOTOS: Record<string, StationPhoto> = {
  'place-fldcr': { src: '/img/hoods/fields-corner.jpg', caption: 'Inbound train arriving at Fields Corner, July 2021', commonsFile: 'Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg', author: 'Hutima', license: '4.0' },
  'place-asmnl': { src: '/img/hoods/ashmont.jpg', caption: 'Ashmont station from Peabody Square', commonsFile: 'Ashmont_station_from_Peabody_Square.jpg', author: 'Matthew in Boston', license: '2.0' },
  'place-DB-2249': { src: '/img/hoods/four-corners.jpg', caption: 'Four Corners/Geneva Ave station, looking inbound', commonsFile: 'Four_Corners_Geneva_Ave_station,_looking_inbound,_July_2013.JPG', author: 'Pi.1415926535', license: '3.0' },
  // shmnl is Savin Hill; smmnl is Shawmut. These are distinct MBTA stop IDs.
  'place-shmnl': { src: '/img/stations/savin-hill-platform-2012.jpg', caption: 'Savin Hill station platform, January 2012', commonsFile: 'Savin_Hill_station.JPG', author: 'Pi.1415926535', license: '3.0' },
  'place-smmnl': { src: '/img/stations/shawmut-headhouse-2016.jpg', caption: 'Shawmut station entrance, August 2016', commonsFile: 'Shawmut_station_headhouse_from_the_south,_August_2016.JPG', author: 'Pi.1415926535', license: '3.0' },
};
