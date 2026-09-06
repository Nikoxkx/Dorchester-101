#!/usr/bin/env python3
"""Strip English fallback arguments from t() calls and remap retired keys.

`t('news.title', 'News & Updates')` looks defensive and is actually a leak: the
second argument is unreachable for every language but English, and on an
untranslated key it silently renders English under a Spanish interface. The
dictionary is the only source of copy now, so the fallbacks go away and the
keys they used must exist.

Usage: python3 scripts/i18n-sweep.py [--apply]
"""
import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
EN_PATH = ROOT / "src" / "i18n" / "en.ts"
LOCALE_FILES = ["es", "ht", "pt", "vi", "zh", "ar", "so", "kea"]

# Retired keys and the live key that replaces them.
ALIASES = {
    "common.search": "search.placeholder",
    "news.justNow": "time.justNow",
    "news.hoursAgo": "time.hoursAgo",
    "news.yesterday": "time.yesterday",
    "news.daysAgo": "time.daysAgo",
    "news.loading": "common.loading",
    "news.allNews": "common.all",
    "news.sources": "common.sources",
    "news.noNewsCategory": "news.empty",
    "news.allNews": "common.all",
    "news.sources": "common.sources",
    "news.noNewsCategory": "news.empty",
    "news.tryDifferent": "common.tryAnotherFilter",
    "news.latest24h": "news.last24h",
    "news.new": "news.badgeNew",
    "news.verified": "news.fromPublisher",
    "news.liveUpdates": "news.liveFeed",
    "news.loading": "common.loading",
    "news.lastRefresh": "common.updated",
    "faq.housing": "faq.topic.housing",
    "projects.dataSource": "projects.source",
    "news.sourcesDesc": "news.sourcesNote",
    "news.autoRefreshNote": "news.autoRefreshed",
    "news.autoUpdates": "news.autoRefreshed",
    "common.search": "search.placeholder",
}

CALL = re.compile(r"\bt\(\s*'([^']+)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\")\s*\)")


def load_keys() -> set[str]:
    en = EN_PATH.read_text()
    return set(re.findall(r"^\s{2}'([^']+)':", en, re.M))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    keys = load_keys()
    missing: dict[str, str] = {}
    changed = 0
    for path in sorted((ROOT / "src").rglob("*.tsx")) + sorted((ROOT / "src").rglob("*.ts")):
        if str(path).endswith("i18n/en.ts"):
            continue
        source = path.read_text()

        def replace(match: re.Match) -> str:
            nonlocal changed
            key = match.group(1)
            fallback = match.group(2) or match.group(3) or ""
            target = ALIASES.get(key, key)
            if target not in keys:
                missing.setdefault(target, fallback)
                return match.group(0)
            changed += 1
            return f"t('{target}')"

        updated = CALL.sub(replace, source)
        if updated != source and args.apply:
            path.write_text(updated)

    print(f"call sites updated: {changed}")
    if missing:
        print("keys still to add:")
        for k, v in sorted(missing.items()):
            print(f"  {k}: {v}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
