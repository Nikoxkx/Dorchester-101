import type { Language } from '@/stores/appStore';

/** AI-assisted locator instructions. These are drafts requiring language and safety review. */
export const CLOTHING_LOCATOR_SOURCE_DIGEST = 'd34c516422a720e217b6fd729bbd1af98fa51044b5eae6ab3e63951810adfbda';
export interface ClothingLocatorDraft { name: string; neighborhood: string; howToGet: string }
export const CLOTHING_LOCATOR_DETAILS: Partial<Record<Exclude<Language, 'en' | 'es'>, Record<string, ClothingLocatorDraft>>> = {
  "ht": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "Pa telefòn, nan tout eta a",
      "howToGet": "Rele 2-1-1 (oswa 877-211-6277; TTY 508-370-4890) epi mande manto oswa rad sezon fredi gratis toupre ou. Mande espesyalis la verifye ki kote ki gen gwosè ou jodi a epi si yon sant rechofman ouvè pandan yon ijans frèt."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — chèche òganizasyon",
      "neighborhood": "Rechèch sou entènèt",
      "howToGet": "Louvri kat la, antre kòd postal ou (02121, 02122, 02124, 02125), epi rele patnè a anvan ou ale. One Warm Coat pa bay moun manto dirèkteman, epi kantite patnè yo genyen chanje chak jou."
    },
    "findhelp-clothing": {
      "name": "findhelp — chèche rad nan Dorchester",
      "neighborhood": "Rechèch sou entènèt",
      "howToGet": "Chèche mo angle ‘clothing’ sou findhelp.org ak yon kòd postal Dorchester, epi rele pwogram nan anvan ou deplase; ti sant yo pa toujou gen menm orè."
    },
    "boston-cold": {
      "name": "Paj vil Boston sou tan frèt",
      "neighborhood": "Tout vil la (sant BCYF ak bibliyotèk)",
      "howToGet": "Louvri boston.gov/cold pou lis sant rechofman jodi a ak règ sekirite kont frèt, tankou règleman chofaj eta a (68°F lajounen, 64°F lannuit, 15 septanm rive 31 me pa defo; dat lokal yo ka diferan) si apatman ou frèt epi pwopriyetè a pa aji."
    }
  },
  "pt": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "Por telefone, em todo o estado",
      "howToGet": "Ligue 2-1-1 (ou 877-211-6277; TTY 508-370-4890) e peça casacos ou roupas de inverno grátis perto de você. Peça ao atendente que verifique quais locais têm seu tamanho hoje e se há centro de aquecimento aberto durante uma emergência por frio."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — busca de organizações",
      "neighborhood": "Busca online",
      "howToGet": "Abra o mapa, informe seu CEP (02121, 02122, 02124, 02125) e ligue para a organização antes de ir. A One Warm Coat não entrega casacos diretamente às pessoas, e os estoques dos parceiros mudam diariamente."
    },
    "findhelp-clothing": {
      "name": "findhelp — busca de roupas em Dorchester",
      "neighborhood": "Busca online",
      "howToGet": "Pesquise a palavra inglesa ‘clothing’ em findhelp.org com um CEP de Dorchester e ligue para o programa antes de viajar; pequenas organizações têm horários irregulares."
    },
    "boston-cold": {
      "name": "Página da cidade de Boston sobre frio",
      "neighborhood": "Toda a cidade (centros BCYF e bibliotecas)",
      "howToGet": "Acesse boston.gov/cold para ver a lista de centros de aquecimento de hoje e as regras de segurança, inclusive a norma estadual de aquecimento (68°F de dia, 64°F à noite, de 15 de setembro a 31 de maio como padrão; datas locais podem variar) se seu apartamento estiver frio e o proprietário não agir."
    }
  },
  "vi": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "Qua điện thoại, toàn bang",
      "howToGet": "Gọi 2-1-1 (hoặc 877-211-6277; TTY 508-370-4890) và hỏi áo khoác hoặc quần áo mùa đông miễn phí gần bạn. Nhờ nhân viên kiểm tra nơi nào có cỡ của bạn hôm nay và có trung tâm sưởi ấm mở trong tình trạng khẩn cấp vì lạnh hay không."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — tìm tổ chức phi lợi nhuận",
      "neighborhood": "Tìm trực tuyến",
      "howToGet": "Mở bản đồ, nhập mã ZIP của bạn (02121, 02122, 02124, 02125) và gọi đối tác trước khi đến. One Warm Coat không phát áo trực tiếp cho cá nhân và lượng áo của đối tác thay đổi hằng ngày."
    },
    "findhelp-clothing": {
      "name": "findhelp — tìm quần áo tại Dorchester",
      "neighborhood": "Tìm trực tuyến",
      "howToGet": "Tìm từ tiếng Anh ‘clothing’ trên findhelp.org cùng mã ZIP Dorchester, rồi gọi chương trình trước khi đi; các điểm nhỏ có giờ hoạt động không cố định."
    },
    "boston-cold": {
      "name": "Trang thời tiết lạnh của thành phố Boston",
      "neighborhood": "Toàn thành phố (trung tâm BCYF và thư viện)",
      "howToGet": "Mở boston.gov/cold để xem danh sách trung tâm sưởi ấm hôm nay và quy tắc an toàn, bao gồm quy định sưởi ấm của bang (68°F ban ngày, 64°F ban đêm, mặc định từ 15 tháng 9 đến 31 tháng 5; ngày tại địa phương có thể khác) nếu căn hộ lạnh và chủ nhà không xử lý."
    }
  },
  "zh": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "全州电话服务",
      "howToGet": "拨打 2-1-1（或 877-211-6277；TTY 508-370-4890），询问附近的免费冬衣或外套。请工作人员查询今天哪些地点有您的尺码，以及严寒紧急状态期间是否有取暖中心开放。"
    },
    "one-warm-coat": {
      "name": "One Warm Coat — 非营利机构查询",
      "neighborhood": "在线查询",
      "howToGet": "打开地图，输入邮编（02121、02122、02124、02125），前往前先致电所列合作机构。One Warm Coat 不直接向个人发放外套，合作机构的库存每天会变化。"
    },
    "findhelp-clothing": {
      "name": "findhelp — Dorchester 衣物查询",
      "neighborhood": "在线查询",
      "howToGet": "在 findhelp.org 输入 Dorchester 邮编并搜索英文词 ‘clothing’，出发前请先致电该项目；小型衣物点的开放时间可能不固定。"
    },
    "boston-cold": {
      "name": "波士顿市寒冷天气页面",
      "neighborhood": "全市（BCYF 中心和图书馆）",
      "howToGet": "打开 boston.gov/cold 查看今天的取暖中心名单和防寒规则。如果公寓寒冷且房东不处理，可查阅州供暖规定（一般为白天 68°F、夜间 64°F，9 月 15 日至 5 月 31 日；当地日期可能不同）。"
    }
  },
  "ar": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "هاتفياً في أنحاء الولاية",
      "howToGet": "اتصل على 2-1-1 (أو 877-211-6277؛ هاتف نصي TTY 508-370-4890) واسأل عن معاطف أو ملابس شتوية مجانية قريبة. اطلب من المختص التحقق من الأماكن التي لديها مقاسك اليوم وما إذا كان مركز تدفئة مفتوحاً أثناء طوارئ البرد."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — البحث عن المؤسسات",
      "neighborhood": "البحث عبر الإنترنت",
      "howToGet": "افتح الخريطة وأدخل الرمز البريدي (02121، 02122، 02124، 02125)، واتصل بالشريك قبل الذهاب. لا توزع One Warm Coat المعاطف مباشرة على الأفراد، ويتغير مخزون الشركاء يومياً."
    },
    "findhelp-clothing": {
      "name": "findhelp — البحث عن الملابس في Dorchester",
      "neighborhood": "البحث عبر الإنترنت",
      "howToGet": "ابحث عن الكلمة الإنجليزية ‘clothing’ في findhelp.org مع رمز بريدي في Dorchester، ثم اتصل بالبرنامج قبل السفر؛ ساعات نقاط الملابس الصغيرة غير منتظمة."
    },
    "boston-cold": {
      "name": "صفحة مدينة بوسطن عن الطقس البارد",
      "neighborhood": "المدينة بأكملها (مراكز BCYF والمكتبات)",
      "howToGet": "افتح boston.gov/cold لقائمة مراكز التدفئة اليوم وقواعد السلامة، بما فيها قانون التدفئة بالولاية (68°F نهاراً و64°F ليلاً، من 15 سبتمبر إلى 31 مايو عادةً؛ قد تختلف التواريخ المحلية) إذا كانت شقتك باردة ولم يتصرف المالك."
    }
  },
  "so": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "Telefoon, gobolka oo dhan",
      "howToGet": "Wac 2-1-1 (ama 877-211-6277; TTY 508-370-4890) oo weydii jaakado ama dhar jiilaal oo bilaash ah oo kuu dhow. Ka codso khabiirka inuu hubiyo meelaha maanta haya cabbirkaaga iyo in xarun diirimaad furan tahay xilliga xaaladda degdegga ah ee qabowga."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — raadinta hay’adaha",
      "neighborhood": "Raadin online ah",
      "howToGet": "Fur khariidadda, geli ZIP-kaaga (02121, 02122, 02124, 02125), oo wac hay’adda ka hor intaadan tagin. One Warm Coat si toos ah shakhsiyaadka uma siiso jaakado, kaydka hay’aduhuna maalin kasta wuu is beddelaa."
    },
    "findhelp-clothing": {
      "name": "findhelp — raadinta dharka Dorchester",
      "neighborhood": "Raadin online ah",
      "howToGet": "Ka raadi findhelp.org erayga Ingiriisiga ah ‘clothing’ iyo ZIP Dorchester, dabadeed wac barnaamijka ka hor safarka; goobaha yaryar saacado joogto ah ma laha."
    },
    "boston-cold": {
      "name": "Bogga cimilada qabow ee magaalada Boston",
      "neighborhood": "Magaalada oo dhan (xarumaha BCYF iyo maktabadaha)",
      "howToGet": "Fur boston.gov/cold si aad u hesho liiska xarumaha diirimaadka ee maanta iyo xeerarka badbaadada, oo ay ku jirto xeerka kuleylka gobolka (68°F maalintii, 64°F habeenkii, 15 Sebtembar ilaa 31 May sida caadiga ah; taariikhaha deegaanka way kala duwanaan karaan) haddii gurigaagu qabow yahay oo milkiiluhu wax ka qaban waayo."
    }
  },
  "kea": {
    "mass-211": {
      "name": "Mass 2-1-1",
      "neighborhood": "Pa telefoni, na stadu interu",
      "howToGet": "Txoma 2-1-1 (ô 877-211-6277; TTY 508-370-4890) i pergunta pa kazakus ô ropa di invernu di grasa perto di bo. Pidi espesialista pa konfirma ki lokal ten bu tamanhu oji i si un sentru di akesimentu sta abertu duranti urjénsia di friu."
    },
    "one-warm-coat": {
      "name": "One Warm Coat — peskiza di organizasons",
      "neighborhood": "Peskiza online",
      "howToGet": "Abri mapa, insere bu kódigu postal (02121, 02122, 02124, 02125) i txoma parseru antis di bai. One Warm Coat ka ta da kazakus diretamente a individuus, i stock di parserus ta muda tudu dia."
    },
    "findhelp-clothing": {
      "name": "findhelp — peskiza di ropa na Dorchester",
      "neighborhood": "Peskiza online",
      "howToGet": "Peskiça palavra ingles ‘clothing’ na findhelp.org ku un kódigu postal di Dorchester, dipôs txoma programa antis di viaja; lokal pikinoti ten oráriu irregular."
    },
    "boston-cold": {
      "name": "Pájina di sidadi di Boston sobri tempu friu",
      "neighborhood": "Sidadi interu (sentrus BCYF i bibliotékas)",
      "howToGet": "Abri boston.gov/cold pa lista di sentrus di akesimentu di oji i regras di siguransa, inkluindu regra di akesimentu di stadu (68°F di dia, 64°F di noti, di 15 di setenbru té 31 di maiu normalmenti; datas lokal podi varia) si bu apartamentu sta friu i senhoriu ka ta resolve."
    }
  }
};
