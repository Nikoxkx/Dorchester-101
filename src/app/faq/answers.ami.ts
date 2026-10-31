import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts. Income limits change and program rules differ;
 * review these translations with housing experts and native speakers. */
export const AMI_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**AMI (Revni Medyàn Zòn nan)** se yon referans revni yo itilize pou fikse limit nan anpil pwogram lojman abòdab. HUD estime revni medyàn fanmi epi pibliye limit pa zòn ak kantite moun nan kay la; ajans ak pwogram yo ka kalkile limit yo yon fason diferan.

**Egzanp, se pa yon garanti kalifikasyon:** Pou ane fiskal 2026, HUD endike revni medyàn fanmi $164,600 pou zòn metwopoliten HUD Boston-Cambridge-Quincy. Limit kat moun yo gen ladan $85,700 nan 50% ak $137,100 nan 80%. Tablo Boston 2026 la endike $171,400 nan 100% pou yon kay kat moun. Sa yo se mezi diferan yo pibliye; yo pa lwaye. Limit revni yo chanje, epi règ anons la ak kantite moun nan kay la enpòtan.

Sèvi ak zouti revni sit la kòm yon pwen depa, epi verifye tablo ofisyèl aktyèl la ak anons espesifik la. Se sèlman pwogram nan oswa administratè pwopriyete a ki ka detèmine kalifikasyon.

**Revni:** Aplikasyon yo ka mande salè, pèman travay, poubwa, Sekirite Sosyal, SSI/SSDI, chomaj, sipò timoun, enterè ak revni retrèt. Règ sou esklizyon, byen ak èd etidyan varye selon pwogram; mande ajans ki jere li olye pou sipoze yon bagay eskli.`,
  pt: `A **AMI (renda mediana da área)** é uma referência de renda usada para definir limites em muitos programas de moradia acessível. O HUD estima a renda familiar mediana e publica limites por área e tamanho da família; órgãos e programas podem calcular seus limites de formas diferentes.

**Exemplo, não garantia de elegibilidade:** Para o ano fiscal de 2026, o HUD informa renda familiar mediana de $164,600 para a região metropolitana HUD Boston-Cambridge-Quincy. Os limites para quatro pessoas incluem $85,700 a 50% e $137,100 a 80%. A tabela de Boston de 2026 informa $171,400 a 100% para uma família de quatro pessoas. São medidas publicadas diferentes; não são aluguéis. Os limites mudam, e as regras do anúncio e o tamanho da família importam.

Use as ferramentas de renda do site como ponto de partida e consulte a tabela oficial atual e o anúncio específico. Somente o programa ou o administrador do imóvel pode determinar a elegibilidade.

**Renda:** As inscrições podem perguntar sobre salários, gorjetas, Seguro Social, SSI/SSDI, seguro-desemprego, pensão alimentícia recebida, juros e aposentadoria. Regras sobre exclusões, bens e auxílio estudantil variam por programa; pergunte à agência administradora em vez de presumir que um item é excluído.`,
  vi: `**AMI (thu nhập trung vị khu vực)** là mức tham chiếu thu nhập dùng để xác định giới hạn của nhiều chương trình nhà ở giá phải chăng. HUD ước tính thu nhập gia đình trung vị và công bố giới hạn theo khu vực và quy mô hộ; các cơ quan và chương trình có thể tính giới hạn khác nhau.

**Ví dụ, không bảo đảm đủ điều kiện:** Với năm tài chính 2026, HUD công bố thu nhập gia đình trung vị $164,600 cho vùng đô thị HUD Boston-Cambridge-Quincy. Giới hạn hộ bốn người gồm $85,700 ở mức 50% và $137,100 ở mức 80%. Bảng Boston năm 2026 ghi $171,400 ở mức 100% cho hộ bốn người. Đây là các thước đo được công bố khác nhau; không phải tiền thuê. Giới hạn thu nhập thay đổi, và quy định của tin đăng cũng như quy mô hộ đều quan trọng.

Dùng công cụ thu nhập của trang làm điểm bắt đầu, rồi kiểm tra bảng chính thức hiện hành và tin đăng cụ thể. Chỉ chương trình hoặc quản lý bất động sản mới có thể xác định điều kiện.

**Thu nhập:** Đơn có thể hỏi về tiền công, lương, tiền thưởng, An sinh Xã hội, SSI/SSDI, trợ cấp thất nghiệp, tiền cấp dưỡng con, tiền lãi và thu nhập hưu trí. Quy định về khoản được loại trừ, tài sản và hỗ trợ học tập tùy chương trình; hãy hỏi cơ quan quản lý thay vì tự cho rằng một khoản không được tính.`,
  zh: `**AMI（地区收入中位数）**是许多经济适用住房计划用来设定收入限额的基准。HUD 估算家庭收入中位数，并按地区和家庭人数公布限额；不同机构和计划可能采用不同的计算方式。

**以下只是示例，不保证符合资格：**HUD 公布的 2026 财年 Boston-Cambridge-Quincy HUD 都会区家庭收入中位数为 $164,600。四人家庭限额包括 50% 时 $85,700 和 80% 时 $137,100。波士顿 2026 年表格中，四人家庭的 100% 数值为 $171,400。这些是不同的公布指标，不是租金。收入限额会变化，具体房源规则和家庭人数也很重要。

