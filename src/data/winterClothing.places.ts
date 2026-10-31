import type { Language } from '@/stores/appStore';

/** AI-assisted first drafts of actionable place details, not professional translations.
 * Source changes must trigger language, eligibility and safety review. */
export const CLOTHING_PLACE_SOURCE_DIGEST = '1f20b54f830c936b623ce82e97fba5edbc7571f90e7e15d3f3308ed4a6b84eb6';
export const CLOTHING_PLACE_IDS = ["abcd-dorchester-nsc", "cradles-to-crayons", "antons-coats-for-kids", "st-francis-house", "womens-lunch-place", "rosies-place", "yawkey-basic-needs", "kroc-center", "coats4vets"] as const;

export interface ClothingPlaceDraft {
  howToGet: string;
  name?: string;
  neighborhood?: string;
  address?: string;
  eligibility?: string;
  hoursNote?: string;
  transit?: string;
}
export const CLOTHING_PLACE_DETAILS: Record<Exclude<Language, 'en' | 'es'>, Record<string, ClothingPlaceDraft>> = {
  "ht": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "Rele (617) 288-2700 epi mande pou rad ak atik esansyèl, enskripsyon, sa ki disponib ak ki lè pou vini. Pou yon timoun 12 an oswa mwens, mande si anplwaye yo ka kòmande atik atravè Cradles to Crayons.",
      "eligibility": "Cradles to Crayons mete patnè sa a pou rezidan Boston, Malden, Medford ak Everett ki nan oswa anba 200% nivo povrete federal la. Atik timoun yo jeneralman pou laj 0–12 an. Mande ABCD sou enskripsyon ak dokiman; lòt pwogram ka gen lòt règ.",
      "hoursNote": "Se orè sant lan; lè ou rele, mande ki jou pwogram rad la fonksyone.",
      "transit": "Liy Wouj pou Fields Corner, epi mache; verifye koneksyon otobis ak direksyon aktyèl nan MBTA."
    },
    "cradles-to-crayons": {
      "howToGet": "Si ou deja resevwa sèvis nan men yon patnè Cradles to Crayons, mande travayè sosyal ou si li ka kòmande pou pitit ou. Sinon, itilize rechèch patnè a oswa rele ABCD Dorchester nan 617-288-2700 pou mande si ou kalifye pou sèvis li yo. Fanmi pa ka kòmande dirèkteman ni pran atik nan Giving Factory.",
      "eligibility": "Timoun depi nesans rive 12 an nan fanmi ki nan oswa anba 200% nivo povrete federal la; fanmi yo dwe ap resevwa sèvis nan men yon patnè. Chak patnè ka gen lòt kondisyon.",
      "hoursNote": "Fanmi pa ka kòmande dirèkteman ni pran atik èd nan Giving Factory; chak biwo patnè gen pwòp orè li.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — pa yon lokal pou fanmi vini dirèkteman)",
      "neighborhood": "Atravè patnè nan Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "Lekòl ak òganizasyon patnè yo distribye manto yo, pa netwayaj rad la. Mande lekòl pitit ou, abri oswa òganizasyon kominotè ou si yo distribye sezon sa a. Boston Uncornered, 222 Bowdoin St, te yon pwen koleksyon; konfime pou sezon sa a. Pou bay yon manto, depoze li nan yon Anton’s Cleaners pandan koleksyon an.",
      "neighborhood": "Atravè patnè lokal yo"
    },
    "st-francis-house": {
      "howToGet": "Rele (617) 542-4211 oswa ale nan 39 Boylston Street epi mande kijan pou jwenn sèvis Fresh Threads. Abri lajounen an ouvè chak jou; orè ak disponiblite pwogram rad la ka diferan.",
      "hoursNote": "Se orè abri lajounen an; rele pou orè ak disponiblite pwogram rad la.",
      "transit": "Liy Vèt pou Boylston oswa liy Oranj/Wouj pou Downtown Crossing.",
      "neighborhood": "Sant vil (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "Ale san randevou lendi rive samdi, 7è maten rive 2è aprèmidi, epi mande yon anplwaye sou rad. Manto yo depann de don; mande bonè nan jounen an.",
      "eligibility": "Fanm, ki gen ladan moun ki idantifye kòm fanm. Mande anplwaye yo si yo bezwen dokiman oswa referans.",
      "transit": "Liy Vèt pou Arlington oswa Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "Mande yon konseye referans pou rad, oswa rele (617) 318-0237. Gid otòn 2026 la bay orè konseye san randevou ak pa telefòn lendi–vandredi, 8:30 maten–6è aswè. Konfime orè aktyèl ak disponiblite anvan ou ale.",
      "eligibility": "Rosie’s Place sèvi fanm. Mande anplwaye yo sou kondisyon sèvis la epi si timoun ka akonpaye ou pou yon referans rad.",
      "hoursNote": "Orè konseye yo ka diferan ak orè abri lajounen an; rele pou konfime orè aktyèl referans yo.",
      "transit": "Liy Ajan pou Melnea Cass Blvd; otobis 1 sou Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — Bezwen debaz",
      "howToGet": "Rele (617) 506-6600 epi mande ekip bezwen debaz la si gen èd oswa referans pou rad anvan ou deplase. Depo manje a nan menm adrès la; rele pou konfime orè li.",
      "hoursNote": "Rele pou orè bezwen debaz ak èd pou rad; li pa konfime se yon kote ki distribye manto.",
      "transit": "Otobis MBTA 16 kanpe nan 185 Columbia Road; verifye direksyon aktyèl anvan ou deplase."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — Sèvis sosyal",
      "howToGet": "Rele Sèvis Sosyal nan (617) 318-6940 pou mande èd manto pou fèt yo, enskripsyon ak disponiblite kounye a. Èd ijans kouvri kòd postal 02121, 02125 ak 02127; andeyò yo, rele (617) 542-5420.",
      "eligibility": "Èd ijans lan pou kòd postal 02121, 02125 ak 02127. Sant lan di èd pou fèt mande kalifikasyon ak enskripsyon davans; mande dat limit aktyèl ak si gen manto.",
      "hoursNote": "Orè Sèvis Sosyal pou rad pa pibliye — rele anvan.",
      "transit": "Liy Fairmount pou Uphams Corner; otobis 15, 17 ak 41 kanpe toupre."
    },
    "coats4vets": {
      "howToGet": "Rele (617) 378-3974 pou mande si gen manto kounye a ak evènman nan zòn Boston anvan ou vwayaje. Paj Coats4Vets la dekri yon pwogram 2023; konfime enskripsyon ak kote aktyèl yo. Sant Empowerment fondasyon an nan Sandwich se nan 117 Route 6A.",
      "eligibility": "Mande sou kondisyon evènman manto aktyèl yo. Fondasyon an di vizit nan sant Empowerment mande randevou ak prèv sèvis militè; règ lòt evènman ka diferan.",
      "neighborhood": "Evènman yo varye; sant Sandwich sou Cape Cod"
    }
  },
  "pt": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "Ligue para (617) 288-2700 e pergunte sobre roupas e itens essenciais, inscrição, disponibilidade e quando visitar. Para uma criança de até 12 anos, pergunte se a equipe pode pedir itens pela Cradles to Crayons.",
      "eligibility": "A Cradles to Crayons lista esse parceiro para moradores de Boston, Malden, Medford e Everett com renda de até 200% do nível federal de pobreza. Seus itens infantis geralmente atendem crianças de 0 a 12 anos. Pergunte à ABCD sobre inscrição e documentos; outros programas podem ter regras diferentes.",
      "hoursNote": "Horário do centro; ao ligar, pergunte em quais dias funciona o programa de roupas.",
      "transit": "Linha Vermelha até Fields Corner e depois a pé; consulte a MBTA para conexões de ônibus e trajetos atuais."
    },
    "cradles-to-crayons": {
      "howToGet": "Se sua família já recebe serviços de um parceiro da Cradles to Crayons, pergunte ao assistente social se ele pode fazer um pedido para sua criança. Caso contrário, use a busca de parceiros ou ligue para a ABCD Dorchester no 617-288-2700 para perguntar se você se qualifica para seus serviços. Famílias não podem pedir diretamente nem retirar no Giving Factory.",
      "eligibility": "Crianças do nascimento até 12 anos em famílias com renda de até 200% do nível federal de pobreza; a família deve estar recebendo serviços de um parceiro. Cada parceiro pode ter outras regras.",
      "hoursNote": "Famílias não podem fazer pedidos diretamente nem retirar itens de assistência no Giving Factory; cada parceiro tem seu próprio horário.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — não atende famílias diretamente no local)",
      "neighborhood": "Por meio de parceiros em Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "Os casacos são entregues por escolas e organizações parceiras, não nas lavanderias. Pergunte à escola da criança, ao abrigo ou à organização comunitária se distribuem nesta temporada. Boston Uncornered, 222 Bowdoin St, foi um ponto de coleta; confirme para esta temporada. Para doar um casaco, entregue-o em uma Anton’s Cleaners durante a campanha.",
      "neighborhood": "Por meio de parceiros locais"
    },
    "st-francis-house": {
      "howToGet": "Ligue para (617) 542-4211 ou visite 39 Boylston Street e pergunte como acessar o Fresh Threads. O abrigo diurno abre todos os dias; os horários e a disponibilidade de roupas podem ser diferentes.",
      "hoursNote": "Horário do abrigo diurno; ligue para saber o horário e a disponibilidade do programa de roupas.",
      "transit": "Linha Verde até Boylston ou Linha Laranja/Vermelha até Downtown Crossing.",
      "neighborhood": "Centro (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "Vá sem agendamento de segunda a sábado, das 7h às 14h, e pergunte a um funcionário sobre roupas. Os casacos dependem de doações; pergunte cedo.",
      "eligibility": "Mulheres, incluindo pessoas que se identificam como mulheres. Pergunte à equipe se são necessários documentos ou encaminhamento.",
      "transit": "Linha Verde até Arlington ou Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "Peça a uma assistente um encaminhamento para roupas ou ligue para (617) 318-0237. O guia do outono de 2026 informa atendimento sem agendamento e por telefone de segunda a sexta, das 8h30 às 18h. Confirme os horários atuais e a disponibilidade antes de ir.",
      "eligibility": "O Rosie’s Place atende mulheres. Pergunte à equipe sobre os requisitos e se crianças podem acompanhar você para um encaminhamento de roupas.",
      "hoursNote": "O horário das assistentes pode diferir do abrigo diurno; ligue para confirmar os horários atuais dos encaminhamentos.",
      "transit": "Linha Prata até Melnea Cass Blvd; ônibus 1 pela Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — Necessidades básicas",
      "howToGet": "Ligue para (617) 506-6600 e pergunte à equipe de necessidades básicas se há ajuda ou encaminhamento para roupas antes de viajar. A despensa funciona no mesmo endereço; ligue para confirmar o horário.",
      "hoursNote": "Ligue para saber o horário da equipe e a ajuda para roupas; não está confirmado que o local distribua casacos.",
      "transit": "O ônibus 16 da MBTA para em 185 Columbia Road; confira o trajeto atual antes de viajar."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — Serviços sociais",
      "howToGet": "Ligue para Serviços Sociais no (617) 318-6940 para perguntar sobre ajuda atual com casacos nas festas, inscrição e disponibilidade. A ajuda emergencial cobre os CEPs 02121, 02125 e 02127; fora deles, ligue para (617) 542-5420.",
      "eligibility": "A ajuda emergencial atende aos CEPs 02121, 02125 e 02127. O centro informa que a ajuda nas festas exige qualificação e inscrição prévia; pergunte sobre prazos e disponibilidade de casacos.",
      "hoursNote": "O horário dos Serviços Sociais para roupas não é publicado — ligue antes.",
      "transit": "Linha Fairmount até Uphams Corner; ônibus 15, 17 e 41 param perto."
    },
    "coats4vets": {
      "howToGet": "Ligue para (617) 378-3974 e pergunte sobre casacos disponíveis agora e eventos na região de Boston antes de viajar. A página do Coats4Vets descreve um programa de 2023; confirme inscrições e locais atuais. O centro Empowerment da fundação em Sandwich fica em 117 Route 6A.",
      "eligibility": "Pergunte sobre os requisitos dos eventos atuais de casacos. A fundação informa que visitas aos centros Empowerment exigem agendamento e prova de serviço militar; as regras de outros eventos podem ser diferentes.",
      "neighborhood": "Eventos variam; centro em Sandwich, Cape Cod"
    }
  },
  "vi": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "Gọi (617) 288-2700 để hỏi về quần áo và đồ thiết yếu, việc ghi danh, tình trạng còn hàng và thời gian đến. Với trẻ từ 12 tuổi trở xuống, hãy hỏi nhân viên có thể đặt đồ qua Cradles to Crayons hay không.",
      "eligibility": "Cradles to Crayons liệt kê đối tác này cho cư dân Boston, Malden, Medford và Everett có thu nhập không quá 200% mức nghèo liên bang. Đồ cho trẻ thường dành cho trẻ từ 0–12 tuổi. Hỏi ABCD về ghi danh và giấy tờ; chương trình khác có thể có quy định khác.",
      "hoursNote": "Đây là giờ của trung tâm; khi gọi hãy hỏi ngày hoạt động của chương trình quần áo.",
      "transit": "Tuyến Đỏ đến Fields Corner rồi đi bộ; xem MBTA để biết kết nối xe buýt và đường đi hiện tại."
    },
    "cradles-to-crayons": {
      "howToGet": "Nếu gia đình bạn đã nhận dịch vụ từ một đối tác của Cradles to Crayons, hãy hỏi nhân viên phụ trách xem họ có thể đặt đồ cho con bạn không. Nếu chưa, dùng công cụ tìm đối tác hoặc gọi ABCD Dorchester theo số 617-288-2700 để hỏi bạn có đủ điều kiện nhận dịch vụ của họ không. Gia đình không thể đặt trực tiếp hoặc lấy đồ tại Giving Factory.",
      "eligibility": "Trẻ từ sơ sinh đến 12 tuổi trong gia đình có thu nhập không quá 200% mức nghèo liên bang; gia đình phải đang nhận dịch vụ từ một đối tác. Mỗi đối tác có thể có quy định bổ sung.",
      "hoursNote": "Không nhận đơn trực tiếp từ gia đình hoặc cho gia đình nhận đồ hỗ trợ tại Giving Factory; mỗi văn phòng đối tác có giờ riêng.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — không tiếp gia đình trực tiếp)",
      "neighborhood": "Thông qua các đối tác ở Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "Áo được phát qua trường học và tổ chức đối tác, không phát tại tiệm giặt. Hỏi trường của con bạn, nơi trú ẩn hoặc tổ chức cộng đồng xem họ có phát trong mùa này không. Boston Uncornered tại 222 Bowdoin St từng là điểm nhận quyên góp; hãy xác nhận mùa này. Để tặng áo, mang đến Anton’s Cleaners trong đợt thu nhận.",
      "neighborhood": "Thông qua đối tác địa phương"
    },
    "st-francis-house": {
      "howToGet": "Gọi (617) 542-4211 hoặc đến 39 Boylston Street và hỏi cách sử dụng Fresh Threads. Nơi trú ban ngày mở mỗi ngày; giờ và tình trạng quần áo của chương trình có thể khác.",
      "hoursNote": "Giờ hiển thị là của nơi trú ban ngày; hãy gọi hỏi giờ và tình trạng của chương trình quần áo.",
      "transit": "Tuyến Xanh lá đến Boylston hoặc Tuyến Cam/Đỏ đến Downtown Crossing.",
      "neighborhood": "Trung tâm (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "Đến không cần hẹn từ thứ Hai đến thứ Bảy, 7 giờ sáng–2 giờ chiều, và hỏi nhân viên về quần áo. Áo khoác phụ thuộc vào đồ quyên góp, nên hãy hỏi sớm.",
      "eligibility": "Phụ nữ, bao gồm những người tự nhận mình là phụ nữ. Hỏi nhân viên về giấy tờ hoặc giấy giới thiệu cần thiết.",
      "transit": "Tuyến Xanh lá đến Arlington hoặc Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "Hỏi nhân viên hỗ trợ để được giới thiệu nơi nhận quần áo, hoặc gọi (617) 318-0237. Hướng dẫn mùa thu 2026 ghi giờ tư vấn trực tiếp không hẹn và qua điện thoại thứ Hai–thứ Sáu, 8:30 sáng–6 giờ chiều. Xác nhận giờ hiện tại và tình trạng trước khi đến.",
      "eligibility": "Rosie’s Place phục vụ phụ nữ. Hỏi nhân viên về điều kiện và việc trẻ có thể đi cùng khi xin giới thiệu nhận quần áo hay không.",
      "hoursNote": "Giờ tư vấn có thể khác giờ nơi trú ban ngày; gọi xác nhận giờ giới thiệu hiện tại.",
      "transit": "Tuyến Bạc đến Melnea Cass Blvd; xe buýt 1 dọc Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — Nhu cầu cơ bản",
      "howToGet": "Gọi (617) 506-6600 hỏi nhóm nhu cầu cơ bản có hỗ trợ hoặc giới thiệu nơi nhận quần áo hay không trước khi đi. Điểm phát thực phẩm ở cùng địa chỉ; gọi xác nhận giờ.",
      "hoursNote": "Gọi hỏi giờ của nhóm nhu cầu cơ bản và hỗ trợ quần áo; chưa xác nhận đây là điểm phát áo khoác.",
      "transit": "Xe buýt MBTA số 16 dừng tại 185 Columbia Road; kiểm tra chỉ đường hiện tại trước khi đi."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — Dịch vụ xã hội",
      "howToGet": "Gọi Dịch vụ Xã hội theo số (617) 318-6940 để hỏi hỗ trợ áo khoác dịp lễ hiện tại, việc đăng ký và tình trạng còn hàng. Hỗ trợ khẩn cấp dành cho ZIP 02121, 02125 và 02127; ngoài các mã này gọi (617) 542-5420.",
      "eligibility": "Hỗ trợ khẩn cấp theo khu vực ZIP 02121, 02125 và 02127. Trung tâm cho biết hỗ trợ dịp lễ cần đủ điều kiện và đăng ký trước; hãy hỏi hạn đăng ký và tình trạng áo khoác hiện tại.",
      "hoursNote": "Không có giờ công bố cho dịch vụ quần áo của Dịch vụ Xã hội — hãy gọi trước.",
      "transit": "Tuyến Fairmount đến Uphams Corner; xe buýt 15, 17 và 41 dừng gần đó."
    },
    "coats4vets": {
      "howToGet": "Gọi (617) 378-3974 để hỏi áo khoác hiện còn hay không và các sự kiện gần Boston trước khi đi. Trang Coats4Vets mô tả chương trình năm 2023; hãy xác nhận đăng ký và địa điểm hiện tại. Trung tâm Empowerment của quỹ ở Sandwich tại 117 Route 6A.",
      "eligibility": "Hỏi về điều kiện của các sự kiện áo khoác hiện tại. Quỹ cho biết đến trung tâm Empowerment cần có lịch hẹn và bằng chứng phục vụ quân đội; quy định cho sự kiện khác có thể khác.",
      "neighborhood": "Sự kiện thay đổi; trung tâm Sandwich ở Cape Cod"
    }
  },
  "zh": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "致电 (617) 288-2700，询问衣物和生活必需品、登记、供应情况以及何时可以前往。对于 12 岁及以下的儿童，请询问工作人员能否通过 Cradles to Crayons 订购物品。",
      "eligibility": "Cradles to Crayons 将该机构列为服务 Boston、Malden、Medford 和 Everett 居民的合作伙伴，收入须不超过联邦贫困线的 200%。其儿童用品通常面向 0–12 岁儿童。请向 ABCD 询问登记和文件要求；其他项目规定可能不同。",
      "hoursNote": "所示为中心开放时间；致电时请询问衣物项目在哪些日子运行。",
      "transit": "乘红线至 Fields Corner 后步行；请向 MBTA 查询当前公交接驳和步行路线。"
    },
    "cradles-to-crayons": {
      "howToGet": "如果您的家庭已经接受 Cradles to Crayons 合作机构的服务，请问您的社工能否为孩子订购。否则可使用合作机构查询工具，或致电 ABCD Dorchester 617-288-2700 询问您是否符合其服务条件。家庭不能直接订购，也不能到 Giving Factory 领取。",
      "eligibility": "面向出生至 12 岁的儿童，家庭收入不超过联邦贫困线的 200%；家庭必须正在接受服务合作机构的服务。各合作机构可能有额外规定。",
      "hoursNote": "家庭不能直接订购或到 Giving Factory 领取援助物品；合作机构各有自己的办公时间。",
      "address": "281 Newtonville Ave, Newton, MA 02460（Giving Factory，不直接接待家庭）",
      "neighborhood": "通过 Dorchester 合作机构"
    },
    "antons-coats-for-kids": {
      "howToGet": "外套由合作学校和非营利机构发放，不在洗衣店发放。请询问孩子的学校、庇护所或社区组织本季是否发放。222 Bowdoin St 的 Boston Uncornered 曾是捐赠收集点；请确认本季情况。捐赠外套可在收集期间送到 Anton’s Cleaners。",
      "neighborhood": "通过当地合作机构"
    },
    "st-francis-house": {
      "howToGet": "致电 (617) 542-4211 或到 39 Boylston Street 询问如何使用 Fresh Threads。日间庇护所每天开放；衣物项目的时间和供应情况可能不同。",
      "hoursNote": "所示为日间庇护所时间；请致电询问衣物项目时间和供应情况。",
      "transit": "乘绿线至 Boylston，或乘橙线／红线至 Downtown Crossing。",
      "neighborhood": "市中心（Chinatown）"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "周一至周六上午 7 点至下午 2 点可直接前往，向工作人员询问衣物。外套依靠捐赠，建议早点询问。",
      "eligibility": "女性，包括认同自己为女性的人。请向工作人员询问是否需要文件或转介。",
      "transit": "乘绿线至 Arlington 或 Copley。"
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "向工作人员询问衣物资源转介，或致电 (617) 318-0237。2026 年秋季指南列出的现场免预约及电话咨询时间为周一至周五上午 8:30 至下午 6 点。前往前请确认当前时间及供应情况。",
      "eligibility": "Rosie’s Place 为女性提供服务。请向工作人员询问资格，以及申请衣物转介时儿童能否同行。",
      "hoursNote": "咨询时间可能与日间庇护所不同；请致电确认目前的转介时间。",
      "transit": "乘银线至 Melnea Cass Blvd；1 路公交车沿 Massachusetts Ave 行驶。"
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — 基本需求服务",
      "howToGet": "前往前请致电 (617) 506-6600，询问基本需求团队是否提供衣物援助或转介。食品储藏室位于同一地址；请致电确认时间。",
      "hoursNote": "请致电询问基本需求服务时间和衣物援助；尚未确认这里发放外套。",
      "transit": "MBTA 16 路公交车在 185 Columbia Road 停靠；出发前请查询当前路线。"
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — 社会服务",
      "howToGet": "致电社会服务部 (617) 318-6940，询问当前节日外套援助、登记及供应情况。紧急援助覆盖邮编 02121、02125 和 02127；其他地区请致电 (617) 542-5420。",
      "eligibility": "紧急援助按地区覆盖 02121、02125 和 02127。中心表示节日援助需要符合条件并提前登记；请询问当前截止日期和外套供应。",
      "hoursNote": "衣物社会服务时间未公布，请先致电。",
      "transit": "乘 Fairmount 线至 Uphams Corner；15、17 和 41 路公交车在附近停靠。"
    },
    "coats4vets": {
      "howToGet": "出发前致电 (617) 378-3974，询问目前的外套供应和波士顿地区活动。Coats4Vets 页面描述的是 2023 年项目；请确认当前登记和地点。基金会的 Sandwich Empowerment Center 位于 117 Route 6A。",
      "eligibility": "请询问当前外套活动的资格。基金会表示到访 Empowerment Center 需要预约和服役证明；其他活动的规定可能不同。",
      "neighborhood": "活动地点不固定；Sandwich 中心位于 Cape Cod"
    }
  },
  "ar": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "اتصل على (617) 288-2700 واسأل عن الملابس والاحتياجات الأساسية والتسجيل والتوفر وموعد الزيارة. للطفل بعمر 12 سنة أو أقل، اسأل إن كان الموظفون يستطيعون طلب مستلزمات عبر Cradles to Crayons.",
      "eligibility": "تدرج Cradles to Crayons هذا الشريك لخدمة سكان Boston وMalden وMedford وEverett ممن يبلغ دخلهم 200% من مستوى الفقر الفيدرالي أو أقل. مستلزمات الأطفال عادة للأعمار 0–12 سنة. اسأل ABCD عن التسجيل والمستندات؛ قد تختلف شروط البرامج الأخرى.",
      "hoursNote": "هذه ساعات المركز؛ عند الاتصال اسأل عن أيام عمل برنامج الملابس.",
      "transit": "الخط الأحمر إلى Fields Corner ثم سيراً؛ راجع MBTA لاتصالات الحافلات واتجاهات المشي الحالية."
    },
    "cradles-to-crayons": {
      "howToGet": "إذا كانت أسرتك تتلقى خدمات بالفعل من شريك لـ Cradles to Crayons، فاسأل المسؤول عن حالتك إن كان يستطيع الطلب لطفلك. وإلا فاستخدم أداة البحث عن الشركاء أو اتصل بـ ABCD Dorchester على 617-288-2700 للسؤال عن أهليتك لخدماته. لا تستطيع الأسر الطلب مباشرة أو الاستلام من Giving Factory.",
      "eligibility": "للأطفال من الولادة حتى 12 سنة في أسر دخلها عند 200% من مستوى الفقر الفيدرالي أو أقل؛ يجب أن تكون الأسرة تتلقى خدمات من شريك. قد يضع كل شريك شروطاً إضافية.",
      "hoursNote": "لا تقبل طلبات الأسر المباشرة أو استلام المساعدات من Giving Factory؛ لكل مكتب شريك ساعات عمله.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — لا يستقبل الأسر مباشرة)",
      "neighborhood": "عبر شركاء في Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "توزع المعاطف عبر المدارس والمؤسسات الشريكة وليس في المغاسل. اسأل مدرسة طفلك أو المأوى أو مؤسستك المجتمعية إن كانت توزع هذا الموسم. كان Boston Uncornered في 222 Bowdoin St نقطة لجمع التبرعات؛ تأكد لهذا الموسم. للتبرع بمعطف، اتركه في Anton’s Cleaners أثناء فترة الجمع.",
      "neighborhood": "عبر شركاء محليين"
    },
    "st-francis-house": {
      "howToGet": "اتصل على (617) 542-4211 أو زر 39 Boylston Street واسأل عن طريقة الوصول إلى Fresh Threads. المأوى النهاري مفتوح يومياً؛ قد تختلف ساعات برنامج الملابس وتوفره.",
      "hoursNote": "المعروض ساعات المأوى النهاري؛ اتصل لمعرفة ساعات برنامج الملابس وتوفره.",
      "transit": "الخط الأخضر إلى Boylston أو البرتقالي/الأحمر إلى Downtown Crossing.",
      "neighborhood": "وسط المدينة (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "يمكنك الحضور دون موعد من الاثنين إلى السبت، 7 صباحاً–2 ظهراً، وسؤال الموظفين عن الملابس. تعتمد المعاطف على التبرعات، لذا اسأل مبكراً.",
      "eligibility": "للنساء، بمن فيهن من يعرّفن أنفسهن كنساء. اسأل الموظفين عن أي مستندات أو إحالة مطلوبة.",
      "transit": "الخط الأخضر إلى Arlington أو Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "اطلبي من مرشدة إحالة للحصول على الملابس أو اتصلي على (617) 318-0237. يذكر دليل خريف 2026 ساعات الإرشاد دون موعد وعبر الهاتف من الاثنين إلى الجمعة، 8:30 صباحاً–6 مساءً. أكدي الساعات والتوفر الحاليين قبل الذهاب.",
      "eligibility": "يخدم Rosie’s Place النساء. اسألي الموظفين عن أهلية الخدمة وما إذا كان الأطفال يستطيعون مرافقتك لطلب إحالة ملابس.",
      "hoursNote": "قد تختلف ساعات الإرشاد عن ساعات المأوى النهاري؛ اتصلي لتأكيد ساعات الإحالة الحالية.",
      "transit": "الخط الفضي إلى Melnea Cass Blvd؛ الحافلة 1 على Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — الاحتياجات الأساسية",
      "howToGet": "اتصل على (617) 506-6600 واسأل فريق الاحتياجات الأساسية إن كانت هناك مساعدة بالملابس أو إحالة قبل السفر. مخزن الطعام في العنوان نفسه؛ اتصل لتأكيد ساعاته.",
      "hoursNote": "اتصل لمعرفة ساعات الاحتياجات الأساسية والمساعدة بالملابس؛ لم يتأكد أن الموقع يوزع المعاطف.",
      "transit": "تتوقف حافلة MBTA رقم 16 عند 185 Columbia Road؛ تحقق من الاتجاهات الحالية قبل السفر."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — الخدمات الاجتماعية",
      "howToGet": "اتصل بالخدمات الاجتماعية على (617) 318-6940 للاستفسار عن مساعدة معاطف الأعياد الحالية والتسجيل والتوفر. تغطي المساعدة الطارئة الرموز 02121 و02125 و02127؛ خارجها اتصل على (617) 542-5420.",
      "eligibility": "المساعدة الطارئة للرموز 02121 و02125 و02127. يقول المركز إن مساعدة الأعياد تتطلب استيفاء الشروط والتسجيل المسبق؛ اسأل عن المواعيد النهائية وتوفر المعاطف حالياً.",
      "hoursNote": "ساعات الخدمات الاجتماعية للملابس غير منشورة؛ اتصل أولاً.",
      "transit": "خط Fairmount إلى Uphams Corner؛ تتوقف الحافلات 15 و17 و41 بالقرب منه."
    },
    "coats4vets": {
      "howToGet": "اتصل على (617) 378-3974 للسؤال عن توفر المعاطف حالياً وفعاليات منطقة بوسطن قبل السفر. تصف صفحة Coats4Vets برنامجاً لعام 2023؛ أكد التسجيل والمواقع الحالية. يقع مركز Empowerment التابع للمؤسسة في Sandwich على 117 Route 6A.",
      "eligibility": "اسأل عن شروط فعاليات المعاطف الحالية. تقول المؤسسة إن زيارة مراكز Empowerment تتطلب موعداً وإثبات الخدمة العسكرية؛ قد تختلف شروط الفعاليات الأخرى.",
      "neighborhood": "تختلف الفعاليات؛ مركز Sandwich في Cape Cod"
    }
  },
  "so": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "Wac (617) 288-2700 oo weydii dharka iyo agabka aasaasiga ah, isdiiwaangelinta, helitaanka iyo goorta la booqan karo. Ilmo 12 jir ama ka yar, weydii in shaqaaluhu alaab uga dalbi karaan Cradles to Crayons.",
      "eligibility": "Cradles to Crayons waxay lammaanahan u taxdaa dadka Boston, Malden, Medford iyo Everett deggan ee dakhligoodu yahay 200% heerka saboolnimada federaalka ama ka hooseeya. Alaabta carruurtu badanaa waxay u tahay da'da 0–12. ABCD ka weydii isdiiwaangelinta iyo dukumentiyada; barnaamijyada kale shuruudahoodu way kala duwanaan karaan.",
      "hoursNote": "Kuwani waa saacadaha xarunta; markaad wacdo weydii maalmaha barnaamijka dharku shaqeeyo.",
      "transit": "Khadka Cas u raac Fields Corner, dabadeed lugee; ka hubi MBTA isku xirka basaska iyo jidka hadda."
    },
    "cradles-to-crayons": {
      "howToGet": "Haddii qoyskaagu hore adeeg uga helo lammaanaha Cradles to Crayons, weydii shaqaalaha kiiskaaga inuu ilmahaaga u dalbi karo. Haddii kale isticmaal raadinta lammaanaha ama wac ABCD Dorchester 617-288-2700 si aad u weydiiso inaad adeeggooda u qalanto. Qoysasku si toos ah uma dalban karaan ama ugama qaadan karaan Giving Factory.",
      "eligibility": "Carruurta dhalashada ilaa 12 jir ee qoysaskoodu dakhliga ku yihiin 200% heerka saboolnimada federaalka ama ka hooseeya; qoysku waa inuu adeeg ka helayaa lammaane. Lammaane kastaa wuxuu yeelan karaa shuruudo kale.",
      "hoursNote": "Qoysasku si toos ah uma dalban karaan ama ugama qaadan karaan alaabta caawinta Giving Factory; xafiis kasta oo lammaane ah wuxuu leeyahay saacado u gaar ah.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — qoysaska si toos ah uma qaabilo)",
      "neighborhood": "Iyada oo loo marayo lammaanayaasha Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "Jaakadaha waxaa qaybiya dugsiyada iyo hay'adaha lammaanaha ah, ma aha goobaha nadiifinta. Weydii dugsiga ilmahaaga, hoyga ama hay'adda bulshada inay qaybinayaan xilli ciyaareedkan. Boston Uncornered ee 222 Bowdoin St wuxuu ahaan jiray goob ururin; xaqiiji xilligan. Si aad jaakad u deeqdo, gee Anton’s Cleaners inta ururintu socoto.",
      "neighborhood": "Iyada oo loo marayo lammaanayaasha deegaanka"
    },
    "st-francis-house": {
      "howToGet": "Wac (617) 542-4211 ama booqo 39 Boylston Street oo weydii sida loo helo Fresh Threads. Hoyga maalintii wuu furan yahay maalin kasta; saacadaha iyo helitaanka barnaamijka dharku way ka duwanaan karaan.",
      "hoursNote": "Waxaa la muujiyay saacadaha hoyga maalintii; wac si aad u weydiiso saacadaha iyo helitaanka dharka.",
      "transit": "Khadka Cagaaran u raac Boylston ama kan Liimiga/Cas u raac Downtown Crossing.",
      "neighborhood": "Bartamaha magaalada (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "Tag ballan la'aan Isniin ilaa Sabti, 7 subaxnimo–2 galabnimo, oo shaqaalaha weydii dharka. Jaakadaha waxay ku xiran yihiin deeqaha, sidaa darteed goor hore weydii.",
      "eligibility": "Haweenka, oo ay ku jiraan dadka isu aqoonsada haween. Weydii shaqaalaha dukumenti ama gudbin loo baahan yahay.",
      "transit": "Khadka Cagaaran u raac Arlington ama Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "La-taliye weydii gudbin dhar ama wac (617) 318-0237. Hagaha dayrta 2026 wuxuu sheegayaa la-talin ballan la'aan iyo telefoon Isniin–Jimce, 8:30 subaxnimo–6 galabnimo. Xaqiiji saacadaha iyo helitaanka hadda ka hor intaadan tagin.",
      "eligibility": "Rosie’s Place wuxuu u adeegaa haweenka. Shaqaalaha weydii shuruudaha adeegga iyo in carruur ku raaci karaan markaad codsanayso gudbin dhar.",
      "hoursNote": "Saacadaha la-taliyuhu way ka duwanaan karaan hoyga maalintii; wac si aad u xaqiijiso saacadaha gudbinta hadda.",
      "transit": "Khadka Silver u raac Melnea Cass Blvd; baska 1 wuxuu maraa Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — Baahiyaha aasaasiga ah",
      "howToGet": "Wac (617) 506-6600 oo kooxda baahiyaha aasaasiga ah weydii inay hayaan kaalmo dhar ama gudbin ka hor safarka. Bakhaarka cuntadu waa isla cinwaanka; wac si aad saacadaha u xaqiijiso.",
      "hoursNote": "Wac si aad u ogaato saacadaha iyo kaalmada dharka; lama xaqiijin inay goobtu jaakado qaybiso.",
      "transit": "Baska MBTA 16 wuxuu istaagaa 185 Columbia Road; hubi jidka hadda ka hor safarka."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — Adeegyada bulshada",
      "howToGet": "Wac Adeegyada Bulshada (617) 318-6940 si aad u weydiiso kaalmada jaakadaha fasaxyada ee hadda, isdiiwaangelinta iyo helitaanka. Kaalmada degdegga ahi waxay dabooshaa ZIP 02121, 02125 iyo 02127; meel ka baxsan wac (617) 542-5420.",
      "eligibility": "Kaalmada degdegga ahi waxay ku kooban tahay 02121, 02125 iyo 02127. Xaruntu waxay sheegtaa in kaalmada fasaxyadu u baahan tahay u-qalmid iyo isdiiwaangelin hore; weydii waqtiga kama dambaysta ah iyo helitaanka jaakadaha.",
      "hoursNote": "Saacadaha adeegga bulshada ee dharka lama daabicin — marka hore wac.",
      "transit": "Khadka Fairmount u raac Uphams Corner; basaska 15, 17 iyo 41 ayaa ag dhow istaaga."
    },
    "coats4vets": {
      "howToGet": "Wac (617) 378-3974 oo weydii jaakadaha hadda jira iyo dhacdooyinka agagaarka Boston ka hor safarka. Bogga Coats4Vets wuxuu sharxayaa barnaamij 2023; xaqiiji isdiiwaangelinta iyo goobaha hadda. Xarunta Empowerment ee hay'adda ee Sandwich waxay ku taal 117 Route 6A.",
      "eligibility": "Weydii shuruudaha dhacdooyinka jaakadaha ee hadda. Hay'addu waxay sheegtaa in booqashada xarumaha Empowerment ay u baahan tahay ballan iyo caddaynta adeegga milatari; dhacdooyinka kale shuruudahoodu way kala duwanaan karaan.",
      "neighborhood": "Dhacdooyinku way kala duwan yihiin; xarunta Sandwich waxay ku taal Cape Cod"
    }
  },
  "kea": {
    "abcd-dorchester-nsc": {
      "neighborhood": "Franklin, Dorchester",
      "howToGet": "Txoma (617) 288-2700 i pergunta sobri ropa i artigus esensial, inskrison, disponibilidadi i ora di vizita. Pa kriansa di 12 anu ô menus, pergunta si funsionárius podi pidi artigus atravez di Cradles to Crayons.",
      "eligibility": "Cradles to Crayons lista es parseru pa rezidentis di Boston, Malden, Medford i Everett ku rendimentu igual ô inferior a 200% di nivel federal di pobreza. Artigus infantil normalmenti é pa idadi 0–12 anu. Pergunta ABCD sobri inskrison i dokumentus; otus programá podi ten reglas diferenti.",
      "hoursNote": "Es é oráriu di sentru; ora bu txoma pergunta ki dias programa di ropa ta funsiona.",
      "transit": "Linha Vermelha pa Fields Corner, dipôs anda; konfirma na MBTA ligasons di autokaru i kaminhu atual."
    },
    "cradles-to-crayons": {
      "howToGet": "Si bu família dja ta resebe servisu di un parseru di Cradles to Crayons, pergunta bu asistenti si el podi pidi pa bu fidju. Senon, uza peskiza di parserus ô txoma ABCD Dorchester na 617-288-2700 pa pergunta si bo ta kalifika pa ses servisu. Família ka podi pidi diretamente ni lebanta artigus na Giving Factory.",
      "eligibility": "Kriansas di nasimentu té 12 anu na família ku rendimentu igual ô inferior a 200% di nivel federal di pobreza; família ten ki sta resebendo servisu di un parseru. Kada parseru podi ten otus kondisons.",
      "hoursNote": "Família ka podi pidi diretamente ni lebanta artigus di ajuda na Giving Factory; kada skritóriu parseru ten ses própriu oráriu.",
      "address": "281 Newtonville Ave, Newton, MA 02460 (Giving Factory — ka é lokal di atendimentu diretu pa família)",
      "neighborhood": "Atravez di parserus di Dorchester"
    },
    "antons-coats-for-kids": {
      "howToGet": "Skolas i organizasons parseru ta distribui kazakus, ka é na lavandaria. Pergunta skola di bu fidju, abrigu ô organizason di komunidade si es ta distribui es temporada. Boston Uncornered na 222 Bowdoin St tabata un lokal di rekolha; konfirma pa es temporada. Pa doa un kazaku, dexa-l na Anton’s Cleaners duranti rekolha.",
      "neighborhood": "Atravez di parserus lokal"
    },
    "st-francis-house": {
      "howToGet": "Txoma (617) 542-4211 ô vizita 39 Boylston Street i pergunta modi di asesu a Fresh Threads. Abrigu di dia ta abri tudu dia; oráriu i disponibilidadi di programa di ropa podi ser diferenti.",
      "hoursNote": "Oráriu mostra é di abrigu di dia; txoma pa oráriu i disponibilidadi di programa di ropa.",
      "transit": "Linha Verdi pa Boylston ô linha Laranja/Vermelha pa Downtown Crossing.",
      "neighborhood": "Sentru di sidadi (Chinatown)"
    },
    "womens-lunch-place": {
      "neighborhood": "Back Bay",
      "howToGet": "Bai sen marka di sigunda té sábadu, 7 di manhan–2 di tardi, i pergunta un funsionáriu sobri ropa. Kazakus ta dipende di donativu, purisu pergunta sedu.",
      "eligibility": "Mudjeris, inkluindu pesoas ki ta identifika komu mudjer. Pergunta funsionárius si dokumentus ô referénsia é nesesáriu.",
      "transit": "Linha Verdi pa Arlington ô Copley."
    },
    "rosies-place": {
      "neighborhood": "South End",
      "howToGet": "Pidi un konselhera referénsia pa ropa ô txoma (617) 318-0237. Guia di otónu 2026 ta mostra atendimentu sen marka i pa telefoni di sigunda té sexta, 8:30 di manhan–6 di tardi. Konfirma oráriu atual i disponibilidadi antis di bai.",
      "eligibility": "Rosie’s Place ta atende mudjeris. Pergunta funsionárius sobri kondisons di servisu i si kriansas podi akonpanha-bu pa pidi referénsia di ropa.",
      "hoursNote": "Oráriu di konselhera podi ser diferenti di abrigu di dia; txoma pa konfirma oráriu atual di referénsia.",
      "transit": "Linha Prata pa Melnea Cass Blvd; autokaru 1 ta pasa na Massachusetts Ave."
    },
    "yawkey-basic-needs": {
      "neighborhood": "Uphams Corner / Four Corners",
      "name": "Yawkey Center — Nesisidadis básiku",
      "howToGet": "Txoma (617) 506-6600 i pergunta ekipa di nesisidadis básiku si ten ajuda ô referénsia pa ropa antis di viaja. Armazén di kumida fika na mésmu morada; txoma pa konfirma oráriu.",
      "hoursNote": "Txoma pa oráriu di nesisidadis básiku i ajuda pa ropa; ka ten konfirmason ki es lokal ta distribui kazakus.",
      "transit": "Autokaru MBTA 16 ta para na 185 Columbia Road; konfirma direkson atual antis di viaja."
    },
    "kroc-center": {
      "neighborhood": "Uphams Corner",
      "name": "Kroc Center — Servisus sosial",
      "howToGet": "Txoma Servisus Sosial na (617) 318-6940 pa pergunta sobri ajuda atual ku kazakus di festas, inskrison i disponibilidadi. Ajuda di emerjénsia ta kobri kódigus postal 02121, 02125 i 02127; fora des árias txoma (617) 542-5420.",
      "eligibility": "Ajuda di emerjénsia é pa kódigus 02121, 02125 i 02127. Sentru ta fla ki ajuda di festas ten kondisons i meste inskrison adiantadu; pergunta prazu atual i disponibilidadi di kazakus.",
      "hoursNote": "Oráriu di Servisus Sosial pa ropa ka foi publikadu — txoma primeru.",
      "transit": "Linha Fairmount pa Uphams Corner; autokarus 15, 17 i 41 ta para perto."
    },
    "coats4vets": {
      "howToGet": "Txoma (617) 378-3974 pa pergunta sobri kazakus disponíbel agora i eventus na área di Boston antis di viaja. Pájina di Coats4Vets ta diskreve un programa di 2023; konfirma inskrison i lokais atuais. Sentru Empowerment di fundason na Sandwich fika na 117 Route 6A.",
      "eligibility": "Pergunta sobri kondisons di eventus atuais di kazakus. Fundason ta fla ki vizita na sentrus Empowerment meste marka i prova di servisu militar; reglas di otus eventus podi ser diferenti.",
      "neighborhood": "Eventus ta varia; sentru na Sandwich na Cape Cod"
    }
  }
};
