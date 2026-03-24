/**
 * 音频系统 Hook
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { AlertLevel } from "../types";

interface AudioSystemState {
  enabled: boolean;
  volume: number;
}

const DEFAULT_STATE: AudioSystemState = {
  enabled: false,
  volume: 0.7,
};

export const useAudioSystem = () => {
  const [state, setState] = useState<AudioSystemState>(DEFAULT_STATE);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);

  /**
   * 初始化音频上下文
   */
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  /**
   * 停止所有声音
   */
  const stopAllSounds = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    });
    gainNodesRef.current.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
  }, []);

  /**
   * 播放蜂鸣声（警告）
   */
  const playBeep = useCallback(
    (frequency = 800, duration = 0.5) => {
      if (!state.enabled || !audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(state.volume * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      oscillatorsRef.current.push(oscillator);
      gainNodesRef.current.push(gainNode);

      setTimeout(
        () => {
          try {
            oscillator.disconnect();
            gainNode.disconnect();
          } catch {
            // Ignore cleanup errors
          }
        },
        duration * 1000 + 100,
      );
    },
    [state.enabled, state.volume],
  );

  /**
   * 播放脉冲蜂鸣（警告提示）
   */
  const playPulseBeeps = useCallback(() => {
    if (!state.enabled) return;

    initAudioContext();

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        playBeep(800, 0.5);
      }, i * 1000);
    }
  }, [state.enabled, playBeep, initAudioContext]);

  /**
   * 播放警报声（危险）
   */
  const playAlarm = useCallback(() => {
    if (!state.enabled || !audioContextRef.current) return;

    initAudioContext();
    const ctx = audioContextRef.current;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sawtooth";

    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(1200, now);

    // 频率波动效果（简化）
    for (let i = 0; i <= 20; i++) {
      const t = now + (i / 20) * 2.0;
      const freq = i % 2 === 0 ? 1200 : 1500;
      oscillator.frequency.setValueAtTime(freq, t);
    }

    gainNode.gain.setValueAtTime(state.volume * 0.8, now);
    gainNode.gain.linearRampToValueAtTime(state.volume * 0.8, now + 1.8);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 2.0);

    oscillatorsRef.current.push(oscillator);
    gainNodesRef.current.push(gainNode);
  }, [state.enabled, state.volume, initAudioContext]);

  /**
   * 测试声音
   */
  const testSound = useCallback(() => {
    initAudioContext();
    playBeep(800, 0.3);
  }, [initAudioContext, playBeep]);

  /**
   * 切换声音开关
   */
  const toggleAudio = useCallback(() => {
    if (!state.enabled) {
      initAudioContext();
    }
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, [state.enabled, initAudioContext]);

  /**
   * 播放对应级别的警报
   */
  const playAlertSound = useCallback(
    (level: AlertLevel) => {
      if (!state.enabled) return;

      stopAllSounds();

      if (level === "warning") {
        playPulseBeeps();
      } else if (level === "danger") {
        playAlarm();
      }
    },
    [state.enabled, stopAllSounds, playPulseBeeps, playAlarm],
  );

  /**
   * 设置音量
   */
  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, [stopAllSounds]);

  return {
    enabled: state.enabled,
    volume: state.volume,
    toggleAudio,
    setVolume,
    testSound,
    playAlertSound,
    playBeep,
    playPulseBeeps,
    playAlarm,
    initAudioContext,
  };
};