/**
 * Computes defect priority automatically based on category and description keywords.
 * @param {string} category 
 * @param {string} description 
 * @param {string} title 
 * @returns {"P1 - Critical" | "P2 - Medium" | "P3 - Low"}
 */
export function calculatePriority(category = "", description = "", title = "") {
  const text = `${category} ${description} ${title}`.toLowerCase();

  // P1 - Critical Triggers: Electrical hazards, locks/doors, floods, fires, urgency
  if (
    category.includes("Electrical") ||
    category.includes("Door Lock") ||
    text.includes("flood") ||
    text.includes("burst") ||
    text.includes("spark") ||
    text.includes("smoke") ||
    text.includes("fire") ||
    text.includes("trapped") ||
    text.includes("shock") ||
    text.includes("urgent") ||
    text.includes("danger")
  ) {
    return "P1 - Critical";
  }

  // P2 - Medium Triggers: Plumbing, fans, leaks, AC
  if (
    category.includes("Plumbing") ||
    category.includes("Ceiling Fan") ||
    category.includes("Air Conditioning") ||
    text.includes("leak") ||
    text.includes("broken") ||
    text.includes("jammed") ||
    text.includes("dripping") ||
    text.includes("drain")
  ) {
    return "P2 - Medium";
  }

  // P3 - Low: Furniture, aesthetics, minor defects
  return "P3 - Low";
}

export const CATEGORIES = [
  "Plumbing & Pipe Leakage",
  "Electrical, Lights & Sparks",
  "Door Lock & Key Jammed",
  "Ceiling Fan & Switches",
  "Furniture (Bed/Desk/Wardrobe)",
  "Air Conditioning & Ventilation",
  "General & Others"
];

export const CAMPUS_LOCATIONS = [
  "Block A (Hostel)",
  "Block B (Hostel)",
  "Block C (Hostel)",
  "Block D (Hostel)",
  "Block E (Hostel)",
  "Block F (Hostel)",
  "Main Campus Library",
  "Engineering Complex",
  "Student Center & Cafeteria",
  "Science & Tech Labs",
  "Sports Complex & Gymnasium",
  "Administrative Building"
];
