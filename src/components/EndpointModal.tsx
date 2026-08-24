"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Clock, AlertTriangle, Loader2 } from "lucide-react";

interface EndpointModalProps {
  isOpen: boolean;
  projectId: string;
  endpoint?: any;
  onClose: () => void;
  onSuccess: (endpoint: any) => void;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const COMMON_STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500];

export default function EndpointModal({
  isOpen,
  projectId,
  endpoint,
  onClose,
  onSuccess,
}: EndpointModalProps) {
  const isEditing = Boolean(endpoint);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("GET");
  const [statusCode, setStatusCode] = useState(200);
  const [responseBody, setResponseBody] = useState("{\n  \"message\": \"Hello from MockEngine!\"\n}");
  const [delayMs, setDelayMs] = useState(0);
  const [errorRate, setErrorRate] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (endpoint) {
      setName(endpoint.name || "");
      setPath(endpoint.path || "");
      setMethod(endpoint.method || "GET");
      setStatusCode(endpoint.statusCode || 200);
      try {
        setResponseBody(JSON.stringify(JSON.parse(endpoint.responseBody), null, 2));
      } catch {
        setResponseBody(endpoint.responseBody || "{}");
      }
      setDelayMs(endpoint.delayMs || 0);
      setErrorRate(endpoint.errorRate || 0.0);
    } else {
      setName("");
      setPath("");
      setMethod("GET");
      setStatusCode(200);
      setResponseBody("{\n  \"message\": \"Hello from MockEngine!\"\n}");
      setDelayMs(0);
      setErrorRate(0.0);
    }
  }, [endpoint, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !path) {
      setError("Please provide endpoint name and route path");
      return;
    }

    try {
      JSON.parse(responseBody);
    } catch {
      setError("Invalid JSON format in Response Body");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        projectId,
        name,
        path,
        method,
        statusCode: Number(statusCode),
        responseBody,
        delayMs: Number(delayMs),
        errorRate: Number(errorRate),
      };

      const url = "/api/endpoints";
      const httpMethod = isEditing ? "PUT" : "POST";
      const body = isEditing ? { ...payload, id: endpoint.id } : payload;

      const res = await fetch(url, {
        method: httpMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save endpoint");
      }

      onSuccess(data.endpoint);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>{isEditing ? "Edit Mock Endpoint" : "Create New Mock Endpoint"}</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Name & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                Endpoint Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Get User Profile"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-400 font-mono font-bold cursor-pointer"
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Route Path & Status Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                Route Path *
              </label>
              <div className="flex items-center bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono font-semibold">
                <input
                  type="text"
                  placeholder="/users/profile"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-hidden w-full placeholder-zinc-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1">
                HTTP Status Code
              </label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-400 font-mono font-bold cursor-pointer"
              >
                {COMMON_STATUS_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} {code === 200 ? "OK" : code === 201 ? "Created" : code === 404 ? "Not Found" : code === 500 ? "Server Error" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chaos & Network Simulation Section */}
          <div className="p-4 bg-black border border-zinc-800 rounded-2xl space-y-4 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Chaos Testing & Network Simulation</span>
            </div>

            {/* Delay Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Latency Simulation
                </span>
                <span className="font-mono text-indigo-300 font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700/60">
                  {delayMs} ms
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>0ms (Instant)</span>
                <span>2500ms (Slow 3G)</span>
                <span>5000ms (High Latency)</span>
              </div>
            </div>

            {/* Error Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-200 mb-1">
                <span>Fault Injection (Random 500 Error Rate)</span>
                <span className="font-mono text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-700/60">
                  {Math.round(errorRate * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={errorRate}
                onChange={(e) => setErrorRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>0% (Reliable)</span>
                <span>50% (Flaky)</span>
                <span>100% (Full Outage)</span>
              </div>
            </div>
          </div>

          {/* Response Body JSON */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-zinc-200">
                Mock Response Body (JSON) *
              </label>
              <button
                type="button"
                onClick={() => {
                  try {
                    setResponseBody(JSON.stringify(JSON.parse(responseBody), null, 2));
                  } catch {}
                }}
                className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer"
              >
                Auto-Format JSON
              </button>
            </div>
            <textarea
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              rows={7}
              className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-xs font-mono text-emerald-300 focus:outline-hidden focus:border-indigo-400 resize-y"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Endpoint"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}