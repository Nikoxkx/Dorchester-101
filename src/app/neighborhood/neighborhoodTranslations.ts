import type { Language } from '@/stores/appStore';

/** AI-assisted drafts. Neighborhood names stay as proper nouns. Keep the order
 * and source facts aligned with page.tsx; review translations with residents. */
/** Review the translated summaries and captions before updating after English edits. */
export const NEIGHBORHOOD_SOURCE_DIGEST = 'aefda151a5ffb88d3c54d8179de1935e2c69f12cd7e6c68e832e91661a5dfaf1';

export const NEIGHBORHOOD_NAMES = [
  'Fields Corner', 'Savin Hill', 'Uphams Corner', 'Codman Square', 'Grove Hall',
  'Four Corners', 'Lower Mills', 'Ashmont', 'Neponset',
] as const;

type Copy = readonly [summary: string, caption: string];
type NineCopies = readonly [Copy, Copy, Copy, Copy, Copy, Copy, Copy, Copy, Copy];

const COPY: Record<Exclude<Language, 'en'>, NineCopies> = {
  es: [
    ['Importante centro comercial con acceso a la Línea Roja. Gran comunidad vietnamita.', 'Tren de la Línea Roja llegando a Fields Corner en dirección al centro, julio de 2021'],
    ['Zona residencial cerca de la playa. Cerca de UMass Boston.', 'Dorchester Bay vista desde Savin Hill'],
    ['Centro histórico de pueblo. Creciente actividad artística y cultural.', 'El edificio S. B. Pierce en Uphams Corner'],
    ['Zona orientada a la comunidad, con un centro de salud y comercios locales.', "Segunda Iglesia de Dorchester en Codman Square, 2019"],
    ['Barrio animado con influencias caribeñas y africanas.', "Distrito histórico de Intervale Street–Blue Hill Avenue, cerca de Grove Hall, 2021"],
    ['Intersección de calles principales. Zona residencial y comercial.', 'Estación Four Corners/Geneva Avenue de la línea Fairmount, vista hacia el centro'],
    ['Zona histórica de molinos junto al río Neponset. Tiendas y restaurantes locales.', 'Parque infantil de Ventura Street en la reserva del río Neponset, debajo de Lower Mills'],
    ['Terminal de la Línea Roja. Distrito comercial de Peabody Square.', 'Estación Ashmont vista desde Peabody Square'],
    ['Zona frente al agua. Parques y marismas.', 'Reserva del río Neponset'],
  ],
  ht: [
    ['Gwo sant komèsyal ak aksè ak Liy Wouj la. Gwo kominote vyetnamyen.', 'Tren Liy Wouj k ap rive nan estasyon Fields Corner nan direksyon sant vil la, jiyè 2021'],
    ['Zòn rezidansyèl toupre plaj la. Toupre UMass Boston.', 'Dorchester Bay jan yo wè li depi Savin Hill'],
    ['Sant vilaj istorik. Yon sèn atistik ak kiltirèl k ap grandi.', 'Bilding S. B. Pierce nan Uphams Corner'],
    ['Zòn ki santre sou kominote a, ak yon sant sante ak biznis lokal.', "Dezyèm Legliz Dorchester nan Codman Square, 2019"],
    ['Katye vivan ak enfliyans karayibeyen ak afriken.', "Distri istorik Intervale Street–Blue Hill Avenue, toupre Grove Hall, 2021"],
    ['Kafou gwo lari. Zòn rezidansyèl ak komèsyal.', 'Estasyon Four Corners/Geneva Avenue sou liy Fairmount la, ap gade nan direksyon sant vil la'],
    ['Zòn istorik moulen bò larivyè Neponset. Boutik ak restoran lokal.', 'Pak jwèt Ventura Street nan rezèv larivyè Neponset, anba Lower Mills'],
    ['Dènye estasyon Liy Wouj la. Zòn komèsyal Peabody Square.', 'Estasyon Ashmont jan yo wè li depi Peabody Square'],
    ['Zòn bò dlo. Pak ak marekaj.', 'Rezèv larivyè Neponset'],
  ],
  pt: [
    ['Importante centro comercial com acesso à Linha Vermelha. Forte comunidade vietnamita.', 'Trem da Linha Vermelha chegando à estação Fields Corner em direção ao centro, julho de 2021'],
    ['Área residencial perto da praia e da UMass Boston.', 'Dorchester Bay vista de Savin Hill'],
    ['Centro histórico de vila. Cena artística e cultural em crescimento.', 'Edifício S. B. Pierce em Uphams Corner'],
    ['Área voltada à comunidade, com centro de saúde e comércio local.', "Segunda Igreja de Dorchester em Codman Square, 2019"],
    ['Bairro vibrante com influências caribenhas e africanas.', "Distrito histórico de Intervale Street–Blue Hill Avenue, perto de Grove Hall, 2021"],
    ['Cruzamento de ruas importantes. Área mista residencial e comercial.', 'Estação Four Corners/Geneva Avenue na linha Fairmount, vista em direção ao centro'],
    ['Área histórica de moinhos junto ao rio Neponset. Lojas e restaurantes locais.', 'Parquinho da Ventura Street na reserva do rio Neponset, abaixo de Lower Mills'],
    ['Terminal da Linha Vermelha. Distrito comercial de Peabody Square.', 'Estação Ashmont vista de Peabody Square'],
    ['Área à beira da água. Parques e áreas alagadas.', 'Reserva do rio Neponset'],
  ],
  vi: [
    ['Trung tâm thương mại lớn có Tuyến Đỏ. Cộng đồng người Việt đông đảo.', 'Tàu Tuyến Đỏ đi vào trung tâm đến ga Fields Corner, tháng 7 năm 2021'],
    ['Khu dân cư gần bãi biển và UMass Boston.', 'Vịnh Dorchester nhìn từ Savin Hill'],
    ['Trung tâm làng lịch sử. Hoạt động nghệ thuật và văn hóa đang phát triển.', 'Tòa nhà S. B. Pierce tại Uphams Corner'],
    ['Khu vực hướng tới cộng đồng với trung tâm y tế và doanh nghiệp địa phương.', "Nhà thờ Second Church of Dorchester tại Codman Square, năm 2019"],
    ['Khu phố sôi động chịu ảnh hưởng vùng Caribe và châu Phi.', "Khu lịch sử Intervale Street–Blue Hill Avenue, gần Grove Hall, năm 2021"],
    ['Giao lộ của các đường lớn. Khu dân cư và thương mại hỗn hợp.', 'Ga Four Corners/Geneva Avenue trên tuyến Fairmount, nhìn về phía trung tâm'],
    ['Khu nhà máy lịch sử bên sông Neponset. Có cửa hàng và nhà hàng địa phương.', 'Sân chơi Ventura Street trong khu bảo tồn sông Neponset, phía dưới Lower Mills'],
    ['Ga cuối Tuyến Đỏ. Khu thương mại Peabody Square.', 'Ga Ashmont nhìn từ Peabody Square'],
    ['Khu ven nước. Công viên và đầm lầy.', 'Khu bảo tồn sông Neponset'],
  ],
  zh: [
    ['主要商业中心，可乘坐红线。越南裔社区规模较大。', '2021 年 7 月，一列驶向市中心的红线列车抵达 Fields Corner 站'],
    ['靠近海滩的住宅区，邻近 UMass Boston。', '从 Savin Hill 眺望 Dorchester Bay'],
    ['历史悠久的村镇中心，艺术和文化活动日益兴盛。', 'Uphams Corner 的 S. B. Pierce 大楼'],
    ['以社区为中心的地区，设有健康中心和本地商铺。', "Codman Square 的 Dorchester 第二教堂，2019 年"],
    ['充满活力的社区，受到加勒比和非洲文化影响。', "Grove Hall 附近的 Intervale Street–Blue Hill Avenue 历史区，2021 年"],
    ['主要街道的交汇处，住宅与商业混合。', 'Fairmount 线 Four Corners/Geneva Avenue 站，朝市中心方向拍摄'],
    ['Neponset 河畔历史悠久的工厂区，有本地商店和餐厅。', 'Lower Mills 下方 Neponset River Reservation 内的 Ventura Street 游乐场'],
    ['红线终点站，设有 Peabody Square 商业区。', '从 Peabody Square 看 Ashmont 站'],
    ['滨水地区，拥有公园和沼泽地。', 'Neponset River Reservation'],
  ],
  ar: [
    ['مركز تجاري رئيسي يخدمه الخط الأحمر، وفيه مجتمع فيتنامي كبير.', 'قطار الخط الأحمر المتجه نحو وسط المدينة يصل إلى محطة Fields Corner، يوليو 2021'],
    ['منطقة سكنية قرب الشاطئ وبالقرب من UMass Boston.', 'خليج Dorchester كما يظهر من Savin Hill'],
    ['مركز قرية تاريخي ومشهد فني وثقافي متنامٍ.', 'مبنى S. B. Pierce في Uphams Corner'],
    ['منطقة تهتم بالمجتمع وتضم مركزاً صحياً وأعمالاً محلية.', "الكنيسة الثانية في Dorchester بساحة Codman Square، 2019"],
    ['حي نابض ذو تأثيرات كاريبية وأفريقية.', "الحي التاريخي Intervale Street–Blue Hill Avenue قرب Grove Hall، 2021"],
    ['تقاطع شوارع رئيسية، بمنطقة سكنية وتجارية مختلطة.', 'محطة Four Corners/Geneva Avenue على خط Fairmount، باتجاه وسط المدينة'],
    ['منطقة مطاحن تاريخية على نهر Neponset، تضم متاجر ومطاعم محلية.', 'ملعب Ventura Street في محمية نهر Neponset، أسفل Lower Mills'],
    ['نهاية الخط الأحمر والمنطقة التجارية في Peabody Square.', 'محطة Ashmont من Peabody Square'],
    ['منطقة على الواجهة المائية تضم حدائق وأراضي مستنقعات.', 'محمية نهر Neponset'],
  ],
  so: [
    ['Xarun ganacsi oo weyn oo leh Khadka Cas. Bulsho Fiyetnaamiis ah oo xooggan.', 'Tareenka Khadka Cas ee u socda bartamaha magaalada oo imanaya saldhigga Fields Corner, Luulyo 2021'],
    ['Aag la deggan yahay oo u dhow xeebta iyo UMass Boston.', 'Dorchester Bay oo laga eegayo Savin Hill'],
    ['Xarun tuulo oo taariikhi ah. Fanka iyo dhaqanku way kobcayaan.', 'Dhismaha S. B. Pierce ee Uphams Corner'],
    ['Aag bulshada u jeeda oo leh xarun caafimaad iyo ganacsiyo maxalli ah.', "Kaniisadda Labaad ee Dorchester ee Codman Square, 2019"],
    ['Xaafad firfircoon oo leh saameyn Kariibiyaan iyo Afrikaan.', "Aagga taariikhiga ah ee Intervale Street–Blue Hill Avenue, oo u dhow Grove Hall, 2021"],
    ['Isgoyska jidad waaweyn. Aag la deggan yahay oo ganacsi leh.', 'Saldhigga Four Corners/Geneva Avenue ee khadka Fairmount, oo loo eegayo bartamaha'],
    ['Aag warshado taariikhi ah oo ku yaal webiga Neponset. Dukaan iyo maqaayado maxalli ah.', 'Goobta ciyaarta Ventura Street ee kaydka webiga Neponset, hoosta Lower Mills'],
    ['Saldhigga ugu dambeeya ee Khadka Cas. Aagga ganacsiga Peabody Square.', 'Saldhigga Ashmont oo laga eegayo Peabody Square'],
    ['Aag biyaha ku dhow. Jardiinooyin iyo dhul qoyan.', 'Kaydka webiga Neponset'],
  ],
  kea: [
    ['Sentru komersial grandi ku asesu a Linha Vermelha. Komunidade vietnamita forti.', 'Konboiu di Linha Vermelha na direton di sentru ta txiga na estason Fields Corner, djulhu 2021'],
    ['Zona rezidensial perto di praia i di UMass Boston.', 'Dorchester Bay vistu di Savin Hill'],
    ['Sentru istóriku di vila. Arte i kultura ta krese.', 'Prédiu S. B. Pierce na Uphams Corner'],
    ['Zona viradu pa komunidade ku sentru di saúdi i negósius lokal.', "Sigunda Igreja di Dorchester na Codman Square, 2019"],
    ['Bairu vivu ku influénsia karibenhu i afrikanu.', "Distritu istóriku di Intervale Street–Blue Hill Avenue, perto di Grove Hall, 2021"],
    ['Kruzamentu di ruas prinsipal. Zona rezidensial i komersial.', 'Estason Four Corners/Geneva Avenue na linha Fairmount, na direton di sentru'],
    ['Zona istóriku di moinhu na rio Neponset. Lojas i restoranti lokal.', 'Parque infantil di Ventura Street na rezerva di rio Neponset, baxu di Lower Mills'],
    ['Últimu estason di Linha Vermelha. Zona komersial di Peabody Square.', 'Estason Ashmont vistu di Peabody Square'],
    ['Zona na beira di água. Parkis i zonas húmidu.', 'Rezerva di rio Neponset'],
  ],
};

export function neighborhoodCopy(name: string, language: Language): { summary: string; caption: string } | undefined {
  if (language === 'en') return undefined;
  const index = NEIGHBORHOOD_NAMES.findIndex((candidate) => candidate === name);
  const copy = COPY[language]?.[index];
  return copy ? { summary: copy[0], caption: copy[1] } : undefined;
}
