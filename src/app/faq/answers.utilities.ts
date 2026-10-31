import type { Language } from '@/stores/appStore';

/** AI-assisted drafts; check current assistance and shutoff rules with providers. */
export const UTILITIES_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `**Home Energy Assistance (HEAP / LIHEAP)** ede kay ki kalifye nan Massachusetts peye yon pati nan depans chofaj prensipal yo. Pwopriyetè ak lokatè ka aplike, menm lè chofaj enkli nan lwaye a. Kalifikasyon depann de kantite moun nan kay la, revni brit ak lòt règ; direktiv revni an se 60% oswa mwens nan revni medyàn leta estime a. Benefis ak finansman yo varye.

Peryòd èd chofaj la soti 1 novanm rive 30 avril. Aplike sou mass.gov/heatinghelp oswa kontakte ABCD Fuel Assistance pou Boston nan (617) 357-6012. Mande dat limit aktyèl yo ak dokiman ki nesesè yo.

**Lòt èd:** Mande konpayi sèvis piblik ou sou rabè selon revni, plan peman ak pwogram pou efase aryere si genyen. Kèk enskripsyon ka otomatik, men pa sipoze rabè a aplike: tcheke bòdwo ou oswa rele. Eversource: (800) 592-2000; elektrisite National Grid Massachusetts: (800) 322-3223. Pou lòt èd, rele 2-1-1.

**Pwoteksyon kont koupe sèvis:** Pou sèvis gaz ak elektrisite reglemante ki nesesè pou chofaj, difikilte finansye ka kalifye yon kay pou pwoteksyon ivè soti 15 novanm rive 15 mas. Lòt pwoteksyon ka aplike, pa egzanp lè yon moun nan kay la malad grav, gen yon tibebe nan kay la, oswa tout rezidan yo gen 65 ane oswa plis; règ ak dokiman yo diferan. Kontakte konpayi ou byen vit pou mande sou pwoteksyon ak retablisman sèvis. Pwoteksyon pa efase bòdwo a; lajan yo dwe a toujou dwe peye.`,
  pt: `O **Home Energy Assistance (HEAP / LIHEAP)** ajuda famílias elegíveis de Massachusetts a pagar parte dos custos da fonte principal de aquecimento. Proprietários e inquilinos podem solicitar, inclusive quando o aquecimento está incluído no aluguel. A elegibilidade depende do tamanho da família, renda bruta e outras regras; o limite de renda é igual ou inferior a 60% da renda mediana estadual estimada. Benefícios e recursos variam.

O período de assistência para aquecimento vai de 1º de novembro a 30 de abril. Solicite em mass.gov/heatinghelp ou entre em contato com ABCD Fuel Assistance para Boston pelo (617) 357-6012. Pergunte sobre prazos atuais e documentos necessários.

**Outra ajuda:** Pergunte à concessionária sobre descontos por renda, planos de pagamento e programas de perdão de dívidas, se houver. Algumas inscrições podem ser automáticas, mas não suponha que o desconto foi aplicado: verifique a conta ou ligue. Eversource: (800) 592-2000; eletricidade National Grid Massachusetts: (800) 322-3223. Para outra ajuda, ligue 2-1-1.

**Proteção contra cortes:** Para serviço regulado de gás e eletricidade necessário ao aquecimento, dificuldades financeiras podem dar direito à proteção de inverno de 15 de novembro a 15 de março. Outras proteções podem valer, por exemplo, quando alguém da casa está gravemente doente, um bebê mora na casa ou todos os moradores têm 65 anos ou mais; regras e documentos variam. Contate logo a concessionária para perguntar sobre proteção e restabelecimento. A proteção não elimina a conta; os valores devidos ainda precisam ser pagos.`,
  vi: `**Home Energy Assistance (HEAP / LIHEAP)** giúp các hộ gia đình đủ điều kiện ở Massachusetts trả một phần chi phí sưởi ấm chính. Chủ nhà và người thuê đều có thể nộp đơn, kể cả khi tiền sưởi đã tính trong tiền thuê. Điều kiện phụ thuộc quy mô hộ, tổng thu nhập và các quy định khác; mức thu nhập phải bằng hoặc thấp hơn 60% thu nhập trung vị ước tính của tiểu bang. Trợ cấp và nguồn quỹ thay đổi.

Thời gian trợ giúp sưởi ấm từ ngày 1 tháng 11 đến ngày 30 tháng 4. Nộp đơn tại mass.gov/heatinghelp hoặc liên hệ ABCD Fuel Assistance cho Boston theo số (617) 357-6012. Hỏi về hạn hiện tại và giấy tờ cần thiết.

**Trợ giúp khác:** Hỏi công ty tiện ích về giảm giá theo thu nhập, kế hoạch trả tiền và chương trình xóa nợ quá hạn nếu có. Một số trường hợp có thể được ghi danh tự động, nhưng đừng tự cho rằng đã được giảm giá: hãy kiểm tra hóa đơn hoặc gọi. Eversource: (800) 592-2000; điện National Grid Massachusetts: (800) 322-3223. Để tìm trợ giúp khác, gọi 2-1-1.

**Bảo vệ khỏi việc ngắt dịch vụ:** Với dịch vụ khí đốt và điện được quản lý cần cho sưởi ấm, khó khăn tài chính có thể giúp hộ gia đình được bảo vệ mùa đông từ ngày 15 tháng 11 đến ngày 15 tháng 3. Các bảo vệ khác có thể áp dụng, ví dụ khi có người trong nhà mắc bệnh nặng, có trẻ sơ sinh sống trong nhà hoặc mọi cư dân từ 65 tuổi trở lên; quy định và giấy tờ khác nhau. Hãy sớm liên hệ công ty tiện ích để hỏi về bảo vệ và khôi phục dịch vụ. Việc bảo vệ không xóa hóa đơn; số tiền nợ vẫn phải trả.`,
  zh: `**Home Energy Assistance（HEAP / LIHEAP）**帮助马萨诸塞州符合条件的家庭支付部分主要供暖费用。房主和租户均可申请，包括供暖费包含在租金中的家庭。资格取决于家庭人数、总收入及其他规定；收入标准为不超过估算的州收入中位数的 60%。福利和资金可能变化。

供暖援助期为 11 月 1 日至 4 月 30 日。请在 mass.gov/heatinghelp 申请，或致电波士顿 ABCD Fuel Assistance：(617) 357-6012。请询问当前截止日期和所需文件。

**其他帮助：**向公用事业公司询问收入优惠、付款计划和是否有欠费减免计划。部分登记可能自动进行，但不要假设折扣已生效：请检查账单或致电。Eversource：(800) 592-2000；National Grid 马萨诸塞州电力：(800) 322-3223。如需其他帮助，致电 2-1-1。

**防止停供的保护：**对于供暖所需的受监管燃气和电力服务，经济困难可能使家庭符合 11 月 15 日至 3 月 15 日的冬季保护条件。其他保护也可能适用，例如家庭成员患重病、家中有婴儿，或所有住户均年满 65 岁；规定和所需证明各不相同。请尽快联系公用事业公司，询问保护和恢复供给。保护不会免除账单；欠款仍需支付。`,
  ar: `يساعد **Home Energy Assistance ‏(HEAP / LIHEAP)** الأسر المؤهلة في Massachusetts في دفع جزء من تكاليف مصدر التدفئة الأساسي. يمكن للمالكين والمستأجرين التقديم، حتى عندما تكون التدفئة مشمولة بالإيجار. تعتمد الأهلية على حجم الأسرة والدخل الإجمالي وقواعد أخرى؛ معيار الدخل هو 60% أو أقل من الدخل الوسيط التقديري للولاية. تختلف الإعانات والتمويل.

تمتد فترة مساعدة التدفئة من 1 نوفمبر إلى 30 أبريل. قدّم عبر mass.gov/heatinghelp أو تواصل مع ABCD Fuel Assistance في Boston على (617) 357-6012. اسأل عن المواعيد الحالية والمستندات المطلوبة.

**مساعدة أخرى:** اسأل شركة المرافق عن خصومات الدخل وخطط الدفع وأي برنامج لإعفاء المتأخرات. قد يكون التسجيل في بعض الحالات تلقائياً، لكن لا تفترض تطبيق الخصم: راجع فاتورتك أو اتصل. Eversource: (800) 592-2000؛ كهرباء National Grid في Massachusetts: (800) 322-3223. لمساعدة أخرى اتصل على 2-1-1.

**الحماية من قطع الخدمة:** بالنسبة لخدمات الغاز والكهرباء الخاضعة للتنظيم واللازمة للتدفئة، قد تؤهل الضائقة المالية الأسرة للحماية الشتوية من 15 نوفمبر إلى 15 مارس. قد تنطبق حماية أخرى، مثلاً عند إصابة أحد أفراد الأسرة بمرض خطير، أو وجود رضيع في المنزل، أو بلوغ جميع المقيمين 65 عاماً فأكثر؛ تختلف القواعد والمستندات. تواصل سريعاً مع شركة المرافق للسؤال عن الحماية وإعادة الخدمة. الحماية لا تلغي الفاتورة؛ لا تزال المبالغ المستحقة واجبة الدفع.`,
  so: `**Home Energy Assistance (HEAP / LIHEAP)** wuxuu ka caawiyaa qoysaska Massachusetts ee u qalma inay bixiyaan qayb ka mid ah kharashka ilaha kulaylinta ugu muhiimsan. Milkiilayaasha iyo kiraystayaashu way codsan karaan, xitaa marka kulaylku kirada ku jiro. U-qalmitaanku wuxuu ku xiran yahay cabbirka qoyska, dakhliga guud iyo xeerar kale; heerka dakhliga waa 60% ama ka yar dakhliga dhexe ee gobolka ee la qiyaasay. Dheefaha iyo maalgelintu way kala duwan yihiin.

Muddada caawimada kulaylintu waa Noofambar 1 ilaa Abriil 30. Ka codso mass.gov/heatinghelp ama kala xiriir ABCD Fuel Assistance ee Boston (617) 357-6012. Weydii waqtiyada kama-dambaysta ah ee hadda iyo dukumiintiyada loo baahan yahay.

**Caawimo kale:** Weydii shirkadda adeegga qiimo-dhimista dakhliga ku salaysan, qorshayaasha lacag-bixinta iyo barnaamijka cafinta deynta haddii uu jiro. Qaar si toos ah ayaa loo diiwaangelin karaa, laakiin ha u qaadan in qiimo-dhimis lagu daray: hubi biilka ama wac. Eversource: (800) 592-2000; korontada National Grid Massachusetts: (800) 322-3223. Caawimo kale wac 2-1-1.

**Ka-hortagga jarista adeegga:** Adeegga gaaska iyo korontada ee la nidaamiyo ee kulaylinta loo baahan yahay, dhibaato dhaqaale waxay qoyska u qalmi kartaa ilaalinta jiilaalka laga bilaabo Noofambar 15 ilaa Maarso 15. Ilaalino kale ayaa khuseyn kara, tusaale ahaan marka qof guriga jooga aad u xanuunsan yahay, ilmo yar guriga ku nool yahay, ama dhammaan dadka deggan ay 65 jir ama ka weyn yihiin; xeerarka iyo dukumiintiyadu way kala duwan yihiin. Si degdeg ah ula xiriir shirkadda adeegga oo weydii ilaalinta iyo soo celinta. Ilaalintu biilka ma tirtirto; lacagta lagu leeyahay weli waa in la bixiyaa.`,
  kea: `**Home Energy Assistance (HEAP / LIHEAP)** ta ajuda famílias elegível di Massachusetts paga un parti di kustus di ses fonti prinsipal di akesimentu. Proprietárius i inquilinus podi kandidata, mesmu kandu akesimentu sta inkluídu na renda. Elegibilidadi ta dipendi di tamanhu di família, rendimentu brutu i otus regras; padron di rendimentu é 60% ô menus di rendimentu medianu estadual estimadu. Benefísius i fundus ta varia.

Períodu di ajuda pa akesimentu é di 1 di novembru a 30 di abril. Kandidata na mass.gov/heatinghelp ô kontakta ABCD Fuel Assistance pa Boston na (617) 357-6012. Pergunta sobri prazos atual i dokumentus nesesáriu.

**Otu ajuda:** Pergunta bu konpanhia di servisu públiku sobri deskontus pa rendimentu, planus di pagamentu i programas di perdan di dívida si es ten. Algun inskrisons podi ser automátiku, mas ka supo ma deskontu dja aplikadu: konfiri fatura ô txoma. Eversource: (800) 592-2000; eletrisidadi National Grid Massachusetts: (800) 322-3223. Pa otu ajuda, txoma 2-1-1.

**Proteson kontra korti:** Pa servisus reguladu di gás i eletrisidadi nesesáriu pa akesimentu, difikuldadi finanseiru podi faze família elegível pa proteson di invernu di 15 di novembru a 15 di marsu. Otus protesons podi aplika, pa ezemplu kandu un membru di kaza sta gravementi doenti, un bebé ta mora na kaza, ô tudu morador ten 65 anu ô más; regras i dokumentus ta varia. Kontakta bu konpanhia rápidu pa pergunta sobri proteson i restabelesimentu. Proteson ka ta apaga fatura; montantis divídu inda ten ki ser pagu.`,
};
