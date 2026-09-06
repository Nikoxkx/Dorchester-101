/**
 * Station photographs that ship with the site. All Wikimedia Commons; the
 * caption in the UI links to the Commons file page for author and licence.
 * Stops without an entry get a live aerial view instead, and the sheet says so.
 */
export const STATION_PHOTOS: Record<string, { src: string; caption: string; commonsFile: string }> = {
  'place-fldcr': { src: '/img/hoods/fields-corner.jpg', caption: 'Inbound train arriving at Fields Corner, July 2021', commonsFile: 'Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg' },
  'place-asmnl': { src: '/img/hoods/ashmont.jpg', caption: 'Ashmont station from Peabody Square', commonsFile: 'Ashmont_station_from_Peabody_Square.jpg' },
  'place-fcnrs': { src: '/img/hoods/four-corners.jpg', caption: 'Four Corners/Geneva Ave station, looking inbound', commonsFile: 'Four_Corners_Geneva_Ave_station,_looking_inbound,_July_2013.JPG' },
  'place-shmnl': { src: '/img/hoods/savin-hill.jpg', caption: 'Dorchester Bay from Savin Hill', commonsFile: 'Dorchester_Bay_from_Savin_Hill.jpg' },
};
