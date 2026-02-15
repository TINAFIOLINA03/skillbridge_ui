import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearningList, createLearning, deleteLearning } from "../api/learningApi";
import AddLearningModal from "./AddLearningModal";
import { CATEGORY_LABELS } from "../utils/categories";

export default function LearningListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const data = await getLearningList();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load learning items.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(title, category) {
    await createLearning(title, category);
    setShowModal(false);
    await loadItems();
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    setError("");
    try {
      await deleteLearning(id);
      await loadItems();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message;
      setError(msg || "Failed to delete learning.");
    }
  }

  const pendingItems = items.filter((i) => i.status === "PENDING");
  const appliedItems = items.filter((i) => i.status === "APPLIED");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 animate-fadeIn">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400
                   hover:text-brand-400 transition-colors mb-6"
      >
        <span>←</span> Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Learning</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                     text-white text-sm font-semibold transition-colors shadow-soft"
        >
          <span className="text-base leading-none">+</span> Add Learning
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-sm text-red-600">{error}</div>
      )}

      {loading && (
        <p className="text-center text-sm text-gray-400 py-16">Loading…</p>
      )}

      {/* Pending section */}
      {pendingItems.length > 0 && (
        <ListSection
          title="Needs application"
          count={pendingItems.length}
          color="text-amber-500"
          items={pendingItems}
          onNavigate={(id) => navigate(`/learning/${id}`)}
          onDelete={handleDelete}
        />
      )}

      {/* Applied section */}
      {appliedItems.length > 0 && (
        <ListSection
          title="Applied"
          count={appliedItems.length}
          color="text-sage-500"
          items={appliedItems}
          onNavigate={(id) => navigate(`/learning/${id}`)}
          onDelete={handleDelete}
        />
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="card text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-gray-800 font-semibold mb-1">No learning items yet</p>
          <p className="text-sm text-gray-500 mb-6">Start by adding something you learned today.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500
                       text-white text-sm font-semibold transition-colors shadow-soft"
          >
            + Add your first learning
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddLearningModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function ListSection({ title, count, color, items, onNavigate, onDelete }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className={`text-sm font-semibold ${color}`}>{title}</h2>
        <span className="text-[0.65rem] font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="card p-4 cursor-pointer hover:shadow-hover hover:-translate-y-px
                       transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-sm font-medium text-gray-800 truncate">{item.title}</span>
                {item.category && (
                  <span className="pill pill-type">{CATEGORY_LABELS[item.category] || item.category}</span>
                )}
                <span className={`pill ${item.status === "APPLIED" ? "pill-applied" : "pill-pending"}`}>
                  {item.status === "APPLIED" ? "Applied" : "Pending"}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={(e) => onDelete(e, item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50
                             transition-colors text-xs opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
                <span className="text-gray-300 group-hover:text-brand-400 transition-colors">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
