import type { Language } from '@/stores/appStore';
import type { DetailDraft } from './resourceDetails';

/** First-pass AI-assisted translations; native-speaker review is needed. */
export const FOOD_RESOURCE_DETAILS: Record<string, Partial<Record<Exclude<Language, 'en'>, DetailDraft>>> = {
  "bostons-food-district": {
    "es": {
      "neighborhood": "Servicio telefónico",
      "address": "Línea estatal (atiende a Dorchester)",
      "operator": "Project Bread",
      "source": "Página de FoodSource Hotline de projectbread.org",
      "eligibility": "Cualquier persona en Massachusetts.",
      "services": [
        "Referencias a recursos de alimentos",
        "Ayuda para solicitar SNAP",
        "Preguntas sobre comidas escolares",
        "Programas alimentarios para adultos mayores"
      ]
    },
    "ht": {
      "neighborhood": "Sèvis telefòn",
      "address": "Liy pou tout eta a (sèvi Dorchester)",
      "operator": "Project Bread",
      "source": "Paj FoodSource Hotline sou projectbread.org",
      "eligibility": "Nenpòt moun nan Massachusetts.",
      "services": [
        "Referans pou resous manje",
        "Èd pou aplike pou SNAP",
        "Kesyon sou repa lekòl",
        "Pwogram manje pou granmoun aje"
      ]
    },
    "pt": {
      "neighborhood": "Serviço telefônico",
      "address": "Linha estadual (atende Dorchester)",
      "operator": "Project Bread",
      "source": "Página FoodSource Hotline de projectbread.org",
      "eligibility": "Qualquer pessoa em Massachusetts.",
      "services": [
        "Encaminhamento a recursos de alimentação",
        "Ajuda para solicitar SNAP",
        "Dúvidas sobre refeições escolares",
        "Programas de alimentação para idosos"
      ]
    },
    "vi": {
      "neighborhood": "Dịch vụ qua điện thoại",
      "address": "Đường dây toàn tiểu bang (phục vụ Dorchester)",
      "operator": "Project Bread",
      "source": "Trang FoodSource Hotline của projectbread.org",
      "eligibility": "Mọi người tại Massachusetts.",
      "services": [
        "Giới thiệu nguồn thực phẩm",
        "Hỗ trợ nộp đơn SNAP",
        "Câu hỏi về bữa ăn tại trường",
        "Chương trình thực phẩm cho người cao tuổi"
      ]
    },
    "zh": {
      "neighborhood": "电话服务",
      "address": "全州热线（服务 Dorchester）",
      "operator": "Project Bread",
      "source": "projectbread.org 的 FoodSource 热线页面",
      "eligibility": "马萨诸塞州的任何人。",
      "services": [
        "食品资源转介",
        "SNAP 申请帮助",
        "学校餐食咨询",
        "长者食品项目"
      ]
    },
    "ar": {
      "neighborhood": "خدمة هاتفية",
      "address": "خط على مستوى الولاية (يخدم Dorchester)",
      "operator": "Project Bread",
      "source": "صفحة خط FoodSource على projectbread.org",
      "eligibility": "أي شخص في ماساتشوستس.",
      "services": [
        "الإحالة إلى موارد الطعام",
        "المساعدة في طلب SNAP",
        "أسئلة الوجبات المدرسية",
        "برامج الطعام لكبار السن"
      ]
    },
    "so": {
      "neighborhood": "Adeeg telefoon",
      "address": "Khadka gobolka oo dhan (wuxuu u adeegaa Dorchester)",
      "operator": "Project Bread",
      "source": "Bogga FoodSource Hotline ee projectbread.org",
      "eligibility": "Qof kasta oo Massachusetts jooga.",
      "services": [
        "U gudbin ilaha cuntada",
        "Caawinta codsiga SNAP",
        "Su'aalaha cuntada dugsiga",
        "Barnaamijyada cuntada waayeelka"
      ]
    },
    "kea": {
      "neighborhood": "Servisu di telefoni",
      "address": "Linha di stadu interu (ta sirbi Dorchester)",
      "operator": "Project Bread",
      "source": "Pájina FoodSource Hotline di projectbread.org",
      "eligibility": "Kualker pesoa na Massachusetts.",
      "services": [
        "Referénsia pa rekursus di kumida",
        "Ajuda pa aplika pa SNAP",
        "Perguntas sobri refeison na skola",
        "Programas di kumida pa idozus"
      ]
    }
  },
  "gbfb-dorchester": {
    "es": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Páginas de contacto y búsqueda de alimentos de gbfb.org",
      "hoursNote": "Solo horario de oficina. Los horarios de despensas y distribuciones están en el buscador de alimentos, que muestra cada centro asociado.",
      "services": [
        "Buscador de alimentos por código postal",
        "Despensas y programas de comidas asociados",
        "Mercados móviles"
      ]
    },
    "ht": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Paj kontak ak rechèch manje sou gbfb.org",
      "hoursNote": "Se lè biwo sèlman. Zouti rechèch manje a bay orè chak depo patnè ak distribisyon tanporè.",
      "services": [
        "Chèche manje ak kòd postal",
        "Depo manje patnè ak pwogram repa",
        "Mache mobil"
      ]
    },
    "pt": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Páginas de contato e localizador de alimentos de gbfb.org",
      "hoursNote": "Apenas horário do escritório. Os horários das despensas e distribuições estão no localizador de alimentos, que lista cada parceiro.",
      "services": [
        "Localizador de alimentos por CEP",
        "Despensas e programas de refeições parceiros",
        "Mercados móveis"
      ]
    },
    "vi": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Trang liên hệ và tìm thực phẩm của gbfb.org",
      "hoursNote": "Chỉ là giờ làm việc của văn phòng. Công cụ tìm thực phẩm liệt kê giờ của từng điểm phát đối tác và điểm tạm thời.",
      "services": [
        "Tìm thực phẩm theo mã ZIP",
        "Điểm phát và chương trình bữa ăn đối tác",
        "Chợ lưu động"
      ]
    },
    "zh": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "gbfb.org 联系与食品查找页面",
      "hoursNote": "仅为办公室时间。食物查找工具列出各合作发放点和临时活动的时间。",
      "services": [
        "按邮编查找食品",
        "合作食品发放点和供餐项目",
        "流动市场"
      ]
    },
    "ar": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "صفحتا الاتصال والبحث عن الطعام على gbfb.org",
      "hoursNote": "هذه ساعات المكتب فقط. تعرض أداة البحث عن الطعام مواعيد كل مخزن شريك وتوزيع مؤقت.",
      "services": [
        "البحث عن الطعام بالرمز البريدي",
        "مخازن الطعام وبرامج الوجبات الشريكة",
        "الأسواق المتنقلة"
      ]
    },
    "so": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Bogagga xiriirka iyo raadinta cuntada ee gbfb.org",
      "hoursNote": "Waa saacadaha xafiiska oo keliya. Aaladda raadinta cuntada waxay taxdaa saacadaha goob kasta oo iskaashatada iyo qaybinta ku-meelgaarka ah.",
      "services": [
        "Ku raadi cunto ZIP code",
        "Bakhaarrada iyo barnaamijyada cuntada ee iskaashatada",
        "Suuqyada wareega"
      ]
    },
    "kea": {
      "neighborhood": "Newmarket / South Bay",
      "operator": "Greater Boston Food Bank",
      "source": "Pájinas di kontatu i buskador di kumida di gbfb.org",
      "hoursNote": "É só oráriu di skritóriu. Buskador di kumida ta mostra orárius di kada despena parséra i distribuisaun temporáriu.",
      "services": [
        "Buskador di kumida pa kódigu postal",
        "Despenas parséras i programas di refeison",
        "Merkadus móvel"
      ]
    }
  },
  "codman-square-community-market": {
    "es": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Páginas de Community Market y recursos de alimentos de codman.org (los horarios difieren)",
      "hoursNote": "La página del mercado indica martes de 8 a. m. a 1 p. m., miércoles de 2 a 7 p. m. y jueves de 8 a. m. a 1 p. m.; otra página de Codman indica horarios diferentes. Puede elegir los alimentos. Llame para confirmar el horario actual, la frecuencia de visita y los requisitos de identificación o domicilio.",
      "eligibility": "Puede elegir los alimentos. Llame para confirmar el horario actual, la frecuencia de visita y los requisitos de identificación o domicilio.",
      "services": [
        "Alimentos a elección",
        "Asesoría nutricional para pacientes de Codman",
        "Ayuda con SNAP en el centro de salud (confirme horarios)"
      ]
    },
    "ht": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Paj Community Market ak resous manje sou codman.org (orè yo diferan)",
      "hoursNote": "Paj mache a bay madi 8è maten–1è apremidi, mèkredi 2è–7è apremidi ak jedi 8è maten–1è apremidi; yon lòt paj Codman bay yon orè diferan. Ou chwazi manje yo. Rele pou konfime orè aktyèl la, frekans vizit yo ak kondisyon pou idantite oswa adrès.",
      "eligibility": "Ou chwazi manje yo. Rele pou konfime orè aktyèl la, frekans vizit yo ak kondisyon pou idantite oswa adrès.",
      "services": [
        "Manje ou chwazi",
        "Konsèy sou nitrisyon pou pasyan Codman",
        "Èd pou SNAP nan sant sante a (konfime orè yo)"
      ]
    },
    "pt": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Páginas Community Market e recursos alimentares de codman.org (horários diferentes)",
      "hoursNote": "A página do mercado informa terça 8h–13h, quarta 14h–19h e quinta 8h–13h; outra página da Codman informa horários diferentes. Você pode escolher os alimentos. Ligue para confirmar o horário atual, a frequência das visitas e as exigências de identidade ou endereço.",
      "eligibility": "Você pode escolher os alimentos. Ligue para confirmar o horário atual, a frequência das visitas e as exigências de identidade ou endereço.",
      "services": [
        "Alimentos à escolha",
        "Orientação nutricional para pacientes da Codman",
        "Ajuda com SNAP no centro de saúde (confirme horários)"
      ]
    },
    "vi": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Trang Community Market và tài nguyên thực phẩm của codman.org (giờ khác nhau)",
      "hoursNote": "Trang của chợ ghi thứ Ba 8 giờ sáng–1 giờ chiều, thứ Tư 2–7 giờ chiều và thứ Năm 8 giờ sáng–1 giờ chiều; trang Codman khác ghi giờ khác. Có thể tự chọn thực phẩm. Gọi để xác nhận giờ hiện tại, số lần được đến và yêu cầu về giấy tờ hoặc địa chỉ.",
      "eligibility": "Có thể tự chọn thực phẩm. Gọi để xác nhận giờ hiện tại, số lần được đến và yêu cầu về giấy tờ hoặc địa chỉ.",
      "services": [
        "Thực phẩm tự chọn",
        "Tư vấn dinh dưỡng cho bệnh nhân Codman",
        "Hỗ trợ SNAP tại trung tâm y tế (xác nhận giờ)"
      ]
    },
    "zh": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "codman.org 社区市场和食品资源页面（时间不同）",
      "hoursNote": "市场网页列出周二上午 8 点至下午 1 点、周三下午 2 点至 7 点、周四上午 8 点至下午 1 点；Codman 的另一网页时间不同。 可自选食品。请致电确认当前时间、领取频率以及身份证件或地址要求。",
      "eligibility": "可自选食品。请致电确认当前时间、领取频率以及身份证件或地址要求。",
      "services": [
        "可自选食品",
        "为 Codman 患者提供营养咨询",
        "在健康中心申请 SNAP 的帮助（请确认时间）"
      ]
    },
    "ar": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "صفحتا السوق المجتمعي وموارد الطعام على codman.org (المواعيد مختلفة)",
      "hoursNote": "تذكر صفحة السوق الثلاثاء 8 صباحاً–1 ظهراً، والأربعاء 2–7 مساءً، والخميس 8 صباحاً–1 ظهراً؛ وتذكر صفحة أخرى لدى Codman أوقاتاً مختلفة. يمكن اختيار الطعام. اتصل لتأكيد المواعيد الحالية وتكرار الزيارة ومتطلبات الهوية أو العنوان.",
      "eligibility": "يمكن اختيار الطعام. اتصل لتأكيد المواعيد الحالية وتكرار الزيارة ومتطلبات الهوية أو العنوان.",
      "services": [
        "مواد غذائية يختارها الزائر",
        "استشارات تغذية لمرضى Codman",
        "المساعدة في SNAP بالمركز الصحي (أكد المواعيد)"
      ]
    },
    "so": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Bogagga Community Market iyo ilaha cuntada ee codman.org (saacaduhu way kala duwan yihiin)",
      "hoursNote": "Bogga suuqu wuxuu sheegayaa Talaado 8 subaxnimo–1 duhurnimo, Arbaco 2–7 galabnimo iyo Khamiis 8 subaxnimo–1 duhurnimo; bog kale oo Codman ah wuxuu sheegayaa saacado ka duwan. Adiga ayaa cuntada dooranaya. Wac si aad u xaqiijiso saacadaha hadda, inta jeer ee la booqan karo iyo shuruudaha aqoonsiga ama cinwaanka.",
      "eligibility": "Adiga ayaa cuntada dooranaya. Wac si aad u xaqiijiso saacadaha hadda, inta jeer ee la booqan karo iyo shuruudaha aqoonsiga ama cinwaanka.",
      "services": [
        "Cunto qofku doorto",
        "La-talinta nafaqada ee bukaannada Codman",
        "Caawinta SNAP ee xarunta caafimaadka (xaqiiji saacadaha)"
      ]
    },
    "kea": {
      "neighborhood": "Codman Square",
      "operator": "Codman Square Health Center",
      "source": "Pájinas Community Market i rekursus di kumida di codman.org (orárius diferenti)",
      "hoursNote": "Pájina di merkadu ta lista tersa 8 di manhan–1 di tardi, kuarta 2–7 di tardi i kinta 8 di manhan–1 di tardi; otu pájina di Codman ta da oráriu diferenti. Bu podi skodje kumida. Txoma pa konfirma oráriu atual, frikuénsia di vizita i rekizitus di identifikason ô morada.",
      "eligibility": "Bu podi skodje kumida. Txoma pa konfirma oráriu atual, frikuénsia di vizita i rekizitus di identifikason ô morada.",
      "services": [
        "Kumida pa skodje",
        "Konselhu di nutrison pa pasientis di Codman",
        "Ajuda ku SNAP na sentru di saúdi (konfirma orárius)"
      ]
    }
  },
  "fair-foods-lena-park": {
    "es": {
      "neighborhood": "Franklin Field / límite con Mattapan",
      "operator": "Fair Foods; organizado en Lena Park Community Development Corp",
      "source": "Recursos de alimentos de codman.org; evento anterior en Lena Park (llame para confirmar)",
      "hoursNote": "La página de recursos de Codman indica martes de 2 a 4:30 p. m. y una contribución solicitada de $2 por bolsa. Llame para confirmar el horario, la disponibilidad, el precio y los requisitos actuales.",
      "eligibility": "Llame para confirmar los requisitos actuales de identificación, domicilio e ingresos.",
      "services": [
        "Bolsas de productos (confirme disponibilidad y costo actuales)",
        "Programas del centro comunitario"
      ]
    },
    "ht": {
      "neighborhood": "Franklin Field / limit Mattapan",
      "operator": "Fair Foods; Lena Park Community Development Corp akeyi li",
      "source": "Resous manje codman.org; evènman anvan nan Lena Park (rele pou konfime)",
      "hoursNote": "Paj resous Codman an bay madi 2è–4:30 apremidi, avèk yon kontribisyon $2 yo mande pou chak sak. Rele pou konfime orè, disponiblite, pri ak kondisyon aktyèl yo.",
      "eligibility": "Rele pou konfime kondisyon aktyèl pou idantite, adrès ak revni.",
      "services": [
        "Sak pwodui (konfime disponiblite ak pri aktyèl yo)",
        "Pwogram sant kominotè"
      ]
    },
    "pt": {
      "neighborhood": "Franklin Field / limite com Mattapan",
      "operator": "Fair Foods; sediado no Lena Park Community Development Corp",
      "source": "Recursos alimentares de codman.org; evento anterior no Lena Park (ligue para confirmar)",
      "hoursNote": "A página de recursos da Codman informa terças 14h–16h30 e uma contribuição solicitada de $2 por sacola. Ligue para confirmar horário, disponibilidade, preço e requisitos atuais.",
      "eligibility": "Ligue para confirmar os requisitos atuais de identidade, endereço e renda.",
      "services": [
        "Sacolas de produtos (confirme disponibilidade e custo atuais)",
        "Programas do centro comunitário"
      ]
    },
    "vi": {
      "neighborhood": "Franklin Field / ranh giới Mattapan",
      "operator": "Fair Foods; tổ chức tại Lena Park Community Development Corp",
      "source": "Tài nguyên thực phẩm của codman.org; sự kiện trước đây tại Lena Park (gọi để xác nhận)",
      "hoursNote": "Trang tài nguyên của Codman ghi thứ Ba 2–4:30 chiều và mức đóng góp đề nghị $2 mỗi túi. Gọi để xác nhận lịch, nguồn hàng, giá và điều kiện hiện tại.",
      "eligibility": "Gọi để xác nhận các yêu cầu hiện tại về giấy tờ, địa chỉ và thu nhập.",
      "services": [
        "Túi rau quả (xác nhận nguồn hàng và giá hiện tại)",
        "Chương trình trung tâm cộng đồng"
      ]
    },
    "zh": {
      "neighborhood": "Franklin Field / Mattapan 交界",
      "operator": "Fair Foods；由 Lena Park Community Development Corp 承办",
      "source": "codman.org 食品资源；Lena Park 过往活动（请致电确认）",
      "hoursNote": "Codman 的资源页面列出周二下午 2 点至 4:30，并请求每袋捐助 $2。 请致电确认当前时间、供应、价格和要求。",
      "eligibility": "请致电确认当前的身份证件、地址和收入要求。",
      "services": [
        "果蔬袋（请确认当前供应及费用）",
        "社区中心项目"
      ]
    },
    "ar": {
      "neighborhood": "Franklin Field / حدود Mattapan",
      "operator": "Fair Foods؛ تستضيفه Lena Park Community Development Corp",
      "source": "موارد الطعام على codman.org؛ فعالية سابقة في Lena Park (اتصل للتأكيد)",
      "hoursNote": "تذكر صفحة الموارد لدى Codman الثلاثاء 2–4:30 مساءً ومساهمة مطلوبة قدرها $2 للكيس. اتصل لتأكيد الجدول والتوفر والسعر والشروط الحالية.",
      "eligibility": "اتصل لتأكيد متطلبات الهوية والعنوان والدخل الحالية.",
      "services": [
        "أكياس منتجات (أكد التوفر والتكلفة الحالية)",
        "برامج المركز المجتمعي"
      ]
    },
    "so": {
      "neighborhood": "Franklin Field / xadka Mattapan",
      "operator": "Fair Foods; waxaa martigelisa Lena Park Community Development Corp",
      "source": "Ilaha cuntada ee codman.org; dhacdo hore oo Lena Park ah (wac si aad u xaqiijiso)",
      "hoursNote": "Bogga ilaha Codman wuxuu sheegayaa Talaado 2–4:30 galabnimo iyo $2 bacdiiba oo la codsado. Wac si aad u xaqiijiso jadwalka, helitaanka, qiimaha iyo shuruudaha hadda jira.",
      "eligibility": "Wac si aad u xaqiijiso shuruudaha aqoonsiga, cinwaanka iyo dakhliga ee hadda jira.",
      "services": [
        "Bacaha wax-soo-saarka (xaqiiji helitaanka iyo qiimaha hadda)",
        "Barnaamijyada xarunta bulshada"
      ]
    },
    "kea": {
      "neighborhood": "Franklin Field / limitis ku Mattapan",
      "operator": "Fair Foods; akolhidu pa Lena Park Community Development Corp",
      "source": "Rekursus di kumida di codman.org; eventu anterior na Lena Park (txoma pa konfirma)",
      "hoursNote": "Pájina di rekursus di Codman ta lista tersa 2–4:30 di tardi i un kontribuison p'didu di $2 pa saku. Txoma pa konfirma oráriu, disponibilidadi, presu i rekizitus atual.",
      "eligibility": "Txoma pa konfirma rekizitus atual di identifikason, morada i rendimentu.",
      "services": [
        "Sakus di produtus (konfirma disponibilidadi i presu atual)",
        "Programas di sentru komunitáriu"
      ]
    }
  },
  "dorchester-food-coop": {
    "es": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Páginas de contacto y preguntas frecuentes de dorchesterfoodcoop.com",
      "hoursNote": "Horario habitual publicado: lunes a sábado de 8 a. m. a 8 p. m.; domingo de 9 a. m. a 8 p. m. El horario de días festivos varía; consulte el sitio web o llame antes de ir.",
      "eligibility": "Abierta al público; no se necesita membresía para comprar.",
      "transit": "Autobuses 15 y 17 de MBTA; aproximadamente 12 minutos a pie desde la línea Fairmount. Consulte las indicaciones actuales antes de viajar.",
      "services": [
        "Tienda de comestibles",
        "Productos locales",
        "Acepta SNAP/EBT",
        "Propiedad de los miembros"
      ]
    },
    "ht": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Paj kontak ak kesyon souvan poze sou dorchesterfoodcoop.com",
      "hoursNote": "Orè regilye yo pibliye: lendi–samdi 8è maten–8è aswè; dimanch 9è maten–8è aswè. Orè jou ferye yo diferan; gade sit entènèt la oswa rele anvan ou ale.",
      "eligibility": "Ouvè pou piblik la; ou pa bezwen manm pou achte.",
      "transit": "Otobis MBTA 15 ak 17; anviwon 12 minit apye soti sou liy Fairmount. Tcheke direksyon aktyèl yo anvan ou vwayaje.",
      "services": [
        "Makèt",
        "Pwodui lokal",
        "Aksepte SNAP/EBT",
        "Pwopriyete manm yo"
      ]
    },
    "pt": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Páginas de contato e perguntas frequentes de dorchesterfoodcoop.com",
      "hoursNote": "Horário regular publicado: segunda a sábado, 8h–20h; domingo, 9h–20h. O horário de feriados muda; consulte o site ou ligue antes de ir.",
      "eligibility": "Aberta ao público; não é necessário ser associado para comprar.",
      "transit": "Ônibus MBTA 15 e 17; cerca de 12 minutos a pé da linha Fairmount. Confira as instruções atuais antes de viajar.",
      "services": [
        "Mercearia",
        "Produtos locais",
        "Aceita SNAP/EBT",
        "Propriedade dos associados"
      ]
    },
    "vi": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Trang liên hệ và câu hỏi thường gặp của dorchesterfoodcoop.com",
      "hoursNote": "Giờ thường lệ được đăng: thứ Hai–thứ Bảy 8 giờ sáng–8 giờ tối; chủ nhật 9 giờ sáng–8 giờ tối. Giờ ngày lễ khác; hãy xem trang web hoặc gọi trước khi đến.",
      "eligibility": "Mở cho công chúng; không cần là thành viên để mua hàng.",
      "transit": "Xe buýt MBTA 15 và 17; đi bộ khoảng 12 phút từ tuyến Fairmount. Kiểm tra chỉ đường hiện tại trước khi đi.",
      "services": [
        "Cửa hàng thực phẩm",
        "Nông sản địa phương",
        "Nhận SNAP/EBT",
        "Sở hữu thành viên"
      ]
    },
    "zh": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "dorchesterfoodcoop.com 联系及常见问题页面",
      "hoursNote": "公布的常规时间：周一至周六上午 8 点至晚上 8 点；周日上午 9 点至晚上 8 点。节假日时间不同；前往前请查看网站或致电。",
      "eligibility": "对公众开放；购物无需成为会员。",
      "transit": "MBTA 15 和 17 路公交车；从 Fairmount 线步行约 12 分钟。出行前请查看当前路线。",
      "services": [
        "杂货店",
        "本地农产品",
        "接受 SNAP/EBT",
        "会员共同拥有"
      ]
    },
    "ar": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "صفحتا الاتصال والأسئلة الشائعة على dorchesterfoodcoop.com",
      "hoursNote": "المواعيد المعتادة المنشورة: الاثنين–السبت 8 صباحاً–8 مساءً؛ الأحد 9 صباحاً–8 مساءً. تختلف مواعيد العطلات؛ راجع الموقع أو اتصل قبل الزيارة.",
      "eligibility": "مفتوح للجمهور؛ لا يلزم أن تكون عضواً للتسوق.",
      "transit": "حافلتا MBTA رقم 15 و17؛ نحو 12 دقيقة سيراً من خط Fairmount. تحقق من الاتجاهات الحالية قبل السفر.",
      "services": [
        "متجر بقالة",
        "منتجات محلية",
        "يقبل SNAP/EBT",
        "ملكية الأعضاء"
      ]
    },
    "so": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Bogagga xiriirka iyo su'aalaha soo noqnoqda ee dorchesterfoodcoop.com",
      "hoursNote": "Saacadaha caadiga ah ee la daabacay: Isniin–Sabti 8 subaxnimo–8 fiidnimo; Axad 9 subaxnimo–8 fiidnimo. Saacadaha fasaxyadu way kala duwan yihiin; eeg website-ka ama wac ka hor booqashada.",
      "eligibility": "Dadweynaha ayuu u furan yahay; xubinnimo looma baahna si wax looga iibsado.",
      "transit": "Basaska MBTA 15 iyo 17; qiyaastii 12 daqiiqo lug laga soo socdo khadka Fairmount. Hubi jihooyinka hadda ka hor safarka.",
      "services": [
        "Dukaan raashin",
        "Wax-soo-saarka maxalliga ah",
        "SNAP/EBT waa la aqbalaa",
        "Lahaanshaha xubnaha"
      ]
    },
    "kea": {
      "neighborhood": "Fields Corner / Bowdoin-Geneva",
      "source": "Pájinas di kontatu i perguntas frekuenti di dorchesterfoodcoop.com",
      "hoursNote": "Oráriu regular publikadu: sigunda–sábadu 8 di manhan–8 di noti; domingu 9 di manhan–8 di noti. Oráriu di feriadu ta muda; odja site ô txoma antis di bai.",
      "eligibility": "Abertu pa públiku; ka meste ser membru pa kumpra.",
      "transit": "Autokarus MBTA 15 i 17; cerca di 12 minutu a pé di linha Fairmount. Konfirma direksons atual antis di viaja.",
      "services": [
        "Lója di kumida",
        "Produtus lokal",
        "Ta aseita SNAP/EBT",
        "Propriedadi di membrus"
      ]
    }
  }
};
