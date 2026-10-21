const HOME_WORK_KEY = "easylog_home_work_config";

const LEGACY_HOME_WORK_KEY = "snaplog_home_work_config";

const DEFAULT_HOME_WORK_CONFIG = {
  home: {
    name: "Home",
    address: "",
    latitude: null,
    longitude: null,
    radiusMeters: 250,
  },
  work: {
    name: "Office / Work",
    address: "",
    latitude: null,
    longitude: null,
    radiusMeters: 250,
  },
  autoDetectHomeAsPersonal: true,
  autoDetectWorkAsBusiness: true,
};

export function loadHomeWorkConfig() {
  if (typeof window === "undefined") {
    return DEFAULT_HOME_WORK_CONFIG;
  }
  try {
    const e = localStorage.getItem(HOME_WORK_KEY) || localStorage.getItem(LEGACY_HOME_WORK_KEY);
    if (e) {
      const t = JSON.parse(e);
      return {
        ...DEFAULT_HOME_WORK_CONFIG,
        ...t,
        home: {
          ...DEFAULT_HOME_WORK_CONFIG.home,
          ...(t.home || {}),
        },
        work: {
          ...DEFAULT_HOME_WORK_CONFIG.work,
          ...(t.work || {}),
        },
      };
    }
  } catch (error) {
    console.warn("Failed to parse home/work config from localStorage", error);
  }
  return DEFAULT_HOME_WORK_CONFIG;
}

export function saveHomeWorkConfig(detail) {
  if (!(typeof window === "undefined")) {
    try {
      localStorage.setItem(HOME_WORK_KEY, JSON.stringify(detail));
      window.dispatchEvent(
        new CustomEvent("easylog_homework_updated", {
          detail,
        }),
      );
    } catch (error) {
      console.error("Failed to save home/work config", error);
    }
  }
}

export function distanceInMeters(e, t, latitude, longitude) {
  if ((e === 0 && t === 0) || (latitude === 0 && longitude === 0)) {
    return Infinity;
  }
  const a = 6371000;
  const d = ((latitude - e) * Math.PI) / 180;
  const u = ((longitude - t) * Math.PI) / 180;
  const f =
    Math.sin(d / 2) * Math.sin(d / 2) +
    Math.cos((e * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(u / 2) *
      Math.sin(u / 2);
  const m = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
  return a * m;
}

export function isNearPlace(e, t) {
  if (!e || !t) {
    return false;
  }
  if (
    typeof e.latitude === "number" &&
    typeof e.longitude === "number" &&
    e.latitude !== 0 &&
    e.longitude !== 0 &&
    typeof t.latitude === "number" &&
    typeof t.longitude === "number" &&
    t.latitude !== 0 &&
    t.longitude !== 0
  ) {
    const s = distanceInMeters(e.latitude, e.longitude, t.latitude, t.longitude);
    const o = t.radiusMeters || 250;
    if (s <= o) {
      return true;
    }
  }
  if (e.address && t.address) {
    const s = e.address.toLowerCase().trim();
    const o = t.address.toLowerCase().trim();
    if (s.includes(o) || o.includes(s)) {
      return true;
    }
    const a = o
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(
        (d) =>
          d.length >= 3 &&
          !["street", "road", "avenue", "drive", "lane", "close", "court", "drive"].includes(d),
      );
    if (a.length > 0 && a.filter((u) => s.includes(u)).length >= Math.min(2, a.length)) {
      return true;
    }
  }
  if (e.address && t.name) {
    const s = e.address.toLowerCase();
    const o = t.name.toLowerCase();
    if (
      (o === "home" && (s.includes("home") || s.includes("residence"))) ||
      ((o.includes("work") || o.includes("office")) &&
        (s.includes("office") || s.includes("hq") || s.includes("workplace")))
    ) {
      return true;
    }
  }
  return false;
}

export function classifyHomeWorkTrip(
  e,
  t,
  { home, work, autoDetectHomeAsPersonal, autoDetectWorkAsBusiness } = loadHomeWorkConfig(),
) {
  const f = isNearPlace(e, home);
  const m = isNearPlace(t, home);
  const x = isNearPlace(e, work);
  const b = isNearPlace(t, work);
  const isHomeTrip = f || m;
  const isWorkTrip = x || b;
  const isCommute = (f && b) || (x && m);
  if (isHomeTrip && autoDetectHomeAsPersonal) {
    let reason = "Personal: Trip to or from Home";
    let ruleExplanation =
      "ATO Rule: Travel between home and a normal workplace is private commute travel and cannot be claimed.";
    if (isCommute) {
      reason = "Personal: Home ↔ Work Commute";
      ruleExplanation =
        "ATO Division 28: Daily commuting between your home and work base is classified as non-deductible private travel.";
    } else if (f && m) {
      reason = "Personal: Round-trip from Home";
      ruleExplanation = "Trip commenced and finished at home.";
    } else if (f) {
      reason = "Personal: Originating from Home";
      ruleExplanation =
        "Commencing travel from home is classified as personal by default under ATO record-keeping guidelines.";
    } else if (m) {
      reason = "Personal: Returning to Home";
      ruleExplanation = "Returning home after work is classified as private commute.";
    }
    return {
      isHomeTrip: true,
      isWorkTrip,
      isCommute,
      recommendedType: "personal",
      reason,
      ruleExplanation,
    };
  }
  if (isWorkTrip && !isHomeTrip && autoDetectWorkAsBusiness) {
    const z = work.name || "Office";
    return {
      isHomeTrip: false,
      isWorkTrip: true,
      isCommute: false,
      recommendedType: "work",
      reason: `Work: Travel to/from ${z}`,
      ruleExplanation: `Travel between business locations or client sites and ${z} is deductible business travel.`,
    };
  }
  return {
    isHomeTrip,
    isWorkTrip,
    isCommute,
    recommendedType: null,
    reason: null,
    ruleExplanation: null,
  };
}
