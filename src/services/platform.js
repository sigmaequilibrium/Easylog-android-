export const isNativePlatform = () => {
  var e;
  var t;
  return !!(
    (t = (e = window.Capacitor) == null ? undefined : e.isNativePlatform) != null && t.call(e)
  );
};

export const isStandaloneApp = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const matches = window.matchMedia("(display-mode: standalone)").matches;
  const t = window.navigator.standalone === true;
  const s = document.referrer.includes("android-app://");
  const o = window.isAndroidNativeApp === true;
  return matches || t || s || o;
};

export const getMobilePlatform = () => {
  if (typeof window === "undefined") {
    return {
      isIos: false,
      isAndroid: false,
    };
  }
  const e = window.navigator.userAgent.toLowerCase();
  const isIos =
    /iphone|ipad|ipod/.test(e) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(e);
  return {
    isIos,
    isAndroid,
  };
};
