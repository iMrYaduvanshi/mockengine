"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Check,
  Globe,
  Terminal,
  Clock,
  AlertTriangle,
  Play,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Code2,
  BookOpen,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import CreateProjectModal from "@/components/CreateProjectModal";
import EndpointModal from "@/components/EndpointModal";
import TestRunnerModal from "@/components/TestRunnerModal";

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"endpoints" | "logs" | "snippets">("endpoints");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [copiedPathId, setCopiedPathId] = useState<string | null>(null);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<any | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        if (!selectedProject) {
          setSelectedProject(data.projects[0]);
        } else {
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async (projectId: string) => {
    try {
      const res = await fetch(`/api/logs?projectId=${projectId}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchLogs(selectedProject.id);
    }
  }, [selectedProject]);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/m/${selectedProject?.slug || ""}`
      : "";

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopiedBaseUrl(true);
    setTimeout(() => setCopiedBaseUrl(false), 2000);
  };

  const handleCopyEndpointUrl = (path: string, id: string) => {
    const full = `${baseUrl}${path}`;
    navigator.clipboard.writeText(full);
    setCopiedPathId(id);
    setTimeout(() => setCopiedPathId(null), 2000);
  };

  const handleToggleActive = async (endpoint: any) => {
    try {
      await fetch("/api/endpoints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: endpoint.id, isActive: !endpoint.isActive }),
      });
      fetchProjects();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mock endpoint?")) return;
    try {
      await fetch(`/api/endpoints?id=${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete endpoint:", err);
    }
  };

  const filteredEndpoints = (selectedProject?.endpoints || []).filter((ep: any) => {
    const matchesSearch =
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || ep.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "POST":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "PUT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "DELETE":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    }
  };

  const totalEndpoints = selectedProject?.endpoints?.length || 0;
  const totalLogs = logs.length;
  const chaosEndpointsCount = (selectedProject?.endpoints || []).filter(
    (ep: any) => ep.delayMs > 0 || ep.errorRate > 0
  ).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* 1. Fully Responsive High-Contrast Header */}
      <header className="border-b border-zinc-800/90 bg-black/90 backdrop-blur-xl px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Engine Multi-Gear Logo */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center shadow-inner group-hover:border-indigo-500 transition duration-300 relative overflow-hidden">
                <svg
                  viewBox="0 0 32 32"
                  className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                    <linearGradient id="smallGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  {/* Primary Main Gear */}
                  <g stroke="url(#gearGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13" cy="18" r="5.5" fill="#09090b" />
                    <circle cx="13" cy="18" r="2" fill="url(#gearGrad)" fillOpacity="0.4" />
                    <path d="M13 11v-2M13 27v-2M6 18H4M22 18h-2M8 13l-1.4-1.4M19.4 24.4l-1.4-1.4M8 23l-1.4 1.4M19.4 11.6l-1.4 1.4" />
                  </g>

                  {/* Interlocking Secondary Top Gear */}
                  <g stroke="url(#smallGearGrad)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="22" cy="10" r="3.8" fill="#09090b" />
                    <circle cx="22" cy="10" r="1.3" fill="url(#smallGearGrad)" fillOpacity="0.5" />
                    <path d="M22 5v-1M22 16v-1M17 10h-1M27 10h-1M18.5 6.5l-.8-.8M26.3 14.3l-.8-.8M18.5 13.5l-.8.8M26.3 5.7l-.8.8" />
                  </g>

                  {/* Interlocking Tertiary Micro Gear */}
                  <g stroke="url(#gearGrad)" strokeWidth="1.2" strokeLinecap="round">
                    <circle cx="24" cy="22" r="2.6" fill="#09090b" />
                    <circle cx="24" cy="22" r="0.8" fill="#c084fc" />
                    <path d="M24 18.5v-.8M24 26.3v-.8M20.5 22h-.8M28.3 22h-.8" />
                  </g>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">MockEngine</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-semibold">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 font-mono tracking-tight font-medium">API & Chaos Platform</p>
              </div>
            </div>

            {/* Project Switcher Dropdown */}
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-3 sm:pl-5">
              <Layers className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
              <select
                value={selectedProject?.id || ""}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) setSelectedProject(found);
                }}
                className="bg-zinc-950 border border-zinc-700 text-xs font-semibold text-white px-3 py-1.5 rounded-lg focus:outline-hidden focus:border-indigo-400 max-w-[140px] sm:max-w-[210px] truncate cursor-pointer hover:bg-zinc-900 transition"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsCreateProjectOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 transition whitespace-nowrap cursor-pointer"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-750 rounded-lg transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>
            <a
              href="https://github.com/iMrYaduvanshi/mockengine"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-750 px-3 py-1.5 rounded-lg transition"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Project Header Banner */}
        {selectedProject && (
          <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {selectedProject.name}
                  </h1>
                  <span className="text-xs font-mono bg-zinc-900 text-indigo-300 font-semibold px-3 py-0.5 rounded-full border border-indigo-500/30">
                    /{selectedProject.slug}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Router</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  {selectedProject.description || "High-performance dynamic mock environment ready for consumption."}
                </p>
              </div>

              {/* Base URL Pill */}
              <div className="flex items-center justify-between gap-2 bg-black border border-zinc-700/80 rounded-xl p-1.5 pl-3.5 shadow-inner w-full lg:w-auto overflow-hidden">
                <span className="text-xs font-mono text-zinc-100 font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {baseUrl}
                </span>
                <button
                  onClick={handleCopyBaseUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition shrink-0 active:scale-95 cursor-pointer"
                >
                  {copiedBaseUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedBaseUrl ? "Copied" : "Copy URL"}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80">
              <div className="p-3.5 bg-black border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-300 font-medium">Configured Routes</span>
                <div className="text-lg sm:text-xl font-black font-mono text-white mt-0.5">
                  {totalEndpoints}
                </div>
              </div>
              <div className="p-3.5 bg-black border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-300 font-medium">Recorded Invocations</span>
                <div className="text-lg sm:text-xl font-black font-mono text-indigo-400 mt-0.5">
                  {totalLogs}
                </div>
              </div>
              <div className="p-3.5 bg-black border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-300 font-medium">Active Chaos Rules</span>
                <div className="text-lg sm:text-xl font-black font-mono text-amber-400 mt-0.5">
                  {chaosEndpointsCount}
                </div>
              </div>
              <div className="p-3.5 bg-black border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-300 font-medium">Engine Health</span>
                <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate">100% Operational</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "endpoints"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Endpoints ({totalEndpoints})</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "logs"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Live Inspector ({totalLogs})</span>
            </button>

            <button
              onClick={() => setActiveTab("snippets")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "snippets"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Snippets</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            {activeTab === "endpoints" && (
              <button
                onClick={() => {
                  setEditingEndpoint(null);
                  setIsEndpointModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create Endpoint</span>
              </button>
            )}

            {activeTab === "logs" && (
              <button
                onClick={() => selectedProject && fetchLogs(selectedProject.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Tab 1: Mock Endpoints List */}
        {activeTab === "endpoints" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search endpoints by path or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-hidden focus:border-indigo-400 transition"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl overflow-x-auto">
                {["ALL", "GET", "POST", "PUT", "DELETE"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition cursor-pointer ${
                      methodFilter === m
                        ? "bg-zinc-800 text-white shadow-xs"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoints Cards */}
            {filteredEndpoints.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredEndpoints.map((ep: any) => (
                  <div
                    key={ep.id}
                    className="p-4 bg-zinc-950 hover:bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 rounded-xl transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Method Badge */}
                      <span
                        className={`px-3 py-1 text-xs font-mono font-bold border rounded-lg shrink-0 ${getMethodBadgeClass(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>

                      {/* Route Path & Name */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-white truncate">
                            {ep.path}
                          </span>
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            — {ep.name}
                          </span>
                          <button
                            onClick={() => handleCopyEndpointUrl(ep.path, ep.id)}
                            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                            title="Copy endpoint URL"
                          >
                            {copiedPathId === ep.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5 sm:gap-3 mt-1.5 text-xs text-zinc-300 flex-wrap font-medium">
                          <span className="text-zinc-200 font-mono">Status: {ep.statusCode}</span>
                          {ep.delayMs > 0 && (
                            <span className="flex items-center gap-1 text-indigo-300 font-mono bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-700/60 font-semibold">
                              <Clock className="w-3 h-3 text-indigo-400" /> {ep.delayMs}ms delay
                            </span>
                          )}
                          {ep.errorRate > 0 && (
                            <span className="flex items-center gap-1 text-amber-300 font-mono bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700/60 font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> {Math.round(ep.errorRate * 100)}% chaos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                      <button
                        onClick={() => handleToggleActive(ep)}
                        className={`text-xs px-3 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                          ep.isActive
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-600/50"
                            : "bg-zinc-900 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {ep.isActive ? "Active" : "Disabled"}
                      </button>

                      <button
                        onClick={() => setTestingEndpoint(ep)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/50 rounded-lg transition cursor-pointer active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Test</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingEndpoint(ep);
                          setIsEndpointModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                        title="Edit Endpoint"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEndpoint(ep.id)}
                        className="p-1.5 text-zinc-300 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                        title="Delete Endpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <Globe className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-200">No mock endpoints found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Create your first mock endpoint to start serving custom JSON responses with latency and chaos simulation.
                </p>
                <button
                  onClick={() => setIsEndpointModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer"
                >
                  Create Mock Endpoint
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. Tab 2: Live Request Inspector */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {logs.length > 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-200 font-semibold">
                  <span>Recent HTTP Invocations (Last 50)</span>
                  <span className="font-mono text-[11px] text-zinc-400 hidden sm:inline font-normal">
                    Auto-recorded by MockEngine Router
                  </span>
                </div>
                <div className="divide-y divide-zinc-800/80 max-h-[600px] overflow-y-auto">
                  {logs.map((log: any) => (
                    <div key={log.id} className="p-4 hover:bg-zinc-900/60 transition space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-mono font-bold border rounded-md shrink-0 ${getMethodBadgeClass(
                              log.method
                            )}`}
                          >
                            {log.method}
                          </span>
                          <span className="font-mono text-xs sm:text-sm text-white font-bold truncate">
                            {log.path}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-mono rounded font-bold ${
                              log.responseStatus >= 200 && log.responseStatus < 300
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-600/60"
                                : "bg-rose-950 text-rose-300 border border-rose-600/60"
                            }`}
                          >
                            {log.responseStatus}
                          </span>
                          <span className="text-xs font-mono text-zinc-200 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {log.responseDuration}ms
                          </span>
                          <span className="text-xs text-zinc-300 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-zinc-300 flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-zinc-800/60">
                        <span>IP: <strong className="text-zinc-100">{log.ip || "127.0.0.1"}</strong></span>
                        <span className="truncate max-w-xs sm:max-w-md">
                          Client: <span className="text-zinc-200">{log.userAgent?.substring(0, 45) || "Unknown"}...</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <Terminal className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-200">No request logs recorded yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Send a request to any mock URL to see live logs here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. Tab 3: Integration Code Snippets */}
        {activeTab === "snippets" && selectedProject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* JavaScript / React */}
            <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white">React / Next.js (Fetch API)</h3>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700/50">Frontend</span>
              </div>
              <pre className="p-3.5 sm:p-4 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
{`const res = await fetch("${baseUrl}/products");
const data = await res.json();
console.log(data);`}
              </pre>
            </div>

            {/* cURL */}
            <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white">cURL (Terminal & Scripts)</h3>
                <span className="text-[11px] font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-700/50">CLI</span>
              </div>
              <pre className="p-3.5 sm:p-4 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto">
{`curl -X GET "${baseUrl}/products" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>

            {/* Python */}
            <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white">Python (Requests)</h3>
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700/50">Backend</span>
              </div>
              <pre className="p-3.5 sm:p-4 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto">
{`import requests

url = "${baseUrl}/products"
response = requests.get(url)
print(response.json())`}
              </pre>
            </div>

            {/* Axios */}
            <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white">Axios Client</h3>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">Node/JS</span>
              </div>
              <pre className="p-3.5 sm:p-4 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`import axios from 'axios';

const response = await axios.get('${baseUrl}/products');
console.log(response.data);`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* In-App Guide Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-black">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white">MockEngine Architecture & Guide</h2>
              </div>
              <button
                onClick={() => setIsDocsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-zinc-200 leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="p-3.5 bg-black border border-zinc-800 rounded-xl space-y-1.5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  What makes MockEngine unique?
                </h3>
                <p className="text-zinc-300 text-xs">
                  Unlike static mock tools, MockEngine offers a dynamic catch-all route engine with live artificial latency injection and fault simulation for chaos engineering.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">Core Architecture:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-300">
                  <li><strong>Next.js Catch-All Routing:</strong> Dynamic matching on <code>/api/m/[slug]/[...path]</code>.</li>
                  <li><strong>Universal CORS:</strong> Pre-flight OPTIONS handling for all frontend clients.</li>
                  <li><strong>Prisma Singleton:</strong> Prevents connection pool leaks during development hot-reloads.</li>
                  <li><strong>Chaos Engine:</strong> Non-blocking delays and stochastic 500 error injections.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(newProject) => {
          fetchProjects();
          setSelectedProject(newProject);
        }}
      />

      <EndpointModal
        isOpen={isEndpointModalOpen}
        projectId={selectedProject?.id || ""}
        endpoint={editingEndpoint}
        onClose={() => {
          setIsEndpointModalOpen(false);
          setEditingEndpoint(null);
        }}
        onSuccess={() => fetchProjects()}
      />

      <TestRunnerModal
        isOpen={Boolean(testingEndpoint)}
        projectSlug={selectedProject?.slug || ""}
        endpoint={testingEndpoint}
        onClose={() => setTestingEndpoint(null)}
        onRequestCompleted={() => {
          if (selectedProject) fetchLogs(selectedProject.id);
        }}
      />
    </div>
  );
}