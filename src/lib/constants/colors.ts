// ============================================================================
// ManyHandz — Accent Colors
// 12 accent colors available for the theme/color picker. Members can pick
// their accent color for personalized UI elements.
// ============================================================================

export interface AccentColor {
  name: string;
  value: string;         // hex value
  tailwindClass: string; // e.g. "bg-indigo-500" for convenient usage
}

export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Indigo', value: '#6366f1', tailwindClass: 'bg-indigo-500' },
  { name: 'Violet', value: '#8b5cf6', tailwindClass: 'bg-violet-500' },
  { name: 'Rose', value: '#f43f5e', tailwindClass: 'bg-rose-500' },
  { name: 'Pink', value: '#ec4899', tailwindClass: 'bg-pink-500' },
  { name: 'Amber', value: '#f59e0b', tailwindClass: 'bg-amber-500' },
  { name: 'Emerald', value: '#10b981', tailwindClass: 'bg-emerald-500' },
  { name: 'Cyan', value: '#06b6d4', tailwindClass: 'bg-cyan-500' },
  { name: 'Blue', value: '#3b82f6', tailwindClass: 'bg-blue-500' },
  { name: 'Orange', value: '#f97316', tailwindClass: 'bg-orange-500' },
  { name: 'Lime', value: '#84cc16', tailwindClass: 'bg-lime-500' },
  { name: 'Fuchsia', value: '#d946ef', tailwindClass: 'bg-fuchsia-500' },
  { name: 'Sky', value: '#0ea5e9', tailwindClass: 'bg-sky-500' },
];

/**
 * Map from color name (lowercased) to its definition.
 */
export const ACCENT_COLOR_MAP: Record<string, AccentColor> = Object.fromEntries(
  ACCENT_COLORS.map((c) => [c.name.toLowerCase(), c])
);

/**
 * Returns the default accent color (Indigo).
 */
export function getDefaultAccentColor(): AccentColor {
  return ACCENT_COLORS[0];
}

/**
 * Finds an accent color by hex value, or returns undefined.
 */
export function getAccentColorByValue(hex: string): AccentColor | undefined {
  return ACCENT_COLORS.find(
    (c) => c.value.toLowerCase() === hex.toLowerCase()
  );
}

/**
 * Finds an accent color by name (case-insensitive), or returns undefined.
 */
export function getAccentColorByName(name: string): AccentColor | undefined {
  return ACCENT_COLOR_MAP[name.toLowerCase()];
}
