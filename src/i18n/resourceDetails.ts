import type { ResourceRecord } from '@/data/resources';
import type { Language } from '@/stores/appStore';
import { FOOD_RESOURCE_DETAILS } from './resourceFoodDetails';
import { HELPLINE_RESOURCE_DETAILS } from './resourceHelplineDetails';
import { HOUSING_RESOURCE_DETAILS } from './resourceHousingDetails';
import { LIBRARY_RESOURCE_DETAILS } from './resourceLibraryDetails';
import { HEALTH_RESOURCE_DETAILS } from './resourceHealthDetails';
import { IMMIGRANT_RESOURCE_DETAILS } from './resourceImmigrantDetails';
import { LEGAL_RESOURCE_DETAILS } from './resourceLegalDetails';
import { EDUCATION_RESOURCE_DETAILS } from './resourceEducationDetails';
import { COMMUNITY_RESOURCE_DETAILS } from './resourceCommunityDetails';

/**
 * AI-assisted first drafts, not professional translations. Resource facts are
 * safety-sensitive: review with native speakers and the service operator. The
 * parity test ties each complete draft to its English fields so later source
 * edits require review rather than silently leaving stale instructions.
 */
export type DetailDraft = {
  neighborhood: string;
  address?: string;
  operator?: string;
  source?: string;
  hoursNote?: string;
  eligibility?: string;
  transit?: string;
  services: string[];
};
export const RESOURCE_DETAIL_DRAFTS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  ...FOOD_RESOURCE_DETAILS,
  ...HELPLINE_RESOURCE_DETAILS,
  ...HOUSING_RESOURCE_DETAILS,
  ...LIBRARY_RESOURCE_DETAILS,
  ...HEALTH_RESOURCE_DETAILS,
  ...IMMIGRANT_RESOURCE_DETAILS,
  ...LEGAL_RESOURCE_DETAILS,
  ...EDUCATION_RESOURCE_DETAILS,
  ...COMMUNITY_RESOURCE_DETAILS,
  bha: {
    es: {
      operator: "Ciudad de Boston",
      neighborhood: 'Downtown Crossing (oficina para toda la ciudad)',
      hoursNote: 'Centro de Servicios de Vivienda: lunes a viernes, de 9:00 a. m. a 4:30 p. m. La oficina principal está en obras; llame antes de ir.',
      eligibility: 'Cualquier persona puede solicitar vivienda pública familiar; se aplican requisitos de ingresos, estatus migratorio y otras normas. Las comunidades para personas mayores o con discapacidad tienen requisitos propios de edad o discapacidad. La BHA decide la elegibilidad.',
      transit: 'Línea Roja o Naranja a Downtown Crossing; Línea Naranja a Chinatown.',
      services: ['Vivienda pública (acepta solicitudes)', 'Vale de elección de vivienda de la Sección 8 (lista de espera cerrada hasta nuevo aviso)', "Vales basados en proyectos y Mod Rehab (generalmente Prioridad Uno; pregunte por excepciones)", 'Servicios para inquilinos'],
    },
    ht: {
      operator: "Vil Boston",
      neighborhood: 'Downtown Crossing (biwo pou tout vil la)',
      hoursNote: 'Sant Sèvis Lojman: lendi–vandredi, 9:00 a.m.–4:30 p.m. Y ap renove biwo prensipal la; rele anvan ou ale.',
      eligibility: 'Nenpòt moun ka aplike pou lojman piblik pou fanmi; gen règ sou revni, estati imigrasyon ak lòt kondisyon. Kominote pou granmoun aje oswa moun ki gen andikap gen règ apa sou laj oswa andikap. Se BHA ki deside kalifikasyon.',
      transit: 'Liy Wouj oswa Liy Oranj pou Downtown Crossing; Liy Oranj pou Chinatown.',
      services: ['Lojman piblik (ap resevwa aplikasyon)', 'Vouch chwa lojman Seksyon 8 (lis datant fèmen jiskaske yo anonse otreman)', "Vouch ki baze sou pwojè ak Mod Rehab (jeneralman Priyorite Youn; mande sou eksepsyon)", 'Sèvis pou lokatè'],
    },
    pt: {
      operator: "Cidade de Boston",
      neighborhood: 'Downtown Crossing (escritório para toda a cidade)',
      hoursNote: 'Centro de Serviços de Moradia: segunda a sexta, das 9h às 16h30. O escritório principal está em reforma; ligue antes de ir.',
      eligibility: 'Qualquer pessoa pode solicitar moradia pública para famílias; aplicam-se regras de renda, situação imigratória e outras condições. Comunidades para idosos ou pessoas com deficiência têm regras próprias de idade ou deficiência. A BHA decide a elegibilidade.',
      transit: 'Linha Vermelha ou Laranja até Downtown Crossing; Linha Laranja até Chinatown.',
      services: ['Moradia pública (aceita inscrições)', 'Voucher de escolha de moradia da Seção 8 (lista de espera fechada até novo aviso)', "Vouchers vinculados a projetos e Mod Rehab (geralmente Prioridade Um; pergunte sobre exceções)", 'Serviços para inquilinos'],
    },
    vi: {
      operator: "Thành phố Boston",
      neighborhood: 'Downtown Crossing (văn phòng phục vụ toàn thành phố)',
      hoursNote: 'Trung tâm Dịch vụ Nhà ở: thứ Hai–thứ Sáu, 9:00 sáng–4:30 chiều. Văn phòng chính đang sửa chữa; hãy gọi trước khi đến.',
      eligibility: 'Bất kỳ ai cũng có thể nộp đơn xin nhà ở công cho gia đình; các quy định về thu nhập, tình trạng nhập cư và điều kiện khác được áp dụng. Các khu dành cho người cao tuổi hoặc người khuyết tật có quy định riêng về tuổi hoặc tình trạng khuyết tật. BHA quyết định điều kiện hội đủ.',
      transit: 'Tuyến Đỏ hoặc Cam đến Downtown Crossing; Tuyến Cam đến Chinatown.',
      services: ['Nhà ở công (đang nhận đơn)', 'Phiếu lựa chọn nhà ở Section 8 (danh sách chờ đóng cho đến khi có thông báo mới)', "Phiếu gắn với dự án và Mod Rehab (thường cần Priority One; hỏi về ngoại lệ)", 'Dịch vụ cho người thuê'],
    },
    zh: {
      operator: "波士顿市政府",
      neighborhood: 'Downtown Crossing（全市服务办公室）',
      hoursNote: '住房服务中心：周一至周五，上午 9:00 至下午 4:30。主要办公室正在装修，前往前请先致电。',
      eligibility: '任何人都可申请家庭公共住房；但须符合收入、移民身份及其他规定。长者或残障人士社区另有年龄或残障条件。是否符合资格由 BHA 决定。',
      transit: '乘红线或橙线至 Downtown Crossing；乘橙线至 Chinatown。',
      services: ['公共住房（接受申请）', '第 8 节住房选择券（等候名单关闭，直至另行通知）', "项目绑定代金券及 Mod Rehab（通常要求 Priority One；请询问例外）", '租户服务'],
    },
    ar: {
      operator: "مدينة بوسطن",
      neighborhood: 'Downtown Crossing (مكتب يخدم المدينة بأكملها)',
      hoursNote: 'مركز خدمات الإسكان: من الاثنين إلى الجمعة، من 9:00 صباحاً إلى 4:30 مساءً. المكتب الرئيسي قيد التجديد؛ اتصل قبل الزيارة.',
      eligibility: 'يمكن لأي شخص التقدم للإسكان العام العائلي؛ وتُطبق قواعد الدخل وحالة الهجرة وغيرها من الشروط. للمجتمعات المخصصة لكبار السن أو الأشخاص ذوي الإعاقة قواعد منفصلة تتعلق بالعمر أو الإعاقة. تقرر BHA الأهلية.',
      transit: 'الخط الأحمر أو البرتقالي إلى Downtown Crossing؛ والخط البرتقالي إلى Chinatown.',
      services: ['الإسكان العام (يقبل الطلبات)', 'قسيمة اختيار السكن للقسم 8 (قائمة الانتظار مغلقة حتى إشعار آخر)', "القسائم المرتبطة بالمشاريع وMod Rehab (عادةً الأولوية الأولى؛ اسأل عن الاستثناءات)", 'خدمات المستأجرين'],
    },
    so: {
      operator: "Magaalada Boston",
      neighborhood: 'Downtown Crossing (xafiis u adeega magaalada oo dhan)',
      hoursNote: 'Xarunta Adeegga Guryaha: Isniin–Jimce, 9:00 subaxnimo–4:30 galabnimo. Xafiiska weyn waa la dayactirayaa; wac ka hor intaadan tagin.',
      eligibility: 'Qof kasta wuu codsan karaa guryaha dadweynaha ee qoysaska; waxaa jira xeerar dakhliga, xaaladda socdaalka iyo shuruudo kale. Goobaha waayeelka ama dadka naafada ah waxay leeyihiin xeerar gaar ah oo da’ ama naafo ah. BHA ayaa go’aamisa u-qalmitaanka.',
      transit: 'Khadka Cas ama Oranjiga ilaa Downtown Crossing; Khadka Oranjiga ilaa Chinatown.',
      services: ['Guryaha dadweynaha (codsiyo waa la qaataa)', 'Foojarka doorashada guryaha ee Section 8 (liiska sugitaanku waa xiran yahay ilaa ogeysiis dambe)', "Foojarrada mashruuca iyo Mod Rehab (badanaa Mudnaanta Koowaad; weydii ka-reebitaannada)", 'Adeegyada kiraystayaasha'],
    },
    kea: {
      operator: "Sidadi di Boston",
      neighborhood: 'Downtown Crossing (skritóriu pa sidadi interu)',
      hoursNote: 'Sentru di Servisu di Abitason: sigunda a sesta, di 9:00 di manhan té 4:30 di tardi. Skritóriu prinsipal sta na obras; txoma antis di bai.',
      eligibility: 'Kualker pesoa pode kandidata pa abitason públiku pa família; ten regras di rendimentu, situason migratóriu i otus kondisons. Komunidadis pa idozus ô pesoas ku defisiénsia ten regras separadu di idadi ô defisiénsia. BHA ki ta disidi elegibilidadi.',
      transit: 'Linha Vermelhu ô Laranja pa Downtown Crossing; Linha Laranja pa Chinatown.',
      services: ['Abitason públiku (sta ta resebe kandidaturas)', 'Voucher di skodja di abitason Section 8 (lista di spera fetxadu té novu avizu)', "Vouchér ligadu a projetus y Mod Rehab (jeralmenti Prioridadi Un; purgunta sobri isesons)", 'Servisus pa inquilinus'],
    },
  },
  "raft-mass": {
    "es": {
      "neighborhood": "Toda la ciudad",
      "hoursNote": "Llame a Metro Housing|Boston para confirmar el horario de oficina. Massachusetts 2-1-1 responde preguntas básicas sobre RAFT las 24 horas.",
      "eligibility": "Los hogares que enfrentan una crisis de vivienda pueden calificar con ingresos inferiores al 50% del AMI, o al 60% si corren riesgo de violencia doméstica. Confirme todos los requisitos con la agencia administradora.",
      "services": [
        "Alquiler atrasado",
        "Primer y último mes",
        "Depósito de seguridad",
        "Servicios públicos atrasados",
        "Gastos de mudanza"
      ],
      "operator": "Oficina Ejecutiva de Vivienda y Comunidades Habitables; administrado en Boston por Metro Housing|Boston",
      "source": "RAFT de Mass.gov, Metro Housing|Boston y geocodificador del Censo"
    },
    "ht": {
      "neighborhood": "Tout vil la",
      "hoursNote": "Rele Metro Housing|Boston pou konfime lè biwo a. Massachusetts 2-1-1 reponn kesyon debaz sou RAFT 24 èdtan pa jou.",
      "eligibility": "Kay ki an kriz lojman ka kalifye si revni yo anba 50% AMI, oswa anba 60% si yo gen risk vyolans domestik. Konfime tout kondisyon yo ak ajans k ap jere pwogram nan.",
      "services": [
        "Lwaye an reta",
        "Premye ak dènye mwa",
        "Depo garanti",
        "Sèvis piblik an reta",
        "Depans demenajman"
      ],
      "operator": "Biwo Egzekitif Lojman ak Kominote Abitab; Metro Housing|Boston jere li nan Boston",
      "source": "RAFT sou Mass.gov, Metro Housing|Boston ak jeyokodè Resansman an"
    },
    "pt": {
      "neighborhood": "Toda a cidade",
      "hoursNote": "Ligue para a Metro Housing|Boston para confirmar o horário do escritório. O Massachusetts 2-1-1 responde perguntas básicas sobre RAFT 24 horas por dia.",
      "eligibility": "Famílias em crise habitacional podem se qualificar com renda abaixo de 50% da AMI, ou abaixo de 60% quando há risco de violência doméstica. Confirme todos os critérios com o órgão responsável.",
      "services": [
        "Aluguel atrasado",
        "Primeiro e último mês",
        "Depósito de segurança",
        "Serviços públicos atrasados",
        "Custos de mudança"
      ],
      "operator": "Secretaria Executiva de Habitação e Comunidades Habitáveis; administrado em Boston pela Metro Housing|Boston",
      "source": "RAFT no Mass.gov, Metro Housing|Boston e geocodificador do Censo"
    },
    "vi": {
      "neighborhood": "Toàn thành phố",
      "hoursNote": "Gọi Metro Housing|Boston để xác nhận giờ làm việc. Massachusetts 2-1-1 trả lời câu hỏi cơ bản về RAFT 24 giờ mỗi ngày.",
      "eligibility": "Hộ gia đình gặp khủng hoảng nhà ở có thể đủ điều kiện với thu nhập dưới 50% AMI, hoặc dưới 60% khi có nguy cơ bạo lực gia đình. Hãy xác nhận mọi tiêu chí với cơ quan quản lý.",
      "services": [
        "Tiền thuê còn nợ",
        "Tháng đầu và tháng cuối",
        "Tiền đặt cọc",
        "Tiền tiện ích còn nợ",
        "Chi phí chuyển nhà"
      ],
      "operator": "Văn phòng Điều hành Nhà ở và Cộng đồng Đáng sống; do Metro Housing|Boston quản lý tại Boston",
      "source": "RAFT trên Mass.gov, Metro Housing|Boston và bộ định vị địa chỉ của Cục Điều tra Dân số"
    },
    "zh": {
      "neighborhood": "全市",
      "hoursNote": "请致电 Metro Housing|Boston 确认办公时间。Massachusetts 2-1-1 每天 24 小时回答有关 RAFT 的基本问题。",
      "eligibility": "面临住房危机的家庭收入低于 AMI 的 50%，或面临家庭暴力风险且收入低于 60% 时，可能符合资格。请向管理机构确认所有条件。",
      "services": [
        "拖欠租金",
        "首月和末月租金",
        "安全押金",
        "拖欠水电费",
        "搬家费用"
      ],
      "operator": "住房与宜居社区执行办公室；在 Boston 由 Metro Housing|Boston 管理",
      "source": "Mass.gov 的 RAFT 页面、Metro Housing|Boston 和人口普查局地址定位工具"
    },
    "ar": {
      "neighborhood": "على مستوى المدينة",
      "hoursNote": "اتصل بـ Metro Housing|Boston لتأكيد ساعات المكتب. يجيب Massachusetts 2-1-1 عن الأسئلة الأساسية حول RAFT على مدار 24 ساعة.",
      "eligibility": "قد تتأهل الأسر التي تواجه أزمة سكن إذا كان دخلها أقل من 50% من AMI، أو أقل من 60% عند خطر العنف الأسري. تحقق من جميع المعايير مع الجهة المسؤولة.",
      "services": [
        "متأخرات الإيجار",
        "إيجار الشهر الأول والأخير",
        "تأمين السكن",
        "متأخرات المرافق",
        "تكاليف الانتقال"
      ],
      "operator": "المكتب التنفيذي للإسكان والمجتمعات الصالحة للعيش؛ تديره في Boston جهة Metro Housing|Boston",
      "source": "RAFT على Mass.gov وMetro Housing|Boston وأداة تحديد المواقع التابعة للتعداد"
    },
    "so": {
      "neighborhood": "Magaalada oo dhan",
      "hoursNote": "Wac Metro Housing|Boston si aad u xaqiijiso saacadaha xafiiska. Massachusetts 2-1-1 wuxuu ka jawaabaa su’aalaha aasaasiga ah ee RAFT 24 saacadood maalintii.",
      "eligibility": "Qoysaska ay haysato dhibaato guri waxay u qalmi karaan dakhli ka hooseeya 50% AMI, ama ka hooseeya 60% marka ay halis ugu jiraan rabshad qoys. Ka hubi dhammaan shuruudaha hay’adda maamusha.",
      "services": [
        "Kirada ka maqan",
        "Bisha koowaad iyo tan ugu dambaysa",
        "Deebaajiga",
        "Biilasha adeegga ee ka maqan",
        "Kharashka guuritaanka"
      ],
      "operator": "Xafiiska Fulinta ee Guryaha iyo Bulshooyinka Lagu Noolaan Karo; Boston waxaa ka maamusha Metro Housing|Boston",
      "source": "RAFT ee Mass.gov, Metro Housing|Boston iyo aaladda cinwaan-raadinta Tirakoobka"
    },
    "kea": {
      "neighborhood": "Sidadi interu",
      "hoursNote": "Txoma Metro Housing|Boston pa konfirma oráriu di skritóriu. Massachusetts 2-1-1 ta responde perguntas básiku sobri RAFT 24 oras pa dia.",
      "eligibility": "Agregadus ku krizi di abitason podi ser elegível ku rendimentu baxu di 50% di AMI, ô baxu di 60% si ten risku di violénsia doméstiku. Konfirma tudu kritérius ku ajénsia responsavel.",
      "services": [
        "Renda atrasadu",
        "Primeru i últimu mês",
        "Depózitu di siguransa",
        "Kontas di servisus atrasadu",
        "Kustu di mudansa"
      ],
      "operator": "Skritóriu Ezekutivu di Abitason i Komunidadis Abitável; administradu na Boston pa Metro Housing|Boston",
      "source": "RAFT na Mass.gov, Metro Housing|Boston i jeyokodifikador di Sensu"
    }
  },
  "gbLS-dorchester": {
    "es": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (atiende a Dorchester)",
      "hoursNote": "Admisión de vivienda (excepto asuntos de refugio): (617) 603-1807, lunes a viernes de 9:00 a 17:00. Admisión telefónica general: de 9:30 a 12:30, lunes a viernes.",
      "eligibility": "Residentes del área de Boston que cumplan los requisitos de ingresos. Llame para la admisión; no se garantiza representación.",
      "transit": "Líneas Verde y Naranja a North Station, a 4 minutos a pie. Tren de cercanías a North Station.",
      "services": [
        "Defensa contra desalojos",
        "Habitabilidad y reparaciones",
        "Apelaciones de SNAP y TAFDC",
        "Alivio migratorio",
        "CORI y sellado de antecedentes"
      ],
      "source": "Página de ubicaciones y direcciones de gbls.org"
    },
    "ht": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (sèvi Dorchester)",
      "hoursNote": "Admisyon lojman (eksepte kesyon abri): (617) 603-1807, lendi–vandredi 9:00–17:00. Admisyon jeneral pa telefòn: 9:30–12:30, lendi–vandredi.",
      "eligibility": "Rezidan zòn Boston ki ranpli kondisyon revni yo. Rele pou admisyon; reprezantasyon pa garanti.",
      "transit": "Liy Vèt ak Liy Oranj pou North Station, 4 minit apye. Tren banlye pou North Station.",
      "services": [
        "Defans kont degèpisman",
        "Kondisyon lojman ak reparasyon",
        "Apèl SNAP ak TAFDC",
        "Sekou imigrasyon",
        "CORI ak sele dosye"
      ],
      "source": "Paj adrès ak direksyon gbls.org"
    },
    "pt": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (atende Dorchester)",
      "hoursNote": "Triagem de moradia (exceto questões de abrigo): (617) 603-1807, segunda a sexta, 9:00–17:00. Triagem telefônica geral: 9:30–12:30, segunda a sexta.",
      "eligibility": "Moradores da região de Boston que atendam aos requisitos de renda. Ligue para a triagem; a representação não é garantida.",
      "transit": "Linhas Verde e Laranja até North Station, 4 minutos a pé. Trem regional até North Station.",
      "services": [
        "Defesa contra despejo",
        "Habitabilidade e reparos",
        "Recursos de SNAP e TAFDC",
        "Ajuda imigratória",
        "CORI e sigilo de antecedentes"
      ],
      "source": "Página de locais e direções do gbls.org"
    },
    "vi": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (phục vụ Dorchester)",
      "hoursNote": "Tiếp nhận về nhà ở (trừ vấn đề nơi tạm trú): (617) 603-1807, thứ Hai–thứ Sáu 9:00–17:00. Tiếp nhận chung qua điện thoại: 9:30–12:30, thứ Hai–thứ Sáu.",
      "eligibility": "Cư dân khu vực Boston đáp ứng điều kiện thu nhập. Gọi để được tiếp nhận; không bảo đảm có người đại diện.",
      "transit": "Tuyến Xanh lá và Cam đến North Station, đi bộ 4 phút. Tàu ngoại ô đến North Station.",
      "services": [
        "Bào chữa chống trục xuất",
        "Điều kiện ở và sửa chữa",
        "Khiếu nại SNAP và TAFDC",
        "Hỗ trợ nhập cư",
        "CORI và niêm phong hồ sơ"
      ],
      "source": "Trang địa điểm và chỉ đường của gbls.org"
    },
    "zh": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston（服务 Dorchester）",
      "hoursNote": "住房案件受理（庇护所事宜除外）：(617) 603-1807，周一至周五 9:00–17:00。一般电话受理：周一至周五 9:30–12:30。",
      "eligibility": "符合收入条件的波士顿地区居民。请致电申请受理；不保证提供代理。",
      "transit": "乘绿线或橙线至 North Station，步行 4 分钟。通勤铁路至 North Station。",
      "services": [
        "驱逐辩护",
        "居住条件和维修",
        "SNAP 和 TAFDC 申诉",
        "移民救济",
        "CORI 和记录封存"
      ],
      "source": "gbls.org 地点和路线页面"
    },
    "ar": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (تخدم Dorchester)",
      "hoursNote": "استقبال قضايا السكن (عدا شؤون المأوى): (617) 603-1807، الاثنين–الجمعة 9:00–17:00. الاستقبال الهاتفي العام: 9:30–12:30، الاثنين–الجمعة.",
      "eligibility": "سكان منطقة Boston المستوفون لشروط الدخل. اتصل لطلب المساعدة؛ التمثيل القانوني غير مضمون.",
      "transit": "الخط الأخضر والبرتقالي إلى North Station، ثم مشي 4 دقائق. قطار الضواحي إلى North Station.",
      "services": [
        "الدفاع في قضايا الإخلاء",
        "صلاحية السكن والإصلاحات",
        "الطعن في SNAP وTAFDC",
        "مساعدة الهجرة",
        "CORI وختم السجلات"
      ],
      "source": "صفحة المواقع والاتجاهات في gbls.org"
    },
    "so": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (u adeegta Dorchester)",
      "hoursNote": "Qaabilaadda guryaha (marka laga reebo arrimaha hoyga): (617) 603-1807, Isniin–Jimce 9:00–17:00. Qaabilaadda guud ee telefoonka: 9:30–12:30, Isniin–Jimce.",
      "eligibility": "Dadka deggan agagaarka Boston ee buuxiya shuruudaha dakhliga. Wac si laguugu qaabilo; wakiil sharci lama dammaanad qaado.",
      "transit": "Khadka Cagaaran iyo Oranjiga ilaa North Station, 4 daqiiqo oo lug ah. Tareenka Commuter Rail ilaa North Station.",
      "services": [
        "Difaaca ka saaridda",
        "Xaaladda guriga iyo dayactirka",
        "Racfaanada SNAP iyo TAFDC",
        "Caawinta socdaalka",
        "CORI iyo xiridda diiwaanka"
      ],
      "source": "Bogga goobaha iyo tilmaamaha ee gbls.org"
    },
    "kea": {
      "operator": "Greater Boston Legal Services",
      "neighborhood": "Boston (ta serbi Dorchester)",
      "hoursNote": "Asetason di kazus di abitason (salvu asuntus di abrigu): (617) 603-1807, sigunda–sesta 9:00–17:00. Asetason jeral pa telefoni: 9:30–12:30, sigunda–sesta.",
      "eligibility": "Moradoris di zona di Boston ki ta kunpri kondisons di rendimentu. Txoma pa asetason; reprezentason ka é garantidu.",
      "transit": "Linha Verdi i Laranja pa North Station, 4 minutu a pé. Tren suburban pa North Station.",
      "services": [
        "Defeza kontra despeju",
        "Kondisons di abitason i reparason",
        "Rekursus di SNAP i TAFDC",
        "Ajuda migratóriu",
        "CORI i selamentu di rejistus"
      ],
      "source": "Pájina di lokal i direksons di gbls.org"
    }
  },
  "city-life-vida-urbana": {
    "es": {
      "address": "284 Amory Street, primer piso, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (atiende a Dorchester)",
      "hoursNote": "Reunión de inquilinos en Jamaica Plain los martes a las 6:30 p. m. Llame para confirmar el horario.",
      "transit": "Línea Naranja a Jackson Square, a 8 minutos a pie. Autobuses 22, 29, 41 y 44 cerca.",
      "services": [
        "Reuniones de inquilinos (confirme el horario)",
        "Organización de inquilinos",
        "Orientación sobre desalojo y ejecución hipotecaria",
        "Negociación de aumentos de alquiler",
        "Condiciones de vivienda"
      ],
      "source": "Páginas de reuniones semanales y contacto de clvu.org"
    },
    "ht": {
      "address": "284 Amory Street, premye etaj, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (sèvi Dorchester)",
      "hoursNote": "Reyinyon lokatè Jamaica Plain chak madi a 6:30 aswè. Rele pou konfime orè a.",
      "transit": "Liy Oranj pou Jackson Square, 8 minit apye. Bis 22, 29, 41 ak 44 toupre.",
      "services": [
        "Reyinyon lokatè (konfime orè a)",
        "Òganizasyon lokatè",
        "Konsèy sou degèpisman ak sezi kay",
        "Negosyasyon sou ogmantasyon lwaye",
        "Kondisyon lojman"
      ],
      "source": "Paj reyinyon chak semèn ak kontak clvu.org"
    },
    "pt": {
      "address": "284 Amory Street, 1º andar, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (atende Dorchester)",
      "hoursNote": "Reunião de inquilinos em Jamaica Plain às terças, às 18h30. Ligue para confirmar o horário.",
      "transit": "Linha Laranja até Jackson Square, 8 minutos a pé. Ônibus 22, 29, 41 e 44 próximos.",
      "services": [
        "Reuniões de inquilinos (confirme o horário)",
        "Organização de inquilinos",
        "Orientação sobre despejo e execução hipotecária",
        "Negociação de aumentos de aluguel",
        "Condições de moradia"
      ],
      "source": "Páginas de reuniões semanais e contato do clvu.org"
    },
    "vi": {
      "address": "284 Amory Street, tầng 1, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (phục vụ Dorchester)",
      "hoursNote": "Họp người thuê tại Jamaica Plain vào thứ Ba lúc 6:30 tối. Gọi để xác nhận lịch.",
      "transit": "Tuyến Cam đến Jackson Square, đi bộ 8 phút. Các tuyến xe buýt 22, 29, 41 và 44 gần đó.",
      "services": [
        "Họp người thuê (xác nhận lịch)",
        "Tổ chức người thuê",
        "Hướng dẫn về trục xuất và tịch biên nhà",
        "Thương lượng tăng tiền thuê",
        "Điều kiện nhà ở"
      ],
      "source": "Trang họp hằng tuần và liên hệ của clvu.org"
    },
    "zh": {
      "address": "284 Amory Street，一楼，Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain（服务 Dorchester）",
      "hoursNote": "Jamaica Plain 租户会议为周二下午 6:30。请致电确认时间。",
      "transit": "乘橙线至 Jackson Square，步行 8 分钟。附近有 22、29、41 和 44 路公交车。",
      "services": [
        "租户会议（请确认时间）",
        "租户组织",
        "驱逐和止赎指导",
        "租金上涨协商",
        "住房条件"
      ],
      "source": "clvu.org 每周会议和联系页面"
    },
    "ar": {
      "address": "284 Amory Street، الطابق الأول، Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (تخدم Dorchester)",
      "hoursNote": "اجتماع المستأجرين في Jamaica Plain يوم الثلاثاء الساعة 6:30 مساءً. اتصل لتأكيد الموعد.",
      "transit": "الخط البرتقالي إلى Jackson Square، ثم مشي 8 دقائق. الحافلات 22 و29 و41 و44 قريبة.",
      "services": [
        "اجتماعات المستأجرين (أكد الموعد)",
        "تنظيم المستأجرين",
        "إرشاد بشأن الإخلاء وحجز الرهن",
        "التفاوض بشأن زيادة الإيجار",
        "ظروف السكن"
      ],
      "source": "صفحتا الاجتماعات الأسبوعية والاتصال في clvu.org"
    },
    "so": {
      "address": "284 Amory Street, dabaqa 1aad, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (u adeegta Dorchester)",
      "hoursNote": "Kulanka kiraystayaasha Jamaica Plain waa Talaado 6:30 fiidnimo. Wac si aad jadwalka u xaqiijiso.",
      "transit": "Khadka Oranjiga ilaa Jackson Square, 8 daqiiqo oo lug ah. Basaska 22, 29, 41 iyo 44 waa dhow yihiin.",
      "services": [
        "Kulamada kiraystayaasha (xaqiiji jadwalka)",
        "Abaabulka kiraystayaasha",
        "Hagid ku saabsan ka saarid iyo foreclosure",
        "Wadaxaajoodka kororka kirada",
        "Xaaladaha guriga"
      ],
      "source": "Bogagga kulamada toddobaadlaha iyo xiriirka ee clvu.org"
    },
    "kea": {
      "address": "284 Amory Street, 1º andar, Jamaica Plain, MA 02130",
      "neighborhood": "Jamaica Plain (ta serbi Dorchester)",
      "hoursNote": "Reunion di inquilinus na Jamaica Plain é tersa 6:30 di tardi. Txoma pa konfirma oráriu.",
      "transit": "Linha Laranja pa Jackson Square, 8 minutu a pé. Autokarus 22, 29, 41 i 44 perto.",
      "services": [
        "Reunions di inquilinus (konfirma oráriu)",
        "Organizason di inquilinus",
        "Orientason sobri despeju i esekuson di ipoteka",
        "Negosiasan di aumentu di renda",
        "Kondisons di abitason"
      ],
      "source": "Pájinas di reunions semanal i kontatu di clvu.org"
    }
  },

};

