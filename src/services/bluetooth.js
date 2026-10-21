const BT_CONFIG_KEY = "easylog_bt_config";

export const PASSENGER_MODE_KEY = "easylog_passenger_mode";

const LEGACY_BT_CONFIG_KEY = "snaplog_bt_config";

const DEFAULT_BT_CONFIG = {
  enabled: false,
  deviceName: "",
  deviceMacAddress: "",
  vehicleReg: "",
  defaultTripType: "work",
  autoEndTrip: false,
  vehicleMappings: [],
};

export function normalizeMacAddress(e) {
  if (!e) {
    return "";
  }
  const t = e.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (t.length === 12) {
    return t.match(/.{1,2}/g)?.join(":") || e.toUpperCase();
  }
  return e.trim().toUpperCase();
}

function isValidMacAddress(e) {
  if (e) {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(e.trim());
  }
  return false;
}

export function formatMacInput(e) {
  const t = e
    .replace(/[^0-9A-Fa-f]/g, "")
    .slice(0, 12)
    .toUpperCase();
  const s = t.match(/.{1,2}/g);
  if (s) {
    return s.join(":");
  }
  return t;
}

export function generateMacFromName(e, t = "00:1A:7D") {
  const s = t
    .replace(/[^0-9A-Fa-f]/g, "")
    .slice(0, 6)
    .toUpperCase();
  const o = "0123456789ABCDEF";
  if (e && e.trim()) {
    let f = 0;
    const m = e.trim().toLowerCase();
    for (let g = 0; g < m.length; g++) {
      f = (f << 5) - f + m.charCodeAt(g);
      f |= 0;
    }
    let x = s;
    const b = 6 - s.length / 2;
    for (let g = 0; g < b * 2; g++) {
      const M = Math.abs(f ^ (g * 31 + 17)) % 16;
      x += o.charAt(M);
    }
    const y = x.match(/.{1,2}/g);
    if (y) {
      return y.join(":");
    }
    return x;
  }
  let a = s;
  const d = 6 - s.length / 2;
  for (let f = 0; f < d * 2; f++) {
    a += o.charAt(Math.floor(Math.random() * o.length));
  }
  const u = a.match(/.{1,2}/g);
  if (u) {
    return u.join(":");
  }
  return a;
}

