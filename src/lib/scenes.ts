/**
 * Theme scenes: whole-site restyles that change colors, fonts, the
 * background picture and the small ambient animations in one choice
 * (Settings → Appearance → Theme scenes). A scene is a layer *above* the
 * palette/surface system: `classic` means "my own palette, untouched",
 * while a named scene swaps the design tokens through `data-scene` rules
 * in globals.css and mounts its decorations (bats, snowfall, leaves).
 *
 * `auto` is the seasonal scene: it follows the Boston calendar, so the
 * site dresses itself for October without anyone flipping a switch.
 */
import { BOSTON_TZ } from './hours';

export type SceneSetting = 'classic' | 'auto' | 'halloween' | 'first-snow' | 'autumn' | 'harbor-sunset';
export type ResolvedScene = Exclude<SceneSetting, 'auto'>;

export const SCENE_SETTINGS: SceneSetting[] = ['classic', 'auto', 'halloween', 'first-snow', 'autumn', 'harbor-sunset'];

export interface SceneMeta {
  id: SceneSetting;
  /** Force the dark token set regardless of the light/dark toggle. */
  forcedDark?: boolean;
  /** Surface treatment the scene is designed around. */
  surface?: 'solid' | 'glass' | 'frost' | 'tinted' | 'aurora';
  /** Ambient decoration kind rendered by <SceneDecor/>. */
  decor: 'none' | 'bats' | 'snow' | 'leaves' | 'embers';
}

export const SCENES: Record<ResolvedScene, SceneMeta> = {
  classic: { id: 'classic', decor: 'none' },
  halloween: { id: 'halloween', forcedDark: true, surface: 'glass', decor: 'bats' },
  'first-snow': { id: 'first-snow', surface: 'frost', decor: 'snow' },
  autumn: { id: 'autumn', surface: 'tinted', decor: 'leaves' },
  'harbor-sunset': { id: 'harbor-sunset', surface: 'aurora', decor: 'embers' },
};

/** The scene the Boston calendar calls for right now. */
export function seasonalScene(now = new Date()): ResolvedScene {
  const month = Number(new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: BOSTON_TZ }).format(now));
  if (month === 10) return 'halloween';
  if (month === 12 || month === 1 || month === 2) return 'first-snow';
  if (month === 9 || month === 11) return 'autumn';
  if (month === 6 || month === 7 || month === 8) return 'harbor-sunset';
  return 'classic';
}

export function resolveScene(setting: SceneSetting, now = new Date()): ResolvedScene {
  return setting === 'auto' ? seasonalScene(now) : setting;
}

/** True when a named scene is the one the calendar currently calls for. */
export function isInSeason(scene: SceneSetting, now = new Date()): boolean {
  return scene !== 'classic' && scene !== 'auto' && seasonalScene(now) === scene;
}
