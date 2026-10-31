import type { Language } from '@/stores/appStore';

/** AI-assisted drafts; confirm benefit rules and amounts with DUA. */
export const UNEMPLOYMENT_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**Asirans Chomaj Massachusetts (UI)** bay kèk travayè revni tanporè lè yo pèdi travay yo oswa lè yo diminye lè travay yo anpil san se pa fòt yo.

**Kalifikasyon:** An jeneral, moun k ap aplike yo dwe otorize pou travay, kapab ak disponib pou travay, epi ap chèche travay aktivman. Kondisyon salè yo gen ladan omwen $6,300 nan peryòd debaz ki aplikab la ak omwen 30 fwa montan benefis chak semèn nan; lòt règ ak eksepsyon egziste. Department of Unemployment Assistance (DUA) deside kalifikasyon.

**Aplike:** Soumèt aplikasyon sou entènèt atravè mass.gov/unemployment oswa rele DUA nan (877) 626-6800; relè vwa 711. Prepare nimewo Sekirite Sosyal ou, kowòdone ou ak enfòmasyon sou patwon resan yo. Mande DUA kisa ankò ki nesesè.

**Benefis:** Montan chak semèn nan se jeneralman anviwon 50% salè mwayèn chak semèn ou, jiska maksimòm legal la. Depi 4 oktòb 2026, maksimòm sa a se $1,154 pa semèn; li ka chanje. Kèk moun ki kalifye ka resevwa yon alokasyon pou depandan. Dire maksimòm aktyèl la se 30 semèn, men kèk reklamasyon ka pi kout epi règ yo ka chanje.

Apre ou aplike, mande benefis epi sètifye chak semèn selon enstriksyon yo, tankou enfòmasyon sou rechèch travay lè sa nesesè. Deklare revni ou epi reponn demann DUA alè.`,
  pt: `O **Seguro-Desemprego de Massachusetts (UI)** oferece renda temporária a alguns trabalhadores que perdem o emprego ou têm suas horas muito reduzidas sem culpa própria.

**Elegibilidade:** Em geral, quem solicita deve estar autorizado a trabalhar, estar apto e disponível para trabalhar e procurar emprego ativamente. Os requisitos salariais incluem pelo menos $6,300 no período-base aplicável e pelo menos 30 vezes o benefício semanal; outras regras e exceções se aplicam. O Department of Unemployment Assistance (DUA) decide a elegibilidade.

**Solicitação:** Envie o pedido online pelo mass.gov/unemployment ou ligue para o DUA no (877) 626-6800; retransmissão de voz 711. Tenha seu número do Seguro Social, dados de contato e informações de empregadores recentes. Pergunte ao DUA o que mais é necessário.

**Benefícios:** O valor semanal geralmente é cerca de 50% do salário semanal médio, até o máximo legal. Desde 4 de outubro de 2026, esse máximo é $1,154 por semana; ele pode mudar. Algumas pessoas elegíveis podem receber uma ajuda por dependentes. A duração máxima atual é de 30 semanas, mas pedidos individuais podem durar menos e as regras podem mudar.

Após solicitar, peça benefícios e faça a certificação semanal conforme as instruções, incluindo informações de busca de emprego quando exigidas. Informe os rendimentos e responda aos pedidos do DUA no prazo.`,
  vi: `**Bảo hiểm thất nghiệp Massachusetts (UI)** cung cấp thu nhập tạm thời cho một số người lao động mất việc hoặc bị giảm đáng kể giờ làm mà không do lỗi của họ.

**Điều kiện:** Người nộp đơn thường phải được phép làm việc, có khả năng và sẵn sàng làm việc, đồng thời tích cực tìm việc. Yêu cầu về tiền lương gồm ít nhất $6,300 trong kỳ cơ sở áp dụng và ít nhất 30 lần mức trợ cấp hàng tuần; còn có quy định và ngoại lệ khác. Department of Unemployment Assistance (DUA) quyết định điều kiện hưởng.

