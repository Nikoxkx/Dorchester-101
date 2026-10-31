import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts. WIC rules and contact details can change; review
 * with the program and qualified native speakers before relying on them. */
export const WIC_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**WIC** (Fanm, Tibebe ak Timoun) ofri sipò nitrisyon gratis, benefis manje, sipò pou bay tete ak referans sante pou fanmi ki kalifye nan Massachusetts.

**Kiyès ki ka kalifye:**
- Moun ansent; moun jiska 6 mwa apre akouchman, oswa jiska 12 mwa si yo bay tete; tibebe ak timoun ki poko gen 5 ane. Yon paran oswa responsab ka aplike pou yon timoun ki kalifye.
- Ou dwe abite Massachusetts epi gen yon bezwen nitrisyonèl; anplwaye WIC ka ede detèmine sa.
- Limit revni yo depann de kantite moun nan kay la. Soti 11 jen 2026 rive 30 jen 2027, referans pou yon kay 4 moun se $61,050 pa ane. SNAP, TAFDC ak kèk plan MassHealth ka etabli kalifikasyon pou revni; lòt kondisyon pwogram nan toujou aplike. Mande WIC pou verifye sitiyasyon ou.

**Sa WIC ka bay:**
- Benefis pou manje ki kalifye tankou lèt, fwomaj, yogout, ze, sereyal antye, fwi, legim, pwa, manba, manje tibebe ak lèt fòmil. Pake manje a depann de patisipan an.
- Sipò pou bay tete, edikasyon sou nitrisyon ak referans pou swen sante ak lòt sèvis.

**Kijan pou aplike:**
1. Ale sou mass.gov/wic oswa rele (800) 942-1007 pou jwenn yon biwo WIC epi pran randevou.
2. Mande biwo a ki prèv idantite, rezidans nan Massachusetts ak revni pou pote. Si li difisil pou jwenn dokiman yo, mande biwo a èd.

**Kontak WIC nan Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
  pt: `O **WIC** (Mulheres, Bebês e Crianças) oferece apoio nutricional gratuito, benefícios alimentares, apoio à amamentação e encaminhamentos de saúde a famílias elegíveis de Massachusetts.

**Quem pode se qualificar:**
- Gestantes; pessoas até 6 meses após o parto, ou até 12 meses se estiverem amamentando; bebês e crianças menores de 5 anos. Um pai, mãe ou responsável pode solicitar para uma criança elegível.
- É preciso morar em Massachusetts e ter uma necessidade nutricional, que a equipe do WIC pode ajudar a determinar.
- Os limites de renda dependem do tamanho da família. De 11 de junho de 2026 a 30 de junho de 2027, o limite para uma família de 4 pessoas é $61,050 por ano. SNAP, TAFDC e certos planos do MassHealth podem estabelecer a elegibilidade de renda; os demais requisitos do programa continuam valendo. Peça ao WIC que verifique seu caso.

**O que o WIC pode oferecer:**
- Benefícios para alimentos elegíveis como leite, queijo, iogurte, ovos, grãos integrais, frutas, verduras, feijão, pasta de amendoim, comida e fórmula para bebês. O pacote depende do participante.
- Apoio à amamentação, educação nutricional e encaminhamentos para atendimento de saúde e outros serviços.

**Como solicitar:**
1. Acesse mass.gov/wic ou ligue (800) 942-1007 para encontrar um escritório do WIC e agendar uma consulta.
2. Pergunte ao escritório quais comprovantes de identidade, residência em Massachusetts e renda levar. Se for difícil obter documentos, peça ajuda ao escritório.

**Contatos WIC em Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
  vi: `**WIC** (Phụ nữ, Trẻ sơ sinh và Trẻ em) cung cấp hỗ trợ dinh dưỡng miễn phí, trợ cấp thực phẩm, hỗ trợ nuôi con bằng sữa mẹ và giới thiệu dịch vụ y tế cho các gia đình đủ điều kiện tại Massachusetts.

**Ai có thể đủ điều kiện:**
- Người mang thai; người trong vòng 6 tháng sau sinh, hoặc 12 tháng nếu đang cho con bú; trẻ sơ sinh và trẻ dưới 5 tuổi. Cha mẹ hoặc người giám hộ có thể nộp đơn cho trẻ đủ điều kiện.
- Bạn phải sống tại Massachusetts và có nhu cầu dinh dưỡng; nhân viên WIC có thể giúp xác định điều này.
- Mức thu nhập tùy quy mô hộ. Từ ngày 11 tháng 6 năm 2026 đến ngày 30 tháng 6 năm 2027, mức hướng dẫn cho hộ 4 người là $61,050 mỗi năm. SNAP, TAFDC và một số chương trình MassHealth có thể xác lập điều kiện thu nhập; các điều kiện khác vẫn áp dụng. Hãy nhờ WIC kiểm tra trường hợp của bạn.

