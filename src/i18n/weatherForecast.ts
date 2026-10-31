import type { LanguageCode } from './config';

/**
 * Exact, deliberately limited translations of common NWS short descriptions.
 * These are first drafts. Do not simplify, guess at, or partially translate a
 * compound phrase: doing so could drop timing, probability, or hazards.
 * Detailed forecasts and official warnings stay in the source language.
 */
type AllLanguages = Record<LanguageCode, string>;
const EXACT: Record<string, AllLanguages> = {
  clear: { en: 'Clear', es: 'Despejado', ht: 'Syèl klè', pt: 'Céu limpo', vi: 'Trời quang', zh: '晴朗', ar: 'صحو', so: 'Cirka waa furan yahay', kea: 'Séu linpu' },
  'mostly clear': { en: 'Mostly Clear', es: 'Mayormente despejado', ht: 'Syèl sitou klè', pt: 'Céu predominantemente limpo', vi: 'Trời chủ yếu quang', zh: '大部晴朗', ar: 'صحو غالبًا', so: 'Cirka inta badan waa furan yahay', kea: 'Séu maiória linpu' },
  'partly cloudy': { en: 'Partly Cloudy', es: 'Parcialmente nublado', ht: 'Syèl pasyèlman kouvri', pt: 'Parcialmente nublado', vi: 'Trời có mây từng phần', zh: '局部多云', ar: 'غائم جزئيًا', so: 'Daruur qayb ahaan ah', kea: 'Parsiálmenti nublaadu' },
  'mostly cloudy': { en: 'Mostly Cloudy', es: 'Mayormente nublado', ht: 'Syèl sitou kouvri', pt: 'Predominantemente nublado', vi: 'Trời nhiều mây', zh: '大部多云', ar: 'غائم غالبًا', so: 'Inta badan daruur leh', kea: 'Maiória nublaadu' },
  cloudy: { en: 'Cloudy', es: 'Nublado', ht: 'Syèl kouvri', pt: 'Nublado', vi: 'Trời nhiều mây', zh: '阴天', ar: 'غائم', so: 'Daruur leh', kea: 'Nublaadu' },
  sunny: { en: 'Sunny', es: 'Soleado', ht: 'Solèy', pt: 'Ensolarado', vi: 'Trời nắng', zh: '晴天', ar: 'مشمس', so: 'Qorrax leh', kea: 'Ku sol' },
  'mostly sunny': { en: 'Mostly Sunny', es: 'Mayormente soleado', ht: 'Sitou solèy', pt: 'Predominantemente ensolarado', vi: 'Trời chủ yếu nắng', zh: '大部晴天', ar: 'مشمس غالبًا', so: 'Inta badan qorrax leh', kea: 'Maiória ku sol' },
  'partly sunny': { en: 'Partly Sunny', es: 'Parcialmente soleado', ht: 'Yon pati solèy', pt: 'Parcialmente ensolarado', vi: 'Có nắng từng lúc', zh: '局部晴天', ar: 'مشمس جزئيًا', so: 'Qorrax qayb ahaan ah', kea: 'Parsiálmenti ku sol' },
  fog: { en: 'Fog', es: 'Niebla', ht: 'Bwouya', pt: 'Nevoeiro', vi: 'Sương mù', zh: '雾', ar: 'ضباب', so: 'Ceeryaamo', kea: 'Nébu' },
  'patchy fog': { en: 'Patchy Fog', es: 'Niebla dispersa', ht: 'Bwouya kèk kote', pt: 'Nevoeiro em algumas áreas', vi: 'Sương mù rải rác', zh: '局部有雾', ar: 'ضباب متفرق', so: 'Ceeryaamo meelo kooban ah', kea: 'Nébu na algus lugar' },
  rain: { en: 'Rain', es: 'Lluvia', ht: 'Lapli', pt: 'Chuva', vi: 'Mưa', zh: '下雨', ar: 'أمطار', so: 'Roob', kea: 'Txuba' },
  'light rain': { en: 'Light Rain', es: 'Lluvia ligera', ht: 'Ti lapli', pt: 'Chuva fraca', vi: 'Mưa nhẹ', zh: '小雨', ar: 'أمطار خفيفة', so: 'Roob fudud', kea: 'Txuba fraku' },
  'rain showers': { en: 'Rain Showers', es: 'Chubascos', ht: 'Avas lapli', pt: 'Pancadas de chuva', vi: 'Mưa rào', zh: '阵雨', ar: 'زخات مطر', so: 'Roobab goos-goos ah', kea: 'Avaseru di txuba' },
  snow: { en: 'Snow', es: 'Nieve', ht: 'Nèj', pt: 'Neve', vi: 'Tuyết', zh: '下雪', ar: 'ثلوج', so: 'Baraf', kea: 'Névi' },
  'light snow': { en: 'Light Snow', es: 'Nieve ligera', ht: 'Ti nèj', pt: 'Neve fraca', vi: 'Tuyết nhẹ', zh: '小雪', ar: 'ثلوج خفيفة', so: 'Baraf fudud', kea: 'Névi fraku' },
  'snow showers': { en: 'Snow Showers', es: 'Chubascos de nieve', ht: 'Avas nèj', pt: 'Pancadas de neve', vi: 'Tuyết rào', zh: '阵雪', ar: 'زخات ثلج', so: 'Baraf goos-goos ah', kea: 'Avaseru di névi' },
  thunderstorms: { en: 'Thunderstorms', es: 'Tormentas eléctricas', ht: 'Tanpèt ak loraj', pt: 'Tempestades com trovoadas', vi: 'Dông', zh: '雷暴', ar: 'عواصف رعدية', so: 'Duufaanno onkod leh', kea: 'Tenpestadi ku trovada' },
  windy: { en: 'Windy', es: 'Ventoso', ht: 'Gen van', pt: 'Ventando', vi: 'Có gió mạnh', zh: '风大', ar: 'عاصف', so: 'Dabayl leh', kea: 'Ku ventu' },
};

