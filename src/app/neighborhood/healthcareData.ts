import type { TranslationKey } from '@/i18n/en';

/** Source-linked identities. Hours, plans and interpreter availability vary;
 * translated guidance deliberately tells residents to contact each center. */
export const NEIGHBORHOOD_HEALTH_CENTERS: ReadonlyArray<{
  name: string;
  address: string;
  phone: string;
  website: string;
  servicesKey: TranslationKey;
}> = [
  {
    name: 'Codman Square Health Center',
    address: '637 Washington St, Dorchester, MA 02124',
    phone: '(617) 825-9660',
    website: 'https://www.codman.org/',
    servicesKey: 'neighborhood.healthCodmanServices',
  },
  {
    name: 'DotHouse Health',
    address: '1353 Dorchester Ave, Dorchester, MA 02122',
    phone: '(617) 288-3230',
    website: 'https://www.dothousehealth.org/',
    servicesKey: 'neighborhood.healthDotHouseServices',
  },
];

/** Sync marker, not a substitute for expert or native-speaker review. */
export const HEALTHCARE_SOURCE_DIGEST = '2aec0ea547b6aa29ce81cfc385763ffd3b3d50937f1a779576a51f5a6901a7a3';
