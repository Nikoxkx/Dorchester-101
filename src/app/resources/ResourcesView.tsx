"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Accessibility,
  Bookmark,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Badge } from "@/components/ui/Badge";
import { ReportProblem } from "@/components/a11y/ReportProblem";
import { ListenButton } from "@/components/a11y/ListenButton";
import { QRPoster } from "@/components/resources/QRPoster";
import { VerifyButton } from "@/components/resources/VerifyButton";
import { FieldNotes } from "@/components/pwa/FieldNotes";
import { useI18n } from "@/i18n/hook";
import { spokenLanguage } from "@/i18n/spokenLanguages";
import { resourceDetails } from "@/i18n/resourceDetails";
import { useAppStore } from "@/stores/appStore";
import { useBadgeStore } from "@/stores/badgeStore";
import {
  RESOURCES,
  isResourceMappable,
  VERIFICATION_STALE_DAYS,
  verificationAge,
  verificationLevel,
  type ResourceCategory,
} from "@/data/resources";
import {
  BOSTON_TZ,
  formatClockMinutesForLocale,
  formatWindowForLocale,
  formatWeekdayIndex,
  zonedParts,
  isOpenNow,
  statusFor,
} from "@/lib/hours";
import { useHydratedNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/en";

/**
 * The directory card view.
 *
 * It reads `src/data/resources.ts` — the same records the map pins, the printable
 * table and the search index use. There is no second copy of an address or a
 * phone number here, which is how the earlier version of this page ended up
 * printing "Verified January 2025" next to data that had been checked in August.
 * The stamp on each card is computed from the record's own `checkedOn` date.
 */

const CATEGORY_KEYS: Record<ResourceCategory, TranslationKey> = {
  housing: "map.housing",
  food: "map.food",
  health: "map.health",
  legal: "map.legal",
  community: "map.community",
  school: "map.school",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_KEYS) as ResourceCategory[];

export function ResourcesView() {
  const { t, lang, meta, format, pickContent } = useI18n();
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const earnBadge = useBadgeStore((s) => s.earn);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [stepFreeOnly, setStepFreeOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const nowMs = useHydratedNow(60_000);
  const now = useMemo(() => nowMs === null ? null : new Date(nowMs), [nowMs]);

  // /resources?place=foodsolving or a search term from the header's palette lands
  // the reader on the record they asked for instead of the top of an unfiltered list.
  const [seenParams, setSeenParams] = useState<string | null>(null);
  if (searchParams.toString() !== seenParams) {
    setSeenParams(searchParams.toString());
    const place = searchParams.get("place");
    const q = searchParams.get("q");
    if (place) {
      const record = RESOURCES.find((resource) => resource.id === place);
      if (record) {
        setQuery(record.name);
        setExpanded(record.id);
        setCategory("all");
      }
    } else if (q) {
      setQuery(q);
    }
  }

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RESOURCES.map((resource) => {
      const status = resource.hours && now
        ? statusFor(resource.hours, now, BOSTON_TZ)
        : null;
      return {
        resource,
        status,
        open: resource.hours && now ? isOpenNow(resource.hours, now, BOSTON_TZ) : null,
        age: now ? verificationAge(resource, now) : 0,
        level: now ? verificationLevel(resource, now) : resource.verification.status === 'needs-review' ? 'stale' : null,
        summary: pickContent(resource.summary),
        details: resourceDetails(resource, lang),
      };
    })
      .filter((row) =>
        category === "all" ? true : row.resource.category === category,
      )
      .filter((row) =>
        stepFreeOnly ? isResourceMappable(row.resource) && row.resource.accessibility?.stepFree === true : true,
      )
      .filter((row) => {
        if (!needle) return true;
        return [
          row.resource.name,
          row.resource.operator ?? "",
          row.details.operator.value ?? "",
          row.resource.address,
          row.details.address.value,
          row.resource.neighborhood,
          row.resource.summary.en,
          row.summary.value,
          row.resource.services.join(" "),
          row.details.services.value.join(" "),
          row.details.neighborhood.value,
          row.details.eligibility.value ?? "",
          row.details.hoursNote.value ?? "",
          row.details.transit.value ?? "",
          row.resource.languages?.join(" ") ?? "",
          row.resource.languages?.map((name) => spokenLanguage(name, t)).join(" ") ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => {
        // Open now first, then the nearest transit, then the name: the order a
        // person standing on a sidewalk actually needs.
        const openRank = (open: boolean | null) => open === true ? 0 : open === false ? 1 : 2;
        if (a.open !== b.open) return openRank(a.open) - openRank(b.open);
        const rank = (level: typeof a.level) => level === 'fresh' ? 0 : level === null ? 1 : 2;
        if (rank(a.level) !== rank(b.level)) return rank(a.level) - rank(b.level);
        return a.resource.name.localeCompare(b.resource.name, lang);
      });
  }, [category, stepFreeOnly, query, now, lang, pickContent, t]);

  const toggle = useCallback(
    (id: string) => toggleFavorite(id),
    [toggleFavorite],
  );
  const bostonDay = now ? zonedParts(now, BOSTON_TZ).weekday : 0;
  const dayOrder = Array.from({ length: 7 }, (_, index) => (bostonDay + index) % 7);
  const dayNames = dayOrder.map((day) => formatWeekdayIndex(day, meta.intlLocale, 'short'));

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
              {t("resources.title")}
            </h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {t("resources.description")}
            </p>
          </div>
          <Link
            href="/directory"
            className="self-start rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] md:self-auto"
          >
            {t("directory.title")}
          </Link>
        </header>
        {lang !== 'en' && <p className="max-w-prose text-xs text-[var(--color-text-muted)]">{t('clothing.translationDraft')}</p>}

        <section className="rounded-2xl border border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/8 p-4">
          <h2 className="font-heading text-base font-bold">
            {t("resources.notSure")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t("resources.call211")}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <a
              href="tel:211"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              2-1-1
            </a>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2 font-heading text-sm font-bold transition-colors hover:border-[var(--color-accent-primary)]"
            >
              {t("nav.faq")}
            </Link>
          </div>
        </section>

        <div className="flex flex-col gap-2.5">
          <label className="relative flex items-center">
            <span className="sr-only">{t("resources.search")}</span>
            <Search
              className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("resources.search")}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ps-9 pe-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-accent-primary)]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <Chip
              active={category === "all"}
              onClick={() => setCategory("all")}
              label={t("common.all")}
              count={RESOURCES.length}
            />
            {CATEGORY_ORDER.map((key) => (
              <Chip
                key={key}
                active={category === key}
                onClick={() => {
                  setCategory(key);
                  if (key === "food") earnBadge("food-finder");
                }}
                label={t(CATEGORY_KEYS[key])}
                count={
                  RESOURCES.filter((resource) => resource.category === key)
                    .length
                }
              />
            ))}
            <span
              className="mx-1 hidden h-4 w-px bg-[var(--color-border)] sm:block"
              aria-hidden="true"
            />
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-heading text-xs font-semibold text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={stepFreeOnly}
                onChange={(event) => setStepFreeOnly(event.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--color-accent-primary)]"
              />
              {t("resources.stepFreeOnly")}
            </label>
            <span className="ms-auto text-[11px] tabular-nums text-[var(--color-text-muted)]">
              {t("resources.count", { count: String(rows.length) })} ·{" "}
              {t("directory.langNote", { language: meta.name })}
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-10 text-center">
            <p className="font-heading text-sm font-bold">
              {t("resources.empty")}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setStepFreeOnly(false);
              }}
              className="mt-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
            >
              {t("common.clearFilters")}
            </button>
          </div>
        ) : (
          <ul className="grid gap-3 xl:grid-cols-2">
            {rows.map(({ resource, status, open, age, level, summary, details }) => {
              const id = resource.id;
              const isExpanded = expanded === id;
              const saved = favorites.includes(id);
              return (
                <li key={id}>
                  <motion.article
                    layout={false}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border bg-[var(--color-bg-primary)]/95 p-4",
                      !level || level === "fresh"
                        ? "border-[var(--color-border)]"
                        : "border-[var(--color-accent-amber)]/45",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-heading text-base font-bold leading-snug">
                          {resource.name}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                          {t(CATEGORY_KEYS[resource.category])}
                          {resource.operator && <> · <span lang={details.operator.used} dir="auto">{details.operator.value}</span></>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        aria-pressed={saved}
                        title={
                          saved ? t("resources.unsave") : t("resources.save")
                        }
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                          saved
                            ? "border-transparent bg-[var(--color-accent-primary)] text-white"
                            : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]",
                        )}
                      >
                        <Bookmark
                          className={cn("h-4 w-4", saved && "fill-current")}
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {saved ? t("resources.unsave") : t("resources.save")}
                        </span>
                      </button>
                    </div>

                    <p
                      className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                      dir="auto"
                      lang={summary.used}
                    >
                      {summary.value}
                    </p>
                    {summary.fellBack && (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                        {t("lang.untranslated", { language: meta.nativeName })}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {status && (
                        <Badge
                          variant={
                            (status.state === "open" || status.state === "always-open")
                              ? "green"
                              : status.state === "closing-soon"
                                ? "amber"
                                : "default"
                          }
                        >
                          {(status.state === "open" || status.state === "always-open")
                            ? t("common.open")
                            : status.state === "closing-soon"
                              ? t("common.closingSoon")
                              : t("common.closed")}
                        </Badge>
                      )}
                      {resource.acceptsEbt && (
                        <Badge variant="blue">{t("food.ebt")}</Badge>
                      )}
                      {resource.requiresId === true && (
                        <Badge variant="amber">{t("food.idRequired")}</Badge>
                      )}
                      {resource.requiresId === false && (
                        <Badge variant="default">{t("clothing.noId")}</Badge>
                      )}
                      {isResourceMappable(resource) && (resource.accessibility?.stepFree ? (
                        <Badge variant="green">{t("map.wheelchair")}</Badge>
                      ) : (
                        <Badge variant="default">
                          {t("map.wheelchairUnknown")}
                        </Badge>
                      ))}
                      {level && level !== "fresh" && (
                        <Badge variant="amber">
                          {t("directory.needsReview")}{age > 0 ? ` · ${t("time.daysAgo", { count: format.number(age) })}` : ''}
                        </Badge>
                      )}
                    </div>

                    {(details.address.fellBack || details.operator.fellBack || details.transit.fellBack || details.eligibility.fellBack || details.source.fellBack || (isExpanded && details.hoursNote.fellBack)) && (
                      <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">{t("lang.detailsEnglish")}</p>
                    )}
                    <dl className="mt-3 grid gap-1.5 text-xs">
                      <Row
                        icon={
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                        label={<span lang={details.address.used} dir="auto">{details.address.value}</span>}
                      />
                      {resource.phone && (
                        <Row
                          icon={
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                          label={
                            <a
                              href={`tel:${resource.phone.replace(/[^\d+]/g, "")}`}
                              className="font-heading font-bold text-[var(--color-accent-primary)] hover:underline"
                            >
                              {resource.phone}
                            </a>
                          }
                          extra={
                            resource.tty ? `TTY ${resource.tty}` : undefined
                          }
                        />
                      )}
                      <Row
                        icon={
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                        label={
                          resource.hours
                            ? !now
                              ? t("common.loading")
                              : resource.hours[dayOrder[0]].length
                                ? `${t("directory.openToday")}: ${resource.hours[dayOrder[0]].map((window) => formatWindowForLocale(window, meta.intlLocale)).join(", ")}`
                                : t("directory.closedToday")
                            : t("food.hoursUnknown")
                        }
                      />
                      {resource.languages && resource.languages.length > 0 && (
                        <Row
                          icon={
                            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                          label={`${t("resources.languages")}: ${resource.languages.map((name) => spokenLanguage(name, t)).join(", ")}`}
                        />
                      )}
                      {resource.transit && (
                        <Row
                          icon={
                            <Accessibility
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          }
                          label={<>{t("food.transitAccess")}: <span lang={details.transit.used} dir="auto">{details.transit.value}</span></>}
                        />
                      )}
                    </dl>

                    {resource.eligibility && (
                      <p className="mt-2.5 rounded-xl bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs leading-relaxed">
                        <span className="font-heading font-bold">
                          {t("common.eligibility")}:{" "}
                        </span>
                        <span lang={details.eligibility.used} dir="auto">{details.eligibility.value}</span>
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <ListenButton text={`${resource.name}. ${summary.value}. ${details.address.value}.`} />
                      <QRPoster
                        id={id}
                        name={resource.name}
                        address={details.address.value}
                        phone={resource.phone}
                        summary={summary.value}
                      />
                      <VerifyButton resourceId={id} />
                      <FieldNotes scope={`resource-${id}`} compact />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--color-border)] pt-2.5 text-[11px]">
                      <span className="text-[var(--color-text-muted)]">
                        {t("resources.checkedOn", {
                          date: format.date(
                            resource.verification.checkedOn,
                            "medium",
                          ),
                        })}
                        {resource.verification.source && <> · {t("common.source")}: <span lang={details.source.used} dir="auto">{details.source.value}</span></>}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : id)}
                        aria-expanded={isExpanded}
                        aria-controls={`hours-${id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("directory.allHours")}
                      </button>
{isResourceMappable(resource) && (
                      <Link
                        href={`/map?place=${id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("directory.openMap")}
                      </Link>
                      )}
                      {resource.website && (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="ms-auto inline-flex items-center gap-1 font-heading font-bold text-[var(--color-accent-primary)] hover:underline"
                        >
                          {t("common.website")}{" "}
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                      )}
                    </div>

                    {isExpanded && (
                      <div
                        id={`hours-${id}`}
                        className="mt-2 rounded-xl border border-[var(--color-border)] p-2.5"
                      >
                        <table className="w-full text-[11px]">
                          <caption className="sr-only">
                            {t("directory.allHours")}
                          </caption>
                          <tbody>
                            {resource.hours ? (
                              dayOrder.map((dayIndex, position) => (
                                <tr key={dayIndex}>
                                  <th
                                    scope="row"
                                    className="py-0.5 pe-2 text-start font-heading font-bold text-[var(--color-text-muted)]"
                                  >
                                    {dayNames[position]}
                                  </th>
                                  <td className="py-0.5 tabular-nums">
                                    {resource.hours![dayIndex].length
                                      ? resource
                                          .hours![dayIndex].map((window) =>
                                            formatWindowForLocale(window, meta.intlLocale),
                                          )
                                          .join(", ")
                                      : t("common.closed")}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="text-[var(--color-text-muted)]">
                                  {t("directory.noHours")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        {resource.hoursNote && (
                          <p lang={details.hoursNote.used} dir="auto" className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-secondary)]">
                            {details.hoursNote.value}
                          </p>
                        )}
                        {age > VERIFICATION_STALE_DAYS && (
                          <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[var(--color-accent-amber)]">
                            {t("directory.staleWarning")}
                          </p>
                        )}
                        {status &&
                          status.state === "closed" &&
                          status.opensOnDayOffset >= 0 && (
                            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                              {status.opensOnDayOffset === 0
                                ? t("time.opensAt", {
                                    time: formatClockMinutesForLocale(status.opensAt, meta.intlLocale),
                                  })
                                : status.opensOnDayOffset === 1
                                  ? t("food.opensTomorrow", {
                                      time: formatClockMinutesForLocale(status.opensAt, meta.intlLocale),
                                    })
                                  : t("time.opensOn", {
                                      day: formatWeekdayIndex(bostonDay + status.opensOnDayOffset, meta.intlLocale),
                                      time: formatClockMinutesForLocale(status.opensAt, meta.intlLocale),
                                    })}
                            </p>
                          )}
                      </div>
                    )}
                  </motion.article>
                </li>
              );
            })}
          </ul>
        )}

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-sm font-bold">
            {t("about.corrections")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {t("about.correctionsBody")}
          </p>
          <div className="mt-2.5">
            <ReportProblem />
          </div>
        <ProjectNote sources={['dor101', 'bostongov', 'masslegal', 'bha']}>
          {t('note.resources')}
        </ProjectNote>
        </section>
      </div>
    </MainLayout>
  );
}

function Row({
  icon,
  label,
  extra,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  extra?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-[var(--color-text-muted)]">
        {icon}
      </span>
      <span className="min-w-0 leading-snug">
        {label}
        {extra && (
          <span className="ms-1.5 text-[var(--color-text-muted)]">{extra}</span>
        )}
      </span>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-heading text-xs font-semibold transition-colors",
        active
          ? "border-transparent bg-[var(--color-accent-primary)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]",
      )}
    >
      {label}
      <span
        className={cn(
          "tabular-nums",
          active ? "text-white/80" : "text-[var(--color-text-muted)]",
        )}
      >
        {count}
      </span>
    </button>
  );
}