**WIC có thể cung cấp:**
- Trợ cấp cho thực phẩm hợp lệ như sữa, phô mai, sữa chua, trứng, ngũ cốc nguyên hạt, trái cây, rau, đậu, bơ đậu phộng, thức ăn và sữa công thức cho trẻ. Gói thực phẩm tùy người tham gia.
- Hỗ trợ nuôi con bằng sữa mẹ, giáo dục dinh dưỡng và giới thiệu dịch vụ chăm sóc sức khỏe và các dịch vụ khác.

**Cách nộp đơn:**
1. Vào mass.gov/wic hoặc gọi (800) 942-1007 để tìm văn phòng WIC và đặt lịch hẹn.
2. Hỏi văn phòng cần mang giấy tờ chứng minh danh tính, cư trú tại Massachusetts và thu nhập nào. Nếu khó lấy giấy tờ, hãy nhờ văn phòng giúp.

**Liên hệ WIC tại Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
  zh: `**WIC**（妇女、婴儿和儿童计划）为符合条件的马萨诸塞州家庭提供免费营养支持、食品福利、母乳喂养支持和健康服务转介。

**谁可能符合条件：**
- 孕妇；产后 6 个月内的人，或母乳喂养时产后 12 个月内的人；婴儿及 5 岁以下儿童。父母或监护人可以为符合条件的儿童申请。
- 您必须居住在马萨诸塞州，并有营养需求；WIC 工作人员可以帮助确定。
- 收入标准取决于家庭人数。2026 年 6 月 11 日至 2027 年 6 月 30 日，4 人家庭的标准为每年 $61,050。SNAP、TAFDC 和某些 MassHealth 计划可用于确定收入资格；计划的其他条件仍然适用。请让 WIC 核查您的情况。

**WIC 可能提供：**
- 可购买符合条件食品的福利，例如牛奶、奶酪、酸奶、鸡蛋、全谷物、水果、蔬菜、豆类、花生酱、婴儿食品和配方奶。食品组合取决于参与者。
- 母乳喂养支持、营养教育以及医疗和其他服务转介。

**如何申请：**
1. 访问 mass.gov/wic 或致电 (800) 942-1007 查找 WIC 办事处并预约。
2. 请询问办事处需要携带哪些身份证明、马萨诸塞州居住证明和收入证明。如果难以取得文件，请向办事处求助。

**Dorchester WIC 联系方式：**
- Codman Square WIC：(617) 825-3822
- DotHouse Health WIC：(617) 825-0805`,
  ar: `يقدم **WIC** (النساء والرضع والأطفال) دعماً غذائياً مجانياً وإعانات غذائية ودعم الرضاعة وإحالات صحية للأسر المؤهلة في Massachusetts.

**من قد يكون مؤهلاً:**
- الحوامل؛ والأشخاص خلال 6 أشهر بعد الولادة، أو 12 شهراً عند الرضاعة؛ والرضع والأطفال دون 5 سنوات. يمكن للوالد أو الوصي التقديم لطفل مؤهل.
- يجب الإقامة في Massachusetts ووجود حاجة غذائية؛ يمكن لموظفي WIC المساعدة في تحديدها.
- تعتمد إرشادات الدخل على حجم الأسرة. من 11 يونيو 2026 إلى 30 يونيو 2027، يبلغ المعيار لأسرة من 4 أشخاص $61,050 سنوياً. قد يثبت SNAP وTAFDC وبعض خطط MassHealth أهلية الدخل؛ وتظل شروط البرنامج الأخرى سارية. اطلب من WIC مراجعة حالتك.

**ما قد يقدمه WIC:**
- إعانات لأطعمة مؤهلة مثل الحليب والجبن والزبادي والبيض والحبوب الكاملة والفواكه والخضروات والفاصوليا وزبدة الفول السوداني وطعام الرضع والحليب الصناعي. تعتمد حزمة الطعام على المشارك.
- دعم الرضاعة والتثقيف الغذائي والإحالة إلى الرعاية الصحية والخدمات الأخرى.

**طريقة التقديم:**
1. ابدأ من mass.gov/wic أو اتصل على (800) 942-1007 للعثور على مكتب WIC وحجز موعد.
2. اسأل المكتب عن إثباتات الهوية والإقامة في Massachusetts والدخل المطلوب إحضارها. إذا صعب الحصول على المستندات فاطلب المساعدة من المكتب.

**جهات اتصال WIC في Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
  so: `**WIC** (Haweenka, Dhallaanka iyo Carruurta) waxay qoysaska u qalma ee Massachusetts siisaa taageero nafaqo oo bilaash ah, kaalmada cunto, taageerada naasnuujinta iyo gudbinta adeegyada caafimaadka.

