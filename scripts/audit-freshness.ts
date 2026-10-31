import { RESOURCES, verificationAge, verificationLevel } from '../src/data/resources';
import { WINTER_CLOTHING, clothingCheckedAge, clothingCheckLevel } from '../src/data/winterClothing';
import { PROJECTS } from '../src/app/projects/projectsData';
import { TRANSIT_DATA_AS_OF } from '../src/data/transit';
import { REVIEW_FOCUS } from '../src/data/reviewFocus';

/**
 * Signals for an editor, not a fact checker. Never rewrite eligibility, hours,
 * translations or provider claims based on HTTP status or an automated guess.
 */
const DAY = 86_400_000;
const USER_AGENT = 'DOR101-freshness-monitor/1.0 (https://github.com/Nikoxkx/Dorchester-101)';
const age = (date: string, now: Date) => Math.floor((now.getTime() - new Date(date).getTime()) / DAY);
const daysLabel = (value: number) => Number.isFinite(value) ? `${value} days` : 'invalid date';
const markdown = (value: string) => value.replace(/[\[\]]/g, '');
const reviewReason = (status: 'verified' | 'needs-review', level: 'fresh' | 'stale' | 'critical') =>
  status === 'needs-review'
    ? level === 'critical' ? 'marked for review; critical age or invalid date' : 'marked for review'
    : level === 'critical' ? 'critical age or invalid date' : 'review date is old or in the future';

type Check = { url: string; result: string };

async function checkUrl(url: string): Promise<Check> {
  // Only committed provider/project URLs are checked; never user-supplied feeds.
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(6_000), headers: { 'user-agent': USER_AGENT } });
    if (response.status === 405 || response.status === 501) {
      await response.body?.cancel();
      response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(6_000), headers: { 'user-agent': USER_AGENT } });
    }
    const status = response.status;
    await response.body?.cancel();
    if (status >= 200 && status < 400) return { url, result: `HTTP ${status} (reachable only; facts unverified)` };
    if (status === 404 || status === 410) return { url, result: `HTTP ${status} (page may have moved or disappeared)` };
    return { url, result: `HTTP ${status} (inconclusive; check manually)` };
  } catch {
    return { url, result: 'unreachable from the monitor (inconclusive; check manually)' };
  }
}

/** Bounded concurrency prevents a scheduled check from hammering providers. */
async function checkSources(urls: string[]): Promise<Check[]> {
  const results: Check[] = [];
  for (let i = 0; i < urls.length; i += 4) results.push(...await Promise.all(urls.slice(i, i + 4).map(checkUrl)));
  return results;
}

export async function freshnessReport(now = new Date(), options: { offline?: boolean } = {}): Promise<string> {
  const resources = RESOURCES.filter((record) => verificationLevel(record, now) !== 'fresh');
  const clothing = WINTER_CLOTHING.filter((record) => clothingCheckLevel(record, now) !== 'fresh');
  const projects = PROJECTS.filter((project) => {
    const days = age(project.lastChecked, now);
    return !Number.isFinite(days) || days < 0 || days > 45 || Boolean(project.expectedCompletion && project.expectedCompletion <= now.toISOString().slice(0, 10));
  });
  const transitAge = age(TRANSIT_DATA_AS_OF, now);
  const urls = [...new Set([
    ...RESOURCES.flatMap((record) => record.website ? [record.website] : []),
    ...WINTER_CLOTHING.map((record) => record.website),
    ...PROJECTS.flatMap((project) => [project.articleUrl, project.applicationSourceUrl]),
  ])].filter((url) => /^https?:\/\//i.test(url));
  const checks = options.offline ? [] : await checkSources(urls);
  const needingSourceCheck = checks.filter((check) => !check.result.startsWith('HTTP 2') && !check.result.startsWith('HTTP 3'));
  const lines = [
    '# Automated freshness review',
    '<!-- dor101-freshness-review -->',
    '',
    `Generated: ${now.toISOString()}`,
    '',
    '**This is a review queue, not a verification or a content update.** Live API data refreshes separately. HTTP reachability cannot establish current hours, eligibility, safety, availability, legal rules, accessibility or image rights. Check with the original providers and update every affected translation and test.',
    '',
    `## Community resources needing review (${resources.length}/${RESOURCES.length})`,
    ...resources.map((r) => `- **${markdown(r.name)}** — ${reviewReason(r.verification.status, verificationLevel(r, now))}; checked ${r.verification.checkedOn} (${daysLabel(verificationAge(r, now))})${r.website ? `; [provider](${r.website})` : ''}. ${REVIEW_FOCUS[r.id] ?? 'Recheck the published facts, source and translations.'}`),
    ...(resources.length ? [] : ['- No resource age/status flags today.']),
    '',
    `## Clothing records needing review (${clothing.length}/${WINTER_CLOTHING.length})`,
    ...clothing.map((r) => `- **${markdown(r.name)}** — ${reviewReason(r.verification.status, clothingCheckLevel(r, now))}; checked ${r.verification.checkedOn} (${daysLabel(clothingCheckedAge(r, now))}); [provider](${r.website}). ${REVIEW_FOCUS[r.id] ?? 'Recheck the published facts, source and translations.'}`),
    ...(clothing.length ? [] : ['- No clothing age/status flags today.']),
    '',
    `## Project dates and records to review (${projects.length}/${PROJECTS.length})`,
    ...projects.map((p) => `- **${markdown(p.name)}** — checked ${p.lastChecked}; projected completion ${p.expectedCompletion ?? 'not specified'}; [project source](${p.articleUrl}) and [application source](${p.applicationSourceUrl}). Confirm status and application information.`),
    ...(projects.length ? [] : ['- No project age/completion flags today.']),
    '',
    '## Transit reference',
    `- Static fallback reference dated ${TRANSIT_DATA_AS_OF} (${daysLabel(transitAge)}). ${transitAge < 0 || !Number.isFinite(transitAge) || transitAge > 90 ? 'Review routes, stops and connections with MBTA.' : 'Live MBTA data is separate; confirm before travel.'}`,
    '',
    `## Source reachability ${options.offline ? '(not checked in offline mode)' : `(${needingSourceCheck.length} inconclusive or potentially missing / ${checks.length} checked)`}`,
    ...(options.offline ? ['- Online checks were skipped.'] : needingSourceCheck.length ? needingSourceCheck.map((c) => `- ${c.url} — ${c.result}`) : ['- No source reachability flags. A successful response is not fact verification.']),
    '',
    'Review sources manually, record the actual review date, and keep the public warnings until verified. Do not advance dates merely because this job ran.',
  ];
  return `${lines.join('\n')}\n`;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('/audit-freshness.ts')) {
  freshnessReport(new Date(), { offline: process.argv.includes('--offline') }).then((report) => process.stdout.write(report)).catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
