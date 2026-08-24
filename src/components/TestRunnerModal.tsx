"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Loader2, Clock, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

interface TestRunnerModalProps {
  isOpen: boolean;
  projectSlug: string;
  endpoint: any;
  onClose: () => void;
  onRequestCompleted?: () => void;
}

export default function TestRunnerModal({
  isOpen,
  projectSlug,
  endpoint,
  onClose,
  onRequestCompleted,
}: TestRunnerModalProps) {
  const [requestBody, setRequestBody] = useState("{}");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (endpoint) {
      setResponseStatus(null);
      setResponseTime(null);
      setResponseData(null);
      setRequestBody(
        endpoint.method !== "GET" ? "{\n  \"sampleKey\": \"sampleValue\"\n}" : "{}"
      );
    }
  }, [endpoint, isOpen]);

  if (!isOpen || !endpoint) return null;

  const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/m/${projectSlug}${endpoint.path}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-mockengine-tester": "dashboard",
        },
      };

      if (endpoint.method !== "GET" && endpoint.method !== "HEAD") {
        options.body = requestBody;
      }

      const res = await fetch(fullUrl, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const text = await res.text();
      try {
        setResponseData(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponseData(text);
      }

      if (onRequestCompleted) {
        onRequestCompleted();
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseData(JSON.stringify({ error: err.message || "Network Request Failed" }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded shrink-0">
              {endpoint.method}
            </span>
            <span className="text-zinc-200 font-semibold text-xs sm:text-sm truncate">
              Test: {endpoint.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Target URL Bar */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Target Mock URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-zinc-950 border border-zinc-700/80 rounded-xl overflow-hidden shadow-inner gap-1 sm:gap-0 p-1 sm:p-0">
              <div className="flex items-center flex-1 min-w-0">
                <span className="px-2.5 py-1.5 text-xs font-mono font-bold bg-zinc-800 text-zinc-300 sm:border-r border-zinc-700 select-none shrink-0 rounded sm:rounded-none">
                  {endpoint.method}
                </span>
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="bg-transparent px-2.5 py-1.5 text-xs font-mono text-zinc-200 w-full focus:outline-hidden truncate"
                />
              </div>

              <div className="flex items-center justify-end gap-1 shrink-0 pt-1 sm:pt-0 sm:border-l border-zinc-800">
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800/80 sm:bg-transparent hover:bg-zinc-800 rounded-lg sm:rounded-none flex items-center gap-1 transition cursor-pointer"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg sm:rounded-none disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Request Payload (if POST/PUT) */}
          {endpoint.method !== "GET" && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Request Payload (JSON Body)</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={3}
                className="w-full p-3 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          {/* Response Inspector Box */}
          <div className="p-3.5 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-2.5 gap-2">
              <span className="text-xs font-semibold text-zinc-300">Live Response Inspector</span>
              {responseStatus !== null && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {responseStatus >= 200 && responseStatus < 300 ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    Status: {responseStatus}
                  </span>
                  {responseTime !== null && (
                    <span className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {responseTime} ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {responseData ? (
              <pre className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 select-text">
                {responseData}
              </pre>
            ) : (
              <div className="text-center py-6 sm:py-8 text-zinc-600 text-xs">
                Click &quot;Send&quot; button above to trigger this mock API and inspect live latency & payload
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}