**Cidda laga yaabo inay u qalanto:**
- Dadka uurka leh; dadka 6 bilood gudahood ka dib dhalmada, ama 12 bilood haddii ay naasnuujinayaan; dhallaanka iyo carruurta ka yar 5 sano. Waalid ama masuul ayaa u codsan kara ilmo u qalma.
- Waa inaad degan tahay Massachusetts oo aad leedahay baahi nafaqo; shaqaalaha WIC ayaa kaa caawin kara go’aaminta.
- Xadka dakhliga wuxuu ku xiran yahay cabbirka qoyska. Inta u dhexeysa 11 Juun 2026 iyo 30 Juun 2027, xadka qoys 4 qof ah waa $61,050 sanadkii. SNAP, TAFDC iyo qaar ka mid ah qorshayaasha MassHealth waxay xaqiijin karaan u-qalmitaanka dakhliga; shuruudaha kale ee barnaamijku weli way khuseeyaan. Ka codso WIC inay hubiso xaaladdaada.

**Waxa WIC bixin karto:**
- Kaalmo loogu talagalay cuntooyinka u qalma sida caano, farmaajo, yogurt, ukun, badar, miro, khudaar, digir, subagga lawska, cuntada iyo caanaha budada dhallaanka. Xirmada cuntadu waxay ku xiran tahay ka-qaybgalaha.
- Taageero naasnuujin, waxbarasho nafaqo iyo gudbinta daryeel caafimaad iyo adeegyo kale.

**Sida loo codsado:**
1. Ka bilow mass.gov/wic ama wac (800) 942-1007 si aad u hesho xafiiska WIC una qabsato ballan.
2. Xafiiska weydii caddaynta aqoonsiga, deganaanshaha Massachusetts iyo dakhliga ee aad keenayso. Haddii ay kugu adag tahay helidda dukumiintiyada, xafiiska caawimaad weydii.

**Xiriirrada WIC ee Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
  kea: `**WIC** (Mudjeris, Bebés i Kriansas) ta ofrese apoiu nutrisional di grasa, benefísius di kumida, apoiu pa aleitamentu i encaminhamentu pa saúdi pa famílias elegível na Massachusetts.

**Ken ki podi kalifika:**
- Pésuas grávida; pésuas té 6 mes dipôs di partu, ô té 12 mes si sta ta da mama; bebés i kriansas ku menus di 5 anu. Pai, mãi ô responsavel podi kandidata pa un kriansa elegível.
- Bu mesti mora na Massachusetts i ten un nesesidadi nutrisional; funsionárius di WIC podi ajuda determina es.
- Limitis di rendimentu ta dipendi di tamanhu di família. Di 11 di junhu 2026 té 30 di junhu 2027, referénsia pa família di 4 pésua é $61,050 pa anu. SNAP, TAFDC i algun planus di MassHealth podi stabelese elegibilidadi di rendimentu; otus kondisons di programa ta kontinuá apliká. Pidi WIC pa verifika bu situason.

**Kuzé ki WIC podi da:**
- Benefísius pa kumida elegível komu leti, kedju, iogurti, ovu, seriais integrais, fruta, legumis, fidjon, mantéga di mendubim, kumida i fórmula pa bebés. Pakoti di kumida ta dipendi di partisipanti.
- Apoiu pa da mama, edukason nutrisional i encaminhamentu pa kuidadus di saúdi i otus servisus.

**Modu di kandidata:**
1. Bai na mass.gov/wic ô txoma (800) 942-1007 pa atxa un skritóriu WIC i marka un konsulta.
2. Pergunta skritóriu kal prova di identidadi, rezidénsia na Massachusetts i rendimentu bu mesti leba. Si é difísil konsigi dokumentus, pidi skritóriu ajuda.

**Kontatus WIC na Dorchester:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
};
