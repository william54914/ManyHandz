// ============================================================================
// ManyHandz — Default Chore Categories
// Matches seed data and chore-templates.ts categories. Used when creating
// new households and for category pickers in the UI.
// ============================================================================

export interface CategoryDefinition {
  name: string;
  icon: string;   // lucide icon name
  color: string;  // hex color for UI accents
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { name: 'Kitchen', icon: 'utensils', color: '#f59e0b' },
  { name: 'Bathroom', icon: 'bath', color: '#3b82f6' },
  { name: 'Living Areas', icon: 'sofa', color: '#8b5cf6' },
  { name: 'Bedroom', icon: 'bed-double', color: '#ec4899' },
  { name: 'Outdoor', icon: 'trees', color: '#22c55e' },
  { name: 'Laundry', icon: 'shirt', color: '#06b6d4' },
  { name: 'Pets', icon: 'dog', color: '#f97316' },
  { name: 'General', icon: 'home', color: '#6b7280' },
];

/**
 * Map from category name to its definition for O(1) lookup.
 */
export const CATEGORY_MAP: Record<string, CategoryDefinition> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.name, c])
);

/**
 * Returns the color hex value for a given category name.
 * Falls back to the General category color if the name is unknown.
 */
export function getCategoryColor(categoryName: string): string {
  return CATEGORY_MAP[categoryName]?.color ?? '#6b7280';
}

/**
 * Returns the lucide icon name for a given category name.
 * Falls back to 'home' if the name is unknown.
 */
export function getCategoryIcon(categoryName: string): string {
  return CATEGORY_MAP[categoryName]?.icon ?? 'home';
}