**Nộp đơn:** Nộp trực tuyến qua mass.gov/unemployment hoặc gọi DUA theo số (877) 626-6800; chuyển tiếp thoại 711. Chuẩn bị số An sinh Xã hội, thông tin liên hệ và thông tin về các chủ sử dụng lao động gần đây. Hỏi DUA cần thêm những gì.

**Trợ cấp:** Mức hàng tuần thường khoảng 50% tiền lương trung bình hàng tuần, tối đa bằng mức pháp luật quy định. Từ ngày 4 tháng 10 năm 2026, mức tối đa là $1,154 mỗi tuần; mức này có thể thay đổi. Một số người đủ điều kiện có thể nhận thêm trợ cấp cho người phụ thuộc. Thời hạn tối đa hiện tại là 30 tuần, nhưng từng hồ sơ có thể ngắn hơn và quy định có thể thay đổi.

Sau khi nộp đơn, hãy yêu cầu trợ cấp và xác nhận hàng tuần theo hướng dẫn, bao gồm thông tin tìm việc khi được yêu cầu. Khai báo thu nhập và trả lời các yêu cầu của DUA đúng hạn.`,
  zh: `**马萨诸塞州失业保险（UI）**为部分非因自身过错失业或工作时间大幅减少的劳动者提供临时收入。

**资格：**申请人通常须有工作许可、有能力且可以工作，并积极寻找工作。工资要求包括在适用的基期内至少赚取 $6,300，且至少达到每周福利金额的 30 倍；其他规定和例外也适用。Department of Unemployment Assistance（DUA）决定是否符合资格。

**申请：**通过 mass.gov/unemployment 在线申请，或致电 DUA：(877) 626-6800；语音转接 711。请准备社会安全号码、联系方式和近期雇主信息。请询问 DUA 还需要什么。

**福利：**每周金额一般约为平均周工资的 50%，不超过法定最高额。截至 2026 年 10 月 4 日，最高额为每周 $1,154；该金额可能变化。部分符合条件的申请人可获得受抚养人补贴。目前最长可领 30 周，但个人领取时间可能更短，规定也可能变化。

申请后，按指示每周请求福利并进行资格确认，在需要时提供求职信息。申报收入并按时回应 DUA 的要求。`,
  ar: `يوفر **تأمين البطالة في Massachusetts ‏(UI)** دخلاً مؤقتاً لبعض العاملين الذين يفقدون وظائفهم أو تُخفض ساعاتهم كثيراً دون خطأ منهم.

**الأهلية:** يجب عادةً أن يكون المتقدم مخولاً بالعمل وقادراً عليه ومتاحاً له ويبحث عنه بجدية. تشمل متطلبات الأجور ما لا يقل عن $6,300 في فترة الأساس المطبقة وما لا يقل عن 30 ضعف مبلغ الاستحقاق الأسبوعي؛ وتنطبق قواعد واستثناءات أخرى. تقرر إدارة Department of Unemployment Assistance ‏(DUA) الأهلية.

**التقديم:** قدّم عبر mass.gov/unemployment أو اتصل بـ DUA على (877) 626-6800؛ خدمة الترحيل الصوتي 711. جهّز رقم الضمان الاجتماعي وبيانات الاتصال ومعلومات أصحاب العمل مؤخراً. اسأل DUA عما يلزم أيضاً.

**الإعانات:** يكون المبلغ الأسبوعي عادةً نحو 50% من متوسط الأجر الأسبوعي حتى الحد القانوني. اعتباراً من 4 أكتوبر 2026، يبلغ الحد الأقصى $1,154 أسبوعياً وقد يتغير. قد يحصل بعض المؤهلين على مخصص للمعالين. المدة القصوى الحالية 30 أسبوعاً، لكن مدة المطالبات الفردية قد تكون أقصر وقد تتغير القواعد.

