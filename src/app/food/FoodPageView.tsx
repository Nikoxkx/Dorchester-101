"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Apple,
  Clock,
  MapPin,
  Phone,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ReportProblem } from "@/components/a11y/ReportProblem";
import { useI18n } from "@/i18n/hook";
import { spokenLanguage } from "@/i18n/spokenLanguages";
import { resourceDetails } from "@/i18n/resourceDetails";
import { useAppStore } from "@/stores/appStore";
import { useBadgeStore } from "@/stores/badgeStore";
import {
  RESOURCES,
  isResourceMappable,
  verificationAge,
  verificationLevel,
  type ResourceRecord,
} from "@/data/resources";
import {
  BOSTON_TZ,
  formatClockMinutesForLocale,
  formatWindowForLocale,
  formatWeekdayIndex,
  zonedParts,
  isOpenNow,
  statusFor,
  windowsForDay,
} from "@/lib/hours";
import { useHydratedNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/en";

/**
 * Food help in Dorchester.
 *
 * The cards are derived from the directory dataset, and the open/closed state is
 * computed from each record's own hours in Boston time. An earlier version of this
 * page answered "is it open?" with a function that returned true for any day that
 * was not marked Closed, which is worse than saying nothing: a person who travels
 * to a pantry at 9 PM because a website said it was open has lost an evening.
 */

type FoodKind = "pantry" | "finder" | "market" | "other";

const KIND_KEYS: Record<FoodKind, TranslationKey> = {
  pantry: "food.type.pantry",
  finder: "food.type.finder",
  market: "food.type.market",
  other: "food.type.other",
};

// Explicit types avoid calling a hotline, warehouse finder or paid shop a pantry.
// Newly added records default to the neutral label until reviewed.
const FOOD_KINDS: Record<string, FoodKind> = {
  'gbfb-dorchester': 'finder',
  'bostons-food-district': 'finder',
  'fair-foods-lena-park': 'market',
  'dorchester-food-coop': 'market',
  'codman-square-community-market': 'pantry',
};
function classifyFood(record: ResourceRecord): FoodKind {
  return FOOD_KINDS[record.id] ?? 'other';
}

const FOOD = RESOURCES.filter((record) => record.category === "food");

export default function FoodPageView() {
  const { t, lang, meta, format, pickContent } = useI18n();
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const earnBadge = useBadgeStore((s) => s.earn);
  useEffect(() => {
    earnBadge("food-finder");
  }, [earnBadge]);
  // Deep links (?q=, ?place=) seed the search box; later URL changes are applied
  // during render by comparing against the last seen params, no effect needed.
  const seedFromParams = (params: URLSearchParams) => {
    const place = params.get("place");
    if (place) {
      const record = FOOD.find((item) => item.id === place);
      if (record) return record.name;
    }
    return params.get("q") ?? "";
  };
  const [query, setQuery] = useState(() => seedFromParams(searchParams));
  const [seenParams, setSeenParams] = useState(searchParams.toString());
  if (searchParams.toString() !== seenParams) {
    setSeenParams(searchParams.toString());
    const seeded = seedFromParams(searchParams);
    if (seeded) setQuery(seeded);
  }
  const [kind, setKind] = useState<FoodKind | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);
  const nowMs = useHydratedNow(60_000);
  const now = useMemo(() => nowMs === null ? null : new Date(nowMs), [nowMs]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FOOD.map((record) => {
      const status = record.hours && now
        ? statusFor(record.hours, now, BOSTON_TZ)
        : null;
      return {
        record,
        kind: classifyFood(record),
        status,
        open: record.hours && now ? isOpenNow(record.hours, now, BOSTON_TZ) : null,
        today: record.hours && now
          ? windowsForDay(record.hours, zonedParts(now, BOSTON_TZ).weekday)
          : [],
        summary: pickContent(record.summary),
        details: resourceDetails(record, lang),
        level: now ? verificationLevel(record, now) : record.verification.status === 'needs-review' ? 'stale' : null,
        age: now ? verificationAge(record, now) : 0,
      };
    })
      .filter((row) => (kind === "all" ? true : row.kind === kind))
      .filter((row) => (openOnly ? row.open === true : true))
      .filter((row) =>
        needle
          ? `${row.record.name} ${row.record.address} ${row.record.neighborhood} ${row.record.summary.en} ${row.summary.value} ${row.details.address.value} ${row.details.neighborhood.value} ${row.details.operator.value ?? ''} ${row.details.hoursNote.value ?? ''} ${row.details.eligibility.value ?? ''} ${row.details.transit.value ?? ''} ${row.details.services.value.join(' ')}`
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort((a, b) => {
        const rank = (open: boolean | null) => open === true ? 0 : open === false ? 1 : 2;
        if (a.open !== b.open) return rank(a.open) - rank(b.open);
        return a.record.name.localeCompare(b.record.name, meta.intlLocale);
      });
  }, [query, kind, openOnly, now, meta.intlLocale, pickContent, lang]);

  const counts = useMemo(() => {
    const map = new Map<FoodKind, number>();
    for (const record of FOOD) {
      const key = classifyFood(record);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, []);

  const openCount = rows.filter((row) => row.open === true).length;

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <Apple className="h-3.5 w-3.5" aria-hidden="true" />
              {t("food.title")}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
              {t("food.title")}
            </h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {t("food.description")}
            </p>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {t("food.resultsCount", {
              shown: String(rows.length),
              total: String(FOOD.length),
            })}
            {now && rows.length > 0
              ? ` · ${t("clothing.openNow")}: ${format.number(openCount)}`
              : ""}
          </p>
        </header>
        {lang !== 'en' && <p className="max-w-prose text-xs text-[var(--color-text-muted)]">{t('clothing.translationDraft')}</p>}

        <Card className="border-[var(--color-accent-secondary)]/25 bg-[var(--color-accent-secondary)]/8">
          <CardContent className="flex flex-col items-start gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">
                {t("food.needFoodToday")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {t("food.callHotline")}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                {t("food.hotlineHours")}
              </p>
            </div>
            <a
              href="tel:18006458333"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 font-heading text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              1-800-645-8333
            </a>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2.5">
          <label className="relative flex items-center">
            <span className="sr-only">{t("food.search")}</span>
            <Search
              className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("food.search")}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ps-9 pe-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-accent-primary)]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("food.filterType")}
            </span>
            <Chip
              active={kind === "all"}
              onClick={() => setKind("all")}
              label={t("common.all")}
              count={FOOD.length}
            />
            {(Object.keys(KIND_KEYS) as FoodKind[]).filter((key) => (counts.get(key) ?? 0) > 0).map((key) => (
              <Chip
                key={key}
                active={kind === key}
                onClick={() => setKind(key)}
                label={t(KIND_KEYS[key])}
                count={counts.get(key) ?? 0}
              />
            ))}
            <label className="ms-auto inline-flex cursor-pointer items-center gap-1.5 font-heading text-xs font-semibold text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--color-accent-primary)]"
              />
              {t("map.openNowOnly")}
            </label>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
            {t("resources.empty")}
          </p>
        ) : (
          <ul className="grid gap-3 xl:grid-cols-2">
            {rows.map(
              ({
                record,
                kind: rowKind,
                status,
                open,
                today,
                summary,
                details,
                level,
                age,
              }) => (
                <li key={record.id}>
                  <motion.article
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
                        <h3 className="font-heading text-base font-bold leading-snug">
                          {record.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                          <span lang={details.neighborhood.used} dir="auto">{details.neighborhood.value}</span>
                          {record.operator && <> · <span lang={details.operator.used} dir="auto">{details.operator.value}</span></>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(record.id)}
                        aria-pressed={favorites.includes(record.id)}
                        className="rounded-full border border-[var(--color-border)] px-2.5 py-1 font-heading text-[11px] font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
                      >
                        {favorites.includes(record.id)
                          ? t("common.saved")
                          : t("common.save")}
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="blue">{t(KIND_KEYS[rowKind])}</Badge>
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
                      {record.acceptsEbt && (
                        <Badge variant="green">{t("food.ebt")}</Badge>
                      )}
                      {record.requiresId === false && (
                        <Badge variant="default">{t("clothing.noId")}</Badge>
                      )}
                      {record.requiresId === true && (
                        <Badge variant="amber">{t("food.idRequired")}</Badge>
                      )}
                      {level && level !== "fresh" && (
                        <Badge variant="amber">
                          {t("directory.needsReview")}{age > 0 ? ` · ${t("time.daysAgo", { count: format.number(age) })}` : ''}
                        </Badge>
                      )}
                    </div>

                    <p
                      className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                      dir="auto"
                      lang={summary.used}
                    >
                      {summary.value}
                    </p>
                    {summary.fellBack && <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{t('lang.untranslated', { language: meta.nativeName })}</p>}

                    {(details.neighborhood.fellBack || details.address.fellBack || details.operator.fellBack || details.hoursNote.fellBack || details.transit.fellBack) && (
                      <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">{t("lang.detailsEnglish")}</p>
                    )}
                    <dl className="mt-3 grid gap-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                          aria-hidden="true"
                        />
                        <span lang={details.address.used} dir="auto">{details.address.value}</span>
                      </div>
                      {record.phone && (
                        <div className="flex items-center gap-2">
                          <Phone
                            className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                            aria-hidden="true"
                          />
                          <a
                            href={`tel:${record.phone.replace(/[^\d+]/g, "")}`}
                            className="font-heading font-bold text-[var(--color-accent-primary)] hover:underline"
                          >
                            {record.phone}
                          </a>
                          {record.tty && (
                            <span className="text-[var(--color-text-muted)]">
                              TTY {record.tty}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Clock
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                          aria-hidden="true"
                        />
                        <span>
                          {record.hours
                            ? !now
                              ? t("common.loading")
                              : today.length > 0
                              ? today
                                  .map((window) => formatWindowForLocale(window, meta.intlLocale))
                                  .join(", ")
                              : status &&
                                  status.state === "closed" &&
                                  status.opensOnDayOffset > 0
                                ? // Nothing today, so name the day it reopens. A place
                                  // that never lists hours must not read as "midnight".
                                  status.opensOnDayOffset === 1
                                  ? t("food.opensTomorrow", {
                                      time: formatClockMinutesForLocale(status.opensAt, meta.intlLocale),
                                    })
                                  : t("time.opensOn", {
                                      day: formatWeekdayIndex(zonedParts(now, BOSTON_TZ).weekday + status.opensOnDayOffset, meta.intlLocale),
                                      time: formatClockMinutesForLocale(status.opensAt, meta.intlLocale),
                                    })
                                : t("directory.closedToday")
                            : t("food.hoursUnknown")}
                          {record.hoursNote ? (
                            <span lang={details.hoursNote.used} dir="auto" className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
                              {details.hoursNote.value}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      {record.transit && (
                        <div className="flex items-start gap-2">
                          <UtensilsCrossed
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                            aria-hidden="true"
                          />
                          <span className="text-[var(--color-text-secondary)]">
                            <span className="font-heading font-bold text-[var(--color-text-muted)]">
                              {t("food.transitAccess")}:{" "}
                            </span>
                            <span lang={details.transit.used} dir="auto">{details.transit.value}</span>
                          </span>
                        </div>
                      )}
                      {record.languages && record.languages.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {t("resources.languages")}:{" "}
                            {record.languages.map((name) => spokenLanguage(name, t)).join(", ")}
                          </span>
                        </div>
                      )}
                    </dl>

                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--color-border)] pt-2.5 text-[11px]">
                      <span className="text-[var(--color-text-muted)]">
                        {t("resources.checkedOn", {
                          date: format.date(
                            record.verification.checkedOn,
                            "medium",
                          ),
                        })}
                      </span>
{isResourceMappable(record) && (
                      <Link
                        href={`/map?place=${record.id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("directory.openMap")}
                      </Link>
                      )}
                      <Link
                        href={`/resources?place=${record.id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("common.moreInfo")}
                      </Link>
                      {open === null && !record.hours && (
                        <span className="ms-auto text-[var(--color-text-muted)]">
                          {t("directory.noHours")}
                        </span>
                      )}
                    </div>
                  </motion.article>
                </li>
              ),
            )}
          </ul>
        )}

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-sm font-bold">
            {t("about.corrections")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {t("food.callHotline")} {t("directory.staleWarning")}
          </p>
          <div className="mt-2.5">
            <ReportProblem />
          </div>
        <ProjectNote sources={['gbfb', 'dta', 'bostongov', 'dor101']}>
          {t('note.food')}
        </ProjectNote>
        </section>
      </div>
    </MainLayout>
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
