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
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ReportProblem } from "@/components/a11y/ReportProblem";
import { useI18n } from "@/i18n/hook";
import { useAppStore } from "@/stores/appStore";
import {
  RESOURCES,
  verificationAge,
  verificationLevel,
  type ResourceRecord,
} from "@/data/resources";
import {
  BOSTON_TZ,
  formatClockMinutes,
  formatWindow,
  isOpenNow,
  statusFor,
  windowsForDay,
} from "@/lib/hours";
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

type FoodKind = "pantry" | "meals" | "senior" | "kids" | "benefits";

const KIND_KEYS: Record<FoodKind, TranslationKey> = {
  pantry: "food.type.pantry",
  meals: "food.type.meals",
  senior: "food.type.senior",
  kids: "food.type.kids",
  benefits: "food.type.benefits",
};

const KIND_PATTERNS: Array<[FoodKind, string[]]> = [
  ["meals", ["meal", "lunch", "dinner", "breakfast", "kitchen", "hot food"]],
  ["senior", ["senior", "elders", "age 60", "60+", "meals on wheels"]],
  ["kids", ["kids", "child", "summer food", "smp", "youth"]],
  ["benefits", ["snap", "wic", "benefit", "apply", "enrollment", "fpd"]],
  ["pantry", ["pantry", "food box", "grocer", "market", "produce"]],
];

/**
 * Classification is a keyword read of the record's own service list, not a label
 * someone typed into a card: when a program adds a service, the chip follows.
 */
function classifyFood(record: ResourceRecord): FoodKind {
  const haystack =
    `${record.name} ${record.summary.en} ${record.services.join(" ")} ${record.hoursNote ?? ""}`.toLowerCase();
  for (const [kind, words] of KIND_PATTERNS) {
    if (words.some((word) => haystack.includes(word))) return kind;
  }
  return "pantry";
}

const FOOD = RESOURCES.filter((record) => record.category === "food");

export default function FoodPageView() {
  const { t, meta, format, pickContent } = useI18n();
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<FoodKind | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
    const place = searchParams.get("place");
    if (place) {
      const record = FOOD.find((item) => item.id === place);
      if (record) setQuery(record.name);
    }
  }, [searchParams]);

  // Opening status is a moving target, so the page re-checks it every minute
  // instead of freezing whatever the first render happened to see.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FOOD.map((record) => {
      const status = record.hours
        ? statusFor(record.hours, now, BOSTON_TZ)
        : null;
      return {
        record,
        kind: classifyFood(record),
        status,
        open: record.hours ? isOpenNow(record.hours, now, BOSTON_TZ) : null,
        today: record.hours
          ? windowsForDay(record.hours, (now.getDay() + 6) % 7)
          : [],
        summary: pickContent(record.summary),
        level: verificationLevel(record, now),
        age: verificationAge(record, now),
      };
    })
      .filter((row) => (kind === "all" ? true : row.kind === kind))
      .filter((row) => (openOnly ? row.open === true : true))
      .filter((row) =>
        needle
          ? `${row.record.name} ${row.record.address} ${row.record.neighborhood} ${row.record.summary.en}`
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort((a, b) => {
        if (a.open !== b.open) return a.open === true ? -1 : 1;
        return a.record.name.localeCompare(b.record.name, meta.intlLocale);
      });
  }, [query, kind, openOnly, now, meta.intlLocale, pickContent]);

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
            {t("map.locationsShown", {
              shown: String(rows.length),
              total: String(FOOD.length),
            })}
            {rows.length > 0
              ? ` · ${t("directory.openToday")}: ${format.number(openCount)}`
              : ""}
          </p>
        </header>

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
            {(Object.keys(KIND_KEYS) as FoodKind[]).map((key) => (
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
                      level === "fresh"
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
                          {record.neighborhood}
                          {record.operator ? ` · ${record.operator}` : ""}
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
                            status.state === "open"
                              ? "green"
                              : status.state === "closing-soon"
                                ? "amber"
                                : "default"
                          }
                        >
                          {status.state === "open"
                            ? t("common.open")
                            : status.state === "closing-soon"
                              ? t("common.closingSoon")
                              : t("common.closed")}
                        </Badge>
                      )}
                      {record.acceptsEbt && (
                        <Badge variant="green">{t("food.ebt")}</Badge>
                      )}
                      {!record.requiresId && (
                        <Badge variant="default">{t("food.noDocs")}</Badge>
                      )}
                      {record.requiresId && (
                        <Badge variant="amber">{t("food.idRequired")}</Badge>
                      )}
                      {level !== "fresh" && (
                        <Badge variant="amber">
                          {t("directory.needsReview")} · {format.number(age)} d
                        </Badge>
                      )}
                    </div>

                    <p
                      className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                      dir="auto"
                    >
                      {summary.value}
                    </p>

                    <dl className="mt-3 grid gap-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
                          aria-hidden="true"
                        />
                        <span>{record.address}</span>
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
                            ? today.length > 0
                              ? today
                                  .map((window) => formatWindow(window))
                                  .join(", ")
                              : status &&
                                  status.state === "closed" &&
                                  status.opensOnDayOffset > 0
                                ? // Nothing today, so name the day it reopens. A place
                                  // that never lists hours must not read as "midnight".
                                  status.opensOnDayOffset === 1
                                  ? t("food.opensTomorrow", {
                                      time: formatClockMinutes(status.opensAt),
                                    })
                                  : t("time.opensOn", {
                                      day: format.weekday(
                                        new Date(
                                          Date.now() +
                                            status.opensOnDayOffset *
                                              86_400_000,
                                        ),
                                        "long",
                                      ),
                                      time: formatClockMinutes(status.opensAt),
                                    })
                                : t("directory.closedToday")
                            : t("food.hoursUnknown")}
                          {record.hoursNote ? (
                            <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
                              {record.hoursNote}
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
                            {record.transit}
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
                            {record.languages.join(", ")}
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
                      <Link
                        href={`/map?place=${record.id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("directory.openMap")}
                      </Link>
                      <Link
                        href={`/resources?place=${record.id}`}
                        className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                      >
                        {t("common.moreInfo")}
                      </Link>
                      {open === null && (
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