const PROBABLE_TYPES = new Set(['rain', 'rain showers', 'snow', 'snow showers', 'thunderstorms']);
const CHANCE: Record<'chance' | 'slight chance', AllLanguages> = {
  chance: { en: 'Chance of {condition}', es: 'Posibilidad de {condition}', ht: 'Posiblite pou {condition}', pt: 'Possibilidade de {condition}', vi: 'Có khả năng {condition}', zh: '可能有{condition}', ar: 'احتمال {condition}', so: 'Waxaa suuragal ah {condition}', kea: 'Possibilidadi di {condition}' },
  'slight chance': { en: 'Slight chance of {condition}', es: 'Leve posibilidad de {condition}', ht: 'Ti posiblite pou {condition}', pt: 'Pequena possibilidade de {condition}', vi: 'Khả năng nhỏ có {condition}', zh: '有较小可能出现{condition}', ar: 'احتمال ضئيل لحدوث {condition}', so: 'Waxaa jirta fursad yar oo {condition}', kea: 'Pikena posibilidadi di {condition}' },
};

export function localizeShortForecast(source: string, language: LanguageCode): { text: string; language: LanguageCode } {
  if (language === 'en' || !source.trim()) return { text: source, language: 'en' };
  const normalized = source.trim().replace(/\s+/g, ' ').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(EXACT, normalized)) return { text: EXACT[normalized][language], language };
  const match = /^(slight chance|chance) (.+)$/.exec(normalized);
  if (match && PROBABLE_TYPES.has(match[2])) {
    // The noun follows a sentence template; do not change or infer probability.
    const condition = EXACT[match[2]][language].toLowerCase();
    return { text: CHANCE[match[1] as keyof typeof CHANCE][language].replace('{condition}', condition), language };
  }
  return { text: source, language: 'en' };
}
