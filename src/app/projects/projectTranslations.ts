/**
 * First-pass project translations. Numbers, stages, dates and application
 * conditions mirror projectsData.ts and need native-speaker review.
 */
import { HAITIAN_PROJECTS } from './projectTranslations.ht';
import { PORTUGUESE_PROJECTS } from './projectTranslations.pt';
import { VIETNAMESE_PROJECTS } from './projectTranslations.vi';
import { CHINESE_PROJECTS } from './projectTranslations.zh';
import { ARABIC_PROJECTS } from './projectTranslations.ar';
import { SOMALI_PROJECTS } from './projectTranslations.so';
import { KABUVERDIANU_PROJECTS } from './projectTranslations.kea';
import type { LanguageCode } from '@/i18n/config';
export interface ProjectTranslation {
  description: string;
  developer?: string;
  parcelNote: string;
  unitMix: string;
  amenities: string[];
  communityBenefits: string;
  howToApply: string;
  renderingNote: string;
}

export const SPANISH_PROJECTS: Record<number, ProjectTranslation> = {
  1: {
    description: 'Desarrollo de uso mixto de cuatro acres cerca de la estación Savin Hill: 488 viviendas al completarse; la primera fase está abierta desde 2023 y el edificio Hancock, con 84 viviendas asequibles, avanza hacia la construcción.',
    parcelNote: 'Terrenos de concesionarios de autos y almacenes entre Dorchester Avenue, Hancock Street, Pleasant Street y Greenmount Street, cerca de la estación Savin Hill.',
    unitMix: 'La primera fase abrió en el verano de 2023 con 245 apartamentos, 33 de ellos con límite de ingresos al 50% y 70% de AMI (el promotor no publica esa distribución). La segunda fase, el edificio Hancock, que comenzará en Hancock Street, tiene 84 viviendas, todas con límite de ingresos: 17 al 30% de AMI, unas nueve reservadas para hogares en riesgo de quedarse sin vivienda; 17 al 50%; y 50 al 60%. Las insignias de abajo muestran la distribución del edificio Hancock, la única cifra por nivel que publica el promotor.',
    amenities: ['Locales comerciales en planta baja a lo largo de Dorchester Avenue', 'Seis viviendas con límite de ingresos accesibles según la ADA en la primera fase', 'Estacionamiento para bicicletas y terrazas en la azotea'],
    communityBenefits: 'Según el programa piloto de la Política de Preservación de la Diversidad de los Vecindarios de la Ciudad, la mitad de las viviendas con límite de ingresos de la primera fase se ofrecen primero a hogares con carga de alquiler que ya viven a menos de tres cuartos de milla. La Ciudad otorgó $5 millones a la segunda fase en enero de 2025 y el estado agregó créditos fiscales y subsidios en febrero de 2026 para iniciar el edificio Hancock.',
    howToApply: "Para los apartamentos de Dot Block que anuncia, ACRES (antes la división de corretaje de Maloney Properties) indica que las solicitudes se tramitan por orden de llegada, no mediante sorteo. El 31 de octubre de 2026 no anunciaba vacantes e indicaba que, cuando no hay viviendas disponibles, las solicitudes se agregan a una lista de espera. Confirme el estado y las instrucciones actuales con ACRES.",
    renderingNote: 'Las imágenes y los planos aprobados están en el expediente del proyecto del Departamento de Planificación.',
  },
  2: {
    developer: 'Preservation of Affordable Housing (POAH) con Dorchester Bay EDC',
    description: 'Apartamentos completamente asequibles y espacio artístico en el terreno del histórico Dorchester Savings Bank Hall.',
    parcelNote: 'El estacionamiento detrás del antiguo Dorchester Savings Bank Hall en 568–574 Columbia Road, en el distrito artístico de Uphams Corner.',
    unitMix: '48 apartamentos con límite de ingresos, desde estudios hasta tres dormitorios, para hogares que ganan entre el 30% y el 80% de AMI, más 3,500 pies cuadrados de espacio comercial.',
    amenities: ['Reutilización del salón bancario de la década de 1890 como espacio de exposiciones', 'Alquiler comercial por debajo del mercado para una organización artística', 'Ubicación orientada al transporte en la Fairmount Line'],
    communityBenefits: 'El salón bancario se restaura en vez de demolerse y se alquila a precio asequible a una organización artística sin fines de lucro; la vivienda abarca desde un nivel de asequibilidad profunda (30% de AMI) hasta el 80% de AMI.',
    howToApply: "POAH y Dorchester Bay EDC iniciaron las obras en junio de 2026. Aquí no se han confirmado las fechas de solicitud ni el estado de la lista de espera. Consulte a los promotores y revise Metrolist para conocer novedades.",
    renderingNote: 'POAH y DBEDC publicaron la imagen y los materiales de la solicitud de propuestas impulsada por la comunidad.',
  },
  3: {
    description: 'Dos pequeños edificios completamente asequibles que se terminan en 2026 y sustituyen terrenos vacíos por apartamentos familiares.',
    parcelNote: 'Dos terrenos que estaban vacíos en la zona de Codman Square / Four Corners: 151 Spencer Street y 25 New England Avenue.',
    unitMix: '42 apartamentos familiares con límite de ingresos entre los dos edificios: 19 en Spencer Street y 23 en New England Avenue.',
    amenities: ['Unidades de tamaño familiar', 'Servicios para residentes por CSNDC', 'Caminata corta hasta Talbot Avenue (Fairmount Line)'],
    communityBenefits: 'Nuevas viviendas familiares en terrenos vacíos, con servicios de CSNDC para inquilinos en el lugar.',
    howToApply: "CSNDC informó de un sorteo en febrero de 2026. Housing Navigator mostraba una lista de espera abierta el 31 de octubre de 2026. El estado puede cambiar; confirme la disponibilidad y cómo solicitar con WinnResidential al (617) 287-9580.",
    renderingNote: 'Los planos y fotos del avance se publican en las actualizaciones inmobiliarias de CSNDC.',
  },
  4: {
    description: 'Edificio de cuatro pisos completamente asequible en el terreno del taller de carrocería junto a la estación Shawmut de la Línea Roja.',
    parcelNote: 'El terreno del taller de carrocería Fitzpatrick Bros. y el estacionamiento contiguo, inmediatamente al lado de la estación Shawmut de la Línea Roja.',
    unitMix: '72 apartamentos con límite de ingresos, desde estudios hasta tres dormitorios, distribuidos entre los niveles de 30%, 50%, 60%, 80% y 120% de AMI.',
    amenities: ['Edificio totalmente eléctrico con energía solar en la azotea', 'Diseño Passive House', 'Estación Bluebikes en el lugar', '25 espacios de estacionamiento en el sótano'],
    communityBenefits: 'El cien por ciento tiene límite de ingresos, incluidas cuatro viviendas de dos o tres dormitorios; mejoras del espacio público y para bicicletas en la estación.',
    howToApply: "Trinity Financial prevé iniciar las obras en 2026 y terminarlas en 2028. Las fechas y el estado de las solicitudes pueden cambiar; consulte al promotor y Metrolist en vez de suponer que las solicitudes están abiertas o cerradas.",
    renderingNote: 'La imagen y los planos están en la página del proyecto del Departamento de Planificación y en la página del proyecto de Trinity.',
  },
};


/**
 * Digest of projectsData.ts. When the source changes, review every translated
 * record and update this digest; ID parity alone cannot catch stale eligibility
 * or schedule details.
 */
export const PROJECT_SOURCE_DIGEST = '4cb9d3d6284e88cdf332d93871fe568c587dd204c53fcd3e61c4d96fe87dfcc7';

/** Every supported non-English locale must cover every published project. */
export const PROJECT_TRANSLATIONS: Record<Exclude<LanguageCode, 'en'>, Record<number, ProjectTranslation>> = {
  es: SPANISH_PROJECTS,
  ht: HAITIAN_PROJECTS,
  pt: PORTUGUESE_PROJECTS,
  vi: VIETNAMESE_PROJECTS,
  zh: CHINESE_PROJECTS,
  ar: ARABIC_PROJECTS,
  so: SOMALI_PROJECTS,
  kea: KABUVERDIANU_PROJECTS,
};
