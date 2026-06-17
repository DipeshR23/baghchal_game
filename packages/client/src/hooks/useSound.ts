import { useCallback, useRef } from 'react';
import { useUIStore } from '../stores/uiStore.js';

export const useSound = () => {
  const { soundsEnabled } = useUIStore();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lazily initialize Web Audio API context
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    return audioCtxRef.current;
  };

  /** Play a synthesized move click sound */
  const playMoveSound = useCallback(() => {
    if (!soundsEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Standard block / knock sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, [soundsEnabled]);

  /** Play a synthesized capture snap sound */
  const playCaptureSound = useCallback(() => {
    if (!soundsEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Double tap wood sound or click
    const playClick = (timeOffset: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + timeOffset + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.1);
    };

    // Synthesize quick double strike
    playClick(0, 220);
    playClick(0.06, 170);
  }, [soundsEnabled]);

  /** Play a synthesized short victory fanfare */
  const playVictorySound = useCallback(() => {
    if (!soundsEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Uplifting arpeggio: C4, E4, G4, C5
    playNote(261.63, 0, 0.2);     // C4
    playNote(329.63, 0.12, 0.2);  // E4
    playNote(392.00, 0.24, 0.2);  // G4
    playNote(523.25, 0.36, 0.5);  // C5
  }, [soundsEnabled]);

  /** Play a synthesized short defeat chime */
  const playDefeatSound = useCallback(() => {
    if (!soundsEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Descending gloomy chord: G4, E-flat4, C4
    playNote(392.00, 0, 0.25);
    playNote(311.13, 0.2, 0.25);
    playNote(261.63, 0.4, 0.65);
  }, [soundsEnabled]);

  return {
    playMoveSound,
    playCaptureSound,
    playVictorySound,
    playDefeatSound,
  };
};
export { useSound as default };
