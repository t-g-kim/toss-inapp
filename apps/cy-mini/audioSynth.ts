/**
 * Web Audio API 기반 레트로 8-bit / Lo-Fi 감성 사운드 신디사이저
 * - 외부 MP3 음원 파일 0바이트 (저작권 이슈 0% 완전 해결)
 * - 브라우저 네이티브 AudioContext를 통한 부드럽고 따뜻한 8비트/오르골 멜로디 실시간 합성 연주
 */

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private timerId: number | null = null;
  private currentTrackId = "bgm_1";
  private noteIndex = 0;

  // 음계 주파수 테이블 (Hz)
  private readonly NOTES: Record<string, number> = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5,
    REST: 0,
  };

  // 트랙별 8비트/로파이 아르페지오 멜로디 패턴
  private readonly TRACK_PATTERNS: Record<
    string,
    { type: OscillatorType; tempo: number; notes: string[] }
  > = {
    // 1. 새벽 2시의 다이어리 (Lo-Fi Chill - 나지막한 마이너 선율)
    bgm_1: {
      type: "triangle",
      tempo: 320,
      notes: ["A3", "C4", "E4", "A4", "G4", "E4", "F3", "A3", "C4", "F4", "E4", "C4", "D3", "F3", "A3", "D4", "E3", "G3", "B3", "E4"],
    },
    // 2. 오렌지빛 미니룸 (Y2K Lounge - 통통 튀는 라운지 멜로디)
    bgm_2: {
      type: "sine",
      tempo: 260,
      notes: ["C4", "E4", "G4", "B4", "A4", "G4", "E4", "D4", "F4", "A4", "C5", "B4", "G4", "F4", "E4", "D4"],
    },
    // 3. 그 시절, 너에게 (Acoustic Guitar - 따뜻한 아르페지오)
    bgm_3: {
      type: "triangle",
      tempo: 300,
      notes: ["G3", "B3", "D4", "G4", "F3", "A3", "C4", "F4", "E3", "G3", "B3", "E4", "D3", "F3", "A3", "D4"],
    },
    // 4. 오리알로 산 추억 (Music Box - 청아한 오르골 사운드)
    bgm_4: {
      type: "sine",
      tempo: 340,
      notes: ["C5", "E5", "G5", "C6", "B5", "G5", "A5", "F5", "D5", "G5", "E5", "C5", "F5", "D5", "B4", "C5"],
    },
    // 5. 방과 후 운동장 바람 (Chiptune Pop - 8비트 레트로 팝)
    bgm_5: {
      type: "square",
      tempo: 220,
      notes: ["C4", "G4", "E4", "C5", "G4", "A4", "F4", "D4", "B3", "G4", "E4", "C4", "F4", "A4", "G4", "REST"],
    },
    // 6. 비 오는 날의 창가 (Rain Lo-Fi - 감성 피아노 톤)
    bgm_6: {
      type: "triangle",
      tempo: 380,
      notes: ["D3", "F3", "A3", "C4", "F4", "D4", "G3", "B3", "D4", "F4", "E4", "C4", "A3", "C4", "E4", "G4"],
    },
    // 7. 파도타기 서핑 (Retro Synth - 신스웨이브 비트)
    bgm_7: {
      type: "sawtooth",
      tempo: 240,
      notes: ["A3", "A3", "C4", "E4", "G3", "G3", "B3", "D4", "F3", "F3", "A3", "C4", "E3", "G3", "B3", "D4"],
    },
    // 8. 너와 나의 비밀 일기 (Sweet Piano - 포근한 왈츠)
    bgm_8: {
      type: "sine",
      tempo: 310,
      notes: ["E4", "G4", "B4", "D5", "C5", "A4", "F4", "D4", "G4", "B4", "D5", "C5", "B4", "G4", "E4", "REST"],
    },
  };

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public play(trackId = "bgm_1") {
    this.initCtx();
    if (!this.ctx) return;

    this.currentTrackId = trackId;
    this.isPlaying = true;
    this.noteIndex = 0;

    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    const pattern = this.TRACK_PATTERNS[trackId] || this.TRACK_PATTERNS["bgm_1"];

    // 첫 음 즉시 재생
    this.playNextNote(pattern);

    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || this.isMuted) return;
      this.playNextNote(pattern);
    }, pattern.tempo);
  }

  private playNextNote(pattern: { type: OscillatorType; tempo: number; notes: string[] }) {
    if (!this.ctx || this.isMuted) return;

    const noteName = pattern.notes[this.noteIndex % pattern.notes.length];
    this.noteIndex++;

    const freq = this.NOTES[noteName] || 0;
    if (freq <= 0) return; // 쉼표

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = pattern.type;
      osc.frequency.setValueAtTime(freq, now);

      // 자극적이지 않게 매우 부드러운 볼륨 (0.05 ~ 0.08)
      const baseVol = pattern.type === "square" || pattern.type === "sawtooth" ? 0.03 : 0.07;
      gain.gain.setValueAtTime(baseVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (pattern.tempo / 1000) * 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (pattern.tempo / 1000) * 0.95);
    } catch {
      // AudioContext safety fallback
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && this.isPlaying) {
      this.initCtx();
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const retroAudioSynth = new RetroAudioSynth();