export const CAR_AUDIO_PRESETS = [
  {
    id: "toyota-touch",
    name: "Toyota Touch 2",
    macAddress: "00:1A:7D:DA:71:13",
    category: "Factory Car Audio",
    brand: "Toyota",
  },
  {
    id: "toyota-bt",
    name: "Toyota BT",
    macAddress: "28:56:5A:11:42:F1",
    category: "Factory Car Audio",
    brand: "Toyota",
  },
  {
    id: "lexus-multi",
    name: "Lexus Multimedia",
    macAddress: "3C:CD:36:99:A1:02",
    category: "Factory Car Audio",
    brand: "Lexus",
  },
  {
    id: "mazda-connect",
    name: "Mazda Connect",
    macAddress: "40:4E:36:8A:BC:34",
    category: "Factory Car Audio",
    brand: "Mazda",
  },
  {
    id: "mazda-bt",
    name: "Mazda BT",
    macAddress: "54:B1:21:6E:9A:12",
    category: "Factory Car Audio",
    brand: "Mazda",
  },
  {
    id: "tesla-m3",
    name: "Tesla Model 3",
    macAddress: "98:ED:5C:32:1B:77",
    category: "Infotainment & Hands-Free",
    brand: "Tesla",
  },
  {
    id: "tesla-my",
    name: "Tesla Model Y",
    macAddress: "98:ED:5C:77:4F:88",
    category: "Infotainment & Hands-Free",
    brand: "Tesla",
  },
  {
    id: "ford-sync",
    name: "Ford SYNC",
    macAddress: "04:D3:B0:55:18:9A",
    category: "Factory Car Audio",
    brand: "Ford",
  },
  {
    id: "ford-audio",
    name: "Ford Audio",
    macAddress: "04:D3:B0:12:34:56",
    category: "Factory Car Audio",
    brand: "Ford",
  },
  {
    id: "carplay",
    name: "CarPlay",
    macAddress: "A4:C3:61:98:33:DE",
    category: "Infotainment & Hands-Free",
    brand: "Apple CarPlay",
  },
  {
    id: "android-auto",
    name: "Android Auto",
    macAddress: "70:BC:10:44:EE:29",
    category: "Infotainment & Hands-Free",
    brand: "Google",
  },
  {
    id: "hyundai-audio",
    name: "Hyundai Audio",
    macAddress: "10:D0:7A:B2:77:41",
    category: "Factory Car Audio",
    brand: "Hyundai",
  },
  {
    id: "kia-uvo",
    name: "Kia Motors",
    macAddress: "68:C4:4D:11:A2:33",
    category: "Factory Car Audio",
    brand: "Kia",
  },
  {
    id: "vw-bt",
    name: "VW Phone",
    macAddress: "00:1E:8C:F9:67:23",
    category: "Factory Car Audio",
    brand: "Volkswagen",
  },
  {
    id: "audi-mmi",
    name: "Audi MMI",
    macAddress: "78:44:05:8B:2A:41",
    category: "Factory Car Audio",
    brand: "Audi",
  },
  {
    id: "bmw-bt",
    name: "BMW Bluetooth",
    macAddress: "00:01:A9:6F:42:10",
    category: "Factory Car Audio",
    brand: "BMW",
  },
  {
    id: "mb-mbux",
    name: "MB Bluetooth / MBUX",
    macAddress: "14:98:77:AA:BB:CC",
    category: "Factory Car Audio",
    brand: "Mercedes-Benz",
  },
  {
    id: "subaru-bt",
    name: "Subaru BT",
    macAddress: "6C:29:95:43:21:00",
    category: "Factory Car Audio",
    brand: "Subaru",
  },
  {
    id: "starlink",
    name: "SUBARU STARLINK",
    macAddress: "6C:29:95:99:88:77",
    category: "Factory Car Audio",
    brand: "Subaru",
  },
  {
    id: "nissan-connect",
    name: "NissanConnect",
    macAddress: "24:62:AB:33:55:77",
    category: "Factory Car Audio",
    brand: "Nissan",
  },
  {
    id: "honda-hft",
    name: "HandsFreeLink",
    macAddress: "08:70:45:99:12:34",
    category: "Factory Car Audio",
    brand: "Honda",
  },
  {
    id: "mitsubishi-bt",
    name: "Mitsubishi Motors",
    macAddress: "00:26:E8:11:22:33",
    category: "Factory Car Audio",
    brand: "Mitsubishi",
  },
  {
    id: "holden-mylink",
    name: "Holden MyLink",
    macAddress: "5C:AA:FD:88:99:00",
    category: "Factory Car Audio",
    brand: "Holden",
  },
  {
    id: "pioneer-bt",
    name: "Pioneer BT Unit",
    macAddress: "00:02:B3:66:77:88",
    category: "Aftermarket Head Unit",
    brand: "Pioneer",
  },
  {
    id: "sony-car",
    name: "Sony Car Audio",
    macAddress: "F0:BF:97:12:45:78",
    category: "Aftermarket Head Unit",
    brand: "Sony",
  },
  {
    id: "kenwood-bt",
    name: "Kenwood BT",
    macAddress: "00:1B:DC:44:55:66",
    category: "Aftermarket Head Unit",
    brand: "Kenwood",
  },
  {
    id: "alpine-bt",
    name: "Alpine Car Audio",
    macAddress: "00:05:4F:9A:8B:7C",
    category: "Aftermarket Head Unit",
    brand: "Alpine",
  },
  {
    id: "obdlink-ble",
    name: "OBDLink CX / MX+ BLE",
    macAddress: "00:04:3E:AA:BB:01",
    category: "OBD-II & Diagnostics",
    brand: "OBDLink",
  },
  {
    id: "veepeak-ble",
    name: "Veepeak OBDCheck BLE",
    macAddress: "24:0A:C4:00:11:22",
    category: "OBD-II & Diagnostics",
    brand: "Veepeak",
  },
  {
    id: "carista-ble",
    name: "Carista BLE Adapter",
    macAddress: "08:EB:ED:FF:EE:DD",
    category: "OBD-II & Diagnostics",
    brand: "Carista",
  },
];

