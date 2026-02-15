import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLearningById } from "../api/learningApi";
import { getOutcomes, createOutcome, deleteOutcome } from "../api/appliedOutcomeApi";
import AddSkillModal from "./AddSkillModal";
import { categoryLabel } from "../utils/categories";

const TYPE_COLORS = {
  PROJECT: "bg-violet-50 text-violet-600",
  TASK:    "bg-sky-50 text-sky-600",
  BLOG:    "bg-rose-50 text-rose-500",
  WORK:    "bg-amber-50 text-amber-600",
};

const TYPE_LABELS = {
  PROJECT: "Project",
  TASK:    "Task",
  BLOG:    "Blog",
  WORK:    "Work",
};

export default function LearningDetailPage() {
  const { learningId } = useParams();
  const navigate = useNavigate();

  const [learning, setLearning] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { refresh(); }, [learningId]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [l, o] = await Promise.all([getLearningById(learningId), getOutcomes(learningId)]);
      setLearning(l);
      setOutcomes(o);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSkill(description, type) {
    await createOutcome(learningId, description, type);
    setShowModal(false);
    await refresh();
  }

  async function handleDeleteSkill(outcomeId) {
    setError("");
    try {
      await deleteOutcome(learningId, outcomeId);
      await refresh();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message;
      setError(msg || "Failed to delete skill.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!learning) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-600 mb-4">Learning item not found.</p>
        <button
          onClick={() => navigate("/learning")}
          className="text-sm text-brand-400 hover:text-brand-500 font-medium"
        >
          ← Back to Learning
        </button>
      </div>
    );
  }

  const doneCount = outcomes.length;
  const progressPct = doneCount > 0 ? 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fadeIn">
      {/* Back */}
      <button
        onClick={() => navigate("/learning")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400
                   hover:text-brand-400 transition-colors mb-6"
      >
        <span>←</span> Learning
      </button>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mb-2">
        {learning.category && (
          <span className="pill pill-type">{categoryLabel(learning.category)}</span>
        )}
        <span className={`pill ${learning.status === "APPLIED" ? "pill-applied" : "pill-pending"}`}>
          {learning.status === "APPLIED" ? "Applied" : "Pending"}
        </span>
        <span>
          Started {new Date(learning.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{learning.title}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                     text-white text-sm font-semibold transition-colors shadow-soft shrink-0"
        >
          <span className="text-base leading-none">+</span> Add Applied Skill
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 text-sm text-red-600">{error}</div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Applied progress */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900">Applied progress</h2>
              <span className="text-lg">🎯</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Confidence grows when you ship small, real actions.
            </p>

            {/* Done count */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Done</span>
              <span className="text-sm text-gray-400">{doneCount}/{doneCount || 1}</span>
            </div>
            <div className="progress-track mb-5">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5
                                 rounded-full bg-brand-50 text-brand-600">
                  {doneCount === 0 ? "Starting" : "In progress"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="text-sage-500">✓</span> Done
                  </span>
                  <span className="font-semibold text-gray-800">{doneCount}</span>
                </div>
              </div>
            </div>

            {/* Motivational */}
            <div className="bg-sage-50 rounded-xl px-4 py-3">
              <p className="text-xs text-sage-700">
                <span className="mr-1">✨</span>
                {doneCount === 0
                  ? "Small wins count. A 15-minute experiment is a real application."
                  : "Great momentum! Keep shipping small actions to build confidence."}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Applied skills list */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900">Applied skills</h2>
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-bold
                               flex items-center justify-center">
                {outcomes.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Turn knowledge into behavior — one action at a time.
            </p>

            {outcomes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🎯</span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">No applied skills yet</p>
                <p className="text-xs text-gray-400 mb-4">Show how you put this learning into practice.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm text-brand-400 hover:text-brand-500 font-medium transition-colors"
                >
                  + Add your first skill
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {outcomes.map((o) => (
                  <div
                    key={o.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100/80 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[0.65rem] font-semibold uppercase tracking-wider
                                            ${TYPE_COLORS[o.type] || "text-gray-500"} px-2 py-0.5 rounded-full`}>
                            {TYPE_LABELS[o.type] || o.type}
                          </span>
                          <span className="pill pill-applied">Done</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{o.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        <span className="text-[0.7rem] text-gray-400 hidden sm:inline">
                          {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(o.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50
                                     transition-colors text-xs opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddSkillModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddSkill}
        />
      )}
    </div>
  );
}
