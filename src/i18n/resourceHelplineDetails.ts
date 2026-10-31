import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted first drafts; review with native speakers and providers. */
export const HELPLINE_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "hcfa-helpline": {
    "es": {
      "neighborhood": "Servicio telefónico",
      "address": "Servicio telefónico estatal (oficina: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Página HelpLine de hcfama.org y Massachusetts Legal Resource Finder",
      "hoursNote": "Llame al 1-800-272-4232 para confirmar el horario actual; algunos directorios indican lunes a viernes, de 9 a. m. a 5 p. m.",
      "eligibility": "Residentes de Massachusetts de cualquier nivel de ingresos; los requisitos del seguro varían.",
      "services": [
        "Ayuda para inscribirse en MassHealth",
        "Ayuda para inscribirse en Health Connector",
        "Preguntas y problemas del seguro",
        "Referencia a Health Law Advocates por facturas o atención denegada"
      ]
    },
    "ht": {
      "neighborhood": "Sèvis telefòn",
      "address": "Sèvis telefòn pou tout eta a (biwo: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Paj HelpLine sou hcfama.org ak Massachusetts Legal Resource Finder",
      "hoursNote": "Rele 1-800-272-4232 pou konfime orè aktyèl la; kèk anyè bay lendi–vandredi, 9 a.m.–5 p.m.",
      "eligibility": "Rezidan Massachusetts kèlkeswa revni yo; kondisyon pwogram asirans yo varye.",
      "services": [
        "Èd pou enskri nan MassHealth",
        "Èd pou enskri nan Health Connector",
        "Kesyon ak pwoblèm asirans",
        "Referans bay Health Law Advocates pou bòdwo oswa swen yo refize"
      ]
    },
    "pt": {
      "neighborhood": "Serviço telefônico",
      "address": "Serviço telefônico estadual (escritório: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Página HelpLine de hcfama.org e Massachusetts Legal Resource Finder",
      "hoursNote": "Ligue para 1-800-272-4232 para confirmar o horário atual; alguns diretórios indicam segunda a sexta, das 9h às 17h.",
      "eligibility": "Moradores de Massachusetts de qualquer renda; os requisitos dos programas de seguro variam.",
      "services": [
        "Ajuda para inscrição no MassHealth",
        "Ajuda para inscrição no Health Connector",
        "Dúvidas e problemas de seguro",
        "Encaminhamento à Health Law Advocates por contas ou atendimento negado"
      ]
    },
    "vi": {
      "neighborhood": "Dịch vụ qua điện thoại",
      "address": "Dịch vụ điện thoại toàn tiểu bang (văn phòng: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Trang HelpLine của hcfama.org và Massachusetts Legal Resource Finder",
      "hoursNote": "Gọi 1-800-272-4232 để xác nhận giờ hiện tại; một số danh bạ ghi thứ Hai–thứ Sáu, 9 giờ sáng–5 giờ chiều.",
      "eligibility": "Cư dân Massachusetts ở mọi mức thu nhập; điều kiện của các chương trình bảo hiểm khác nhau.",
      "services": [
        "Hỗ trợ đăng ký MassHealth",
        "Hỗ trợ đăng ký Health Connector",
        "Câu hỏi và vấn đề bảo hiểm",
        "Giới thiệu đến Health Law Advocates về hóa đơn hoặc chăm sóc bị từ chối"
      ]
    },
    "zh": {
      "neighborhood": "电话服务",
      "address": "全州电话服务（办公室：70 Franklin Street, Suite 500, Boston, MA 02110）",
      "operator": "Health Care For All",
      "source": "hcfama.org HelpLine 页面及 Massachusetts Legal Resource Finder",
      "hoursNote": "请拨打 1-800-272-4232 确认热线当前时间；部分目录列为周一至周五上午 9 点至下午 5 点。",
      "eligibility": "适用于各收入水平的 Massachusetts 居民；保险计划资格条件各不相同。",
      "services": [
        "协助申请 MassHealth",
        "协助申请 Health Connector",
        "保险咨询及问题处理",
        "就医疗账单或被拒绝的护理转介 Health Law Advocates"
      ]
    },
    "ar": {
      "neighborhood": "خدمة هاتفية",
      "address": "خدمة هاتفية على مستوى الولاية (المكتب: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "صفحة HelpLine على hcfama.org وMassachusetts Legal Resource Finder",
      "hoursNote": "اتصل بالرقم 1-800-272-4232 لتأكيد ساعات الخط الحالية؛ تذكر بعض الأدلة الاثنين–الجمعة من 9 صباحاً إلى 5 مساءً.",
      "eligibility": "سكان Massachusetts بجميع مستويات الدخل؛ تختلف شروط برامج التأمين.",
      "services": [
        "المساعدة في التسجيل في MassHealth",
        "المساعدة في التسجيل في Health Connector",
        "أسئلة التأمين وحل مشكلاته",
        "الإحالة إلى Health Law Advocates للفواتير أو الرعاية المرفوضة"
      ]
    },
    "so": {
      "neighborhood": "Adeeg telefoon",
      "address": "Adeeg telefoon oo gobolka oo dhan ah (xafiis: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Bogga HelpLine ee hcfama.org iyo Massachusetts Legal Resource Finder",
      "hoursNote": "Wac 1-800-272-4232 si aad u xaqiijiso saacadaha hadda; tusayaasha qaar waxay qoraan Isniin–Jimce 9 subaxnimo–5 galabnimo.",
      "eligibility": "Dadka Massachusetts deggan ee dakhli kasta leh; shuruudaha caymiska way kala duwan yihiin.",
      "services": [
        "Caawinta diiwaangelinta MassHealth",
        "Caawinta diiwaangelinta Health Connector",
        "Su’aalaha iyo dhibaatooyinka caymiska",
        "U-gudbinta Health Law Advocates ee biilasha ama daryeelka la diiday"
      ]
    },
    "kea": {
      "neighborhood": "Servisu di telefoni",
      "address": "Servisu di telefoni pa stadu interu (skritóriu: 70 Franklin Street, Suite 500, Boston, MA 02110)",
      "operator": "Health Care For All",
      "source": "Pájina HelpLine di hcfama.org i Massachusetts Legal Resource Finder",
      "hoursNote": "Txoma 1-800-272-4232 pa konfirma oráriu atual; algun diretórius ta indika sigunda–sesta, 9 di manhan–5 di tardi.",
      "eligibility": "Moradoris di Massachusetts di kualker rendimentu; kondisons di programas di siguru ta varia.",
      "services": [
        "Ajuda pa inskrison na MassHealth",
        "Ajuda pa inskrison na Health Connector",
        "Perguntas i problemas di siguru",
        "Referénsia pa Health Law Advocates pa kontas ô kuidadu negadu"
      ]
    }
  },
  "boston-language-access": {
    "es": {
      "neighborhood": "Toda la ciudad",
      "address": "Servicio telefónico para toda la ciudad",
      "operator": "Ciudad de Boston",
      "source": "Páginas de Boston.gov sobre 311 y quejas de acceso lingüístico y de comunicación",
      "hoursNote": "Boston 311 abre las 24 horas. La oficina de acceso lingüístico y de comunicación tiene otro horario; llame al (617) 635-3414 para pedir un formulario de queja.",
      "services": [
        "Solicitudes municipales no urgentes",
        "Información y referencias municipales",
        "Formularios de queja sobre acceso lingüístico y de comunicación",
        "Solicitudes de interpretación en servicios municipales"
      ]
    },
    "ht": {
      "neighborhood": "Tout vil la",
      "address": "Sèvis telefòn pou tout vil la",
      "operator": "Vil Boston",
      "source": "Paj Boston.gov sou 311 ak plent aksè lang ak kominikasyon",
      "hoursNote": "Boston 311 louvri 24 èdtan pa jou. Biwo aksè lang ak kominikasyon an gen lòt orè; rele (617) 635-3414 pou mande yon fòm plent.",
      "services": [
        "Demann sèvis vil ki pa ijans",
        "Enfòmasyon ak referans vil la",
        "Fòm plent sou aksè lang ak kominikasyon",
        "Demann entèpretasyon pou sèvis vil la"
      ]
    },
    "pt": {
      "neighborhood": "Toda a cidade",
      "address": "Serviço telefônico para toda a cidade",
      "operator": "Cidade de Boston",
      "source": "Páginas do Boston.gov sobre 311 e reclamações de acesso linguístico e de comunicação",
      "hoursNote": "Boston 311 funciona 24 horas por dia. O escritório de acesso linguístico e de comunicação tem horário próprio; ligue para (617) 635-3414 para pedir um formulário de reclamação.",
      "services": [
        "Solicitações municipais não emergenciais",
        "Informações e encaminhamentos municipais",
        "Formulários de reclamação sobre acesso linguístico e de comunicação",
        "Pedidos de interpretação nos serviços municipais"
      ]
    },
    "vi": {
      "neighborhood": "Toàn thành phố",
      "address": "Dịch vụ điện thoại toàn thành phố",
      "operator": "Thành phố Boston",
      "source": "Các trang Boston.gov về 311 và khiếu nại tiếp cận ngôn ngữ và giao tiếp",
      "hoursNote": "Boston 311 hoạt động 24 giờ mỗi ngày. Văn phòng tiếp cận ngôn ngữ và giao tiếp có giờ riêng; gọi (617) 635-3414 để yêu cầu mẫu khiếu nại.",
      "services": [
        "Yêu cầu dịch vụ thành phố không khẩn cấp",
        "Thông tin và giới thiệu của thành phố",
        "Mẫu khiếu nại về tiếp cận ngôn ngữ và giao tiếp",
        "Yêu cầu thông dịch tại dịch vụ thành phố"
      ]
    },
    "zh": {
      "neighborhood": "全市",
      "address": "全市电话服务",
      "operator": "波士顿市政府",
      "source": "Boston.gov 的 311 及语言和沟通无障碍投诉页面",
      "hoursNote": "Boston 311 每天 24 小时开放。语言和沟通无障碍办公室的时间另有规定；请拨打 (617) 635-3414 索取投诉表。",
      "services": [
        "非紧急市政服务请求",
        "市政信息和转介",
        "语言和沟通无障碍投诉表",
        "在市政服务中申请口译"
      ]
    },
    "ar": {
      "neighborhood": "على مستوى المدينة",
      "address": "خدمة هاتفية على مستوى المدينة",
      "operator": "مدينة بوسطن",
      "source": "صفحات Boston.gov عن 311 وشكاوى الوصول اللغوي والتواصل",
      "hoursNote": "يعمل Boston 311 على مدار 24 ساعة. لمكتب الوصول اللغوي والتواصل ساعات منفصلة؛ اتصل بالرقم (617) 635-3414 لطلب نموذج شكوى.",
      "services": [
        "طلبات الخدمات البلدية غير الطارئة",
        "معلومات المدينة والإحالات",
        "نماذج شكاوى الوصول اللغوي والتواصل",
        "طلبات الترجمة الشفوية في خدمات المدينة"
      ]
    },
    "so": {
      "neighborhood": "Magaalada oo dhan",
      "address": "Adeeg telefoon oo magaalada oo dhan ah",
      "operator": "Magaalada Boston",
      "source": "Bogagga Boston.gov ee 311 iyo cabashada helitaanka luqadda iyo isgaarsiinta",
      "hoursNote": "Boston 311 waxay furan tahay 24 saacadood maalintii. Xafiiska helitaanka luqadda iyo isgaarsiintu wuxuu leeyahay saacado gaar ah; wac (617) 635-3414 si aad u codsato foom cabasho.",
      "services": [
        "Codsiyada adeegyada magaalada ee aan degdegga ahayn",
        "Xogta iyo gudbinta magaalada",
        "Foomamka cabashada helitaanka luqadda iyo isgaarsiinta",
        "Codsiyada turjumaadda adeegyada magaalada"
      ]
    },
    "kea": {
      "neighborhood": "Sidadi interu",
      "address": "Servisu di telefoni pa sidadi interu",
      "operator": "Sidadi di Boston",
      "source": "Pájinas di Boston.gov sobri 311 i reklamason di asesu linguístiku i komunikason",
      "hoursNote": "Boston 311 ta funsiona 24 ora pa dia. Skritóriu di asesu linguístiku i komunikason ten otu oráriu; txoma (617) 635-3414 pa pidi formuláriu di reklamason.",
      "services": [
        "Pididus di servisu di sidadi ki ka é emergénsia",
        "Informason i referénsias di sidadi",
        "Formulárius di reklamason di asesu linguístiku i komunikason",
        "Pididus di interpretason na servisus di sidadi"
      ]
    }
  }
};
