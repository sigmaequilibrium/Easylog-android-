const CALIBRATION_KEY_PREFIX = "easylog_calibration_";

const CALIBRATION_INTERVAL_DAYS = 30;

export function getCalibrationStatus(e, t, s = CALIBRATION_INTERVAL_DAYS) {
  if (!e) {
    return {
      vehicleReg: "",
      lastCalibrationDate: null,
      lastCalibrationOdometer: null,
      daysSinceLastCalibration: 0,
      isOverdue: false,
      intervalDays: s,
    };
  }
  const o = e.toUpperCase();
  let lastCalibrationDate = null;
  let lastCalibrationOdometer = null;
  if (typeof window !== "undefined") {
    try {
      const y = localStorage.getItem(`${CALIBRATION_KEY_PREFIX}${o}`);
      if (y) {
        const g = JSON.parse(y);
        lastCalibrationDate = g.lastCalibrationDate;
        lastCalibrationOdometer = g.lastCalibrationOdometer;
      }
    } catch (error) {
      console.warn("Error reading calibration cache", error);
    }
  }
  if (!lastCalibrationDate) {
    const y = t.filter(
      (g) => g.registrationNumber?.toUpperCase() === o && g.isCalibration && g.end?.timestamp,
    );
    if (y.length > 0) {
      y.sort((g, M) => new Date(M.end.timestamp).getTime() - new Date(g.end.timestamp).getTime());
      lastCalibrationDate = y[0].end.timestamp;
      lastCalibrationOdometer = y[0].end.value;
    }
  }
  if (!lastCalibrationDate) {
    const y = t.filter((g) => g.registrationNumber?.toUpperCase() === o && g.start?.timestamp);
    if (y.length > 0) {
      y.sort(
        (g, M) => new Date(g.start.timestamp).getTime() - new Date(M.start.timestamp).getTime(),
      );
      lastCalibrationDate = y[0].start.timestamp;
      lastCalibrationOdometer = y[0].start.value;
    }
  }
  if (!lastCalibrationDate) {
    return {
      vehicleReg: o,
      lastCalibrationDate: null,
      lastCalibrationOdometer: null,
      daysSinceLastCalibration: 0,
      isOverdue: false,
      intervalDays: s,
    };
  }
  const u = new Date(lastCalibrationDate).getTime();
  const f = Date.now();
  const m = Math.max(0, f - u);
  const daysSinceLastCalibration = Math.floor(m / (1000 * 60 * 60 * 24));
  const isOverdue = daysSinceLastCalibration >= s;
  return {
    vehicleReg: o,
    lastCalibrationDate,
    lastCalibrationOdometer,
    daysSinceLastCalibration,
    isOverdue,
    intervalDays: s,
  };
}

export function getOverdueCalibrations(e, t, s = CALIBRATION_INTERVAL_DAYS) {
  return e.map((o) => getCalibrationStatus(o, t, s)).filter((o) => o.isOverdue);
}

function saveCalibrationRecord(
  e,
  lastCalibrationOdometer,
  lastCalibrationDate = new Date().toISOString(),
) {
  if (!(typeof window === "undefined" || !e)) {
    try {
      const o = {
        lastCalibrationDate,
        lastCalibrationOdometer,
        intervalDays: CALIBRATION_INTERVAL_DAYS,
      };
      localStorage.setItem(`${CALIBRATION_KEY_PREFIX}${e.toUpperCase()}`, JSON.stringify(o));
    } catch (error) {
      console.warn("Error saving calibration record", error);
    }
  }
}

export function buildCalibrationTrip(e, t, s, o, a) {
  const calibrationDrift = t - s;
  const timestamp = new Date().toISOString();
  const f = calibrationDrift > 0 ? calibrationDrift : 0;
  const m = "personal";
  let x = a?.trim() || "ATO Monthly Odometer Calibration & Cluster Alignment";
  if (calibrationDrift !== 0) {
    const y = calibrationDrift > 0 ? `+${calibrationDrift}` : `${calibrationDrift}`;
    x += ` (Dashboard cluster adjusted ${y} km vs GPS estimate. Logbook baseline synchronized)`;
  } else {
    x += " (Dashboard verified: 100% exact match with GPS estimate)";
  }
  const b = {
    id: crypto.randomUUID(),
    status: "completed",
    verificationStatus: "verified",
    start: {
      value: s,
      timestamp,
      imageUrl: o,
    },
    end: {
      value: t,
      timestamp,
      imageUrl: o,
    },
    distance: f,
    tripType: m,
    clientName: "ATO Odometer Calibration",
    registrationNumber: e.toUpperCase(),
    notes: x,
    trackingMode: "camera",
    triggerSource: "manual",
    isCalibration: true,
    calibrationDrift,
    calibrationReason: x,
  };
  saveCalibrationRecord(e, t, timestamp);
  return b;
}
