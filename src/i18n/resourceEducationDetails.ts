import type { DetailDraft } from './resourceDetails';
import type { Language } from '@/stores/appStore';

/** Drafts require native-speaker and provider review. */
export const EDUCATION_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "st-mark-esol": {
    "es": {
      "neighborhood": "Fields Corner East (dirección de contacto; clases en varios lugares)",
      "operator": "St. Mark Community Education Program",
      "source": "Sitio de St. Mark y programa de alfabetización de adultos de la Ciudad de Boston y geocodificador del Censo de EE. UU.",
      "hoursNote": "Los lugares, horarios e inscripción varían. Consulta la página de inscripción o llama antes de asistir.",
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
      "hoursNote": "Kote, orè ak enskripsyon yo varye. Gade paj enskripsyon an oswa rele anvan ou ale.",
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
      "hoursNote": "Locais, horários e inscrições variam. Consulte a página de inscrição ou ligue antes de comparecer.",
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
      "hoursNote": "Địa điểm, lịch học và việc đăng ký thay đổi. Xem trang đăng ký hoặc gọi trước khi đến.",
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
      "hoursNote": "地点、时间和报名情况各不相同。请查看报名页面或在前往前致电。",
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
      "hoursNote": "تختلف المواقع والمواعيد والتسجيل. راجع صفحة التسجيل أو اتصل قبل الحضور.",
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
      "hoursNote": "Goobaha, jadwalka iyo diiwaangelintu way kala duwan yihiin. Eeg bogga diiwaangelinta ama wac ka hor intaadan tegin.",
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
      "hoursNote": "Lugar, oráriu i inskrison ta varia. Odja pájina di inskrison ô txoma antis di bai.",
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
      "neighborhood": "Dorchester (dirección de contacto; confirma antes de visitar)",
      "source": "Sitio de Uncornered y artículo de Dorchester Reporter de febrero de 2026",
      "hoursNote": "Usa el formulario de contacto o escribe a info@uncornered.org; confirma disponibilidad y lugares de servicio.",
      "eligibility": "El programa se centra en personas involucradas en violencia callejera; pregunta a la organización sobre participación y derivaciones.",
      "services": [
        "Recursos educativos",
        "Apoyo de salud mental",
        "Prevención de violencia comunitaria"
      ]
    },
    "ht": {
      "neighborhood": "Dorchester (adrès kontak; konfime anvan ou ale)",
      "source": "Sit Uncornered ak atik Dorchester Reporter fevriye 2026",
      "hoursNote": "Sèvi ak fòm kontak la oswa ekri info@uncornered.org; konfime disponiblite ak kote sèvis yo.",
      "eligibility": "Pwogram nan konsantre sou moun ki enplike nan vyolans nan lari; mande òganizasyon an sou patisipasyon ak referans.",
      "services": [
        "Resous edikasyon",
        "Sipò pou sante mantal",
        "Prevansyon vyolans kominotè"
      ]
    },
    "pt": {
      "neighborhood": "Dorchester (endereço de contato; confirme antes de visitar)",
      "source": "Site Uncornered e artigo do Dorchester Reporter de fevereiro de 2026",
      "hoursNote": "Use o formulário de contato ou escreva para info@uncornered.org; confirme disponibilidade e locais de atendimento.",
      "eligibility": "O programa concentra-se em pessoas envolvidas em violência nas ruas; pergunte à organização sobre participação e encaminhamentos.",
      "services": [
        "Recursos educacionais",
        "Apoio à saúde mental",
        "Prevenção da violência comunitária"
      ]
    },
    "vi": {
      "neighborhood": "Dorchester (địa chỉ liên hệ; xác nhận trước khi đến)",
      "source": "Trang Uncornered và bài Dorchester Reporter tháng 2 năm 2026",
      "hoursNote": "Dùng biểu mẫu liên hệ hoặc gửi email info@uncornered.org; xác nhận tình trạng sẵn có và nơi cung cấp dịch vụ.",
      "eligibility": "Chương trình tập trung vào những người liên quan đến bạo lực đường phố; hỏi tổ chức về việc tham gia và giới thiệu.",
      "services": [
        "Nguồn hỗ trợ học tập",
        "Hỗ trợ sức khỏe tâm thần",
        "Phòng ngừa bạo lực cộng đồng"
      ]
    },
    "zh": {
      "neighborhood": "Dorchester（联系地址；前往前请确认）",
      "source": "Uncornered 网站及 Dorchester Reporter 2026 年 2 月报道",
      "hoursNote": "使用联系表格或发送邮件至 info@uncornered.org；请确认服务供应和地点。",
      "eligibility": "项目主要面向参与街头暴力的人；请向机构询问参与及转介方式。",
      "services": [
        "教育资源",
        "心理健康支持",
        "社区暴力预防"
      ]
    },
    "ar": {
      "neighborhood": "Dorchester (عنوان للتواصل؛ أكّد قبل الزيارة)",
      "source": "موقع Uncornered ومقال Dorchester Reporter في فبراير 2026",
      "hoursNote": "استخدم نموذج التواصل أو راسل info@uncornered.org؛ أكّد توفر الخدمات ومواقعها.",
      "eligibility": "يركز البرنامج على الأشخاص المنخرطين في عنف الشوارع؛ اسأل المنظمة عن المشاركة والإحالات.",
      "services": [
        "موارد تعليمية",
        "دعم الصحة النفسية",
        "الوقاية من العنف المجتمعي"
      ]
    },
    "so": {
      "neighborhood": "Dorchester (cinwaanka xiriirka; xaqiiji ka hor booqashada)",
      "source": "Bogga Uncornered iyo maqaalka Dorchester Reporter ee Febraayo 2026",
      "hoursNote": "Isticmaal foomka xiriirka ama email u dir info@uncornered.org; xaqiiji helitaanka iyo goobaha adeegga.",
      "eligibility": "Barnaamijku wuxuu diiradda saaraa dadka ku lug leh rabshadaha waddooyinka; hay’adda weydii ka-qaybgalka iyo gudbinta.",
      "services": [
        "Agab waxbarasho",
        "Taageerada caafimaadka maskaxda",
        "Ka hortagga rabshadaha bulshada"
      ]
    },
    "kea": {
      "neighborhood": "Dorchester (enderesu di kontaktu; konfirma antis di vizita)",
      "source": "Situ di Uncornered i artigu di Dorchester Reporter di fevereru di 2026",
      "hoursNote": "Uza formuláriu di kontaktu ô skrebe pa info@uncornered.org; konfirma disponibilidadi i lugar di servisus.",
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
      "hoursNote": "Las clases de inglés se ofrecen de día y de noche; los horarios y la inscripción varían. Llama al (617) 506-6600. La despensa tiene horario separado.",
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
      "hoursNote": "Gen kou anglè lajounen ak aswè; orè ak enskripsyon varye. Rele (617) 506-6600. Gadmanje a gen yon orè apa.",
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
      "hoursNote": "As aulas de inglês são oferecidas de dia e à noite; horários e inscrições variam. Ligue para (617) 506-6600. A despensa tem horário separado.",
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
      "hoursNote": "Lớp tiếng Anh được tổ chức ban ngày và buổi tối; lịch và việc đăng ký thay đổi. Gọi (617) 506-6600. Kho thực phẩm có giờ riêng.",
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
      "hoursNote": "英语课有日间和晚间课程；时间和报名情况会变化。请致电 (617) 506-6600。食品发放处的时间另行安排。",
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
      "hoursNote": "تُقدم دروس الإنجليزية نهاراً ومساءً؛ تختلف المواعيد والتسجيل. اتصل على (617) 506-6600. للمخزنة الغذائية ساعات منفصلة.",
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
      "hoursNote": "Fasallada Ingiriisiga waxaa la qabtaa maalintii iyo fiidkii; jadwalka iyo diiwaangelintu way kala duwan yihiin. Wac (617) 506-6600. Goobta raashinku waxay leedahay saacado gaar ah.",
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
      "hoursNote": "Aulas di inglês ten di dia i di noti; oráriu i inskrison ta varia. Txoma (617) 506-6600. Dispensa ten oráriu separadu.",
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
      "neighborhood": "Centro de Boston (oficina central; servicios en varios lugares)",
      "operator": "Action for Boston Community Development",
      "source": "Páginas de ESOL y oficina central de ABCD",
      "hoursNote": "Los lugares, horarios e inscripciones varían. Llama al (617) 348-6000 o usa la solicitud de ESOL de ABCD antes de visitar.",
      "eligibility": "Las clases de ESOL son gratuitas para residentes de Massachusetts que cumplan los requisitos. Pregunta a ABCD por las condiciones de cada programa.",
      "services": [
        "Clases de inglés (ESOL)",
        "Preparación educativa y profesional",
        "Empleo juvenil SummerWorks",
        "Ayuda para calefacción"
      ]
    },
    "ht": {
      "neighborhood": "Anba lavil Boston (biwo santral; sèvis nan plizyè kote)",
      "operator": "Action for Boston Community Development",
      "source": "Paj ESOL ak biwo santral ABCD",
      "hoursNote": "Kote, orè ak enskripsyon yo varye. Rele (617) 348-6000 oswa sèvi ak aplikasyon ESOL ABCD anvan ou ale.",
      "eligibility": "Kou ESOL gratis pou rezidan Massachusetts ki kalifye. Mande ABCD sou kondisyon chak pwogram.",
      "services": [
        "Kou anglè (ESOL)",
        "Preparasyon edikasyon ak karyè",
        "Travay pou jèn SummerWorks",
        "Èd pou chofaj"
      ]
    },
    "pt": {
      "neighborhood": "Centro de Boston (escritório central; serviços em vários locais)",
      "operator": "Action for Boston Community Development",
      "source": "Páginas de ESOL e escritório central da ABCD",
      "hoursNote": "Locais, horários e inscrições variam. Ligue para (617) 348-6000 ou use a inscrição de ESOL da ABCD antes de visitar.",
      "eligibility": "As aulas de ESOL são gratuitas para residentes elegíveis de Massachusetts. Pergunte à ABCD sobre os requisitos de cada programa.",
      "services": [
        "Aulas de inglês (ESOL)",
        "Preparação educacional e profissional",
        "Emprego juvenil SummerWorks",
        "Auxílio para aquecimento"
      ]
    },
    "vi": {
      "neighborhood": "Trung tâm Boston (văn phòng trung tâm; dịch vụ ở nhiều nơi)",
      "operator": "Action for Boston Community Development",
      "source": "Trang ESOL và văn phòng trung tâm của ABCD",
      "hoursNote": "Địa điểm, lịch và việc đăng ký khác nhau. Gọi (617) 348-6000 hoặc dùng đơn đăng ký ESOL của ABCD trước khi đến.",
      "eligibility": "Lớp ESOL miễn phí cho cư dân Massachusetts đủ điều kiện. Hỏi ABCD về yêu cầu của từng chương trình.",
      "services": [
        "Lớp tiếng Anh (ESOL)",
        "Chuẩn bị học tập và nghề nghiệp",
        "Việc làm cho thanh thiếu niên SummerWorks",
        "Hỗ trợ chi phí sưởi ấm"
      ]
    },
    "zh": {
      "neighborhood": "波士顿市中心（中央办公室；服务在多个地点）",
      "operator": "Action for Boston Community Development",
      "source": "ABCD 的 ESOL 及中央办公室页面",
      "hoursNote": "地点、时间和报名情况各不相同。前往前请致电 (617) 348-6000 或使用 ABCD 的 ESOL 申请表。",
      "eligibility": "符合条件的马萨诸塞州居民可免费上 ESOL 课程。请向 ABCD 询问各项目的具体要求。",
      "services": [
        "英语课程（ESOL）",
        "教育和职业准备",
        "SummerWorks 青年就业",
        "取暖费用援助"
      ]
    },
    "ar": {
      "neighborhood": "وسط بوسطن (المكتب المركزي؛ الخدمات في مواقع متعددة)",
      "operator": "Action for Boston Community Development",
      "source": "صفحتا تعليم الإنجليزية والمكتب المركزي لدى ABCD",
      "hoursNote": "تختلف المواقع والمواعيد والتسجيل. اتصل على (617) 348-6000 أو استخدم طلب ESOL لدى ABCD قبل الزيارة.",
      "eligibility": "دروس ESOL مجانية لسكان ماساتشوستس المؤهلين. اسأل ABCD عن شروط كل برنامج.",
      "services": [
        "دروس الإنجليزية (ESOL)",
        "التحضير للتعليم والعمل",
        "توظيف الشباب SummerWorks",
        "المساعدة في تكاليف التدفئة"
      ]
    },
    "so": {
      "neighborhood": "Bartamaha Boston (xafiiska dhexe; adeegyo meelo kala duwan)",
      "operator": "Action for Boston Community Development",
      "source": "Bogagga ESOL iyo xafiiska dhexe ee ABCD",
      "hoursNote": "Goobaha, jadwalka iyo diiwaangelintu way kala duwan yihiin. Wac (617) 348-6000 ama isticmaal codsiga ESOL ee ABCD ka hor booqashada.",
      "eligibility": "Fasallada ESOL waa bilaash dadka Massachusetts deggan ee u qalma. ABCD weydii shuruudaha barnaamij kasta.",
      "services": [
        "Fasallada Ingiriisiga (ESOL)",
        "Diyaarinta waxbarashada iyo xirfadda",
        "Shaqada dhallinyarada ee SummerWorks",
        "Caawinta kuleylka"
      ]
    },
    "kea": {
      "neighborhood": "Sentru di Boston (skritóriu sentral; servisus na vários lugar)",
      "operator": "Action for Boston Community Development",
      "source": "Pájinas di ESOL i skritóriu sentral di ABCD",
      "hoursNote": "Lugar, oráriu i inskrison ta varia. Txoma (617) 348-6000 ô uza kandidatura ESOL di ABCD antis di vizita.",
      "eligibility": "Aulas di ESOL é grátis pa rezidentis elegível di Massachusetts. Pergunta ABCD sobri kondisons di kada programa.",
      "services": [
        "Aulas di inglês (ESOL)",
        "Preparason edukativu i profisional",
        "Empregu juvenil SummerWorks",
        "Ajudu pa akesimentu"
      ]
    }
  }
};
