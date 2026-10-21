export async function searchAddresses(e) {
  const t = e.trim();
  if (!t || t.length < 3) {
    return [];
  }
  try {
    const s = new AbortController();
    const o = setTimeout(() => s.abort(), 4000);
    const a = await fetch(`/api/geocode?q=${encodeURIComponent(t)}`, {
      signal: s.signal,
    });
    clearTimeout(o);
    if (a.ok) {
      const d = await a.json();
      if (Array.isArray(d.results) && d.results.length > 0) {
        return d.results;
      }
    }
  } catch {}
  try {
    const s = new AbortController();
    const o = setTimeout(() => s.abort(), 4500);
    const a = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(t)}&limit=5&addressdetails=1`,
      {
        signal: s.signal,
        headers: {
          Accept: "application/json",
        },
      },
    );
    clearTimeout(o);
    if (a.ok) {
      const d = await a.json();
      if (Array.isArray(d)) {
        return d.map((u) => ({
          displayName: u.display_name.split(",").slice(0, 3).join(",").trim(),
          fullAddress: u.display_name,
          lat: parseFloat(u.lat),
          lon: parseFloat(u.lon),
        }));
      }
    }
  } catch (error) {
    console.warn("Direct geocoding fallback failed", error);
  }
  return [];
}

const reverseGeocodeCache = new Map();

export function isPlaceholderAddress(e) {
  if (!e || !e.trim()) {
    return true;
  }
  const t = e.toLowerCase();
  return (
    t.includes("locating") ||
    t.includes("getting gps") ||
    t.includes("acquiring") ||
    t.includes("resolving") ||
    t.includes("pending") ||
    t === "current location" ||
    t === "start location"
  );
}

export async function reverseGeocode(e, t) {
  if ((!e && !t) || (e === 0 && t === 0)) {
    return "";
  }
  const s = `${e.toFixed(4)},${t.toFixed(4)}`;
  if (reverseGeocodeCache.has(s)) {
    return reverseGeocodeCache.get(s);
  }
  try {
    const f = new AbortController();
    const m = setTimeout(() => f.abort(), 4000);
    const x = await fetch(`/api/reverse-geocode?lat=${e}&lon=${t}`, {
      signal: f.signal,
    });
    clearTimeout(m);
    if (x.ok) {
      const b = await x.json();
      if ((b.address && !b.address.includes("°")) || b.address) {
        reverseGeocodeCache.set(s, b.address);
        return b.address;
      }
    }
  } catch {}
  try {
    const f = new AbortController();
    const m = setTimeout(() => f.abort(), 3500);
    const x = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${e}&longitude=${t}&localityLanguage=en`,
      {
        signal: f.signal,
      },
    );
    clearTimeout(m);
    if (x.ok) {
      const b = await x.json();
      const y = b.locality || b.city || "";
      const g = b.principalSubdivision || "";
      const M =
        b.localityInfo?.administrative?.[b.localityInfo.administrative.length - 1]?.name || "";
      let z = "";
      if (M && y && M !== y) {
        z = `${M}, ${y}`;
      } else if (y) {
        z = g ? `${y}, ${g}` : y;
      }
      if (z) {
        reverseGeocodeCache.set(s, z);
        return z;
      }
    }
  } catch {}
  try {
    const f = new AbortController();
    const m = setTimeout(() => f.abort(), 4000);
    const x = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e}&lon=${t}&zoom=16`,
      {
        signal: f.signal,
        headers: {
          Accept: "application/json",
        },
      },
    );
    clearTimeout(m);
    if (x.ok) {
      const b = await x.json();
      const y = b.address;
      let g = "";
      if (y) {
        const M = y.road || y.street || y.pedestrian || y.suburb || "";
        const z = y.city || y.town || y.village || y.city_district || y.county || "";
        const A = y.state ? y.state.substring(0, 3).toUpperCase() : "";
        if (M && z) {
          g = `${M}, ${z}`;
        } else if (M) {
          g = M;
        } else if (z) {
          g = A ? `${z}, ${A}` : z;
        }
      }
      if (!g && b.display_name) {
        g = b.display_name.split(",").slice(0, 2).join(",").trim();
      }
      if (g) {
        reverseGeocodeCache.set(s, g);
        return g;
      }
    }
  } catch {}
  const o = `${e.toFixed(4)}°, ${t.toFixed(4)}°`;
  reverseGeocodeCache.set(s, o);
  return o;
}
