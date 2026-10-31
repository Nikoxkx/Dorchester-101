import type { Language } from '@/stores/appStore';

/** AI-assisted legal-information drafts, not legal advice. Check the law and
 * obtain qualified native-speaker and legal review before relying on them. */
export const RIGHTS_FAQ_ANSWERS: Record<Exclude<Language, 'en' | 'es'>, string> = {
  ht: `Lokatè nan Massachusetts gen pwoteksyon, men règ yo depann de kalite lokasyon an ak sitiyasyon an. Pou konsèy sou ka ou, kontakte èd legal.

**Depo garanti:** An jeneral, pwopriyetè a ka mande premye ak dènye mwa lwaye, yon depo garanti ki pa depase yon mwa lwaye, ak pri reyèl yon nouvo seri ak kle. Yo dwe mete depo a nan yon kont separe ki pote enterè nan yon bank Massachusetts. Pwopriyetè a dwe remèt depo a oswa balans lan nan 30 jou apre lokasyon an fini, ak dokiman obligatwa pou dediksyon yo.

**Degèpisman:** Delè avi yo depann de rezon an, kalite lokasyon an ak règ federal ki aplike. Yon avi pou kite kay la pou kont li pa oblije ou ale; pwopriyetè a pa ka mete ou deyò ak fòs san òdonans tribinal. Li dokiman tribinal yo, reponn alè epi chèche èd legal.

**Lojman ki an sekirite:** Dapre kòd lojman eta a, sezon chofaj nòmal la soti 15 septanm rive 31 me; otorite lokal yo ka chanje dat yo. Pandan sezon an, minimòm nan se 68°F soti 7è maten rive 11è aswè ak 64°F soti 11:01 aswè rive 6:59 maten. An jeneral dlo cho a dwe omwen 110°F. Rapòte pwoblèm yo bay pwopriyetè a ak sèvis enspeksyon lokal yo.

**Ogmantasyon lwaye:** Règ yo varye selon kontra ak pwogram nan. Pou yon lokasyon san tèm fiks, an jeneral avi a se 30 jou oswa yon peryòd lwaye konplè, sa ki pi long lan. An jeneral yon kontra pou yon tèm fiks pa ka chanje pandan tèm nan san akò; lojman sibvansyone ka gen lòt règ.

**Reprezay:** Pwopriyetè a pa ka pran reprezay kont lokatè pou aktivite ki pwoteje, tankou rapòte vyolasyon kòd, òganize ak lòt lokatè oswa egzèse dwa legal yo. Kontakte èd legal si ou bezwen èd.`,
  pt: `Inquilinos em Massachusetts têm proteções, mas as regras dependem do tipo de locação e das circunstâncias. Para orientação sobre seu caso, procure assistência jurídica.

**Depósitos de garantia:** Em geral, o proprietário pode cobrar o primeiro e o último mês de aluguel, um depósito de até um mês de aluguel e o custo real de uma nova fechadura e chave. O depósito deve ficar em conta separada e remunerada em um banco de Massachusetts. O proprietário deve devolver o depósito ou saldo em até 30 dias após o fim da locação, com a documentação exigida para descontos.

**Despejos:** Os prazos de aviso dependem do motivo, da locação e das regras federais aplicáveis. Uma notificação para desocupar, por si só, não obriga você a sair; o proprietário não pode removê-lo à força sem ordem judicial. Leia e responda aos documentos do tribunal no prazo e procure ajuda jurídica.

**Moradia segura:** Pelo código estadual, a temporada de aquecimento padrão vai de 15 de setembro a 31 de maio; autoridades locais podem alterar as datas. Nesse período, a temperatura mínima é 68°F das 7h às 23h e 64°F das 23h01 às 6h59. A água quente geralmente deve atingir pelo menos 110°F. Informe problemas ao proprietário e aos serviços locais de inspeção.

**Aumentos de aluguel:** As regras variam conforme o contrato e o programa. Na locação por prazo indeterminado, o aviso geralmente é de 30 dias ou um período completo de aluguel, o que for maior. Um contrato com prazo fixo geralmente não pode ser alterado durante sua vigência sem acordo; moradias subsidiadas podem ter regras adicionais.

**Retaliação:** O proprietário não pode retaliar inquilinos por atividades protegidas, como denunciar violações, organizar-se com outros inquilinos ou exercer direitos legais. Procure assistência jurídica se precisar de ajuda.`,
  vi: `Người thuê tại Massachusetts được bảo vệ, nhưng quy định tùy loại hợp đồng và hoàn cảnh. Để được tư vấn về trường hợp của bạn, hãy liên hệ trợ giúp pháp lý.

**Tiền đặt cọc:** Thông thường chủ nhà có thể thu tiền thuê tháng đầu và tháng cuối, tiền đặt cọc không quá một tháng thuê và chi phí thực tế cho ổ khóa và chìa mới. Tiền cọc phải được giữ trong tài khoản riêng có lãi tại ngân hàng Massachusetts. Chủ nhà phải hoàn trả tiền cọc hoặc số dư trong vòng 30 ngày sau khi kết thúc thuê, kèm giấy tờ bắt buộc cho các khoản khấu trừ.

**Trục xuất:** Thời hạn thông báo tùy lý do, loại hợp đồng và quy định liên bang áp dụng. Chỉ riêng thông báo yêu cầu rời nhà không bắt buộc bạn phải đi; chủ nhà không thể cưỡng chế bạn rời đi nếu không có lệnh tòa. Hãy đọc và trả lời giấy tờ tòa đúng hạn, đồng thời tìm trợ giúp pháp lý.

**Nhà ở an toàn:** Theo quy định bang, mùa sưởi thông thường từ ngày 15 tháng 9 đến ngày 31 tháng 5; chính quyền địa phương có thể thay đổi ngày. Trong thời gian này, nhiệt độ tối thiểu là 68°F từ 7 giờ sáng đến 11 giờ tối và 64°F từ 11:01 tối đến 6:59 sáng. Nước nóng thông thường phải đạt ít nhất 110°F. Báo vấn đề cho chủ nhà và cơ quan kiểm tra địa phương.

**Tăng tiền thuê:** Quy định tùy hợp đồng và chương trình. Với thuê không kỳ hạn, thông báo thường là 30 ngày hoặc một kỳ thuê đầy đủ, lấy thời gian dài hơn. Hợp đồng có thời hạn thường không thể thay đổi trong thời hạn đó nếu không có thỏa thuận; nhà ở trợ cấp có thể có quy định khác.

**Trả đũa:** Chủ nhà không được trả đũa người thuê vì hoạt động được bảo vệ như báo vi phạm, cùng người thuê khác tổ chức hoặc thực hiện quyền pháp lý. Liên hệ trợ giúp pháp lý nếu cần.`,
  zh: `马萨诸塞州租户受到保护，但具体规则取决于租约类型和实际情况。如需针对您情况的建议，请联系法律援助机构。

**押金：**房东通常可收取首月和末月租金、不超过一个月租金的押金，以及更换锁和钥匙的实际费用。押金必须存入马萨诸塞州银行的独立计息账户。租约结束后，房东须在 30 天内退还押金或余额，并提供扣款所需文件。

**驱逐：**通知期限取决于原因、租约类型和适用的联邦规定。仅凭退租通知本身并不要求您离开；没有法院命令，房东不能强行驱逐您。请及时阅读并回复法院文件，寻求法律援助。

**安全住房：**根据州住房法规，默认供暖季为 9 月 15 日至 5 月 31 日；地方当局可以更改日期。期间上午 7 点至晚上 11 点的最低温度为 68°F，晚上 11:01 至早上 6:59 为 64°F。热水通常至少应达到 110°F。请向房东和当地检查部门报告问题。

**租金上涨：**规则因协议和计划而异。对于无固定期限租约，通知通常为 30 天或一个完整租期，以较长者为准。固定期限租约在期限内通常不能未经同意而更改；补贴住房可能有其他规则。

**报复：**房东不能因租户报告违规、与其他租户组织活动或行使法律权利等受保护行为而进行报复。如需帮助，请联系法律援助机构。`,
  ar: `يتمتع المستأجرون في Massachusetts بحماية، لكن القواعد تعتمد على نوع الإيجار والظروف. للحصول على مشورة بشأن حالتك، اتصل بالمساعدة القانونية.

**التأمين:** يجوز للمالك عموماً تحصيل إيجار الشهر الأول والأخير، وتأمين لا يزيد على إيجار شهر، والتكلفة الفعلية لقفل ومفتاح جديدين. يجب وضع التأمين في حساب منفصل يدر فائدة في بنك بولاية Massachusetts. يجب على المالك رد التأمين أو رصيده خلال 30 يوماً من انتهاء الإيجار مع المستندات المطلوبة للخصومات.

**الإخلاء:** تعتمد مدد الإشعار على السبب ونوع الإيجار والقواعد الفيدرالية المطبقة. إشعار ترك السكن وحده لا يلزمك بالمغادرة؛ ولا يجوز للمالك إخراجك بالقوة دون أمر قضائي. اقرأ أوراق المحكمة ورد عليها في موعدها واطلب مساعدة قانونية.

**السكن الآمن:** بموجب قانون السكن في الولاية، يمتد موسم التدفئة الافتراضي من 15 سبتمبر إلى 31 مايو؛ وقد تغير السلطات المحلية التواريخ. خلاله الحد الأدنى 68°F من 7 صباحاً إلى 11 مساءً و64°F من 11:01 مساءً إلى 6:59 صباحاً. يجب أن تصل المياه الساخنة عموماً إلى 110°F على الأقل. أبلغ المالك وخدمات التفتيش المحلية بالمشكلات.

**زيادة الإيجار:** تختلف القواعد حسب الاتفاق والبرنامج. في الإيجار غير محدد المدة، يكون الإشعار عموماً 30 يوماً أو فترة إيجار كاملة، أيهما أطول. لا يجوز عادة تغيير عقد محدد المدة أثناء سريانه دون اتفاق؛ وقد توجد قواعد إضافية للسكن المدعوم.

**الانتقام:** لا يجوز للمالك الانتقام من المستأجرين بسبب نشاط محمي مثل الإبلاغ عن المخالفات أو التنظيم مع مستأجرين آخرين أو ممارسة الحقوق القانونية. اتصل بالمساعدة القانونية إذا احتجت للمساعدة.`,
  so: `Kiraystayaasha Massachusetts waxay leeyihiin ilaalin, laakiin xeerarku waxay ku xiran yihiin nooca kirada iyo xaaladda. Si aad talo uga hesho kiiskaaga, la xiriir kaalmo sharci.

**Debaajiga:** Guud ahaan milkiiluhu wuxuu qaadi karaa kirada bisha koowaad iyo ta ugu dambeysa, debaaji aan ka badnayn kirada hal bil, iyo kharashka dhabta ah ee quful iyo fure cusub. Debaajiga waa in lagu hayaa koonto gooni ah oo dulsaar leh oo ku taal bangi Massachusetts ah. Milkiiluhu waa inuu ku celiyaa debaajiga ama hadhaaga 30 maalmood gudahood marka kiradu dhammaato, isagoo wata dukumiintiyada looga baahan yahay lacagaha laga jaro.

**Ka saarid:** Waqtiga ogeysiisku wuxuu ku xiran yahay sababta, nooca kirada iyo xeerarka federaalka ee khuseeya. Ogeysiiska bixitaanka kaligiis kuguma khasbayo inaad baxdo; milkiiluhu xoog kugama saari karo amar maxkamadeed la’aan. Akhri waraaqaha maxkamadda, waqti ku jawaab oo raadso kaalmo sharci.

**Guri ammaan ah:** Xeerka guryaha ee gobolka wuxuu dhigayaa xilliga kuleylka caadiga ah 15 Sebtembar ilaa 31 Maajo; maamulka deegaanka ayaa beddeli kara taariikhaha. Xilligaas ugu yaraan waa 68°F 7 subaxnimo ilaa 11 fiidnimo iyo 64°F 11:01 fiidnimo ilaa 6:59 subaxnimo. Biyaha kulul guud ahaan waa inay ugu yaraan ahaadaan 110°F. Dhibaatooyinka u sheeg milkiilaha iyo adeegga kormeerka deegaanka.

**Kordhinta kirada:** Xeerarku way ku kala duwan yihiin heshiiska iyo barnaamijka. Kirada aan waqti go’an lahayn, ogeysiisku badanaa waa 30 maalmood ama hal xilli kiro oo buuxa, kii dheer. Heshiis waqti go’an leh guud ahaan lama beddeli karo inta uu socdo oggolaansho la’aan; guryaha la kabana waxay yeelan karaan xeerar kale.

**Aargudasho:** Milkiiluhu kama aargudan karo kiraystayaasha hawlo la ilaaliyo sida soo sheegidda xadgudubyo, la abaabulka kiraystayaal kale ama adeegsiga xuquuq sharci. La xiriir kaalmo sharci haddii aad u baahan tahay.`,
  kea: `Inquilinus na Massachusetts ten proteson, ma regras ta dipendi di tipu di arrendamentu i situason. Pa orientason sobri bu kazu, kontakta ajuda legal.

**Depósitu di garantia:** Normalmenti senhoriu podi kobrá primeru i últimu mes di renda, un depósitu di té un mes di renda i kustu real di un fechadura i txabi novu. Depósitu mesti sta na un konta separadu ku jurus na un banku di Massachusetts. Senhoriu mesti devolve depósitu ô saldu dentru di 30 dia dipôs di fim di arrendamentu, ku dokumentason pididu pa dedusons.

**Despeju:** Prazus di avizu ta dipendi di motivu, arrendamentu i regras federal aplikável. Un avizu pa sai sozinhu ka ta obriga-bu sai; senhoriu ka podi tirá-bu pa forsa sen orden di tribunal. Le i responde papéis di tribunal na prazo i busca ajuda legal.

**Kaza seguru:** Segundu kódigu di stadu, sezon di akesimentu normal é di 15 di setenbru té 31 di maiu; autoridadis lokal podi muda datas. Na es períodu mínimu é 68°F di 7 di manhan té 11 di noti i 64°F di 11:01 di noti té 6:59 di manhan. Água kenti normalmenti mesti sta pel menus 110°F. Komunika problemas a senhoriu i servisus lokal di inspeson.

**Aumentu di renda:** Regras ta varia segundu akordu i programa. Pa arrendamentu sen prazo fixu, avizu normalmenti é 30 dia ô un períodu konpletu di renda, kual ki for más longu. Un kontratu ku prazo fixu normalmenti ka podi muda duranti prazo sen akordu; abitason subsidiadu podi ten otus regras.

**Retaliasons:** Senhoriu ka podi retalia inquilinus pa atividadis protejidu, komu denunsia violasons, organiza ku otus inquilinus ô uza direitus legal. Kontakta ajuda legal si bu mesti ajuda.`,
};
