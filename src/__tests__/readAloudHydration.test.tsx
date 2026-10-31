import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadAloudButton } from '@/components/a11y/ReadAloudButton';
import { speechVoiceMatches } from '@/hooks/useSpeechSupported';
import { dictionaries } from '@/i18n';
import { useAppStore } from '@/stores/appStore';

const voices = [
  { lang: 'fr-FR', name: 'French', voiceURI: 'french' },
  { lang: 'pt-PT', name: 'Portuguese', voiceURI: 'portuguese' },
  { lang: 'ht-HT', name: 'Haitian', voiceURI: 'haitian' },
] as SpeechSynthesisVoice[];
const synth = {
  getVoices: vi.fn(() => voices), addEventListener: vi.fn(), removeEventListener: vi.fn(),
  cancel: vi.fn(), speak: vi.fn(), pause: vi.fn(), resume: vi.fn(), speaking: false,
};
let root: Root | undefined;
let container: HTMLDivElement;

beforeEach(() => {
  useAppStore.getState().resetAll();
  vi.clearAllMocks();
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string;
    lang = '';
    voice: SpeechSynthesisVoice | null = null;
    rate = 1;
    constructor(text: string) { this.text = text; }
  });
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  if (root) act(() => root?.unmount());
  root = undefined;
  container.remove();
  delete (window as unknown as { speechSynthesis?: unknown }).speechSynthesis;
  vi.unstubAllGlobals();
});

async function hydrateReadAloud() {
  const markup = renderToString(<ReadAloudButton />);
  expect(markup).toBe('');
  container.innerHTML = markup;
  const onRecoverableError = vi.fn();
  await act(async () => { root = hydrateRoot(container, <ReadAloudButton />, { onRecoverableError }); });
  await waitFor(() => expect(screen.getByRole('button')).toBeTruthy());
  expect(onRecoverableError).not.toHaveBeenCalled();
}

describe('read-aloud capability and content language', () => {
  it('hydrates without inserting browser-only controls into the initial render', async () => {
    await hydrateReadAloud();
    expect(synth.getVoices).toHaveBeenCalled();
  });

  it('uses an actual Haitian voice, not an unrelated saved French voice', async () => {
    useAppStore.getState().setLanguage('ht');
    useAppStore.getState().setSpeechVoiceURI('french');
    await hydrateReadAloud();
    const content = document.createElement('main');
    content.id = 'main';
    content.textContent = 'Bonjou tout moun.';
    document.body.appendChild(content);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.ht['a11y.readAloud'] }));
    expect(synth.speak).toHaveBeenCalled();
    const utterance = synth.speak.mock.calls[0][0] as unknown as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe('ht-HT');
    expect(utterance.voice?.voiceURI).toBe('haitian');
    content.remove();
  });

  it('requests Kriolu rather than silently selecting a Portuguese voice', async () => {
    useAppStore.getState().setLanguage('kea');
    useAppStore.getState().setSpeechVoiceURI('portuguese');
    await hydrateReadAloud();
    const content = document.createElement('main');
    content.id = 'main';
    content.textContent = 'Bon dia.';
    document.body.appendChild(content);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.kea['a11y.readAloud'] }));
    const utterance = synth.speak.mock.calls[0][0] as unknown as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe('kea');
    expect(utterance.voice).toBeNull();
    content.remove();
  });

  it('does not treat French or Portuguese as Creole voices', () => {
    expect(speechVoiceMatches('ht', 'ht-HT')).toBe(true);
    expect(speechVoiceMatches('ht', 'fr-HT')).toBe(false);
    expect(speechVoiceMatches('kea', 'pt-CV')).toBe(false);
    expect(speechVoiceMatches('kea', 'kea-CV')).toBe(true);
    expect(speechVoiceMatches('zh', 'zh-Hans-CN')).toBe(true);
  });
});
