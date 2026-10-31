import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted drafts; native-speaker and health-provider review is needed. */
export const HEALTH_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "codman-square-health": {
    "es": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "El horario varía según el departamento. Llame a citas al (617) 822-8271 para confirmar horarios y citas.",
      "eligibility": "Codman indica que no negará servicios por incapacidad de pago. El descuento de tarifa variable depende del tamaño y los ingresos de la familia; pregunte por los costos y la cobertura.",
      "transit": "Hay autobuses MBTA que llegan a Codman Square; consulte las indicaciones actuales de MBTA antes de viajar.",
      "source": "Páginas de codman.org sobre contacto y horarios, inscripción al seguro y recursos para pacientes",
      "services": [
        "Medicina familiar",
        "Pediatría",
        "Atención dental",
        "Salud conductual",
        "Atención de VIH/ITS (X-Clinic)",
        "Mercado comunitario de alimentos, 450 Washington Street",
        "Ayuda para inscribirse en un seguro (llame para consultar disponibilidad)"
      ]
    },
    "ht": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "Orè yo varye selon depatman an. Rele sèvis randevou a nan (617) 822-8271 pou konfime orè ak randevou.",
      "eligibility": "Codman di yo pap refize moun sèvis poutèt yo pa kapab peye. Rabè sou yon echèl frè depann de kantite moun nan fanmi an ak revni; mande sou depans ak kouvèti.",
      "transit": "Bis MBTA sèvi Codman Square; tcheke direksyon MBTA ki ajou anvan ou vwayaje.",
      "source": "Paj codman.org sou kontak ak orè, enskripsyon asirans ak resous pou pasyan",
      "services": [
        "Medsin familyal",
        "Swen timoun",
        "Swen dan",
        "Sante konpòtmantal",
        "Swen VIH/IST (X-Clinic)",
        "Mache manje kominotè, 450 Washington Street",
        "Èd pou enskri nan asirans (rele pou konnen si li disponib)"
      ]
    },
    "pt": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "Os horários variam por departamento. Ligue para agendamento no (617) 822-8271 para confirmar horários e consultas.",
      "eligibility": "A Codman informa que ninguém terá serviços negados por não poder pagar. O desconto em escala varia conforme o tamanho e a renda da família; pergunte sobre custos e cobertura.",
      "transit": "Ônibus da MBTA atendem Codman Square; consulte as rotas atuais da MBTA antes de viajar.",
      "source": "Páginas da codman.org sobre contato e horários, inscrição em seguro e recursos para pacientes",
      "services": [
        "Medicina de família",
        "Pediatria",
        "Odontologia",
        "Saúde comportamental",
        "Cuidados para HIV/IST (X-Clinic)",
        "Mercado comunitário de alimentos, 450 Washington Street",
        "Ajuda para inscrição em seguro (ligue para verificar disponibilidade)"
      ]
    },
    "vi": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "Giờ làm việc khác nhau theo khoa. Gọi bộ phận đặt lịch theo số (617) 822-8271 để xác nhận giờ và lịch hẹn.",
      "eligibility": "Codman cho biết sẽ không từ chối dịch vụ vì không có khả năng chi trả. Mức giảm phí theo thang dựa trên quy mô và thu nhập gia đình; hãy hỏi về chi phí và bảo hiểm.",
      "transit": "Xe buýt MBTA phục vụ Codman Square; kiểm tra chỉ dẫn hiện tại của MBTA trước khi đi.",
      "source": "Các trang codman.org về liên hệ và giờ làm việc, đăng ký bảo hiểm và tài nguyên cho bệnh nhân",
      "services": [
        "Y học gia đình",
        "Nhi khoa",
        "Nha khoa",
        "Sức khỏe hành vi",
        "Chăm sóc HIV/STI (X-Clinic)",
        "Chợ thực phẩm cộng đồng, 450 Washington Street",
        "Hỗ trợ đăng ký bảo hiểm (gọi để hỏi tình trạng sẵn có)"
      ]
    },
    "zh": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "各部门的服务时间不同。请致电预约部门 (617) 822-8271 确认时间和预约。",
      "eligibility": "Codman 表示不会因无力支付而拒绝提供服务。按收入浮动的费用减免依据家庭人数和收入确定；请询问费用及保险保障。",
      "transit": "MBTA 公交车途经 Codman Square；出行前请查看 MBTA 最新路线。",
      "source": "codman.org 的联系方式与时间、保险登记和患者资源页面",
      "services": [
        "家庭医学",
        "儿科",
        "牙科",
        "行为健康",
        "HIV/性传播感染护理（X-Clinic）",
        "社区食品市场，450 Washington Street",
        "保险登记帮助（请致电确认是否提供）"
      ]
    },
    "ar": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "تختلف المواعيد حسب القسم. اتصل بقسم المواعيد على (617) 822-8271 لتأكيد الساعات والمواعيد.",
      "eligibility": "تذكر Codman أنها لن ترفض تقديم الخدمات بسبب عدم القدرة على الدفع. يعتمد الخصم وفق سلم الرسوم على حجم الأسرة ودخلها؛ اسأل عن التكاليف والتغطية.",
      "transit": "تخدم حافلات MBTA منطقة Codman Square؛ تحقق من إرشادات MBTA الحالية قبل السفر.",
      "source": "صفحات codman.org للاتصال والمواعيد والتسجيل في التأمين وموارد المرضى",
      "services": [
        "طب الأسرة",
        "طب الأطفال",
        "طب الأسنان",
        "الصحة السلوكية",
        "رعاية فيروس نقص المناعة والعدوى المنقولة جنسياً (X-Clinic)",
        "سوق غذائي مجتمعي، 450 Washington Street",
        "المساعدة في التسجيل بالتأمين (اتصل للاستفسار عن التوفر)"
      ]
    },
    "so": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "Saacaduhu way ku kala duwan yihiin waaxyaha. Wac ballaminta (617) 822-8271 si aad u xaqiijiso saacadaha iyo ballamaha.",
      "eligibility": "Codman waxay sheegaysaa inaan qofna adeeg loogu diidi doonin awood la'aanta bixinta. Dhimista khidmadda ee isbeddeshaa waxay ku xiran tahay tirada qoyska iyo dakhliga; weydii kharashka iyo caymiska.",
      "transit": "Basaska MBTA waxay u adeegaan Codman Square; hubi tilmaamaha MBTA ee hadda jira ka hor safarka.",
      "source": "Bogagga codman.org ee xiriirka iyo saacadaha, diiwaangelinta caymiska iyo agabka bukaanka",
      "services": [
        "Daawada qoyska",
        "Daryeelka carruurta",
        "Daryeelka ilkaha",
        "Caafimaadka habdhaqanka",
        "Daryeelka HIV/STI (X-Clinic)",
        "Suuqa cuntada bulshada, 450 Washington Street",
        "Caawinta diiwaangelinta caymiska (wac si aad u ogaato helitaanka)"
      ]
    },
    "kea": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "hoursNote": "Orárius ta varia sigundu departamentu. Txoma servisu di markason na (617) 822-8271 pa konfirma orárius i markasons.",
      "eligibility": "Codman ta informa ki ningen ka ta fika sen servisu pamodi ka pode paga. Diskontu na eskala di taxa ta dipende di tamanhu i rendimentu di família; purgunta sobri kustus i kobertura.",
      "transit": "Autokarus MBTA ta serbi Codman Square; konsulta direçons atual di MBTA antis di viaja.",
      "source": "Pájinas di codman.org sobri kontatu i orárius, inskrison na siguru i rekursus pa pasientis",
      "services": [
        "Medisina di família",
        "Pediatria",
        "Kuidadu dentáriu",
        "Saúde konportamental",
        "Kuidadu pa HIV/IST (X-Clinic)",
        "Merkadu komunitáriu di kumida, 450 Washington Street",
        "Ajuda pa inskreve na siguru (txoma pa sabe disponibilidadi)"
      ]
    }
  },
  "uphams-corner-health": {
    "es": {
      "neighborhood": "Uphams Corner",
      "source": "Páginas de contacto y descuentos del Upham’s Corner Health Center; geocodificador del Censo de EE. UU.",
      "hoursNote": "Los horarios varían según la clínica. Llama al (617) 287-8000 para confirmar citas y horarios; para orientación clínica fuera de horario, llama al mismo número. En una emergencia médica, llama al 911.",
      "eligibility": "El centro no niega servicios por falta de seguro o por incapacidad de pago. Hay descuentos en la mayoría de los servicios para personas sin seguro o con cobertura insuficiente que cumplan los requisitos; pregunta por las condiciones y costos.",
      "services": [
        "Medicina familiar y pediatría",
        "Salud conductual",
        "Atención urgente (llama antes)",
        "Clínicas dental y de la vista: 636 Columbia Road, (617) 825-9839",
        "Farmacia: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; confirma el lugar de atención",
        "Ayuda para inscribirse en un seguro médico"
      ]
    },
    "ht": {
      "neighborhood": "Uphams Corner",
      "source": "Paj kontak ak rabè Upham’s Corner Health Center; jeyokodè Resansman Etazini",
      "hoursNote": "Orè yo varye selon klinik la. Rele (617) 287-8000 pou konfime randevou ak orè; pou konsèy klinik apre lè travay, rele menm nimewo a. Nan yon ijans medikal, rele 911.",
      "eligibility": "Sant lan pa refize sèvis paske yon moun pa gen asirans oswa li pa kapab peye. Gen rabè sou pifò sèvis pou moun ki pa gen asirans oswa ki pa gen ase kouvèti e ki kalifye; mande sou kondisyon ak pri.",
      "services": [
        "Medsin familyal ak pedyatri",
        "Sante konpòtmantal",
        "Swen ijan (rele anvan)",
        "Klinik dan ak je: 636 Columbia Road, (617) 825-9839",
        "Famasi: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; konfime kote sèvis la",
        "Èd pou enskri nan asirans sante"
      ]
    },
    "pt": {
      "neighborhood": "Uphams Corner",
      "source": "Páginas de contato e descontos do Upham’s Corner Health Center; geocodificador do Censo dos EUA",
      "hoursNote": "Os horários variam por clínica. Ligue para (617) 287-8000 para confirmar consultas e horários; para orientação clínica fora do expediente, use o mesmo número. Em emergência médica, ligue 911.",
      "eligibility": "O centro não nega serviços por falta de seguro ou incapacidade de pagar. Descontos na maioria dos serviços estão disponíveis para pessoas elegíveis sem seguro ou com cobertura insuficiente; pergunte sobre requisitos e custos.",
      "services": [
        "Medicina familiar e pediatria",
        "Saúde comportamental",
        "Atendimento urgente (ligue antes)",
        "Clínicas dentária e oftalmológica: 636 Columbia Road, (617) 825-9839",
        "Farmácia: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; confirme o local do atendimento",
        "Ajuda para inscrição em seguro de saúde"
      ]
    },
    "vi": {
      "neighborhood": "Uphams Corner",
      "source": "Trang liên hệ và giảm phí của Upham’s Corner Health Center; bộ định vị của Cục Điều tra Dân số Hoa Kỳ",
      "hoursNote": "Giờ làm việc khác nhau theo phòng khám. Gọi (617) 287-8000 để xác nhận lịch hẹn và giờ; để được tư vấn y tế ngoài giờ, gọi cùng số này. Khi cấp cứu y tế, gọi 911.",
      "eligibility": "Trung tâm không từ chối dịch vụ vì không có bảo hiểm hoặc không có khả năng chi trả. Người không có bảo hiểm hoặc bảo hiểm không đủ và đáp ứng điều kiện có thể được giảm phí cho phần lớn dịch vụ; hãy hỏi về điều kiện và chi phí.",
      "services": [
        "Y học gia đình và nhi khoa",
        "Sức khỏe hành vi",
        "Chăm sóc khẩn cấp (gọi trước)",
        "Phòng khám nha và mắt: 636 Columbia Road, (617) 825-9839",
        "Nhà thuốc: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; xác nhận địa điểm cung cấp dịch vụ",
        "Hỗ trợ đăng ký bảo hiểm y tế"
      ]
    },
    "zh": {
      "neighborhood": "Uphams Corner",
      "source": "Upham’s Corner Health Center 联系及费用减免页面；美国人口普查局地址定位工具",
      "hoursNote": "各诊所时间不同。请致电 (617) 287-8000 确认预约和时间；非办公时间需要临床建议也请拨此号码。医疗紧急情况请拨 911。",
      "eligibility": "中心不会因没有保险或无力支付而拒绝提供服务。符合条件的无保险或保险不足者可获得大多数服务的费用减免；请询问条件和费用。",
      "services": [
        "家庭医疗和儿科",
        "行为健康",
        "紧急护理（请先致电）",
        "牙科及眼科诊所：636 Columbia Road，(617) 825-9839",
        "药房：415 Columbia Road",
        "WIC：547 Columbia Road，(617) 825-8994；请确认服务地点",
        "医疗保险登记协助"
      ]
    },
    "ar": {
      "neighborhood": "Uphams Corner",
      "source": "صفحتا الاتصال والخصومات في Upham’s Corner Health Center؛ أداة تحديد المواقع التابعة للتعداد الأمريكي",
      "hoursNote": "تختلف الساعات حسب العيادة. اتصل على (617) 287-8000 لتأكيد المواعيد والساعات؛ للاستشارة الطبية خارج الدوام اتصل بالرقم نفسه. في حالة الطوارئ الطبية اتصل على 911.",
      "eligibility": "لا يرفض المركز تقديم الخدمات بسبب عدم وجود تأمين أو عدم القدرة على الدفع. تتوفر خصومات على معظم الخدمات لغير المؤمن عليهم أو ذوي التأمين غير الكافي ممن يستوفون الشروط؛ اسأل عن الأهلية والتكاليف.",
      "services": [
        "طب الأسرة والأطفال",
        "الصحة السلوكية",
        "الرعاية العاجلة (اتصل مسبقاً)",
        "عيادتا الأسنان والعيون: 636 Columbia Road، (617) 825-9839",
        "الصيدلية: 415 Columbia Road",
        "WIC: 547 Columbia Road، (617) 825-8994؛ أكّد موقع الخدمة",
        "المساعدة في التسجيل في التأمين الصحي"
      ]
    },
    "so": {
      "neighborhood": "Uphams Corner",
      "source": "Bogagga xiriirka iyo dhimista kharashka ee Upham’s Corner Health Center; aaladda cinwaan-raadinta Tirakoobka Maraykanka",
      "hoursNote": "Saacaduhu way ku kala duwan yihiin rugaha. Wac (617) 287-8000 si aad u xaqiijiso ballamaha iyo saacadaha; talo caafimaad oo ka baxsan saacadaha shaqada isla lambarkaas wac. Gurmad caafimaad marka uu jiro wac 911.",
      "eligibility": "Xaruntu ma diido adeeg sababtoo ah qofku caymis ma haysto ama ma bixin karo. Dadka u qalma ee aan caymis haysan ama caymiskoodu ku filnayn waxay heli karaan dhimis inta badan adeegyada; weydii shuruudaha iyo kharashka.",
      "services": [
        "Daawada qoyska iyo carruurta",
        "Caafimaadka habdhaqanka",
        "Daryeel degdeg ah (hore u wac)",
        "Rugaha ilkaha iyo indhaha: 636 Columbia Road, (617) 825-9839",
        "Farmashiye: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; xaqiiji goobta adeegga",
        "Caawinta diiwaangelinta caymiska caafimaadka"
      ]
    },
    "kea": {
      "neighborhood": "Uphams Corner",
      "source": "Pájinas di kontaktu i deskontu di Upham’s Corner Health Center; jeyokodifikador di Sensu di Stadus Unidus",
      "hoursNote": "Orárius ta varia konformi klínika. Txoma (617) 287-8000 pa konfirma konsulta i oráriu; pa konsédju clíniku fora di oráriu, txoma mesmu númeru. Na emergénsia médiku, txoma 911.",
      "eligibility": "Sentru ka ta nega servisus pa falta di siguransa ô pa ka podi paga. Pesoas elegível sen siguransa ô ku kobertura insufisienti podi ten deskontu na maioria di servisus; pergunta sobri kondisons i kustus.",
      "services": [
        "Medisina di família i pediatria",
        "Saúdi konportamental",
        "Kuidadu urjenti (txoma antis)",
        "Klínikas di denti i odju: 636 Columbia Road, (617) 825-9839",
        "Farmásia: 415 Columbia Road",
        "WIC: 547 Columbia Road, (617) 825-8994; konfirma lugar di servisu",
        "Ajudu pa inskrison na siguransa di saúdi"
      ]
    }
  }
};
