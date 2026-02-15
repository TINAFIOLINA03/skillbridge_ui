import { useState, useEffect } from "react";

const OUTCOME_TYPES = [
  { value: "PROJECT", label: "Project" },
  { value: "TASK",    label: "Task" },
  { value: "BLOG",    label: "Blog" },
  { value: "WORK",    label: "Work" },
];

const TIPS = [
  "Try a \"small win\": a 10-minute practice, a tiny experiment, or one paragraph of teaching notes.",
  "Even explaining a concept to someone counts as application.",
  "The goal is action, not perfection. Any small step counts.",
];

export default function AddSkillModal({ onClose, onAdd }) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState(OUTCOME_TYPES[0].value);
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
    if (!description.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onAdd(description.trim(), type);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to add skill.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add applied skill</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Applied action</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Teach a friend how containers work"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                         outline-none transition-all placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Make it as small as needed. The goal is action, not perfection.
            </p>
          </div>

          {/* Type */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                         outline-none transition-all appearance-none
                         bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[right_16px_center]"
            >
              {OUTCOME_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
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
              disabled={submitting || !description.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                         text-white text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
            >
              {submitting ? "Adding…" : "Add applied skill"}
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
