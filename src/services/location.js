export function haversineDistance(e, t, latitude, longitude, a = "km") {
  if (e === latitude && t === longitude) {
    return 0;
  }
  const d = a === "mi" ? 3958.8 : 6371;
  const u = ((latitude - e) * Math.PI) / 180;
  const f = ((longitude - t) * Math.PI) / 180;
  const m =
    Math.sin(u / 2) * Math.sin(u / 2) +
    Math.cos((e * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(f / 2) *
      Math.sin(f / 2);
  const x = 2 * Math.atan2(Math.sqrt(m), Math.sqrt(1 - m));
  return d * x;
}

export async function getCurrentPosition(e = true) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser or environment.");
  }
  const t = (enableHighAccuracy, timeout) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (u) => resolve(u),
        (u) => reject(u),
        {
          enableHighAccuracy,
          timeout,
          maximumAge: 15000,
        },
      );
    });
  if (e) {
    try {
      return await t(true, 7000);
    } catch (error) {
      console.warn(
        "High-accuracy GPS fix timed out or failed, falling back to network positioning...",
        error,
      );
    }
  }
  try {
    return await t(false, 9000);
  } catch (error) {
    console.warn("Standard geolocation failed, attempting IP-based coarse coordinates...", error);
  }
  try {
    const s = new AbortController();
    const o = setTimeout(() => s.abort(), 4000);
    const a = await fetch("https://ipapi.co/json/", {
      signal: s.signal,
    });
    clearTimeout(o);
    if (a.ok) {
      const d = await a.json();
      if (typeof d.latitude === "number" && typeof d.longitude === "number") {
        return {
          coords: {
            latitude: d.latitude,
            longitude: d.longitude,
            accuracy: 2500,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        };
      }
    }
  } catch (error) {
    console.warn("IP geolocation fallback failed:", error);
  }
  throw new Error(
    "GPS coordinates unavailable. Check browser site permissions or enable phone location.",
  );
}
