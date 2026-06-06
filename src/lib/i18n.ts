'use client';

// Complete translation system — every string in the application
// Key convention: section.subsection.key

type Dict = Record<string, string>;

function buildTranslations(): Record<string, Dict> {
  const en: Dict = {
    // ── Navigation ──────────────────────────────────────
    'nav.dashboard':       'Dashboard',
    'nav.projects':        'Housing Projects',
    'nav.affordable':      'Affordable Housing',
    'nav.market':          'Market Trends',
    'nav.map':             'Map',
    'nav.food':            'Food Resources',
    'nav.neighborhood':    'Neighborhood',
    'nav.tools':           'Financial Tools',
    'nav.news':            'News',
    'nav.resources':       'Resources',
    'nav.faq':             'FAQ',
    'nav.settings':        'Settings',
    'nav.collapse':        'Collapse',
    'nav.expand':          'Expand',

    // ── Theme ───────────────────────────────────────────
    'theme.light':         'Light Mode',
    'theme.dark':          'Dark Mode',
    'theme.system':        'System Mode',

    // ── Introduction ────────────────────────────────────
    'intro.title':         'Welcome to DOR101',
    'intro.subtitle':      'Your Dorchester Community Resource Hub',
    'intro.body':          'DOR101 is a free, open resource built for Dorchester residents — especially families and individuals who need clear, honest information about housing, food assistance, healthcare, legal help, and community services. Every phone number, address, and data point is verified. We never ask for personal information and we never charge a fee. This app exists because everyone deserves the same quality of information that wealthier communities take for granted.',
    'intro.cta':           'Explore Resources',

    // ── Dashboard ───────────────────────────────────────
    'dashboard.greeting.morning':   'Good morning',
    'dashboard.greeting.afternoon': 'Good afternoon',
    'dashboard.greeting.evening':   'Good evening',
    'dashboard.welcome':            'welcome to DOR101',
    'dashboard.tagline':            'Your neighborhood. Your rights. Your future.',
    'dashboard.glance':             'Dorchester at a Glance',
    'dashboard.quickAccess':        'Quick Access',
    'dashboard.latestNews':         'Latest News',
    'dashboard.viewAll':            'View All',
    'dashboard.spotlight':          'Spotlight',
    'dashboard.mapTitle':           'Dorchester Resources Map',
    'dashboard.viewFullMap':        'View Full Map',
    'dashboard.footer.line1':       'DOR101 — Dorchester 101 · Free. Open. For the community.',
    'dashboard.footer.line2':       'Data sourced from Boston.gov, BPDA, BHA, HUD, MBTA, and verified community organizations.',
    'dashboard.footer.verified':    'Last verified: June 5, 2026',

    // ── Stats ───────────────────────────────────────────
    'stats.medianRent':        'Median 2BR Rent',
    'stats.incomeRestricted':  'Income-Restricted Units',
    'stats.activeProjects':    'Active BPDA Projects',
    'stats.openWaitlists':     'Open Waitlists',
    'stats.foodSites':         'Food Sites Open This Week',
    'stats.medianSale':        'Median Home Sale Price',

    // ── Quick Links ─────────────────────────────────────
    'quick.applyHousing':    'Apply for Housing',
    'quick.findFood':        'Find Food',
    'quick.knowRights':      'Know Your Rights',
    'quick.mbtaStatus':      'MBTA Status',
    'quick.rentCalc':        'Rent Calculator',
    'quick.bhaWaitlist':     'BHA Waitlist',
    'quick.legalHelp':       'Free Legal Help',
    'quick.langSettings':    'Language Settings',

    // ── Emergency ───────────────────────────────────────
    'emergency.title':       'Need Food or Housing Help Right Now?',
    'emergency.body':        'Call these free hotlines. They speak your language and can connect you with immediate assistance.',
    'emergency.foodLabel':   'Food',
    'emergency.allLabel':    'All Services',

    // ── Common ──────────────────────────────────────────
    'common.loading':        'Loading…',
    'common.error':          'Error',
    'common.retry':          'Retry',
    'common.search':         'Search housing, food, resources…',
    'common.filter':         'Filter',
    'common.viewDetails':    'View Details',
    'common.learnMore':      'Learn More',
    'common.apply':          'Apply',
    'common.applyNow':       'Apply Now',
    'common.call':           'Call',
    'common.website':        'Website',
    'common.updated':        'Updated',
    'common.source':         'Source',
    'common.free':           'FREE',
    'common.open':           'Open',
    'common.closed':         'Closed',
    'common.directions':     'Directions',
    'common.moreInfo':       'More Info',
    'common.close':          'Close',
    'common.ongoing':        'Ongoing',

    // ── Map ─────────────────────────────────────────────
    'map.title':             'Dorchester Resources Map',
    'map.subtitle':          'Satellite view · Live MBTA transit · Community resources',
    'map.layers':            'Map Layers',
    'map.transitRoutes':     'Transit Routes',
    'map.housing':           'Housing',
    'map.food':              'Food',
    'map.transit':           'Transit',
    'map.health':            'Health',
    'map.legal':             'Legal',
    'map.community':         'Community',
    'map.housingDesc':       'Affordable housing & organizations',
    'map.foodDesc':          'Food pantries & meal programs',
    'map.transitDesc':       'MBTA Red Line, Fairmount, Bus',
    'map.healthDesc':        'Health centers & clinics',
    'map.legalDesc':         'Legal aid organizations',
    'map.communityDesc':     'Community organizations',
    'map.locationsShown':    'locations shown',
    'map.of':                'of',
    'map.transitLines':      'Transit Lines',
    'map.redLine':           'Red Line — Ashmont Branch',
    'map.fairmount':         'Fairmount Commuter Rail',
    'map.departures':        'Upcoming Departures',
    'map.arriving':          'Arriving',
    'map.onTime':            'On time',
    'map.delayed':           'Delayed',
    'map.liveData':          'Live data · Updates every 30 s · Source: MBTA',
    'map.loadingPredictions':'Loading predictions…',
    'map.clickExplore':      'Click to explore full interactive map',
    'map.resourcesCount':    'community resources',

    // ── Notifications ───────────────────────────────────
    'notifications.title':     'Notifications',
    'notifications.markRead':  'Mark all read',
    'notifications.empty':     'No new notifications',
    'notifications.footer':    'Live updates from MBTA, City of Boston, and community sources',

    // ── Housing page ────────────────────────────────────
    'housing.title':          'Affordable Housing',
    'housing.description':    'Find income-restricted housing in Dorchester. These units have lower rents for people who qualify based on their income.',
    'housing.findHousing':    'Find Housing',
    'housing.howItWorks':     'How It Works',
    'housing.amiCalculator':  'AMI Calculator',
    'housing.needHelp':       'Need help finding housing?',
    'housing.callBHA':        'Call Boston Housing Authority:',

    // ── Food page ───────────────────────────────────────
    'food.title':             'Food Resources',
    'food.description':       'Find food pantries, hot meals, and assistance programs in Dorchester. All resources are free.',
    'food.needFoodToday':     'Need Food Today?',
    'food.callHotline':       "Call Project Bread's FoodSource Hotline — free, confidential, and available in your language.",
    'food.snapTitle':         'SNAP/EBT Benefits',

    // ── Projects page ───────────────────────────────────
    'projects.title':         'Housing Projects',
    'projects.description':   'BPDA-approved development projects in Dorchester. Track new housing from planning through completion.',
    'projects.totalProjects': 'Total Projects',
    'projects.totalUnits':    'Total Units',
    'projects.affordableUnits':'Affordable Units',
    'projects.underConstruction':'Under Construction',

    // ── Market page ─────────────────────────────────────
    'market.title':           'Market Trends',
    'market.description':     'Real-time housing market data for Dorchester (ZIP: 02121, 02122, 02124, 02125)',
    'market.currentSnapshot': 'Current Snapshot',
    'market.rentByType':      'Median Rent by Unit Type',
    'market.affordability':   'Affordability Analysis — What This Means for You',
    'market.dataSources':     'Data Sources & Methodology',

    // ── Neighborhood page ───────────────────────────────
    'neighborhood.title':     'Dorchester Guide',
    'neighborhood.description':'Everything you need to know about Boston\'s largest and most diverse neighborhood. Click any section to expand.',

    // ── Tools page ──────────────────────────────────────
    'tools.title':            'Financial Tools',
    'tools.description':      'Free calculators to help you understand your housing options and eligibility.',
    'tools.rentBurden':       'Rent Burden',
    'tools.amiCalc':          'AMI Calculator',
    'tools.documents':        'Document Checklist',

    // ── News page ───────────────────────────────────────
    'news.title':             'News & Updates',
    'news.description':       'Latest news affecting Dorchester housing, food access, and community services.',
    'news.liveUpdates':       'Live Updates',
    'news.autoRefresh':       'News refreshes automatically every 5 minutes',
    'news.latest':            'Latest (Last 24 Hours)',
    'news.allNews':           'All News',
    'news.sources':           'News Sources',
    'news.sourcesDesc':       'News is aggregated from verified local and regional sources:',

    // ── Resources page ──────────────────────────────────
    'resources.title':        'Resource Directory',
    'resources.description':  'Verified organizations and services for Dorchester residents. All contact information has been verified.',
    'resources.notSure':      'Not sure where to start?',
    'resources.call211':      'Call 2-1-1 anytime (24/7) for free, confidential help finding services.',

    // ── FAQ page ────────────────────────────────────────
    'faq.title':              'Frequently Asked Questions',
    'faq.description':        'Find answers to common questions about housing, food assistance, healthcare, and more.',
    'faq.searchPlaceholder':  'Search questions…',
    'faq.allTopics':          'All Topics',
    'faq.stillQuestions':     'Still have questions?',
    'faq.reachOut':           'We\'re here to help. Reach out to local resources for personalized assistance.',

    // ── Settings page ───────────────────────────────────
    'settings.title':         'Settings',
    'settings.description':   'Customize your DOR101 experience. Your preferences are saved locally.',
    'settings.language':      'Language',
    'settings.selectLang':    'Select your language',
    'settings.appearance':    'Appearance',
    'settings.theme':         'Theme',
    'settings.light':         'Light',
    'settings.dark':          'Dark',
    'settings.system':        'System',
    'settings.fontSize':      'Font Size',
    'settings.small':         'Small',
    'settings.medium':        'Medium',
    'settings.large':         'Large',
    'settings.extraLarge':    'X-Large',
    'settings.accessibility': 'Accessibility',
    'settings.reduceMotion':  'Reduce Motion',
    'settings.reduceMotionDesc':'Minimize animations and transitions',
    'settings.data':          'Data & Updates',
    'settings.lastUpdated':   'Last Updated',
    'settings.refreshNow':    'Refresh Now',
    'settings.privacy':       'Privacy',
    'settings.privacyTitle':  'Your Privacy is Protected',
    'settings.noDataCollected':'No personal data is collected or transmitted',
    'settings.localOnly':     'All settings are stored locally on your device',
    'settings.noTracking':    'No analytics, tracking, or advertising',
    'settings.noAccount':     'No account required',
    'settings.about':         'About DOR101',
    'settings.version':       'Version 1.0.0',
    'settings.aboutDesc':     'A free resource for Dorchester residents to access verified housing, food, and community service information. Built with care for the community.',
    'settings.viewSources':   'View Data Sources',
  };

  // ── Spanish ─────────────────────────────────────────────
  const es: Dict = {
    'nav.dashboard':'Inicio','nav.projects':'Proyectos de Vivienda','nav.affordable':'Vivienda Asequible','nav.market':'Tendencias del Mercado','nav.map':'Mapa','nav.food':'Recursos Alimentarios','nav.neighborhood':'Vecindario','nav.tools':'Herramientas Financieras','nav.news':'Noticias','nav.resources':'Recursos','nav.faq':'Preguntas Frecuentes','nav.settings':'Configuración','nav.collapse':'Colapsar','nav.expand':'Expandir',
    'theme.light':'Modo Claro','theme.dark':'Modo Oscuro','theme.system':'Modo Sistema',
    'intro.title':'Bienvenido a DOR101','intro.subtitle':'Su Centro de Recursos Comunitarios de Dorchester','intro.body':'DOR101 es un recurso gratuito y abierto para los residentes de Dorchester, especialmente familias e individuos que necesitan información clara y honesta sobre vivienda, asistencia alimentaria, atención médica, ayuda legal y servicios comunitarios. Cada número de teléfono, dirección y dato ha sido verificado. Nunca pedimos información personal y nunca cobramos. Esta aplicación existe porque todos merecen la misma calidad de información.','intro.cta':'Explorar Recursos',
    'dashboard.greeting.morning':'Buenos días','dashboard.greeting.afternoon':'Buenas tardes','dashboard.greeting.evening':'Buenas noches','dashboard.welcome':'bienvenido a DOR101','dashboard.tagline':'Tu vecindario. Tus derechos. Tu futuro.','dashboard.glance':'Dorchester de un Vistazo','dashboard.quickAccess':'Acceso Rápido','dashboard.latestNews':'Últimas Noticias','dashboard.viewAll':'Ver Todo','dashboard.spotlight':'Destacado','dashboard.mapTitle':'Mapa de Recursos de Dorchester','dashboard.viewFullMap':'Ver Mapa Completo','dashboard.footer.line1':'DOR101 — Dorchester 101 · Gratis. Abierto. Para la comunidad.','dashboard.footer.line2':'Datos de Boston.gov, BPDA, BHA, HUD, MBTA y organizaciones comunitarias verificadas.','dashboard.footer.verified':'Última verificación: 5 de junio de 2026',
    'stats.medianRent':'Alquiler Medio 2 Hab','stats.incomeRestricted':'Unidades con Restricción de Ingresos','stats.activeProjects':'Proyectos BPDA Activos','stats.openWaitlists':'Listas de Espera Abiertas','stats.foodSites':'Sitios de Comida Esta Semana','stats.medianSale':'Precio de Venta Medio',
    'quick.applyHousing':'Solicitar Vivienda','quick.findFood':'Encontrar Comida','quick.knowRights':'Conozca Sus Derechos','quick.mbtaStatus':'Estado del MBTA','quick.rentCalc':'Calculadora de Alquiler','quick.bhaWaitlist':'Lista BHA','quick.legalHelp':'Ayuda Legal Gratis','quick.langSettings':'Idioma',
    'emergency.title':'¿Necesita Ayuda con Comida o Vivienda Ahora?','emergency.body':'Llame a estas líneas gratuitas. Hablan su idioma y pueden conectarlo con asistencia inmediata.','emergency.foodLabel':'Comida','emergency.allLabel':'Todos los Servicios',
    'common.loading':'Cargando…','common.error':'Error','common.retry':'Reintentar','common.search':'Buscar vivienda, comida, recursos…','common.filter':'Filtrar','common.viewDetails':'Ver Detalles','common.learnMore':'Más Información','common.apply':'Aplicar','common.applyNow':'Aplicar Ahora','common.call':'Llamar','common.website':'Sitio Web','common.updated':'Actualizado','common.source':'Fuente','common.free':'GRATIS','common.open':'Abierto','common.closed':'Cerrado','common.directions':'Direcciones','common.moreInfo':'Más Info','common.close':'Cerrar','common.ongoing':'En curso',
    'map.title':'Mapa de Recursos de Dorchester','map.subtitle':'Vista satelital · Tránsito MBTA en vivo · Recursos comunitarios','map.layers':'Capas del Mapa','map.transitRoutes':'Rutas de Tránsito','map.housing':'Vivienda','map.food':'Comida','map.transit':'Tránsito','map.health':'Salud','map.legal':'Legal','map.community':'Comunidad','map.housingDesc':'Vivienda asequible y organizaciones','map.foodDesc':'Despensas y programas de comida','map.transitDesc':'MBTA Línea Roja, Fairmount, Autobús','map.healthDesc':'Centros de salud y clínicas','map.legalDesc':'Organizaciones de ayuda legal','map.communityDesc':'Organizaciones comunitarias','map.locationsShown':'ubicaciones mostradas','map.of':'de','map.transitLines':'Líneas de Tránsito','map.redLine':'Línea Roja — Ramal Ashmont','map.fairmount':'Tren Fairmount','map.departures':'Próximas Salidas','map.arriving':'Llegando','map.onTime':'A tiempo','map.delayed':'Retrasado','map.liveData':'Datos en vivo · Se actualiza cada 30 s · Fuente: MBTA','map.loadingPredictions':'Cargando predicciones…','map.clickExplore':'Haga clic para explorar el mapa interactivo completo','map.resourcesCount':'recursos comunitarios',
    'notifications.title':'Notificaciones','notifications.markRead':'Marcar todo leído','notifications.empty':'No hay notificaciones nuevas','notifications.footer':'Actualizaciones en vivo de MBTA, Ciudad de Boston y fuentes comunitarias',
    'housing.title':'Vivienda Asequible','housing.description':'Encuentre viviendas con restricción de ingresos en Dorchester.','housing.findHousing':'Buscar Vivienda','housing.howItWorks':'Cómo Funciona','housing.amiCalculator':'Calculadora AMI','housing.needHelp':'¿Necesita ayuda para encontrar vivienda?','housing.callBHA':'Llame a la Autoridad de Vivienda de Boston:',
    'food.title':'Recursos Alimentarios','food.description':'Encuentre despensas, comidas calientes y programas de asistencia en Dorchester. Todos los recursos son gratuitos.','food.needFoodToday':'¿Necesita Comida Hoy?','food.callHotline':'Llame a la Línea FoodSource de Project Bread — gratuita, confidencial y disponible en su idioma.','food.snapTitle':'Beneficios SNAP/EBT',
    'projects.title':'Proyectos de Vivienda','projects.description':'Proyectos de desarrollo aprobados por BPDA en Dorchester.','projects.totalProjects':'Proyectos Totales','projects.totalUnits':'Unidades Totales','projects.affordableUnits':'Unidades Asequibles','projects.underConstruction':'En Construcción',
    'market.title':'Tendencias del Mercado','market.description':'Datos del mercado inmobiliario en tiempo real para Dorchester','market.currentSnapshot':'Panorama Actual','market.rentByType':'Alquiler Medio por Tipo','market.affordability':'Análisis de Asequibilidad','market.dataSources':'Fuentes de Datos',
    'neighborhood.title':'Guía de Dorchester','neighborhood.description':'Todo lo que necesita saber sobre el vecindario más grande y diverso de Boston.',
    'tools.title':'Herramientas Financieras','tools.description':'Calculadoras gratuitas para entender sus opciones de vivienda.','tools.rentBurden':'Carga de Alquiler','tools.amiCalc':'Calculadora AMI','tools.documents':'Lista de Documentos',
    'news.title':'Noticias y Actualizaciones','news.description':'Últimas noticias que afectan la vivienda, el acceso a alimentos y los servicios comunitarios.','news.liveUpdates':'Actualizaciones en Vivo','news.autoRefresh':'Las noticias se actualizan automáticamente cada 5 minutos','news.latest':'Últimas (Últimas 24 Horas)','news.allNews':'Todas las Noticias','news.sources':'Fuentes de Noticias','news.sourcesDesc':'Noticias agregadas de fuentes locales y regionales verificadas:',
    'resources.title':'Directorio de Recursos','resources.description':'Organizaciones y servicios verificados para residentes de Dorchester.','resources.notSure':'¿No sabe por dónde empezar?','resources.call211':'Llame al 2-1-1 en cualquier momento (24/7) para ayuda gratuita y confidencial.',
    'faq.title':'Preguntas Frecuentes','faq.description':'Encuentre respuestas a preguntas comunes sobre vivienda, asistencia alimentaria y más.','faq.searchPlaceholder':'Buscar preguntas…','faq.allTopics':'Todos los Temas','faq.stillQuestions':'¿Todavía tiene preguntas?','faq.reachOut':'Estamos aquí para ayudar.',
    'settings.title':'Configuración','settings.description':'Personalice su experiencia DOR101.','settings.language':'Idioma','settings.selectLang':'Seleccione su idioma','settings.appearance':'Apariencia','settings.theme':'Tema','settings.light':'Claro','settings.dark':'Oscuro','settings.system':'Sistema','settings.fontSize':'Tamaño de Fuente','settings.small':'Pequeño','settings.medium':'Mediano','settings.large':'Grande','settings.extraLarge':'Extra Grande','settings.accessibility':'Accesibilidad','settings.reduceMotion':'Reducir Movimiento','settings.reduceMotionDesc':'Minimizar animaciones y transiciones','settings.data':'Datos y Actualizaciones','settings.lastUpdated':'Última Actualización','settings.refreshNow':'Actualizar Ahora','settings.privacy':'Privacidad','settings.privacyTitle':'Su Privacidad Está Protegida','settings.noDataCollected':'No se recopilan ni transmiten datos personales','settings.localOnly':'Todas las configuraciones se almacenan localmente','settings.noTracking':'Sin análisis, rastreo ni publicidad','settings.noAccount':'No se requiere cuenta','settings.about':'Acerca de DOR101','settings.version':'Versión 1.0.0','settings.aboutDesc':'Un recurso gratuito para residentes de Dorchester.','settings.viewSources':'Ver Fuentes de Datos',
  };

  // ── Haitian Creole ──────────────────────────────────────
  const ht: Dict = {
    'nav.dashboard':'Tablo','nav.projects':'Pwojè Kay','nav.affordable':'Kay Abòdab','nav.market':'Tandans Mache','nav.map':'Kat','nav.food':'Resous Manje','nav.neighborhood':'Katye','nav.tools':'Zouti Finansye','nav.news':'Nouvèl','nav.resources':'Resous','nav.faq':'Kesyon yo Poze Souvan','nav.settings':'Paramèt','nav.collapse':'Fèmen','nav.expand':'Louvri',
    'theme.light':'Mòd Klè','theme.dark':'Mòd Fènwa','theme.system':'Mòd Sistèm',
    'intro.title':'Byenveni nan DOR101','intro.subtitle':'Sant Resous Kominotè Dorchester ou','intro.body':'DOR101 se yon resous gratis ki fèt pou rezidan Dorchester — espesyalman fanmi ak moun ki bezwen enfòmasyon klè ak onèt sou lojman, asistans manje, swen sante, èd legal, ak sèvis kominotè. Chak nimewo telefòn, adrès, ak done verifye. Nou pa janm mande enfòmasyon pèsonèl epi nou pa janm chaje yon frè.','intro.cta':'Eksplore Resous',
    'dashboard.greeting.morning':'Bonjou','dashboard.greeting.afternoon':'Bonswa','dashboard.greeting.evening':'Bonswa','dashboard.welcome':'byenveni nan DOR101','dashboard.tagline':'Katye ou. Dwa ou. Avni ou.','dashboard.glance':'Dorchester nan yon Koudèy','dashboard.quickAccess':'Aksè Rapid','dashboard.latestNews':'Dènye Nouvèl','dashboard.viewAll':'Wè Tout','dashboard.spotlight':'Vedèt','dashboard.mapTitle':'Kat Resous Dorchester','dashboard.viewFullMap':'Wè Kat Konplè','dashboard.footer.line1':'DOR101 — Dorchester 101 · Gratis. Ouvè. Pou kominote a.','dashboard.footer.line2':'Done soti nan Boston.gov, BPDA, BHA, HUD, MBTA, ak òganizasyon kominotè verifye.','dashboard.footer.verified':'Dènye verifikasyon: 5 jen 2026',
    'stats.medianRent':'Lwaye Medyan 2 Chanm','stats.incomeRestricted':'Inite ak Restriksyon Revni','stats.activeProjects':'Pwojè BPDA Aktif','stats.openWaitlists':'Lis Datant Ouvè','stats.foodSites':'Sit Manje Ouvè Semèn sa a','stats.medianSale':'Pri Vann Medyan',
    'quick.applyHousing':'Aplike pou Lojman','quick.findFood':'Jwenn Manje','quick.knowRights':'Konnen Dwa Ou','quick.mbtaStatus':'Estati MBTA','quick.rentCalc':'Kalkilatè Lwaye','quick.bhaWaitlist':'Lis BHA','quick.legalHelp':'Èd Legal Gratis','quick.langSettings':'Lang',
    'emergency.title':'Bezwen Èd ak Manje oswa Lojman Kounye a?','emergency.body':'Rele liy gratis sa yo. Yo pale lang ou epi yo ka konekte ou ak asistans imedyat.','emergency.foodLabel':'Manje','emergency.allLabel':'Tout Sèvis',
    'common.loading':'Chajman…','common.search':'Chèche lojman, manje, resous…','common.updated':'Ajou','common.free':'GRATIS','common.open':'Ouvè','common.closed':'Fèmen','common.directions':'Direksyon','common.moreInfo':'Plis Enfò','common.close':'Fèmen','common.learnMore':'Aprann Plis','common.apply':'Aplike',
    'map.title':'Kat Resous Dorchester','map.layers':'Kouch Kat','map.transitRoutes':'Wout Transpò','map.housing':'Lojman','map.food':'Manje','map.transit':'Transpò','map.health':'Sante','map.legal':'Legal','map.community':'Kominote','map.locationsShown':'kote yo montre','map.departures':'Pwochen Depati','map.arriving':'Ap rive','map.onTime':'Alè','map.delayed':'An reta',
    'notifications.title':'Notifikasyon','notifications.markRead':'Make tout li','notifications.empty':'Pa gen nouvo notifikasyon',
    'settings.title':'Paramèt','settings.language':'Lang','settings.appearance':'Aparans','settings.theme':'Tèm','settings.light':'Klè','settings.dark':'Fènwa','settings.system':'Sistèm','settings.fontSize':'Gwosè Tèks','settings.small':'Piti','settings.medium':'Mwayen','settings.large':'Gwo','settings.extraLarge':'Ekstra Gwo','settings.accessibility':'Aksesibilite','settings.reduceMotion':'Redui Mouvman','settings.privacy':'Vi Prive','settings.about':'Apwopo DOR101',
  };

  // ── Portuguese ──────────────────────────────────────────
  const pt: Dict = {
    'nav.dashboard':'Painel','nav.projects':'Projetos Habitacionais','nav.affordable':'Habitação Acessível','nav.market':'Tendências do Mercado','nav.map':'Mapa','nav.food':'Recursos Alimentares','nav.neighborhood':'Bairro','nav.tools':'Ferramentas Financeiras','nav.news':'Notícias','nav.resources':'Recursos','nav.faq':'Perguntas Frequentes','nav.settings':'Configurações',
    'intro.title':'Bem-vindo ao DOR101','intro.subtitle':'Seu Centro de Recursos Comunitários de Dorchester','intro.body':'DOR101 é um recurso gratuito e aberto para os moradores de Dorchester — especialmente famílias e indivíduos que precisam de informações claras sobre moradia, assistência alimentar, saúde, ajuda jurídica e serviços comunitários. Cada telefone, endereço e dado é verificado. Nunca pedimos informações pessoais e nunca cobramos.','intro.cta':'Explorar Recursos',
    'dashboard.greeting.morning':'Bom dia','dashboard.greeting.afternoon':'Boa tarde','dashboard.greeting.evening':'Boa noite','dashboard.welcome':'bem-vindo ao DOR101','dashboard.tagline':'Seu bairro. Seus direitos. Seu futuro.','dashboard.glance':'Dorchester em um Relance','dashboard.quickAccess':'Acesso Rápido','dashboard.latestNews':'Últimas Notícias','dashboard.viewAll':'Ver Tudo','dashboard.spotlight':'Destaque','dashboard.mapTitle':'Mapa de Recursos de Dorchester','dashboard.viewFullMap':'Ver Mapa Completo',
    'common.loading':'Carregando…','common.search':'Buscar moradia, comida, recursos…','common.updated':'Atualizado','common.free':'GRÁTIS','common.learnMore':'Saiba Mais','common.apply':'Aplicar',
    'emergency.title':'Precisa de Ajuda com Comida ou Moradia Agora?','emergency.body':'Ligue para estas linhas gratuitas. Eles falam seu idioma.',
    'settings.title':'Configurações','settings.language':'Idioma','settings.theme':'Tema','settings.light':'Claro','settings.dark':'Escuro','settings.system':'Sistema',
  };

  // ── Vietnamese ──────────────────────────────────────────
  const vi: Dict = {
    'nav.dashboard':'Bảng điều khiển','nav.projects':'Dự án nhà ở','nav.affordable':'Nhà ở giá rẻ','nav.market':'Xu hướng thị trường','nav.map':'Bản đồ','nav.food':'Nguồn thực phẩm','nav.neighborhood':'Khu phố','nav.tools':'Công cụ tài chính','nav.news':'Tin tức','nav.resources':'Nguồn lực','nav.faq':'Câu hỏi thường gặp','nav.settings':'Cài đặt',
    'intro.title':'Chào mừng đến DOR101','intro.subtitle':'Trung tâm Tài nguyên Cộng đồng Dorchester','intro.body':'DOR101 là nguồn tài nguyên miễn phí dành cho cư dân Dorchester — đặc biệt các gia đình cần thông tin rõ ràng về nhà ở, hỗ trợ thực phẩm, chăm sóc sức khỏe, trợ giúp pháp lý và dịch vụ cộng đồng.','intro.cta':'Khám phá tài nguyên',
    'dashboard.greeting.morning':'Chào buổi sáng','dashboard.greeting.afternoon':'Chào buổi chiều','dashboard.greeting.evening':'Chào buổi tối','dashboard.welcome':'chào mừng đến DOR101','dashboard.tagline':'Khu phố của bạn. Quyền của bạn. Tương lai của bạn.','dashboard.glance':'Dorchester Tổng quan','dashboard.quickAccess':'Truy cập nhanh','dashboard.latestNews':'Tin mới nhất','dashboard.viewAll':'Xem tất cả','dashboard.spotlight':'Điểm nhấn','dashboard.mapTitle':'Bản đồ Tài nguyên Dorchester','dashboard.viewFullMap':'Xem bản đồ đầy đủ',
    'common.loading':'Đang tải…','common.search':'Tìm nhà ở, thực phẩm, nguồn lực…','common.updated':'Đã cập nhật','common.free':'MIỄN PHÍ','common.learnMore':'Tìm hiểu thêm','common.apply':'Đăng ký',
    'emergency.title':'Cần Trợ giúp Thực phẩm hoặc Nhà ở Ngay?','emergency.body':'Gọi các đường dây nóng miễn phí này. Họ nói ngôn ngữ của bạn.',
    'settings.title':'Cài đặt','settings.language':'Ngôn ngữ','settings.theme':'Chủ đề','settings.light':'Sáng','settings.dark':'Tối','settings.system':'Hệ thống',
  };

  // ── Chinese ─────────────────────────────────────────────
  const zh: Dict = {
    'nav.dashboard':'仪表板','nav.projects':'住房项目','nav.affordable':'经济适用房','nav.market':'市场趋势','nav.map':'地图','nav.food':'食物资源','nav.neighborhood':'社区','nav.tools':'财务工具','nav.news':'新闻','nav.resources':'资源','nav.faq':'常见问题','nav.settings':'设置',
    'intro.title':'欢迎来到 DOR101','intro.subtitle':'您的多切斯特社区资源中心','intro.body':'DOR101 是为多切斯特居民打造的免费开放资源，特别是需要有关住房、食品援助、医疗、法律帮助和社区服务的清晰信息的家庭和个人。每个电话号码、地址和数据都经过验证。我们从不索取个人信息，也从不收费。','intro.cta':'探索资源',
    'dashboard.greeting.morning':'早上好','dashboard.greeting.afternoon':'下午好','dashboard.greeting.evening':'晚上好','dashboard.welcome':'欢迎来到 DOR101','dashboard.tagline':'您的社区。您的权利。您的未来。','dashboard.glance':'多切斯特一览','dashboard.quickAccess':'快速访问','dashboard.latestNews':'最新新闻','dashboard.viewAll':'查看全部','dashboard.spotlight':'焦点','dashboard.mapTitle':'多切斯特资源地图','dashboard.viewFullMap':'查看完整地图',
    'common.loading':'加载中…','common.search':'搜索住房、食品、资源…','common.updated':'已更新','common.free':'免费','common.learnMore':'了解更多','common.apply':'申请',
    'emergency.title':'现在需要食物或住房帮助？','emergency.body':'拨打这些免费热线。他们会说您的语言。',
    'settings.title':'设置','settings.language':'语言','settings.theme':'主题','settings.light':'浅色','settings.dark':'深色','settings.system':'系统',
  };

  // ── Arabic ──────────────────────────────────────────────
  const ar: Dict = {
    'nav.dashboard':'لوحة التحكم','nav.projects':'مشاريع الإسكان','nav.affordable':'الإسكان الميسر','nav.market':'اتجاهات السوق','nav.map':'الخريطة','nav.food':'موارد الغذاء','nav.neighborhood':'الحي','nav.tools':'الأدوات المالية','nav.news':'الأخبار','nav.resources':'الموارد','nav.faq':'الأسئلة الشائعة','nav.settings':'الإعدادات',
    'intro.title':'مرحباً بك في DOR101','intro.subtitle':'مركز موارد مجتمع دورتشستر','intro.body':'DOR101 هو مورد مجاني ومفتوح لسكان دورتشستر — خاصة العائلات والأفراد الذين يحتاجون إلى معلومات واضحة حول الإسكان والمساعدة الغذائية والرعاية الصحية والمساعدة القانونية وخدمات المجتمع.','intro.cta':'استكشف الموارد',
    'dashboard.greeting.morning':'صباح الخير','dashboard.greeting.afternoon':'مساء الخير','dashboard.greeting.evening':'مساء الخير','dashboard.welcome':'مرحباً بك في DOR101','dashboard.tagline':'حيّك. حقوقك. مستقبلك.','dashboard.glance':'دورتشستر في لمحة','dashboard.quickAccess':'وصول سريع','dashboard.latestNews':'آخر الأخبار','dashboard.viewAll':'عرض الكل','dashboard.spotlight':'تسليط الضوء','dashboard.mapTitle':'خريطة موارد دورتشستر','dashboard.viewFullMap':'عرض الخريطة الكاملة',
    'common.loading':'جار التحميل…','common.search':'بحث عن إسكان، غذاء، موارد…','common.updated':'محدّث','common.free':'مجاني','common.learnMore':'اعرف المزيد','common.apply':'تقديم',
    'emergency.title':'تحتاج مساعدة في الطعام أو السكن الآن؟','emergency.body':'اتصل بهذه الخطوط المجانية. يتحدثون لغتك.',
    'settings.title':'الإعدادات','settings.language':'اللغة','settings.theme':'المظهر','settings.light':'فاتح','settings.dark':'داكن','settings.system':'النظام',
  };

  // ── Somali ──────────────────────────────────────────────
  const so: Dict = {
    'nav.dashboard':'Dashboard','nav.projects':'Mashruucyada Guryaha','nav.affordable':'Guryo La awoodo','nav.market':'Qiimaha Suuqa','nav.map':'Khariidad','nav.food':'Ilaha Cuntada','nav.neighborhood':'Xaafadda','nav.tools':'Qalabka Maaliyadda','nav.news':'Wararka','nav.resources':'Kheyraadka','nav.faq':'Su\'aalaha','nav.settings':'Dejinta',
    'intro.title':'Ku soo dhawoow DOR101','intro.subtitle':'Xarunta Kheyraadka Bulshada Dorchester','intro.body':'DOR101 waa kheyraad bilaash ah oo furan oo loogu talagalay dadka degan Dorchester — gaar ahaan qoysaska iyo dadka u baahan macluumaad cad oo ku saabsan guraha, kaalmada cuntada, daryeelka caafimaadka, caawinta sharciga, iyo adeegyada bulshada.','intro.cta':'Baro Kheyraadka',
    'dashboard.greeting.morning':'Subax wanaagsan','dashboard.greeting.afternoon':'Galab wanaagsan','dashboard.greeting.evening':'Fiid wanaagsan','dashboard.welcome':'ku soo dhawoow DOR101','dashboard.tagline':'Xaafaddaada. Xuquuqdaada. Mustaqbalkaaga.','dashboard.glance':'Dorchester Isku Eeg','dashboard.quickAccess':'Gal Degdeg','dashboard.latestNews':'Wararka Ugu Dambeeyay','dashboard.viewAll':'Arag Dhammaan',
    'common.loading':'Waa la soo rarayaa…','common.search':'Raadi guryo, cunto, kheyraadka…','common.updated':'La cusbooneysiiyay','common.free':'BILAASH','common.learnMore':'Wax Badan Baro','common.apply':'Codso',
    'emergency.title':'Caawimo ma u Baahan Tahay Hadda?','emergency.body':'Wac khadadan bilaashka ah. Waxay ku hadlaan luqaddaada.',
    'settings.title':'Dejinta','settings.language':'Luqadda','settings.theme':'Muuqaalka','settings.light':'Ifaya','settings.dark':'Madow','settings.system':'Nidaamka',
  };

  // ── Cape Verdean Creole ─────────────────────────────────
  const kea: Dict = {
    'nav.dashboard':'Painel','nav.projects':'Projetu di Kaza','nav.affordable':'Kaza Baratu','nav.market':'Tendénsia di Merkadu','nav.map':'Mapa','nav.food':'Rekursu di Kumida','nav.neighborhood':'Vizinhansa','nav.tools':'Feramenta Finanseru','nav.news':'Notísia','nav.resources':'Rekursu','nav.faq':'Pergunta Frekuenti','nav.settings':'Konfigurasãu',
    'intro.title':'Ben-vindu pa DOR101','intro.subtitle':'Sentru di Rekursu Komunitáriu di Dorchester','intro.body':'DOR101 é un rekursu grátis i abertu pa moradoris di Dorchester — spesialmenti família i pesoa ki ta prisiza di informasãu klaru sobri moradia, ajuda alimentar, saúdi, ajuda legal i servisu komunitáriu.','intro.cta':'Eksplora Rekursu',
    'dashboard.greeting.morning':'Bon dia','dashboard.greeting.afternoon':'Bon tardi','dashboard.greeting.evening':'Bon noti','dashboard.welcome':'ben-vindu pa DOR101','dashboard.tagline':'Bo bairu. Bo diritu. Bo futuru.','dashboard.glance':'Dorchester di Relansa','dashboard.quickAccess':'Asesu Rápidu','dashboard.latestNews':'Últimu Notísia','dashboard.viewAll':'Odja Tudu',
    'common.loading':'Ta karega…','common.search':'Buska moradia, kumida, rekursu…','common.updated':'Atualizadu','common.free':'GRÁTIS','common.learnMore':'Sibi Mas','common.apply':'Aplika',
    'emergency.title':'Ta Prisiza Ajuda ku Kumida o Kaza Agora?','emergency.body':'Txoma es linha grátis. Es ta papia bo língua.',
    'settings.title':'Konfigurasãu','settings.language':'Língua','settings.theme':'Tema','settings.light':'Klaru','settings.dark':'Skuru','settings.system':'Sistema',
  };

  return { en, es, ht, pt, vi, zh, ar, so, kea };
}

