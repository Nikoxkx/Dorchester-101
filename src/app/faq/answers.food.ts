import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts; check schedules, eligibility and phone numbers
 * against the English FAQ and obtain native-speaker review before relying on them. */
export const FOOD_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `Gen anpil resous manje gratis nan Dorchester. Men opsyon prensipal yo:

**Opsyon manje (rele pou konfime):**

1. **Codman Square Community Market** (depo sant sante a)
- 450 Washington St, Dorchester — mwatye mil sou Washington Street soti nan sant sante a
- Paj mache a bay madi 8è maten–1è apremidi, mèkredi 2è–7è apremidi ak jedi 8è maten–1è apremidi; yon lòt paj Codman bay yon orè diferan.
- Ou chwazi manje yo. Rele pou konfime orè aktyèl la, frekans vizit yo ak kondisyon pou idantite oswa adrès.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Depo ijans: 2yèm ak 4yèm madi chak mwa, 10è maten–midi, sou randevou sèlman
- Rele (617) 318-6940 pou pran randevou; yon randevou pa mwa
- (617) 318-6900 liy prensipal

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- Paj resous Codman an bay madi 2è–4:30 apremidi, avèk yon kontribisyon $2 yo mande pou chak sak.
- Rele pou konfime orè, disponiblite, pri ak kondisyon aktyèl yo.
- (617) 533-8133

**Mache manje mobil:**
- Depo patnè ak mache tanporè Greater Boston Food Bank yo pase nan diferan kote nan Dorchester
- Gade gbfb.org/need-food pou orè ki pi pre adrès ou

**Pou èd imedya:**
Rele Project Bread FoodSource Hotline: **1-800-645-8333**
- Gratis ak konfidansyèl
- Entèprèt disponib (plis pase 180 lang)
- Lendi–Vandredi 8è maten–7è aswè, Samdi 10è maten–2è apremidi`,
  pt: `Há muitos recursos de alimentação gratuita em Dorchester. Estas são as principais opções:

**Opções de alimentos (ligue para confirmar):**

1. **Codman Square Community Market** (despensa do centro de saúde)
- 450 Washington St, Dorchester — meia milha pela Washington Street a partir do centro de saúde
- A página do mercado informa terça 8h–13h, quarta 14h–19h e quinta 8h–13h; outra página da Codman informa horários diferentes.
- Você pode escolher os alimentos. Ligue para confirmar o horário atual, a frequência das visitas e as exigências de identidade ou endereço.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Despensa emergencial: segunda e quarta terça do mês, 10h–12h, somente com agendamento
- Ligue (617) 318-6940 para agendar; uma vez por mês
- (617) 318-6900 linha principal

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- A página de recursos da Codman informa terças 14h–16h30 e uma contribuição solicitada de $2 por sacola.
- Ligue para confirmar horário, disponibilidade, preço e requisitos atuais.
- (617) 533-8133

**Mercados móveis:**
- Despensas parceiras e eventos temporários do Greater Boston Food Bank circulam por Dorchester
- Consulte gbfb.org/need-food para encontrar horários perto do seu endereço

**Para ajuda imediata:**
Ligue para Project Bread FoodSource Hotline: **1-800-645-8333**
- Gratuito e confidencial
- Intérpretes disponíveis em mais de 180 idiomas
- Segunda a sexta 8h–19h, sábado 10h–14h`,
  vi: `Dorchester có nhiều nguồn thực phẩm miễn phí. Các lựa chọn chính:

**Các lựa chọn thực phẩm (gọi để xác nhận):**

1. **Codman Square Community Market** (điểm phát của trung tâm y tế)
- 450 Washington St, Dorchester — cách trung tâm y tế nửa dặm trên Washington Street
- Trang của chợ ghi thứ Ba 8 giờ sáng–1 giờ chiều, thứ Tư 2–7 giờ chiều và thứ Năm 8 giờ sáng–1 giờ chiều; trang Codman khác ghi giờ khác.
- Có thể tự chọn thực phẩm. Gọi để xác nhận giờ hiện tại, số lần được đến và yêu cầu về giấy tờ hoặc địa chỉ.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Điểm phát khẩn cấp: Thứ Ba thứ 2 và thứ 4 trong tháng, 10 giờ sáng–12 giờ trưa, chỉ theo lịch hẹn
- Gọi (617) 318-6940 để hẹn; mỗi tháng một lần
- (617) 318-6900 số chính

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- Trang tài nguyên của Codman ghi thứ Ba 2–4:30 chiều và mức đóng góp đề nghị $2 mỗi túi.
- Gọi để xác nhận lịch, nguồn hàng, giá và điều kiện hiện tại.
- (617) 533-8133

**Chợ thực phẩm lưu động:**
- Các điểm phát đối tác và chợ tạm của Greater Boston Food Bank luân phiên tại Dorchester
- Xem gbfb.org/need-food để tìm lịch gần địa chỉ của bạn

**Cần trợ giúp ngay:**
Gọi Project Bread FoodSource Hotline: **1-800-645-8333**
- Miễn phí, bảo mật
- Có thông dịch viên qua điện thoại (hơn 180 ngôn ngữ)
- Thứ Hai–Thứ Sáu 8 giờ sáng–7 giờ tối, Thứ Bảy 10 giờ sáng–2 giờ chiều`,
  zh: `Dorchester 有许多免费食物资源。主要选择如下：

**食品选择（请致电确认）：**

1. **Codman Square Community Market**（健康中心的食物发放点）
- 450 Washington St, Dorchester — 从健康中心沿 Washington Street 走半英里
- 市场网页列出周二上午 8 点至下午 1 点、周三下午 2 点至 7 点、周四上午 8 点至下午 1 点；Codman 的另一网页时间不同。
- 可自选食品。请致电确认当前时间、领取频率以及身份证件或地址要求。
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- 紧急食物发放：每月第二和第四个周二，上午 10 点–中午 12 点，仅接受预约
- 致电 (617) 318-6940 预约；每月可预约一次
- 总机 (617) 318-6900

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- Codman 的资源页面列出周二下午 2 点至 4:30，并请求每袋捐助 $2。
- 请致电确认当前时间、供应、价格和要求。
- (617) 533-8133

**流动食品市场：**
- Greater Boston Food Bank 合作发放点和临时市场在 Dorchester 轮流举办
- 访问 gbfb.org/need-food 查询离您最近的时间表

**需要立即帮助：**
致电 Project Bread FoodSource Hotline：**1-800-645-8333**
- 免费、保密
- 电话提供口译（180 多种语言）
- 周一至周五上午 8 点–晚上 7 点，周六上午 10 点–下午 2 点`,
  ar: `توجد موارد غذائية مجانية عديدة في Dorchester. فيما يلي الخيارات الرئيسية:

**خيارات الطعام (اتصل للتأكيد):**

1. **Codman Square Community Market** (مخزن المركز الصحي)
- 450 Washington St, Dorchester — على بعد نصف ميل من المركز الصحي على Washington Street
- تذكر صفحة السوق الثلاثاء 8 صباحاً–1 ظهراً، والأربعاء 2–7 مساءً، والخميس 8 صباحاً–1 ظهراً؛ وتذكر صفحة أخرى لدى Codman أوقاتاً مختلفة.
- يمكن اختيار الطعام. اتصل لتأكيد المواعيد الحالية وتكرار الزيارة ومتطلبات الهوية أو العنوان.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- مخزن الطوارئ: الثلاثاء الثاني والرابع من كل شهر، 10 صباحاً–12 ظهراً، بموعد فقط
- اتصل على (617) 318-6940 للحجز؛ موعد واحد شهرياً
- الخط الرئيسي (617) 318-6900

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- تذكر صفحة الموارد لدى Codman الثلاثاء 2–4:30 مساءً ومساهمة مطلوبة قدرها $2 للكيس.
- اتصل لتأكيد الجدول والتوفر والسعر والشروط الحالية.
- (617) 533-8133

**أسواق الطعام المتنقلة:**
- تتناوب مخازن شركاء Greater Boston Food Bank والأسواق المؤقتة في Dorchester
- راجع gbfb.org/need-food لمعرفة الجدول الأقرب إلى عنوانك

**للمساعدة الفورية:**
اتصل بخط Project Bread FoodSource Hotline: **1-800-645-8333**
- مجاني وسري
- يتوفر مترجمون عبر الهاتف (أكثر من 180 لغة)
- الاثنين–الجمعة 8 صباحاً–7 مساءً، السبت 10 صباحاً–2 ظهراً`,
  so: `Dorchester waxaa ka jira ilo cunto bilaash ah oo badan. Kuwa ugu waaweyn waa:

**Ikhtiyaarrada cuntada (wac si aad u xaqiijiso):**

1. **Codman Square Community Market** (bakhaarka xarunta caafimaadka)
- 450 Washington St, Dorchester — nus mayl oo Washington Street ah oo laga socdo xarunta caafimaadka
- Bogga suuqu wuxuu sheegayaa Talaado 8 subaxnimo–1 duhurnimo, Arbaco 2–7 galabnimo iyo Khamiis 8 subaxnimo–1 duhurnimo; bog kale oo Codman ah wuxuu sheegayaa saacado ka duwan.
- Adiga ayaa cuntada dooranaya. Wac si aad u xaqiijiso saacadaha hadda, inta jeer ee la booqan karo iyo shuruudaha aqoonsiga ama cinwaanka.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Bakhaar degdeg ah: Talaadada 2aad iyo 4aad ee bil kasta, 10 subaxnimo–12 duhurnimo, ballan keliya
- Wac (617) 318-6940 si aad ballan u qabsato; hal ballan bishii
- Khadka guud (617) 318-6900

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- Bogga ilaha Codman wuxuu sheegayaa Talaado 2–4:30 galabnimo iyo $2 bacdiiba oo la codsado.
- Wac si aad u xaqiijiso jadwalka, helitaanka, qiimaha iyo shuruudaha hadda jira.
- (617) 533-8133

**Suuqyada cuntada ee wareega:**
- Bakhaarrada iskaashatada iyo suuqyada ku-meelgaarka ah ee Greater Boston Food Bank waxay ku wareegaan Dorchester
- Ka eeg gbfb.org/need-food jadwalka kuugu dhow

**Gargaar degdeg ah:**
Wac Project Bread FoodSource Hotline: **1-800-645-8333**
- Waa bilaash oo qarsoodi ah
- Turjubaano telefoonka ah ayaa la heli karaa (in ka badan 180 luqadood)
- Isniin–Jimce 8 subaxnimo–7 fiidnimo, Sabti 10 subaxnimo–2 galabnimo`,
  kea: `Ten txeu rekursus di kumida di grasa na Dorchester. Es li é opsons prinsipal:

**Opsons di kumida (txoma pa konfirma):**

1. **Codman Square Community Market** (despena di sentru di saúdi)
- 450 Washington St, Dorchester — meiu milha na Washington Street di sentru di saúdi
- Pájina di merkadu ta lista tersa 8 di manhan–1 di tardi, kuarta 2–7 di tardi i kinta 8 di manhan–1 di tardi; otu pájina di Codman ta da oráriu diferenti.
- Bu podi skodje kumida. Txoma pa konfirma oráriu atual, frikuénsia di vizita i rekizitus di identifikason ô morada.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Despena di urjénsia: sigundu i kuartu tersa-féra di kada mes, 10 di manhan–12 di dia, só ku markason
- Txoma (617) 318-6940 pa marka; un markason pa mes
- Linha prinsipal (617) 318-6900

3. **Fair Foods $2 Bag at Lena Park**
- 150 American Legion Hwy, Dorchester
- Pájina di rekursus di Codman ta lista tersa 2–4:30 di tardi i un kontribuison p'didu di $2 pa saku.
- Txoma pa konfirma oráriu, disponibilidadi, presu i rekizitus atual.
- (617) 533-8133

**Merkadus móvel di kumida:**
- Despenas parsérus i merkadus temporáriu di Greater Boston Food Bank ta pasa pa Dorchester
- Konsulta gbfb.org/need-food pa oráriu más pertú di bu morada

**Pa ajuda imediatu:**
Txoma Project Bread FoodSource Hotline: **1-800-645-8333**
- Di grasa i konfidensial
- Intérpretis disponível na telefoni (más di 180 língua)
- Sigunda–sesta 8 di manhan–7 di noti, sábadu 10 di manhan–2 di tardi`,
};
