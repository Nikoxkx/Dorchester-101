import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts. Confirm legal details, program rules, and contact
 * information with authoritative sources and qualified native speakers. */
export const EVICTION_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `Si ou anreta nan lwaye oswa w ap fè fas ak degèpisman, kontakte yon òganizasyon lojman oswa èd legal san pèdi tan. Pwogram yo gen kondisyon epi finansman ka chanje.

**Èd pou depans lojman:**
1. **RAFT (Residential Assistance for Families in Transition)** ka bay jiska $7,000 pa peryòd 12 mwa pou ijans lojman ki kalifye, tankou lwaye, sèvis piblik, demenajman oswa ipotèk. Pami kritè yo, eta a endike revni pi ba pase 50% AMI, oswa pi ba pase 60% pou kay ki an danje vyolans domestik. Mande ajans ki jere pwogram nan pou konfime si ou kalifye.
- Aplike sou entènèt nan Housing Help Hub eta a. Pou èd ak lwaye, pwopriyetè a dwe soumèt yon aplikasyon tou; eta a di li dwe soumèt li nan 21 jou oswa aplikasyon an ap ekspire.
- Metro Housing|Boston: (617) 425-6700. Rele 2-1-1 pou kesyon jeneral sou RAFT; rele 2-1-1 pa ranplase aplikasyon an.

2. **Greater Boston Legal Services** bay èd legal sivil gratis pou rezidan ki kalifye. Admisyon pou lojman (eksepte kesyon abri): (617) 603-1807, Lendi–Vandredi 9è maten–5è apremidi. Biwo prensipal: (617) 371-1234. Yo pa garanti reprezantasyon.

3. **City Life / Vida Urbana** ofri òganizasyon ak konsèy pou lokatè. Rele (617) 524-3541 pou enfòmasyon aktyèl sou reyinyon yo.

4. **Boston Office of Housing Stability** ka ede nan kriz lojman: (617) 635-4200, Lendi–Vandredi 9è maten–5è apremidi.

**Si ou resevwa yon avi degèpisman:**
- Yon avi pou kite kay la pa oblije ou ale tousuit pou kont li; yon pwopriyetè pa ka mete ou deyò ak fòs san yon òdonans tribinal.
- Li dokiman tribinal yo, respekte delè pou reponn epi ale nan dat odyans yo. Mande èd legal sou opsyon ou yo, tankou mande yon jiri.
- Chèche èd pou lwaye ak èd legal byen vit. Enfòmasyon sa yo pa konsèy legal pèsonalize.`,
  pt: `Se você está com aluguel atrasado ou enfrenta despejo, entre em contato rapidamente com uma organização de moradia ou assistência jurídica. Os programas têm requisitos e o financiamento pode mudar.

**Ajuda com custos de moradia:**
1. O **RAFT (Residential Assistance for Families in Transition)** pode fornecer até $7,000 por período de 12 meses para emergências habitacionais elegíveis, incluindo aluguel, serviços públicos, mudança ou hipoteca. Entre os critérios, o estado indica renda abaixo de 50% da AMI, ou abaixo de 60% para famílias em risco de violência doméstica. Peça à agência administradora que confirme sua elegibilidade.
- Solicite online pelo Housing Help Hub estadual. Para auxílio com aluguel, o proprietário também deve enviar uma solicitação; o estado diz que ela deve ser enviada em até 21 dias, ou a solicitação expirará.
- Metro Housing|Boston: (617) 425-6700. Ligue 2-1-1 para perguntas básicas sobre o RAFT; ligar para 2-1-1 não substitui a solicitação.

2. **Greater Boston Legal Services** oferece assistência jurídica civil gratuita a residentes elegíveis. Atendimento inicial para moradia (exceto questões de abrigo): (617) 603-1807, segunda–sexta, 9h–17h. Escritório principal: (617) 371-1234. A representação não é garantida.

3. **City Life / Vida Urbana** oferece organização e orientação a inquilinos. Ligue (617) 524-3541 para informações atuais sobre reuniões.

4. O **Boston Office of Housing Stability** pode ajudar em crises de moradia: (617) 635-4200, segunda–sexta, 9h–17h.

**Se receber uma notificação de despejo:**
- Uma notificação para desocupar, por si só, não obriga você a sair; o proprietário não pode removê-lo à força sem ordem judicial.
- Leia os documentos do tribunal, cumpra os prazos de resposta e compareça às audiências. Pergunte à assistência jurídica sobre suas opções, inclusive pedir um júri.
- Procure prontamente auxílio para aluguel e ajuda jurídica. Estas informações não são aconselhamento jurídico individual.`,
  vi: `Nếu bạn nợ tiền thuê hoặc có nguy cơ bị trục xuất, hãy sớm liên hệ tổ chức hỗ trợ nhà ở hoặc pháp lý. Các chương trình có điều kiện riêng và nguồn kinh phí có thể thay đổi.

**Hỗ trợ chi phí nhà ở:**
1. **RAFT (Residential Assistance for Families in Transition)** có thể cấp tối đa $7,000 trong mỗi giai đoạn 12 tháng cho các trường hợp khẩn cấp về nhà ở đủ điều kiện, gồm tiền thuê, tiện ích, chuyển nhà hoặc thế chấp. Trong các điều kiện, bang nêu thu nhập dưới 50% AMI, hoặc dưới 60% đối với hộ có nguy cơ bạo lực gia đình. Hãy hỏi cơ quan quản lý để xác nhận điều kiện của bạn.
- Nộp đơn trực tuyến qua Housing Help Hub của bang. Để được hỗ trợ tiền thuê, chủ nhà cũng phải nộp đơn; bang cho biết đơn đó phải được nộp trong vòng 21 ngày, nếu không hồ sơ sẽ hết hạn.
- Metro Housing|Boston: (617) 425-6700. Gọi 2-1-1 để hỏi thông tin cơ bản về RAFT; gọi 2-1-1 không phải là nộp đơn.

2. **Greater Boston Legal Services** cung cấp trợ giúp pháp lý dân sự miễn phí cho cư dân đủ điều kiện. Tiếp nhận về nhà ở (trừ vấn đề nơi tạm trú): (617) 603-1807, Thứ Hai–Thứ Sáu 9 giờ sáng–5 giờ chiều. Văn phòng chính: (617) 371-1234. Không bảo đảm có người đại diện pháp lý.

3. **City Life / Vida Urbana** hỗ trợ tổ chức người thuê và tư vấn. Gọi (617) 524-3541 để hỏi lịch họp hiện tại.

4. **Boston Office of Housing Stability** có thể giúp khi gặp khủng hoảng nhà ở: (617) 635-4200, Thứ Hai–Thứ Sáu 9 giờ sáng–5 giờ chiều.

**Nếu bạn nhận thông báo trục xuất:**
- Chỉ riêng thông báo yêu cầu rời nhà không bắt buộc bạn phải đi ngay; chủ nhà không thể cưỡng chế bạn rời đi nếu không có lệnh tòa.
- Đọc giấy tờ của tòa, đáp ứng thời hạn trả lời và tham dự các phiên tòa. Hỏi trợ giúp pháp lý về các lựa chọn, bao gồm yêu cầu bồi thẩm đoàn.
- Hãy sớm tìm trợ giúp tiền thuê và pháp lý. Thông tin này không phải tư vấn pháp lý riêng cho bạn.`,
  zh: `如果您拖欠租金或面临驱逐，请尽快联系住房或法律援助机构。各计划有资格要求，资金情况也可能变化。

**住房费用援助：**
1. **RAFT（Residential Assistance for Families in Transition）**在每个 12 个月期间可为符合条件的住房紧急情况提供最多 $7,000，包括租金、水电、搬家或抵押贷款。州政府列出的条件包括收入低于 AMI 的 50%，或面临家庭暴力风险的家庭收入低于 60%。请向管理机构确认您的资格。
- 通过州政府的 Housing Help Hub 在线申请。申请租金援助时，房东也必须提交申请；州政府表示房东须在 21 天内提交，否则申请会过期。
- Metro Housing|Boston：(617) 425-6700。致电 2-1-1 咨询 RAFT 基本问题；拨打 2-1-1 不等于提交申请。

2. **Greater Boston Legal Services**为符合条件的居民提供免费民事法律援助。住房案件受理（不包括庇护所事宜）：(617) 603-1807，周一至周五上午 9 点至下午 5 点。总办公室：(617) 371-1234。不保证提供法律代理。

3. **City Life / Vida Urbana**提供租户组织和指导。请致电 (617) 524-3541 查询当前会议安排。

4. **Boston Office of Housing Stability**可以帮助处理住房危机：(617) 635-4200，周一至周五上午 9 点至下午 5 点。

**如果您收到驱逐通知：**
- 仅凭退租通知本身并不要求您离开；房东没有法院命令不能强行赶您走。
- 阅读法院文件，遵守回复期限并出席庭审。向法律援助机构询问您的选择，包括申请陪审团。
- 尽快寻求租金援助和法律帮助。本信息不是针对个人的法律建议。`,
  ar: `إذا تأخرت في دفع الإيجار أو كنت تواجه الإخلاء، فاتصل سريعاً بمنظمة للإسكان أو المساعدة القانونية. للبرامج شروط أهلية وقد يتغير التمويل.

**المساعدة في تكاليف السكن:**
1. قد يوفر **RAFT (Residential Assistance for Families in Transition)** ما يصل إلى $7,000 لكل فترة 12 شهراً لحالات الطوارئ السكنية المؤهلة، بما فيها الإيجار والمرافق والانتقال أو الرهن العقاري. تذكر الولاية ضمن الشروط دخلاً أقل من 50% من AMI، أو أقل من 60% للأسر المعرضة لخطر العنف المنزلي. اطلب من الجهة المديرة تأكيد أهليتك.
- قدم عبر الإنترنت من خلال Housing Help Hub التابع للولاية. لمساعدة الإيجار يجب أن يقدم المالك طلباً أيضاً؛ تقول الولاية إنه يجب تقديمه خلال 21 يوماً وإلا تنتهي صلاحية الطلب.
- Metro Housing|Boston: (617) 425-6700. اتصل على 2-1-1 للأسئلة الأساسية عن RAFT؛ الاتصال على 2-1-1 ليس تقديم الطلب نفسه.

2. تقدم **Greater Boston Legal Services** مساعدة قانونية مدنية مجانية للمقيمين المؤهلين. استقبال قضايا السكن (عدا مسائل المأوى): (617) 603-1807، الاثنين–الجمعة من 9 صباحاً إلى 5 مساءً. المكتب الرئيسي: (617) 371-1234. التمثيل القانوني غير مضمون.

3. تقدم **City Life / Vida Urbana** تنظيماً وإرشاداً للمستأجرين. اتصل على (617) 524-3541 لمعرفة مواعيد الاجتماعات الحالية.

4. يمكن لـ **Boston Office of Housing Stability** المساعدة في أزمات السكن: (617) 635-4200، الاثنين–الجمعة من 9 صباحاً إلى 5 مساءً.

**إذا تلقيت إشعار إخلاء:**
- إشعار ترك السكن وحده لا يلزمك بالمغادرة؛ ولا يجوز للمالك إخراجك بالقوة دون أمر قضائي.
- اقرأ أوراق المحكمة، والتزم بمواعيد الرد، واحضر الجلسات. اسأل المساعدة القانونية عن خياراتك، بما فيها طلب هيئة محلفين.
- اطلب مساعدة الإيجار والمساعدة القانونية سريعاً. هذه المعلومات ليست مشورة قانونية شخصية.`,
  so: `Haddii kiradu kugu daahday ama aad wajahayso ka saarid, si dhakhso leh ula xiriir urur guryaha ama kaalmo sharci. Barnaamijyadu waxay leeyihiin shuruudo, maalgelintuna way is beddeli kartaa.

**Caawinta kharashka guryaha:**
1. **RAFT (Residential Assistance for Families in Transition)** wuxuu bixin karaa ilaa $7,000 12 bilood gudahood oo loogu talagalay xaaladaha degdegga ah ee guryaha ee u qalma, sida kiro, biilasha adeegyada, guuritaan ama mortgage. Gobolka wuxuu shuruudaha ku daray dakhli ka hooseeya 50% AMI, ama ka hooseeya 60% qoysaska halista ugu jira rabshad qoys. Weydii hay’adda maamusha inay xaqiijiso u-qalmitaankaaga.
- Online uga codso Housing Help Hub ee gobolka. Kaalmada kirada, milkiiluhu waa inuu sidoo kale codsi gudbiyaa; gobolku wuxuu sheegay inuu ku gudbiyo 21 maalmood gudahood haddii kale codsigu wuu dhacayaa.
- Metro Housing|Boston: (617) 425-6700. Wac 2-1-1 su’aalaha aasaasiga ah ee RAFT; wicitaanka 2-1-1 ma aha codsiga laftiisa.

2. **Greater Boston Legal Services** waxay siisaa dadka u qalma kaalmo sharci madani ah oo bilaash ah. Qaabilaadda arrimaha guryaha (marka laga reebo hoyga): (617) 603-1807, Isniin–Jimce 9 subaxnimo–5 galabnimo. Xafiiska guud: (617) 371-1234. Wakiilnimo sharci lama dammaanad qaado.

3. **City Life / Vida Urbana** waxay bixisaa abaabul iyo hagid kiraystayaal. Wac (617) 524-3541 si aad u hesho macluumaadka kulamada hadda.

4. **Boston Office of Housing Stability** waxay ka caawin kartaa dhibaatooyinka guryaha: (617) 635-4200, Isniin–Jimce 9 subaxnimo–5 galabnimo.

**Haddii aad hesho ogeysiis ka saarid:**
- Ogeysiiska bixitaanka kaligiis kuguma khasbayo inaad baxdo; milkiiluhu xoog kugama saari karo amar maxkamadeed la’aan.
- Akhri waraaqaha maxkamadda, ilaali waqtiyada jawaabta oo tag dhageysiyada. Kaalmada sharci weydii fursadahaaga, oo ay ku jirto codsiga xeerbeegti.
- Si dhakhso leh u raadso kaalmada kirada iyo sharci. Macluumaadkani ma aha talo sharci oo gaar ah.`,
  kea: `Si bu ten renda atrasadu ô bu sta na risku di despeju, kontakta rapidamenti un organizason di abitason ô ajuda legal. Programas ten regras di elegibilidadi i finansiamentu podi muda.

**Ajuda ku kustus di abitason:**
1. **RAFT (Residential Assistance for Families in Transition)** podi da até $7,000 pa períodu di 12 mes pa urjénsias di abitason elegível, inkluindu renda, servisus públiku, mudansa ô ipoteka. Na kritérius, stadu ta indika rendimentu baxu di 50% AMI, ô baxu di 60% pa família na risku di violénsia doméstiku. Pidi ajénsia administradora pa konfirma bu elegibilidadi.
- Kandidata online na Housing Help Hub di stadu. Pa ajuda ku renda, senhoriu tanbê mesti manda un kandidatura; stadu ta fla ma el mesti manda-l dentru di 21 dia ô kandidatura ta expira.
- Metro Housing|Boston: (617) 425-6700. Txoma 2-1-1 pa perguntas básiku sobri RAFT; txoma 2-1-1 ka é kandidatura propriu.

2. **Greater Boston Legal Services** ta da ajuda legal sivil di grasa pa morador elegível. Asetason di kazus di abitason (salvu asuntu di abrigu): (617) 603-1807, sigunda–sesta 9 di manhan–5 di tardi. Skritóriu prinsipal: (617) 371-1234. Representason legal ka sta garantidu.

3. **City Life / Vida Urbana** ta da orientason i apoiu pa organizason di inquilinus. Txoma (617) 524-3541 pa informason atual di reunions.

4. **Boston Office of Housing Stability** podi ajuda na krizi di abitason: (617) 635-4200, sigunda–sesta 9 di manhan–5 di tardi.

**Si bu resebe un avizu di despeju:**
- Un avizu pa sai sozinhu ka ta obriga-bu sai; senhoriu ka podi tirá-bu pa forsa sen orden di tribunal.
- Le papéis di tribunal, rispeita prazo di resposta i konparese na audiénsias. Pergunta ajuda legal sobri bu opsons, inkluindu un pedidu di júri.
- Busca rapidamenti ajuda pa renda i ajuda legal. Es informason ka é konselhu legal individual.`,
};
