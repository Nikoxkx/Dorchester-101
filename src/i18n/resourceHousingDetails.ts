import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** AI-assisted drafts; native-speaker and housing-provider review is needed. */
export const HOUSING_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "metro-housing-boston": {
    "es": {
      "neighborhood": "Mission Hill (atiende a Dorchester)",
      "hoursNote": "Línea de recursos: lunes a jueves, de 9 a. m. a 1 p. m. Las visitas para HCEC y RAFT generalmente requieren cita; los lunes se atiende sin cita desde las 9 a. m. hasta alcanzar la capacidad. Vestíbulo: lunes a jueves, de 9 a. m. a 3 p. m. para entregar documentos, programar citas o hacer preguntas. Confirme antes de ir.",
      "eligibility": "Los requisitos y servicios varían según el programa; consulte a Metro Housing|Boston.",
      "transit": "Línea Naranja hasta Roxbury Crossing; Metro Housing|Boston está al otro lado de Tremont Street. Consulte el servicio actual de MBTA.",
      "source": "Páginas de contacto y RAFT de metrohousingboston.org; geocodificador del Censo",
      "services": [
        "Ayuda con solicitudes RAFT",
        "Ayuda con vales de alquiler",
        "Recursos para buscar vivienda",
        "Centro de Educación para Consumidores de Vivienda (HCEC)",
        "Derivaciones para obtener ayuda legal"
      ]
    },
    "ht": {
      "neighborhood": "Mission Hill (sèvi Dorchester)",
      "hoursNote": "Liy resous: lendi–jedi, 9 a.m.–1 p.m. Vizit pou HCEC ak RAFT anjeneral mande randevou; lendi yo resevwa moun san randevou depi 9 a.m. jiskaske yo rive nan kapasite yo. Sal resepsyon: lendi–jedi, 9 a.m.–3 p.m. pou remèt dokiman, pran randevou oswa poze kesyon. Konfime anvan ou ale.",
      "eligibility": "Kondisyon ak sèvis yo varye selon pwogram nan; mande Metro Housing|Boston.",
      "transit": "Liy Oranj pou Roxbury Crossing; Metro Housing|Boston se lòt bò Tremont Street. Tcheke sèvis MBTA ki ajou.",
      "source": "Paj kontak ak RAFT sou metrohousingboston.org; jeyokodè Resansman an",
      "services": [
        "Èd ak aplikasyon RAFT",
        "Èd pou vouchè lwaye",
        "Resous pou chèche lojman",
        "Sant Edikasyon pou Konsomatè Lojman (HCEC)",
        "Referans pou jwenn èd legal"
      ]
    },
    "pt": {
      "neighborhood": "Mission Hill (atende Dorchester)",
      "hoursNote": "Linha de recursos: segunda a quinta, das 9h às 13h. As visitas ao HCEC e ao RAFT geralmente exigem agendamento; às segundas há atendimento sem agendamento a partir das 9h até atingir a capacidade. Recepção: segunda a quinta, das 9h às 15h para entregar documentos, agendar ou fazer perguntas. Confirme antes de ir.",
      "eligibility": "Os requisitos e serviços variam por programa; pergunte à Metro Housing|Boston.",
      "transit": "Linha Laranja até Roxbury Crossing; a Metro Housing|Boston fica do outro lado da Tremont Street. Consulte o serviço atual da MBTA.",
      "source": "Páginas de contato e RAFT em metrohousingboston.org; geocodificador do Censo",
      "services": [
        "Ajuda com inscrições no RAFT",
        "Ajuda com vouchers de aluguel",
        "Recursos para busca de moradia",
        "Centro de Educação do Consumidor de Moradia (HCEC)",
        "Encaminhamentos para assistência jurídica"
      ]
    },
    "vi": {
      "neighborhood": "Mission Hill (phục vụ Dorchester)",
      "hoursNote": "Đường dây hỗ trợ: thứ Hai–thứ Năm, 9 giờ sáng–1 giờ chiều. Gặp HCEC và RAFT thường cần đặt lịch; thứ Hai nhận người không hẹn từ 9 giờ sáng đến khi đủ chỗ. Sảnh mở thứ Hai–thứ Năm, 9 giờ sáng–3 giờ chiều để nộp giấy tờ, đặt lịch hoặc hỏi thông tin. Hãy xác nhận trước khi đến.",
      "eligibility": "Điều kiện và dịch vụ khác nhau theo chương trình; hãy hỏi Metro Housing|Boston.",
      "transit": "Tuyến Cam đến Roxbury Crossing; Metro Housing|Boston nằm phía bên kia Tremont Street. Kiểm tra dịch vụ MBTA hiện tại.",
      "source": "Trang liên hệ và RAFT trên metrohousingboston.org; công cụ định vị địa chỉ của Cục Điều tra Dân số",
      "services": [
        "Hỗ trợ đơn RAFT",
        "Hỗ trợ phiếu thuê nhà",
        "Nguồn tìm kiếm nhà ở",
        "Trung tâm Giáo dục Người tiêu dùng Nhà ở (HCEC)",
        "Giới thiệu đến hỗ trợ pháp lý"
      ]
    },
    "zh": {
      "neighborhood": "Mission Hill（服务 Dorchester）",
      "hoursNote": "资源热线：周一至周四，上午 9 时至下午 1 时。HCEC 和 RAFT 现场服务通常需要预约；周一上午 9 时起接待未预约者，额满为止。大厅周一至周四上午 9 时至下午 3 时开放，可递交文件、预约或咨询。前往前请先确认。",
      "eligibility": "资格和服务因项目而异；请咨询 Metro Housing|Boston。",
      "transit": "乘橙线至 Roxbury Crossing；Metro Housing|Boston 位于 Tremont Street 对面。请查看 MBTA 当前服务。",
      "source": "metrohousingboston.org 的联系和 RAFT 页面；人口普查局地址定位工具",
      "services": [
        "RAFT 申请帮助",
        "租房代金券帮助",
        "住房搜索资源",
        "住房消费者教育中心（HCEC）",
        "法律帮助转介"
      ]
    },
    "ar": {
      "neighborhood": "Mission Hill (تخدم Dorchester)",
      "hoursNote": "خط الموارد: من الاثنين إلى الخميس، من 9 صباحاً إلى 1 ظهراً. تتطلب زيارات HCEC وRAFT عادةً موعداً؛ ويبدأ استقبال الحاضرين دون موعد يوم الاثنين الساعة 9 صباحاً حتى اكتمال العدد. صالة الاستقبال: من الاثنين إلى الخميس، من 9 صباحاً إلى 3 عصراً لتسليم المستندات أو حجز موعد أو طرح الأسئلة. تأكد قبل الزيارة.",
      "eligibility": "تختلف الأهلية والخدمات حسب البرنامج؛ اسأل Metro Housing|Boston.",
      "transit": "الخط البرتقالي إلى Roxbury Crossing؛ تقع Metro Housing|Boston على الجانب الآخر من Tremont Street. تحقق من خدمة MBTA الحالية.",
      "source": "صفحتا الاتصال وRAFT على metrohousingboston.org وأداة تحديد العناوين التابعة للتعداد",
      "services": [
        "المساعدة في طلب RAFT",
        "المساعدة في قسائم الإيجار",
        "موارد البحث عن السكن",
        "مركز تثقيف مستهلكي الإسكان (HCEC)",
        "إحالات للحصول على مساعدة قانونية"
      ]
    },
    "so": {
      "neighborhood": "Mission Hill (u adeegta Dorchester)",
      "hoursNote": "Khadka macluumaadka: Isniin–Khamiis, 9 subaxnimo–1 duhurnimo. Booqashooyinka HCEC iyo RAFT badanaa waxay u baahan yihiin ballan; Isniinta waxaa la qaabilaa dadka aan ballanta lahayn laga bilaabo 9 subaxnimo ilaa boosasku buuxsamaan. Hoolka: Isniin–Khamiis, 9 subaxnimo–3 galabnimo si dukumenti loo dhiibo, ballan loo qabsado ama su'aalo loo weydiiyo. Xaqiiji ka hor booqashada.",
      "eligibility": "Shuruudaha iyo adeegyadu way ku kala duwan yihiin barnaamijka; weydii Metro Housing|Boston.",
      "transit": "Khadka Oranjiga ilaa Roxbury Crossing; Metro Housing|Boston waxay ku taallaa dhinaca kale ee Tremont Street. Hubi adeegga MBTA ee hadda jira.",
      "source": "Bogagga xiriirka iyo RAFT ee metrohousingboston.org; aaladda cinwaan-raadinta Tirakoobka",
      "services": [
        "Caawinta codsiga RAFT",
        "Caawinta foojarrada kirada",
        "Ilaha guri-raadinta",
        "Xarunta Waxbarashada Macaamiisha Guryaha (HCEC)",
        "U gudbinta caawimaad sharci"
      ]
    },
    "kea": {
      "neighborhood": "Mission Hill (ta serbi Dorchester)",
      "hoursNote": "Linha di rekursus: sigunda a kinta, di 9 di manhan té 1 di tardi. Vizitas pa HCEC i RAFT normalmenti mesti markason; na sigunda ta resebe pesoas sen markason di 9 di manhan té kapasidadi intxi. Reseson: sigunda a kinta, di 9 di manhan té 3 di tardi pa intrega dokumentus, marka vizita ô faze perguntas. Konfirma antis di bai.",
      "eligibility": "Rekizitus i servisus ta varia sigundu programa; purgunta Metro Housing|Boston.",
      "transit": "Linha Laranja pa Roxbury Crossing; Metro Housing|Boston fika na otu ladu di Tremont Street. Konsulta servisu atual di MBTA.",
      "source": "Pájinas di kontatu i RAFT na metrohousingboston.org; ferramenta di lokalizason di Resenseamentu",
      "services": [
        "Ajuda ku kandidatura RAFT",
        "Ajuda ku vouchér di renda",
        "Rekursus pa buska kasa",
        "Sentru di Edukason di Konsumidor di Abitason (HCEC)",
        "Inkaminhamentu pa ajuda jurídiku"
      ]
    }
  },
  "housing-navigator-ma": {
    "es": {
      "neighborhood": "Todo el estado",
      "address": "Servicio en línea",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Cualquier persona puede buscar; los requisitos varían por anuncio. Confirme los detalles con la propiedad.",
      "services": [
        "Anuncios de alquiler con límite de ingresos",
        "Contactos para solicitudes",
        "Filtros de hogar y alquiler",
        "Filtros de accesibilidad"
      ]
    },
    "ht": {
      "neighborhood": "Tout eta a",
      "address": "Sèvis sou entènèt",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Nenpòt moun ka chèche; kondisyon yo varye selon anons lan. Konfime detay yo ak pwopriyete a.",
      "services": [
        "Anons lokasyon ak limit revni",
        "Kontak pou aplikasyon",
        "Filtè kay ak lwaye",
        "Filtè aksè"
      ]
    },
    "pt": {
      "neighborhood": "Todo o estado",
      "address": "Serviço on-line",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Qualquer pessoa pode pesquisar; os requisitos variam por anúncio. Confirme os detalhes com a propriedade.",
      "services": [
        "Anúncios de aluguel com limite de renda",
        "Contatos para inscrições",
        "Filtros de família e aluguel",
        "Filtros de acessibilidade"
      ]
    },
    "vi": {
      "neighborhood": "Toàn tiểu bang",
      "address": "Dịch vụ trực tuyến",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Bất kỳ ai cũng có thể tìm kiếm; điều kiện tùy từng tin. Xác nhận chi tiết với nơi quản lý.",
      "services": [
        "Tin nhà thuê giới hạn thu nhập",
        "Liên hệ nộp đơn",
        "Bộ lọc hộ gia đình và tiền thuê",
        "Bộ lọc khả năng tiếp cận"
      ]
    },
    "zh": {
      "neighborhood": "全州",
      "address": "线上服务",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "任何人都可搜索；资格要求因房源而异。请向物业确认详情。",
      "services": [
        "收入限制租房信息",
        "申请联系人",
        "家庭及租金筛选",
        "无障碍筛选"
      ]
    },
    "ar": {
      "neighborhood": "على مستوى الولاية",
      "address": "خدمة عبر الإنترنت",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "يمكن للجميع البحث؛ تختلف شروط كل إعلان. أكّد التفاصيل مع العقار.",
      "services": [
        "إعلانات إيجار مقيّدة بالدخل",
        "جهات الاتصال للتقديم",
        "مرشحات الأسرة والإيجار",
        "مرشحات إمكانية الوصول"
      ]
    },
    "so": {
      "neighborhood": "Gobolka oo dhan",
      "address": "Adeeg onlayn ah",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Qof kasta wuu raadin karaa; shuruuduhu waxay ku kala duwan yihiin xayeysiisyada. Faahfaahinta ka xaqiiji guriga.",
      "services": [
        "Xayeysiisyada kirooyinka dakhligu xaddidan yahay",
        "Xiriirrada codsiga",
        "Shaandhooyinka qoyska iyo kirada",
        "Shaandhooyinka gelitaanka"
      ]
    },
    "kea": {
      "neighborhood": "Stadu interu",
      "address": "Servisu online",
      "operator": "Housing Navigator Massachusetts",
      "eligibility": "Kualker pesoa podi buska; rekizitus ta varia pa kada anúnsiu. Konfirma detalhis ku propriedadi.",
      "services": [
        "Anúnsus di arendamentu ku limitason di rendimentu",
        "Kontaktus pa kandidaturas",
        "Filtrus di família y renda",
        "Filtrus di asesibilidadi"
      ]
    }
  },
  "metrolist-boston": {
    "es": {
      "neighborhood": "Government Center",
      "operator": "Oficina del Alcalde de Vivienda de Boston",
      "hoursNote": "Oficina del Alcalde de Vivienda: lunes a viernes de 9 a. m. a 5 p. m. Confirme antes de visitar.",
      "eligibility": "Los requisitos de ingresos, tamaño del hogar y otros criterios varían. Consulte al contacto de cada anuncio.",
      "services": [
        "Anuncios de vivienda con límite de ingresos",
        "Enlaces a solicitudes de cada propiedad",
        "Estimador AMI",
        "Resumen semanal de anuncios"
      ]
    },
    "ht": {
      "neighborhood": "Government Center",
      "operator": "Biwo Majistra a pou Lojman nan Boston",
      "hoursNote": "Biwo Majistra a pou Lojman: lendi–vandredi 9 a.m.–5 p.m. Konfime anvan ou ale.",
      "eligibility": "Kondisyon revni, kantite moun nan kay ak lòt règ varye. Mande kontak chak anons.",
      "services": [
        "Anons lojman ak limit revni",
        "Lyen aplikasyon chak pwopriyete",
        "Estimatè AMI",
        "Rezime anons chak semèn"
      ]
    },
    "pt": {
      "neighborhood": "Government Center",
      "operator": "Escritório de Habitação da Prefeitura de Boston",
      "hoursNote": "Escritório de Habitação da Prefeitura: segunda a sexta, das 9h às 17h. Confirme antes de visitar.",
      "eligibility": "Requisitos de renda, tamanho da família e outros critérios variam. Consulte o contato de cada anúncio.",
      "services": [
        "Anúncios de moradia com limite de renda",
        "Links de inscrição de cada propriedade",
        "Estimador AMI",
        "Resumo semanal de anúncios"
      ]
    },
    "vi": {
      "neighborhood": "Government Center",
      "operator": "Văn phòng Nhà ở của Thị trưởng Boston",
      "hoursNote": "Văn phòng Nhà ở của Thị trưởng: thứ Hai–thứ Sáu, 9 giờ sáng–5 giờ chiều. Xác nhận trước khi đến.",
      "eligibility": "Yêu cầu thu nhập, số người trong hộ và các tiêu chí khác khác nhau. Hỏi người liên hệ của từng tin.",
      "services": [
        "Tin nhà ở giới hạn thu nhập",
        "Liên kết nộp đơn tại từng nơi",
        "Công cụ ước tính AMI",
        "Bản tin nhà ở hằng tuần"
      ]
    },
    "zh": {
      "neighborhood": "Government Center",
      "operator": "波士顿市长住房办公室",
      "hoursNote": "市长住房办公室：周一至周五上午 9 点至下午 5 点。前往前请确认。",
      "eligibility": "收入、家庭人数和其他要求各不相同。请咨询每条房源的联系人。",
      "services": [
        "收入限制住房信息",
        "各物业申请链接",
        "AMI 估算工具",
        "每周房源摘要"
      ]
    },
    "ar": {
      "neighborhood": "Government Center",
      "operator": "مكتب الإسكان التابع لعمدة بوسطن",
      "hoursNote": "مكتب الإسكان التابع للعمدة: الاثنين–الجمعة 9 صباحًا–5 مساءً. أكّد قبل الزيارة.",
      "eligibility": "تختلف متطلبات الدخل وحجم الأسرة وغيرها. اسأل جهة الاتصال في كل إعلان.",
      "services": [
        "إعلانات سكن مقيّد بالدخل",
        "روابط طلبات كل عقار",
        "أداة تقدير AMI",
        "ملخص الإعلانات الأسبوعي"
      ]
    },
    "so": {
      "neighborhood": "Government Center",
      "operator": "Xafiiska Guryaha ee Duqa Boston",
      "hoursNote": "Xafiiska Guryaha ee Duqa: Isniin–Jimce 9 subaxnimo–5 galabnimo. Xaqiiji ka hor booqashada.",
      "eligibility": "Shuruudaha dakhliga, tirada qoyska iyo kuwa kale way kala duwan yihiin. Weydii xiriirka xayeysiis kasta.",
      "services": [
        "Xayeysiisyada guryaha dakhligu xaddidan yahay",
        "Xiriirrada codsiga guri kasta",
        "Qiyaasaha AMI",
        "Warbixinta xayeysiisyada toddobaadlaha ah"
      ]
    },
    "kea": {
      "neighborhood": "Government Center",
      "operator": "Gabineti di Abitason di Prezidenti di Câmara di Boston",
      "hoursNote": "Gabineti di Abitason: sigunda–sexta, 9 di manhan–5 di tardi. Konfirma antis di vizita.",
      "eligibility": "Rekizitus di rendimentu, tamanhu di família y ôtus ta varia. Purgunta kontakto di kada anúnsiu.",
      "services": [
        "Anúnsus di kaza ku limitason di rendimentu",
        "Links pa kandidatura di kada propriedadi",
        "Stimador AMI",
        "Rezumu semanal di anúnsus"
      ]
    }
  }
};
