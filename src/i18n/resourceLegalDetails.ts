import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted legal-service drafts; require legal and native-speaker review. */
export const LEGAL_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "cpcs-boston": {
    "es": {
      "operator": "Comité de Servicios de Defensa Pública (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Distrito Financiero, Boston",
      "address": "75 Federal Street, sexto piso, Boston, MA 02110",
      "hoursNote": "Para horarios y citas de la oficina administrativa, llame al (617) 482-6212 antes de ir.",
      "eligibility": "El tribunal decide si reúne los requisitos para un abogado de oficio. Pueden aplicarse tarifas o contribuciones; pregunte al tribunal sobre exenciones.",
      "transit": "Línea Roja o Naranja hasta Downtown Crossing; confirme las indicaciones y la entrada accesible antes de viajar.",
      "source": "Contacto y áreas de práctica de publiccounsel.net; reglas 7 y 3:10 de mass.gov; dirección de 75 Federal Street",
      "services": [
        "Defensa penal",
        "Representación de jóvenes",
        "Casos de menores y familia",
        "Procedimientos de salud mental",
        "Apelaciones",
        "Interpretación para clientes (consulte a su abogado)"
      ]
    },
    "ht": {
      "operator": "Komite Sèvis Avoka Piblik (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Financial District, Boston",
      "address": "75 Federal Street, sizyèm etaj, Boston, MA 02110",
      "hoursNote": "Pou lè ak randevou biwo administratif la, rele (617) 482-6212 anvan ou ale.",
      "eligibility": "Tribinal la deside si ou kalifye pou yon avoka tribinal nonmen. Ka gen frè oswa kontribisyon; mande tribinal la sou dispans.",
      "transit": "Liy Wouj oswa Oranj pou Downtown Crossing; konfime direksyon ak antre aksesib la anvan ou vwayaje.",
      "source": "Kontak ak domèn pratik publiccounsel.net; règ 7 ak 3:10 mass.gov; adrès 75 Federal Street",
      "services": [
        "Defans penal",
        "Reprezantasyon jèn",
        "Dosye timoun ak fanmi",
        "Pwosedi sante mantal",
        "Apèl",
        "Entèpretasyon pou kliyan (mande avoka ou)"
      ]
    },
    "pt": {
      "operator": "Comitê de Serviços de Defesa Pública (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Distrito Financeiro, Boston",
      "address": "75 Federal Street, sexto andar, Boston, MA 02110",
      "hoursNote": "Para horários e agendamentos do escritório administrativo, ligue para (617) 482-6212 antes de ir.",
      "eligibility": "O tribunal decide se você se qualifica para um advogado nomeado. Taxas ou contribuições podem ser cobradas; pergunte ao tribunal sobre isenções.",
      "transit": "Linha Vermelha ou Laranja até Downtown Crossing; confirme as instruções e a entrada acessível antes de viajar.",
      "source": "Contato e áreas de atuação de publiccounsel.net; regras 7 e 3:10 de mass.gov; endereço de 75 Federal Street",
      "services": [
        "Defesa criminal",
        "Representação de jovens",
        "Casos de crianças e família",
        "Processos de saúde mental",
        "Recursos judiciais",
        "Interpretação para clientes (pergunte ao seu advogado)"
      ]
    },
    "vi": {
      "operator": "Ủy ban Dịch vụ Luật sư Công (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Khu Tài chính, Boston",
      "address": "75 Federal Street, tầng 6, Boston, MA 02110",
      "hoursNote": "Để biết giờ và lịch hẹn của văn phòng hành chính, gọi (617) 482-6212 trước khi đến.",
      "eligibility": "Tòa quyết định quý vị có đủ điều kiện được chỉ định luật sư hay không. Có thể phải trả phí hoặc đóng góp; hãy hỏi tòa về miễn phí.",
      "transit": "Tuyến Đỏ hoặc Cam đến Downtown Crossing; xác nhận chỉ đường và lối vào tiếp cận được trước khi đi.",
      "source": "Liên hệ và lĩnh vực hành nghề của publiccounsel.net; Quy tắc 7 và 3:10 của mass.gov; địa chỉ 75 Federal Street",
      "services": [
        "Bào chữa hình sự",
        "Đại diện thanh thiếu niên",
        "Vụ việc trẻ em và gia đình",
        "Thủ tục về sức khỏe tâm thần",
        "Kháng cáo",
        "Phiên dịch cho thân chủ (hỏi luật sư của quý vị)"
      ]
    },
    "zh": {
      "operator": "公共法律顾问服务委员会（Committee for Public Counsel Services，CPCS）",
      "neighborhood": "波士顿金融区",
      "address": "75 Federal Street，6楼，Boston, MA 02110",
      "hoursNote": "请在前往前致电 (617) 482-6212，询问行政办公室的办公时间和预约。",
      "eligibility": "法院决定是否符合指定律师的资格。可能收取费用或要求分担；请向法院询问减免事宜。",
      "transit": "乘红线或橙线至 Downtown Crossing；出行前确认路线和无障碍入口。",
      "source": "publiccounsel.net 联系方式及业务领域；mass.gov 第 7 和 3:10 条规则；75 Federal Street 地址",
      "services": [
        "刑事辩护",
        "青少年代理",
        "儿童和家庭案件",
        "心理健康相关程序",
        "上诉",
        "为当事人提供口译（请咨询您的律师）"
      ]
    },
    "ar": {
      "operator": "لجنة خدمات المحامي العام (Committee for Public Counsel Services، CPCS)",
      "neighborhood": "الحي المالي، بوسطن",
      "address": "75 Federal Street، الطابق السادس، Boston, MA 02110",
      "hoursNote": "لمواعيد وساعات المكتب الإداري، اتصل على (617) 482-6212 قبل الزيارة.",
      "eligibility": "تقرر المحكمة أهلية الحصول على محامٍ مُعيَّن. قد تُفرض رسوم أو مساهمات؛ اسأل المحكمة عن الإعفاءات.",
      "transit": "الخط الأحمر أو البرتقالي إلى Downtown Crossing؛ تأكد من الاتجاهات والمدخل الميسر قبل السفر.",
      "source": "الاتصال ومجالات العمل في publiccounsel.net؛ القاعدتان 7 و3:10 على mass.gov؛ عنوان 75 Federal Street",
      "services": [
        "الدفاع الجنائي",
        "تمثيل الشباب",
        "قضايا الأطفال والأسرة",
        "إجراءات الصحة النفسية",
        "الاستئناف",
        "الترجمة الشفوية للموكلين (اسأل محاميك)"
      ]
    },
    "so": {
      "operator": "Guddiga Adeegyada Qareennada Dadweynaha (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Financial District, Boston",
      "address": "75 Federal Street, dabaqa 6aad, Boston, MA 02110",
      "hoursNote": "Saacadaha iyo ballamaha xafiiska maamulka, wac (617) 482-6212 ka hor booqashada.",
      "eligibility": "Maxkamaddu waxay go'aamisaa u-qalmitaanka qareen la magacaabo. Lacag ama wax ku biirin ayaa jiri kara; maxkamadda ka weydii cafinta lacagta.",
      "transit": "Khadka Cas ama Oranjiga ilaa Downtown Crossing; xaqiiji tilmaamaha iyo gelitaanka la heli karo ka hor safarka.",
      "source": "Xiriirka iyo qaybaha shaqada publiccounsel.net; xeerarka 7 iyo 3:10 ee mass.gov; cinwaanka 75 Federal Street",
      "services": [
        "Difaaca dambiyada",
        "Matalaadda dhallinyarada",
        "Kiisaska carruurta iyo qoyska",
        "Dacwadaha caafimaadka maskaxda",
        "Racfaan",
        "Turjubaan macaamiisha (weydii qareenkaaga)"
      ]
    },
    "kea": {
      "operator": "Komité di Servisus di Advogadus Públiku (Committee for Public Counsel Services, CPCS)",
      "neighborhood": "Distrito Finanseru, Boston",
      "address": "75 Federal Street, 6º andar, Boston, MA 02110",
      "hoursNote": "Pa orárius i markasons di skritóriu administrativu, txoma (617) 482-6212 antis di bai.",
      "eligibility": "Tribunal ta disidi si bu ta kalifika pa advogadu nomeadu. Pode ten taxas ô kontribusons; purgunta tribunal sobri izensons.",
      "transit": "Linha Vermelhu ô Laranja pa Downtown Crossing; konfirma indikasons i entrada asesível antis di viaja.",
      "source": "Kontatu i árias di trabadju di publiccounsel.net; regras 7 i 3:10 di mass.gov; morada 75 Federal Street",
      "services": [
        "Defeza kriminal",
        "Reprezentason di joventudi",
        "Kazus di kriansas i família",
        "Prosedimentus di saúde mental",
        "Rekursus",
        "Interpretason pa klientes (purgunta bu advogadu)"
      ]
    }
  }
};
