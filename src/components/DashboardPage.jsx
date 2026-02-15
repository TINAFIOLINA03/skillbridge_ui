import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearningList, createLearning } from "../api/learningApi";
import { getDashboard } from "../api/dashboardApi";
import { logout } from "../utils/auth";
import { categoryLabel } from "../utils/categories";
import AddLearningModal from "./AddLearningModal";

function getConfidenceLabel(pct) {
  if (pct === 0) return "Not started";
  if (pct <= 25) return "Just starting";
  if (pct <= 50) return "Building";
  if (pct <= 75) return "Calm & steady";
  if (pct < 100) return "Strong";
  return "Fully applied";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [learnings, dash] = await Promise.all([getLearningList(), getDashboard()]);
      setItems(learnings);
      setMetrics(dash);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLearning(title, category) {
    await createLearning(title, category);
    navigate("/learning");
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const pendingItems = items.filter((i) => i.status === "PENDING");
  const total = metrics?.totalLearning || 0;
  const applied = metrics?.appliedCount || 0;
  const pending = metrics?.pendingCount || 0;
  const appliedPct = total > 0 ? Math.round((applied / total) * 100) : 0;
  const confidenceLabel = getConfidenceLabel(appliedPct);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fadeIn">
      {/* ── Tagline ── */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">✨</span>
        <span className="text-sm text-gray-500 font-medium">Calm progress, visible confidence</span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Confidence Loop</h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md">
            Connect what you learn to what you apply — and watch your confidence grow.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {items.length > 0 && (
            <>
              <button
                onClick={() => navigate("/learning")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                           border border-gray-200 bg-surface hover:bg-gray-50
                           text-gray-700 text-sm font-semibold transition-colors"
              >
                View Learning
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                           text-white text-sm font-semibold transition-colors shadow-soft"
              >
                <span className="text-base leading-none">+</span> Add Learning
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 text-sm text-red-600">{error}</div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* WELCOME EXPERIENCE — shown when user has zero items */}
      {/* ══════════════════════════════════════════════ */}
      {items.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          {/* Welcome hero */}
          <div className="card p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SkillBridge</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This is your personal space to track what you learn and how you apply it in the real world.
              Here&apos;s how it works — in three simple steps.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <StepCard
              number="1"
              icon="📚"
              title="Log something you learned"
              description="It can be anything — a new tech skill, an exam topic, a concept from a book. Just give it a name and a category."
              accent="bg-brand-50 text-brand-600"
            />
            <StepCard
              number="2"
              icon="🎯"
              title="Apply it in the real world"
              description="Did you build a project? Teach someone? Write about it? Add an applied skill to show how you turned knowledge into action."
              accent="bg-sage-50 text-sage-600"
            />
            <StepCard
              number="3"
              icon="📈"
              title="Watch your confidence grow"
              description="Your dashboard tracks your progress automatically. The more you apply, the higher your confidence score — no pressure, just small wins."
              accent="bg-amber-50 text-amber-600"
            />
          </div>

          {/* CTA */}
          <div className="card p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Ready? It only takes 10 seconds to add your first learning.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 rounded-xl bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                         text-white text-sm font-semibold transition-colors shadow-soft"
            >
              + Add your first learning
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════ */
        /* NORMAL DASHBOARD — shown when user has items  */
        /* ══════════════════════════════════════════════ */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══ Left column ═══ */}
            <div className="space-y-6">
              {/* Confidence card */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">🔄</span>
                  <h2 className="text-base font-bold text-gray-900">Confidence, today</h2>
                </div>
                <p className="text-sm text-gray-400 mb-5">
                  Grows when learning turns into action
                </p>

                <div className="flex items-end gap-4 mb-4">
                  <div>
                    <span className="text-5xl font-bold text-gray-900 tracking-tight">{appliedPct}</span>
                    <span className="text-xl text-gray-400 font-medium">/100</span>
                  </div>
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider
                                   px-3 py-1 rounded-full bg-brand-50 text-brand-600 mb-1.5">
                    {confidenceLabel}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Not a judgment — just a gentle signal of applied momentum.
                </p>

                {/* Progress bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Learning → Applied</span>
                      <span className="text-xs text-gray-400">
                        {applied}/{total} applied skills done
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${appliedPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Momentum</span>
                      <span className="text-xs text-gray-400">{appliedPct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${appliedPct}%` }} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Visual indicator only — consistency comes from small wins.
                </p>
              </div>

              {/* Today's focus */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Today&apos;s focus</h2>
                  {pendingItems.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600
                                     bg-amber-50 rounded-full px-3 py-1">
                      <span className="text-sm">✉</span> {pendingItems.length} pending
                    </span>
                  )}
                </div>

                {pendingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-1">All caught up!</p>
                    <p className="text-xs text-gray-400">No pending learning items right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/learning/${item.id}`)}
                        className="focus-item"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                              {item.category && (
                                <span className="pill pill-type">{categoryLabel(item.category)}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Started {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <span className="text-sm text-gray-400 hover:text-brand-400 transition-colors ml-3 shrink-0 font-medium">
                            Open →
                          </span>
                        </div>
                      </div>
                    ))}
                    {pendingItems.length > 3 && (
                      <button
                        onClick={() => navigate("/learning")}
                        className="text-xs text-brand-400 hover:text-brand-500 font-medium transition-colors"
                      >
                        View all {pendingItems.length} pending →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Right column ═══ */}
            <div className="space-y-6">
              {/* At a glance */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">✅</span>
                  <h2 className="text-base font-bold text-gray-900">At a glance</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlanceCard label="Learning items" value={total} />
                  <GlanceCard label="Applied" value={applied} accent="text-sage-500" />
                  <GlanceCard label="Pending" value={pending} accent="text-amber-500" />
                  <GlanceCard label="Progress" value={`${appliedPct}%`} accent="text-brand-400" />
                </div>
              </div>

              {/* Needs application nudge */}
              {pendingItems.length > 0 && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-gray-900">Needs an application</h2>
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold
                                     flex items-center justify-center">
                      {pendingItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Learning items waiting for real-world practice (gentle nudge)
                  </p>
                  <div className="space-y-2">
                    {pendingItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/learning/${item.id}`)}
                        className="flex items-center justify-between py-3 px-3 -mx-1 rounded-xl
                                   cursor-pointer hover:bg-gray-50 transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                            {item.category && (
                              <span className="pill pill-type">{categoryLabel(item.category)}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Not Started</p>
                        </div>
                        <span className="text-gray-300 group-hover:text-brand-400 transition-colors shrink-0 ml-2">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <AddLearningModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddLearning}
        />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function GlanceCard({ label, value, accent = "text-gray-800" }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[0.65rem] font-medium text-gray-400 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function StepCard({ number, icon, title, description, accent }) {
  return (
    <div className="card p-5 flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center shrink-0 text-xl`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Step {number}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
