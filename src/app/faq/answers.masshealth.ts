import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts. Confirm coverage and immigration-related rules
 * with MassHealth and qualified native speakers before relying on them. */
export const MASSHEALTH_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**MassHealth** se pwogram Medicaid Massachusetts la. Li ofri kouvèti sante pou rezidan ki kalifye; benefis ak pri yo depann de kalite kouvèti a.

**Kiyès ki ka kalifye:**
- Chak kalite kouvèti gen règ diferan pou granmoun, timoun, moun ansent, moun aje ak moun ki gen andikap. Kalifikasyon ka depann de revni, kantite moun nan kay la, rezidans, estati imigrasyon ak lòt faktè.
- Pa egzanp, CarePlus se pou kèk granmoun 21–64 ane ki satisfè règ li yo; estanda revni li itilize revni brit ajiste modifye ki egal oswa pi ba pase 133% nivo povrete federal la, ak ajisteman ki aplikab. Lòt kouvèti ka gen limit diferan.
- Opsyon pou moun ki pa sitwayen yo diferan. Mande yon espesyalis enskripsyon sou sitiyasyon ou olye ou sipoze ou pa ka jwenn èd.

**Kijan pou aplike:**
1. Anpil moun ak fanmi ka kòmanse sou entènèt nan mahealthconnector.org. Moun 65 ane oswa plis ak moun ki bezwen swen alontèm ka itilize yon lòt aplikasyon; mande MassHealth ki fòm pou itilize.
2. Rele MassHealth: (800) 841-2900; TTY: 711.
3. Mande èd nan yon sant sante kominotè oswa nan men yon konseye enskripsyon. Liy èd gratis plizyè lang Health Care For All la se (800) 272-4232.

Yo ka mande enfòmasyon sou kay la ak revni, rezidans nan Massachusetts, asirans aktyèl, nimewo Sekirite Sosyal moun k ap aplike yo si yo genyen yo, ak enfòmasyon sou sitwayènte oswa imigrasyon. MassHealth ka mande lòt dokiman. Tretman an ka pran plizyè semèn; reponn demann yo anvan dat limit yo.

**Èd lokal:** Ekip enskripsyon asirans Codman Square Health Center: (617) 822-8162. Rele davans pou randevou ak dokiman yo.`,
  pt: `O **MassHealth** é o programa Medicaid de Massachusetts. Ofere cobertura de saúde a residentes elegíveis; benefícios e custos dependem do tipo de cobertura.

**Quem pode se qualificar:**
- Os tipos de cobertura têm regras diferentes para adultos, crianças, gestantes, idosos e pessoas com deficiência. A elegibilidade pode depender da renda, do tamanho da família, da residência, da situação imigratória e de outros fatores.
- Por exemplo, o CarePlus atende alguns adultos de 21–64 anos que cumprem suas regras; seu padrão usa renda bruta ajustada modificada igual ou inferior a 133% do nível federal de pobreza, com os ajustes aplicáveis. Outras coberturas podem ter limites diferentes.
- As opções para não cidadãos variam. Pergunte a um especialista em inscrição sobre sua situação em vez de presumir que não pode receber ajuda.

**Como solicitar:**
1. Muitas pessoas e famílias podem começar online em mahealthconnector.org. Pessoas de 65 anos ou mais e quem precisa de cuidados de longa duração pode usar outra inscrição; pergunte ao MassHealth qual formulário usar.
2. Ligue para o MassHealth: (800) 841-2900; TTY: 711.
3. Peça ajuda a um centro comunitário de saúde ou a um orientador de inscrição. A linha multilíngue gratuita da Health Care For All é (800) 272-4232.

Podem ser solicitadas informações sobre família e renda, residência em Massachusetts, seguro atual, números do Seguro Social de quem solicita, se disponíveis, e cidadania ou imigração. O MassHealth pode pedir outros documentos. A análise pode levar semanas; responda aos pedidos dentro dos prazos.

**Ajuda local:** Equipe de inscrição em seguros do Codman Square Health Center: (617) 822-8162. Ligue antes para perguntar sobre consultas e documentos.`,
  vi: `**MassHealth** là chương trình Medicaid của Massachusetts. Chương trình cung cấp bảo hiểm y tế cho cư dân đủ điều kiện; quyền lợi và chi phí tùy loại bảo hiểm.

**Ai có thể đủ điều kiện:**
- Các loại bảo hiểm có quy định khác nhau cho người lớn, trẻ em, người mang thai, người cao tuổi và người khuyết tật. Điều kiện có thể phụ thuộc thu nhập, quy mô hộ, nơi cư trú, tình trạng nhập cư và các yếu tố khác.
- Ví dụ, CarePlus dành cho một số người lớn 21–64 tuổi đáp ứng quy định; chuẩn thu nhập dùng thu nhập gộp điều chỉnh đã sửa đổi không quá 133% chuẩn nghèo liên bang, có các điều chỉnh áp dụng. Loại bảo hiểm khác có thể có giới hạn khác.
- Lựa chọn bảo hiểm cho người không phải công dân khác nhau. Hãy hỏi chuyên viên hỗ trợ đăng ký về trường hợp của bạn thay vì tự cho rằng mình không thể được giúp.

