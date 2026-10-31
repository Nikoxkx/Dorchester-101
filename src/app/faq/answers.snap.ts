import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts. Review eligibility, dates and translations with
 * the Massachusetts DTA and qualified native speakers before relying on them. */
export const SNAP_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**SNAP** (Pwogram Asistans Nitrisyon Siplemantè) bay benefis chak mwa pou achte manje.

**Kijan pou aplike:**
1. Sou entènèt: DTAConnect.com
2. Pa telefòn: (877) 382-2363
3. An pèsòn: ale nan yon biwo DTA lokal

**Kiyès ki ka kalifye:**
- Pou anpil kay nan Massachusetts, referans pou revni brit se 200% nivo povrete federal la. An 2026, sa se anviwon $5,500 pa mwa pou yon kay ki gen 4 moun.
- Kay ki gen yon moun ki gen 60 ane oswa plis oswa ki gen yon andikap ka kalifye anba lòt règ. Anpil kay pa sibi tès byen.
- Kalifikasyon depann tou de sitiyasyon kay la ak lòt règ. Kay kote moun ap travay ka kalifye; DTA pran desizyon an.

**Enfòmasyon ak prèv:**
- DTA ka mande prèv idantite, rezidans nan Massachusetts ak revni, ansanm ak lòt dokiman ki aplikab pou sitiyasyon ou.
- Moun k ap aplike yo jeneralman bezwen yon nimewo Sekirite Sosyal oswa prèv yo te mande youn. DTA ka ede si ou pa gen dokiman yo mande yo; yon pyès idantite ak foto pa sèl fason pou pwouve idantite.

**Benefis maksimòm chak mwa** (USDA, 1 oktòb 2026 – 30 septanm 2027, Massachusetts):

| Kantite moun nan kay | Maksimòm pa mwa |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

Maksimòm nan pa yon peman garanti. Benefis yo depann de kantite moun nan kay la, revni, dediksyon ak règ pwogram nan. Mande DTA pou detèminasyon ou.

**Tan pou trete aplikasyon an:**
- An jeneral yo dwe pran yon desizyon nan 30 jou.
- Gen kay ki kalifye pou benefis akselere nan 7 jou, selon revni, resous ak depans yo.

**Sèvi ak SNAP pou manje ki kalifye** nan makèt, ti magazen, mache agrikòl ak machann sou entènèt ki patisipe, tankou Amazon ak Walmart. Gen mache ki bay lòt ankourajman; mande mache a ki pwogram ki disponib kounye a.`,
  pt: `O **SNAP** (Programa de Assistência Nutricional Suplementar) oferece benefícios mensais para comprar alimentos.

**Como solicitar:**
1. Online: DTAConnect.com
2. Por telefone: (877) 382-2363
3. Presencialmente: visite um escritório local do DTA

**Quem pode se qualificar:**
- Para muitas famílias de Massachusetts, a referência de renda bruta é 200% do nível federal de pobreza. Em 2026, isso equivale a cerca de $5,500 por mês para uma família de 4 pessoas.
- Famílias com uma pessoa de 60 anos ou mais ou com deficiência podem se qualificar por outras regras. Muitas famílias não passam por teste de bens.
- A elegibilidade também depende das circunstâncias da família e de outras regras. Famílias com pessoas trabalhando podem se qualificar; o DTA toma a decisão.

**Informações e comprovantes:**
- O DTA pode pedir comprovantes de identidade, residência em Massachusetts e renda, além de outros documentos pertinentes à sua situação.
- As pessoas que solicitam geralmente precisam de número de Seguro Social ou comprovante de solicitação. O DTA pode ajudar se faltar algum documento; identidade com foto não é a única forma de provar a identidade.

**Benefício mensal máximo** (USDA, 1º de outubro de 2026 – 30 de setembro de 2027, Massachusetts):

| Tamanho da família | Máximo mensal |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

O máximo não é um pagamento garantido. O benefício depende do tamanho da família, da renda, das deduções e das regras do programa. Peça ao DTA a determinação do seu caso.