export function loadBluetoothConfig() {
  try {
    const e = localStorage.getItem(BT_CONFIG_KEY) || localStorage.getItem(LEGACY_BT_CONFIG_KEY);
    if (e) {
      const t = JSON.parse(e);
      const s = {
        ...DEFAULT_BT_CONFIG,
        ...t,
      };
      if (!s.vehicleMappings || !Array.isArray(s.vehicleMappings)) {
        s.vehicleMappings = [];
        if (s.vehicleReg && s.deviceName) {
          s.vehicleMappings.push({
            vehicleReg: s.vehicleReg,
            deviceName: s.deviceName,
            deviceMacAddress: s.deviceMacAddress || "",
            defaultTripType: s.defaultTripType || "work",
            autoEndTrip: s.autoEndTrip ?? true,
          });
        }
      }
      return s;
    }
  } catch (error) {
    console.error("Failed to parse bluetooth config", error);
  }
  return DEFAULT_BT_CONFIG;
}

export function saveBluetoothConfig(e) {
  try {
    let t = {
      ...e,
    };
    if (t.vehicleMappings && t.vehicleMappings.length > 0) {
      const s =
        t.vehicleMappings.find((o) => o.vehicleReg === t.vehicleReg) || t.vehicleMappings[0];
      if (s) {
        t.vehicleReg = s.vehicleReg;
        t.deviceName = s.deviceName;
        t.deviceMacAddress = s.deviceMacAddress || "";
        if (s.defaultTripType) {
          t.defaultTripType = s.defaultTripType;
        }
      }
    }
    localStorage.setItem(BT_CONFIG_KEY, JSON.stringify(t));
  } catch (error) {
    console.error("Failed to save bluetooth config", error);
  }
}

export function matchVehicleForDevice(e, t, s) {
  const o = normalizeMacAddress(s);
  const a = (e == null ? undefined : e.trim().toLowerCase()) || "";
  if (t.vehicleMappings && t.vehicleMappings.length > 0) {
    if (o) {
      const d = t.vehicleMappings.find(
        (u) => u.deviceMacAddress && normalizeMacAddress(u.deviceMacAddress) === o,
      );
      if (d) {
        return {
          vehicleReg: d.vehicleReg,
          tripType: d.defaultTripType || t.defaultTripType || "work",
          autoEndTrip: d.autoEndTrip ?? t.autoEndTrip ?? true,
          matchedMapping: d,
        };
      }
    }
    if (isValidMacAddress(e)) {
      const d = normalizeMacAddress(e);
      const u = t.vehicleMappings.find(
        (f) => f.deviceMacAddress && normalizeMacAddress(f.deviceMacAddress) === d,
      );
      if (u) {
        return {
          vehicleReg: u.vehicleReg,
          tripType: u.defaultTripType || t.defaultTripType || "work",
          autoEndTrip: u.autoEndTrip ?? t.autoEndTrip ?? true,
          matchedMapping: u,
        };
      }
    }
    if (a) {
      const d = t.vehicleMappings.find((f) => f.deviceName.trim().toLowerCase() === a);
      if (d) {
        return {
          vehicleReg: d.vehicleReg,
          tripType: d.defaultTripType || t.defaultTripType || "work",
          autoEndTrip: d.autoEndTrip ?? t.autoEndTrip ?? true,
          matchedMapping: d,
        };
      }
      const u = t.vehicleMappings.find((f) => {
        const m = f.deviceName.trim().toLowerCase();
        return m.length > 2 && (a.includes(m) || m.includes(a));
      });
      if (u) {
        return {
          vehicleReg: u.vehicleReg,
          tripType: u.defaultTripType || t.defaultTripType || "work",
          autoEndTrip: u.autoEndTrip ?? t.autoEndTrip ?? true,
          matchedMapping: u,
        };
      }
    }
  }
  return {
    vehicleReg: t.vehicleReg || "",
    tripType: t.defaultTripType || "work",
    autoEndTrip: t.autoEndTrip ?? true,
  };
}

