import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted first drafts; verify with the provider and native speakers. */
export const IMMIGRANT_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "somali-development-center": {
    "es": {
      "neighborhood": "Roxbury (atiende a Dorchester)",
      "hoursNote": "El horario de la oficina y de los programas varía; llame al (617) 522-0700 para confirmar antes de ir.",
      "eligibility": "Los programas se centran en inmigrantes y refugiados; los requisitos, costos y disponibilidad varían. Consulte al centro.",
      "transit": "Consulte las indicaciones actuales de MBTA para llegar a 10 Malcolm X Boulevard; llame para confirmar el acceso antes de ir.",
      "source": "sdcboston.org; lista de ayuda legal de inmigración de mass.gov; dirección en MapQuest",
      "services": [
        "Clases de ESOL para adultos",
        "Empleo y preparación para el trabajo",
        "Recursos para la estabilidad de vivienda",
        "Ayuda básica de inmigración y ciudadanía",
        "Apoyo para personas mayores",
        "Interpretación y traducción (confirme disponibilidad)"
      ],
      "address": "10 Malcolm X Boulevard, segundo piso, Roxbury, MA 02119"
    },
    "ht": {
      "neighborhood": "Roxbury (sèvi Dorchester)",
      "hoursNote": "Lè biwo a ak orè pwogram yo varye; rele (617) 522-0700 pou konfime anvan ou ale.",
      "eligibility": "Pwogram yo konsantre sou imigran ak refijye; kondisyon, depans ak disponiblite varye. Mande sant lan.",
      "transit": "Tcheke direksyon MBTA ki ajou pou 10 Malcolm X Boulevard; rele pou konfime aksè anvan ou ale.",
      "source": "sdcboston.org; lis referans èd legal imigrasyon mass.gov; adrès sou MapQuest",
      "services": [
        "Klas ESOL pou granmoun",
        "Travay ak preparasyon pou travay",
        "Resous pou estabilite lojman",
        "Èd debaz pou imigrasyon ak sitwayènte",
        "Sipò pou granmoun aje",
        "Entèpretasyon ak tradiksyon (konfime disponiblite)"
      ],
      "address": "10 Malcolm X Boulevard, 2yèm etaj, Roxbury, MA 02119"
    },
    "pt": {
      "neighborhood": "Roxbury (atende Dorchester)",
      "hoursNote": "Os horários do escritório e dos programas variam; ligue para (617) 522-0700 para confirmar antes de ir.",
      "eligibility": "Os programas têm foco em imigrantes e refugiados; requisitos, custos e disponibilidade variam. Pergunte ao centro.",
      "transit": "Consulte as rotas atuais da MBTA para 10 Malcolm X Boulevard; ligue para confirmar o acesso antes de ir.",
      "source": "sdcboston.org; lista de assistência jurídica de imigração do mass.gov; endereço no MapQuest",
      "services": [
        "Aulas de ESOL para adultos",
        "Emprego e preparação para o trabalho",
        "Recursos para estabilidade de moradia",
        "Ajuda básica com imigração e cidadania",
        "Apoio a pessoas idosas",
        "Interpretação e tradução (confirme a disponibilidade)"
      ],
      "address": "10 Malcolm X Boulevard, 2º andar, Roxbury, MA 02119"
    },
    "vi": {
      "neighborhood": "Roxbury (phục vụ Dorchester)",
      "hoursNote": "Giờ văn phòng và lịch chương trình khác nhau; gọi (617) 522-0700 để xác nhận trước khi đến.",
      "eligibility": "Các chương trình tập trung vào người nhập cư và người tị nạn; điều kiện, chi phí và tình trạng sẵn có khác nhau. Hãy hỏi trung tâm.",
      "transit": "Kiểm tra chỉ dẫn MBTA hiện tại đến 10 Malcolm X Boulevard; gọi xác nhận lối tiếp cận trước khi đến.",
      "source": "sdcboston.org; danh sách giới thiệu trợ giúp pháp lý nhập cư của mass.gov; địa chỉ trên MapQuest",
      "services": [
        "Lớp ESOL cho người lớn",
        "Việc làm và chuẩn bị đi làm",
        "Nguồn hỗ trợ ổn định nhà ở",
        "Hỗ trợ cơ bản về nhập cư và quốc tịch",
        "Hỗ trợ người cao tuổi",
        "Phiên dịch và biên dịch (xác nhận tình trạng sẵn có)"
      ],
      "address": "10 Malcolm X Boulevard, tầng 2, Roxbury, MA 02119"
    },
    "zh": {
      "neighborhood": "Roxbury（服务 Dorchester）",
      "hoursNote": "办公室和项目时间各异；前往前请致电 (617) 522-0700 确认。",
      "eligibility": "项目主要服务移民和难民；资格、费用及供应情况各异。请咨询中心。",
      "transit": "请查看 MBTA 前往 10 Malcolm X Boulevard 的最新路线；前往前致电确认出入条件。",
      "source": "sdcboston.org；mass.gov 移民法律援助转介名单；MapQuest 地址",
      "services": [
        "成人 ESOL 课程",
        "就业和求职准备",
        "住房稳定资源",
        "基本移民和公民入籍帮助",
        "长者支持",
        "口译和笔译（请确认是否提供）"
      ],
      "address": "10 Malcolm X Boulevard，2楼，Roxbury, MA 02119"
    },
    "ar": {
      "neighborhood": "Roxbury (تخدم Dorchester)",
      "hoursNote": "تختلف ساعات المكتب ومواعيد البرامج؛ اتصل على (617) 522-0700 للتأكد قبل الزيارة.",
      "eligibility": "تركز البرامج على المهاجرين واللاجئين؛ تختلف الأهلية والتكاليف والتوفر. اسأل المركز.",
      "transit": "تحقق من اتجاهات MBTA الحالية إلى 10 Malcolm X Boulevard؛ اتصل لتأكيد إمكانية الوصول قبل الزيارة.",
      "source": "sdcboston.org؛ قائمة mass.gov لإحالات المساعدة القانونية للهجرة؛ العنوان على MapQuest",
      "services": [
        "دروس ESOL للبالغين",
        "التوظيف والاستعداد للعمل",
        "موارد استقرار السكن",
        "مساعدة أساسية في الهجرة والجنسية",
        "دعم كبار السن",
        "الترجمة الشفوية والتحريرية (تأكد من التوفر)"
      ],
      "address": "10 Malcolm X Boulevard، الطابق الثاني، Roxbury, MA 02119"
    },
    "so": {
      "neighborhood": "Roxbury (u adeegta Dorchester)",
      "hoursNote": "Saacadaha xafiiska iyo jadwalka barnaamijyadu way kala duwan yihiin; wac (617) 522-0700 si aad u xaqiijiso ka hor booqashada.",
      "eligibility": "Barnaamijyadu waxay diiradda saaraan soo-galootiga iyo qaxootiga; shuruudaha, kharashka iyo helitaanku way kala duwan yihiin. Weydii xarunta.",
      "transit": "Hubi tilmaamaha MBTA ee hadda jira ee 10 Malcolm X Boulevard; wac si aad u xaqiijiso gelitaanka ka hor booqashada.",
      "source": "sdcboston.org; liiska gudbinta caawinta sharci ee socdaalka ee mass.gov; cinwaanka MapQuest",
      "services": [
        "Fasallada ESOL ee dadka waaweyn",
        "Shaqo iyo diyaar-garow shaqo",
        "Ilaha xasilloonida hoyga",
        "Caawimaad aasaasi ah oo socdaal iyo dhalasho",
        "Taageerada waayeelka",
        "Turjumaan af iyo qoraal (xaqiiji helitaanka)"
      ],
      "address": "10 Malcolm X Boulevard, dabaqa 2aad, Roxbury, MA 02119"
    },
    "kea": {
      "neighborhood": "Roxbury (ta serbi Dorchester)",
      "hoursNote": "Orárius di skritóriu i di programas ta varia; txoma (617) 522-0700 pa konfirma antis di bai.",
      "eligibility": "Programas ta foka na imigrantis i refujiadus; rekizitus, kustus i disponibilidadi ta varia. Purgunta sentru.",
      "transit": "Konsulta indikasons atual di MBTA pa 10 Malcolm X Boulevard; txoma pa konfirma asesu antis di bai.",
      "source": "sdcboston.org; lista di inkaminhamentu pa ajuda jurídiku di imigrason di mass.gov; morada na MapQuest",
      "services": [
        "Aulas di ESOL pa adultus",
        "Enpregu i preparason pa trabadju",
        "Rekursus pa stabilidadi di abitason",
        "Ajuda báziku di imigrason i sidadania",
        "Apoiu pa pesoas idozu",
        "Interpretason i traduson (konfirma disponibilidadi)"
      ],
      "address": "10 Malcolm X Boulevard, 2º andar, Roxbury, MA 02119"
    }
  },
  "vietaid": {
    "es": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, oficina E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Los horarios de oficina, del centro y de los programas son diferentes; llame al (617) 822-3717 antes de ir.",
      "eligibility": "Los programas tienen diferentes requisitos de edad, inscripción y costos. Pregunte a VietAID antes de solicitar o visitar.",
      "transit": "Línea Roja hasta Fields Corner; confirme la ruta y la accesibilidad actuales antes de viajar.",
      "source": "Páginas de programas y asesoría de vivienda de vietaid.org; dirección en MapQuest",
      "services": [
        "Programa diurno para personas mayores",
        "Preescolar (costos y requisitos varían)",
        "Programas después de clases y liderazgo juvenil",
        "Asesoría de vivienda y educación para compradores primerizos",
        "Desarrollo de vivienda asequible",
        "Alquiler de salón comunitario (disponibilidad y requisitos varían)"
      ],
      "operator": "Iniciativa Vietnamita Estadounidense para el Desarrollo (VietAID)"
    },
    "ht": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, biwo E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Orè biwo a, sant lan ak pwogram yo diferan; rele (617) 822-3717 anvan ou ale.",
      "eligibility": "Pwogram yo gen kondisyon diferan pou laj, enskripsyon ak depans. Mande VietAID anvan ou aplike oswa ou vizite.",
      "transit": "Liy Wouj pou Fields Corner; konfime wout ak aksè ki ajou anvan ou vwayaje.",
      "source": "Paj pwogram ak konsèy lojman vietaid.org; adrès sou MapQuest",
      "services": [
        "Pwogram jounen pou granmoun aje",
        "Lekòl matènèl (pri ak kondisyon varye)",
        "Pwogram apre lekòl ak lidèchip pou jèn",
        "Konsèy lojman ak fòmasyon pou premye achtè kay",
        "Devlopman lojman abòdab",
        "Lokasyon sal kominotè (disponiblite ak kondisyon varye)"
      ],
      "operator": "Inisyativ Vyetnamyen-Ameriken pou Devlopman (VietAID)"
    },
    "pt": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, sala E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Os horários do escritório, do centro e dos programas são diferentes; ligue para (617) 822-3717 antes de ir.",
      "eligibility": "Os programas têm requisitos diferentes de idade, inscrição e custos. Pergunte à VietAID antes de se inscrever ou visitar.",
      "transit": "Linha Vermelha até Fields Corner; confirme a rota e a acessibilidade atuais antes de viajar.",
      "source": "Páginas de programas e orientação habitacional de vietaid.org; endereço no MapQuest",
      "services": [
        "Programa diurno para pessoas idosas",
        "Pré-escola (custos e requisitos variam)",
        "Programas extracurriculares e liderança juvenil",
        "Orientação habitacional e educação para quem compra o primeiro imóvel",
        "Desenvolvimento de moradia acessível",
        "Aluguel de salão comunitário (disponibilidade e requisitos variam)"
      ],
      "operator": "Iniciativa Vietnamita Americana para o Desenvolvimento (VietAID)"
    },
    "vi": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, phòng E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Giờ văn phòng, trung tâm và chương trình khác nhau; gọi (617) 822-3717 trước khi đến.",
      "eligibility": "Mỗi chương trình có yêu cầu khác nhau về tuổi, ghi danh và chi phí. Hãy hỏi VietAID trước khi đăng ký hoặc đến.",
      "transit": "Tuyến Đỏ đến Fields Corner; xác nhận tuyến đường và điều kiện tiếp cận hiện tại trước khi đi.",
      "source": "Các trang chương trình và tư vấn nhà ở của vietaid.org; địa chỉ trên MapQuest",
      "services": [
        "Chương trình ban ngày cho người cao tuổi",
        "Trường mẫu giáo (chi phí và điều kiện khác nhau)",
        "Chương trình sau giờ học và lãnh đạo thanh thiếu niên",
        "Tư vấn nhà ở và giáo dục cho người mua nhà lần đầu",
        "Phát triển nhà ở giá phải chăng",
        "Thuê hội trường cộng đồng (tình trạng sẵn có và điều kiện khác nhau)"
      ],
      "operator": "Cơ quan Phát triển Cộng đồng Việt Mỹ (VietAID)"
    },
    "zh": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street，E室（Suite E），Dorchester, MA 02122",
      "hoursNote": "办公室、中心及各项目的时间不同；前往前请致电 (617) 822-3717。",
      "eligibility": "各项目的年龄、报名和费用要求不同。申请或前往前请咨询 VietAID。",
      "transit": "乘红线到 Fields Corner；出行前请确认当前路线及无障碍情况。",
      "source": "vietaid.org 项目及住房咨询页面；MapQuest 地址",
      "services": [
        "长者日间项目",
        "学前教育（费用和条件各异）",
        "课后及青少年领导力项目",
        "住房咨询和首次购房者教育",
        "可负担住房开发",
        "社区大厅租赁（供应情况和条件各异）"
      ],
      "operator": "越裔美国人发展倡议（VietAID）"
    },
    "ar": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street، المكتب E (Suite E)، Dorchester, MA 02122",
      "hoursNote": "تختلف ساعات المكتب والمركز والبرامج؛ اتصل على (617) 822-3717 قبل الزيارة.",
      "eligibility": "تختلف شروط العمر والتسجيل والتكاليف بين البرامج. اسأل VietAID قبل التقديم أو الزيارة.",
      "transit": "الخط الأحمر إلى Fields Corner؛ تأكد من المسار وإمكانية الوصول الحالية قبل السفر.",
      "source": "صفحات البرامج وإرشاد السكن في vietaid.org؛ العنوان على MapQuest",
      "services": [
        "برنامج نهاري لكبار السن",
        "مرحلة ما قبل المدرسة (تختلف التكاليف والشروط)",
        "برامج ما بعد المدرسة وقيادة الشباب",
        "إرشاد السكن وتعليم مشتري المنازل لأول مرة",
        "تطوير مساكن ميسورة التكلفة",
        "تأجير قاعة مجتمعية (يختلف التوفر والشروط)"
      ],
      "operator": "المبادرة الأمريكية الفيتنامية للتنمية (VietAID)"
    },
    "so": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, xafiiska E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Saacadaha xafiiska, xarunta iyo barnaamijyadu way kala duwan yihiin; wac (617) 822-3717 ka hor booqashada.",
      "eligibility": "Barnaamijyadu waxay leeyihiin shuruudo da’, isdiiwaangelin iyo kharash oo kala duwan. Weydii VietAID ka hor codsiga ama booqashada.",
      "transit": "Khadka Cas ilaa Fields Corner; xaqiiji jidka iyo helitaanka hadda jira ka hor safarka.",
      "source": "Bogagga barnaamijyada iyo la-talinta guryaha ee vietaid.org; cinwaanka MapQuest",
      "services": [
        "Barnaamij maalmeedka waayeelka",
        "Dugsi-hore (kharashka iyo shuruuduhu way kala duwan yihiin)",
        "Barnaamijyada dugsiga ka dib iyo hoggaaminta dhallinyarada",
        "La-talin guri iyo waxbarasho iibsadayaasha ugu horreeya",
        "Horumarinta guryo la awoodi karo",
        "Kirada hoolka bulshada (helitaanka iyo shuruuduhu way kala duwan yihiin)"
      ],
      "operator": "Hindisaha Horumarinta Vietnamiga Ameerikaanka (VietAID)"
    },
    "kea": {
      "neighborhood": "Fields Corner",
      "address": "42 Charles Street, sala E (Suite E), Dorchester, MA 02122",
      "hoursNote": "Orárius di skritóriu, sentru i programas é diferenti; txoma (617) 822-3717 antis di bai.",
      "eligibility": "Programas ten rekizitus diferenti di idadi, inskrison i kustus. Purgunta VietAID antis di kandidata ô vizita.",
      "transit": "Linha Vermelhu pa Fields Corner; konfirma rotas i asesu atual antis di viaja.",
      "source": "Pájinas di programas i orientason di abitason di vietaid.org; morada na MapQuest",
      "services": [
        "Programa di dia pa idozus",
        "Pré-skola (kustus i rekizitus ta varia)",
        "Programas dipôs di skola i lideransa juvenil",
        "Orientason di abitason i edukason pa ken ta konpra kasa pa primeru bês",
        "Dezenvolvimentu di abitason asesível",
        "Aluger di salon komunitáriu (disponibilidadi i rekizitus ta varia)"
      ],
      "operator": "Inisiativa Viyetnamita Merikanu pa Dezenvolvimentu (VietAID)"
    }
  }
};
