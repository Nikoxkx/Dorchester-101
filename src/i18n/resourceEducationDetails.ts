import type { DetailDraft } from './resourceDetails';
import type { Language } from '@/stores/appStore';

/** Drafts require native-speaker and provider review. */
export const EDUCATION_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "st-mark-esol": {
    "es": {
      "neighborhood": "Fields Corner East (dirección de contacto; clases en varios lugares)",
      "operator": "St. Mark Community Education Program",
      "source": "Sitio de St. Mark y programa de alfabetización de adultos de la Ciudad de Boston y geocodificador del Censo de EE. UU.",
      "hoursNote": "Los lugares, horarios y la inscripción varían. La dirección indicada, 25 Beach Street, no está confirmada como sede de clases. Consulte la página de inscripción o llame al (617) 288-8515 para confirmar el lugar actual antes de asistir.",
      "eligibility": "Para adultos del área de Boston. Pregunta por los requisitos actuales, la asignación de nivel y posibles costos de materiales.",
      "services": [
        "Clases de inglés",
        "Preparación para ciudadanía y educación cívica",
        "Grupos de conversación"
      ]
    },
    "ht": {
      "neighborhood": "Fields Corner East (adrès kontak; kou nan plizyè kote)",
      "operator": "St. Mark Community Education Program",
      "source": "Sit St. Mark ak lis alfabetizasyon granmoun Vil Boston ak jeyokodè Resansman Etazini",
      "hoursNote": "Kote, orè ak enskripsyon yo varye. Adrès 25 Beach Street ki make a pa konfime kòm lokal klas. Gade paj enskripsyon an oswa rele (617) 288-8515 pou konfime kote aktyèl la anvan ou ale.",
      "eligibility": "Pou granmoun nan zòn Boston. Mande sou kondisyon aktyèl yo, nivo kou a ak nenpòt frè materyèl.",
      "services": [
        "Kou anglè",
        "Preparasyon sitwayènte ak sivik",
        "Gwoup konvèsasyon"
      ]
    },
    "pt": {
      "neighborhood": "Fields Corner East (endereço de contato; aulas em vários locais)",
      "operator": "St. Mark Community Education Program",
      "source": "Site do St. Mark e lista de alfabetização de adultos da Cidade de Boston e geocodificador do Censo dos EUA",
      "hoursNote": "Locais, horários e inscrições variam. O endereço informado, 25 Beach Street, não está confirmado como local de aula. Consulte a página de inscrição ou ligue para (617) 288-8515 para confirmar o local atual antes de comparecer.",
      "eligibility": "Para adultos da região de Boston. Pergunte sobre requisitos atuais, nível e eventuais custos de materiais.",
      "services": [
        "Aulas de inglês",
        "Preparação para cidadania e educação cívica",
        "Grupos de conversação"
      ]
    },
    "vi": {
      "neighborhood": "Fields Corner East (địa chỉ liên hệ; lớp học ở nhiều nơi)",
      "operator": "St. Mark Community Education Program",
      "source": "Trang St. Mark và danh sách xóa mù chữ cho người lớn của Thành phố Boston và bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Địa điểm, lịch học và đăng ký thay đổi. Địa chỉ 25 Beach Street được liệt kê chưa được xác nhận là nơi học. Xem trang đăng ký hoặc gọi (617) 288-8515 để xác nhận địa điểm lớp hiện tại trước khi đến.",
      "eligibility": "Dành cho người lớn ở vùng Boston. Hỏi về điều kiện hiện tại, xếp lớp và chi phí tài liệu nếu có.",
      "services": [
        "Lớp tiếng Anh",
        "Luyện thi quốc tịch và kiến thức công dân",
        "Nhóm hội thoại"
      ]
    },
    "zh": {
      "neighborhood": "Fields Corner East（联系地址；课程在多个地点举行）",
      "operator": "St. Mark Community Education Program",
      "source": "St. Mark 网站及波士顿市成人识字项目名单及美国人口普查局地址定位工具",
      "hoursNote": "地点、时间和报名情况各不相同。所列 25 Beach Street 地址尚未确认为上课地点。前往前请查看报名页面或致电 (617) 288-8515 确认当前课堂地点。",
      "eligibility": "面向大波士顿地区成年人。请询问目前的资格、分班和可能的材料费。",
      "services": [
        "英语课程",
        "入籍及公民知识考试准备",
        "会话小组"
      ]
    },
    "ar": {
      "neighborhood": "Fields Corner East (عنوان للتواصل؛ الدروس في مواقع متعددة)",
      "operator": "St. Mark Community Education Program",
      "source": "موقع St. Mark وقائمة تعليم الكبار في مدينة بوسطن وأداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تختلف المواقع والمواعيد والتسجيل. لم يُؤكد عنوان 25 Beach Street المذكور كموقع للدروس. راجع صفحة التسجيل أو اتصل على (617) 288-8515 لتأكيد موقع الصف الحالي قبل الحضور.",
      "eligibility": "للبالغين في منطقة بوسطن الكبرى. اسأل عن الأهلية الحالية وتحديد المستوى وأي رسوم للمواد.",
      "services": [
        "دروس اللغة الإنجليزية",
        "التحضير للجنسية والتربية المدنية",
        "مجموعات المحادثة"
      ]
    },
    "so": {
      "neighborhood": "Fields Corner East (cinwaanka xiriirka; fasallo meelo kala duwan)",
      "operator": "St. Mark Community Education Program",
      "source": "Bogga St. Mark iyo liiska waxbarashada dadka waaweyn ee Magaalada Boston iyo aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Goobaha, jadwalka iyo diiwaangelintu way kala duwan yihiin. Cinwaanka 25 Beach Street ee liiska ku qoran looma xaqiijin goob fasal. Eeg bogga diiwaangelinta ama wac (617) 288-8515 si aad u xaqiijiso goobta fasalka hadda ka hor intaadan tegin.",
      "eligibility": "Dadka waaweyn ee aagga Boston. Weydii u-qalmitaanka hadda, heerka fasalka iyo kharashka agabka haddii uu jiro.",
      "services": [
        "Fasallada Ingiriisiga",
        "Diyaarinta jinsiyadda iyo cilmiga muwaadinnimada",
        "Kooxaha wada sheekaysiga"
      ]
    },
    "kea": {
      "neighborhood": "Fields Corner East (enderesu di kontaktu; aulas na vários lugar)",
      "operator": "St. Mark Community Education Program",
      "source": "Situ di St. Mark i lista di alfabetizason di adultus di Sidadi di Boston i jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Lugar, oráriu i inskrison ta varia. Enderesu indikadu, 25 Beach Street, ka sta konfirmadu komu lugar di aula. Odja pájina di inskrison ô txoma (617) 288-8515 pa konfirma lugar atual di aula antis di bai.",
      "eligibility": "Pa adultus di área di Boston. Pergunta sobri elegibilidadi atual, nivel di turma i kualker kustu di material.",
      "services": [
        "Aulas di inglês",
        "Preparason pa sidadania i siviku",
        "Grupus di konversason"
      ]
    }
  },
  "college-bound-dorchester": {
    "es": {
      "neighborhood": "Dorchester (zona de servicio; no se confirmó una sede para visitas)",
      "address": "No hay dirección pública confirmada para visitas; confirme el lugar del servicio con Uncornered",
      "source": "Páginas de contacto y donaciones de Uncornered; antiguo sitio de College Bound Dorchester",
      "hoursNote": "La página actual de contacto de Uncornered ofrece correo y formulario, pero no publica horario de visitas ni sede de servicios. La página de donaciones indica 218 Adams Street y PO Box 220605; otra página oficial indica 222 Bowdoin Street. Ninguna se confirma como sede de atención. Escriba a info@uncornered.org para confirmar el lugar.",
      "eligibility": "El programa se centra en personas involucradas en violencia callejera; pregunta a la organización sobre participación y derivaciones.",
      "services": [
        "Recursos educativos",
        "Apoyo de salud mental",
        "Prevención de violencia comunitaria"
      ]
    },
    "ht": {
      "neighborhood": "Dorchester (zòn sèvis; pa gen lokal vizit ki konfime)",
      "address": "Pa gen adrès piblik pou vizit ki konfime; konfime kote sèvis la avèk Uncornered",
      "source": "Paj kontak ak donasyon Uncornered; ansyen sit College Bound Dorchester",
      "hoursNote": "Paj kontak aktyèl Uncornered la gen imel ak fòm, men li pa bay lè vizit oswa adrès sèvis. Paj donasyon an bay 218 Adams Street ak PO Box 220605; yon lòt paj ofisyèl bay 222 Bowdoin Street. Okenn nan yo pa konfime kòm lokal vizit. Ekri info@uncornered.org pou konfime kote sèvis la.",
      "eligibility": "Pwogram nan konsantre sou moun ki enplike nan vyolans nan lari; mande òganizasyon an sou patisipasyon ak referans.",
      "services": [
        "Resous edikasyon",
        "Sipò pou sante mantal",
        "Prevansyon vyolans kominotè"
      ]
    },
    "pt": {
      "neighborhood": "Dorchester (área atendida; local de visita não confirmado)",
      "address": "Não há endereço público confirmado para visitas; confirme o local do serviço com a Uncornered",
      "source": "Páginas de contato e doações da Uncornered; antigo site da College Bound Dorchester",
      "hoursNote": "A página atual de contato da Uncornered oferece email e formulário, mas não informa horário de visita nem endereço de atendimento. A página de doações lista 218 Adams Street e PO Box 220605; outra página oficial lista 222 Bowdoin Street. Nenhum está confirmado como local de atendimento. Escreva para info@uncornered.org para confirmar o local.",
      "eligibility": "O programa concentra-se em pessoas envolvidas em violência nas ruas; pergunte à organização sobre participação e encaminhamentos.",
      "services": [
        "Recursos educacionais",
        "Apoio à saúde mental",
        "Prevenção da violência comunitária"
      ]
    },
    "vi": {
      "neighborhood": "Dorchester (khu vực phục vụ; chưa xác nhận địa điểm tiếp khách)",
      "address": "Chưa xác nhận địa chỉ đón khách công khai; hãy xác nhận địa điểm dịch vụ với Uncornered",
      "source": "Trang liên hệ và quyên góp của Uncornered; trang cũ của College Bound Dorchester",
      "hoursNote": "Trang liên hệ hiện tại của Uncornered có email và biểu mẫu nhưng không đăng giờ tiếp khách hay địa điểm dịch vụ. Trang quyên góp ghi 218 Adams Street và PO Box 220605; một trang chính thức khác ghi 222 Bowdoin Street. Chưa địa chỉ nào được xác nhận là nơi tiếp khách. Gửi email info@uncornered.org để xác nhận địa điểm.",
      "eligibility": "Chương trình tập trung vào những người liên quan đến bạo lực đường phố; hỏi tổ chức về việc tham gia và giới thiệu.",
      "services": [
        "Nguồn hỗ trợ học tập",
        "Hỗ trợ sức khỏe tâm thần",
        "Phòng ngừa bạo lực cộng đồng"
      ]
    },
    "zh": {
      "neighborhood": "Dorchester（服务区域；尚未确认访客地点）",
      "address": "未确认公开访客地址；请向 Uncornered 确认服务地点",
      "source": "Uncornered 联系及捐赠页面；College Bound Dorchester 旧网站",
      "hoursNote": "Uncornered 当前联系页面提供邮箱和表格，但未公布访客时间或服务地址。捐赠页面列出 218 Adams Street 和 PO Box 220605，另一官方页面列出 222 Bowdoin Street；均未确认为现场服务地点。请发邮件至 info@uncornered.org 确认地点。",
      "eligibility": "项目主要面向参与街头暴力的人；请向机构询问参与及转介方式。",
      "services": [
        "教育资源",
        "心理健康支持",
        "社区暴力预防"
      ]
    },
    "ar": {
      "neighborhood": "Dorchester (منطقة الخدمة؛ لم يُؤكد موقع للزوار)",
      "address": "لم يُؤكد عنوان عام لاستقبال الزوار؛ أكّد موقع الخدمة مع Uncornered",
      "source": "صفحتا التواصل والتبرع لدى Uncornered؛ الموقع السابق لـ College Bound Dorchester",
      "hoursNote": "تتيح صفحة التواصل الحالية لدى Uncornered البريد الإلكتروني ونموذجاً، لكنها لا تنشر ساعات زيارة أو عنواناً للخدمات. تذكر صفحة التبرعات 218 Adams Street وPO Box 220605، بينما تذكر صفحة رسمية أخرى 222 Bowdoin Street؛ ولم يُؤكد أي منهما كموقع استقبال. راسل info@uncornered.org لتأكيد الموقع.",
      "eligibility": "يركز البرنامج على الأشخاص المنخرطين في عنف الشوارع؛ اسأل المنظمة عن المشاركة والإحالات.",
      "services": [
        "موارد تعليمية",
        "دعم الصحة النفسية",
        "الوقاية من العنف المجتمعي"
      ]
    },
    "so": {
      "neighborhood": "Dorchester (aagga adeegga; goob booqasho lama xaqiijin)",
      "address": "Ma jiro cinwaan dadweyne oo booqasho loo xaqiijiyey; goobta adeegga ka xaqiiji Uncornered",
      "source": "Bogagga xiriirka iyo deeqaha Uncornered; boggii hore ee College Bound Dorchester",
      "hoursNote": "Bogga xiriirka ee hadda ee Uncornered wuxuu bixiyaa iimayl iyo foom, balse ma sheego saacadaha booqashada ama goob adeeg. Bogga deeqaha wuxuu taxaa 218 Adams Street iyo PO Box 220605; bog kale oo rasmi ah wuxuu taxaa 222 Bowdoin Street. Midkoodna looma xaqiijin goob booqasho. U dir info@uncornered.org si aad u xaqiijiso goobta adeegga.",
      "eligibility": "Barnaamijku wuxuu diiradda saaraa dadka ku lug leh rabshadaha waddooyinka; hay’adda weydii ka-qaybgalka iyo gudbinta.",
      "services": [
        "Agab waxbarasho",
        "Taageerada caafimaadka maskaxda",
        "Ka hortagga rabshadaha bulshada"
      ]
    },
    "kea": {
      "neighborhood": "Dorchester (zona di servisu; lugar pa vizita ka sta konfirmadu)",
      "address": "Ka ten enderesu públiku konfirmadu pa vizita; konfirma lugar di servisu ku Uncornered",
      "source": "Pájinas di kontaktu i donason di Uncornered; situ anterior di College Bound Dorchester",
      "hoursNote": "Pájina di kontaktu atual di Uncornered ta ofrese email i formuláriu, ma ka ta publika oráriu di vizita ô enderesu di servisu. Pájina di donason ta lista 218 Adams Street i PO Box 220605; otu pájina ofisial ta lista 222 Bowdoin Street. Ninhun ka sta konfirmadu komu lugar di atendimentu. Skrebe pa info@uncornered.org pa konfirma lugar.",
      "eligibility": "Programa ta foka na pesoas envolvidu na violénsia na rua; pergunta organizason sobri partisipason i encaminhamentu.",
      "services": [
        "Rekursus edukativu",
        "Apoiu di saúdi mental",
        "Prevenson di violénsia komunitáriu"
      ]
    }
  },
  "yawkey-center-adult-ed": {
    "es": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Páginas de ESOL, equivalencia de secundaria y despensa de Catholic Charities; MBTA; geocodificador del Censo de EE. UU.",
      "hoursNote": "Las clases de ESOL se ofrecen de día y de noche. GED/ABE: lunes a viernes, 9 a. m.–3:30 p. m. La despensa: lunes a viernes, 10 a. m.–12 p. m. y 1–2 p. m. La inscripción y los horarios varían; llame al (617) 506-6600.",
      "eligibility": "El programa de inglés está abierto a adultos de 18 años o más. La educación básica y equivalencia de secundaria exige al menos 16 años y un nivel intermedio de inglés; confirma los demás requisitos.",
      "transit": "El autobús MBTA 16 para en 185 Columbia Road; comprueba las indicaciones actuales antes de viajar.",
      "services": [
        "Clases gratuitas de inglés para adultos (18 años o más)",
        "Educación básica para adultos y equivalencia de secundaria",
        "Orientación profesional para estudiantes de inglés",
        "Despensa de alimentos (horario separado)"
      ]
    },
    "ht": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Paj ESOL, ekivalans lekòl segondè ak gadmanje Catholic Charities; MBTA; jeyokodè Resansman Etazini",
      "hoursNote": "Kou ESOL yo fèt lajounen ak aswè. GED/ABE: lendi–vandredi, 9 a.m.–3:30 p.m. Gadmanje a: lendi–vandredi, 10 a.m.–12 p.m. ak 1–2 p.m. Enskripsyon ak orè yo varye; rele (617) 506-6600.",
      "eligibility": "Pwogram anglè a ouvè pou granmoun ki gen 18 an oswa plis. Edikasyon debaz ak ekivalans lekòl segondè mande omwen 16 an ak yon nivo anglè entèmedyè; konfime lòt kondisyon yo.",
      "transit": "Otobis MBTA 16 kanpe nan 185 Columbia Road; verifye direksyon aktyèl yo anvan ou vwayaje.",
      "services": [
        "Kou anglè gratis pou granmoun (18 an oswa plis)",
        "Edikasyon debaz pou granmoun ak ekivalans lekòl segondè",
        "Orientasyon karyè pou etidyan anglè",
        "Gadmanje manje (orè apa)"
      ]
    },
    "pt": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Páginas de ESOL, equivalência do ensino médio e despensa da Catholic Charities; MBTA; geocodificador do Censo dos EUA",
      "hoursNote": "As aulas de ESOL são oferecidas de dia e à noite. GED/ABE: segunda a sexta, 9h–15h30. Despensa: segunda a sexta, 10h–12h e 13h–14h. Inscrições e horários variam; ligue para (617) 506-6600.",
      "eligibility": "O programa de inglês é aberto a adultos a partir de 18 anos. A educação básica e equivalência do ensino médio exige pelo menos 16 anos e nível intermediário de inglês; confirme os demais requisitos.",
      "transit": "O ônibus MBTA 16 para em 185 Columbia Road; confira as direções atuais antes de viajar.",
      "services": [
        "Aulas gratuitas de inglês para adultos (18 anos ou mais)",
        "Educação básica para adultos e equivalência do ensino médio",
        "Orientação profissional para estudantes de inglês",
        "Despensa de alimentos (horário separado)"
      ]
    },
    "vi": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Trang ESOL, chương trình tương đương trung học và kho thực phẩm của Catholic Charities; MBTA; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Lớp ESOL có lịch ban ngày và buổi tối. GED/ABE: thứ Hai–thứ Sáu, 9 giờ sáng–3:30 chiều. Kho thực phẩm: thứ Hai–thứ Sáu, 10 giờ sáng–12 giờ trưa và 1–2 giờ chiều. Lịch học và ghi danh thay đổi; gọi (617) 506-6600.",
      "eligibility": "Chương trình tiếng Anh dành cho người từ 18 tuổi trở lên. Chương trình giáo dục cơ bản và tương đương trung học yêu cầu ít nhất 16 tuổi và trình độ tiếng Anh trung cấp; hãy xác nhận các điều kiện khác.",
      "transit": "Xe buýt MBTA số 16 dừng tại 185 Columbia Road; kiểm tra chỉ đường hiện tại trước khi đi.",
      "services": [
        "Lớp tiếng Anh miễn phí cho người lớn (từ 18 tuổi)",
        "Giáo dục cơ bản cho người lớn và chương trình tương đương trung học",
        "Hướng nghiệp cho học viên tiếng Anh",
        "Kho thực phẩm (giờ riêng)"
      ]
    },
    "zh": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Catholic Charities 的 ESOL、高中同等学历及食品发放页面；MBTA；美国人口普查局地址定位工具",
      "hoursNote": "ESOL 课程安排在白天和晚上。GED/ABE：周一至周五上午 9 点至下午 3:30。食品发放处：周一至周五上午 10 点至中午 12 点及下午 1–2 点。报名和课程时间可能变化；请致电 (617) 506-6600。",
      "eligibility": "英语项目面向年满 18 岁的成年人。成人基础教育及高中同等学历课程要求年满 16 岁并具有中级英语水平；请确认其他条件。",
      "transit": "MBTA 16 路公交在 185 Columbia Road 停靠；出行前请查看最新路线。",
      "services": [
        "免费成人英语课（年满 18 岁）",
        "成人基础教育及高中同等学历课程",
        "英语学员职业指导",
        "食品发放处（时间另行安排）"
      ]
    },
    "ar": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "صفحات تعليم الإنجليزية ومعادلة الثانوية والمخزنة الغذائية لدى Catholic Charities؛ MBTA؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تُقدم دروس ESOL نهاراً ومساءً. GED/ABE: من الاثنين إلى الجمعة، 9 صباحاً–3:30 مساءً. المخزنة: من الاثنين إلى الجمعة، 10 صباحاً–12 ظهراً و1–2 مساءً. تختلف جداول التسجيل والدروس؛ اتصل على (617) 506-6600.",
      "eligibility": "برنامج الإنجليزية متاح للبالغين من عمر 18 عاماً فأكثر. يتطلب التعليم الأساسي ومعادلة الثانوية بلوغ 16 عاماً على الأقل ومستوى متوسطاً في الإنجليزية؛ أكّد بقية الشروط.",
      "transit": "تتوقف حافلة MBTA رقم 16 عند 185 Columbia Road؛ تحقق من الاتجاهات الحالية قبل السفر.",
      "services": [
        "دروس إنجليزية مجانية للبالغين (18 عاماً فأكثر)",
        "التعليم الأساسي للبالغين ومعادلة الثانوية",
        "الإرشاد المهني لطلاب الإنجليزية",
        "مخزنة غذائية (ساعات منفصلة)"
      ]
    },
    "so": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Bogagga ESOL, u-dhiganta dugsiga sare iyo raashinka ee Catholic Charities; MBTA; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Fasallada ESOL waxaa la qabtaa maalintii iyo fiidkii. GED/ABE: Isniin–Jimce, 9 subaxnimo–3:30 galabnimo. Goobta raashinka: Isniin–Jimce, 10 subaxnimo–12 duhurnimo iyo 1–2 galabnimo. Diiwaangelinta iyo jadwalka fasalladu way kala duwan yihiin; wac (617) 506-6600.",
      "eligibility": "Barnaamijka Ingiriisigu wuxuu u furan yahay dadka 18 jir iyo ka weyn. Waxbarashada aasaasiga ah iyo u-dhiganta dugsiga sare waxay u baahan yihiin ugu yaraan 16 jir iyo heer Ingiriisi oo dhexe; xaqiiji shuruudaha kale.",
      "transit": "Baska MBTA 16 wuxuu joogsadaa 185 Columbia Road; hubi tilmaamaha hadda ka hor safarka.",
      "services": [
        "Fasallo Ingiriisi oo bilaash ah oo dadka waaweyn ah (18 jir iyo ka weyn)",
        "Waxbarashada aasaasiga ah ee dadka waaweyn iyo u-dhiganta dugsiga sare",
        "Hagidda xirfadda ee ardayda Ingiriisiga",
        "Goob raashin lagu qaybiyo (saacado gaar ah)"
      ]
    },
    "kea": {
      "neighborhood": "Dorchester",
      "operator": "Catholic Charities Boston",
      "source": "Pájinas di ESOL, ekivalénsia di segundáriu i dispensa di Catholic Charities; MBTA; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Aulas di ESOL é di dia i di noti. GED/ABE: sigunda–sesta, 9 di manhan–3:30 di tardi. Dispensa: sigunda–sesta, 10 di manhan–12 di dia i 1–2 di tardi. Inskrison i orárius ta varia; txoma (617) 506-6600.",
      "eligibility": "Programa di inglês sta abertu pa adultus di 18 anu ô mas. Edukason básiku i ekivalénsia di segundáriu ta pidi pelu menus 16 anu i nivel intermédiu di inglês; konfirma otus kondisons.",
      "transit": "Autokaru MBTA 16 ta para na 185 Columbia Road; verifika diretsons atual antis di viaja.",
      "services": [
        "Aulas grátis di inglês pa adultus (18 anu ô mas)",
        "Edukason básiku pa adultus i ekivalénsia di segundáriu",
        "Orientason di karera pa studantis di inglês",
        "Dispensa di alimentus (oráriu separadu)"
      ]
    }
  },
  "abcd-esol": {
    "es": {
      "neighborhood": "Boston (varias sedes de clases; confirme el lugar antes de ir)",
      "address": "Varias sedes de ESOL; no se confirmó una única dirección de clases sin cita",
      "operator": "Action for Boston Community Development",
      "source": "Página actual de ESOL y contacto de inscripción de ABCD",
      "hoursNote": "La página de ESOL de ABCD indica a Margaret Flynn, especialista de inscripción, en 19 Temple Place y el teléfono (508) 203-7670. Es un contacto del programa, no una sede de clases confirmada; lugares y horarios varían. Llame o solicite en línea para confirmar dónde asistir antes de ir.",
      "eligibility": "ABCD indica que las clases de ESOL son gratuitas para quienes cumplen los requisitos de residencia de Massachusetts. Consulte a la especialista de inscripción sobre la regla específica y la matrícula.",
      "services": ["Clases gratuitas de ESOL (tres niveles; se aplican requisitos de residencia)"],
    },
    "ht": {
      "neighborhood": "Boston (klas yo fèt nan plizyè lokal; konfime kote a anvan ou ale)",
      "address": "Plizyè lokal ESOL; pa gen yon sèl adrès klas san randevou ki konfime",
      "operator": "Action for Boston Community Development",
      "source": "Paj ESOL aktyèl ak kontak enskripsyon ABCD",
      "hoursNote": "Paj ESOL ABCD la bay Margaret Flynn, espesyalis enskripsyon, nan 19 Temple Place ak nimewo (508) 203-7670. Se kontak pwogram nan, se pa yon lokal klas ki konfime; kote ak orè yo varye. Rele oswa aplike sou entènèt pou konfime kote pou ale anvan ou vizite.",
      "eligibility": "ABCD di kou ESOL gratis pou moun ki ranpli kondisyon rezidans Massachusetts. Mande espesyalis enskripsyon an sou règ rezidans lan ak enskripsyon klas la.",
      "services": ["Kou ESOL gratis (twa nivo; kondisyon rezidans aplike)"],
    },
    "pt": {
      "neighborhood": "Boston (aulas em vários locais; confirme o endereço antes de ir)",
      "address": "Vários locais de ESOL; não há um endereço único de aula sem agendamento confirmado",
      "operator": "Action for Boston Community Development",
      "source": "Página atual de ESOL e contato de inscrição da ABCD",
      "hoursNote": "A página de ESOL da ABCD lista Margaret Flynn, especialista em inscrições, em 19 Temple Place e o telefone (508) 203-7670. É um contato do programa, não um local de aula confirmado; locais e horários variam. Ligue ou inscreva-se online para confirmar onde comparecer antes de ir.",
      "eligibility": "A ABCD informa que as aulas de ESOL são gratuitas para quem atende aos requisitos de residência de Massachusetts. Consulte a especialista de inscrições sobre a regra específica e a matrícula.",
      "services": ["Aulas gratuitas de ESOL (três níveis; aplicam-se requisitos de residência)"],
    },
    "vi": {
      "neighborhood": "Boston (lớp học ở nhiều nơi; xác nhận địa điểm trước khi đến)",
      "address": "Nhiều địa điểm ESOL; chưa xác nhận một địa chỉ lớp học duy nhất để đến trực tiếp",
      "operator": "Action for Boston Community Development",
      "source": "Trang ESOL hiện tại và liên hệ ghi danh của ABCD",
      "hoursNote": "Trang ESOL của ABCD ghi chuyên viên ghi danh Margaret Flynn tại 19 Temple Place và số (508) 203-7670. Đây là liên hệ của chương trình, không phải địa điểm lớp học đã xác nhận; địa điểm và lịch học thay đổi. Gọi hoặc nộp đơn trực tuyến để xác nhận nơi học trước khi đến.",
      "eligibility": "ABCD cho biết lớp ESOL miễn phí cho người đáp ứng yêu cầu cư trú tại Massachusetts. Hỏi chuyên viên ghi danh về quy định cư trú cụ thể và việc ghi danh.",
      "services": ["Lớp ESOL miễn phí (ba cấp độ; áp dụng yêu cầu cư trú)"],
    },
    "zh": {
      "neighborhood": "波士顿（课程设在多个地点；前往前请确认）",
      "address": "多个 ESOL 课堂地点；尚未确认可直接到访的统一上课地址",
      "operator": "Action for Boston Community Development",
      "source": "ABCD 当前 ESOL 课程及招生联系页面",
      "hoursNote": "ABCD 的 ESOL 页面列出招生专员 Margaret Flynn，地址为 19 Temple Place，电话 (508) 203-7670。这是项目联系人，并非已确认的课堂地点；各班地点和时间不同。前往前请致电或在线申请以确认上课地点。",
      "eligibility": "ABCD 表示，符合马萨诸塞州居住要求者可免费参加 ESOL 课程。请向招生专员询问具体居住规则和报名方式。",
      "services": ["免费 ESOL 课程（三个级别；适用居住要求）"],
    },
    "ar": {
      "neighborhood": "Boston (دروس في مواقع متعددة؛ أكّد الموقع قبل الذهاب)",
      "address": "مواقع متعددة لدروس ESOL؛ لم يُؤكد عنوان واحد للحضور إلى الصفوف",
      "operator": "Action for Boston Community Development",
      "source": "صفحة ESOL الحالية وجهة التسجيل لدى ABCD",
      "hoursNote": "تدرج صفحة ESOL لدى ABCD الأخصائية Margaret Flynn للتسجيل في 19 Temple Place، ورقم (508) 203-7670. هذا جهة اتصال للبرنامج وليس موقعاً مؤكداً للدروس؛ تختلف المواقع والجداول. اتصل أو قدّم الطلب عبر الإنترنت لتأكيد مكان الحضور قبل الزيارة.",
      "eligibility": "تذكر ABCD أن دروس ESOL مجانية لمن يستوفون شروط الإقامة في Massachusetts. اسأل أخصائية التسجيل عن شرط الإقامة المحدد والتسجيل.",
      "services": ["دروس ESOL مجانية (ثلاثة مستويات؛ تُطبق شروط الإقامة)"],
    },
    "so": {
      "neighborhood": "Boston (fasallo meelo badan; xaqiiji goobta ka hor booqashada)",
      "address": "Goobo badan oo ESOL ah; hal cinwaan oo fasal booqasho ah lama xaqiijin",
      "operator": "Action for Boston Community Development",
      "source": "Bogga ESOL ee hadda iyo xiriirka isdiiwaangelinta ABCD",
      "hoursNote": "Bogga ESOL ee ABCD wuxuu taxayaa Margaret Flynn, khabiirka diiwaangelinta, 19 Temple Place iyo (508) 203-7670. Waa xiriir barnaamij, mana aha goob fasal oo la xaqiijiyay; goobaha iyo jadwalku way kala duwan yihiin. Wac ama codso online si aad u xaqiijiso meesha fasalka ka hor booqashada.",
      "eligibility": "ABCD waxay sheegaysaa in fasallada ESOL bilaash u yihiin dadka buuxiya shuruudaha degganaanshaha Massachusetts. Khabiirka diiwaangelinta ka weydii xeerka degganaanshaha iyo isdiiwaangelinta.",
      "services": ["Fasallo ESOL oo bilaash ah (saddex heer; shuruudaha degganaanshaha waa jiraan)"],
    },
    "kea": {
      "neighborhood": "Boston (aulas na vários lugar; konfirma lugar antis di bai)",
      "address": "Vários lugar di ESOL; ka ten un enderesu úniku di aula konfirmadu pa vizita",
      "operator": "Action for Boston Community Development",
      "source": "Pájina atual di ESOL i kontaktu di inskrison di ABCD",
      "hoursNote": "Pájina di ESOL di ABCD ta lista Margaret Flynn, spesialista di inskrison, na 19 Temple Place i (508) 203-7670. Kel é kontaktu di programa, ka é lugar di aula konfirmadu; lugar i oráriu ta varia. Txoma ô kandidata online pa konfirma undi bu ta bai antis di vizita.",
      "eligibility": "ABCD ta fla ki aulas di ESOL é grátis pa pesoas ki ta kunpri rekizitus di rezidénsia di Massachusetts. Pergunta spesialista di inskrison sobri regla spesífiku i matríkula.",
      "services": ["Aulas grátis di ESOL (três nivel; rekizitus di rezidénsia ta aplika)"],
    }
  }
};
