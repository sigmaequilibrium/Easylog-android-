import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Briefcase, Check, MapPin, Navigation, Sparkles, User, X, Zap } from "lucide-react";
import { predictTripTag } from "../services/tripPrediction";

if (typeof window !== "undefined" && L && L.DomUtil && !L.DomUtil._safeGetPositionPatched) {
  const e = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (t) {
    if (!t) {
      return new L.Point(0, 0);
    }
    try {
      return e.call(this, t) || new L.Point(0, 0);
    } catch {
      return new L.Point(0, 0);
    }
  };
  L.DomUtil._safeGetPositionPatched = true;
}

export const RouteMapModal = ({
  isOpen,
  onClose,
  trip,
  allTrips = [],
  distanceUnit = "km",
  onUpdateTrip,
  showNotification,
}) => {
  const fRef = useRef(null);
  const mRef = useRef(null);
  const xRef = useRef(null);
  const bRef = useRef(null);
  const yRef = useRef(null);
  const [g, setG] = useState("streets");
  const [z, setZ] = useState("single");
  const [G, setG_1] = useState(null);
  const [_, set_] = useState(false);
  const [T, setT] = useState(false);
  useEffect(() => {
    if (!trip || !isOpen) {
      return;
    }
    let U = false;
    setT(false);
    set_(true);
    predictTripTag(
      {
        startAddress: trip.startLocation?.address,
        endAddress: trip.endLocation?.address,
        distance: trip.distance || 0,
        startTime: trip.start.timestamp,
        vehicle: trip.registrationNumber,
        notes: trip.notes,
      },
      allTrips,
    )
      .then((K) => {
        if (!U) {
          setG_1(K);
          set_(false);
        }
      })
      .catch(() => {
        if (!U) {
          set_(false);
        }
      });
    return () => {
      U = true;
    };
  }, [trip?.id, isOpen]);
  useEffect(() => {
    if (!isOpen || !fRef.current) {
      return;
    }
    const fRef_current = fRef.current;
    if (fRef_current._leaflet_id && !mRef.current) {
      delete fRef_current._leaflet_id;
    }
    const q = trip?.startLocation?.latitude || trip?.start?.location?.latitude;
    const S = trip?.startLocation?.longitude || trip?.start?.location?.longitude;
    const K = trip?.endLocation?.latitude || trip?.end?.location?.latitude;
    const ue = trip?.endLocation?.longitude || trip?.end?.location?.longitude;
    const center = [q || K || -33.8688, S || ue || 151.2093];
    let mRef_current = mRef.current;
    if (!mRef_current) {
      mRef_current = L.map(fRef_current, {
        center,
        zoom: 13,
        zoomControl: false,
      });
      mRef.current = mRef_current;
      L.control
        .zoom({
          position: "topright",
        })
        .addTo(mRef_current);
      const je = L.layerGroup().addTo(mRef_current);
      bRef.current = je;
    }
    if (yRef.current) {
      clearTimeout(yRef.current);
    }
    yRef.current = setTimeout(() => {
      if (mRef.current && mRef.current._container) {
        try {
          mRef.current.invalidateSize({
            animate: false,
          });
        } catch {}
      }
    }, 250);
    return () => {
      if (yRef.current) {
        clearTimeout(yRef.current);
        yRef.current = null;
      }
      if (mRef.current) {
        try {
          mRef.current.stop();
          mRef.current.remove();
        } catch {}
        mRef.current = null;
        bRef.current = null;
        xRef.current = null;
      }
    };
  }, [isOpen]);
  useEffect(() => {
    const mRef_current = mRef.current;
    if (!mRef_current) {
      return;
    }
    if (xRef.current) {
      mRef_current.removeLayer(xRef.current);
      xRef.current = null;
    }
    let q = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attribution = "&copy; OpenStreetMap contributors";
    if (g === "satellite") {
      q =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "&copy; Esri World Imagery";
    } else if (g === "dark") {
      q = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attribution = "&copy; CartoDB Dark";
    }
    const K = L.tileLayer(q, {
      attribution,
      maxZoom: 19,
    }).addTo(mRef_current);
    xRef.current = K;
  }, [g, isOpen]);
  useEffect(() => {
    const mRef_current = mRef.current;
    const bRef_current = bRef.current;
    if (!mRef_current || !bRef_current || !trip || !isOpen) {
      return;
    }
    bRef_current.clearLayers();
    const S = (ze, Oe) =>
      L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            background: ${ze};
            color: white;
            font-size: 11px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            display: flex;
            align-items: center;
            white-space: nowrap;
          ">
            ${Oe}
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });
    const K = trip.startLocation?.latitude || trip.start?.location?.latitude;
    const ue = trip.startLocation?.longitude || trip.start?.location?.longitude;
    const Le = trip.endLocation?.latitude || trip.end?.location?.latitude;
    const me = trip.endLocation?.longitude || trip.end?.location?.longitude;
    if (z === "single") {
      const ze = [];
      if (K && ue) {
        ze.push([K, ue]);
        L.marker([K, ue], {
          icon: S("#10b981", "🟢 Start"),
        })
          .addTo(bRef_current)
          .bindPopup(
            `<b>Trip Start</b><br>${trip.startLocation?.address || "Start Location"}<br>Odo: ${trip.start.value} ${distanceUnit}`,
          );
      }
      if (Le && me) {
        ze.push([Le, me]);
        L.marker([Le, me], {
          icon: S("#f43f5e", "🔴 Destination"),
        })
          .addTo(bRef_current)
          .bindPopup(
            `<b>Destination</b><br>${trip.endLocation?.address || "End Location"}<br>Odo: ${trip.end?.value || "N/A"} ${distanceUnit}`,
          );
      }
      if (trip.routeCoordinates && trip.routeCoordinates.length > 1) {
        L.polyline(trip.routeCoordinates, {
          color: "#4f46e5",
          weight: 5,
          opacity: 0.85,
          smoothFactor: 1,
        }).addTo(bRef_current);
        trip.routeCoordinates.forEach((Oe) => ze.push(Oe));
      } else if (K && ue && Le && me) {
        L.polyline(
          [
            [K, ue],
            [Le, me],
          ],
          {
            color: "#6366f1",
            weight: 4,
            dashArray: "6, 8",
            opacity: 0.8,
          },
        ).addTo(bRef_current);
      }
      if (ze.length > 0) {
        try {
          mRef_current.fitBounds(L.latLngBounds(ze), {
            padding: [50, 50],
            maxZoom: 15,
            animate: false,
          });
        } catch {}
      }
    } else {
      const ze = [];
      allTrips.forEach((Oe) => {
        const dt = Oe.startLocation?.latitude || Oe.start?.location?.latitude;
        const ft = Oe.startLocation?.longitude || Oe.start?.location?.longitude;
        const Je = Oe.endLocation?.latitude || Oe.end?.location?.latitude;
        const vt = Oe.endLocation?.longitude || Oe.end?.location?.longitude;
        if (dt && ft) {
          ze.push([dt, ft]);
          L.circleMarker([dt, ft], {
            radius: 6,
            color: Oe.tripType === "personal" ? "#10b981" : "#4f46e5",
            fillColor: Oe.tripType === "personal" ? "#34d399" : "#818cf8",
            fillOpacity: 0.8,
          })
            .addTo(bRef_current)
            .bindPopup(
              `<b>${(Oe.tripType || "work").toUpperCase()} Trip</b><br>${Oe.startLocation?.address || ""}<br>${Oe.distance || 0} ${distanceUnit}`,
            );
        }
        if (Je && vt) {
          ze.push([Je, vt]);
          L.circleMarker([Je, vt], {
            radius: 6,
            color: "#f43f5e",
            fillColor: "#fb7185",
            fillOpacity: 0.8,
          })
            .addTo(bRef_current)
            .bindPopup(
              `<b>${Oe.clientName || "Destination"}</b><br>${Oe.endLocation?.address || ""}`,
            );
        }
      });
      if (ze.length > 0) {
        try {
          mRef_current.fitBounds(L.latLngBounds(ze), {
            padding: [40, 40],
            animate: false,
          });
        } catch {}
      }
    }
  }, [
    isOpen,
    trip?.id,
    trip?.tripType,
    trip?.startLocation,
    trip?.endLocation,
    trip?.routeCoordinates,
    z,
    allTrips,
  ]);
  if (!isOpen || !trip) {
    return null;
  }
  const R = () => {
    if (!G || !onUpdateTrip || !trip) {
      return;
    }
    const U = {
      ...trip,
      tripType: G.predictedTripType,
      clientName: G.predictedClient || trip.clientName,
      notes: G.predictedReason || trip.notes,
    };
    onUpdateTrip(U);
    setT(true);
    showNotification?.(
      `Applied AI Tagging: ${G.predictedTripType.toUpperCase()} (${G.confidence}% confidence)`,
      "success",
    );
  };
  const W = (U, q) => {
    if (!onUpdateTrip || !trip) {
      return;
    }
    const S = {
      ...trip,
      tripType: U,
      notes: q ? (trip.notes ? `${trip.notes} • ${q}` : q) : trip.notes,
    };
    onUpdateTrip(S);
    showNotification?.(`Tagged trip as ${U.toUpperCase()}`, "success");
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[95vh] flex flex-col border border-gray-100">
        <div className="px-5 py-3.5 bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Navigation size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold leading-tight">Trip Route Map</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${trip.tripType === "personal" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"}`}
                >
                  {trip.tripType || "work"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {new Date(trip.start.timestamp).toLocaleDateString()} •{" "}
                {trip.registrationNumber || "Vehicle"} • {trip.distance || 0} {distanceUnit}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/10 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setZ("single")}
                className={`px-2.5 py-1 rounded-lg transition ${z === "single" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Route
              </button>
              <button
                type="button"
                onClick={() => setZ("all")}
                className={`px-2.5 py-1 rounded-lg transition ${z === "all" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                All Trips
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="relative h-72 sm:h-80 w-full bg-gray-100 shrink-0">
          <div ref={fRef} className="h-full w-full z-0" />
          <div className="absolute bottom-3 left-3 z-10 flex bg-white/90 backdrop-blur-md rounded-xl p-0.5 shadow-md border border-gray-200 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setG("streets")}
              className={`px-2.5 py-1 rounded-lg transition ${g === "streets" ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:text-gray-900"}`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setG("satellite")}
              className={`px-2.5 py-1 rounded-lg transition ${g === "satellite" ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:text-gray-900"}`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setG("dark")}
              className={`px-2.5 py-1 rounded-lg transition ${g === "dark" ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:text-gray-900"}`}
            >
              Dark
            </button>
          </div>
          <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/10 text-xs font-mono flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold text-sm">{trip.distance || 0}</span>
            <span className="text-gray-300 font-sans uppercase text-[10px]">{distanceUnit}</span>
          </div>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-gray-700">
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50 border border-indigo-100 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                <div className="p-1 bg-indigo-600 text-white rounded-lg">
                  <Sparkles size={14} className="animate-spin-slow" />
                </div>
                <span>AI Predictive Tagging</span>
              </div>
              {G && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {G.confidence}% Confidence
                </span>
              )}
            </div>
            {_ ? (
              <div className="flex items-center space-x-2 text-gray-500 py-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Analyzing route patterns and destination history...</span>
              </div>
            ) : G ? (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-600 font-medium">Suggested Purpose:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-lg uppercase text-xs flex items-center ${G.predictedTripType === "personal" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-indigo-100 text-indigo-800 border border-indigo-200"}`}
                  >
                    {G.predictedTripType === "personal" ? (
                      <User size={12} className="mr-1" />
                    ) : (
                      <Briefcase size={12} className="mr-1" />
                    )}
                    {G.predictedTripType}
                  </span>
                  {G.predictedClient && (
                    <span className="font-semibold text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-indigo-100 flex items-center">
                      <Briefcase size={11} className="mr-1 text-gray-400" />
                      Client: {G.predictedClient}
                    </span>
                  )}
                  {G.predictedCategory && (
                    <span className="text-gray-600 bg-white/70 px-2 py-0.5 rounded-lg border border-gray-200">
                      {G.predictedCategory}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  💡 <em>{G.explanation}</em>
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {G.tags.map((U) => (
                      <button
                        key={U}
                        type="button"
                        onClick={() => W(G.predictedTripType, U)}
                        className="px-2 py-0.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-medium transition"
                      >
                        + {U}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={T}
                    onClick={R}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition ${T ? "bg-emerald-600 text-white cursor-default" : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"}`}
                  >
                    {T ? (
                      <>
                        <Check size={13} />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Zap size={13} className="fill-current" />
                        <span>Apply AI Tag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="flex items-center text-emerald-700 font-bold text-[11px]">
                <MapPin size={13} className="mr-1" />
                Start Location
              </div>
              <p className="text-gray-900 font-medium truncate text-xs">
                {trip.startLocation?.address || "Start Coordinates Logged"}
              </p>
              <div className="text-[10px] text-gray-500 font-mono">
                Odometer: {trip.start.value.toLocaleString()} {distanceUnit}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="flex items-center text-rose-700 font-bold text-[11px]">
                <MapPin size={13} className="mr-1" />
                Destination / End Location
              </div>
              <p className="text-gray-900 font-medium truncate text-xs">
                {trip.endLocation?.address || "Destination Coordinates Logged"}
              </p>
              <div className="text-[10px] text-gray-500 font-mono">
                Odometer:{" "}
                {trip.end ? `${trip.end.value.toLocaleString()} ${distanceUnit}` : "In progress"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold text-gray-500">Quick Change:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => W("work")}
                className={`px-3 py-1 rounded-xl font-semibold text-xs border transition ${trip.tripType === "work" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                Work
              </button>
              <button
                type="button"
                onClick={() => W("personal")}
                className={`px-3 py-1 rounded-xl font-semibold text-xs border transition ${trip.tripType === "personal" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                Personal
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
