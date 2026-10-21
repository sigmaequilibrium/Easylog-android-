import { getMobilePlatform, isStandaloneApp } from "./platform";

const getCameraPermissionState = async () => {
  var e;
  if (typeof window === "undefined" || !((e = navigator.mediaDevices) != null && e.getUserMedia)) {
    return "unsupported";
  }
  try {
    if (navigator.permissions && navigator.permissions.query) {
      return (
        await navigator.permissions.query({
          name: "camera",
        })
      ).state;
    }
  } catch {}
  return "prompt";
};

export const requestCameraPermission = async () => {
  var e;
  if (typeof window === "undefined" || !((e = navigator.mediaDevices) != null && e.getUserMedia)) {
    return {
      granted: false,
      error: "Camera is not supported on this device or browser.",
      errorType: "NotFoundError",
    };
  }
  try {
    (
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
      })
    )
      .getTracks()
      .forEach((s) => s.stop());
    return {
      granted: true,
    };
  } catch (error) {
    const errorType = error?.name || "Unknown";
    let o = error?.message || "Camera permission was not granted.";
    if (errorType === "NotAllowedError" || errorType === "PermissionDeniedError") {
      o =
        "Camera access was blocked or denied. Please enable camera permission in your phone or browser settings.";
    } else if (errorType === "NotFoundError" || errorType === "DevicesNotFoundError") {
      o = "No camera hardware found on this device.";
    } else if (errorType === "NotReadableError" || errorType === "TrackStartError") {
      o = "Camera is currently in use by another application.";
    }
    return {
      granted: false,
      error: o,
      errorType,
    };
  }
};

const getLocationPermissionState = async () => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  try {
    if (navigator.permissions && navigator.permissions.query) {
      return (
        await navigator.permissions.query({
          name: "geolocation",
        })
      ).state;
    }
  } catch {}
  return "prompt";
};

export const requestLocationPermission = async () => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return {
      granted: false,
      error: "Geolocation is not supported on this device.",
    };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () =>
        resolve({
          granted: true,
        }),
      (t) => {
        let s = "Location permission denied.";
        if (t.code === t.PERMISSION_DENIED) {
          s = "Location permission was denied. Please allow location access for GPS tracking.";
        } else if (t.code === t.POSITION_UNAVAILABLE) {
          s = "Location position unavailable. Ensure GPS is turned on.";
        } else if (t.code === t.TIMEOUT) {
          s = "Location request timed out.";
        }
        resolve({
          granted: false,
          error: s,
        });
      },
      {
        timeout: 8000,
        enableHighAccuracy: false,
        maximumAge: 60000,
      },
    );
  });
};

const getNotificationPermissionState = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

export const getPermissionStatus = async () => {
  const { isIos, isAndroid } = getMobilePlatform();
  const isStandalone = isStandaloneApp();
  const [camera, location] = await Promise.all([
    getCameraPermissionState(),
    getLocationPermissionState(),
  ]);
  const notifications = getNotificationPermissionState();
  const wakeLock = typeof window !== "undefined" && "wakeLock" in navigator;
  return {
    camera,
    location,
    notifications,
    wakeLock,
    isStandalone,
    isIos,
    isAndroid,
  };
};

export const getPermissionHelp = (e) => {
  const { isIos, isAndroid } = getMobilePlatform();
  const o = isStandaloneApp();
  switch (e) {
    case "camera":
      if (isIos) {
        return {
          title: "How to Enable Camera on iPhone / iPad",
          steps: [
            'Open your iPhone "Settings" app.',
            o
              ? 'Scroll down to "Safari" (or your default browser) > "Camera" and choose "Allow".'
              : 'Scroll down to "Safari" > "Camera" and select "Ask" or "Allow".',
            'Alternatively, go to "Privacy & Security" > "Camera" and ensure browser access is turned ON.',
            'Return to EasyLog and tap "Try Camera Again".',
          ],
        };
      }
      if (isAndroid) {
        return {
          title: "How to Enable Camera on Android",
          steps: [
            'Open Android "Settings" > "Apps" > "EasyLog" (or "Chrome").',
            'Tap "Permissions" > "Camera".',
            'Select "Allow only while using the app".',
            'Return to EasyLog and tap "Try Camera Again".',
          ],
        };
      }
      return {
        title: "How to Enable Camera in your Browser",
        steps: [
          "Click the tune/padlock icon in your browser address bar.",
          'Toggle Camera to "Allow".',
          "Reload the app and try again.",
        ],
      };
    case "location":
      if (isIos) {
        return {
          title: "How to Enable GPS / Location on iPhone",
          steps: [
            'Open iPhone "Settings" > "Privacy & Security" > "Location Services".',
            'Ensure "Location Services" is toggled ON.',
            'Find "Safari Websites" (or EasyLog) and select "While Using the App" with "Precise Location" ON.',
            "Return to EasyLog to resume GPS tracking.",
          ],
        };
      }
      return {
        title: "How to Enable GPS / Location on Android",
        steps: [
          'Open Android "Settings" > "Location" and ensure it is turned ON.',
          'Under "App permissions", find "EasyLog" (or Chrome) and select "Allow only while using the app" with "Use precise location" ON.',
          "Return to EasyLog to resume GPS tracking.",
        ],
      };
    default:
      return {
        title: "How to Enable Notifications",
        steps: [
          "In phone Settings, find the browser or EasyLog app.",
          'Tap "Notifications" and switch "Allow Notifications" ON.',
          "For iPhone PWA (iOS 16.4+), ensure EasyLog is added to the Home Screen.",
        ],
      };
  }
};
