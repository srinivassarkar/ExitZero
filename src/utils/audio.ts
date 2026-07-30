/**
 * Audio Synthesis & Haptic Feedback Utilities for ExitZero PWA
 */

export const playSoundEffect = (type: "success" | "click" | "warning") => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "success") {
      // Dual-tone high pitch success chime (E5 -> A5)
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "click") {
      // Extremely quick high frequency tick
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "warning") {
      // Quick dual buzzer tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.error("Audio synthesis failed:", e);
  }
};

export const triggerHapticFeedback = (strength: "light" | "medium" | "heavy" = "light") => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    try {
      if (strength === "light") {
        navigator.vibrate(15);
      } else if (strength === "medium") {
        navigator.vibrate(30);
      } else if (strength === "heavy") {
        navigator.vibrate([40, 20, 40]);
      }
    } catch (e) {
      console.warn("Haptics vibration failed:", e);
    }
  }
};