**Cách nộp đơn:**
1. Nhiều cá nhân và gia đình có thể bắt đầu trực tuyến tại mahealthconnector.org. Người từ 65 tuổi và người cần chăm sóc dài hạn có thể dùng đơn khác; hãy hỏi MassHealth nên dùng mẫu nào.
2. Gọi MassHealth: (800) 841-2900; TTY: 711.
3. Nhờ trung tâm y tế cộng đồng hoặc tư vấn viên đăng ký giúp đỡ. Đường dây trợ giúp đa ngôn ngữ miễn phí của Health Care For All là (800) 272-4232.

Bạn có thể được yêu cầu cung cấp thông tin hộ và thu nhập, cư trú tại Massachusetts, bảo hiểm hiện có, số An sinh Xã hội của người nộp đơn nếu có, và thông tin quốc tịch hoặc nhập cư. MassHealth có thể yêu cầu giấy tờ bổ sung. Việc xử lý có thể mất nhiều tuần; hãy đáp ứng yêu cầu đúng hạn.

**Trợ giúp địa phương:** Nhóm hỗ trợ đăng ký bảo hiểm của Codman Square Health Center: (617) 822-8162. Hãy gọi trước để hỏi về lịch hẹn và giấy tờ.`,
  zh: `**MassHealth**是马萨诸塞州的 Medicaid 计划，为符合条件的居民提供医疗保障；福利和费用取决于保障类型。

**谁可能符合条件：**
- 不同保障类型对成人、儿童、孕妇、老年人和残障人士有不同规定。资格可能取决于收入、家庭人数、居住情况、移民身份和其他因素。
- 例如，CarePlus 面向部分符合其规定的 21–64 岁成年人；其收入标准使用不超过联邦贫困线 133% 的调整后总收入（按规定调整）。其他保障的限额可能不同。
- 非公民的保障选择因情况而异。请向登记专员询问您的情况，不要自行认为无法获得帮助。

**如何申请：**
1. 许多个人和家庭可以在 mahealthconnector.org 在线开始申请。65 岁及以上人士和需要长期护理的人可能使用不同申请表；请询问 MassHealth 应使用哪种表格。
2. 致电 MassHealth：(800) 841-2900；TTY：711。
3. 向社区健康中心或登记顾问寻求帮助。Health Care For All 的免费多语言帮助热线为 (800) 272-4232。

您可能需要提供家庭和收入信息、马萨诸塞州居住情况、现有保险、申请人已有的社会安全号码，以及公民或移民身份信息。MassHealth 可能要求补充文件。处理可能需要数周；请在规定期限内回应要求。

**当地帮助：**Codman Square Health Center 保险登记团队：(617) 822-8162。请提前致电询问预约和文件。`,
  ar: `**MassHealth** هو برنامج Medicaid في Massachusetts. يوفر تغطية صحية للمقيمين المؤهلين؛ وتختلف المنافع والتكاليف حسب نوع التغطية.

**من قد يكون مؤهلاً:**
- تختلف قواعد أنواع التغطية للبالغين والأطفال والحوامل وكبار السن والأشخاص ذوي الإعاقة. قد تعتمد الأهلية على الدخل وحجم الأسرة والإقامة ووضع الهجرة وعوامل أخرى.
- مثلاً، CarePlus لبعض البالغين من 21 إلى 64 عاماً الذين يستوفون قواعده؛ ويستخدم معيار دخله الدخل الإجمالي المعدل وفق التعريف الخاص بالبرنامج عند أو دون 133% من مستوى الفقر الفيدرالي، مع التعديلات المطبقة. قد تختلف حدود التغطيات الأخرى.
- تختلف خيارات التغطية لغير المواطنين. اسأل اختصاصي التسجيل عن حالتك بدلاً من افتراض أنك لا تستطيع الحصول على المساعدة.

**طريقة التقديم:**
1. يمكن لكثير من الأفراد والأسر البدء عبر mahealthconnector.org. قد يستخدم الأشخاص بعمر 65 عاماً فأكثر ومن يحتاجون إلى رعاية طويلة الأمد طلباً مختلفاً؛ اسأل MassHealth عن النموذج المناسب.
2. اتصل بـ MassHealth على (800) 841-2900؛ الهاتف النصي TTY: 711.
3. اطلب المساعدة من مركز صحي مجتمعي أو مستشار تسجيل. خط المساعدة المجاني متعدد اللغات لدى Health Care For All هو (800) 272-4232.

قد تُطلب معلومات عن الأسرة والدخل والإقامة في Massachusetts والتأمين الحالي وأرقام الضمان الاجتماعي للمتقدمين إن توفرت ومعلومات الجنسية أو الهجرة. قد يطلب MassHealth مستندات إضافية. قد تستغرق المعالجة أسابيع؛ استجب للطلبات قبل مواعيدها النهائية.

