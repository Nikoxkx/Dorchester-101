import { beforeEach, describe, expect, it } from 'vitest';
import { FONT_SIZE_VALUES, useAppStore } from '@/stores/appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: 'system',
      language: 'en',
      fontSize: 'medium',
      lastUpdated: null,
      reduceMotion: false,
    });
  });

  it('defaults to English and system theme', () => {
    const state = useAppStore.getState();
    expect(state.language).toBe('en');
    expect(state.theme).toBe('system');
  });

  it('sets language', () => {
    useAppStore.getState().setLanguage('es');
    expect(useAppStore.getState().language).toBe('es');
  });

  it('sets theme', () => {
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('maps font sizes to CSS pixels', () => {
    expect(FONT_SIZE_VALUES.medium).toBe('16px');
    expect(FONT_SIZE_VALUES['extra-large']).toBe('20px');
  });
});