export interface DetailValue<T> { value: T; used: Language; fellBack: boolean }

/** Return the source language with every field, so fallbacks are not hidden. */
export function resourceDetails(record: ResourceRecord, lang: Language) {
  const draft = lang === 'en' ? undefined : RESOURCE_DETAIL_DRAFTS[record.id]?.[lang];
  function field<T>(source: T, translation: T | undefined, present: boolean): DetailValue<T> {
    if (lang !== 'en' && translation !== undefined && present) return { value: translation, used: lang, fellBack: false };
    return { value: source, used: 'en', fellBack: lang !== 'en' && present };
  }
  return {
    neighborhood: field(record.neighborhood, draft?.neighborhood, true),
    address: field(record.address, draft?.address, record.translateAddress === true),
    operator: field(record.operator, draft?.operator, Boolean(record.operator)),
    // A bare publisher/domain needs no translation, but remains marked as English
    // for pronunciation. Descriptive source prose falls back explicitly.
    source: !draft?.source && /^[\w.-]+\.[a-z]{2,}$/i.test(record.verification.source)
      ? { value: record.verification.source, used: 'en' as Language, fellBack: false }
      : field(record.verification.source, draft?.source, Boolean(record.verification.source)),
    hoursNote: field(record.hoursNote, draft?.hoursNote, Boolean(record.hoursNote)),
    eligibility: field(record.eligibility, draft?.eligibility, Boolean(record.eligibility)),
    transit: field(record.transit, draft?.transit, Boolean(record.transit)),
    services: field(record.services, draft?.services, record.services.length > 0),
  };
}

/** Index every available draft as well as English, independent of UI language. */
export function resourceDetailSearchTerms(id: string): string {
  return Object.values(RESOURCE_DETAIL_DRAFTS[id] ?? {})
    .flatMap((draft) => draft ? [draft.neighborhood, draft.address, draft.operator, draft.source, draft.hoursNote, draft.eligibility, draft.transit, ...draft.services] : [])
    .join(' ');
}
