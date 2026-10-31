import type { DetailDraft } from './resourceDetails';
import type { Language } from '@/stores/appStore';

/** Drafts require native-speaker and provider review. */
export const COMMUNITY_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "work-inc-dorchester": {
    "es": {
      "neighborhood": "Fields Corner East",
      "source": "Páginas de sedes, empleo y apoyo familiar de WORK Inc.; geocodificador del Censo de EE. UU.",
      "hoursNote": "Los horarios y las citas varían según el servicio. Llama al (617) 691-1500 antes de visitar.",
      "eligibility": "Los requisitos y las derivaciones varían según el programa; llama para consultar.",
      "services": [
        "Orientación profesional y búsqueda de empleo",
        "Colocación laboral y apoyo continuo",
        "Apoyo familiar y orientación sobre beneficios (requisitos variables)"
      ]
    },
    "ht": {
      "neighborhood": "Fields Corner East",
      "source": "Paj biwo, travay ak sipò fanmi WORK Inc.; jeyokodè Resansman Etazini",
      "hoursNote": "Orè ak randevou yo varye selon sèvis la. Rele (617) 691-1500 anvan ou ale.",
      "eligibility": "Kondisyon ak referans yo varye selon pwogram nan; rele pou mande.",
      "services": [
        "Planifikasyon karyè ak rechèch travay",
        "Plasman nan travay ak sipò kontinyèl",
        "Sipò fanmi ak orientasyon sou benefis (kondisyon yo varye)"
      ]
    },
    "pt": {
      "neighborhood": "Fields Corner East",
      "source": "Páginas de sedes, emprego e apoio familiar da WORK Inc.; geocodificador do Censo dos EUA",
      "hoursNote": "Horários e agendamentos variam por serviço. Ligue para (617) 691-1500 antes de visitar.",
      "eligibility": "Requisitos e encaminhamentos variam por programa; ligue para perguntar.",
      "services": [
        "Planejamento de carreira e busca de emprego",
        "Colocação profissional e apoio contínuo",
        "Apoio familiar e orientação sobre benefícios (requisitos variam)"
      ]
    },
    "vi": {
      "neighborhood": "Fields Corner East",
      "source": "Trang địa điểm, việc làm và hỗ trợ gia đình của WORK Inc.; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Giờ và lịch hẹn khác nhau theo dịch vụ. Gọi (617) 691-1500 trước khi đến.",
      "eligibility": "Điều kiện và yêu cầu giới thiệu khác nhau theo chương trình; hãy gọi để hỏi.",
      "services": [
        "Lập kế hoạch nghề nghiệp và tìm việc",
        "Giới thiệu việc làm và hỗ trợ liên tục",
        "Hỗ trợ gia đình và hướng dẫn về trợ cấp (điều kiện khác nhau)"
      ]
    },
    "zh": {
      "neighborhood": "Fields Corner East",
      "source": "WORK Inc. 办公地点、就业及家庭支持页面；美国人口普查局地址定位工具",
      "hoursNote": "时间和预约要求因服务而异。前往前请致电 (617) 691-1500。",
      "eligibility": "资格和转介要求因项目而异；请致电询问。",
      "services": [
        "职业规划与求职",
        "就业安置和持续支持",
        "家庭支持与福利指导（条件因项目而异）"
      ]
    },
    "ar": {
      "neighborhood": "Fields Corner East",
      "source": "صفحات المكاتب والتوظيف ودعم الأسرة لدى WORK Inc.؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تختلف الساعات والمواعيد حسب الخدمة. اتصل على (617) 691-1500 قبل الزيارة.",
      "eligibility": "تختلف شروط الأهلية والإحالة حسب البرنامج؛ اتصل للاستفسار.",
      "services": [
        "التخطيط المهني والبحث عن عمل",
        "المساعدة في الحصول على عمل والدعم المستمر",
        "دعم الأسرة والإرشاد بشأن المنافع (تختلف الشروط)"
      ]
    },
    "so": {
      "neighborhood": "Fields Corner East",
      "source": "Bogagga goobaha, shaqada iyo taageerada qoyska ee WORK Inc.; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Saacadaha iyo ballamuhu waxay ku kala duwan yihiin adeegyada. Wac (617) 691-1500 ka hor booqashada.",
      "eligibility": "Shuruudaha iyo gudbintu waxay ku kala duwan yihiin barnaamijyada; wac si aad u weydiiso.",
      "services": [
        "Qorshaynta xirfadda iyo shaqo raadinta",
        "Shaqo meelayn iyo taageero joogto ah",
        "Taageerada qoyska iyo hagidda dheefaha (shuruuduhu way kala duwan yihiin)"
      ]
    },
    "kea": {
      "neighborhood": "Fields Corner East",
      "source": "Pájinas di sedis, empregu i apoiu familiar di WORK Inc.; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Orárius i markasons ta varia konformi servisu. Txoma (617) 691-1500 antis di vizita.",
      "eligibility": "Kondisons i encaminhamentus ta varia konformi programa; txoma pa pergunta.",
      "services": [
        "Planeamentu di karera i buska di empregu",
        "Kolokason na trabadju i apoiu kontinuu",
        "Apoiu familiar i orientason sobri benefísius (kondisons ta varia)"
      ]
    }
  },
  "dotbdc": {
    "es": {
      "neighborhood": "Uphams Corner",
      "source": "Páginas de contacto y programas de Dorchester Bay EDC; geocodificador del Censo de EE. UU.",
      "hoursNote": "Sin cita de martes a jueves; lunes y viernes con cita. Llama al (617) 825-4200 para confirmar las horas.",
      "services": [
        "Desarrollo de vivienda asequible",
        "Préstamos y asistencia técnica para pequeñas empresas",
        "Clases de tecnología",
        "Programas laborales para jóvenes",
        "Organización comunitaria"
      ],
      "address": "594 Columbia Road, oficina 302, Dorchester, MA 02125"
    },
    "ht": {
      "neighborhood": "Uphams Corner",
      "source": "Paj kontak ak pwogram Dorchester Bay EDC; jeyokodè Resansman Etazini",
      "hoursNote": "San randevou madi–jedi; lendi ak vandredi sou randevou. Rele (617) 825-4200 pou konfime lè yo.",
      "services": [
        "Devlopman lojman abòdab",
        "Prè ak èd teknik pou ti biznis",
        "Kou teknoloji",
        "Pwogram travay pou jèn",
        "Òganizasyon kominotè"
      ],
      "address": "594 Columbia Road, biwo 302, Dorchester, MA 02125"
    },
    "pt": {
      "neighborhood": "Uphams Corner",
      "source": "Páginas de contato e programas da Dorchester Bay EDC; geocodificador do Censo dos EUA",
      "hoursNote": "Atendimento sem agendamento de terça a quinta; segunda e sexta com agendamento. Ligue para (617) 825-4200 para confirmar os horários.",
      "services": [
        "Desenvolvimento de moradia acessível",
        "Empréstimos e assistência técnica para pequenos negócios",
        "Aulas de tecnologia",
        "Programas de trabalho para jovens",
        "Organização comunitária"
      ],
      "address": "594 Columbia Road, sala 302, Dorchester, MA 02125"
    },
    "vi": {
      "neighborhood": "Uphams Corner",
      "source": "Trang liên hệ và chương trình của Dorchester Bay EDC; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Không cần hẹn từ thứ Ba đến thứ Năm; thứ Hai và thứ Sáu cần hẹn. Gọi (617) 825-4200 để xác nhận giờ.",
      "services": [
        "Phát triển nhà ở giá phải chăng",
        "Cho vay và hỗ trợ kỹ thuật cho doanh nghiệp nhỏ",
        "Lớp công nghệ",
        "Chương trình việc làm cho thanh thiếu niên",
        "Tổ chức cộng đồng"
      ],
      "address": "594 Columbia Road, phòng 302, Dorchester, MA 02125"
    },
    "zh": {
      "neighborhood": "Uphams Corner",
      "source": "Dorchester Bay EDC 联系和项目页面；美国人口普查局地址定位工具",
      "hoursNote": "周二至周四可直接到访；周一和周五需预约。请致电 (617) 825-4200 确认时间。",
      "services": [
        "可负担住房开发",
        "小企业贷款和技术协助",
        "科技课程",
        "青年就业项目",
        "社区组织工作"
      ],
      "address": "594 Columbia Road，302 室，Dorchester, MA 02125"
    },
    "ar": {
      "neighborhood": "Uphams Corner",
      "source": "صفحات الاتصال والبرامج لدى Dorchester Bay EDC؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "زيارة دون موعد من الثلاثاء إلى الخميس؛ الاثنين والجمعة بموعد. اتصل على (617) 825-4200 لتأكيد الساعات.",
      "services": [
        "تطوير الإسكان الميسور",
        "إقراض المشروعات الصغيرة والمساعدة الفنية",
        "دروس التكنولوجيا",
        "برامج عمل للشباب",
        "التنظيم المجتمعي"
      ],
      "address": "594 Columbia Road، الجناح 302، Dorchester, MA 02125"
    },
    "so": {
      "neighborhood": "Uphams Corner",
      "source": "Bogagga xiriirka iyo barnaamijyada Dorchester Bay EDC; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Ballan la’aan Talaado–Khamiis; Isniin iyo Jimce waa ballan. Wac (617) 825-4200 si aad u xaqiijiso saacadaha.",
      "services": [
        "Horumarinta guryaha la awoodi karo",
        "Amaah iyo caawimo farsamo oo ganacsiyada yaryar",
        "Fasallo tiknoolajiyad",
        "Barnaamijyada shaqada dhallinyarada",
        "Abaabulka bulshada"
      ],
      "address": "594 Columbia Road, xafiiska 302, Dorchester, MA 02125"
    },
    "kea": {
      "neighborhood": "Uphams Corner",
      "source": "Pájinas di kontaktu i programas di Dorchester Bay EDC; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Sen markason di tersa a kinta; sigunda i sesta ku markason. Txoma (617) 825-4200 pa konfirma oráriu.",
      "services": [
        "Dezenvolvimentu di abitason asesível",
        "Empréstimus i ajudu tékniku pa pikinus negósius",
        "Aulas di teknologia",
        "Programas di trabadju pa jovens",
        "Organizason komunitáriu"
      ],
      "address": "594 Columbia Road, sala 302, Dorchester, MA 02125"
    }
  },
  "fields-corner-main-street": {
    "es": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street y Ciudad de Boston; geocodificador del Censo de EE. UU.",
      "hoursNote": "El horario varía; llama al (617) 474-1432 o escribe a info@fieldscorner.org antes de visitar.",
      "services": [
        "Asistencia a pequeñas empresas",
        "Apoyo para mejorar fachadas comerciales",
        "Eventos comunitarios",
        "Promoción del distrito"
      ],
      "address": "1444 Dorchester Avenue, 2.º piso, Dorchester, MA 02122"
    },
    "ht": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street ak Vil Boston; jeyokodè Resansman Etazini",
      "hoursNote": "Orè a varye; rele (617) 474-1432 oswa ekri info@fieldscorner.org anvan ou ale.",
      "services": [
        "Èd pou ti biznis",
        "Sipò pou amelyore fasad magazen",
        "Evènman kominotè",
        "Pwomosyon distri a"
      ],
      "address": "1444 Dorchester Avenue, 2yèm etaj, Dorchester, MA 02122"
    },
    "pt": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street e Cidade de Boston; geocodificador do Censo dos EUA",
      "hoursNote": "O horário varia; ligue para (617) 474-1432 ou escreva para info@fieldscorner.org antes de visitar.",
      "services": [
        "Assistência a pequenos negócios",
        "Apoio à melhoria de fachadas comerciais",
        "Eventos comunitários",
        "Promoção do distrito"
      ],
      "address": "1444 Dorchester Avenue, 2º andar, Dorchester, MA 02122"
    },
    "vi": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street và Thành phố Boston; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Giờ làm việc thay đổi; gọi (617) 474-1432 hoặc gửi email tới info@fieldscorner.org trước khi đến.",
      "services": [
        "Hỗ trợ doanh nghiệp nhỏ",
        "Hỗ trợ cải thiện mặt tiền cửa hàng",
        "Sự kiện cộng đồng",
        "Quảng bá khu vực"
      ],
      "address": "1444 Dorchester Avenue, tầng 2, Dorchester, MA 02122"
    },
    "zh": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street 和波士顿市；美国人口普查局地址定位工具",
      "hoursNote": "办公时间会变化；前往前请致电 (617) 474-1432 或发送邮件至 info@fieldscorner.org。",
      "services": [
        "小企业协助",
        "店面改善支持",
        "社区活动",
        "商业区推广"
      ],
      "address": "1444 Dorchester Avenue，二楼，Dorchester, MA 02122"
    },
    "ar": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street ومدينة بوسطن؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تختلف ساعات العمل؛ اتصل على (617) 474-1432 أو راسل info@fieldscorner.org قبل الزيارة.",
      "services": [
        "مساعدة المشروعات الصغيرة",
        "دعم تحسين واجهات المتاجر",
        "فعاليات مجتمعية",
        "الترويج للمنطقة"
      ],
      "address": "1444 Dorchester Avenue، الطابق الثاني، Dorchester, MA 02122"
    },
    "so": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street iyo Magaalada Boston; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Saacaduhu way kala duwan yihiin; wac (617) 474-1432 ama email u dir info@fieldscorner.org ka hor booqashada.",
      "services": [
        "Caawinta ganacsiyada yaryar",
        "Taageerada hagaajinta wejiga dukaamada",
        "Dhacdooyinka bulshada",
        "Xayeysiinta aagga"
      ],
      "address": "1444 Dorchester Avenue, dabaqa 2aad, Dorchester, MA 02122"
    },
    "kea": {
      "neighborhood": "Fields Corner",
      "operator": "Fields Corner Main Street",
      "source": "Fields Corner Main Street i Sidadi di Boston; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Oráriu ta varia; txoma (617) 474-1432 ô skrebe pa info@fieldscorner.org antis di vizita.",
      "services": [
        "Ajudu pa pikinus negósius",
        "Apoiu pa midjora fasadas di lojas",
        "Eventus komunitáriu",
        "Promoson di zona"
      ],
      "address": "1444 Dorchester Avenue, 2º andar, Dorchester, MA 02122"
    }
  },
  "columbia-savin-hill-civic": {
    "es": {
      "neighborhood": "Savin Hill (dirección de contacto; los lugares de reunión varían)",
      "source": "Página de contacto y actas de Columbia-Savin Hill Civic Association; geocodificador del Censo de EE. UU.",
      "hoursNote": "Las reuniones se publican en el sitio web; contacta a la asociación para confirmar lugar y horario.",
      "services": [
        "Reuniones cívicas",
        "Comentarios sobre desarrollo del barrio",
        "Eventos vecinales",
        "Participación comunitaria"
      ]
    },
    "ht": {
      "neighborhood": "Savin Hill (adrès kontak; kote reyinyon varye)",
      "source": "Paj kontak ak pwosè vèbal Columbia-Savin Hill Civic Association; jeyokodè Resansman Etazini",
      "hoursNote": "Yo pibliye reyinyon yo sou sit la; kontakte asosyasyon an pou konfime kote ak orè.",
      "services": [
        "Reyinyon sivik",
        "Kòmantè sou devlopman katye a",
        "Evènman katye",
        "Patisipasyon kominotè"
      ]
    },
    "pt": {
      "neighborhood": "Savin Hill (endereço de contato; locais de reunião variam)",
      "source": "Página de contato e atas da Columbia-Savin Hill Civic Association; geocodificador do Censo dos EUA",
      "hoursNote": "As reuniões são publicadas no site; contate a associação para confirmar local e horário.",
      "services": [
        "Reuniões cívicas",
        "Comentários sobre o desenvolvimento do bairro",
        "Eventos do bairro",
        "Participação comunitária"
      ]
    },
    "vi": {
      "neighborhood": "Savin Hill (địa chỉ liên hệ; địa điểm họp thay đổi)",
      "source": "Trang liên hệ và biên bản họp của Columbia-Savin Hill Civic Association; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Các cuộc họp được đăng trên trang web; liên hệ hội để xác nhận địa điểm và thời gian.",
      "services": [
        "Họp cộng đồng",
        "Góp ý về phát triển khu phố",
        "Sự kiện khu phố",
        "Tham gia cộng đồng"
      ]
    },
    "zh": {
      "neighborhood": "Savin Hill（联系地址；会议地点不同）",
      "source": "Columbia-Savin Hill Civic Association 联系页面和会议记录；美国人口普查局地址定位工具",
      "hoursNote": "会议公布于网站；请联系协会确认地点和时间。",
      "services": [
        "社区会议",
        "对社区发展提出意见",
        "邻里活动",
        "社区参与"
      ]
    },
    "ar": {
      "neighborhood": "Savin Hill (عنوان للتواصل؛ تختلف مواقع الاجتماعات)",
      "source": "صفحة الاتصال ومحاضر اجتماعات Columbia-Savin Hill Civic Association؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تُنشر الاجتماعات على الموقع؛ تواصل مع الجمعية لتأكيد المكان والموعد.",
      "services": [
        "اجتماعات أهلية",
        "تعليقات على تطوير الحي",
        "فعاليات الحي",
        "المشاركة المجتمعية"
      ]
    },
    "so": {
      "neighborhood": "Savin Hill (cinwaanka xiriirka; goobaha shirku way kala duwan yihiin)",
      "source": "Bogga xiriirka iyo qoraallada shirarka Columbia-Savin Hill Civic Association; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Shirarka waxaa lagu qoraa bogga internetka; la xiriir ururka si aad u xaqiijiso goobta iyo waqtiga.",
      "services": [
        "Shirarka bulshada",
        "Faallooyinka horumarinta xaafadda",
        "Dhacdooyinka xaafadda",
        "Ka-qaybgalka bulshada"
      ]
    },
    "kea": {
      "neighborhood": "Savin Hill (enderesu di kontaktu; lugar di riunion ta varia)",
      "source": "Pájina di kontaktu i atas di Columbia-Savin Hill Civic Association; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Riunion ta ser publikadu na situ; kontakta asosiason pa konfirma lugar i oráriu.",
      "services": [
        "Riunion siviku",
        "Komentárius sobri dezenvolvimentu di bairu",
        "Eventus di bairu",
        "Partisipason komunitáriu"
      ]
    }
  }
};
