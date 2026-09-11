/**
 * Platform and Device Capability Utilities for ExitZero PWA
 */

/**
 * Detect if the client is running on an iOS device (iPhone, iPad, iPod, or iPadOS Safari)
 */
export function isIosDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isAppleTouch =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isAppleTouch;
}

/**
 * Detect if the web app is currently running in standalone PWA mode (installed to Home Screen)
 */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    (typeof document !== "undefined" && document.referrer.includes("android-app://"))
  );
}

/**
 * Request persistent device storage from browser/OS
 * Prevents OS from evicting local data (SRS, streaks, bookmarks) during low-disk cleanup.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage ||
    typeof navigator.storage.persist !== "function"
  ) {
    return false;
  }

  try {
    if (typeof navigator.storage.persisted === "function") {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) return true;
    }
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log("[ExitZero] Storage persistence granted by browser.");
    }
    return granted;
  } catch (err) {
    console.debug("[ExitZero] Storage persist request ignored:", err);
    return false;
  }
}
