/** AI-assisted first drafts. Keep eligibility, dates and contact information in sync with winterClothing.ts. */
/** Review the translated records and update this digest whenever the source data changes. */
export const CLOTHING_SPANISH_SOURCE_DIGEST = '0e89108d64d783d3f2cedb222582eee32b52edd77e3dc07fb3326256a3e9fffc';
export interface ClothingSpanishDetails {
  summary: string;
  howToGet: string;
  eligibility?: string;
  hoursNote?: string;
  transit?: string;
  neighborhood?: string;
  address?: string;
  name?: string;
}

export const CLOTHING_SPANISH: Record<string, ClothingSpanishDetails> = {
  'abcd-dorchester-nsc': {
    neighborhood: "Franklin, Dorchester",
    summary: 'Un punto de partida local en Dorchester: el centro de ABCD ofrece ropa y artículos esenciales y colabora con Cradles to Crayons para pedir paquetes gratuitos de ropa de invierno para niños de hasta 12 años.',
    howToGet: "Llame al (617) 288-2700 y pregunte por ropa y artículos esenciales, inscripción, disponibilidad y cuándo acudir. Para niños de hasta 12 años, pregunte si el personal puede pedir artículos mediante Cradles to Crayons.",
    eligibility: "Cradles to Crayons incluye a este socio para residentes de Boston, Malden, Medford y Everett con ingresos iguales o inferiores al 200% del nivel federal de pobreza. Sus artículos infantiles suelen ser para edades de 0 a 12 años. Pregunte a ABCD sobre inscripción y documentos; las reglas de otros programas pueden ser distintas.",
    hoursNote: 'Horario del centro; al llamar, pregunte qué días funciona el programa de ropa.',
    transit: 'Línea Roja hasta Fields Corner y después a pie; consulte en MBTA las conexiones de autobús e indicaciones actuales.',
  },
  'cradles-to-crayons': {
    summary: 'Abrigos de invierno y paquetes completos de ropa gratis para niños desde el nacimiento hasta los 12 años. Las familias no pueden pedirlos directamente: un socio local hace el pedido y muchas organizaciones de Dorchester son socias.',
    howToGet: "Si ya recibe servicios de un socio de Cradles to Crayons, pregunte a su trabajador social si puede hacer un pedido para su hijo. De lo contrario, use el buscador de socios o llame a ABCD Dorchester al 617-288-2700 para preguntar si reúne los requisitos de sus servicios. Las familias no pueden hacer pedidos directamente ni recogerlos en Giving Factory.",
    eligibility: "Niños desde el nacimiento hasta los 12 años de familias con ingresos iguales o inferiores al 200% del nivel federal de pobreza; las familias deben estar recibiendo servicios de un socio. Los socios pueden tener requisitos adicionales.",
    hoursNote: "Las familias no pueden hacer pedidos directamente ni recoger artículos de asistencia en Giving Factory; cada oficina socia tiene su propio horario.",
    neighborhood: 'A través de socios de Dorchester',
    address: '281 Newtonville Ave, Newton, MA 02460 (Giving Factory; no es un lugar de atención directa a familias)',
  },
  'antons-coats-for-kids': {
    summary: 'Campaña de abrigos de invierno en Massachusetts: Anton’s limpia gratis los abrigos donados y estos se distribuyen gratuitamente a través de más de 100 escuelas, organizaciones sin fines de lucro y refugios. La colecta de esta temporada es del 5 de octubre de 2026 al 9 de enero de 2027.',
    howToGet: 'Los abrigos se entregan en escuelas y organizaciones socias, no en las tintorerías. Pregunte en la escuela de su hijo, su refugio u organización comunitaria si están distribuyendo esta temporada (Boston Uncornered en 222 Bowdoin St fue un punto de colecta en Dorchester; confirme para esta temporada). Para donar un abrigo, déjelo en cualquier Anton’s Cleaners durante la campaña.',
    neighborhood: 'A través de socios locales',
  },
  'st-francis-house': {
    summary: "Un refugio diurno en el centro con el programa de ropa Fresh Threads, comidas y otros servicios. Llame para confirmar la disponibilidad y cómo acceder a la ropa.",
    howToGet: "Llame al (617) 542-4211 o acuda a 39 Boylston Street y pregunte cómo acceder a Fresh Threads. El refugio diurno abre todos los días; el horario y la disponibilidad del programa de ropa pueden ser distintos.",
    hoursNote: "Se muestra el horario del refugio diurno; llame para consultar el horario y la disponibilidad del programa de ropa.",
    transit: 'Línea Verde hasta Boylston o Línea Naranja/Roja hasta Downtown Crossing.',
    neighborhood: 'Centro (Chinatown)',
  },
  'womens-lunch-place': {
    neighborhood: "Back Bay",
    summary: 'Refugio diurno y centro de apoyo solo para mujeres en Back Bay, con ropa gratuita —incluidos abrigos cuando hay existencias—, comidas, duchas y lavandería. Sin preguntas en la entrada.',
    howToGet: 'Acuda de lunes a sábado, de 7 a. m. a 2 p. m., y pregunte a cualquier miembro del personal por la ropa. Los abrigos dependen de las donaciones, así que pregunte temprano.',
    eligibility: "Mujeres, incluidas las personas que se identifican como mujeres. Pregunte al personal si se necesita documentación o una referencia.",
    transit: 'Línea Verde hasta Arlington o Copley.',
  },
  'rosies-place': {
    neighborhood: "South End",
    summary: "Un refugio para mujeres en South End. Las asesoras ofrecen referencias para conseguir ropa, además de comidas, duchas, lavandería y ayuda legal; no está confirmado que haya ropa en el lugar.",
    howToGet: "Pida a una asesora una referencia para ropa o llame al (617) 318-0237. La guía de otoño de 2026 indica atención presencial sin cita y por teléfono de lunes a viernes de 8:30 a. m. a 6 p. m. Confirme el horario y la disponibilidad antes de acudir.",
    eligibility: "Rosie’s Place atiende a mujeres. Pregunte al personal sobre los requisitos del servicio y si pueden acompañarla sus hijos para pedir una referencia de ropa.",
    hoursNote: "El horario de las asesoras puede ser distinto al del refugio diurno; llame para confirmar el horario actual de referencias.",
    transit: 'Línea Plateada hasta Melnea Cass Blvd; autobús 1 por Massachusetts Ave.',
  },
  'yawkey-basic-needs': {
    neighborhood: "Uphams Corner / Four Corners",
    name: 'Centro Yawkey — Necesidades básicas',
    summary: "El centro de Catholic Charities en Dorchester cuenta con un equipo de necesidades básicas y una despensa de alimentos. Llame para preguntar por ayuda o referencias para ropa; no se ha confirmado la disponibilidad actual de abrigos.",
    howToGet: "Llame al (617) 506-6600 y pregunte al equipo de necesidades básicas si ofrece ayuda o referencias para ropa antes de viajar. La despensa de alimentos funciona en la misma dirección; llame para confirmar su horario.",
    hoursNote: "Llame para consultar el horario de necesidades básicas y la ayuda con ropa; no está confirmado que sea un lugar de distribución de abrigos.",
    transit: 'El autobús 16 de MBTA para en 185 Columbia Road; consulte las indicaciones actuales antes de viajar.',
  },
  'kroc-center': {
    neighborhood: "Uphams Corner",
    name: 'Kroc Center — Servicios sociales',
    summary: 'La oficina de servicios sociales de Kroc Center en Uphams Corner brinda asistencia de emergencia para sus códigos postales de Dorchester y realiza distribuciones de temporada; pregunte qué ropa y eventos de abrigos están disponibles.',
    howToGet: "Llame a Servicios Sociales al (617) 318-6940 para preguntar por la ayuda actual con abrigos durante las fiestas, la inscripción y la disponibilidad. La asistencia de emergencia cubre los códigos postales 02121, 02125 y 02127; fuera de ellos, llame al (617) 542-5420.",
    eligibility: "La asistencia de emergencia cubre 02121, 02125 y 02127. El centro indica que la ayuda para las fiestas exige cumplir requisitos e inscribirse previamente; pregunte por los plazos y la disponibilidad de abrigos.",
    hoursNote: 'No se publica un horario de Servicios Sociales para ropa; llame primero.',
    transit: 'Línea Fairmount hasta Uphams Corner; los autobuses 15, 17 y 41 paran cerca.',
  },
  'coats4vets': {
    summary: "Coats4Vets describe abrigos gratuitos para veteranos. Llame para confirmar la disponibilidad actual y las opciones en el área de Boston; el centro de la fundación en Sandwich está en Cape Cod.",
    howToGet: "Llame al (617) 378-3974 y pregunte por la disponibilidad actual de abrigos y los eventos en el área de Boston antes de viajar. La página de Coats4Vets describe un programa de 2023; confirme las inscripciones y ubicaciones actuales. El centro Empowerment de la fundación en Sandwich está en 117 Route 6A.",
    eligibility: "Pregunte por los requisitos de los eventos actuales de abrigos. La fundación indica que para visitar sus centros Empowerment se requieren cita y prueba de servicio; las reglas de otros eventos pueden ser distintas.",
    neighborhood: "Los eventos varían; centro en Sandwich, Cape Cod",
  },
  'mass-211': {
    summary: 'La línea estatal de ayuda gratuita y confidencial atiende las 24 horas en muchos idiomas. Sus especialistas buscan programas de ropa, campañas de abrigos y centros para entrar en calor cerca de su código postal.',
    howToGet: 'Marque 2-1-1 (o 877-211-6277; TTY 508-370-4890) y pida «abrigos o ropa de invierno gratis cerca de mí». Pida al especialista que compruebe qué lugares tienen hoy su talla y si hay un centro para entrar en calor abierto durante una emergencia por frío.',
    neighborhood: 'Por teléfono, en todo el estado',
  },
  'one-warm-coat': {
    name: 'One Warm Coat — Buscador de organizaciones',
    summary: "Mapa nacional de organizaciones locales asociadas que reciben y distribuyen abrigos gratis. Busque por código postal y llame para preguntar por la disponibilidad; aparecer en el mapa no garantiza existencias.",
    howToGet: 'Abra el buscador, escriba su código postal (02121, 02122, 02124, 02125) y llame a la organización indicada antes de ir: One Warm Coat no entrega abrigos directamente a personas y las existencias de los socios cambian a diario.',
    neighborhood: 'Buscador en línea',
  },
  'findhelp-clothing': {
    name: 'findhelp — Búsqueda de ropa en Dorchester',
    summary: 'Directorio actualizado de ayuda gratuita o a costo reducido. Su búsqueda de ropa en Dorchester reúne roperos de iglesias, programas benéficos y campañas escolares demasiado pequeños o nuevos para aparecer en listas impresas.',
    howToGet: 'Busque «clothing» en findhelp.org con un código postal de Dorchester y llame al programa antes de viajar: los roperos pequeños tienen horarios irregulares.',
    neighborhood: 'Buscador en línea',
  },
  'boston-cold': {
    name: 'Página de clima frío de la Ciudad de Boston',
    summary: "Cuando Boston declara una emergencia por frío (sensación térmica de -10°F o menos durante al menos un día; aviso a 0°F), abren centros para entrar en calor en centros comunitarios BCYF y bibliotecas durante su horario normal. La ciudad publica la lista actual en esta página. Si ve a una persona sin refugio al aire libre con frío extremo, llame al 911.",
    howToGet: 'Abra boston.gov/cold para consultar la lista de centros para entrar en calor y las reglas de seguridad actuales, incluido el código estatal de calefacción (68 °F de día y 64 °F de noche, normalmente del 15 de septiembre al 31 de mayo; las fechas locales pueden variar) si su apartamento está frío y el propietario no actúa.',
    neighborhood: 'En toda la ciudad (centros BCYF y bibliotecas)',
  },
};
