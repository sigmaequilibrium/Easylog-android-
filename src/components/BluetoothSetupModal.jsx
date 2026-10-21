import { useEffect, useMemo, useState } from "react";
import {
  Bluetooth,
  Car,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Copy,
  Cpu,
  Download,
  FileCode,
  PenLine,
  Play,
  Plus,
  Radio,
  RadioTower,
  Search,
  Shield,
  SlidersVertical,
  Smartphone,
  Square,
  Trash2,
  TriangleAlert,
  UserX,
  X,
  Zap,
} from "lucide-react";
import {
  CAR_AUDIO_PRESETS,
  buildBluetoothAutoStartUrl,
  connectBleDevice,
  disconnectBleDevice,
  formatMacInput,
  generateMacFromName,
  getConnectedBleDeviceName,
  isWebBluetoothSupported,
  normalizeMacAddress,
  scanForBluetoothDevice,
  simulateAndroidBluetoothEvent,
} from "../services/bluetooth";

export const BluetoothSetupModal = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  vehicles,
  onAddVehicle,
  isTripActive,
  onSimulateConnect,
  onSimulateDisconnect,
  showNotification,
}) => {
  const [b, setB] = useState("playstore");
  const [g, setG] = useState("receiver");
  const [z, setZ] = useState(null);
  const [G, setG_1] = useState(getConnectedBleDeviceName());
  const [_, set_] = useState(false);
  const [T, setT] = useState(vehicles);
  useEffect(() => {
    setT((P) => Array.from(new Set([...P, ...vehicles])).sort());
  }, [vehicles]);
  const [R, setR] = useState(() => config.vehicleReg || (vehicles.length > 0 ? vehicles[0] : ""));
  const [Z, setZ_1] = useState(() => {
    if (config.vehicleMappings && config.vehicleMappings.length > 0) {
      return [...config.vehicleMappings];
    }
    if (config.vehicleReg) {
      return [
        {
          vehicleReg: config.vehicleReg,
          deviceName: config.deviceName || "",
          deviceMacAddress: config.deviceMacAddress || "",
          defaultTripType: config.defaultTripType || "work",
          autoEndTrip: config.autoEndTrip ?? true,
        },
      ];
    }
    return [];
  });
  const [U, setU] = useState("");
  const [S, setS] = useState("");
  const [ue, setUe] = useState("All");
  const [me, setMe] = useState(false);
  const [O, setO] = useState([]);
  const [C, setC] = useState("");
  const [te, setTe] = useState("");
  const [se, setSe] = useState(null);
  const [ae, setAe] = useState("");
  useEffect(() => {
    if (isOpen) {
      const P = config.vehicleReg || (vehicles.length > 0 ? vehicles[0] : "");
      setR(P);
      if (config.vehicleMappings && config.vehicleMappings.length > 0) {
        setZ_1([...config.vehicleMappings]);
      } else if (config.vehicleReg) {
        setZ_1([
          {
            vehicleReg: config.vehicleReg,
            deviceName: config.deviceName || "",
            deviceMacAddress: config.deviceMacAddress || "",
            defaultTripType: config.defaultTripType || "work",
            autoEndTrip: config.autoEndTrip ?? true,
          },
        ]);
      }
    }
  }, [isOpen, config, vehicles]);
  const _e = useMemo(
    () =>
      T.map(
        (P) =>
          Z.find((ye) => ye.vehicleReg === P) || {
            vehicleReg: P,
            deviceName: "",
            deviceMacAddress: "",
            defaultTripType: "work",
            autoEndTrip: true,
          },
      ),
    [T, Z],
  );
  const je = useMemo(
    () =>
      Z.find((P) => P.vehicleReg === R) || {
        vehicleReg: R,
        deviceName: "",
        deviceMacAddress: "",
        defaultTripType: "work",
        autoEndTrip: true,
      },
    [Z, R],
  );
  const Ze = () => {
    const P = U.trim().toUpperCase();
    if (!P) {
      showNotification("Please enter a vehicle registration number.", "error");
      return;
    }
    if (T.includes(P)) {
      showNotification(`Vehicle ${P} is already in your fleet.`, "error");
      setR(P);
      setU("");
      return;
    }
    onAddVehicle?.(P);
    setT((de) => [...de, P].sort());
    setR(P);
    setZ_1((de) => {
      if (de.some((ye) => ye.vehicleReg === P)) {
        return de;
      }
      return [
        ...de,
        {
          vehicleReg: P,
          deviceName: "",
          deviceMacAddress: "",
          defaultTripType: "work",
          autoEndTrip: true,
        },
      ];
    });
    setU("");
    showNotification(
      `Vehicle "${P}" added! Now select its allocated Bluetooth device below.`,
      "success",
    );
  };
  const nt = (P, de, ye, deviceId) => {
    if (!P) {
      showNotification("Please select or add a vehicle first.", "error");
      return;
    }
    const deviceName = de.trim();
    if (!deviceName) {
      showNotification("Please enter a valid device name.", "error");
      return;
    }
    const $e = ye?.trim();
    const Xe = $e ? normalizeMacAddress($e) : generateMacFromName(deviceName);
    const Ye = Z.find(
      (rt) =>
        rt.vehicleReg !== P &&
        rt.deviceName &&
        ((rt.deviceMacAddress && Xe && normalizeMacAddress(rt.deviceMacAddress) === Xe) ||
          rt.deviceName.trim().toLowerCase() === deviceName.toLowerCase()),
    );
    setZ_1((rt) => {
      const en = rt.findIndex((zt) => zt.vehicleReg === P);
      if (en >= 0) {
        const zt = [...rt];
        zt[en] = {
          ...zt[en],
          deviceName,
          deviceMacAddress: Xe,
          deviceId: deviceId || zt[en].deviceId,
        };
        return zt;
      }
      return [
        ...rt,
        {
          vehicleReg: P,
          deviceName,
          deviceMacAddress: Xe,
          deviceId,
          defaultTripType: "work",
          autoEndTrip: true,
        },
      ];
    });
    if (Ye) {
      showNotification(
        `Allocated "${deviceName}" (MAC: ${Xe}) to ${P}. Note: Separate Bluetooth devices must be allocated per vehicle (already paired to ${Ye.vehicleReg}).`,
        "error",
      );
    } else {
      showNotification(`Allocated "${deviceName}" (MAC: ${Xe}) to ${P}!`, "success");
    }
  };
  const ze = (vehicleReg, de) => {
    setZ_1((ye) => {
      const ke = ye.findIndex((ce) => ce.vehicleReg === vehicleReg);
      if (ke >= 0) {
        const ce = [...ye];
        ce[ke] = {
          ...ce[ke],
          ...de,
        };
        return ce;
      }
      return [
        ...ye,
        {
          vehicleReg,
          deviceName: "",
          deviceMacAddress: "",
          defaultTripType: "work",
          autoEndTrip: true,
          ...de,
        },
      ];
    });
  };
  const Oe = (vehicleReg) => {
    setZ_1((de) =>
      de.map((ye) => {
        if (ye.vehicleReg === vehicleReg) {
          return {
            ...ye,
            deviceName: "",
            deviceMacAddress: "",
            deviceId: undefined,
          };
        }
        return ye;
      }),
    );
    showNotification(`Cleared Bluetooth allocation for ${vehicleReg}`, "success");
  };
  const dt = async () => {
    setMe(true);
    try {
      const P = await scanForBluetoothDevice();
      if (P.success && P.device) {
        const de = P.device;
        const macAddress = de.macAddress || generateMacFromName(de.name);
        const ke = {
          id: de.id || `bt-${Date.now()}`,
          name: de.name,
          macAddress,
          category: "Live Scanned Device",
          brand: "Nearby Device",
        };
        setO((ce) => {
          if (ce.some(($e) => $e.name.toLowerCase() === de.name.toLowerCase())) {
            return ce;
          }
          return [ke, ...ce];
        });
        if (R) {
          nt(R, de.name, macAddress, de.id);
        }
        showNotification(
          `Found & paired "${de.name}" (MAC: ${macAddress}) via Bluetooth!`,
          "success",
        );
      } else {
        showNotification(P.error || "Scan cancelled or device not selected.", "error");
      }
    } finally {
      setMe(false);
    }
  };
  const ft = useMemo(() => {
    const P = S.toLowerCase().trim();
    const de = [...O, ...CAR_AUDIO_PRESETS];
    const ye = new Set();
    return de
      .filter((ce) => {
        const $e = ce.name.toLowerCase();
        if (ye.has($e)) {
          return false;
        }
        return (ye.add($e), true);
      })
      .filter((ce) => {
        const $e =
          !P ||
          ce.name.toLowerCase().includes(P) ||
          ce.brand.toLowerCase().includes(P) ||
          ce.category.toLowerCase().includes(P) ||
          ce.macAddress.toLowerCase().includes(P);
        const Xe = ue === "All" || ce.category === ue;
        return $e && Xe;
      });
  }, [O, S, ue]);
  const Je = () => {
    const P = Z.find(($e) => $e.vehicleReg === R) || Z[0];
    const de = R || P?.vehicleReg || T[0] || "";
    const deviceName = P?.deviceName || "";
    const deviceMacAddress = P?.deviceMacAddress || "";
    const ce = {
      enabled: true,
      deviceName,
      deviceMacAddress,
      vehicleReg: de,
      defaultTripType: P?.defaultTripType || "work",
      autoEndTrip: P?.autoEndTrip ?? true,
      vehicleMappings: Z,
    };
    onSaveConfig(ce);
    showNotification(
      `Saved Bluetooth allocations with MAC addresses for ${Z.filter(($e) => $e.deviceName).length} vehicle(s)!`,
      "success",
    );
    onClose();
  };
  const vt = {
    manifest: `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.easylog.app">

    <!-- Play Store Native Bluetooth Permissions -->
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application android:label="EasyLog" ...>
        <!-- Native Car Bluetooth Broadcast Receiver -->
        <receiver android:name=".CarBluetoothReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.bluetooth.device.action.ACL_CONNECTED" />
                <action android:name="android.bluetooth.device.action.ACL_DISCONNECTED" />
            </intent-filter>
        </receiver>

        <!-- Ongoing GPS Drive Tracking Service -->
        <service
            android:name=".EasyLogTrackingService"
            android:foregroundServiceType="location" />
    </application>
</manifest>`,
    receiver: `// CarBluetoothReceiver.kt
// Listens directly to Android OS Bluetooth broadcasts (Zero Tasker Needed)
package com.easylog.app

import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class CarBluetoothReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val device = intent.getParcelableExtra<BluetoothDevice>(BluetoothDevice.EXTRA_DEVICE)
        val deviceName = device?.name ?: "Car Bluetooth"

        when (intent.action) {
            BluetoothDevice.ACTION_ACL_CONNECTED -> {
                // Starts background GPS drive service immediately
                val serviceIntent = Intent(context, EasyLogTrackingService::class.java).apply {
                    action = EasyLogTrackingService.ACTION_START_TRACKING
                    putExtra("device_name", deviceName)
                }
                ContextCompat.startForegroundService(context, serviceIntent)
            }
            BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                // Engine off: stops tracking and posts ATO verification alert
                val serviceIntent = Intent(context, EasyLogTrackingService::class.java).apply {
                    action = EasyLogTrackingService.ACTION_STOP_TRACKING
                }
                context.startService(serviceIntent)
            }
        }
    }
}`,
    service: `// EasyLogTrackingService.kt
// Foreground GPS service with persistent notification
package com.easylog.app

import android.app.Service
import android.content.Intent
import android.location.Location
import android.location.LocationListener
import androidx.core.app.NotificationCompat

class EasyLogTrackingService : Service(), LocationListener {
    // 1. Shows persistent driving notification: "🚗 EasyLog: Tracking Drive..."
    // 2. Records GPS points into route history
    // 3. Complies 100% with Google Play Store background location requirements
    // 4. On engine stop, posts interactive alert: "Tap to verify Work vs Personal"
}`,
    bridge: `// MainActivity.kt (JavaScript Bridge)
// Directly binds the native Android shell with EasyLog:
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun syncPreferences(carName: String, rego: String, passengerMode: Boolean) {
        // Saves Bluetooth device filter & passenger mode to SharedPreferences
    }
}, "AndroidBridge")

// When car connects, triggers directly into EasyLog web UI:
webView.evaluateJavascript("window.EasyLogNative.onBluetoothConnected('$carName')", null)`,
  };
  const mt = (P, de) => {
    const ye = new Blob([de], {
      type: "text/plain;charset=utf-8",
    });
    const ke = URL.createObjectURL(ye);
    const ce = document.createElement("a");
    ce.href = ke;
    ce.download = P;
    document.body.appendChild(ce);
    ce.click();
    document.body.removeChild(ce);
    URL.revokeObjectURL(ke);
    showNotification(`Downloaded ${P}! Ready for Android Studio.`, "success");
  };
  if (!isOpen) {
    return null;
  }
  const Me = buildBluetoothAutoStartUrl(undefined, R, je.deviceName, je.deviceMacAddress);
  const Ge = (P, de) => {
    navigator.clipboard.writeText(P).then(() => {
      setZ(de);
      showNotification("URL copied to clipboard! Paste into your automation.", "success");
      setTimeout(() => setZ(null), 2500);
    });
  };
  const Te = () => {
    const P = je.deviceName.trim() || "Car Bluetooth";
    const de = je.deviceMacAddress?.trim() || "";
    const ye = Me.startUrl.replace(/&/g, "&amp;");
    const ke = Me.endUrl.replace(/&/g, "&amp;");
    const ce = `<?xml version="1.0" encoding="utf-8"?>
<TaskerData sr="" dvi="1" tv="6.3.0">
 <Profile sr="prof9901" ve="2">
  <cdate>${Date.now()}</cdate>
  <edate>${Date.now()}</edate>
  <id>9901</id>
  <mid0>9902</mid0>
  <mid1>9903</mid1>
  <nme>EasyLog Car BT - ${R || "Drive"}</nme>
  <State sr="con0" ve="2">
   <code>3</code>
   <Str sr="arg0" ve="3">${P}</Str>
   <Str sr="arg1" ve="3">${de}</Str>
  </State>
 </Profile>
 <Task sr="task9902">
  <cdate>${Date.now()}</cdate>
  <edate>${Date.now()}</edate>
  <id>9902</id>
  <nme>EasyLog Start Trip</nme>
  <Action sr="act0" ve="7">
   <code>104</code>
   <Str sr="arg0" ve="3">${ye}</Str>
  </Action>
 </Task>
 <Task sr="task9903">
  <cdate>${Date.now()}</cdate>
  <edate>${Date.now()}</edate>
  <id>9903</id>
  <nme>EasyLog End Trip</nme>
  <Action sr="act0" ve="7">
   <code>104</code>
   <Str sr="arg0" ve="3">${ke}</Str>
  </Action>
 </Task>
</TaskerData>`;
    const $e = new Blob([ce], {
      type: "application/xml",
    });
    const Xe = URL.createObjectURL($e);
    const Ye = document.createElement("a");
    Ye.href = Xe;
    Ye.download = "EasyLog_Car_Bluetooth.prf.xml";
    document.body.appendChild(Ye);
    Ye.click();
    document.body.removeChild(Ye);
    URL.revokeObjectURL(Xe);
    showNotification(
      "Downloaded EasyLog_Car_Bluetooth.prf.xml! In Tasker: tap Profiles > Import Profile.",
      "success",
    );
  };
  const le = async () => {
    set_(true);
    const P = await connectBleDevice(() => {
      setG_1(null);
      showNotification("BLE Beacon disconnected - ending trip", "success");
      onSimulateDisconnect();
    });
    set_(false);
    if (P.success) {
      setG_1(P.deviceName || "Connected");
      if (R) {
        nt(R, P.deviceName || "BLE Car Beacon");
      }
      showNotification(`Connected to ${P.deviceName}!`, "success");
    } else {
      showNotification(P.error || "Connection failed", "error");
    }
  };
  const Be = () => {
    disconnectBleDevice();
    setG_1(null);
    showNotification("Disconnected from BLE Beacon", "success");
  };
  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[94vh] flex flex-col border border-gray-100">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl text-white">
              <Bluetooth size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Car Bluetooth Automation & Device Allocations
              </h2>
              <p className="text-[11px] text-blue-100 flex items-center gap-1">
                <Shield size={11} className="text-emerald-300" />
                <span>Separate Bluetooth Devices Allocated Per Vehicle</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto text-xs text-gray-700">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-start space-x-2.5">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                <UserX size={15} />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-950 text-xs">
                  Why Car Bluetooth Solves the "Passenger Problem"
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  When you travel as a passenger in an{" "}
                  <strong>Uber, taxi, friend's car, or public transit</strong>, your phone does{" "}
                  <strong>not</strong> connect to your vehicle's Bluetooth. By allocating specific
                  Bluetooth devices to each car, trips are{" "}
                  <strong>only logged when driving your specific vehicle</strong>.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <Car size={15} className="text-indigo-600" />
                <span>1. Add New Registration Number Directly</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                Direct Fleet Setup
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              Add a new car registration right here without leaving this screen. You can allocate
              its unique Bluetooth device immediately.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  🚗
                </div>
                <input
                  type="text"
                  placeholder="Enter Rego / License Plate (e.g. ABC-123, TESLA-M3)"
                  value={U}
                  onChange={(P) => setU(P.target.value)}
                  onKeyDown={(P) => P.key === "Enter" && Ze()}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={Ze}
                disabled={!U.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus size={15} />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <SlidersVertical size={14} className="text-indigo-600" />
                  <span>2. Vehicle Bluetooth Allocations ({T.length} vehicles)</span>
                </h3>
                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  Each vehicle has its own dedicated Bluetooth device. When that device connects,
                  EasyLog starts tracking for that specific car.
                </p>
              </div>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                1:1 Vehicle Pairing
              </span>
            </div>
            <div className="space-y-2.5">
              {_e.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-xs">
                  No vehicles configured yet. Use the form above to add your first registration
                  number.
                </div>
              ) : (
                _e.map((P) => {
                  const de = !!(P.deviceName && P.deviceName.trim());
                  const ye = R === P.vehicleReg;
                  const ke = de
                    ? Z.find(
                        (ce) =>
                          ce.vehicleReg !== P.vehicleReg &&
                          ce.deviceName &&
                          ((ce.deviceMacAddress &&
                            P.deviceMacAddress &&
                            normalizeMacAddress(ce.deviceMacAddress) ===
                              normalizeMacAddress(P.deviceMacAddress)) ||
                            ce.deviceName.trim().toLowerCase() ===
                              P.deviceName.trim().toLowerCase()),
                      )
                    : null;
                  return (
                    <div
                      key={P.vehicleReg}
                      className={`p-3.5 bg-white rounded-xl border transition shadow-2xs ${ye ? "border-indigo-400 ring-2 ring-indigo-500/15 bg-indigo-50/20" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-gray-900 text-white px-2 py-0.5 rounded-md tracking-wider">
                              {P.vehicleReg}
                            </span>
                            {ye && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                                Selected Target
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-gray-500 text-[11px]">Allocated Bluetooth:</span>
                            {de ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/80">
                                  <Bluetooth size={12} className="text-indigo-600" />
                                  <span>{P.deviceName}</span>
                                </span>
                                <span
                                  className="font-mono text-[10.5px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200 flex items-center gap-1"
                                  title="Unchanging Hardware MAC Address / Unique Identifier"
                                >
                                  <Cpu size={10} className="text-gray-500" />
                                  <span>MAC: {P.deviceMacAddress || "Not set"}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSe(P.vehicleReg);
                                    setAe(P.deviceMacAddress || "");
                                  }}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 hover:underline ml-0.5"
                                  title="Edit MAC Address / Hardware Identifier"
                                >
                                  <PenLine size={10} />
                                  <span>Edit MAC</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 flex items-center gap-1 text-[11px]">
                                <CircleAlert size={11} className="text-amber-600" />
                                <span>No device allocated</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200 text-[10.5px]">
                            <button
                              type="button"
                              onClick={() =>
                                ze(P.vehicleReg, {
                                  defaultTripType: "work",
                                })
                              }
                              className={`px-2 py-0.5 font-bold rounded-md transition ${P.defaultTripType === "work" ? "bg-indigo-600 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"}`}
                            >
                              Work
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                ze(P.vehicleReg, {
                                  defaultTripType: "personal",
                                })
                              }
                              className={`px-2 py-0.5 font-bold rounded-md transition ${P.defaultTripType === "personal" ? "bg-emerald-600 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"}`}
                            >
                              Personal
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setR(P.vehicleReg)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${ye ? "bg-indigo-600 text-white shadow-2xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
                          >
                            <span>{ye ? "Selected" : "Select"}</span>
                          </button>
                          {de && (
                            <button
                              type="button"
                              disabled={isTripActive}
                              onClick={() => {
                                onSimulateConnect(P.vehicleReg, P.deviceName, P.deviceMacAddress);
                                onClose();
                                showNotification(
                                  `⚡ Simulated connect for ${P.vehicleReg} (${P.deviceName} • ${P.deviceMacAddress})!`,
                                  "success",
                                );
                              }}
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                              title={`Test Bluetooth connection for ${P.vehicleReg}`}
                            >
                              <Play size={12} className="fill-current" />
                            </button>
                          )}
                          {de && (
                            <button
                              type="button"
                              onClick={() => Oe(P.vehicleReg)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Clear allocated device"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {se === P.vehicleReg && (
                        <div className="mt-2.5 p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-200 flex flex-col sm:flex-row gap-2 items-center text-xs animate-fade-in">
                          <div className="flex items-center gap-1.5 flex-1 w-full">
                            <span className="text-[11px] font-bold text-indigo-900 shrink-0">
                              Hardware MAC:
                            </span>
                            <input
                              type="text"
                              placeholder="00:1A:7D:XX:YY:ZZ"
                              value={ae}
                              onChange={(ce) => setAe(formatMacInput(ce.target.value))}
                              className="flex-1 px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setAe(generateMacFromName(P.deviceName || P.vehicleReg))
                              }
                              className="px-2.5 py-1 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10.5px] font-bold"
                            >
                              Generate MAC
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const ce = ae.trim()
                                  ? normalizeMacAddress(ae)
                                  : generateMacFromName(P.deviceName);
                                ze(P.vehicleReg, {
                                  deviceMacAddress: ce,
                                });
                                setSe(null);
                                showNotification(
                                  `Updated MAC address to ${ce} for ${P.vehicleReg}!`,
                                  "success",
                                );
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10.5px] font-bold shadow-2xs"
                            >
                              Save MAC
                            </button>
                            <button
                              type="button"
                              onClick={() => setSe(null)}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 text-[10.5px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {ke && (
                        <div className="mt-2 text-[10.5px] bg-amber-50 text-amber-900 border border-amber-200/90 rounded-lg p-2 flex items-start gap-1.5">
                          <TriangleAlert size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Duplicate Allocation:</strong> This Bluetooth device is also
                            allocated to vehicle <strong>{ke.vehicleReg}</strong>. Please allocate{" "}
                            <strong>separate Bluetooth devices per vehicle</strong> so EasyLog can
                            accurately distinguish which car you are driving.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Search size={14} className="text-indigo-600" />
                  <span>3. Bluetooth Device Search List & Scanner</span>
                </h3>
                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  Allocating device to vehicle:{" "}
                  <strong className="text-indigo-700 font-mono font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    {R || "Select a vehicle above"}
                  </strong>
                </p>
              </div>
              {isWebBluetoothSupported() ? (
                <button
                  type="button"
                  onClick={dt}
                  disabled={me || !R}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
                >
                  <RadioTower size={13} className={me ? "animate-spin" : ""} />
                  <span>{me ? "Scanning..." : "Scan Nearby Bluetooth"}</span>
                </button>
              ) : (
                <span className="text-[10.5px] text-gray-400 italic">
                  Search catalog or enter custom name below
                </span>
              )}
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Bluetooth devices or MAC address (e.g. Toyota, Tesla, Ford SYNC, CarPlay, 00:1A:7D)..."
                value={S}
                onChange={(P) => setS(P.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {S && (
                <button
                  type="button"
                  onClick={() => setS("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 text-[10.5px]">
              {[
                "All",
                "Factory Car Audio",
                "Infotainment & Hands-Free",
                "OBD-II & Diagnostics",
                "Aftermarket Head Unit",
              ].map((P) => (
                <button
                  key={P}
                  type="button"
                  onClick={() => setUe(P)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${ue === P ? "bg-indigo-600 text-white shadow-2xs" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                >
                  {P}
                </button>
              ))}
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {ft.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-xs space-y-1">
                  <p>No Bluetooth presets matched "{S}".</p>
                  <p className="text-[11px] text-gray-400">
                    You can enter a custom Bluetooth name and MAC address below.
                  </p>
                </div>
              ) : (
                ft.map((P) => {
                  const de =
                    je.deviceName.toLowerCase() === P.name.toLowerCase() ||
                    (je.deviceMacAddress &&
                      P.macAddress &&
                      normalizeMacAddress(je.deviceMacAddress) ===
                        normalizeMacAddress(P.macAddress));
                  const ye = Z.find(
                    (ke) =>
                      ke.vehicleReg !== R &&
                      ke.deviceName &&
                      ((ke.deviceMacAddress &&
                        P.macAddress &&
                        normalizeMacAddress(ke.deviceMacAddress) ===
                          normalizeMacAddress(P.macAddress)) ||
                        ke.deviceName.toLowerCase() === P.name.toLowerCase()),
                  );
                  return (
                    <div
                      key={P.id || P.macAddress || P.name}
                      className={`p-2.5 bg-white rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs transition ${de ? "border-indigo-400 bg-indigo-50/30" : ye ? "border-amber-200 bg-amber-50/20" : "border-gray-200 hover:border-indigo-200"}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <Bluetooth size={14} />
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                            <span>{P.name}</span>
                            {de && (
                              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                Active for {R}
                              </span>
                            )}
                            {ye && !de && (
                              <span className="text-[9.5px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.2 rounded">
                                Paired to {ye.vehicleReg}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate flex items-center gap-2 mt-0.5">
                            <span>{P.brand}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{P.category}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1 py-0.2 rounded border border-gray-200 text-[9.5px]">
                              MAC: {P.macAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={() => nt(R, P.name, P.macAddress, P.id)}
                          disabled={!R}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${de ? "bg-emerald-600 text-white" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"}`}
                        >
                          {de ? "Allocated" : `Allocate to ${R || "Car"}`}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="pt-2.5 border-t border-gray-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-700">
                Or enter custom Bluetooth device name and unchanging MAC address:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Friendly Name (e.g. Work Van Audio, CarPlay)"
                    value={C}
                    onChange={(P) => setC(P.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Hardware MAC (e.g. 00:1A:7D:55:22:99)"
                    value={te}
                    onChange={(P) => setTe(formatMacInput(P.target.value))}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTe(generateMacFromName(C || R))}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-[10.5px] font-bold shrink-0"
                    title="Auto-generate standard hardware MAC address"
                  >
                    Gen MAC
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (C.trim()) {
                      const P = te.trim() ? normalizeMacAddress(te) : generateMacFromName(C);
                      nt(R, C.trim(), P);
                      setC("");
                      setTe("");
                    }
                  }}
                  disabled={!C.trim() || !R}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Allocate Custom Device to {R || "Vehicle"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={Je}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCheck size={16} />
              <span>Save & Apply All Vehicle Bluetooth Allocations</span>
            </button>
          </div>
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-xs">
                Hands-Free Automation Platform Guides
              </span>
              <span className="text-[10px] text-gray-400">Zero-Touch Automation</span>
            </div>
            <div className="flex rounded-xl bg-gray-100 p-1 gap-0.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setB("playstore")}
                className={`flex-1 min-w-[110px] py-1.5 px-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1 ${b === "playstore" ? "bg-white text-emerald-700 shadow-sm border border-emerald-100 font-bold" : "text-gray-500 hover:text-gray-800"}`}
              >
                <Smartphone
                  size={13}
                  className={b === "playstore" ? "text-emerald-600" : "text-gray-400"}
                />
                <span>Play Store (Native)</span>
              </button>
              <button
                type="button"
                onClick={() => setB("tasker")}
                className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1 ${b === "tasker" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                <Zap
                  size={12}
                  className={b === "tasker" ? "text-amber-500 fill-amber-500" : "text-gray-400"}
                />
                <span>Tasker</span>
              </button>
              <button
                type="button"
                onClick={() => setB("ios")}
                className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg transition ${b === "ios" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"}`}
              >
                 iPhone
              </button>
              <button
                type="button"
                onClick={() => setB("android")}
                className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs font-semibold rounded-lg transition ${b === "android" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"}`}
              >
                🤖 Samsung
              </button>
              <button
                type="button"
                onClick={() => setB("ble")}
                className={`flex-1 min-w-[65px] py-1.5 px-2 text-xs font-semibold rounded-lg transition ${b === "ble" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"}`}
              >
                📡 BLE
              </button>
            </div>
            {b === "playstore" && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3.5 text-[11px] leading-relaxed animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 text-xs flex items-center">
                    <Smartphone size={15} className="mr-1.5 text-emerald-600" />
                    Native Android Bluetooth API (Play Store)
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Zero 3rd-Party Apps
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-xs space-y-2">
                  <div className="font-semibold text-gray-900 text-[11px] flex items-center text-emerald-900">
                    <CircleCheck size={13} className="mr-1.5 text-emerald-600 shrink-0" />
                    <span>Multi-Vehicle Android Bluetooth Detection Built-In</span>
                  </div>
                  <p className="text-gray-600 text-[10.5px]">
                    In the Android app, EasyLog listens directly to Android OS system Bluetooth
                    broadcasts. When your car connects, it matches the device to the allocated
                    vehicle:
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <div className="flex items-start space-x-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-800 text-[11px]">1.</span>
                      <div>
                        <strong className="text-gray-900">Ignition On / Phone Connects:</strong>
                        <p className="text-gray-600">
                          Android OS fires{" "}
                          <code className="text-emerald-700 bg-white px-1 py-0.5 rounded font-mono text-[9.5px]">
                            ACTION_ACL_CONNECTED
                          </code>
                          . Our native BroadcastReceiver wakes up and identifies which car was
                          connected.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-800 text-[11px]">2.</span>
                      <div>
                        <strong className="text-gray-900">
                          Autonomous GPS Foreground Service:
                        </strong>
                        <p className="text-gray-600">
                          Starts low-power drive tracking and posts:{" "}
                          <em>
                            "🚗 EasyLog: Tracking Drive for {R || "your car"}
                            ..."
                          </em>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-[11px]">
                      ⚡ Test Native Android Bluetooth Signal
                    </span>
                    <span className="text-[10px] text-gray-400">Simulate OS event</span>
                  </div>
                  <p className="text-gray-600 text-[10.5px]">
                    Simulate the exact Android event triggered when {R || "your vehicle"} connects
                    to {je.deviceName || "Bluetooth"}:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isTripActive}
                      onClick={() => {
                        simulateAndroidBluetoothEvent(
                          "connected",
                          je.deviceName || "Toyota Car BT",
                          R,
                          je.deviceMacAddress,
                        );
                        onClose();
                        showNotification(
                          `🚗 Android OS Event: Connected to ${R} (${je.deviceName || "BT"} • ${je.deviceMacAddress || "MAC"})!`,
                          "success",
                        );
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition ${isTripActive ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"}`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>Simulate Connect</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isTripActive}
                      onClick={() => {
                        simulateAndroidBluetoothEvent("disconnected");
                        onClose();
                        showNotification("🛑 Android OS Event: Disconnected", "success");
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition ${isTripActive ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                      <Square size={12} className="fill-current" />
                      <span>Simulate Disconnect</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 text-[11px] flex items-center">
                      <FileCode size={13} className="mr-1.5 text-emerald-700" />
                      <span>Android Studio Source Code</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Play Store Production Architecture
                    </span>
                  </div>
                  <div className="flex rounded-lg bg-gray-100 p-0.5 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setG("receiver")}
                      className={`flex-1 py-1 rounded-md font-semibold transition ${g === "receiver" ? "bg-white text-emerald-800 shadow-2xs font-bold" : "text-gray-500"}`}
                    >
                      CarBluetoothReceiver.kt
                    </button>
                    <button
                      type="button"
                      onClick={() => setG("manifest")}
                      className={`flex-1 py-1 rounded-md font-semibold transition ${g === "manifest" ? "bg-white text-emerald-800 shadow-2xs font-bold" : "text-gray-500"}`}
                    >
                      AndroidManifest.xml
                    </button>
                    <button
                      type="button"
                      onClick={() => setG("service")}
                      className={`flex-1 py-1 rounded-md font-semibold transition ${g === "service" ? "bg-white text-emerald-800 shadow-2xs font-bold" : "text-gray-500"}`}
                    >
                      TrackingService.kt
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="p-3 bg-gray-900 text-gray-100 font-mono text-[10px] rounded-xl overflow-x-auto max-h-40 border border-gray-800">
                      {vt[g]}
                    </pre>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => Ge(vt[g], `code_${g}`)}
                        className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] flex items-center gap-1 px-1.5"
                      >
                        <Copy size={11} />
                        <span>{z === `code_${g}` ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          mt(
                            g === "receiver"
                              ? "CarBluetoothReceiver.kt"
                              : g === "manifest"
                                ? "AndroidManifest.xml"
                                : "EasyLogTrackingService.kt",
                            vt[g],
                          )
                        }
                        className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] flex items-center gap-1 px-1.5"
                      >
                        <Download size={11} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {b === "tasker" && (
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-3.5 text-[11px] leading-relaxed animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-indigo-950 text-xs flex items-center">
                    <Zap size={14} className="mr-1.5 text-amber-500 fill-amber-500" />
                    Tasker Automation for Android
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                    For {R}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-indigo-200 shadow-xs space-y-2">
                  <span className="font-semibold text-gray-900 text-[11px]">
                    Option A: 1-Click Tasker Import Profile
                  </span>
                  <p className="text-gray-600 text-[10.5px]">
                    Download the pre-configured profile for <strong>{R}</strong> and Bluetooth
                    device <strong>{je.deviceName || "your car"}</strong>:
                  </p>
                  <button
                    type="button"
                    onClick={Te}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download EasyLog_Car_Bluetooth.prf.xml</span>
                  </button>
                </div>
                <div className="bg-white rounded-xl p-3 border border-indigo-200 shadow-xs space-y-2">
                  <span className="font-semibold text-gray-900 text-[11px]">
                    Option B: Webhook URLs
                  </span>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Start Drive URL
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        <input
                          type="text"
                          readOnly
                          value={Me.startUrl}
                          className="w-full bg-gray-50 border border-gray-200 px-2 py-1 rounded text-[10px] font-mono text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => Ge(Me.startUrl, "tasker_start")}
                          className="px-2 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-semibold text-gray-700"
                        >
                          {z === "tasker_start" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        End Drive URL
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        <input
                          type="text"
                          readOnly
                          value={Me.endUrl}
                          className="w-full bg-gray-50 border border-gray-200 px-2 py-1 rounded text-[10px] font-mono text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => Ge(Me.endUrl, "tasker_end")}
                          className="px-2 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-semibold text-gray-700"
                        >
                          {z === "tasker_end" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {b === "ios" && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3.5 text-[11px] leading-relaxed animate-fade-in">
                <div className="font-bold text-gray-900 text-xs flex items-center justify-between">
                  <span>Apple Shortcuts Automation (iOS)</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                    Target: {R}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs space-y-2">
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                    <li>
                      Open the <strong>Shortcuts</strong> app on your iPhone.
                    </li>
                    <li>
                      Tap the <strong>Automation</strong> tab at the bottom, then <strong>+</strong>{" "}
                      (New Automation).
                    </li>
                    <li>
                      Choose <strong>Bluetooth</strong> → Select{" "}
                      <strong>{je.deviceName || "your car's Bluetooth"}</strong>.
                    </li>
                    <li>
                      Select <em>"Run Immediately"</em> (turn off Ask Before Running).
                    </li>
                    <li>
                      Action: Add <strong>Open URL</strong> and paste the start URL below:
                    </li>
                  </ol>
                  <div className="flex gap-1 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={Me.startUrl}
                      className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg text-[10px] font-mono text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => Ge(Me.startUrl, "ios_start")}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      {z === "ios_start" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {b === "android" && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3.5 text-[11px] leading-relaxed animate-fade-in">
                <div className="font-bold text-gray-900 text-xs flex items-center justify-between">
                  <span>Samsung Modes & Routines</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                    Galaxy Devices
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs space-y-2">
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                    <li>
                      Open <strong>Settings</strong>
                      {" > "}
                      <strong>Modes and Routines</strong>
                      {" > "}
                      <strong>Routines</strong>.
                    </li>
                    <li>
                      <strong>If:</strong>
                      {" Connected to Bluetooth device > Select "}
                      <strong>{je.deviceName || "your car audio"}</strong>.
                    </li>
                    <li>
                      <strong>Then:</strong>
                      {" Open website URL > Paste the start URL below:"}
                    </li>
                  </ol>
                  <div className="flex gap-1 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={Me.startUrl}
                      className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg text-[10px] font-mono text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => Ge(Me.startUrl, "samsung_start")}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      {z === "samsung_start" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {b === "ble" && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3.5 text-[11px] leading-relaxed animate-fade-in">
                <div className="font-bold text-gray-900 text-xs flex items-center justify-between">
                  <span>Bluetooth Low Energy (BLE) Beacon / OBD-II Scanner</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                    In-Browser BLE
                  </span>
                </div>
                <p className="text-gray-600">
                  If you keep an OBD-II BLE dongle (e.g. Veepeak, OBDLink) in your car, you can pair
                  it directly inside this browser. When the car ignition turns off, the beacon
                  disconnects and stops the trip.
                </p>
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-semibold ${G ? "text-emerald-700" : "text-gray-500"}`}>
                      {G ? `Connected to ${G}` : "Disconnected"}
                    </span>
                  </div>
                  <div className="pt-1">
                    {G ? (
                      <button
                        type="button"
                        onClick={Be}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
                      >
                        Disconnect BLE Beacon
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={le}
                        disabled={_}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Radio size={13} />
                        <span>{_ ? "Pairing..." : "Pair BLE Dongle / Beacon"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