**مساعدة محلية:** فريق التسجيل للتأمين في Codman Square Health Center: (617) 822-8162. اتصل مسبقاً للاستفسار عن المواعيد والمستندات.`,
  so: `**MassHealth** waa barnaamijka Medicaid ee Massachusetts. Wuxuu caymis caafimaad siiyaa dadka u qalma; dheefaha iyo kharashku waxay ku xiran yihiin nooca caymiska.

**Cidda laga yaabo inay u qalanto:**
- Noocyada caymisku waxay leeyihiin xeerar kala duwan oo dadka waaweyn, carruurta, dadka uurka leh, waayeelka iyo dadka naafada ah. U-qalmitaanku wuxuu ku xirnaan karaa dakhli, cabbirka qoyska, deganaansho, xaaladda socdaalka iyo arrimo kale.
- Tusaale ahaan, CarePlus waxaa loogu talagalay qaar ka mid ah dadka waaweyn ee 21–64 jirka ah ee buuxiya xeerarkiisa; heerka dakhliga wuxuu isticmaalaa dakhliga guud ee la hagaajiyay oo aan ka badnayn 133% heerka faqriga federaalka, iyadoo la adeegsanayo hagaajinta khuseysa. Caymisyada kale waxay yeelan karaan xadad kale.
- Ikhtiyaarrada aan muwaadiniinta ahayn way kala duwan yihiin. Weydii khabiir diiwaangelin xaaladdaada halkii aad ka malayn lahayd inaadan heli karin caawimo.

**Sida loo codsado:**
1. Dad iyo qoysas badan waxay online ka bilaabi karaan mahealthconnector.org. Dadka 65 jir ama ka weyn iyo kuwa u baahan daryeel muddo dheer ah waxay isticmaali karaan codsi kale; weydii MassHealth foomka ku habboon.
2. Wac MassHealth: (800) 841-2900; TTY: 711.
3. Caawimo weydii xarun caafimaad bulsho ama la-taliye diiwaangelin. Khadka caawinta luqadaha badan ee bilaashka ah ee Health Care For All waa (800) 272-4232.

Waxaa lagu weydiin karaa macluumaadka qoyska iyo dakhliga, deganaanshaha Massachusetts, caymiska hadda, lambarrada Social Security ee codsadayaasha haddii ay hayaan, iyo macluumaadka muwaadinnimada ama socdaalka. MassHealth waxay codsan kartaa dukumiintiyo dheeraad ah. Farsamayntu waxay qaadan kartaa toddobaadyo; uga jawaab codsiyada waqtigooda.

**Caawimo deegaanka ah:** Kooxda diiwaangelinta caymiska ee Codman Square Health Center: (617) 822-8162. Hore u wac si aad u weydiiso ballamaha iyo dukumiintiyada.`,
  kea: `**MassHealth** é programa Medicaid di Massachusetts. El ta ofrese kobertura di saúdi pa morador elegível; benefísius i kustus ta dipendi di tipu di kobertura.

**Ken ki podi kalifika:**
- Tipus di kobertura ten regras diferenti pa adultus, kriansas, pésuas grávida, idozus i pésuas ku defisiénsia. Elegibilidadi podi dipendi di rendimentu, tamanhu di família, rezidénsia, situason migratóriu i otus fator.
- Pa ezemplu, CarePlus é pa algun adultu di 21–64 anu ki ta kumpri ses regras; padron di rendimentu ta uza rendimentu brutu ajustadu modifikadu igual ô inferior a 133% di nivel federal di pobrezi, ku ajustis aplikável. Otus koberturas podi ten limitis diferenti.
- Opsons pa pésuas ki ka é sidadon ta varia. Pergunta un spesialista di inskrison sobri bu situason en vez di supor ma bu ka podi resebe ajuda.

**Modu di kandidata:**
1. Txeu pésua i família podi kumesa online na mahealthconnector.org. Pésuas di 65 anu ô más i kes ki mesti kuidadu di longu prazo podi uza un otus kandidatura; pergunta MassHealth kal formuláriu uza.
2. Txoma MassHealth: (800) 841-2900; TTY: 711.
3. Pidi ajuda na un sentru di saúdi komunitáriu ô ku un konselheru di inskrison. Linha di ajuda multilingui di grasa di Health Care For All é (800) 272-4232.

Es podi pidi informason di família i rendimentu, rezidénsia na Massachusetts, segurus atual, númaru di Seguransa Sosial di kandidatus si es ten, i informason di sidadania ô imigrason. MassHealth podi pidi otus dokumentus. Prosesamentu podi demora simanas; responde pididus dentru di ses prazo.

**Ajuda lokal:** Ekipa di inskrison di seguru di Codman Square Health Center: (617) 822-8162. Txoma antis pa pergunta sobri konsulta i dokumentus.`,
};