可先使用本网站的收入工具，再核对当前官方表格和具体房源。只有计划方或物业管理方能够确定资格。

**收入：**申请可能询问工资、薪水、小费、社会保障、SSI/SSDI、失业金、子女抚养费、利息和退休收入。各计划对排除项目、资产和学生资助的规定不同；不要自行假定某项收入不计入，请询问管理机构。`,
  ar: `**AMI (متوسط دخل المنطقة الوسيط)** معيار للدخل يُستخدم لتحديد الحدود في برامج عديدة للسكن الميسور. يقدر HUD دخل الأسرة الوسيط وينشر الحدود حسب المنطقة وحجم الأسرة؛ وقد تحسب الجهات والبرامج حدودها بطرق مختلفة.

**مثال وليس ضماناً للأهلية:** في السنة المالية 2026، يذكر HUD أن دخل الأسرة الوسيط لمنطقة HUD الحضرية Boston-Cambridge-Quincy هو $164,600. تشمل حدود الأسرة ذات الأربعة أشخاص $85,700 عند 50% و$137,100 عند 80%. يذكر جدول بوسطن لعام 2026 مبلغ $171,400 عند 100% لأسرة من أربعة أشخاص. هذه مقاييس منشورة مختلفة وليست إيجارات. تتغير حدود الدخل، وتهم قواعد الإعلان وحجم الأسرة.

استخدم أدوات الدخل في الموقع كنقطة بداية، ثم تحقق من الجدول الرسمي الحالي والإعلان المحدد. وحده البرنامج أو مدير العقار يستطيع تحديد الأهلية.

**الدخل:** قد تسأل الطلبات عن الأجور والرواتب والإكراميات والضمان الاجتماعي وSSI/SSDI والبطالة ونفقة الأطفال والفوائد ودخل التقاعد. تختلف قواعد الاستثناءات والأصول ومساعدة الطلاب حسب البرنامج؛ اسأل الجهة المديرة بدلاً من افتراض استثناء أي بند.`,
  so: `**AMI (dakhliga dhexe ee aagga)** waa halbeeg dakhli oo lagu dejiyo xadka barnaamijyo badan oo guryo la awoodi karo. HUD wuxuu qiyaasaa dakhliga dhexe ee qoyska wuxuuna daabacaa xadadka aag iyo cabbir qoys; hay’adaha iyo barnaamijyadu si kala duwan ayay u xisaabin karaan xadkooda.

**Tusaale, ma aha dammaanad u-qalmitaan:** Sannad-maaliyadeedka 2026, HUD wuxuu dakhliga dhexe ee qoyska ee aagga HUD Boston-Cambridge-Quincy ku sheegay $164,600. Xadka afar qof waxaa ka mid ah $85,700 oo ah 50% iyo $137,100 oo ah 80%. Jadwalka Boston ee 2026 wuxuu afar qof ku sheegay $171,400 oo ah 100%. Kuwani waa cabbirro kala duwan oo la daabacay; ma aha kiro. Xadka dakhliga wuu is beddelaa, xeerarka xayeysiiska iyo cabbirka qoyskaana waa muhiim.

U isticmaal qalabka dakhliga ee goobta meel bilow ah, dabadeed hubi jadwalka rasmiga ah ee hadda iyo xayeysiiska gaarka ah. Barnaamijka ama maamulaha guriga oo keliya ayaa go’aamin kara u-qalmitaanka.

**Dakhliga:** Codsiyada waxaa lagu weydiin karaa mushahar, gunno, Social Security, SSI/SSDI, shaqo-la’aan, masruuf carruur, dulsaar iyo dakhliga hawlgabka. Xeerarka waxyaabaha laga reebo, hantida iyo kaalmada ardaygu way ku kala duwan yihiin barnaamijka; weydii hay’adda maamusha halkii aad ka malayn lahayd in wax laga reebay.`,
  kea: `**AMI (rendimentu medianu di área)** é un referénsia di rendimentu uzadu pa difini limitis di txeu programa di abitason asesível. HUD ta stima rendimentu medianu di família i ta publika limitis pa área i tamanhu di família; ajénsias i programas podi kalkula limitis di manera diferenti.

**Ezemplu, ka é garantia di elegibilidadi:** Pa anu fiskal 2026, HUD ta indika rendimentu medianu di família di $164,600 pa área metropolitana HUD Boston-Cambridge-Quincy. Limitis pa kuatu pésua ta inklui $85,700 na 50% i $137,100 na 80%. Tabela di Boston di 2026 ta indika $171,400 na 100% pa família di kuatu pésua. Es é medidas diferenti publikadu; ka é renda. Limitis di rendimentu ta muda, i regras di anunsiu i tamanhu di família é importanti.

Uza ferramentas di rendimentu di site komu pontu di partida, dipôs konsulta tabela ofisial atual i anunsiu spesífiku. Só programa ô jestri di propriedadi podi determina elegibilidadi.

**Rendimentu:** Kandidaturas podi pidi salário, ordenadu, gorjetas, Seguransa Sosial, SSI/SSDI, dezempregu, apoiu pa fidju, jurus i penson. Regras sobri eskluzons, bens i ajuda di studanti ta varia ku programa; pergunta ajénsia ki ta administra en vez di supor ma un item sta eskluidu.`,
};
