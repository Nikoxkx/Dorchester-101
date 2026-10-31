import type { Language } from '@/stores/appStore';

/**
 * AI-assisted first drafts of selected answers. Keep application conditions,
 * amounts and contact details aligned with the English source in page.tsx.
 * A qualified native speaker must review legal and eligibility content.
 */
export const OTHER_FAQ_ANSWERS: Partial<Record<Language, Record<string, string>>> = {
  ht: {
    applyHousing: `Chèche lojman ki gen limit revni nan sous ki anba yo. Sèvi ak zouti AMI a kòm yon premye estimasyon; règ ak limit yo varye selon anons lan.

1. Fè lis moun nan kay la ak sous revni yo. Pwogram yo konte revni ak byen yon fason diferan; mande kontak anons lan. Kalkilatris AMI a se yon estimasyon, se pa yon desizyon kalifikasyon. Mande administratè pwopriyete a oswa pwogram nan.

2. **Metrolist** (boston.gov/metrolist): Anons lojman ak limit revni nan zòn Boston, yon estimatè AMI ak yon rezime chak semèn. Li pa bay lojman piblik oswa sibvansyone.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Rechèch gratis san bi likratif pou lokasyon ak limit revni nan tout eta a, ak filtè kalifikasyon ak aksè. Konfime detay yo ak pwopriyete a.

3. Anons yo voye moun bay administratè pwopriyete yo; chak aplikasyon ak lis datant gen pwòp règ li.

4. BHA ap resevwa aplikasyon pou lojman piblik; lis datant jeneral vouch chwa lojman Seksyon 8 li a fèmen. Lis vouch ki baze sou pwojè ak Mod Rehab gen restriksyon ak eksepsyon posib. Metrolist ak Housing Navigator montre opòtinite diferan. Konfime règ aktyèl yo ak chak pwogram. bostonhousing.org · (617) 988-4000.

5. Gen lojman ki itilize tiraj, lis datant oswa premye moun ki aplike. Kondisyon ak preferans yo varye; verifye chak anons ak dat limit.

**Mande ki dokiman ou bezwen:** Pwogram yo ka mande prèv idantite, revni, byen oswa detay sou kay la. Mande sa pou bay ak kijan pou jwenn èd si dokiman yo difisil pou jwenn.`,
    section8: `Verifye 31 oktòb 2026. Règ ak lis datant yo ka chanje.

BHA ap resevwa aplikasyon pou lojman piblik; lis datant jeneral vouch Seksyon 8 la fèmen. Mande sou restriksyon ak eksepsyon: (617) 988-4000.

Lis vouch BHA ki baze sou pwojè ak Mod Rehab jeneralman mande Priyorite Youn; gen kèk eksepsyon. Kèk kategori ka kalifye tou pou eksepsyon sou lis fèmen vouch ki swiv lokatè a. Mande BHA sou sitiyasyon w.

bostonhousing.org · (617) 988-4000.

CHAMP resevwa aplikasyon pou lojman piblik eta a ak vouch lokasyon Massachusetts (MRVP ak AHVP); chak lis gen pwòp règ li. Ale sou housingapplication.mass.gov oswa mande yon otorite lojman lokal.

Lis datant yo separe. Suiv enstriksyon chak pwogram pou mete kontak ou ajou ak renouvle enterè w; règ yo varye.`,
  },
  pt: {
    applyHousing: `Encontre moradia com limite de renda nas fontes abaixo. Use a ferramenta AMI como estimativa inicial; regras e limites variam por anúncio.

1. Liste os integrantes da família e as fontes de renda. Os programas contam renda e bens de formas diferentes; pergunte ao contato do anúncio. A calculadora AMI é uma estimativa, não uma decisão de elegibilidade. Pergunte ao administrador da propriedade ou programa.

2. **Metrolist** (boston.gov/metrolist): Anúncios de moradia com limite de renda na Grande Boston, estimador AMI e resumo semanal. Não inclui moradia pública ou subsidiada.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Busca gratuita de uma organização sem fins lucrativos por aluguéis com limite de renda no estado, com filtros de elegibilidade e acessibilidade. Confirme os dados com a propriedade.

3. Os anúncios indicam administradores de propriedades; cada inscrição e lista de espera tem suas próprias regras.

4. A BHA aceita inscrições para moradia pública; a lista geral do voucher de escolha de moradia da Seção 8 está fechada. As listas de vouchers vinculados a projetos e Mod Rehab têm restrições e possíveis exceções. Metrolist e Housing Navigator mostram oportunidades diferentes. Confirme as regras atuais com cada programa. bostonhousing.org · (617) 988-4000.

5. Algumas moradias usam sorteio, lista de espera ou ordem de chegada. Requisitos e preferências variam; confira cada anúncio e prazo.

**Pergunte quais documentos são necessários:** Programas podem pedir comprovantes de identidade, renda, bens ou dados da família. Pergunte o que entregar e como obter ajuda se for difícil conseguir documentos.`,
    section8: `Verificado em 31 de outubro de 2026. Regras e listas de espera podem mudar.

A BHA aceita inscrições para moradia pública; a lista geral de vouchers da Seção 8 está fechada. Pergunte sobre restrições e exceções: (617) 988-4000.

As listas de vouchers da BHA vinculados a projetos e Mod Rehab geralmente exigem Prioridade Um; há exceções limitadas. Algumas categorias também podem se qualificar para exceções à lista fechada de vouchers do inquilino. Consulte a BHA sobre sua situação.

bostonhousing.org · (617) 988-4000.

O CHAMP aceita inscrições para moradia pública estadual e vouchers de aluguel de Massachusetts (MRVP e AHVP); cada lista tem suas próprias regras. Acesse housingapplication.mass.gov ou pergunte a uma autoridade habitacional local.

As listas de espera são separadas. Siga as instruções de cada programa para atualizar seus contatos e renovar o interesse; as regras variam.`,
  },
  vi: {
    applyHousing: `Tìm nhà ở giới hạn thu nhập qua các nguồn bên dưới. Dùng công cụ AMI để ước tính ban đầu; quy định và giới hạn tùy từng tin.

1. Liệt kê thành viên hộ và nguồn thu nhập. Các chương trình tính thu nhập và tài sản khác nhau; hãy hỏi người liên hệ trong tin. Công cụ AMI chỉ ước tính, không quyết định điều kiện hội đủ. Hãy hỏi đơn vị quản lý nhà hoặc chương trình.

2. **Metrolist** (boston.gov/metrolist): Tin nhà ở giới hạn thu nhập tại vùng Greater Boston, công cụ ước tính AMI và bản tin hằng tuần. Không liệt kê nhà công cộng hoặc được trợ cấp.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Công cụ tìm kiếm miễn phí của tổ chức phi lợi nhuận cho nhà thuê giới hạn thu nhập toàn bang, có bộ lọc điều kiện và khả năng tiếp cận. Xác nhận chi tiết với nơi quản lý.

3. Các tin hướng người nộp đơn đến đơn vị quản lý; mỗi đơn và danh sách chờ có quy định riêng.

4. BHA nhận đơn xin nhà ở công cộng; danh sách chờ chung cho phiếu lựa chọn nhà ở Section 8 đã đóng. Danh sách phiếu gắn với dự án và Mod Rehab có hạn chế và có thể có ngoại lệ. Metrolist và Housing Navigator liệt kê các cơ hội thuê khác nhau. Xác nhận quy định hiện hành với từng chương trình. bostonhousing.org · (617) 988-4000.

5. Một số nhà dùng xổ số, danh sách chờ hoặc thứ tự nộp đơn. Yêu cầu và ưu tiên khác nhau; hãy kiểm tra từng tin và hạn chót.

**Hỏi cần giấy tờ gì:** Chương trình có thể yêu cầu bằng chứng về danh tính, thu nhập, tài sản hoặc thông tin hộ gia đình. Hãy hỏi cần nộp gì và cách nhận trợ giúp nếu khó lấy giấy tờ.`,
    section8: `Đã kiểm tra ngày 31 tháng 10 năm 2026. Quy định và danh sách chờ có thể thay đổi.

BHA nhận đơn xin nhà ở công cộng; danh sách chờ chung phiếu Section 8 đã đóng. Hỏi về hạn chế và ngoại lệ: (617) 988-4000.

Danh sách phiếu gắn với dự án và Mod Rehab của BHA thường yêu cầu Priority One; có một số ngoại lệ hạn chế. Một số nhóm cũng có thể thuộc ngoại lệ của danh sách phiếu theo người thuê đã đóng. Hãy hỏi BHA về trường hợp của bạn.

bostonhousing.org · (617) 988-4000.

CHAMP nhận đơn xin nhà công cộng do bang hỗ trợ và phiếu thuê nhà Massachusetts (MRVP và AHVP); từng danh sách có quy định riêng. Truy cập housingapplication.mass.gov hoặc hỏi cơ quan nhà ở địa phương.

Các danh sách chờ tách biệt. Làm theo hướng dẫn mỗi chương trình để cập nhật liên hệ và xác nhận vẫn quan tâm; quy định khác nhau.`,
  },
  zh: {
    applyHousing: `通过以下来源查找收入限制住房。AMI 工具仅供初步估算；规则和限额因房源而异。

1. 列出家庭成员和收入来源。各项目计算收入和资产的方式不同；请询问房源联系人。 AMI 计算器仅作估算，不决定资格。请咨询物业或项目管理方。

2. **Metrolist** (boston.gov/metrolist): 大波士顿地区的收入限制房源、AMI 估算工具和每周摘要。不包括公共住房或补贴住房。

**Housing Navigator Massachusetts** (housingnavigatorma.org): 非营利机构提供的免费全州收入限制租房搜索，设有资格及无障碍筛选。请向物业确认详情。

3. 房源会引导申请人联系物业管理方；每份申请和等候名单都有各自的规则。

4. BHA 接受公共住房申请；其 Section 8 住房选择代金券的一般等候名单已关闭。项目绑定代金券和 Mod Rehab 名单有限制，也可能有例外。Metrolist 与 Housing Navigator 提供不同的租房信息。请向各项目确认现行规则。 bostonhousing.org · (617) 988-4000.

5. 有些住房采用抽签、等候名单或先到先申请。要求和优先条件各不相同；请查看每条房源和截止日期。

**询问需要哪些文件:** 项目可能要求身份证明、收入、资产或家庭资料。请询问需要提交什么；如果难以取得文件，也可询问如何获得帮助。`,
    section8: `核查日期：2026 年 10 月 31 日。规则和等候名单可能变化。

BHA 接受公共住房申请；Section 8 一般代金券等候名单已关闭。请询问限制和例外：(617) 988-4000。

BHA 的项目绑定代金券和 Mod Rehab 名单通常要求 Priority One，但有少数例外。某些类别也可能符合已关闭的租户代金券名单的例外条件。请向 BHA 咨询您的情况。

bostonhousing.org · (617) 988-4000.

CHAMP 接受州资助公共住房及马萨诸塞州租房代金券（MRVP 和 AHVP）申请；各等候名单有自己的规则。请访问 housingapplication.mass.gov 或咨询当地住房管理机构。

各等候名单互不相同。请按各项目说明更新联系方式并确认仍有意申请；规则各异。`,
  },
  ar: {
    applyHousing: `ابحث عن سكن مقيّد بالدخل عبر المصادر أدناه. استخدم أداة AMI كتقدير أولي؛ تختلف القواعد والحدود حسب الإعلان.

1. اكتب أفراد الأسرة ومصادر الدخل. تحسب البرامج الدخل والأصول بطرق مختلفة؛ اسأل جهة الاتصال في الإعلان. حاسبة AMI تقدير وليست قرار أهلية. اسأل مدير العقار أو البرنامج.

2. **Metrolist** (boston.gov/metrolist): إعلانات مساكن مقيّدة بالدخل في منطقة بوسطن الكبرى، وأداة تقدير AMI وملخص أسبوعي. لا يشمل السكن العام أو المدعوم.

**Housing Navigator Massachusetts** (housingnavigatorma.org): بحث مجاني من جهة غير ربحية عن إيجارات مقيّدة بالدخل في الولاية، مع مرشحات الأهلية وإمكانية الوصول. أكّد التفاصيل مع العقار.

3. توجّه الإعلانات المتقدمين إلى مديري العقارات؛ لكل طلب وقائمة انتظار قواعدها الخاصة.

4. تقبل BHA طلبات السكن العام؛ قائمة الانتظار العامة لقسائم اختيار السكن Section 8 مغلقة. توجد قيود واستثناءات محتملة لقوائم القسائم المرتبطة بالمشاريع وMod Rehab. يعرض Metrolist وHousing Navigator فرص إيجار مختلفة. أكّد القواعد الحالية مع كل برنامج. bostonhousing.org · (617) 988-4000.

5. تستخدم بعض المساكن القرعة أو قائمة انتظار أو أسبقية التقديم. تختلف المتطلبات والأولويات؛ تحقق من كل إعلان وموعده النهائي.

**اسأل عن المستندات المطلوبة:** قد تطلب البرامج إثبات الهوية أو الدخل أو الأصول أو بيانات الأسرة. اسأل عما يجب تقديمه وكيف تحصل على المساعدة إذا تعذّر الحصول على المستندات.`,
    section8: `تم التحقق في 31 أكتوبر 2026. قد تتغير القواعد وقوائم الانتظار.

تقبل BHA طلبات السكن العام؛ قائمة الانتظار العامة لقسائم Section 8 مغلقة. اسأل عن القيود والاستثناءات: (617) 988-4000.

تتطلب قوائم BHA للقسائم المرتبطة بالمشاريع وMod Rehab عادةً الأولوية الأولى، مع استثناءات محدودة. قد تنطبق استثناءات أيضًا على فئات معينة من قائمة القسائم المرتبطة بالمستأجر المغلقة. اسأل BHA عن حالتك.

bostonhousing.org · (617) 988-4000.

يقبل CHAMP طلبات السكن العام المدعوم من الولاية وقسائم الإيجار في ماساتشوستس (MRVP وAHVP)؛ لكل قائمة قواعدها. زر housingapplication.mass.gov أو اسأل هيئة الإسكان المحلية.

قوائم الانتظار منفصلة. اتبع تعليمات كل برنامج لتحديث بيانات الاتصال وتجديد اهتمامك؛ تختلف القواعد.`,
  },
  so: {
    applyHousing: `Ka raadi guryaha dakhligu xaddidan yahay ilaha hoose. Qalabka AMI u isticmaal qiyaas bilow ah; xeerarka iyo xadadku way ku kala duwan yihiin xayeysiisyada.

1. Qor xubnaha qoyska iyo ilaha dakhliga. Barnaamijyadu siyaabo kala duwan ayay u xisaabiyaan dakhliga iyo hantida; weydii xiriirka xayeysiiska. Xisaabiyaha AMI waa qiyaas, mana aha go'aan u-qalmitaan. Weydii maamulaha guriga ama barnaamijka.

2. **Metrolist** (boston.gov/metrolist): Xayeysiisyada guryaha dakhligu xaddidan yahay ee agagaarka Boston, qiyaasaha AMI iyo warbixin toddobaadle ah. Kuma jiraan guryaha dadweynaha ama la kabay.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Raadin bilaash ah oo urur aan faa'iido doon ahayn u bixiyo kirooyinka dakhligu xaddidan yahay ee gobolka, leh shaandhooyinka u-qalmitaanka iyo gelitaanka. Ka xaqiiji faahfaahinta guriga.

3. Xayeysiisyadu waxay codsadayaasha u gudbiyaan maamulayaasha guryaha; codsi iyo liis sugitaan kasta wuxuu leeyahay xeerar u gaar ah.

4. BHA waxay aqbashaa codsiyada guryaha dadweynaha; liiska sugitaanka guud ee foojarka xulashada guriga Section 8 wuu xiran yahay. Liisaska foojarka mashruuca iyo Mod Rehab waxay leeyihiin xaddidaad iyo ka-reebitaanno suuragal ah. Metrolist iyo Housing Navigator waxay muujiyaan fursado kiro oo kala duwan. Ka xaqiiji xeerarka hadda barnaamij kasta. bostonhousing.org · (617) 988-4000.

5. Guryaha qaar waxay isticmaalaan bakhtiyaanasiib, liis sugitaan ama kala horreynta codsiga. Shuruudaha iyo mudnaantu way kala duwan yihiin; hubi xayeysiis kasta iyo waqtigiisa.

**Weydii dukumentiyada loo baahan yahay:** Barnaamijyadu waxay codsan karaan caddeynta aqoonsiga, dakhliga, hantida ama xogta qoyska. Weydii waxa la bixinayo iyo sida caawimo loo helo haddii dukumentiyadu adag yihiin.`,
    section8: `La hubiyey 31 Oktoobar 2026. Xeerarka iyo liisaska sugitaanku way is beddeli karaan.

BHA waxay aqbashaa codsiyada guryaha dadweynaha; liiska sugitaanka guud ee foojarka Section 8 wuu xiran yahay. Weydii xaddidaadaha iyo ka-reebitaannada: (617) 988-4000.

Liisaska BHA ee foojarrada mashruuca iyo Mod Rehab badanaa waxay u baahan yihiin Mudnaanta Koowaad; ka-reebitaanno kooban ayaa jira. Qaar ayaa sidoo kale u qalmi kara ka-reebitaannada liiska xiran ee foojarka kiraystaha. BHA weydii xaaladdaada.

bostonhousing.org · (617) 988-4000.

CHAMP wuxuu aqbalaa codsiyada guryaha dadweynaha ee gobolku taageero iyo foojarrada kirada Massachusetts (MRVP iyo AHVP); liis kasta xeerar ayuu leeyahay. Booqo housingapplication.mass.gov ama weydii hay'adda guryaha ee deegaanka.

Liisaska sugitaanku waa kala gaar. Raac tilmaamaha barnaamij kasta si aad u cusboonaysiiso xiriirkaaga oo aad u xaqiijiso xiisahaaga; xeerarku way kala duwan yihiin.`,
  },
  kea: {
    applyHousing: `Buska kaza ku limitason di rendimentu na fontes di baxu. Uza feramenta AMI komu un stimativa inisial; regras y limitis ta varia pa kada anúnsiu.

1. Fazi lista di pesoas di família y fontis di rendimentu. Programas ta konta rendimentu y bens di manera diferenti; purgunta kontakto di anúnsiu. Kalkuladora AMI é un stimativa, ka é un disizon di kalifikason. Purgunta jestor di propriedadi ô di programa.

2. **Metrolist** (boston.gov/metrolist): Anúnsus di kaza ku limitason di rendimentu na zona di Boston, stimador AMI y rezumu semanal. Ka ta inklui kaza públiku ô subsidiadu.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Peskiza grátis di un organizason sen fins lukrativus pa arendamentus ku limitason di rendimentu na stadu, ku filtrus di kalifikason y asesibilidadi. Konfirma detalhis ku propriedadi.

3. Anúnsus ta diriji kandidatus pa jestoris di propriedadi; kada kandidatura y lista di spera ten ses próprius regras.

4. BHA ta aseita kandidaturas pa kaza públiku; lista jeral di spera pa vouchér di skodja di kaza Section 8 sta fetxadu. Listas di vouchér ligadu a projetus y Mod Rehab ten restrisons y podi ten isesons. Metrolist y Housing Navigator ta mostra oportunidadis di arendamentu diferenti. Konfirma regras atual ku kada programa. bostonhousing.org · (617) 988-4000.

5. Algun kazas ta uza sortéu, lista di spera ô órdi di kandidaturas. Rekizitus y preferénsias ta varia; konfirma kada anúnsiu y prazu.

**Purgunta kal dokumentus ki bu meste:** Programas podi pidi prova di identidadi, rendimentu, bens ô dadus di família. Purgunta kuzé ki bu ten ki entrega y modi ki bu podi odja ajuda si dokumentus for difísil di konsigi.`,
    section8: `Konfirmadu na 31 di otubru di 2026. Regras y listas di spera podi muda.

BHA ta aseita kandidaturas pa kaza públiku; lista jeral di spera pa vouchér Section 8 sta fetxadu. Purgunta sobri restrisons y isesons: (617) 988-4000.

Listas di BHA pa vouchér ligadu a projetus y Mod Rehab jeralmenti ta pidi Prioridadi Un; ten algun isesons limitadu. Algun kategoria podi tanbê kalifika pa isesons na lista fetxadu di vouchér di inquilinu. Purgunta BHA sobri bu situason.

bostonhousing.org · (617) 988-4000.

CHAMP ta aseita kandidaturas pa kaza públiku apoiadu pa stadu y vouchér di renda di Massachusetts (MRVP y AHVP); kada lista ten ses regras. Vizita housingapplication.mass.gov ô purgunta un autoridadi di abitason lokal.

Listas di spera é separadu. Sigui instrusons di kada programa pa atualiza bu kontaktu y renova bu interesi; regras ta varia.`,
  },
};
