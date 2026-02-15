import { useState, useEffect } from "react";

const CATEGORIES = [
  { value: "TECHNICAL",           label: "Technical" },
  { value: "PROFESSIONAL_SKILLS", label: "Professional Skills" },
  { value: "NEW_LEARNINGS",       label: "New Learnings" },
  { value: "ECONOMICS",           label: "Economics" },
  { value: "WORLD_TRADE",         label: "World Trade" },
  { value: "UPSC",                label: "UPSC" },
  { value: "BANK_EXAM",           label: "Bank Exam" },
  { value: "OTHER",               label: "Other" },
];

const TIPS = [
  "Confidence grows fastest when you add one tiny applied skill — even a 10-minute practice.",
  "Keep it short. A single topic name is all you need to start.",
  "The best learnings come from what you've just done, not what you plan to do.",
];

export default function AddLearningModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onAdd(title.trim(), category);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to add learning.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add learning</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Docker"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                         outline-none transition-all placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Keep it short. You can attach applied skills right after.
            </p>
          </div>

          {/* Category field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                         outline-none transition-all appearance-none
                         bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[right_16px_center]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600
                         hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                         text-white text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              {submitting ? "Adding…" : "Add learning"}
            </button>
          </div>
        </form>

        {/* Tip */}
        <div className="mt-6 bg-sage-50 rounded-xl px-4 py-3">
          <p className="text-sm text-sage-700">
            <span className="font-medium">Tip:</span> {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
