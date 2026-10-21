import { useEffect, useState } from "react";
import { Briefcase, Check, Clock, Gauge, MapPin, PenLine, Sparkles, User, X } from "lucide-react";
import { isPlaceholderAddress, reverseGeocode } from "../services/geocoding";
import { predictTripTag } from "../services/tripPrediction";
import { formatDuration } from "../utils/format";

export const TripSummaryModal = ({
  isOpen,
  trip,
  trackedDistance,
  durationSeconds,
  endLocation,
  distanceUnit,
  allTrips = [],
  onSave,
  onCancel,
}) => {
  const x = Math.max(0.1, Math.round(trackedDistance * 10) / 10);
  const b = Math.round(trip.start.value + x);
  const [y, setY] = useState(b.toString());
  const [M, setM] = useState(x.toString());
  const [A, setA] = useState(trip.clientName || "");
  const [j, setJ] = useState(trip.notes || "");
  const [v, setV] = useState(trip.tripType || "work");
  const [F, setF] = useState(false);
  const [W, setW] = useState(trip.startLocation?.address || trip.start?.location?.address || "");
  const [H, setH] = useState(endLocation?.address || "");
  const [q, setQ] = useState(false);
  const [K, setK] = useState(null);
  const [Le, setLe] = useState(false);
  const [xe, setXe] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const be = trip.startLocation?.address || trip.start?.location?.address || "";
    const _e = trip.startLocation?.latitude || trip.start?.location?.latitude;
    const je = trip.startLocation?.longitude || trip.start?.location?.longitude;
    if (isPlaceholderAddress(be) && _e && je && _e !== 0 && je !== 0) {
      reverseGeocode(_e, je).then((Te) => {
        if (Te && !isPlaceholderAddress(Te)) {
          setW(Te);
        }
      });
    } else if (be) {
      setW(be);
    }
    const Ze = endLocation?.address || "";
    if (
      isPlaceholderAddress(Ze) &&
      endLocation?.latitude &&
      endLocation?.longitude &&
      endLocation.latitude !== 0
    ) {
      reverseGeocode(endLocation.latitude, endLocation.longitude).then((Te) => {
        if (Te && !isPlaceholderAddress(Te)) {
          setH(Te);
        }
      });
    } else if (Ze) {
      setH(Ze);
    }
    setLe(true);
    predictTripTag(
      {
        startAddress: trip.startLocation?.address,
        endAddress: endLocation?.address,
        startLocation: trip.startLocation,
        endLocation: endLocation || undefined,
        distance: x,
        startTime: trip.start.timestamp,
        vehicle: trip.registrationNumber,
        notes: trip.notes,
      },
      allTrips,
    ).then((Te) => {
      setK(Te);
      setLe(false);
      if (!trip.clientName && Te.predictedClient) {
        setA(Te.predictedClient);
      }
      if (!trip.notes && Te.predictedReason) {
        setJ(Te.predictedReason);
      }
      if (Te.predictedTripType) {
        setV(Te.predictedTripType);
      }
    });
  }, [isOpen]);
  const k = (be) => {
    setY(be);
    const _e = parseInt(be, 10);
    if (!isNaN(_e) && _e >= trip.start.value) {
      setM((_e - trip.start.value).toString());
    }
  };
  const C = () => {
    var ze;
    const be = parseInt(y, 10) || b;
    const _e = parseFloat(M) || x;
    const je = trip.startLocation
      ? {
          ...trip.startLocation,
          address: W.trim() || trip.startLocation.address,
        }
      : (ze = trip.start) != null && ze.location
        ? {
            ...trip.start.location,
            address: W.trim() || trip.start.location.address,
          }
        : undefined;
    const Ze = endLocation
      ? {
          ...endLocation,
          address: H.trim() || endLocation.address,
        }
      : undefined;
    const nt = {
      ...trip,
      status: "completed",
      distance: _e,
      tripType: v,
      clientName: A.trim(),
      notes: j.trim(),
      start: {
        ...trip.start,
        location: je,
      },
      startLocation: je,
      end: {
        value: be,
        timestamp: new Date().toISOString(),
        location: Ze,
      },
      endLocation: Ze,
    };
    onSave(nt);
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Check size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Trip Completed</h2>
              <p className="text-xs text-emerald-100">Review GPS tracking summary</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              GPS Distance Tracked
            </span>
            <div className="text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">
              {M}{" "}
              <span className="text-lg font-bold text-emerald-600 uppercase font-sans">
                {distanceUnit}
              </span>
            </div>
            <div className="flex justify-center items-center gap-4 mt-2 text-xs text-emerald-800">
              <span className="flex items-center">
                <Clock size={13} className="mr-1 opacity-70" />
                {formatDuration(durationSeconds)}
              </span>
              <span className="text-emerald-300">•</span>
              <span className="font-medium">{trip.registrationNumber || "Vehicle"}</span>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Gauge size={14} className="mr-1.5 text-indigo-600" />
                Odometer Calculation
              </span>
              <button
                type="button"
                onClick={() => setF(!F)}
                className="text-[11px] text-indigo-600 font-medium hover:underline flex items-center"
              >
                <PenLine size={11} className="mr-1" />
                {F ? "Done" : "Adjust"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Start</div>
                <div className="text-base font-mono font-bold text-gray-800">
                  {trip.start.value.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-200 shadow-xs">
                <div className="text-[10px] text-indigo-600 uppercase font-bold">Finish (Auto)</div>
                {F ? (
                  <input
                    type="number"
                    value={y}
                    onChange={(be) => k(be.target.value)}
                    className="w-full text-center font-mono font-bold text-base border-b border-indigo-500 outline-none text-indigo-700 bg-transparent"
                    autoFocus
                  />
                ) : (
                  <div className="text-base font-mono font-bold text-indigo-700">
                    {parseInt(y, 10).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <MapPin size={14} className="mr-1.5 text-emerald-600" />
                Route Addresses
              </span>
              <button
                type="button"
                onClick={() => setQ(!q)}
                className="text-[11px] text-indigo-600 font-medium hover:underline flex items-center"
              >
                <PenLine size={11} className="mr-1" />
                {q ? "Done" : "Edit"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">
                    Started at
                  </div>
                  {q ? (
                    <input
                      type="text"
                      value={W}
                      onChange={(be) => setW(be.target.value)}
                      placeholder="Start address..."
                      className="w-full mt-0.5 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-gray-800 font-medium truncate">
                      {W || trip.startLocation?.address || "Start Location"}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-0.5 h-3 bg-gray-300 ml-1" />
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">
                    Finished at
                  </div>
                  {q ? (
                    <input
                      type="text"
                      value={H}
                      onChange={(be) => setH(be.target.value)}
                      placeholder="Destination address..."
                      className="w-full mt-0.5 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-gray-800 font-medium truncate">
                      {H || endLocation?.address || "Current Destination"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {K && (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50 border border-indigo-200/80 rounded-xl p-3 space-y-1.5 text-xs animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center text-[11px]">
                  <Sparkles size={12} className="mr-1.5 text-indigo-600" />
                  AI Suggested Classification
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                  {K.confidence}% Match
                </span>
              </div>
              <div className="text-[11px] text-gray-700 leading-snug">
                <span>Predicted: </span>
                <strong
                  className={`uppercase ${K.predictedTripType === "personal" ? "text-emerald-700" : "text-indigo-700"}`}
                >
                  {K.predictedTripType}
                </strong>
                {K.predictedClient && (
                  <span>
                    {" "}
                    • Client: <strong>{K.predictedClient}</strong>
                  </span>
                )}
                {K.predictedCategory && <span> • {K.predictedCategory}</span>}
              </div>
              <p className="text-[10px] text-gray-500 italic">{K.explanation}</p>
            </div>
          )}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Trip Purpose
                </label>
                {(K?.tags?.includes("ATO Commute") || K?.tags?.includes("Home")) && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    🏠 Home Commute: Personal
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setV("work")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${v === "work" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
                >
                  <Briefcase size={12} className="inline mr-1" /> Business
                </button>
                <button
                  type="button"
                  onClick={() => setV("personal")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${v === "personal" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"}`}
                >
                  <User size={12} className="inline mr-1" /> Personal
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Client / Destination Name
              </label>
              <input
                type="text"
                value={A}
                onChange={(be) => setA(be.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Trip Notes / Reason
              </label>
              <input
                type="text"
                value={j}
                onChange={(be) => setJ(be.target.value)}
                placeholder="e.g. Client visit and site inspection"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2 shrink-0">
          <button
            type="button"
            onClick={C}
            className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center justify-center space-x-2"
          >
            <Check size={18} />
            <span>Save to Logbook</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-xs text-gray-500 font-semibold hover:text-gray-700 text-center"
          >
            Resume Driving
          </button>
        </div>
      </div>
    </div>
  );
};