export const translations = buildTranslations();

// Translation hook
export function useTranslation(language: string) {
  const dict = translations[language] || translations['en'];
  const fallback = translations['en'];

  const t = (key: string, fb?: string): string => {
    return dict[key] || fallback[key] || fb || key;
  };

  return { t };
}

// Language list
export const availableLanguages = [
  { code: 'en',  name: 'English',              nativeName: 'English',        flag: '🇺🇸' },
  { code: 'es',  name: 'Spanish',              nativeName: 'Español',        flag: '🇪🇸' },
  { code: 'ht',  name: 'Haitian Creole',       nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { code: 'pt',  name: 'Portuguese',           nativeName: 'Português',      flag: '🇧🇷' },
  { code: 'vi',  name: 'Vietnamese',           nativeName: 'Tiếng Việt',     flag: '🇻🇳' },
  { code: 'kea', name: 'Cape Verdean Creole',  nativeName: 'Kriolu',         flag: '🇨🇻' },
  { code: 'so',  name: 'Somali',               nativeName: 'Soomaali',       flag: '🇸🇴' },
  { code: 'zh',  name: 'Mandarin Chinese',     nativeName: '普通话',          flag: '🇨🇳' },
  { code: 'ar',  name: 'Arabic',               nativeName: 'العربية',         flag: '🇸🇦', rtl: true },
];
