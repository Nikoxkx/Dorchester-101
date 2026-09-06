'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';

/**
 * Read-aloud using the browser's own speech engine.
 *
 * Three details make the difference between a demo and a feature:
 *  - `getVoices()` is empty on first call in Chrome, so the voice list is read
 *    after `voiceschanged`; a select that never repopulates is the usual way
 *    this feature ships broken.
 *  - Long utterances are cut off silently by WebKit and Chrome alike, so text is
 *    queued sentence by sentence rather than handed over in one block.
 *  - Speech stops when the page unmounts or navigation happens; an utterance
 *    left running over new content is disorienting, so everything is cancelled
 *    on cleanup.
 */

export interface ReadAloudApi {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  /** Voices whose language matches the active interface language. */
  voices: SpeechSynthesisVoice[];
  /** Every voice the device offers, for the settings list. */
  allVoices: SpeechSynthesisVoice[];
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  toggle: (text: string) => void;
}

const SENTENCE_SPLIT = /(?<=[.!?؟።。、،])\s+/u;

function chunk(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const pieces = cleaned.split(SENTENCE_SPLIT).filter((s) => s.trim().length > 0);
  // Re-join very short fragments so the cadence does not become staccato.
  const out: string[] = [];
  for (const piece of pieces) {
    const last = out[out.length - 1];
    if (last && last.length + piece.length < 120) out[out.length - 1] = `${last} ${piece}`;
    else out.push(piece);
  }
  return out;
}

export function useReadAloud(): ReadAloudApi {
  const language = useAppStore((s) => s.language);
  const rate = useAppStore((s) => s.speechRate);
  const voiceURI = useAppStore((s) => s.speechVoiceURI);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const queueRef = useRef<string[]>([]);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const read = () => setVoices(window.speechSynthesis.getVoices());
    read();
    window.speechSynthesis.addEventListener('voiceschanged', read);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', read);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const langPrefix = language === 'kea' ? 'pt' : language === 'ht' ? 'fr' : language;

  const matching = useMemo(
    () => voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix.toLowerCase())),
    [voices, langPrefix]
  );

  const speakNextRef = useRef<() => void>(() => {});
  const speakNext = useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const next = queueRef.current.shift();
    if (!next) {
      setSpeaking(false);
      setPaused(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(next);
    utterance.lang = matching[0]?.lang ?? langPrefix;
    const chosen = (voiceURI && voices.find((v) => v.voiceURI === voiceURI)) || matching[0] || null;
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }
    utterance.rate = rate;
    utterance.onend = () => speakNextRef.current();
    utterance.onerror = () => {
      queueRef.current = [];
      setSpeaking(false);
    };
    synth.speak(utterance);
  }, [langPrefix, matching, rate, supported, voiceURI, voices]);
  useEffect(() => {
    speakNextRef.current = speakNext;
  }, [speakNext]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      queueRef.current = chunk(text);
      setSpeaking(true);
      setPaused(false);
      speakNext();
    },
    [speakNext, supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const toggle = useCallback(
    (text: string) => {
      if (!supported) return;
      if (speaking) {
        stop();
        return;
      }
      speak(text);
    },
    [speak, speaking, stop, supported]
  );

  // Route changes and reduced-motion preferences both expect speech to stop.
  // A language change mid-sentence should stop speech; the state reset is
  // deferred a tick so it is not a synchronous setState inside the effect.
  useEffect(() => {
    queueRef.current = [];
    if (supported) window.speechSynthesis.cancel();
    const id = window.setTimeout(() => setSpeaking(false), 0);
    return () => window.clearTimeout(id);
  }, [language, supported]);

  return {
    supported,
    speaking,
    paused,
    voices: matching,
    allVoices: voices,
    speak,
    stop,
    pause,
    resume,
    toggle,
  };
}

/** Plain-text version of a region, for speaking what the page actually shows. */
export function textOfRegion(selector: string): string {
  if (typeof document === 'undefined') return '';
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLElement)) return '';
  const clone = node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, nav[aria-hidden="true"], .no-read-aloud').forEach((n) => n.remove());
  return clone.innerText ?? clone.textContent ?? '';
}
