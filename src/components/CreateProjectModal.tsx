"use client";

import React, { useState } from "react";
import { X, FolderPlus, Loader2 } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError("Please fill in project name and slug");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      onSuccess(data.project);
      setName("");
      setSlug("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
            <FolderPlus className="w-5 h-5 text-indigo-400" />
            <span>Create New Project</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. My Fintech API"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              Project Slug (URL Identifier) *
            </label>
            <div className="flex items-center bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-300">
              <span className="text-zinc-500 select-none font-mono">/api/m/</span>
              <input
                type="text"
                placeholder="my-fintech-api"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-hidden w-full ml-1 font-mono font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="What are these mock APIs for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-400 transition resize-none"
            />
          </div>

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
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}