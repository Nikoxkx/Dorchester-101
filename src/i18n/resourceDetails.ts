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
      hoursNote: "La página del Centro de Servicios de Vivienda indica lunes a viernes, 9 a. m.–4:30 p. m., en 52 Chauncy Street. Otras páginas de BHA indican que la oficina principal abre de 9 a. m. a 5 p. m., y una FAQ da 56 Chauncy Street. Llame al (617) 988-4000 para confirmar sede y horario antes de ir.",
      eligibility: 'Cualquier persona puede solicitar vivienda pública familiar; se aplican requisitos de ingresos, estatus migratorio y otras normas. Las comunidades para personas mayores o con discapacidad tienen requisitos propios de edad o discapacidad. La BHA decide la elegibilidad.',
      transit: 'Línea Roja o Naranja a Downtown Crossing; Línea Naranja a Chinatown.',
      services: ['Vivienda pública (acepta solicitudes)', 'Vale de elección de vivienda de la Sección 8 (lista de espera cerrada hasta nuevo aviso)', "Vales basados en proyectos y Mod Rehab (generalmente Prioridad Uno; pregunte por excepciones)", 'Servicios para inquilinos'],
    },
    ht: {
      operator: "Vil Boston",
      neighborhood: 'Downtown Crossing (biwo pou tout vil la)',
      hoursNote: "Paj Sant Sèvis Lojman an bay lendi–vandredi, 9 a.m.–4:30 p.m., nan 52 Chauncy Street. Lòt paj BHA bay lè biwo prensipal la kòm 9 a.m.–5 p.m., epi yon FAQ bay 56 Chauncy Street. Rele (617) 988-4000 pou konfime kote ak lè sèvis la anvan ou ale.",
      eligibility: 'Nenpòt moun ka aplike pou lojman piblik pou fanmi; gen règ sou revni, estati imigrasyon ak lòt kondisyon. Kominote pou granmoun aje oswa moun ki gen andikap gen règ apa sou laj oswa andikap. Se BHA ki deside kalifikasyon.',
      transit: 'Liy Wouj oswa Liy Oranj pou Downtown Crossing; Liy Oranj pou Chinatown.',
      services: ['Lojman piblik (ap resevwa aplikasyon)', 'Vouch chwa lojman Seksyon 8 (lis datant fèmen jiskaske yo anonse otreman)', "Vouch ki baze sou pwojè ak Mod Rehab (jeneralman Priyorite Youn; mande sou eksepsyon)", 'Sèvis pou lokatè'],
    },
    pt: {
      operator: "Cidade de Boston",
      neighborhood: 'Downtown Crossing (escritório para toda a cidade)',
      hoursNote: "A página do Centro de Serviços de Moradia informa segunda a sexta, 9h–16h30, em 52 Chauncy Street. Outras páginas da BHA informam que o escritório principal funciona das 9h às 17h, e uma FAQ dá o endereço 56 Chauncy Street. Ligue para (617) 988-4000 para confirmar o local e o horário antes de ir.",
      eligibility: 'Qualquer pessoa pode solicitar moradia pública para famílias; aplicam-se regras de renda, situação imigratória e outras condições. Comunidades para idosos ou pessoas com deficiência têm regras próprias de idade ou deficiência. A BHA decide a elegibilidade.',
      transit: 'Linha Vermelha ou Laranja até Downtown Crossing; Linha Laranja até Chinatown.',
      services: ['Moradia pública (aceita inscrições)', 'Voucher de escolha de moradia da Seção 8 (lista de espera fechada até novo aviso)', "Vouchers vinculados a projetos e Mod Rehab (geralmente Prioridade Um; pergunte sobre exceções)", 'Serviços para inquilinos'],
    },
    vi: {
      operator: "Thành phố Boston",
      neighborhood: 'Downtown Crossing (văn phòng phục vụ toàn thành phố)',
      hoursNote: "Trang Trung tâm Dịch vụ Nhà ở ghi giờ thứ Hai–thứ Sáu, 9 giờ sáng–4:30 chiều, tại 52 Chauncy Street. Các trang BHA khác ghi văn phòng chính mở 9 giờ sáng–5 giờ chiều, và một trang FAQ ghi địa chỉ 56 Chauncy Street. Gọi (617) 988-4000 để xác nhận địa điểm và giờ trước khi đến.",
      eligibility: 'Bất kỳ ai cũng có thể nộp đơn xin nhà ở công cho gia đình; các quy định về thu nhập, tình trạng nhập cư và điều kiện khác được áp dụng. Các khu dành cho người cao tuổi hoặc người khuyết tật có quy định riêng về tuổi hoặc tình trạng khuyết tật. BHA quyết định điều kiện hội đủ.',
      transit: 'Tuyến Đỏ hoặc Cam đến Downtown Crossing; Tuyến Cam đến Chinatown.',
      services: ['Nhà ở công (đang nhận đơn)', 'Phiếu lựa chọn nhà ở Section 8 (danh sách chờ đóng cho đến khi có thông báo mới)', "Phiếu gắn với dự án và Mod Rehab (thường cần Priority One; hỏi về ngoại lệ)", 'Dịch vụ cho người thuê'],
    },
    zh: {
      operator: "波士顿市政府",
      neighborhood: 'Downtown Crossing（全市服务办公室）',
      hoursNote: "住房服务中心页面列出周一至周五上午 9 点至下午 4:30，地址为 52 Chauncy Street。BHA 其他页面称主办公室时间为上午 9 点至下午 5 点，另一个常见问题页面列出 56 Chauncy Street。前往前请致电 (617) 988-4000 确认地点和时间。",
      eligibility: '任何人都可申请家庭公共住房；但须符合收入、移民身份及其他规定。长者或残障人士社区另有年龄或残障条件。是否符合资格由 BHA 决定。',
      transit: '乘红线或橙线至 Downtown Crossing；乘橙线至 Chinatown。',
      services: ['公共住房（接受申请）', '第 8 节住房选择券（等候名单关闭，直至另行通知）', "项目绑定代金券及 Mod Rehab（通常要求 Priority One；请询问例外）", '租户服务'],
    },
    ar: {
      operator: "مدينة بوسطن",
      neighborhood: 'Downtown Crossing (مكتب يخدم المدينة بأكملها)',
      hoursNote: "تذكر صفحة مركز خدمات الإسكان الدوام من الاثنين إلى الجمعة، 9 صباحاً–4:30 مساءً، في 52 Chauncy Street. وتذكر صفحات أخرى لدى BHA ساعات المكتب الرئيسي 9 صباحاً–5 مساءً، كما تذكر صفحة أسئلة شائعة العنوان 56 Chauncy Street. اتصل على (617) 988-4000 لتأكيد الموقع والوقت قبل الزيارة.",
      eligibility: 'يمكن لأي شخص التقدم للإسكان العام العائلي؛ وتُطبق قواعد الدخل وحالة الهجرة وغيرها من الشروط. للمجتمعات المخصصة لكبار السن أو الأشخاص ذوي الإعاقة قواعد منفصلة تتعلق بالعمر أو الإعاقة. تقرر BHA الأهلية.',
      transit: 'الخط الأحمر أو البرتقالي إلى Downtown Crossing؛ والخط البرتقالي إلى Chinatown.',
      services: ['الإسكان العام (يقبل الطلبات)', 'قسيمة اختيار السكن للقسم 8 (قائمة الانتظار مغلقة حتى إشعار آخر)', "القسائم المرتبطة بالمشاريع وMod Rehab (عادةً الأولوية الأولى؛ اسأل عن الاستثناءات)", 'خدمات المستأجرين'],
    },
    so: {
      operator: "Magaalada Boston",
      neighborhood: 'Downtown Crossing (xafiis u adeega magaalada oo dhan)',
      hoursNote: "Bogga Xarunta Adeegga Guryuhu wuxuu sheegayaa Isniin–Jimce, 9 subaxnimo–4:30 galabnimo, 52 Chauncy Street. Bogag kale oo BHA ah waxay sheegaan in xafiiska weyn furan yahay 9 subaxnimo–5 galabnimo, FAQ kalena wuxuu bixiyaa 56 Chauncy Street. Wac (617) 988-4000 si aad u xaqiijiso goobta iyo saacadaha ka hor booqashada.",
      eligibility: 'Qof kasta wuu codsan karaa guryaha dadweynaha ee qoysaska; waxaa jira xeerar dakhliga, xaaladda socdaalka iyo shuruudo kale. Goobaha waayeelka ama dadka naafada ah waxay leeyihiin xeerar gaar ah oo da’ ama naafo ah. BHA ayaa go’aamisa u-qalmitaanka.',
      transit: 'Khadka Cas ama Oranjiga ilaa Downtown Crossing; Khadka Oranjiga ilaa Chinatown.',
      services: ['Guryaha dadweynaha (codsiyo waa la qaataa)', 'Foojarka doorashada guryaha ee Section 8 (liiska sugitaanku waa xiran yahay ilaa ogeysiis dambe)', "Foojarrada mashruuca iyo Mod Rehab (badanaa Mudnaanta Koowaad; weydii ka-reebitaannada)", 'Adeegyada kiraystayaasha'],
    },
    kea: {
      operator: "Sidadi di Boston",
      neighborhood: 'Downtown Crossing (skritóriu pa sidadi interu)',
      hoursNote: "Pájina di Sentru di Servisu di Abitason ta da sigunda–sesta, 9 di manhan–4:30 di tardi, na 52 Chauncy Street. Otus pájinas di BHA ta da oráriu di skritóriu prinsipal di 9 di manhan–5 di tardi, i un FAQ ta da 56 Chauncy Street. Txoma (617) 988-4000 pa konfirma lugar i oráriu antis di bai.",
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
      "hoursNote": "Oficina principal: lunes a viernes, 9 a. m.–5 p. m. Admisión telefónica general: 9:30 a. m.–12:30 p. m. Línea de vivienda: (617) 603-1807, lunes a viernes, 9 a. m.–5 p. m. Atención sin cita: lunes y jueves, 1:30–4 p. m. La admisión de vivienda es telefónica, excepto asuntos de refugio.",
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
      "hoursNote": "Biwo prensipal: lendi–vandredi, 9 a.m.–5 p.m. Admisyon jeneral pa telefòn: 9:30 a.m.–12:30 p.m. Liy lojman: (617) 603-1807, lendi–vandredi, 9 a.m.–5 p.m. Moun ka vini san randevou lendi ak jedi, 1:30–4 p.m. Admisyon lojman fèt pa telefòn, eksepte kesyon abri.",
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
      "hoursNote": "Escritório principal: segunda a sexta, 9h–17h. Triagem telefônica geral: 9h30–12h30. Linha de moradia: (617) 603-1807, segunda a sexta, 9h–17h. Atendimento sem agendamento: segunda e quinta, 13h30–16h. A triagem de moradia é por telefone, exceto questões de abrigo.",
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
      "hoursNote": "Văn phòng chính: thứ Hai–thứ Sáu, 9 giờ sáng–5 giờ chiều. Tiếp nhận chung qua điện thoại: 9:30 sáng–12:30 trưa. Đường dây nhà ở: (617) 603-1807, thứ Hai–thứ Sáu, 9 giờ sáng–5 giờ chiều. Tiếp nhận không hẹn trước: thứ Hai và thứ Năm, 1:30–4 giờ chiều. Tiếp nhận nhà ở qua điện thoại, trừ vấn đề nơi tạm trú.",
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
      "hoursNote": "主办公室：周一至周五上午 9 点至下午 5 点。一般电话受理：上午 9:30 至中午 12:30。住房热线：(617) 603-1807，周一至周五上午 9 点至下午 5 点。现场接待：周一和周四下午 1:30 至 4 点。住房案件通过电话受理，庇护所事宜除外。",
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
      "hoursNote": "المكتب الرئيسي: الاثنين–الجمعة، 9 صباحاً–5 مساءً. الاستقبال الهاتفي العام: 9:30 صباحاً–12:30 ظهراً. خط السكن: (617) 603-1807، الاثنين–الجمعة، 9 صباحاً–5 مساءً. استقبال دون موعد: الاثنين والخميس، 1:30–4 مساءً. استقبال قضايا السكن عبر الهاتف، باستثناء شؤون المأوى.",
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
      "hoursNote": "Xafiiska weyn: Isniin–Jimce, 9 subaxnimo–5 galabnimo. Qaabilaadda guud ee telefoonka: 9:30 subaxnimo–12:30 duhurnimo. Khadka guryaha: (617) 603-1807, Isniin–Jimce, 9 subaxnimo–5 galabnimo. Soo-gal aan ballan lahayn: Isniin iyo Khamiis, 1:30–4 galabnimo. Qaabilaadda guryuhu waa telefoon, marka laga reebo arrimaha hoyga.",
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
      "hoursNote": "Skritóriu prinsipal: sigunda–sesta, 9 di manhan–5 di tardi. Asetason jeral pa telefoni: 9:30 di manhan–12:30 di dia. Linha di abitason: (617) 603-1807, sigunda–sesta, 9 di manhan–5 di tardi. Atendimentu sen markason: sigunda i kinta, 1:30–4 di tardi. Asetason di abitason é pa telefoni, salvu asuntus di abrigu.",
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
