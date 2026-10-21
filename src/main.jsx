import React from "react";
import * as ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import "./index.css";

// Web/PWA only: the Android (Capacitor) build doesn't use a service worker.
if (!window.Capacitor?.isNativePlatform?.()) {
  registerSW({ immediate: true });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
