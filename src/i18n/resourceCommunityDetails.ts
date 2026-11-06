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
      "source": "Páginas de contacto y programas de Dorchester Bay EDC",
      "hoursNote": "Sin cita de martes a jueves; lunes y viernes con cita. Llama al (617) 825-4200 para confirmar las horas.",
      "services": ["Desarrollo de vivienda asequible", "Préstamos y asistencia técnica para pequeñas empresas", "Organización comunitaria"],
      "address": "594 Columbia Road, oficina 302, Dorchester, MA 02125"
    },
    "ht": {
      "neighborhood": "Uphams Corner",
      "source": "Paj kontak ak pwogram Dorchester Bay EDC",
      "hoursNote": "San randevou madi–jedi; lendi ak vandredi sou randevou. Rele (617) 825-4200 pou konfime lè yo.",
      "services": ["Devlopman lojman abòdab", "Prè ak asistans teknik pou ti biznis", "Òganizasyon kominotè"],
      "address": "594 Columbia Road, biwo 302, Dorchester, MA 02125"
    },
    "pt": {
      "neighborhood": "Uphams Corner",
      "source": "Páginas de contato e programas da Dorchester Bay EDC",
      "hoursNote": "Atendimento sem agendamento de terça a quinta; segunda e sexta com agendamento. Ligue para (617) 825-4200 para confirmar os horários.",
      "services": ["Desenvolvimento de moradia acessível", "Empréstimos e assistência técnica para pequenos negócios", "Organização comunitária"],
      "address": "594 Columbia Road, sala 302, Dorchester, MA 02125"
    },
    "vi": {
      "neighborhood": "Uphams Corner",
      "source": "Trang liên hệ và chương trình của Dorchester Bay EDC",
      "hoursNote": "Không cần hẹn từ thứ Ba đến thứ Năm; thứ Hai và thứ Sáu cần hẹn. Gọi (617) 825-4200 để xác nhận giờ.",
      "services": ["Phát triển nhà ở giá phải chăng", "Cho vay và hỗ trợ kỹ thuật cho doanh nghiệp nhỏ", "Tổ chức cộng đồng"],
      "address": "594 Columbia Road, phòng 302, Dorchester, MA 02125"
    },
    "zh": {
      "neighborhood": "Uphams Corner",
      "source": "Dorchester Bay EDC 联系及项目页面",
      "hoursNote": "周二至周四可直接到访；周一和周五需预约。请致电 (617) 825-4200 确认时间。",
      "services": ["可负担住房开发", "小企业贷款与技术协助", "社区组织工作"],
      "address": "594 Columbia Road，302 室，Dorchester, MA 02125"
    },
    "ar": {
      "neighborhood": "Uphams Corner",
      "source": "صفحات الاتصال والبرامج لدى Dorchester Bay EDC",
      "hoursNote": "زيارة دون موعد من الثلاثاء إلى الخميس؛ الاثنين والجمعة بموعد. اتصل على (617) 825-4200 لتأكيد الساعات.",
      "services": ["تطوير الإسكان الميسور", "قروض ومساعدة فنية للمشروعات الصغيرة", "تنظيم المجتمع"],
      "address": "594 Columbia Road، الجناح 302، Dorchester, MA 02125"
    },
    "so": {
      "neighborhood": "Uphams Corner",
      "source": "Bogagga xiriirka iyo barnaamijyada Dorchester Bay EDC",
      "hoursNote": "Ballan la’aan Talaado–Khamiis; Isniin iyo Jimce waa ballan. Wac (617) 825-4200 si aad u xaqiijiso saacadaha.",
      "services": ["Horumarinta guryaha la awoodi karo", "Amaah iyo taageero farsamo oo ganacsiyada yaryar", "Abaabulka bulshada"],
      "address": "594 Columbia Road, xafiiska 302, Dorchester, MA 02125"
    },
    "kea": {
      "neighborhood": "Uphams Corner",
      "source": "Pájinas di kontaktu i programas di Dorchester Bay EDC",
      "hoursNote": "Sen markason di tersa a kinta; sigunda i sesta ku markason. Txoma (617) 825-4200 pa konfirma oráriu.",
      "services": ["Dezenvolvimentu di abitason asesível", "Empréstimus i apoiu tékniku pa pikinus negósius", "Organizason komunitáriu"],
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
      "neighborhood": "Savin Hill (el lugar de reunión varía; no hay sede pública confirmada)",
      "address": "No hay una dirección pública actual para reuniones; confirme con la asociación",
      "source": "Página de contacto y archivo de reuniones de Columbia-Savin Hill Civic Association",
      "hoursNote": "El sitio describe reuniones mensuales, normalmente el primer lunes salvo el receso de verano y los días festivos, y conserva actas hasta junio de 2026. No se confirmó una sede actual para visitantes ni un teléfono vigente; use el sitio de la asociación para confirmar la próxima fecha, el lugar y el acceso antes de asistir.",
      "services": [
        "Reuniones cívicas",
        "Comentarios sobre desarrollo del barrio",
        "Eventos vecinales",
        "Participación comunitaria"
      ]
    },
    "ht": {
      "neighborhood": "Savin Hill (kote reyinyon yo varye; pa gen lokal piblik ki konfime)",
      "address": "Pa gen adrès piblik aktyèl pou reyinyon ki konfime; verifye avèk asosyasyon an",
      "source": "Paj kontak ak achiv reyinyon Columbia-Savin Hill Civic Association",
      "hoursNote": "Sit la dekri reyinyon chak mwa, anjeneral premye lendi a eksepte vakans ete ak jou ferye, epi li gen pwosè vèbal jiska jen 2026. Yo pa konfime kote pou vizitè ni yon nimewo telefòn aktyèl; sèvi ak sit asosyasyon an pou konfime pwochen dat la, kote a ak aksè anvan ou ale.",
      "services": [
        "Reyinyon sivik",
        "Kòmantè sou devlopman katye a",
        "Evènman katye",
        "Patisipasyon kominotè"
      ]
    },
    "pt": {
      "neighborhood": "Savin Hill (o local das reuniões varia; não há sede pública confirmada)",
      "address": "Não há endereço público atual confirmado para reuniões; confirme com a associação",
      "source": "Página de contato e arquivo de reuniões da Columbia-Savin Hill Civic Association",
      "hoursNote": "O site descreve reuniões mensais, geralmente na primeira segunda-feira, exceto no recesso de verão e em feriados, e mantém atas até junho de 2026. Não foi confirmado um local atual para visitantes nem um telefone vigente; use o site da associação para confirmar a próxima data, o local e o acesso antes de comparecer.",
      "services": [
        "Reuniões cívicas",
        "Comentários sobre o desenvolvimento do bairro",
        "Eventos do bairro",
        "Participação comunitária"
      ]
    },
    "vi": {
      "neighborhood": "Savin Hill (địa điểm họp thay đổi; chưa xác nhận địa điểm công khai)",
      "address": "Chưa xác nhận địa chỉ họp công khai hiện tại; hãy hỏi hội",
      "source": "Trang liên hệ và kho lưu trữ cuộc họp của Columbia-Savin Hill Civic Association",
      "hoursNote": "Trang web mô tả các cuộc họp hằng tháng, thường vào thứ Hai đầu tiên trừ kỳ nghỉ hè và ngày lễ, và lưu biên bản đến tháng 6 năm 2026. Chưa xác nhận địa điểm tiếp khách hiện tại hoặc số điện thoại còn dùng; hãy dùng trang của hội để xác nhận ngày, địa điểm và lối tiếp cận trước khi đến.",
      "services": [
        "Họp cộng đồng",
        "Góp ý về phát triển khu phố",
        "Sự kiện khu phố",
        "Tham gia cộng đồng"
      ]
    },
    "zh": {
      "neighborhood": "Savin Hill（会议地点不固定；尚未确认公开会址）",
      "address": "尚未确认当前公开会议地址；请向协会确认",
      "source": "Columbia-Savin Hill Civic Association 联系页面及会议档案",
      "hoursNote": "网站介绍每月举行会议，通常为每月第一个周一，暑期休会及节假日除外；会议记录更新至 2026 年 6 月。尚未确认当前访客地点或有效电话号码；前往前请通过协会网站确认下一次日期、场地和无障碍情况。",
      "services": [
        "社区会议",
        "对社区发展提出意见",
        "邻里活动",
        "社区参与"
      ]
    },
    "ar": {
      "neighborhood": "Savin Hill (يتغير مكان الاجتماع؛ لم يُؤكد موقع عام)",
      "address": "لم يُؤكد عنوان عام حالي للاجتماعات؛ أكّد مع الجمعية",
      "source": "صفحة التواصل وأرشيف الاجتماعات لدى Columbia-Savin Hill Civic Association",
      "hoursNote": "يصف الموقع اجتماعات شهرية، عادةً في أول يوم اثنين باستثناء العطلة الصيفية والأعياد، ويضم محاضر حتى يونيو 2026. لم يُؤكد موقع حالي للزوار أو رقم هاتف ساري؛ استخدم موقع الجمعية لتأكيد الموعد والمكان وإمكانية الوصول قبل الحضور.",
      "services": [
        "اجتماعات أهلية",
        "تعليقات على تطوير الحي",
        "فعاليات الحي",
        "المشاركة المجتمعية"
      ]
    },
    "so": {
      "neighborhood": "Savin Hill (goobaha shirarku way kala duwan yihiin; goob dadweyne lama xaqiijin)",
      "address": "Cinwaan dadweyne oo shirarka hadda ah lama xaqiijin; ururka ka xaqiiji",
      "source": "Bogga xiriirka iyo kaydka shirarka Columbia-Savin Hill Civic Association",
      "hoursNote": "Boggu wuxuu sheegayaa shirar bille ah, badanaa Isniinta koowaad marka laga reebo fasaxa xagaaga iyo maalmaha ciidaha, wuxuuna hayaa qoraallo ilaa Juun 2026. Goob booqasho oo hadda ah iyo telefoon shaqaynaya lama xaqiijin; bogga ururka ka xaqiiji taariikhda, goobta iyo gelitaanka ka hor intaadan tegin.",
      "services": [
        "Shirarka bulshada",
        "Faallooyinka horumarinta xaafadda",
        "Dhacdooyinka xaafadda",
        "Ka-qaybgalka bulshada"
      ]
    },
    "kea": {
      "neighborhood": "Savin Hill (lugar di riunion ta varia; lugar públiku ka sta konfirmadu)",
      "address": "Ka ten enderesu públiku atual konfirmadu pa riunions; konfirma ku asosiason",
      "source": "Pájina di kontaktu i arkivu di riunions di Columbia-Savin Hill Civic Association",
      "hoursNote": "Situ ta deskribe riunions mensal, normalmenti na primeru sigunda-feira salvu pausa di veron i feriadus, i ten atas té junhu di 2026. Lugar atual pa vizitanti i telefóni validu ka sta konfirmadu; uza situ di asosiason pa konfirma data, lugar i asesu antis di bai.",
      "services": [
        "Riunion siviku",
        "Komentárius sobri dezenvolvimentu di bairu",
        "Eventus di bairu",
        "Partisipason komunitáriu"
      ]
    }
  }
};
