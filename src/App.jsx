import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bluetooth,
  BookOpen,
  Briefcase,
  Camera,
  CarFront,
  CircleAlert,
  CircleCheck,
  CornerDownRight,
  FileCheck,
  Gauge,
  HardDrive,
  Info,
  Navigation,
  Play,
  Settings,
  Square,
  User,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { BluetoothSetupModal } from "./components/BluetoothSetupModal";
import { CalibrationDueBanner } from "./components/CalibrationDueBanner";
import { CalibrationModal } from "./components/CalibrationModal";
import { InstallAppButton } from "./components/InstallAppButton";
import { LiveTrackingHud } from "./components/LiveTrackingHud";
import { MissedTripModal } from "./components/MissedTripModal";
import { OdometerScanner } from "./components/OdometerScanner";
import { OfflineBanner } from "./components/OfflineBanner";
import { RouteMapModal } from "./components/RouteMapModal";
import { SettingsModal } from "./components/SettingsModal";
import { StartTripModal } from "./components/StartTripModal";
import { TripEditor } from "./components/TripEditor";
import { TripList } from "./components/TripList";
import { TripSummaryModal } from "./components/TripSummaryModal";
import { VerificationQueue } from "./components/VerificationQueue";
import {
  ACTIVE_TRIP_KEY,
  BACKUPS_KEY,
  HIGH_ACCURACY_KEY,
  TRACKING_MODE_KEY,
  TRIPS_KEY,
  UNIT_KEY,
  VEHICLES_KEY,
  WAKE_LOCK_KEY,
} from "./constants/storageKeys";
import {
  connectBackupFolder,
  disconnectBackupFolder,
  getBackupFolderName,
  hasBackupFolder,
  listFolderBackups,
  readFolderBackup,
  writeBackupToFolder,
} from "./services/backupFolder";
import {
  PASSENGER_MODE_KEY,
  loadBluetoothConfig,
  matchVehicleForDevice,
  saveBluetoothConfig,
  syncAndroidBridgePreferences,
} from "./services/bluetooth";
import { getCalibrationStatus, getOverdueCalibrations } from "./services/calibration";
import {
  playStartTone,
  playStopTone,
  releaseWakeLock,
  requestWakeLock,
  vibrate,
} from "./services/deviceFeedback";
import { isPlaceholderAddress, reverseGeocode } from "./services/geocoding";
import { classifyHomeWorkTrip, isNearPlace, loadHomeWorkConfig } from "./services/homeWork";
import { getCurrentPosition, haversineDistance } from "./services/location";
import { notifyCalibrationDue } from "./services/notifications";

const DEMO_TRIPS = [
  {
    id: "demo-1",
    status: "completed",
    verificationStatus: "verified",
    start: {
      value: 45200,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      location: {
        latitude: -33.8688,
        longitude: 151.2093,
        address: "George St, Sydney CBD",
      },
    },
    end: {
      value: 45245,
      timestamp: new Date(Date.now() - 172800000 + 5400000).toISOString(),
      location: {
        latitude: -33.8915,
        longitude: 151.2767,
        address: "Campbell Parade, Bondi Beach",
      },
    },
    distance: 45,
    notes: "Grocery run & errand",
    clientName: "Personal",
    tripType: "personal",
    registrationNumber: "ABC-123",
    trackingMode: "gps",
    startLocation: {
      latitude: -33.8688,
      longitude: 151.2093,
      address: "George St, Sydney CBD",
    },
    endLocation: {
      latitude: -33.8915,
      longitude: 151.2767,
      address: "Campbell Parade, Bondi Beach",
    },
    routeCoordinates: [
      [-33.8688, 151.2093],
      [-33.876, 151.228],
      [-33.884, 151.252],
      [-33.8915, 151.2767],
    ],
  },
  {
    id: "demo-2",
    status: "completed",
    verificationStatus: "pending",
    start: {
      value: 45310,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      location: {
        latitude: -33.8688,
        longitude: 151.2093,
        address: "Sydney Tech Park",
      },
    },
    end: {
      value: 45432,
      timestamp: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      location: {
        latitude: -33.815,
        longitude: 151.0011,
        address: "Parramatta Business Centre",
      },
    },
    distance: 122,
    notes: "Site visit for project review",
    clientName: "Acme Corp",
    tripType: "work",
    registrationNumber: "XYZ-999",
    trackingMode: "gps",
    triggerSource: "bluetooth",
    startLocation: {
      latitude: -33.8688,
      longitude: 151.2093,
      address: "Sydney Tech Park",
    },
    endLocation: {
      latitude: -33.815,
      longitude: 151.0011,
      address: "Parramatta Business Centre",
    },
    routeCoordinates: [
      [-33.8688, 151.2093],
      [-33.852, 151.13],
      [-33.834, 151.065],
      [-33.815, 151.0011],
    ],
  },
];

const getFinancialYearStart = () => {
  const e = new Date();
  const t = e.getFullYear();
  const s = e.getMonth() < 6 ? t - 1 : t;
  const o = new Date(s, 6, 1);
  const a = o.getTimezoneOffset() * 60000;
  const d = new Date(o.getTime() - a).toISOString().split("T")[0];
  const u = new Date(e.getTime() - a).toISOString().split("T")[0];
  return {
    start: d,
    end: u,
  };
};