**Prazo de análise:**
- Em geral, uma decisão deve ser tomada em até 30 dias.
- Algumas famílias se qualificam para benefícios acelerados em até 7 dias, conforme renda, recursos e despesas.

**Use o SNAP para alimentos elegíveis** em supermercados, lojas de conveniência, feiras e lojas online participantes, incluindo Amazon e Walmart. Algumas feiras oferecem incentivos adicionais; pergunte sobre o programa atual.`,
  vi: `**SNAP** (Chương trình Hỗ trợ Dinh dưỡng Bổ sung) cấp trợ cấp hàng tháng để mua thực phẩm.

**Cách nộp đơn:**
1. Trực tuyến: DTAConnect.com
2. Qua điện thoại: (877) 382-2363
3. Trực tiếp: đến văn phòng DTA tại địa phương

**Ai có thể đủ điều kiện:**
- Với nhiều hộ tại Massachusetts, mức hướng dẫn thu nhập tổng là 200% chuẩn nghèo liên bang. Năm 2026, mức này khoảng $5,500 mỗi tháng cho hộ 4 người.
- Hộ có người từ 60 tuổi trở lên hoặc người khuyết tật có thể đủ điều kiện theo quy định khác. Nhiều hộ không phải kiểm tra tài sản.
- Điều kiện còn tùy hoàn cảnh hộ và các quy định khác. Hộ có người đang làm việc vẫn có thể đủ điều kiện; DTA đưa ra quyết định.

**Thông tin và giấy tờ:**
- DTA có thể yêu cầu giấy tờ chứng minh danh tính, cư trú tại Massachusetts và thu nhập, cùng các giấy tờ khác phù hợp với hoàn cảnh của bạn.
- Người nộp đơn thường cần số An sinh Xã hội hoặc bằng chứng đã nộp đơn xin số. DTA có thể giúp nếu bạn thiếu giấy tờ được yêu cầu; giấy tờ có ảnh không phải cách duy nhất để chứng minh danh tính.

**Trợ cấp tối đa hàng tháng** (USDA, 1 tháng 10 năm 2026 – 30 tháng 9 năm 2027, Massachusetts):

| Số người trong hộ | Tối đa hàng tháng |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

Mức tối đa không phải khoản thanh toán được bảo đảm. Trợ cấp tùy thuộc quy mô hộ, thu nhập, khoản khấu trừ và quy định chương trình. Hãy hỏi DTA về quyết định cho trường hợp của bạn.

**Thời gian xử lý:**
- Thông thường phải có quyết định trong vòng 30 ngày.
- Một số hộ đủ điều kiện nhận trợ cấp nhanh trong vòng 7 ngày, tùy thu nhập, tài nguyên và chi phí.

**Dùng SNAP mua thực phẩm hợp lệ** tại siêu thị, cửa hàng tiện lợi, chợ nông sản và nhà bán lẻ trực tuyến tham gia, gồm Amazon và Walmart. Một số chợ có ưu đãi thêm; hãy hỏi chợ về chương trình hiện hành.`,
  zh: `**SNAP**（补充营养援助计划）每月提供福利，帮助购买食品。

**如何申请：**
1. 网上：DTAConnect.com
2. 电话：(877) 382-2363
3. 亲自前往：当地 DTA 办事处

**谁可能符合条件：**
- 对许多马萨诸塞州家庭而言，税前收入参考标准为联邦贫困线的 200%。2026 年，4 人家庭的标准约为每月 $5,500。
- 有 60 岁及以上成员或残障成员的家庭可能适用不同规则。许多家庭无需资产审核。
- 资格还取决于家庭情况及其他规则。有工作成员的家庭也可能符合条件；由 DTA 作出决定。

**信息和证明：**
- DTA 可能要求身份证明、马萨诸塞州居住证明和收入证明，以及适用于您情况的其他文件。
- 申请人通常需要社会安全号码或已申请号码的证明。如果缺少所需文件，DTA 可以提供帮助；带照片的证件并非证明身份的唯一方式。

**每月最高福利**（USDA，2026 年 10 月 1 日至 2027 年 9 月 30 日，马萨诸塞州）：

