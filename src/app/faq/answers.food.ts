import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts; check schedules, eligibility and phone numbers
 * against the English FAQ and obtain native-speaker review before relying on them. */
export const FOOD_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `Nan Dorchester gen resous manje gratis ak opsyon pwodui ki koute ti kòb. Rele pou konfime anvan ou ale:

**Opsyon manje (rele pou konfime):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — mwatye mil sou Washington Street soti nan sant sante a
- Paj Community Market la bay madi 8 a.m.–1 p.m., mèkredi 2–7 p.m. ak jedi 8 a.m.–1 p.m. Yon paj apa sou resous manje Codman bay yon gadmanje madi 8–11 a.m. nan menm adrès la; konfime si se menm sèvis la.
- Ou chwazi manje yo. Rele pou konfime orè aktyèl la, frekans vizit yo ak kondisyon pou idantite oswa adrès.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Depo ijans: 2yèm ak 4yèm madi chak mwa, 10è maten–midi, sou randevou sèlman
- Rele (617) 318-6940 pou pran randevou; yon randevou pa mwa
- (617) 318-6900 liy prensipal

3. **Sak pwodui Fair Foods nan Lena Park**
- 150 American Legion Hwy, Dorchester
- Lis kote Fair Foods la, mete ajou 6 septanm 2026, bay madi 2–4 p.m., soti otòn rive prentan; kote ete a diferan.
- Fair Foods di sak yo koute kèk dola epi li pa mande kalifikasyon, enskripsyon oswa pyès idantite. Konfime distribisyon an anvan ou ale.
- Fair Foods: (617) 288-6185; Lena Park CDC (sit akèy la): (617) 533-8133
- Orè: https://www.fairfoods.org/oursites

**Mache manje mobil:**
- Depo patnè ak mache tanporè Greater Boston Food Bank yo pase nan diferan kote nan Dorchester
- Gade gbfb.org/need-food pou orè ki pi pre adrès ou

**Pou èd imedya:**
Rele Project Bread FoodSource Hotline: **1-800-645-8333**
- Gratis ak konfidansyèl
- Entèprèt disponib (plis pase 180 lang)
- Lendi–Vandredi 8è maten–7è aswè, Samdi 10è maten–2è apremidi`,
  pt: `Dorchester oferece recursos gratuitos de alimentos e opções de produtos a baixo custo. Ligue para confirmar antes de ir:

**Opções de alimentos (ligue para confirmar):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — meia milha pela Washington Street a partir do centro de saúde
- A página do Community Market informa terça 8h–13h, quarta 14h–19h e quinta 8h–13h. Uma página separada de recursos alimentares da Codman informa uma despensa às terças 8h–11h no mesmo endereço; confirme se é o mesmo serviço.
- Você pode escolher os alimentos. Ligue para confirmar o horário atual, a frequência das visitas e as exigências de identidade ou endereço.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Despensa emergencial: segunda e quarta terça do mês, 10h–12h, somente com agendamento
- Ligue (617) 318-6940 para agendar; uma vez por mês
- (617) 318-6900 linha principal

3. **Sacolas de produtos da Fair Foods no Lena Park**
- 150 American Legion Hwy, Dorchester
- A lista de locais da Fair Foods, atualizada em 6 de setembro de 2026, informa terças, 14h–16h, do outono à primavera; no verão, o local muda.
- A Fair Foods diz que as sacolas custam alguns dólares e não exige critérios, inscrição nem documento de identidade. Confirme a distribuição antes de ir.
- Fair Foods: (617) 288-6185; Lena Park CDC (local anfitrião): (617) 533-8133
- Horário: https://www.fairfoods.org/oursites

**Mercados móveis:**
- Despensas parceiras e eventos temporários do Greater Boston Food Bank circulam por Dorchester
- Consulte gbfb.org/need-food para encontrar horários perto do seu endereço

**Para ajuda imediata:**
Ligue para Project Bread FoodSource Hotline: **1-800-645-8333**
- Gratuito e confidencial
- Intérpretes disponíveis em mais de 180 idiomas
- Segunda a sexta 8h–19h, sábado 10h–14h`,
  vi: `Dorchester có các nguồn thực phẩm miễn phí và lựa chọn nông sản giá thấp. Hãy gọi xác nhận trước khi đến:

**Các lựa chọn thực phẩm (gọi để xác nhận):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — cách trung tâm y tế nửa dặm trên Washington Street
- Trang Community Market ghi thứ Ba 8 giờ sáng–1 giờ chiều, thứ Tư 2–7 giờ chiều và thứ Năm 8 giờ sáng–1 giờ chiều. Trang tài nguyên thực phẩm riêng của Codman liệt kê điểm phát thứ Ba 8–11 giờ sáng tại cùng địa chỉ; hãy xác nhận đây có phải cùng dịch vụ không.
- Có thể tự chọn thực phẩm. Gọi để xác nhận giờ hiện tại, số lần được đến và yêu cầu về giấy tờ hoặc địa chỉ.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Điểm phát khẩn cấp: Thứ Ba thứ 2 và thứ 4 trong tháng, 10 giờ sáng–12 giờ trưa, chỉ theo lịch hẹn
- Gọi (617) 318-6940 để hẹn; mỗi tháng một lần
- (617) 318-6900 số chính

3. **Túi rau quả Fair Foods tại Lena Park**
- 150 American Legion Hwy, Dorchester
- Danh sách địa điểm Fair Foods, cập nhật ngày 6 tháng 9 năm 2026, ghi thứ Ba 2–4 giờ chiều, từ mùa thu đến mùa xuân; địa điểm mùa hè khác.
- Fair Foods cho biết túi có giá vài đô la và không yêu cầu điều kiện, đăng ký hay giấy tờ tùy thân. Hãy xác nhận việc phát thực phẩm trước khi đến.
- Fair Foods: (617) 288-6185; Lena Park CDC (địa điểm chủ nhà): (617) 533-8133
- Lịch: https://www.fairfoods.org/oursites

**Chợ thực phẩm lưu động:**
- Các điểm phát đối tác và chợ tạm của Greater Boston Food Bank luân phiên tại Dorchester
- Xem gbfb.org/need-food để tìm lịch gần địa chỉ của bạn

**Cần trợ giúp ngay:**
Gọi Project Bread FoodSource Hotline: **1-800-645-8333**
- Miễn phí, bảo mật
- Có thông dịch viên qua điện thoại (hơn 180 ngôn ngữ)
- Thứ Hai–Thứ Sáu 8 giờ sáng–7 giờ tối, Thứ Bảy 10 giờ sáng–2 giờ chiều`,
  zh: `Dorchester 有免费的食物资源，也有低价农产品选择。前往前请先致电确认：

**食品选择（请致电确认）：**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — 从健康中心沿 Washington Street 走半英里
- Community Market 页面列出周二上午 8 点至下午 1 点、周三下午 2 点至 7 点、周四上午 8 点至下午 1 点。Codman 另一份食品资源页面列出同一地址周二上午 8–11 点的食品发放；请确认是否为同一服务。
- 可自选食品。请致电确认当前时间、领取频率以及身份证件或地址要求。
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- 紧急食物发放：每月第二和第四个周二，上午 10 点–中午 12 点，仅接受预约
- 致电 (617) 318-6940 预约；每月可预约一次
- 总机 (617) 318-6900

3. **Fair Foods 在 Lena Park 发放的果蔬袋**
- 150 American Legion Hwy, Dorchester
- Fair Foods 地点列表（2026 年 9 月 6 日更新）列出秋季至春季每周二下午 2–4 点；夏季地点不同。
- Fair Foods 表示每袋需几美元，不要求资格审核、登记或身份证件。前往前请确认发放安排。
- Fair Foods：(617) 288-6185；Lena Park CDC（主办地点）：(617) 533-8133
- 时间表：https://www.fairfoods.org/oursites

**流动食品市场：**
- Greater Boston Food Bank 合作发放点和临时市场在 Dorchester 轮流举办
- 访问 gbfb.org/need-food 查询离您最近的时间表

**需要立即帮助：**
致电 Project Bread FoodSource Hotline：**1-800-645-8333**
- 免费、保密
- 电话提供口译（180 多种语言）
- 周一至周五上午 8 点–晚上 7 点，周六上午 10 点–下午 2 点`,
  ar: `تتوفر في Dorchester موارد غذائية مجانية وخيارات منتجات بأسعار منخفضة. اتصل للتأكد قبل الذهاب:

**خيارات الطعام (اتصل للتأكيد):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — على بعد نصف ميل من المركز الصحي على Washington Street
- تذكر صفحة Community Market الثلاثاء 8 صباحاً–1 ظهراً، والأربعاء 2–7 مساءً، والخميس 8 صباحاً–1 ظهراً. وتذكر صفحة منفصلة لموارد الطعام لدى Codman مخزنة الثلاثاء 8–11 صباحاً في العنوان نفسه؛ أكّد ما إذا كانت الخدمة نفسها.
- يمكن اختيار الطعام. اتصل لتأكيد المواعيد الحالية وتكرار الزيارة ومتطلبات الهوية أو العنوان.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- مخزن الطوارئ: الثلاثاء الثاني والرابع من كل شهر، 10 صباحاً–12 ظهراً، بموعد فقط
- اتصل على (617) 318-6940 للحجز؛ موعد واحد شهرياً
- الخط الرئيسي (617) 318-6900

3. **أكياس منتجات Fair Foods في Lena Park**
- 150 American Legion Hwy, Dorchester
- تدرج قائمة مواقع Fair Foods، المحدّثة في 6 سبتمبر 2026، التوزيع الثلاثاء 2–4 مساءً من الخريف إلى الربيع؛ ويختلف الموقع صيفاً.
- تذكر Fair Foods أن سعر الأكياس بضعة دولارات ولا توجد شروط أهلية أو تسجيل أو طلب هوية. أكّد التوزيع قبل الذهاب.
- Fair Foods: (617) 288-6185؛ Lena Park CDC (الموقع المضيف): (617) 533-8133
- الجدول: https://www.fairfoods.org/oursites

**أسواق الطعام المتنقلة:**
- تتناوب مخازن شركاء Greater Boston Food Bank والأسواق المؤقتة في Dorchester
- راجع gbfb.org/need-food لمعرفة الجدول الأقرب إلى عنوانك

**للمساعدة الفورية:**
اتصل بخط Project Bread FoodSource Hotline: **1-800-645-8333**
- مجاني وسري
- يتوفر مترجمون عبر الهاتف (أكثر من 180 لغة)
- الاثنين–الجمعة 8 صباحاً–7 مساءً، السبت 10 صباحاً–2 ظهراً`,
  so: `Dorchester waxaa ka jira ilo cunto oo bilaash ah iyo ikhtiyaarro wax-soo-saar oo qiimahoodu jaban yahay. Wac si aad u xaqiijiso ka hor intaadan tegin:

**Ikhtiyaarrada cuntada (wac si aad u xaqiijiso):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — nus mayl oo Washington Street ah oo laga socdo xarunta caafimaadka
- Bogga Community Market wuxuu sheegayaa Talaado 8 subaxnimo–1 duhurnimo, Arbaco 2–7 galabnimo iyo Khamiis 8 subaxnimo–1 duhurnimo. Bog kale oo Codman ah wuxuu taxaa goob cunto-bixin Talaado 8–11 subaxnimo isla cinwaanka; xaqiiji inay isku adeeg yihiin.
- Adiga ayaa cuntada dooranaya. Wac si aad u xaqiijiso saacadaha hadda, inta jeer ee la booqan karo iyo shuruudaha aqoonsiga ama cinwaanka.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Bakhaar degdeg ah: Talaadada 2aad iyo 4aad ee bil kasta, 10 subaxnimo–12 duhurnimo, ballan keliya
- Wac (617) 318-6940 si aad ballan u qabsato; hal ballan bishii
- Khadka guud (617) 318-6900

3. **Bacaha wax-soo-saarka Fair Foods ee Lena Park**
- 150 American Legion Hwy, Dorchester
- Liiska goobaha Fair Foods, oo la cusboonaysiiyay 6 Sebtembar 2026, wuxuu taxayaa Talaado 2–4 galabnimo laga bilaabo dayrta ilaa gu’ga; goobta xagaagu way ka duwan tahay.
- Fair Foods waxay sheegaysaa in bacuhu ku kacaan dhowr doollar, isla markaana aan loo baahnayn u-qalmitaan, isdiiwaangelin ama aqoonsi. Xaqiiji qaybinta ka hor intaadan tegin.
- Fair Foods: (617) 288-6185; Lena Park CDC (goobta martigelisa): (617) 533-8133
- Jadwal: https://www.fairfoods.org/oursites

**Suuqyada cuntada ee wareega:**
- Bakhaarrada iskaashatada iyo suuqyada ku-meelgaarka ah ee Greater Boston Food Bank waxay ku wareegaan Dorchester
- Ka eeg gbfb.org/need-food jadwalka kuugu dhow

**Gargaar degdeg ah:**
Wac Project Bread FoodSource Hotline: **1-800-645-8333**
- Waa bilaash oo qarsoodi ah
- Turjubaano telefoonka ah ayaa la heli karaa (in ka badan 180 luqadood)
- Isniin–Jimce 8 subaxnimo–7 fiidnimo, Sabti 10 subaxnimo–2 galabnimo`,
  kea: `Na Dorchester ten rekursus di kumida grátis i opsons di produtus ku presu baxu. Txoma pa konfirma antis di bai:

**Opsons di kumida (txoma pa konfirma):**

1. **Codman Square Community Market**
- 450 Washington St, Dorchester — meiu milha na Washington Street di sentru di saúdi
- Pájina di Community Market ta lista tersa 8 di manhan–1 di tardi, kuarta 2–7 di tardi i kinta 8 di manhan–1 di tardi. Un pájina separadu di rekursus di kumida di Codman ta lista un dispensa tersa 8–11 di manhan na mesmu enderesu; konfirma si é mesmu servisu.
- Bu podi skodje kumida. Txoma pa konfirma oráriu atual, frikuénsia di vizita i rekizitus di identifikason ô morada.
- (617) 825-9660

2. **Salvation Army Kroc Center**
- 650 Dudley St, Dorchester
- Despena di urjénsia: sigundu i kuartu tersa-féra di kada mes, 10 di manhan–12 di dia, só ku markason
- Txoma (617) 318-6940 pa marka; un markason pa mes
- Linha prinsipal (617) 318-6900

3. **Sakus di produtus Fair Foods na Lena Park**
- 150 American Legion Hwy, Dorchester
- Lista di lugar di Fair Foods, atualizadu 6 di setenbru di 2026, ta lista tersas 2–4 di tardi, di otón té primavéra; lugar di veron é diferenti.
- Fair Foods ta fla ki sakus ta kustaba alguns dólar i ka mesti elegibilidadi, inskrison ô identifikason. Konfirma distribuisaun antis di bai.
- Fair Foods: (617) 288-6185; Lena Park CDC (lugar ki ta resebe): (617) 533-8133
- Oráriu: https://www.fairfoods.org/oursites

**Merkadus móvel di kumida:**
- Despenas parsérus i merkadus temporáriu di Greater Boston Food Bank ta pasa pa Dorchester
- Konsulta gbfb.org/need-food pa oráriu más pertú di bu morada

**Pa ajuda imediatu:**
Txoma Project Bread FoodSource Hotline: **1-800-645-8333**
- Di grasa i konfidensial
- Intérpretis disponível na telefoni (más di 180 língua)
- Sigunda–sesta 8 di manhan–7 di noti, sábadu 10 di manhan–2 di tardi`,
};
