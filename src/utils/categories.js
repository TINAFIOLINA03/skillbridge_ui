export const CATEGORY_LABELS = {
  TECHNICAL:           "Technical",
  PROFESSIONAL_SKILLS: "Professional Skills",
  NEW_LEARNINGS:       "New Learnings",
  ECONOMICS:           "Economics",
  WORLD_TRADE:         "World Trade",
  UPSC:                "UPSC",
  BANK_EXAM:           "Bank Exam",
  OTHER:               "Other",
};

export function categoryLabel(value) {
  return CATEGORY_LABELS[value] || value;
}