| 家庭人数 | 每月最高金额 |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

最高金额并非保证支付金额。福利取决于家庭人数、收入、扣除额和计划规则。请向 DTA 了解您个案的决定。

**处理时间：**
- 通常应在 30 天内作出决定。
- 某些家庭根据收入、资源和支出情况，可在 7 天内获得加急福利。

**使用 SNAP 购买符合条件的食品**，可在参与计划的超市、便利店、农贸市场和线上零售商使用，包括 Amazon 和 Walmart。部分农贸市场提供额外优惠；请向市场询问当前计划。`,
  ar: `يوفر **SNAP** (برنامج المساعدة الغذائية التكميلية) إعانات شهرية لشراء الغذاء.

**طريقة التقديم:**
1. عبر الإنترنت: DTAConnect.com
2. عبر الهاتف: (877) 382-2363
3. حضورياً: زيارة مكتب DTA محلي

**من قد يكون مؤهلاً:**
- بالنسبة إلى أسر كثيرة في Massachusetts، يبلغ المعيار الإرشادي للدخل الإجمالي 200% من مستوى الفقر الفيدرالي. وفي 2026 يساوي ذلك نحو $5,500 شهرياً لأسرة من 4 أشخاص.
- قد تتأهل الأسر التي تضم شخصاً عمره 60 عاماً فأكثر أو شخصاً ذا إعاقة وفق قواعد مختلفة. لا تخضع أسر كثيرة لاختبار الأصول.
- تعتمد الأهلية أيضاً على ظروف الأسرة وقواعد أخرى. قد تتأهل الأسر التي يعمل أفرادها؛ ويتخذ DTA القرار.

**المعلومات والإثباتات:**
- قد يطلب DTA إثبات الهوية والإقامة في Massachusetts والدخل، إضافة إلى مستندات أخرى تناسب حالتك.
- يحتاج المتقدمون عادةً إلى رقم ضمان اجتماعي أو إثبات طلبه. يمكن لـ DTA المساعدة إذا لم تتوفر المستندات المطلوبة؛ فالهوية المصورة ليست الطريقة الوحيدة لإثبات الهوية.

**الحد الأقصى للإعانة الشهرية** (USDA، من 1 أكتوبر 2026 إلى 30 سبتمبر 2027، Massachusetts):

| حجم الأسرة | الحد الأقصى الشهري |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

الحد الأقصى ليس مبلغاً مضموناً. تعتمد الإعانة على حجم الأسرة والدخل والخصومات وقواعد البرنامج. اسأل DTA عن القرار الخاص بحالتك.

**مدة المعالجة:**
- يُفترض عموماً اتخاذ القرار خلال 30 يوماً.
- قد تتأهل بعض الأسر لإعانات معجلة خلال 7 أيام، بحسب الدخل والموارد والنفقات.

**استخدم SNAP لشراء الأغذية المؤهلة** في المتاجر الكبرى والمتاجر الصغيرة والأسواق الزراعية وتجار الإنترنت المشاركين، بمن فيهم Amazon وWalmart. تقدم بعض الأسواق حوافز إضافية؛ اسأل السوق عن برنامجه الحالي.`,
  so: `**SNAP** (Barnaamijka Kaalmada Nafaqada Dheeraadka ah) wuxuu bixiyaa kaalmo bille ah oo cunto lagu iibsado.

**Sida loo codsado:**
1. Online: DTAConnect.com
2. Telefoon: (877) 382-2363
3. Qof ahaan: booqo xafiiska DTA ee deegaanka

**Cidda laga yaabo inay u qalanto:**
- Qoysas badan oo Massachusetts jooga, tilmaanta dakhliga guud waa 200% heerka faqriga federaalka. Sannadka 2026, taasi waa qiyaastii $5,500 bishii qoys 4 qof ah.
- Qoyska ay ku jiraan qof 60 jir ama ka weyn ama qof naafo ah wuxuu ku qalmi karaa xeerar kale. Qoysas badan lagama qaado imtixaanka hantida.
- U-qalmitaanku wuxuu kaloo ku xiran yahay xaaladda qoyska iyo xeerar kale. Qoys shaqeeya wuu u qalmi karaa; DTA ayaa go’aanka gaarta.