export function App() {
  const [e, setE] = useState(null);
  const [s, setS] = useState([]);
  const [a, setA] = useState([]);
  const [u, setU] = useState(false);
  const [m, setM] = useState("start");
  const [b, setB] = useState("km");
  const [g, setG] = useState("gps");
  const [z, setZ] = useState(true);
  const [G, setG_1] = useState(true);
  const [_, set_] = useState(false);
  const [T, setT] = useState(false);
  const [R, setR] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [S, setS_1] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isStationary, setIsStationary] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [C, setC] = useState(false);
  const [te, setTe] = useState(loadBluetoothConfig());
  const [se, setSe] = useState(false);
  const aeRef = useRef(false);
  const [be, setBe] = useState(false);
  const [je, setJe] = useState(null);
  const nt = getFinancialYearStart();
  const [ze, setZe] = useState("all");
  const [dt, setDt] = useState("");
  const [Je, setJe_1] = useState(nt.start);
  const [mt, setMt] = useState(nt.end);
  const [Ge, setGe] = useState(false);
  const unverifiedTrips = useMemo(() => s.filter((D) => D.verificationStatus === "pending"), [s]);
  const overdueVehicles = useMemo(() => getOverdueCalibrations(a, s, 30), [a, s]);
  const onCommitTrip = (D) => {
    const Y = {
      ...D,
      verificationStatus: "verified",
    };
    Zn(Y);
  };
  const onCommitAll = () => {
    const D = s.map((Y) => {
      if (Y.verificationStatus === "pending") {
        return {
          ...Y,
          verificationStatus: "verified",
        };
      }
      return Y;
    });
    setS(D);
    An(D);
    showNotification("All pending trips committed to official logbook!", "success");
  };
  const [ye, setYe] = useState(false);
  const [initialTrip, setInitialTrip] = useState(null);
  const [Xe, setXe] = useState(false);
  const [initialTab, setInitialTab] = useState("setup");
  const [zt, setZt] = useState([]);
  const [externalBackups, setExternalBackups] = useState([]);
  const [pt, setPt] = useState(false);
  const [connectedFolderName, setConnectedFolderName] = useState(null);
  const [un, setUn] = useState(null);
  const [rr, setRr] = useState(false);
  const sr = (D = "setup") => {
    setInitialTab(D);
    setXe(true);
  };
  const [Hi, setHi] = useState(false);
  const [hn, setHn] = useState(null);
  const [En, setEn] = useState(null);
  const [Ws, setWs] = useState(false);
  const [ve, setVe] = useState(null);
  const [prefilledValue, setPrefilledValue] = useState(null);
  const [re, setRe] = useState(false);
  const [Ot, setOt] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [Ql, setQl] = useState(false);
  const Gs = (D) => {
    setSelectedVehicle(D || a[0] || "");
    setOt(true);
  };
  const [js, setJs] = useState(null);
  const showNotification = (message, type = "success") => {
    setJs({
      message,
      type,
    });
    setTimeout(() => setJs(null), 4000);
  };
  useEffect(() => {
    if (!localStorage.getItem(TRIPS_KEY)) {
      localStorage.getItem("snaplog_trips");
    }
    const D = localStorage.getItem(ACTIVE_TRIP_KEY) || localStorage.getItem("snaplog_active_trip");
    const Y = localStorage.getItem(BACKUPS_KEY) || localStorage.getItem("snaplog_backups");
    const Q = localStorage.getItem(VEHICLES_KEY) || localStorage.getItem("snaplog_vehicles");
    const $ = localStorage.getItem(UNIT_KEY) || localStorage.getItem("snaplog_unit");
    const J =
      localStorage.getItem(TRACKING_MODE_KEY) || localStorage.getItem("snaplog_tracking_mode");
    const X = localStorage.getItem(WAKE_LOCK_KEY) || localStorage.getItem("snaplog_wake_lock");
    const ge =
      localStorage.getItem(HIGH_ACCURACY_KEY) || localStorage.getItem("snaplog_high_accuracy");
    let Se = [];
    try {
      const Pe = localStorage.getItem(TRIPS_KEY);
      const tt = localStorage.getItem("snaplog_trips");
      const Ne = Pe ? JSON.parse(Pe) : [];
      const _t = tt ? JSON.parse(tt) : [];
      const Kt = {};
      _t.forEach((He) => {
        if (He && He.id) {
          Kt[He.id] = He;
        }
      });
      Ne.forEach((He) => {
        if (He && He.id) {
          Kt[He.id] = He;
        }
      });
      const ne = Object.values(Kt);
      const qe = ne.some((He) => !He.id.startsWith("demo-"))
        ? ne.filter((He) => !He.id.startsWith("demo-"))
        : ne;
      if (qe.length > 0) {
        Se = qe;
      } else {
        const He = localStorage.getItem(BACKUPS_KEY) || localStorage.getItem("snaplog_backups");
        if (He) {
          const Zt = JSON.parse(He);
          if (Array.isArray(Zt) && Zt.length > 0 && Zt[0]?.data?.length > 0) {
            Se = Zt[0].data;
          }
        }
      }
      if (Se.length === 0) {
        Se = DEMO_TRIPS;
      }
    } catch (error) {
      console.error("Failed to parse history", error);
      Se = DEMO_TRIPS;
    }
    setS(Se);
    if (D) {
      try {
        const Pe = JSON.parse(D);
        setE(Pe);
        if (Pe.trackingMode === "gps") {
          setR(Pe.distance || 0);
          if (Pe.startLocation) {
            setS_1(Pe.startLocation);
          }
        }
      } catch (error) {
        console.error("Failed to parse active trip", error);
      }
    }
    if (Y) {
      try {
        setZt(JSON.parse(Y));
      } catch (error) {
        console.error("Failed to parse backups", error);
      }
    }
    if (Q) {
      try {
        const Pe = JSON.parse(Q);
        setA(Pe);
      } catch (error) {
        console.error(error);
      }
    }
    if ($ === "mi") {
      setB("mi");
    }
    if (J === "camera" || J === "gps") {
      setG(J);
    }
    if (X !== null) {
      setZ(X === "true");
    }
    if (ge !== null) {
      setG_1(ge === "true");
    }
    hasBackupFolder().then((Pe) => {
      setPt(Pe);
      if (Pe) {
        getBackupFolderName().then((tt) => setConnectedFolderName(tt));
        listFolderBackups()
          .then((tt) => {
            setExternalBackups(tt);
            setRr(false);
          })
          .catch(() => {
            setRr(true);
          });
      }
    });
    window.addEventListener("beforeinstallprompt", (Pe) => {
      Pe.preventDefault();
      setUn(Pe);
    });
    const We = localStorage.getItem(PASSENGER_MODE_KEY);
    if (We !== null) {
      setSe(We === "true");
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!aeRef.current) {
      const J = new URLSearchParams(window.location.search);
      const X = J.get("action");
      const ge = J.get("vehicle");
      if (X === "start_trip" || X === "bluetooth_start") {
        aeRef.current = true;
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          Un(ge || undefined);
        }, 500);
      } else if (X === "end_trip" || X === "bluetooth_end") {
        aeRef.current = true;
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          Zr();
        }, 500);
      } else if (X === "verify_trips") {
        aeRef.current = true;
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          setGe(true);
        }, 500);
      }
    }
    const D = () => {
      setGe(true);
    };
    const Y = (J) => {
      const X = J?.detail?.vehicleReg || a[0] || "";
      Gs(X);
    };
    window.addEventListener("open-verification-queue", D);
    window.addEventListener("open-calibration-dialog", Y);
    const Q = (J) => {
      const X = J?.detail?.vehicle;
      const ge = J?.detail?.device;
      const Se = J?.detail?.macAddress;
      Un(X, ge, Se);
    };
    const $ = () => {
      Zr();
    };
    window.addEventListener("android_bluetooth_connected", Q);
    window.addEventListener("android_bluetooth_disconnected", $);
    window.EasyLogNative = {
      isNative: true,
      onBluetoothConnected: (J, X, ge) => {
        Un(X, J, ge);
      },
      onBluetoothDisconnected: () => {
        Zr();
      },
      setPassengerMode: (J) => {
        onPassengerModeToggle(J);
      },
      isTripActive: () => !!e,
    };
    syncAndroidBridgePreferences(te, se);
    return () => {
      window.removeEventListener("open-verification-queue", D);
      window.removeEventListener("open-calibration-dialog", Y);
      window.removeEventListener("android_bluetooth_connected", Q);
      window.removeEventListener("android_bluetooth_disconnected", $);
    };
  }, [s, a, e, se, te]);
  useEffect(() => {
    const D = new Set(
      s
        .map((Q) => Q.registrationNumber)
        .filter((Q) => !!Q && Q.trim() !== "")
        .map((Q) => Q.toUpperCase()),
    );
    if (Array.from(D).some((Q) => !a.includes(Q))) {
      setA((Q) => {
        const $ = new Set([...Q, ...D]);
        if ($.size === Q.length) {
          return Q;
        }
        return Array.from($).sort();
      });
    }
  }, [s, a]);
  useEffect(() => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(s));
  }, [s]);
  useEffect(() => {
    if (e) {
      localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(e));
    } else {
      localStorage.removeItem(ACTIVE_TRIP_KEY);
    }
  }, [e]);
  useEffect(() => {
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(zt));
  }, [zt]);
  useEffect(() => {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(a));
  }, [a]);
  useEffect(() => {
    localStorage.setItem(UNIT_KEY, b);
  }, [b]);
  useEffect(() => {
    localStorage.setItem(TRACKING_MODE_KEY, g);
  }, [g]);
  useEffect(() => {
    localStorage.setItem(WAKE_LOCK_KEY, z.toString());
  }, [z]);
  useEffect(() => {
    localStorage.setItem(HIGH_ACCURACY_KEY, G.toString());
  }, [G]);
  useEffect(() => {
    let D = false;
    const Y = async () => {
      let $ = false;
      const J = await Promise.all(
        s.map(async (X) => {
          let ge = {
            ...X,
          };
          let Se = false;
          const We = ge.startLocation || ge.start?.location;
          if (
            We &&
            We.latitude &&
            We.longitude &&
            We.latitude !== 0 &&
            isPlaceholderAddress(We.address)
          ) {
            try {
              const Ne = await reverseGeocode(We.latitude, We.longitude);
              if (Ne && !isPlaceholderAddress(Ne)) {
                ge = {
                  ...ge,
                  startLocation: {
                    ...We,
                    address: Ne,
                  },
                  start: {
                    ...ge.start,
                    location: {
                      ...(ge.start?.location || We),
                      address: Ne,
                    },
                  },
                };
                Se = true;
              }
            } catch {}
          }
          const Ee = ge.endLocation || ge.end?.location;
          if (
            Ee &&
            Ee.latitude &&
            Ee.longitude &&
            Ee.latitude !== 0 &&
            isPlaceholderAddress(Ee.address)
          ) {
            try {
              const Ne = await reverseGeocode(Ee.latitude, Ee.longitude);
              if (Ne && !isPlaceholderAddress(Ne)) {
                ge = {
                  ...ge,
                  endLocation: {
                    ...Ee,
                    address: Ne,
                  },
                  end: ge.end
                    ? {
                        ...ge.end,
                        location: {
                          ...(ge.end.location || Ee),
                          address: Ne,
                        },
                      }
                    : undefined,
                };
                Se = true;
              }
            } catch {}
          }
          if (Se) {
            $ = true;
          }
          return ge;
        }),
      );
      if (!D && $) {
        setS(J);
      }
    };
    const Q = setTimeout(() => {
      Y();
    }, 1500);
    return () => {
      D = true;
      clearTimeout(Q);
    };
  }, []);
  useEffect(() => {
    if (!e || e.trackingMode !== "gps") {
      return;
    }
    if (z) {
      requestWakeLock().then(setIsWakeLockActive);
    }
    const D = new Date(e.start.timestamp).getTime();
    const Y = setInterval(() => {
      const Ee = Math.max(0, Math.floor((Date.now() - D) / 1000));
      setDurationSeconds(Ee);
    }, 1000);
    let Q = e.startLocation?.latitude || null;
    let $ = e.startLocation?.longitude || null;
    let J = Date.now();
    let X = null;
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      X = navigator.geolocation.watchPosition(
        (Ee) => {
          const { latitude, longitude, accuracy, speed } = Ee.coords;
          setGpsAccuracy(accuracy);
          const _t = speed !== null && speed >= 0 ? speed * 3.6 : 0;
          const Kt = b === "mi" ? _t * 0.621371 : _t;
          setCurrentSpeed(Kt);
          setS_1((ne) => ({
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString(),
            address: ne?.address || "Tracking GPS route...",
          }));
          if (!(accuracy > 100)) {
            if (!Q || Q === 0) {
              Q = latitude;
              $ = longitude;
              setE((ne) => {
                if (!ne) {
                  return null;
                }
                const st = ne.startLocation?.address || ne.start?.location?.address;
                const qe = isPlaceholderAddress(st);
                const He = {
                  latitude,
                  longitude,
                  accuracy,
                  timestamp: ne.startLocation?.timestamp || new Date().toISOString(),
                  address: !qe && st ? st : "Resolving start address...",
                };
                if (qe) {
                  reverseGeocode(latitude, longitude).then((St) => {
                    if (St && !isPlaceholderAddress(St)) {
                      setE((at) => {
                        if (at) {
                          return {
                            ...at,
                            startLocation: {
                              ...(at.startLocation || He),
                              address: St,
                            },
                            start: {
                              ...at.start,
                              location: {
                                ...(at.start?.location || He),
                                address: St,
                              },
                            },
                          };
                        }
                        return null;
                      });
                    }
                  });
                }
                return {
                  ...ne,
                  startLocation: He,
                  start: {
                    ...ne.start,
                    location: He,
                  },
                };
              });
            } else {
              setE((ne) => {
                if (!ne) {
                  return null;
                }
                const st = ne.startLocation?.address || ne.start?.location?.address;
                if (isPlaceholderAddress(st)) {
                  const Mn = ne.startLocation?.latitude || ne.start?.location?.latitude || latitude;
                  const Wn =
                    ne.startLocation?.longitude || ne.start?.location?.longitude || longitude;
                  if (Mn !== 0 && Wn !== 0) {
                    reverseGeocode(Mn, Wn).then((Xs) => {
                      if (Xs && !isPlaceholderAddress(Xs)) {
                        setE((Kr) => {
                          if (Kr) {
                            return {
                              ...Kr,
                              startLocation: {
                                ...(Kr.startLocation || {
                                  latitude: Mn,
                                  longitude: Wn,
                                }),
                                address: Xs,
                              },
                              start: {
                                ...Kr.start,
                                location: {
                                  ...(Kr.start?.location || {
                                    latitude: Mn,
                                    longitude: Wn,
                                  }),
                                  address: Xs,
                                },
                              },
                            };
                          }
                          return null;
                        });
                      }
                    });
                  }
                }
                return ne;
              });
            }
            if (Q !== null && $ !== null) {
              const ne = haversineDistance(Q, $, latitude, longitude, b);
              if (ne >= (b === "mi" ? 0.005 : 0.008) || _t > 3) {
                J = Date.now();
                setIsStationary(false);
                setR((st) => {
                  const qe = st + ne;
                  setE((He) => {
                    if (He) {
                      return {
                        ...He,
                        distance: qe,
                      };
                    }
                    return null;
                  });
                  return qe;
                });
                Q = latitude;
                $ = longitude;
              } else if (Date.now() - J > 180000) {
                setIsStationary(true);
              }
            } else {
              Q = latitude;
              $ = longitude;
            }
          }
        },
        (Ee) => {
          console.warn("GPS location tracking error:", Ee);
        },
        {
          enableHighAccuracy: G,
          timeout: 20000,
          maximumAge: 3000,
        },
      );
    }
    const ge = setInterval(() => {
      if (Q && $) {
        reverseGeocode(Q, $).then((address) => {
          setS_1((Fe) => {
            if (Fe) {
              return {
                ...Fe,
                address,
              };
            }
            return null;
          });
        });
      }
    }, 35000);
    return () => {
      clearInterval(Y);
      clearInterval(ge);
      if (X !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(X);
      }
      releaseWakeLock();
      setIsWakeLockActive(false);
    };
  }, [e?.id, e?.trackingMode, z, G, b]);
  const lastKnownOdoForVehicle = (D) => {
    const Y = Re(D);
    return Y?.end?.value || null;
  };
  const ta = () => {
    if (g === "gps") {
      set_(true);
    } else {
      setM("start");
      setPrefilledValue(null);
      setU(true);
    }
  };
  const onStartGpsTrip = (D) => {
    if (D.vehicle) {
      onAddVehicle(D.vehicle);
    }
    const Y = {
      id: crypto.randomUUID(),
      start: {
        value: D.startOdo,
        timestamp: new Date().toISOString(),
        location: D.startLocation,
      },
      distance: 0,
      status: "active",
      tripType: D.tripType,
      clientName: D.clientName,
      notes: D.notes,
      registrationNumber: D.vehicle,
      trackingMode: "gps",
      startLocation: D.startLocation,
    };
    setR(0);
    setDurationSeconds(0);
    setCurrentSpeed(0);
    setS_1(D.startLocation);
    setE(Y);
    set_(false);
    if (
      isPlaceholderAddress(D.startLocation?.address) &&
      D.startLocation?.latitude &&
      D.startLocation?.longitude &&
      D.startLocation.latitude !== 0
    ) {
      reverseGeocode(D.startLocation.latitude, D.startLocation.longitude).then((X) => {
        if (X && !isPlaceholderAddress(X)) {
          setE((ge) => {
            if (ge) {
              return {
                ...ge,
                startLocation: {
                  ...ge.startLocation,
                  address: X,
                },
                start: {
                  ...ge.start,
                  location: ge.start.location
                    ? {
                        ...ge.start.location,
                        address: X,
                      }
                    : undefined,
                },
              };
            }
            return null;
          });
        }
      });
    }
    showNotification("GPS tracking active! Drive safely.", "success");
  };
  const onEndTrip = async () => {
    playStopTone();
    vibrate("stop");
    if (
      e?.startLocation &&
      e.startLocation.latitude &&
      e.startLocation.longitude &&
      e.startLocation.latitude !== 0
    ) {
      const $ = e.startLocation.address;
      if (isPlaceholderAddress($)) {
        try {
          const J = await reverseGeocode(e.startLocation.latitude, e.startLocation.longitude);
          if (J && !isPlaceholderAddress(J)) {
            setE((X) => {
              if (X) {
                return {
                  ...X,
                  startLocation: {
                    ...X.startLocation,
                    address: J,
                  },
                  start: {
                    ...X.start,
                    location: X.start.location
                      ? {
                          ...X.start.location,
                          address: J,
                        }
                      : undefined,
                  },
                };
              }
              return null;
            });
          }
        } catch {}
      }
    }
    if (S && S.latitude !== 0) {
      try {
        const $ = await reverseGeocode(S.latitude, S.longitude);
        if ($ && !isPlaceholderAddress($)) {
          setS_1((J) => {
            if (J) {
              return {
                ...J,
                address: $,
              };
            }
            return null;
          });
        }
      } catch {}
    }
    const D = loadHomeWorkConfig();
    const Y =
      S && S.latitude !== 0
        ? {
            ...S,
          }
        : undefined;
    const Q = classifyHomeWorkTrip(e?.startLocation, Y, D);
    if (Q.recommendedType) {
      setE(($) => {
        if ($) {
          return {
            ...$,
            tripType: Q.recommendedType || $.tripType,
            notes: $.notes || Q.reason || undefined,
          };
        }
        return null;
      });
    }
    setT(true);
  };
  const onSave = (D) => {
    setT(false);
    const Y = {
      ...D,
      verificationStatus: D.verificationStatus || "pending",
    };
    const Q = s.filter((J) => !J.id.startsWith("demo-"));
    const $ = [Y, ...Q];
    setS($);
    setE(null);
    An($);
    setVe(Y);
    setWs(true);
    showNotification(`Trip saved (${Y.distance} ${b}) — added to verification queue`, "success");
  };
  const onPassengerModeToggle = (D) => {
    setSe(D);
    localStorage.setItem(PASSENGER_MODE_KEY, String(D));
    showNotification(
      D
        ? "Passenger Mode Active: Auto-tracking paused while riding as a passenger."
        : "Passenger Mode Disabled: Normal vehicle tracking active.",
      "success",
    );
  };
  const Un = async (D, Y, Q) => {
    var Kt;
    if (se) {
      showNotification(
        "Passenger Mode is active. Auto-tracking skipped to prevent logging passenger travel.",
        "error",
      );
      return;
    }
    if (e) {
      showNotification("A trip is already currently active.", "success");
      return;
    }
    let $ = D;
    let J = te.defaultTripType || "work";
    let X = Y;
    if (Y || Q) {
      const ne = matchVehicleForDevice(Y, te, Q);
      if (ne.vehicleReg && !D) {
        $ = ne.vehicleReg;
      }
      if (ne.tripType) {
        J = ne.tripType;
      }
      if ((Kt = ne.matchedMapping) != null && Kt.deviceName) {
        X = ne.matchedMapping.deviceName;
      }
    }
    const ge = ($ || te.vehicleReg || a[0] || "MY-CAR").toUpperCase();
    onAddVehicle(ge);
    const Se = lastKnownOdoForVehicle(ge) || 0;
    let We = J;
    let Ee = {
      latitude: 0,
      longitude: 0,
      timestamp: new Date().toISOString(),
      address: "Acquiring GPS location...",
    };
    try {
      const ne = await getCurrentPosition(G);
      const st = ne.coords.latitude;
      const qe = ne.coords.longitude;
      const accuracy = ne.coords.accuracy;
      Ee = {
        latitude: st,
        longitude: qe,
        accuracy,
        timestamp: new Date().toISOString(),
        address: `${st.toFixed(4)}°, ${qe.toFixed(4)}°`,
      };
      try {
        const gt = await Promise.race([
          reverseGeocode(st, qe),
          new Promise((resolve, reject) => setTimeout(() => reject(new Error("timeout")), 1800)),
        ]);
        if (gt && !isPlaceholderAddress(gt)) {
          Ee.address = gt;
        }
      } catch {}
      const Zt = loadHomeWorkConfig();
      if (Zt.autoDetectHomeAsPersonal && isNearPlace(Ee, Zt.home)) {
        We = "personal";
      }
      reverseGeocode(st, qe)
        .then((gt) => {
          if (gt && !isPlaceholderAddress(gt)) {
            const Ae = loadHomeWorkConfig();
            const mn = {
              latitude: st,
              longitude: qe,
              accuracy,
              timestamp: new Date().toISOString(),
              address: gt,
            };
            const St = classifyHomeWorkTrip(mn, null, Ae);
            setS_1((at) => {
              if (at) {
                return {
                  ...at,
                  address: gt,
                };
              }
              return mn;
            });
            setE((at) => {
              if (!at) {
                return null;
              }
              const jn = St.isHomeTrip && Ae.autoDetectHomeAsPersonal ? "personal" : at.tripType;
              return {
                ...at,
                tripType: jn,
                startLocation: {
                  ...(at.startLocation || Ee),
                  latitude: st,
                  longitude: qe,
                  address: gt,
                },
                start: {
                  ...at.start,
                  location: {
                    ...(at.start?.location || Ee),
                    latitude: st,
                    longitude: qe,
                    address: gt,
                  },
                },
              };
            });
          }
        })
        .catch((gt) => {
          console.warn("Background reverse geocode failed on auto-start:", gt);
        });
    } catch (error) {
      console.warn("Could not get initial GPS location for Bluetooth trip", error);
    }
    const Fe = {
      id: crypto.randomUUID(),
      start: {
        value: Se,
        timestamp: new Date().toISOString(),
        location: Ee,
      },
      distance: 0,
      status: "active",
      tripType: We,
      registrationNumber: ge,
      trackingMode: "gps",
      triggerSource: "bluetooth",
      startLocation: Ee,
    };
    setR(0);
    setDurationSeconds(0);
    setCurrentSpeed(0);
    setS_1(Ee);
    setE(Fe);
    playStartTone();
    vibrate("start");
    const Pe = loadHomeWorkConfig();
    const tt = Pe.autoDetectHomeAsPersonal && isNearPlace(Ee, Pe.home);
    const Ne = X ? ` (${X})` : "";
    const _t = tt
      ? `🚗 Connected to Car${Ne}! Auto-tracking started for ${ge} (Home: Personal Commute)`
      : `🚗 Connected to Car${Ne}! Auto-tracking started for ${ge}`;
    showNotification(_t, "success");
  };
  const Zr = async () => {
    if (!e) {
      showNotification("No active trip to end.", "error");
      return;
    }
    if (e.trackingMode === "gps") {
      if (te.autoEndTrip) {
        const D = Math.round(R * 10) / 10;
        const Y = e.start.value + Math.round(D);
        let Q = S?.address;
        if ((!Q || isPlaceholderAddress(Q)) && S && S.latitude !== 0) {
          try {
            Q = await reverseGeocode(S.latitude, S.longitude);
          } catch {}
        }
        let $ = e.startLocation || e.start.location;
        let J = $?.address;
        if ((!J || isPlaceholderAddress(J)) && $ && $.latitude && $.longitude && $.latitude !== 0) {
          try {
            const Ne = await reverseGeocode($.latitude, $.longitude);
            if (Ne && !isPlaceholderAddress(Ne)) {
              J = Ne;
            }
          } catch (error) {
            console.warn("Could not reverse geocode start location on auto trip end", error);
          }
        }
        if ($ && J) {
          $ = {
            ...$,
            address: J,
          };
        }
        const X = S
          ? {
              ...S,
              address: Q,
            }
          : undefined;
        const ge = loadHomeWorkConfig();
        const Se = classifyHomeWorkTrip($, X, ge);
        let We = e.tripType || "work";
        let Ee = e.notes;
        if (Se.recommendedType) {
          We = Se.recommendedType;
          if (!Ee && Se.reason) {
            Ee = Se.reason;
          }
        }
        const Fe = {
          ...e,
          status: "completed",
          distance: D,
          tripType: We,
          notes: Ee,
          start: {
            ...e.start,
            location: $,
          },
          startLocation: $,
          end: {
            value: Y,
            timestamp: new Date().toISOString(),
            location: X,
          },
          endLocation: X,
        };
        onSave(Fe);
        playStopTone();
        vibrate("stop");
        const Pe =
          Se.isHomeTrip && ge.autoDetectHomeAsPersonal
            ? `🚗 Car Disconnected — Saved as Personal (Home Commute, ${D} ${b})`
            : `🚗 Car Disconnected — Trip saved (${D} ${b})`;
        showNotification(Pe, "success");
        const tt = Fe.registrationNumber || te.vehicleReg || a[0];
        if (tt) {
          const Ne = getCalibrationStatus(tt, s);
          if (Ne.isOverdue) {
            setTimeout(() => {
              notifyCalibrationDue(tt, Ne.daysSinceLastCalibration);
              showNotification(
                `⚠️ ${tt} is due for monthly odometer calibration (${Ne.daysSinceLastCalibration} days since last sync)`,
                "error",
              );
            }, 1200);
          }
        }
      } else {
        onEndTrip();
        showNotification("🚗 Car Disconnected — Review and save your trip", "success");
        const D = e.registrationNumber || te.vehicleReg || a[0];
        if (D) {
          const Y = getCalibrationStatus(D, s);
          if (Y.isOverdue) {
            setTimeout(() => {
              notifyCalibrationDue(D, Y.daysSinceLastCalibration);
            }, 1200);
          }
        }
      }
    } else {
      ot();
    }
  };
  const onViewMap = (D) => {
    setJe(D);
    setBe(true);
  };
  const onViewAllMap = () => {
    if (s.length > 0) {
      setJe(s[0]);
      setBe(true);
    } else {
      showNotification("No trips recorded yet to show on map.", "error");
    }
  };
  const onUpdateTrip = (D) => {
    Zn(D);
    setJe(D);
  };
  const ot = () => {
    setM("end");
    setPrefilledValue(null);
    setU(true);
  };
  const onAddVehicle = (D) => {
    if (!D) {
      return;
    }
    const Y = D.toUpperCase();
    if (!a.includes(Y)) {
      setA((Q) => [...Q, Y].sort());
    }
  };
  const onDeleteVehicle = (D) => {
    setA((Y) => Y.filter((Q) => Q !== D));
  };
  const onEditVehicle = (D, Y) => {
    const Q = D.toUpperCase();
    const $ = Y.toUpperCase();
    setA((X) =>
      X.map((ge) => {
        if (ge === Q) {
          return $;
        }
        return ge;
      }).sort(),
    );
    const J = s.map((X) => {
      if (X.registrationNumber === Q) {
        return {
          ...X,
          registrationNumber: $,
        };
      }
      return X;
    });
    setS(J);
    if (e && e.registrationNumber === Q) {
      setE({
        ...e,
        registrationNumber: $,
      });
    }
    An(J);
  };
  const An = async (D) => {
    const Y = D.map((J) => ({
      ...J,
      start: {
        ...J.start,
        imageUrl: undefined,
      },
      end: J.end
        ? {
            ...J.end,
            imageUrl: undefined,
          }
        : undefined,
    }));
    const $ = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        tripCount: D.length,
        sizeBytes: new Blob([JSON.stringify(Y)]).size,
        data: Y,
      },
      ...zt,
    ].slice(0, 6);
    setZt($);
    if (pt) {
      const J = await writeBackupToFolder(Y, true);
      if (!J.success && J.error === "permission") {
        setRr(true);
      } else if (J.success) {
        setRr(false);
      }
    }
  };
  const Re = (D) => {
    const Y = s.filter((Q) => Q.registrationNumber === D && Q.status === "completed" && Q.end);
    if (Y.length === 0) {
      return null;
    }
    return Y.sort((Q, $) => {
      const J = new Date(Q.end.timestamp).getTime();
      return new Date($.end.timestamp).getTime() - J;
    })[0];
  };
  const bt = (D, Y, Q, clientName_1, J, X) => {
    if (X) {
      onAddVehicle(X);
    }
    if (m === "start") {
      if (X) {
        const ge = Re(X);
        if (ge && ge.end && D > ge.end.value) {
          const gap = D - ge.end.value;
          if (gap > 0) {
            setHn({
              value: D,
              imageUrl: Y,
              notes: Q,
              clientName: clientName_1,
              tripType: J,
              registrationNumber: X,
            });
            setEn({
              gap,
              lastOdo: ge.end.value,
              currentOdo: D,
              vehicle: X,
              lastTime: ge.end.timestamp,
            });
            setU(false);
            setHi(true);
            return;
          }
        }
      }
      Gr({
        value: D,
        imageUrl: Y,
        notes: Q,
        clientName: clientName_1,
        tripType: J,
        registrationNumber: X,
      });
    } else {
      if (!e) {
        return;
      }
      const ge = {
        value: D,
        timestamp: new Date().toISOString(),
        imageUrl: Y,
      };
      const Se = e.start.value;
      const We = D - Se;
      const notes = Q || e.notes;
      const clientName = clientName_1 || e.clientName;
      const Pe = J || e.tripType || "work";
      const registrationNumber = X || e.registrationNumber;
      const Ne = {
        ...e,
        start: {
          ...e.start,
          value: Se,
        },
        end: ge,
        distance: We < 0 ? 0 : We,
        status: "completed",
        verificationStatus: "pending",
        notes,
        clientName,
        tripType: Pe,
        registrationNumber,
      };
      const _t = s.filter((ne) => !ne.id.startsWith("demo-"));
      const Kt = [Ne, ..._t];
      setS(Kt);
      setE(null);
      An(Kt);
      setU(false);
      setVe(Ne);
      setWs(true);
    }
  };
  const Gr = (D) => {
    const Y = {
      value: D.value,
      timestamp: new Date().toISOString(),
      imageUrl: D.imageUrl,
    };
    const Q = {
      id: crypto.randomUUID(),
      start: Y,
      status: "active",
      notes: D.notes,
      clientName: D.clientName,
      tripType: D.tripType || "work",
      registrationNumber: D.registrationNumber,
    };
    setE(Q);
    setU(false);
  };
  const Ks = () => {
    setWs(false);
    if (ve && ve.end) {
      if (g === "gps") {
        set_(true);
      } else {
        setM("start");
        setPrefilledValue(ve.end.value);
        setU(true);
      }
    }
  };
  const onIgnore = () => {
    setHi(false);
    if (hn) {
      Gr(hn);
      setHn(null);
    }
  };
  const onAddMissed = () => {
    setHi(false);
    if (!En || !hn) {
      return;
    }
    const D = {
      id: crypto.randomUUID(),
      status: "completed",
      start: {
        value: En.lastOdo,
        timestamp: En.lastTime,
      },
      end: {
        value: En.currentOdo,
        timestamp: new Date().toISOString(),
        imageUrl: hn.imageUrl,
      },
      distance: En.gap,
      tripType: "work",
      registrationNumber: En.vehicle,
      notes: "Missed trip automatically detected",
      clientName: "",
    };
    setInitialTrip(D);
    setYe(true);
  };
  const onCancel = () => {
    setU(false);
    setPrefilledValue(null);
  };
  const ir = (D) => {
    D?.stopPropagation();
    setRe(true);
  };
  const onAddManual = () => {
    setInitialTrip(null);
    setYe(true);
  };
  const onEdit = (D) => {
    setInitialTrip(D);
    setYe(true);
  };
  const qr = (D) => {
    const Y = s.filter((Q) => Q.id !== D);
    if (Y.length === 0) {
      setS(DEMO_TRIPS);
    } else {
      setS(Y);
    }
    setYe(false);
    An(Y);
  };
  const Zn = (D) => {
    if (D.registrationNumber) {
      onAddVehicle(D.registrationNumber);
    }
    let Y = [...s];
    if (s.some(($) => $.id === D.id)) {
      Y = s.map(($) => {
        if ($.id === D.id) {
          return D;
        }
        return $;
      });
    } else {
      Y = Y.filter(($) => !$.id.startsWith("demo-"));
      Y = [D, ...Y];
    }
    setS(Y);
    An(Y);
    if (hn) {
      setTimeout(() => {
        Gr(hn);
        setHn(null);
      }, 100);
    }
  };
  const onClose = () => {
    setYe(false);
    if (hn && !e) {
      Gr(hn);
      setHn(null);
    }
  };
  const onExport = () => {
    const D = s.filter((ne) => {
      if (dt && ne.registrationNumber !== dt) {
        return false;
      }
      const st = new Date(ne.start.timestamp);
      if (Je) {
        const qe = new Date(Je);
        qe.setHours(0, 0, 0, 0);
        if (st < qe) {
          return false;
        }
      }
      if (mt) {
        const qe = new Date(mt);
        qe.setHours(23, 59, 59, 999);
        if (st > qe) {
          return false;
        }
      }
      return true;
    });
    if (D.length === 0) {
      alert("No trips match the current date/vehicle filters to export.");
      return;
    }
    const Y = D.reduce((acc, item) => acc + (item.distance || 0), 0);
    const Q = D.filter((ne) => (ne.tripType || "work") === "work").reduce(
      (acc, item) => acc + (item.distance || 0),
      0,
    );
    const $ = Y > 0 ? ((Q / Y) * 100).toFixed(2) : "0.00";
    const D_length = D.length;
    const X = b === "km" ? "km" : "mi";
    const ge = D.filter((ne) => {
      switch (ze) {
        case "unverified":
          return ne.verificationStatus === "pending";
        case "gps":
          return ne.trackingMode === "gps" || ne.triggerSource === "bluetooth";
        default:
          return ze === "all" || (ne.tripType || "work") === ze;
      }
    });
    const Se = [
      "Start Date",
      "Start Time",
      `Start Odometer (${X})`,
      "End Date",
      "End Time",
      `End Odometer (${X})`,
      `Distance (${X})`,
      "Registration",
      "Type",
      "Tracking Mode",
      "Client Name",
      "Start Location",
      "End Location",
      "Status",
      "Reason/Notes",
    ];
    const We = typeof navigator !== "undefined" ? navigator.language : undefined;
    const Ee = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const Fe = (ne) => {
      if (!ne) {
        return "All";
      }
      const [st, qe, He] = ne.split("-").map(Number);
      return new Date(st, qe - 1, He).toLocaleDateString(We);
    };
    const tt = [
      [
        '"LOGBOOK SUMMARY"',
        `"Period: ${Fe(Je)} to ${Fe(mt)}"`,
        `"Vehicle: ${dt || "All"}"`,
        `"Total Trips: ${D_length}"`,
        `"Total ${X === "km" ? "Km" : "Mi"}: ${Y}"`,
        `"Business ${X === "km" ? "Km" : "Mi"}: ${Q}"`,
        `"Business Use: ${$}%"`,
        "",
      ].join(`
`),
      Se.join(","),
      ...ge.map((ne) => {
        var jn;
        var Mn;
        const st = new Date(ne.start.timestamp);
        const qe = ne.end ? new Date(ne.end.timestamp) : null;
        ne.notes && `${ne.notes.replace(/"/g, '""')}`;
        const He = ne.clientName ? `"${ne.clientName.replace(/"/g, '""')}"` : "";
        const Zt = ne.registrationNumber ? `"${ne.registrationNumber}"` : "";
        const gt =
          (jn = ne.startLocation) != null && jn.address
            ? `"${ne.startLocation.address.replace(/"/g, '""')}"`
            : "";
        const Ae =
          (Mn = ne.endLocation) != null && Mn.address
            ? `"${ne.endLocation.address.replace(/"/g, '""')}"`
            : "";
        const mn = ne.isCalibration
          ? "ATO Calibration"
          : ne.trackingMode === "gps"
            ? "GPS"
            : "Camera";
        const at = `"${ne.isCalibration ? "[CALIBRATION SYNC] " : ""}${ne.notes ? ne.notes.replace(/"/g, '""') : ""}"`;
        return [
          `"${st.toLocaleDateString(We)}"`,
          `"${st.toLocaleTimeString(We, Ee)}"`,
          ne.start.value,
          qe ? `"${qe.toLocaleDateString(We)}"` : "",
          qe ? `"${qe.toLocaleTimeString(We, Ee)}"` : "",
          ne.end?.value || "",
          ne.distance || 0,
          Zt,
          ne.tripType || "work",
          `"${mn}"`,
          He,
          gt,
          Ae,
          `"${ne.status}"`,
          at,
        ].join(",");
      }),
    ].join(`
`);
    const Ne = new Blob([tt], {
      type: "text/csv;charset=utf-8;",
    });
    const _t = document.createElement("a");
    const Kt = URL.createObjectURL(Ne);
    _t.setAttribute("href", Kt);
    _t.setAttribute("download", `easylog_logbook_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(_t);
    _t.click();
    document.body.removeChild(_t);
  };
  const onArchiveAndReset = () => {
    const D = {
      timestamp: new Date().toISOString(),
      history: s,
      activeTrip: e,
      settings: {
        vehicles: a,
        distanceUnit: b,
      },
    };
    try {
      const Y = new Blob([JSON.stringify(D, null, 2)], {
        type: "application/json",
      });
      const Q = URL.createObjectURL(Y);
      const $ = document.createElement("a");
      $.href = Q;
      $.download = `easylog-archive-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild($);
      $.click();
      document.body.removeChild($);
      URL.revokeObjectURL(Q);
      setS(DEMO_TRIPS);
      setE(null);
      setA([]);
      setZt([]);
      localStorage.clear();
      localStorage.setItem(TRIPS_KEY, JSON.stringify(DEMO_TRIPS));
      localStorage.setItem(UNIT_KEY, b);
      setXe(false);
      showNotification("System archived and reset successfully.", "success");
    } catch {
      alert("Failed to generate archive. Data was NOT reset.");
    }
  };
  const onRestoreSnapshot = (D, Y) => {
    try {
      if (D.data) {
        setS(D.data);
        setE(null);
        An(D.data);
        showNotification("Snapshot restored successfully");
        setXe(false);
      } else if (Y) {
        readFolderBackup(D.id).then((Q) => {
          if (Q) {
            setS(Q);
            setE(null);
            An(Q);
            showNotification("External snapshot restored");
            setXe(false);
          } else {
            showNotification("Failed to load external file", "error");
          }
        });
      }
    } catch {
      showNotification("Failed to restore snapshot", "error");
    }
  };
  const onDownloadSnapshot = async (D) => {
    let D_data = D.data;
    if (!D_data || D_data.length === 0) {
      D_data = (await readFolderBackup(D.id)) || [];
    }
    const Q = new Blob([JSON.stringify(D_data, null, 2)], {
      type: "application/json",
    });
    const $ = URL.createObjectURL(Q);
    const J = document.createElement("a");
    J.href = $;
    J.download = `easylog-snapshot-${D.timestamp.split("T")[0]}.json`;
    document.body.appendChild(J);
    J.click();
    document.body.removeChild(J);
    URL.revokeObjectURL($);
  };
  const onRestoreFile = (D) => {
    const Y = new FileReader();
    Y.onload = (Q) => {
      var X;
      try {
        const ge = Q.target?.result;
        const Se = JSON.parse(ge);
        if (Se.history || Se.activeTrip) {
          if (Se.history && Array.isArray(Se.history)) {
            setS(Se.history);
          }
          if (Se.activeTrip) {
            setE(Se.activeTrip);
          } else {
            setE(null);
          }
          if (Se.settings?.vehicles && Array.isArray(Se.settings.vehicles)) {
            setA(Se.settings.vehicles);
          }
          if ((X = Se.settings) != null && X.distanceUnit) {
            setB(Se.settings.distanceUnit);
          }
          showNotification("Full archive restored successfully", "success");
        } else if (Array.isArray(Se)) {
          setS(Se);
          setE(null);
          showNotification("Trips restored successfully", "success");
        } else {
          throw new Error("Unknown file format");
        }
        setXe(false);
      } catch {
        alert("Invalid backup file format.");
      }
    };
    Y.readAsText(D);
  };
  const onDisconnectFolder = async () => {
    await disconnectBackupFolder();
    setPt(false);
    setConnectedFolderName(null);
    setExternalBackups([]);
    setRr(false);
    showNotification("Disconnected from backup folder", "success");
  };
  const onInstall = () => {
    if (un) {
      un.prompt();
      un.userChoice.then((D) => {
        if (D.outcome === "accepted") {
          setUn(null);
        }
      });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      {js && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl shadow-lg flex items-center animate-fade-in-up ${js.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}
        >
          {js.type === "success" ? (
            <CircleCheck size={18} className="mr-2 text-green-400" />
          ) : (
            <CircleAlert size={18} className="mr-2" />
          )}
          <span className="text-sm font-medium">{js.message}</span>
        </div>
      )}
      <header className="bg-white shadow-sm sticky top-0 z-20 safe-area-top">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
              <CarFront size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                EasyLog
              </h1>
              <div className="text-[10px] text-gray-400 font-medium leading-none">
                Smart Mileage Tracker
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <InstallAppButton variant="header" />
            <button
              onClick={() => Gs()}
              className={`p-2 rounded-full transition relative ${overdueVehicles.length > 0 ? "text-amber-700 bg-amber-100 hover:bg-amber-200 animate-pulse" : "text-gray-500 hover:text-amber-700 hover:bg-amber-50"}`}
              title={
                overdueVehicles.length > 0
                  ? `ATO Monthly Calibration Due for ${overdueVehicles[0].vehicleReg}`
                  : "ATO Odometer Calibration & Cluster Alignment"
              }
            >
              <Gauge size={20} />
              {overdueVehicles.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                  !
                </span>
              )}
            </button>
            {unverifiedTrips.length > 0 && (
              <button
                onClick={() => setGe(true)}
                className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-full transition relative"
                title={`${unverifiedTrips.length} trip(s) require verification`}
              >
                <FileCheck size={20} />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unverifiedTrips.length}
                </span>
              </button>
            )}
            <button
              onClick={() => sr("guide")}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition"
              title="User Guide & Help"
            >
              <BookOpen size={20} />
            </button>
            {rr && (
              <button
                onClick={() => sr("data")}
                className="p-2 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-full transition animate-pulse"
                title="Backup Paused - Reconnect"
              >
                <HardDrive size={20} />
              </button>
            )}
            <button
              onClick={() => sr("setup")}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {!Ql && overdueVehicles.length > 0 && (
          <CalibrationDueBanner
            overdueVehicles={overdueVehicles}
            onOpenCalibration={(D) => Gs(D)}
            onDismiss={() => setQl(true)}
          />
        )}
        {unverifiedTrips.length > 0 && (
          <div
            onClick={() => setGe(true)}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-md shadow-amber-500/20 border border-amber-400/30 flex items-start justify-between gap-3 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 group animate-fade-in"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <FileCheck size={20} className="text-white" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>
                    You have {unverifiedTrips.length} trip
                    {unverifiedTrips.length === 1 ? "" : "s"} logged that require verification.
                  </span>
                </div>
                <p className="text-xs text-amber-100 leading-snug">
                  Take a minute to check personal/business classification and trip reasons before
                  committing to your final logbook.
                </p>
                <div className="text-[10px] text-amber-200 font-medium flex items-center pt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200 mr-1.5 animate-ping" />
                  <span>Included in summary total for live calculations</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(D) => {
                D.stopPropagation();
                setGe(true);
              }}
              className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center space-x-1 whitespace-nowrap active:scale-95 self-center"
            >
              <span>Review & Commit ({unverifiedTrips.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
        <section>
          {e ? (
            e.trackingMode === "gps" ? (
              <LiveTrackingHud
                trip={e}
                currentSpeed={currentSpeed}
                trackedDistance={R}
                durationSeconds={durationSeconds}
                currentLocation={S}
                gpsAccuracy={gpsAccuracy}
                isWakeLockActive={isWakeLockActive}
                distanceUnit={b}
                isStationary={isStationary}
                onEndTrip={onEndTrip}
                onAbortTrip={() => ir()}
                onOpenMap={() => onViewMap(e)}
              />
            ) : (
              <div className="relative bg-white rounded-2xl shadow-lg border-l-4 border-indigo-500 overflow-hidden transform transition-all hover:shadow-xl">
                <button
                  onClick={ir}
                  className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
                  title="Discard Trip"
                >
                  <X size={20} />
                </button>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        ● Trip in Progress
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 mt-2">Current Trip</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {e.tripType && (
                          <div
                            className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${e.tripType === "personal" ? "bg-green-50 text-green-700" : "bg-indigo-50 text-indigo-700"}`}
                          >
                            {e.tripType === "personal" ? (
                              <User size={12} className="mr-1" />
                            ) : (
                              <Briefcase size={12} className="mr-1" />
                            )}
                            {e.tripType === "personal" ? "Personal" : "Work"}
                          </div>
                        )}
                        {e.registrationNumber && (
                          <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {e.registrationNumber}
                          </div>
                        )}
                      </div>
                      {e.clientName && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Briefcase size={14} className="mr-1.5 text-gray-400" />
                          {e.clientName}
                        </div>
                      )}
                    </div>
                    <div className="text-right mt-6">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">
                        Started at
                      </div>
                      <div className="text-xl font-mono font-bold text-gray-800">
                        {e.start.value.toLocaleString()} {b}
                      </div>
                      {!e.start.imageUrl && (
                        <div className="text-[10px] text-gray-400 mt-1 font-medium bg-gray-100 px-1 rounded inline-block">
                          Entered Manually
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={ot}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-semibold flex items-center justify-center transition"
                    >
                      <Square size={18} className="mr-2" />
                      End Trip
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tracking Mode
                </span>
                <div className="flex bg-gray-200/80 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setG("gps")}
                    className={`px-3 py-1.5 rounded-lg flex items-center transition-all ${g === "gps" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <Navigation size={12} className="mr-1.5 text-emerald-600" />
                    Automatic GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setG("camera")}
                    className={`px-3 py-1.5 rounded-lg flex items-center transition-all ${g === "camera" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <Camera size={12} className="mr-1.5 text-indigo-600" />
                    Camera Only
                  </button>
                </div>
              </div>
              {se && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-900 animate-fade-in shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
                      <UserX size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-amber-950">Passenger Mode Active</div>
                      <div className="text-[11px] text-amber-800">
                        Auto-tracking paused (travelling as a passenger)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPassengerModeToggle(false)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] rounded-lg transition shrink-0"
                  >
                    Turn Off
                  </button>
                </div>
              )}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/70 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <button
                  type="button"
                  onClick={() => setC(true)}
                  className="flex items-center space-x-2.5 text-left group overflow-hidden pr-2"
                >
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Bluetooth size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                      <span className="truncate">Car Bluetooth Auto-Start</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                        {te.deviceName ? te.deviceName : "Setup"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">
                      {te.deviceName
                        ? `Tracks only in your car (${te.vehicleReg || "All"}) • Passenger rides ignored`
                        : "Only track in your car • Ignores passenger rides"}
                    </p>
                  </div>
                </button>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPassengerModeToggle(!se)}
                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-semibold flex items-center transition ${se ? "bg-amber-100 border-amber-300 text-amber-800 shadow-xs" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    title="Toggle Passenger Mode (disables tracking while in friends' cars or buses)"
                  >
                    <UserX size={12} className="mr-1" />
                    Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setC(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
                    title="Configure Car Bluetooth & Routines"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              </div>
              {g === "gps" ? (
                <button
                  onClick={ta}
                  className="w-full bg-white rounded-2xl shadow-sm border-2 border-dashed border-emerald-300 p-8 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Navigation size={32} />
                  </div>
                  <span className="text-lg font-bold text-gray-800">Start GPS Trip</span>
                  <span className="text-sm text-gray-500 mt-1">
                    Automatic live distance tracking
                  </span>
                </button>
              ) : (
                <button
                  onClick={ta}
                  className="w-full bg-white rounded-2xl shadow-sm border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition group"
                >
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Play size={32} className="ml-1" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">Start New Trip</span>
                  <span className="text-sm text-gray-500 mt-1">Tap to scan odometer</span>
                </button>
              )}
            </div>
          )}
        </section>
        <TripList
          trips={s}
          activeTrip={e}
          onExport={onExport}
          onEdit={onEdit}
          onAddManual={onAddManual}
          filterType={ze}
          onFilterTypeChange={setZe}
          startDate={Je}
          onStartDateChange={setJe_1}
          endDate={mt}
          onEndDateChange={setMt}
          vehicles={a}
          filterRego={dt}
          onFilterRegoChange={setDt}
          distanceUnit={b}
          onViewMap={onViewMap}
          onViewAllMap={onViewAllMap}
          onOpenVerificationQueue={() => setGe(true)}
        />
        <footer className="pt-2 pb-6 text-center text-xs text-gray-400 space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => sr("guide")}
              className="hover:text-indigo-600 font-medium transition flex items-center"
            >
              <BookOpen size={12} className="mr-1" />
              User Guide
            </button>
            <span>•</span>
            <button
              onClick={() => sr("automation")}
              className="hover:text-indigo-600 font-medium transition flex items-center"
            >
              <Zap size={12} className="mr-1 text-amber-500" />
              GPS & BT Automation
            </button>
            <span>•</span>
            <button
              onClick={() => sr("about")}
              className="hover:text-indigo-600 font-medium transition flex items-center"
            >
              <Info size={12} className="mr-1" />
              v2.0.0
            </button>
          </div>
          <p className="text-[10px] text-gray-400">EasyLog • 100% on-device private logbook</p>
        </footer>
      </main>
      <MissedTripModal
        isOpen={Hi}
        onClose={() => {
          setHi(false);
          setHn(null);
        }}
        onAddMissed={onAddMissed}
        onIgnore={onIgnore}
        data={En}
        distanceUnit={b}
      />
      {Ws && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <CircleCheck size={32} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">Trip Saved!</h3>
              <p className="text-gray-500 text-sm mt-1">Your trip has been logged successfully.</p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={Ks}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center"
              >
                <CornerDownRight size={18} className="mr-2" />
                Start Next Trip
              </button>
              <button
                onClick={() => setWs(false)}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {_ && (
        <StartTripModal
          isOpen={_}
          onClose={() => set_(false)}
          onStartGpsTrip={onStartGpsTrip}
          vehicles={a}
          onAddVehicle={onAddVehicle}
          lastKnownOdoForVehicle={lastKnownOdoForVehicle}
          distanceUnit={b}
        />
      )}
      {T && e && (
        <TripSummaryModal
          isOpen={T}
          trip={e}
          trackedDistance={R}
          durationSeconds={durationSeconds}
          endLocation={S}
          distanceUnit={b}
          allTrips={s}
          onSave={onSave}
          onCancel={() => setT(false)}
        />
      )}
      {u && (
        <OdometerScanner
          mode={m}
          onScanComplete={bt}
          onCancel={onCancel}
          initialData={m === "end" ? e : null}
          vehicles={a}
          onAddVehicle={onAddVehicle}
          distanceUnit={b}
          prefilledValue={prefilledValue}
        />
      )}
      <TripEditor
        isOpen={ye}
        onClose={onClose}
        onSave={Zn}
        onDelete={qr}
        initialTrip={initialTrip}
        vehicles={a}
        distanceUnit={b}
        allTrips={s}
      />
      <SettingsModal
        isOpen={Xe}
        onClose={() => setXe(false)}
        initialTab={initialTab}
        backups={zt}
        externalBackups={externalBackups}
        hasExternalStorage={pt}
        connectedFolderName={connectedFolderName}
        onConnectFolder={connectBackupFolder}
        onRefreshExternal={() => listFolderBackups().then(setExternalBackups)}
        onRestoreSnapshot={onRestoreSnapshot}
        onDownloadSnapshot={onDownloadSnapshot}
        onRestoreFile={onRestoreFile}
        installPrompt={un}
        onInstall={onInstall}
        onArchiveAndReset={onArchiveAndReset}
        vehicles={a}
        onAddVehicle={onAddVehicle}
        onDeleteVehicle={onDeleteVehicle}
        onEditVehicle={onEditVehicle}
        distanceUnit={b}
        onDistanceUnitChange={setB}
        onDisconnectFolder={onDisconnectFolder}
        trackingMode={g}
        onTrackingModeChange={setG}
        keepScreenAwake={z}
        onKeepScreenAwakeChange={setZ}
        highAccuracy={G}
        onHighAccuracyChange={setG_1}
        bluetoothConfig={te}
        onOpenBluetoothSetup={() => {
          setXe(false);
          setC(true);
        }}
        passengerMode={se}
        onPassengerModeToggle={onPassengerModeToggle}
        isTripActive={!!e}
        onSimulateConnect={() => Un()}
        onSimulateDisconnect={() => Zr()}
        onOpenCalibration={(D) => Gs(D)}
        showNotification={showNotification}
      />
      {C && (
        <BluetoothSetupModal
          isOpen={C}
          onClose={() => setC(false)}
          config={te}
          onSaveConfig={(D) => {
            setTe(D);
            saveBluetoothConfig(D);
          }}
          vehicles={a}
          onAddVehicle={onAddVehicle}
          isTripActive={!!e}
          onSimulateConnect={(D, Y, Q) => Un(D, Y, Q)}
          onSimulateDisconnect={() => Zr()}
          showNotification={showNotification}
        />
      )}
      {be && (
        <RouteMapModal
          isOpen={be}
          onClose={() => setBe(false)}
          trip={je || e || (s.length > 0 ? s[0] : null)}
          allTrips={s}
          distanceUnit={b}
          onUpdateTrip={onUpdateTrip}
          showNotification={showNotification}
        />
      )}
      {Ge && (
        <VerificationQueue
          isOpen={Ge}
          onClose={() => setGe(false)}
          unverifiedTrips={unverifiedTrips}
          vehicles={a}
          distanceUnit={b}
          onCommitTrip={onCommitTrip}
          onCommitAll={onCommitAll}
          onUpdateTrip={Zn}
          onDeleteTrip={qr}
          onViewMap={onViewMap}
          onOpenFullEditor={(D) => {
            setGe(false);
            onEdit(D);
          }}
          showNotification={showNotification}
        />
      )}
      {Ot && (
        <CalibrationModal
          isOpen={Ot}
          onClose={() => setOt(false)}
          vehicles={a}
          selectedVehicle={selectedVehicle}
          history={s}
          onSaveCalibrationTrip={(D) => {
            Zn(D);
            setQl(false);
          }}
          lastKnownOdoForVehicle={lastKnownOdoForVehicle}
          distanceUnit={b}
          showNotification={showNotification}
        />
      )}
      <OfflineBanner />
    </div>
  );
}
