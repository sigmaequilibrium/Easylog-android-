const PUSH_ENABLED_KEY = "easylog_push_enabled";

const PUSH_PREFERENCES_KEY = "easylog_push_preferences";

const DEFAULT_PUSH_PREFERENCES = {
  enabled: true,
  notifyTripStarted: true,
  notifyTripEnded: true,
  notifyAwaitingVerification: true,
  notifyCalibrationDue: true,
};

const isNotificationSupported = () => typeof window !== "undefined" && "Notification" in window;

export const loadPushPreferences = () => {
  if (typeof window === "undefined") {
    return DEFAULT_PUSH_PREFERENCES;
  }
  try {
    const e = localStorage.getItem(PUSH_PREFERENCES_KEY);
    const t = localStorage.getItem(PUSH_ENABLED_KEY);
    let s = e
      ? JSON.parse(e)
      : {
          ...DEFAULT_PUSH_PREFERENCES,
        };
    if (t !== null && !e) {
      s.enabled = t !== "false";
    }
    return {
      enabled: s.enabled ?? true,
      notifyTripStarted: s.notifyTripStarted ?? true,
      notifyTripEnded: s.notifyTripEnded ?? true,
      notifyAwaitingVerification: s.notifyAwaitingVerification ?? true,
      notifyCalibrationDue: s.notifyCalibrationDue ?? true,
    };
  } catch (error) {
    console.warn("Failed to parse stored notification preferences", error);
    return DEFAULT_PUSH_PREFERENCES;
  }
};

export const savePushPreferences = (e) => {
  const s = {
    ...loadPushPreferences(),
    ...e,
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PUSH_PREFERENCES_KEY, JSON.stringify(s));
      localStorage.setItem(PUSH_ENABLED_KEY, s.enabled ? "true" : "false");
    } catch (error) {
      console.warn("Failed to persist notification preferences", error);
    }
  }
  return s;
};

export const getPushStatus = () => {
  const preferences = loadPushPreferences();
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: "unsupported",
      enabled: false,
      preferences,
    };
  }
  const Notification_permission = Notification.permission;
  const enabled = Notification_permission === "granted" && preferences.enabled;
  return {
    supported: true,
    permission: Notification_permission,
    enabled,
    preferences,
  };
};

export const requestPushPermission = async () => {
  if (!isNotificationSupported()) {
    return false;
  }
  try {
    if ((await Notification.requestPermission()) === "granted") {
      return (
        savePushPreferences({
          enabled: true,
        }),
        true
      );
    }
    return (
      savePushPreferences({
        enabled: false,
      }),
      false
    );
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

const openVerificationQueue = (tripId) => {
  if (typeof window !== "undefined") {
    window.focus();
    window.dispatchEvent(
      new CustomEvent("open-verification-queue", {
        detail: {
          tripId,
        },
      }),
    );
  }
};

async function showPushNotification(e, t, s) {
  const o = getPushStatus();
  if (!o.supported || !o.enabled || o.permission !== "granted") {
    return false;
  }
  try {
    if ("serviceWorker" in navigator) {
      try {
        const d = await navigator.serviceWorker.ready;
        if (d && "showNotification" in d) {
          await d.showNotification(e, t);
          return true;
        }
      } catch (error) {
        console.warn("Service worker showNotification failed, using fallback:", error);
      }
    }
    const a = new Notification(e, t);
    a.onclick = (d) => {
      d.preventDefault();
      if (s) {
        s();
      } else {
        openVerificationQueue(t.data?.tripId);
      }
      a.close();
    };
    return true;
  } catch (error) {
    console.error("Error displaying notification:", error);
    return false;
  }
}

const openCalibrationDialog = (e) => {
  if (typeof window !== "undefined") {
    window.focus();
    window.dispatchEvent(
      new CustomEvent("open-calibration-dialog", {
        detail: {
          vehicleReg: e,
        },
      }),
    );
  }
};

export const notifyCalibrationDue = async (e, daysSinceLastCalibration) => {
  if (!loadPushPreferences().notifyCalibrationDue) {
    return false;
  }
  const o =
    daysSinceLastCalibration && daysSinceLastCalibration > 30
      ? ` (${daysSinceLastCalibration} days since last sync)`
      : "";
  const a = "⚠️ ATO Odometer Calibration Due";
  const u = {
    body: `${e.toUpperCase()}: Monthly calibration required to maintain compliant logbook records. Tap to verify dashboard odometer.${o}`,
    icon: "/pwa-192x192.png",
    badge: "/apple-touch-icon.png",
    tag: `easylog-calibration-${e.toLowerCase()}`,
    renotify: true,
    silent: false,
    data: {
      url: "/",
      action: "open_calibration",
      vehicleReg: e,
    },
  };
  return showPushNotification(a, u, () => openCalibrationDialog(e));
};

export const sendTestNotification = async (e, t = "km") => {
  if (e === "started") {
    return showPushNotification("🚗 Test: Trip Started", {
      body: "GPS drive tracking is active for Toyota Hilux. Safe driving!",
      icon: "/pwa-192x192.png",
      badge: "/apple-touch-icon.png",
      tag: "easylog-test-started",
      renotify: true,
    });
  }
  if (e === "ended") {
    const d = `🛑 Test: Trip Ended (28.4 ${t})`;
    return showPushNotification(d, {
      body: "Drive finished and saved. Destination: 100 George St, Sydney CBD.",
      icon: "/pwa-192x192.png",
      badge: "/apple-touch-icon.png",
      tag: "easylog-test-ended",
      renotify: true,
    });
  }
  if (e === "calibration") {
    return showPushNotification(
      "⚠️ Test: ATO Calibration Reminder",
      {
        body: "ABC-123: Monthly odometer calibration is due. Tap to align physical dashboard with logbook.",
        icon: "/pwa-192x192.png",
        badge: "/apple-touch-icon.png",
        tag: "easylog-test-calibration",
        renotify: true,
        data: {
          vehicleReg: "ABC-123",
        },
      },
      () => openCalibrationDialog("ABC-123"),
    );
  }
  const s = {
    id: "test-trip",
    start: {
      value: 50000,
      timestamp: new Date().toISOString(),
    },
    end: {
      value: 50015,
      timestamp: new Date().toISOString(),
    },
    distance: 15,
    status: "completed",
    verificationStatus: "pending",
    registrationNumber: "TEST-CAR",
  };
  const o = "🚗 Test: Trip Logged (Needs Verification)";
  const body = `15.0 ${t} (TEST-CAR) completed. Tap to review Work vs Personal and add reason.`;
  return showPushNotification(
    o,
    {
      body,
      icon: "/pwa-192x192.png",
      badge: "/apple-touch-icon.png",
      tag: "easylog-test-verification",
      renotify: true,
      data: {
        tripId: s.id,
      },
    },
    () => openVerificationQueue(s.id),
  );
};
