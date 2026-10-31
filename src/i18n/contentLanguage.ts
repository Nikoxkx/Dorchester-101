import type { LanguageCode } from './config';

/** BCP-47 regional tags such as es-MX are still Spanish. Unknown (`und`) is
 * never treated as the reader's language. */
export function matchesContentLanguage(contentLanguage: string | undefined, selected: LanguageCode): boolean {
  const tag = (contentLanguage ?? 'und').trim().toLowerCase();
  return tag === selected || tag.startsWith(`${selected}-`);
}