بعد التقديم، اطلب الإعانات وأكّد أهليتك كل أسبوع حسب التعليمات، بما في ذلك معلومات البحث عن عمل عند طلبها. أبلغ عن الدخل واستجب لطلبات DUA في موعدها.`,
  so: `**Caymiska Shaqo-la'aanta Massachusetts (UI)** wuxuu dakhli ku-meel-gaar ah siiyaa qaar ka mid ah shaqaalaha shaqada waaya ama saacadahooda si weyn loo dhimo iyagoo aan iyagu khalad lahayn.

**U-qalmitaanka:** Codsaduhu guud ahaan waa inuu haysto oggolaansho shaqo, awoodo oo diyaar u yahay shaqo, si firfircoonna u raadiyaa shaqo. Shuruudaha mushaharka waxaa ka mid ah ugu yaraan $6,300 muddada aasaasiga ah ee khuseysa iyo ugu yaraan 30 jeer lacagta dheefta toddobaadlaha ah; xeerar iyo ka-reebis kale ayaa jira. Department of Unemployment Assistance (DUA) ayaa go'aamisa u-qalmitaanka.

**Codso:** Online uga codso mass.gov/unemployment ama DUA ka wac (877) 626-6800; adeegga gudbinta codka 711. Diyaari lambarka Social Security, xogta xiriirka iyo macluumaadka loo-shaqeeyayaasha dhowaan. Weydii DUA waxa kale ee loo baahan yahay.

**Dheefaha:** Lacagta toddobaadlaha ah guud ahaan waa qiyaastii 50% celceliska mushaharka toddobaadlaha, ilaa xadka sharciga. Laga bilaabo Oktoobar 4, 2026, xadkaasi waa $1,154 toddobaadkii; wuu is beddeli karaa. Qaar u qalma waxay heli karaan gunno dadka ku tiirsan. Muddada ugu badan hadda waa 30 toddobaad, laakiin codsiyada gaarka ah way ka gaabnaan karaan, xeerarkuna way is beddeli karaan.

Codsiga ka dib, codso dheefaha oo toddobaad kasta xaqiiji sida lagu faray, oo ay ku jirto xogta shaqo-raadinta marka loo baahdo. Sheeg dakhligaaga oo uga jawaab codsiyada DUA waqtigooda.`,
  kea: `**Seguru di Dezempregu di Massachusetts (UI)** ta da rendimentu temporáriu a algun trabadjor ki perde ses trabadju ô ten ses oras reduzidu txeu sen kulpa d'es.

**Elegibilidadi:** Normalmenti kandidatus ten ki sta autorizadu pa trabadja, ten kapasidadi i disponibilidadi pa trabadja i buska trabadju ativamenti. Rekizitus salarial ta inklui pelu menus $6,300 na períodu bazi aplikável i pelu menus 30 ves valor di benefísiu simanal; otus regras i esesons ta aplika. Department of Unemployment Assistance (DUA) ta desidi elegibilidadi.

**Kandidata:** Faz kandidatura online pa mass.gov/unemployment ô txoma DUA na (877) 626-6800; servisu di relé di voz 711. Tinha bu númaru di Seguransa Sosial, kontaktus i informason di empregador resenti prontu. Pergunta DUA kuzê más ki ta ser presizu.

**Benefísius:** Valor simanal normalmenti é sérka di 50% di salário simanal médiu, até máksimu legal. Di 4 di otubru di 2026, es máksimu é $1,154 pa simana; el podi muda. Algun kandidatu elegível podi resebe abonu pa dependenti. Durason máksimu atual é 30 simana, mas kandidaturas individual podi dura menus i regras podi muda.

Dipôs di kandidata, pidi benefísius i sertifika kada simana konformi instrusons, inkluindu informason di buska di trabadju kandu es pidi. Deklara rendimentus i responde pididus di DUA na prazo.`,
};