export function isWebBluetoothSupported() {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export async function scanForBluetoothDevice() {
  if (!isWebBluetoothSupported()) {
    return {
      success: false,
      error:
        "Web Bluetooth is not supported in this browser. (Use Chrome, Edge, Opera, or Android Chrome).",
    };
  }
  try {
    const e = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["generic_access", "battery_service", "device_information"],
    });
    if (!e) {
      return {
        success: false,
        error: "No device chosen.",
      };
    }
    const id = e.id || "";
    const macAddress = id.length >= 12 ? normalizeMacAddress(id.slice(0, 12)) : id;
    return {
      success: true,
      device: {
        name: e.name || "Bluetooth Device",
        id,
        macAddress,
      },
    };
  } catch (error) {
    if (error?.name === "NotFoundError") {
      return {
        success: false,
        error: "Pairing cancelled.",
      };
    }
    return {
      success: false,
      error: error?.message || "Bluetooth scan failed.",
    };
  }
}

let connectedBleDevice = null;

export async function connectBleDevice(e) {
  if (!isWebBluetoothSupported()) {
    return {
      success: false,
      error: "Web Bluetooth is not supported in this browser.",
    };
  }
  try {
    const t = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["generic_access", "battery_service", "device_information"],
    });
    if (t) {
      return (
        (connectedBleDevice = t),
        t.addEventListener("gattserverdisconnected", () => {
          console.log("BLE Car device disconnected:", t.name);
          connectedBleDevice = null;
          e();
        }),
        t.gatt && (await t.gatt.connect()),
        {
          success: true,
          deviceName: t.name || "Bluetooth Device",
          deviceId: t.id || "",
        }
      );
    }
    return {
      success: false,
      error: "No device selected",
    };
  } catch (error) {
    if (error.name === "NotFoundError") {
      return {
        success: false,
        error: "Pairing cancelled",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to connect to Bluetooth device",
    };
  }
}

export function disconnectBleDevice() {
  if (connectedBleDevice) {
    try {
      if (connectedBleDevice.gatt && connectedBleDevice.gatt.connected) {
        connectedBleDevice.gatt.disconnect();
      }
    } catch (error) {
      console.warn("Error disconnecting BLE device", error);
    }
    connectedBleDevice = null;
  }
}

export function getConnectedBleDeviceName() {
  if (connectedBleDevice) {
    return connectedBleDevice.name || "Connected BLE Device";
  }
  return null;
}

export function syncAndroidBridgePreferences(e, t = false) {
  let s;
  if (typeof window !== "undefined" && (s = window.AndroidBridge) != null && s.syncPreferences) {
    try {
      window.AndroidBridge.syncPreferences(e.deviceName || "", e.vehicleReg || "", t);
      return true;
    } catch (error) {
      console.warn("Failed to sync preferences with AndroidBridge", error);
    }
  }
  return false;
}

export function simulateAndroidBluetoothEvent(e, t, s, o) {
  if (typeof window !== "undefined") {
    if (e === "connected") {
      window.dispatchEvent(
        new CustomEvent("android_bluetooth_connected", {
          detail: {
            device: t || "Toyota Hands-Free",
            vehicle: s || "MY-CAR",
            macAddress: o || "00:1A:7D:DA:71:13",
          },
        }),
      );
    } else {
      window.dispatchEvent(new CustomEvent("android_bluetooth_disconnected"));
    }
  }
}

export function buildBluetoothAutoStartUrl(e, t, deviceName, deviceMacAddress) {
  const d = (
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "https://easylog.app/"
  ).split("?")[0];
  const u = t ? `&vehicle=${encodeURIComponent(t)}` : "";
  const f = deviceName ? `&device=${encodeURIComponent(deviceName)}` : "";
  const m = deviceMacAddress ? `&mac=${encodeURIComponent(deviceMacAddress)}` : "";
  return {
    startUrl: `${d}?action=start_trip&source=bluetooth${u}${f}${m}`,
    endUrl: `${d}?action=end_trip&source=bluetooth`,
  };
}
