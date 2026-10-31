import type { Language } from '@/stores/appStore';

/** AI-assisted drafts; verify program rules and have native speakers review. */
export const TRAINING_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `Òganizasyon sa yo ofri èd pou chèche travay oswa fòmasyon pou moun nan Dorchester ak zòn ki toupre yo. Pwogram, kalifikasyon ak plas ki disponib yo varye; kontakte yo anvan ou aplike.

**MassHire Boston ABCD Career Center:** Resous gratis pou chèche travay, oryantasyon karyè ak enfòmasyon sou fòmasyon. Konseye karyè disponib sou randevou nan sant katye ABCD yo, tankou Dorchester. Rele (617) 442-2791.

**JVS Boston:** Pwogram fòmasyon pwofesyonèl gratis ak sèvis angle ak travay pou imigran ak refijye ki kalifye. Vizite jvs-boston.org oswa rele (617) 399-3131.

**Year Up United:** Fòmasyon Career Pathways san frè lekòl pou jèn adilt ki kalifye ki gen 18–29 ane, ak yon alokasyon edikasyon ak aksè a estaj. Tcheke sa ki disponib kounye a sou yearupunited.org.

**Opòtinite pou jèn Boston:** Sant futureBOS Vil la bay lis travay pou jèn, tankou opòtinite SuccessLink, pou jèn ak jèn adilt Boston ki gen 14–24 ane. Chak pòs gen pwòp règ ak orè li. Vizite boston.gov/departments/youth-employment-and-opportunity oswa rele (617) 635-4202.`,
  pt: `Estas organizações oferecem ajuda na busca de emprego ou treinamento para pessoas em Dorchester e arredores. Programas, elegibilidade e vagas variam; entre em contato antes de se inscrever.

**MassHire Boston ABCD Career Center:** Recursos gratuitos de busca de emprego, orientação profissional e informações sobre treinamento. Orientadores atendem com hora marcada em centros de bairro da ABCD, inclusive em Dorchester. Ligue para (617) 442-2791.

**JVS Boston:** Programas gratuitos de treinamento profissional e serviços de inglês e emprego para imigrantes e refugiados elegíveis. Acesse jvs-boston.org ou ligue para (617) 399-3131.

**Year Up United:** Treinamento Career Pathways sem cobrança de matrícula para jovens adultos elegíveis de 18–29 anos, com bolsa educacional e acesso a estágios. Veja as ofertas atuais em yearupunited.org.

**Oportunidades para jovens de Boston:** O portal futureBOS da Cidade lista empregos para jovens, incluindo oportunidades SuccessLink, para jovens e adultos jovens de Boston de 14–24 anos. Cada vaga tem suas regras e datas. Acesse boston.gov/departments/youth-employment-and-opportunity ou ligue para (617) 635-4202.`,
  vi: `Các tổ chức sau hỗ trợ tìm việc hoặc đào tạo cho người ở Dorchester và vùng lân cận. Chương trình, điều kiện và chỗ trống khác nhau; hãy liên hệ trước khi nộp đơn.

**MassHire Boston ABCD Career Center:** Tài nguyên tìm việc miễn phí, hướng nghiệp và thông tin đào tạo. Chuyên viên tư vấn làm việc theo lịch hẹn tại các cơ sở ABCD trong khu dân cư, bao gồm Dorchester. Gọi (617) 442-2791.

**JVS Boston:** Các chương trình đào tạo nghề miễn phí và dịch vụ tiếng Anh và việc làm cho người nhập cư và người tị nạn đủ điều kiện. Xem jvs-boston.org hoặc gọi (617) 399-3131.

**Year Up United:** Chương trình đào tạo Career Pathways không thu học phí cho thanh niên 18–29 tuổi đủ điều kiện, có trợ cấp học tập và cơ hội tiếp cận thực tập. Xem các chương trình hiện có tại yearupunited.org.

**Cơ hội cho thanh thiếu niên Boston:** Cổng futureBOS của Thành phố liệt kê việc làm cho thanh thiếu niên, gồm cơ hội SuccessLink, cho người trẻ Boston 14–24 tuổi. Mỗi vị trí có quy định và thời gian riêng. Xem boston.gov/departments/youth-employment-and-opportunity hoặc gọi (617) 635-4202.`,
  zh: `以下机构为 Dorchester 及周边居民提供求职帮助或培训。项目、资格和空位各不相同；申请前请先联系。

**MassHire Boston ABCD Career Center：**提供免费求职资源、职业指导和培训信息。职业顾问在包括 Dorchester 在内的 ABCD 社区站点按预约提供服务。致电 (617) 442-2791。

**JVS Boston：**提供免费职业培训，以及面向符合条件的移民和难民的英语与就业服务。访问 jvs-boston.org 或致电 (617) 399-3131。

**Year Up United：**为符合条件的 18–29 岁青年提供免学费的 Career Pathways 培训，提供教育津贴和获得实习机会的途径。请在 yearupunited.org 查看当前项目。

**波士顿青年机会：**市政府的 futureBOS 平台为 14–24 岁的波士顿青年列出工作，包括 SuccessLink 机会。每个职位都有自己的规定和时间安排。访问 boston.gov/departments/youth-employment-and-opportunity 或致电 (617) 635-4202。`,
  ar: `تقدم هذه المؤسسات مساعدة في البحث عن عمل أو تدريباً لسكان Dorchester والمناطق المجاورة. تختلف البرامج والأهلية والأماكن المتاحة؛ تواصل معها قبل التقديم.

**MassHire Boston ABCD Career Center:** موارد مجانية للبحث عن عمل وإرشاد مهني ومعلومات عن التدريب. يتوفر مستشارون مهنيون بموعد في مراكز ABCD بالأحياء، ومنها Dorchester. اتصل على (617) 442-2791.

**JVS Boston:** برامج تدريب مهني مجانية وخدمات اللغة الإنجليزية والعمل للمهاجرين واللاجئين المؤهلين. زر jvs-boston.org أو اتصل على (617) 399-3131.

**Year Up United:** تدريب Career Pathways دون رسوم دراسية للشباب المؤهلين من 18 إلى 29 عاماً، مع مخصص تعليمي وإمكانية الوصول إلى تدريب عملي. تحقّق من البرامج الحالية على yearupunited.org.

**فرص شباب Boston:** تسرد بوابة futureBOS التابعة للمدينة وظائف الشباب، ومنها فرص SuccessLink، لشباب Boston من 14 إلى 24 عاماً. لكل وظيفة قواعدها ومواعيدها. زر boston.gov/departments/youth-employment-and-opportunity أو اتصل على (617) 635-4202.`,
  so: `Ururradani waxay dadka Dorchester iyo agagaarkeeda siiyaan caawimo shaqo-raadis ama tababar. Barnaamijyada, u-qalmitaanka iyo boosaska way kala duwan yihiin; la xiriir ka hor intaadan codsan.

**MassHire Boston ABCD Career Center:** Agab shaqo-raadis oo bilaash ah, hagid shaqo iyo macluumaad tababar. La-taliyayaashu waxay ballan ku joogaan xarumaha xaafadaha ee ABCD, oo ay ku jirto Dorchester. Wac (617) 442-2791.

**JVS Boston:** Barnaamijyo tababar shaqo oo bilaash ah iyo adeegyo Ingiriisi iyo shaqo oo loogu talagalay muhaajiriinta iyo qaxootiga u qalma. Booqo jvs-boston.org ama wac (617) 399-3131.

**Year Up United:** Tababarka Career Pathways oo aan khidmad waxbarasho lahayn oo loogu talagalay dhallinyarada qaangaarka ah ee u qalma, 18–29 jir, oo leh kaalmo waxbarasho iyo helitaan fursado tababar shaqo. Ka hubi barnaamijyada hadda jira yearupunited.org.

**Fursadaha dhallinyarada Boston:** Bogga futureBOS ee Magaalada wuxuu taxaa shaqooyinka dhallinyarada, oo ay ku jiraan fursadaha SuccessLink, ee dadka Boston ee 14–24 jirka ah. Shaqo kastaa waxay leedahay xeerar iyo waqtiyo u gaar ah. Booqo boston.gov/departments/youth-employment-and-opportunity ama wac (617) 635-4202.`,
  kea: `Es organizasons li ta oferese ajuda pa buska trabadju ô formason pa pésuas di Dorchester i redondezas. Programas, elegibilidadi i vagas ta varia; kontakta-s antis di kandidata.

**MassHire Boston ABCD Career Center:** Rekursus di grasa pa buska trabadju, orientason profesional i informason di formason. Konselherus ta atendé ku markason na sentrus di bairu di ABCD, inkluindu Dorchester. Txoma (617) 442-2791.

**JVS Boston:** Programas di formason profesional di grasa i servisus di inglês i enpregu pa imigrantis i refujiadus elegível. Vizita jvs-boston.org ô txoma (617) 399-3131.

**Year Up United:** Formason Career Pathways sen propina pa jovens adultus elegível di 18–29 anu, ku bolsa edukasional i asesu a estájius. Konsulta ofertas atual na yearupunited.org.

**Oportunidadis pa jovens di Boston:** Portal futureBOS di Sidadi ta lista trabadjus pa jovens, inkluindu oportunidadis SuccessLink, pa jovens di Boston di 14–24 anu. Kada vaga ten ses próprias regras i datas. Vizita boston.gov/departments/youth-employment-and-opportunity ô txoma (617) 635-4202.`,
};
