import { useEffect, useState } from "react";
import {
  Camera,
  CameraOff,
  CircleCheck,
  FileCheck,
  Gauge,
  History,
  Keyboard,
  ShieldCheck,
  X,
} from "lucide-react";
import { OdometerScanner } from "./OdometerScanner";
import { buildCalibrationTrip, getCalibrationStatus } from "../services/calibration";

export const CalibrationModal = ({
  isOpen,
  onClose,
  vehicles,
  selectedVehicle,
  history,
  onSaveCalibrationTrip,
  lastKnownOdoForVehicle,
  distanceUnit,
  showNotification,
}) => {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [M, setM] = useState("ATO Monthly Calibration & Cluster Sync");
  const [A, setA] = useState(undefined);
  const [j, setJ] = useState(false);
  const [v, setV] = useState(false);
  useEffect(() => {
    if (isOpen) {
      const S = selectedVehicle || (vehicles.length > 0 ? vehicles[0] : "");
      setX(S);
      const K = S ? lastKnownOdoForVehicle(S) : null;
      setY(K !== null ? K.toString() : "");
      setA(undefined);
      setJ(false);
      setV(false);
    }
  }, [isOpen, selectedVehicle, vehicles]);
  if (!isOpen) {
    return null;
  }
  const prefilledValue = (x && lastKnownOdoForVehicle(x)) || 0;
  const R = parseInt(y, 10);
  const W = !isNaN(R) && R > 0;
  const Z = W ? R - prefilledValue : 0;
  const H = x ? getCalibrationStatus(x, history) : null;
  const U = () => {
    if (!x) {
      showNotification?.("Please select a vehicle to calibrate.", "error");
      return;
    }
    if (!W) {
      showNotification?.("Please enter a valid physical odometer reading.", "error");
      return;
    }
    if (
      R < prefilledValue &&
      !window.confirm(
        `Physical reading (${R} ${distanceUnit}) is lower than current logbook (${prefilledValue} ${distanceUnit}). Continue with cluster adjustment?`,
      )
    ) {
      return;
    }
    const S = buildCalibrationTrip(x, R, prefilledValue, A, M);
    onSaveCalibrationTrip(S);
    showNotification?.(
      `Odometer calibrated for ${x}! Next trip begins at ${R.toLocaleString()} ${distanceUnit}.`,
      "success",
    );
    onClose();
  };
  const q = (S, K) => {
    setY(S.toString());
    setA(K);
    setJ(false);
    showNotification?.(`Cluster scanned: ${S.toLocaleString()} ${distanceUnit}`, "success");
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
          <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-800 text-white shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                <Gauge size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-1.5">
                  <span>ATO Odometer Calibration</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Monthly
                  </span>
                </h2>
                <p className="text-xs text-amber-100">
                  Align physical dashboard cluster with digital logbook records
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-5 overflow-y-auto">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Vehicle To Calibrate
              </label>
              <select
                value={x}
                onChange={(S) => {
                  const value = S.target.value;
                  setX(value);
                  const ue = lastKnownOdoForVehicle(value);
                  setY(ue !== null ? ue.toString() : "");
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {vehicles.map((S) => (
                  <option key={S} value={S}>
                    {S}
                  </option>
                ))}
              </select>
              {H && (
                <div className="mt-2 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200/80">
                  <span className="text-gray-500 flex items-center gap-1">
                    <History size={12} />
                    Last calibrated:
                  </span>
                  <span
                    className={`font-semibold ${H.isOverdue ? "text-amber-700" : "text-emerald-700"}`}
                  >
                    {H.lastCalibrationDate
                      ? `${H.daysSinceLastCalibration} days ago (${new Date(H.lastCalibrationDate).toLocaleDateString()})`
                      : "Never (Initial calibration needed)"}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Logbook Recorded
                </span>
                <div className="text-xl font-mono font-black text-slate-800">
                  {prefilledValue.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">{distanceUnit}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Based on sum of completed GPS & camera trips.
                </p>
              </div>
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Actual Dashboard Cluster
                </span>
                <div className="text-xl font-mono font-black text-amber-950">
                  {W ? R.toLocaleString() : "---"}
                  <span className="text-xs font-normal text-amber-600 ml-1">{distanceUnit}</span>
                </div>
                <p className="text-[10px] text-amber-700 leading-snug">
                  Enter physical reading or snap dashboard below.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard size={14} className="text-amber-600" />
                  <span>Physical Dashboard Reading ({distanceUnit})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setJ(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 py-0.5 bg-indigo-50 hover:bg-indigo-100 px-2 rounded-lg transition"
                >
                  <Camera size={13} />
                  <span>Snap Dashboard Photo</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={y}
                  onChange={(S) => setY(S.target.value)}
                  placeholder={prefilledValue.toString()}
                  className="w-full px-4 py-3 text-lg font-mono font-bold bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 shadow-2xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">
                  {distanceUnit}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span>
                  {A ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CircleCheck size={12} className="text-emerald-600 inline" /> Photo attached
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <CameraOff size={12} className="text-gray-400" /> Manual keypad entry active
                      (no camera needed)
                    </span>
                  )}
                </span>
                {A && (
                  <button
                    type="button"
                    onClick={() => setA(undefined)}
                    className="text-gray-400 hover:text-red-500 text-[10.5px] underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              {A && (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CircleCheck size={16} className="shrink-0 text-emerald-600" />
                  <span className="truncate">
                    Dashboard photo attached as ATO substantiation evidence.
                  </span>
                </div>
              )}
            </div>
            {W && (
              <div
                className={`p-3.5 rounded-2xl border ${Z === 0 ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : Z > 0 ? "bg-blue-50/70 border-blue-200 text-blue-900" : "bg-amber-50/70 border-amber-200 text-amber-900"}`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>Reconciliation Variance</span>
                  <span className="font-mono text-sm">
                    {Z > 0 ? `+${Z}` : Z} {distanceUnit}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {Z === 0 && (
                    <>
                      <strong>Perfect Match:</strong> Your logbook is 100% aligned with the physical
                      dashboard. A monthly verification record will be timestamped for your records.
                    </>
                  )}
                  {Z > 0 && (
                    <>
                      <strong>
                        + {Z} {distanceUnit} gap detected:
                      </strong>{" "}
                      In compliance with ATO Division 28 rules, unlogged dashboard movement is
                      safely logged as <em>Personal travel</em> so business tax deductions are never
                      overstated.
                    </>
                  )}
                  {Z < 0 && (
                    <>
                      <strong>
                        {Z} {distanceUnit} drift:
                      </strong>{" "}
                      The dashboard rolled slightly less than GPS logged (often due to underground
                      carparks or minor GPS overshoot). Baseline will reset to exact dashboard
                      cluster.
                    </>
                  )}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Calibration Note / Tax Record Reason
              </label>
              <input
                type="text"
                value={M}
                onChange={(S) => setM(S.target.value)}
                placeholder="e.g. Monthly calibration / 15,000km service invoice sync"
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-gray-800"
              />
            </div>
            <div className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setV(!v)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700"
              >
                <div className="flex items-center gap-1.5 text-indigo-900">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <span>Why Monthly Calibration Keeps You ATO Compliant</span>
                </div>
                <span className="text-indigo-600 text-xs">{v ? "Hide" : "Read"}</span>
              </button>
              {v && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-200 text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>1. Continuous Odometer Chain:</strong> The ATO requires logbooks to show
                    an unbroken chain of odometer readings matching vehicle service invoices,
                    roadworthy certificates, and actual vehicle disposal.
                  </p>
                  <p>
                    <strong>2. GPS vs Cluster Drift:</strong> GPS measures straight ground path,
                    while dashboard odometers count wheel rotations. Monthly calibration ensures
                    drift never accumulates beyond 1–2%.
                  </p>
                  <p>
                    <strong>3. Photographic Substantiation:</strong> Attaching dashboard snapshots
                    gives you bulletproof documentation during any Australian Taxation Office audit.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2 shrink-0">
            <button
              type="button"
              onClick={U}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-indigo-700 hover:from-amber-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <FileCheck size={18} />
              <span>Confirm Calibration & Sync Baseline</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-gray-500 font-semibold hover:text-gray-700 text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {j && (
        <OdometerScanner
          onCancel={() => setJ(false)}
          onScanComplete={q}
          mode="end"
          title="ATO Dashboard Calibration Scan"
          autoStartCamera
          prefilledValue={prefilledValue}
          vehicles={vehicles}
          distanceUnit={distanceUnit}
        />
      )}
    </>
  );
};