**Macluumaadka iyo caddaynta:**
- DTA waxay codsan kartaa caddaynta aqoonsiga, deganaanshaha Massachusetts iyo dakhliga, iyo dukumiintiyo kale oo ku habboon xaaladdaada.
- Codsadayaashu badanaa waxay u baahan yihiin lambarka Social Security ama caddayn inay dalbadeen. DTA way ku caawin kartaa haddii dukumiintiyada lagaa codsaday kaa maqan yihiin; aqoonsi sawir leh ma aha habka keliya ee aqoonsiga lagu caddeeyo.

**Kaalmada ugu badan ee bishiiba** (USDA, 1 Oktoobar 2026 – 30 Sebtembar 2027, Massachusetts):

| Cabbirka qoyska | Ugu badan bishiiba |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

Inta ugu badan ma aha lacag la dammaanad qaaday. Kaalmadu waxay ku xiran tahay cabbirka qoyska, dakhliga, waxyaabaha laga jaro iyo xeerarka barnaamijka. Weydii DTA go’aanka kiiskaaga.

**Waqtiga lagu farsameeyo:**
- Guud ahaan go’aan waa in lagu gaaraa 30 maalmood gudahood.
- Qaar ka mid ah qoysaska waxay u qalmaan kaalmo la dedejiyay 7 maalmood gudahood, iyadoo lagu salaynayo dakhliga, kheyraadka iyo kharashka.

**SNAP ku iibso cuntada u qalanta** dukaamada waaweyn, dukaamada yaryar, suuqyada beeraleyda iyo dukaamada online-ka ee ka qayb qaata, oo ay ku jiraan Amazon iyo Walmart. Suuqyada qaar waxay bixiyaan dhiirrigelin dheeraad ah; ka weydii barnaamijka hadda jira.`,
  kea: `**SNAP** (Programa di Asisténsia Nutrisional Suplementar) ta da benefísiu mensal pa konpra kumida.

**Modu di kandidata:**
1. Online: DTAConnect.com
2. Pa telefoni: (877) 382-2363
3. Pessoalmenti: bai na un skritóriu lokal di DTA

**Ken ki podi kalifika:**
- Pa txeu família na Massachusetts, referénsia di rendimentu brutu é 200% di nivel federal di pobrezi. Na 2026, es é más ô menus $5,500 pa mes pa un família di 4 pésua.
- Família ku un pésua di 60 anu ô más ô ku defisiénsia podi kalifika segundu otus regra. Txeu família ka ten testi di bens.
- Elegibilidadi tanbê dipendi di situason di família i otus regra. Família ku pésuas ki ta trabadja podi kalifika; DTA ta toma desizon.

**Informason i provas:**
- DTA podi pidi prova di identidadi, rezidénsia na Massachusetts i rendimentu, i otus dokumentus konformi bu situason.
- Pésuas ki ta kandidata normalmenti mesti númaru di Seguransa Sosial ô prova ma es pidi un. DTA podi ajuda si bu ka ten dokumentus pididu; identifikason ku fotografia ka é únika manera di prova identidadi.

**Benefísiu mensal másimu** (USDA, 1 di otubru 2026 – 30 di setenbru 2027, Massachusetts):

| Tamanhu di família | Másimu mensal |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

Másimu ka é un pagamentu garantidu. Benefísiu dipendi di tamanhu di família, rendimentu, dedusons i regras di programa. Pidi DTA desizon pa bu kazu.

**Tenpu di prosesamentu:**
- Normalmenti desizon debi ser tomadu dentru di 30 dia.
- Algun família podi kalifika pa benefísiu akseleradu dentru di 7 dia, segundu rendimentu, rekursus i despesas.

**Uza SNAP pa kumida elegível** na supermerkadus, lojas, merkadus di agrikultoris i vendidor online ki ta partisipá, inkluindu Amazon i Walmart. Algun merkadu ten insentivu adisional; pergunta na merkadu sobri programa atual.`,
};
