import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted drafts. Native-speaker and provider review is needed. */
export const LIBRARY_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "grove-hall-library": {
    "es": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Horario habitual de la sucursal: lunes de 10 a. m. a 6 p. m., martes de 12 p. m. a 8 p. m., miércoles y jueves de 10 a. m. a 6 p. m., viernes y sábado de 9 a. m. a 5 p. m.; domingo cerrado. El horario puede cambiar por feriados o eventos; consulte el sitio de la biblioteca o llame antes de ir.",
      "transit": "Línea Fairmount hasta Four Corners/Geneva; consulte las indicaciones actuales de MBTA para caminar y tomar autobuses.",
      "source": "Páginas de la sucursal Grove Hall y de impresión de bpl.org",
      "services": [
        "Préstamo de puntos de acceso y dispositivos (la disponibilidad varía)",
        "Grupos de conversación en inglés (confirme el horario)",
        "Preparación para la ciudadanía (confirme la disponibilidad)",
        "Ayuda con las tareas escolares",
        "Impresión (puede tener costo)"
      ]
    },
    "ht": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Lè nòmal bibliyotèk la: lendi 10 a.m.–6 p.m., madi 12 p.m.–8 p.m., mèkredi ak jedi 10 a.m.–6 p.m., vandredi ak samdi 9 a.m.–5 p.m.; dimanch fèmen. Lè yo ka chanje pou jou ferye oswa evènman; gade sit bibliyotèk la oswa rele anvan ou ale.",
      "transit": "Liy Fairmount pou Four Corners/Geneva; tcheke direksyon MBTA ki ajou pou mache ak pran bis.",
      "source": "Paj bpl.org sou bibliyotèk Grove Hall ak sou enpresyon",
      "services": [
        "Prete hotspot ak aparèy (disponibilite varye)",
        "Gwoup konvèsasyon an anglè (konfime orè a)",
        "Preparasyon pou sitwayènte (konfime disponiblite a)",
        "Èd ak devwa lekòl",
        "Enpresyon (ka gen frè)"
      ]
    },
    "pt": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Horário regular da unidade: segunda, 10h–18h; terça, 12h–20h; quarta e quinta, 10h–18h; sexta e sábado, 9h–17h; domingo fechado. O horário pode mudar em feriados ou eventos; consulte o site da biblioteca ou ligue antes de ir.",
      "transit": "Linha Fairmount até Four Corners/Geneva; consulte as rotas atuais da MBTA para caminhar e pegar ônibus.",
      "source": "Páginas da unidade Grove Hall e de impressão em bpl.org",
      "services": [
        "Empréstimo de pontos de acesso e dispositivos (disponibilidade variável)",
        "Grupos de conversação em inglês (confirme o horário)",
        "Preparação para a cidadania (confirme a disponibilidade)",
        "Ajuda com dever de casa",
        "Impressão (pode haver cobrança)"
      ]
    },
    "vi": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Giờ thường lệ của chi nhánh: thứ Hai 10 giờ sáng–6 giờ chiều, thứ Ba 12 giờ trưa–8 giờ tối, thứ Tư–thứ Năm 10 giờ sáng–6 giờ chiều, thứ Sáu–thứ Bảy 9 giờ sáng–5 giờ chiều; Chủ nhật đóng cửa. Giờ có thể thay đổi vào ngày lễ hoặc sự kiện; kiểm tra trang thư viện hoặc gọi trước khi đến.",
      "transit": "Tuyến Fairmount đến Four Corners/Geneva; kiểm tra chỉ dẫn đi bộ và xe buýt hiện tại của MBTA.",
      "source": "Trang chi nhánh Grove Hall và trang in ấn trên bpl.org",
      "services": [
        "Cho mượn bộ phát mạng và thiết bị (tùy tình trạng sẵn có)",
        "Nhóm hội thoại tiếng Anh (xác nhận lịch)",
        "Ôn thi quốc tịch (xác nhận tình trạng sẵn có)",
        "Hỗ trợ bài tập về nhà",
        "In ấn (có thể mất phí)"
      ]
    },
    "zh": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "分馆通常开放时间：周一上午 10 时至下午 6 时，周二中午 12 时至晚上 8 时，周三至周四上午 10 时至下午 6 时，周五至周六上午 9 时至下午 5 时；周日关闭。节假日或活动可能改变开放时间；前往前请查看图书馆网站或致电确认。",
      "transit": "乘 Fairmount 线至 Four Corners/Geneva；请查看 MBTA 最新步行和公交路线。",
      "source": "bpl.org 的 Grove Hall 分馆及打印服务页面",
      "services": [
        "热点和设备借用（视供应情况而定）",
        "英语会话小组（请确认时间）",
        "公民考试准备（请确认是否开设）",
        "家庭作业辅导",
        "打印（可能收费）"
      ]
    },
    "ar": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "المواعيد المعتادة للفرع: الاثنين من 10 صباحاً إلى 6 مساءً، الثلاثاء من 12 ظهراً إلى 8 مساءً، الأربعاء والخميس من 10 صباحاً إلى 6 مساءً، الجمعة والسبت من 9 صباحاً إلى 5 مساءً؛ مغلق الأحد. قد تتغير المواعيد في العطلات أو المناسبات؛ تحقق من موقع المكتبة أو اتصل قبل الزيارة.",
      "transit": "خط Fairmount إلى Four Corners/Geneva؛ تحقق من إرشادات MBTA الحالية للمشي والحافلات.",
      "source": "صفحتا فرع Grove Hall والطباعة على bpl.org",
      "services": [
        "إعارة نقاط اتصال وأجهزة (يختلف التوفر)",
        "مجموعات محادثة الإنجليزية (أكد الموعد)",
        "التحضير للمواطنة (أكد التوفر)",
        "المساعدة في الواجبات المدرسية",
        "الطباعة (قد تُفرض رسوم)"
      ]
    },
    "so": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Saacadaha caadiga ah ee laanta: Isniin 10 subaxnimo–6 fiidnimo, Talaado 12 duhurnimo–8 fiidnimo, Arbaco–Khamiis 10 subaxnimo–6 fiidnimo, Jimco–Sabti 9 subaxnimo–5 galabnimo; Axad waa xiran tahay. Saacaduhu way isbeddeli karaan maalmaha fasaxa ama dhacdooyinka; ka hubi bogga maktabadda ama wac ka hor booqashada.",
      "transit": "Khadka Fairmount ilaa Four Corners/Geneva; ka hubi MBTA tilmaamaha socodka iyo baska ee hadda jira.",
      "source": "Bogagga laanta Grove Hall iyo daabacaadda ee bpl.org",
      "services": [
        "Amaahda qalabka internetka iyo aaladaha (helitaanku wuu kala duwan yahay)",
        "Kooxaha wada sheekaysiga Ingiriisiga (xaqiiji jadwalka)",
        "Diyaarinta muwaadinnimada (xaqiiji helitaanka)",
        "Caawinta shaqada guriga",
        "Daabacaad (lacag ayaa laga yaabaa)"
      ]
    },
    "kea": {
      "neighborhood": "Grove Hall",
      "operator": "Boston Public Library",
      "hoursNote": "Oráriu regular di filiar: sigunda 10 di manhan–6 di tardi, tersa 12 di mei-dia–8 di noti, kuarta–kinta 10 di manhan–6 di tardi, sexta–sábadu 9 di manhan–5 di tardi; dumingu fetxadu. Oráriu podi muda na feriadus ô eventus; konsulta site di biblioteka ô txoma antis di bai.",
      "transit": "Linha Fairmount pa Four Corners/Geneva; konsulta direçons atual di MBTA pa anda a pé i pa autokaru.",
      "source": "Pájinas di biblioteka Grove Hall i di inpreson na bpl.org",
      "services": [
        "Empréstimu di hotspot i aparelhus (disponibilidadi ta varia)",
        "Grupus di konversa na inglês (konfirma oráriu)",
        "Preparason pa sidadania (konfirma disponibilidadi)",
        "Ajuda ku trabadju di skola",
        "Inpreson (podi ten kustu)"
      ]
    }
  }
};
