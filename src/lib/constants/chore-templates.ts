// ============================================================================
// ManyHandz — Chore Templates
// Pre-built chore definitions organized by category. Used when creating new
// chores from templates and for seed data.
// ============================================================================

export interface ChoreTemplate {
  name: string;
  description: string;
  difficulty: number; // 1-5
  estimatedMinutes: number;
  icon: string; // lucide icon name
  category: string;
  checklist: string[];
}

// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------

const kitchenTemplates: ChoreTemplate[] = [
  {
    name: 'Wash Dishes',
    description: 'Clean all dirty dishes, pots, and pans by hand or load the dishwasher.',
    difficulty: 2,
    estimatedMinutes: 20,
    icon: 'utensils-crossed',
    category: 'Kitchen',
    checklist: [
      'Scrape leftover food into trash',
      'Rinse dishes under warm water',
      'Scrub with soap and sponge',
      'Rinse thoroughly',
      'Place in drying rack or dishwasher',
      'Wipe down the sink',
    ],
  },
  {
    name: 'Wipe Counters',
    description: 'Spray and wipe down all kitchen countertops and surfaces.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'spray-can',
    category: 'Kitchen',
    checklist: [
      'Clear items from counters',
      'Spray all-purpose cleaner on surfaces',
      'Wipe in circular motions with clean cloth',
      'Dry with a separate towel',
      'Return items to their places',
    ],
  },
  {
    name: 'Clean Stove/Oven',
    description: 'Deep clean the stovetop burners and oven interior.',
    difficulty: 4,
    estimatedMinutes: 40,
    icon: 'flame',
    category: 'Kitchen',
    checklist: [
      'Remove grates and burner caps',
      'Soak grates in soapy water',
      'Spray degreaser on stovetop',
      'Scrub burner areas thoroughly',
      'Wipe down control knobs',
      'Clean oven interior with oven cleaner',
      'Reassemble grates and caps',
    ],
  },
  {
    name: 'Mop Kitchen Floor',
    description: 'Sweep and mop the entire kitchen floor.',
    difficulty: 3,
    estimatedMinutes: 25,
    icon: 'droplets',
    category: 'Kitchen',
    checklist: [
      'Move chairs and small items off the floor',
      'Sweep or vacuum loose debris',
      'Fill mop bucket with cleaning solution',
      'Mop in sections, starting from the far end',
      'Pay extra attention to corners and edges',
      'Allow to air dry',
      'Return furniture to position',
    ],
  },
  {
    name: 'Empty Dishwasher',
    description: 'Unload clean dishes from the dishwasher and put them away.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'archive-restore',
    category: 'Kitchen',
    checklist: [
      'Check that dishes are fully dry',
      'Remove bottom rack items first',
      'Put plates and bowls in cabinets',
      'Sort and store silverware',
      'Remove top rack glasses and mugs',
      'Store any remaining items',
    ],
  },
  {
    name: 'Organize Fridge',
    description: 'Clean shelves, check expiration dates, and reorganize the refrigerator.',
    difficulty: 3,
    estimatedMinutes: 30,
    icon: 'refrigerator',
    category: 'Kitchen',
    checklist: [
      'Remove all items from the fridge',
      'Check expiration dates and discard old food',
      'Wipe down all shelves and drawers',
      'Clean door compartments',
      'Reorganize items by category',
      'Place newer items behind older ones',
    ],
  },
];

// ---------------------------------------------------------------------------
// Bathroom
// ---------------------------------------------------------------------------

const bathroomTemplates: ChoreTemplate[] = [
  {
    name: 'Clean Toilet',
    description: 'Scrub and sanitize the toilet inside and out.',
    difficulty: 2,
    estimatedMinutes: 15,
    icon: 'droplet',
    category: 'Bathroom',
    checklist: [
      'Apply toilet bowl cleaner inside the bowl',
      'Scrub with toilet brush under the rim',
      'Wipe the seat, lid, and exterior with disinfectant',
      'Clean the base and behind the toilet',
      'Flush and rinse brush',
    ],
  },
  {
    name: 'Scrub Shower/Tub',
    description: 'Deep clean the shower or bathtub including tiles and fixtures.',
    difficulty: 4,
    estimatedMinutes: 30,
    icon: 'shower-head',
    category: 'Bathroom',
    checklist: [
      'Spray shower cleaner on walls and floor',
      'Let cleaner sit for 5 minutes',
      'Scrub tiles and grout with a brush',
      'Clean the tub basin thoroughly',
      'Wipe down fixtures and showerhead',
      'Rinse everything with water',
      'Squeegee glass doors if applicable',
    ],
  },
  {
    name: 'Clean Mirrors',
    description: 'Spray and wipe bathroom mirrors until streak-free.',
    difficulty: 1,
    estimatedMinutes: 5,
    icon: 'square',
    category: 'Bathroom',
    checklist: [
      'Spray glass cleaner on the mirror',
      'Wipe in a Z pattern with microfiber cloth',
      'Check for streaks from different angles',
      'Buff any remaining spots',
    ],
  },
  {
    name: 'Mop Bathroom Floor',
    description: 'Sweep and mop the bathroom floor, paying attention to corners.',
    difficulty: 2,
    estimatedMinutes: 15,
    icon: 'droplets',
    category: 'Bathroom',
    checklist: [
      'Remove bath mats and rugs',
      'Sweep or vacuum loose debris',
      'Mop with bathroom floor cleaner',
      'Clean around toilet base carefully',
      'Wipe baseboards',
      'Replace mats once dry',
    ],
  },
  {
    name: 'Restock Supplies',
    description: 'Check and restock toilet paper, soap, towels, and other bathroom essentials.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'package-plus',
    category: 'Bathroom',
    checklist: [
      'Check toilet paper supply',
      'Refill hand soap dispenser',
      'Replace used towels with fresh ones',
      'Check shampoo and body wash levels',
      'Restock cleaning supplies under sink',
    ],
  },
];

// ---------------------------------------------------------------------------
// Living Areas
// ---------------------------------------------------------------------------

const livingAreasTemplates: ChoreTemplate[] = [
  {
    name: 'Vacuum',
    description: 'Vacuum all carpets, rugs, and hard floors in living areas.',
    difficulty: 2,
    estimatedMinutes: 25,
    icon: 'wind',
    category: 'Living Areas',
    checklist: [
      'Pick up items from the floor',
      'Move light furniture if needed',
      'Vacuum in overlapping straight lines',
      'Use attachments for edges and corners',
      'Vacuum under accessible furniture',
      'Empty vacuum canister if full',
    ],
  },
  {
    name: 'Dust Surfaces',
    description: 'Dust all shelves, tables, electronics, and decorative items.',
    difficulty: 2,
    estimatedMinutes: 20,
    icon: 'sparkles',
    category: 'Living Areas',
    checklist: [
      'Start from highest surfaces and work down',
      'Dust shelves and mantels',
      'Wipe tabletops and side tables',
      'Dust electronics carefully with microfiber cloth',
      'Clean picture frames and decorations',
      'Dust lamp shades and light fixtures',
    ],
  },
  {
    name: 'Organize Clutter',
    description: 'Tidy up common areas by putting items back in their designated places.',
    difficulty: 2,
    estimatedMinutes: 20,
    icon: 'layout-grid',
    category: 'Living Areas',
    checklist: [
      'Gather items that are out of place',
      'Sort into categories (books, remotes, toys, etc.)',
      'Return items to their proper locations',
      'Organize coffee table and side tables',
      'Straighten throw pillows and blankets',
      'Clear any accumulated mail or papers',
    ],
  },
  {
    name: 'Clean Windows',
    description: 'Wash interior window panes and wipe window sills.',
    difficulty: 3,
    estimatedMinutes: 30,
    icon: 'app-window',
    category: 'Living Areas',
    checklist: [
      'Dust window sills and frames first',
      'Spray glass cleaner on window panes',
      'Wipe with microfiber cloth in Z pattern',
      'Clean window tracks with old toothbrush',
      'Wipe down window sills',
      'Check for and clean any remaining streaks',
    ],
  },
  {
    name: 'Tidy Bookshelves',
    description: 'Organize books, dust shelves, and arrange decorative items neatly.',
    difficulty: 2,
    estimatedMinutes: 20,
    icon: 'book-open',
    category: 'Living Areas',
    checklist: [
      'Remove all items from shelves',
      'Dust each shelf thoroughly',
      'Sort books by size or category',
      'Arrange books neatly (vertical or horizontal)',
      'Place decorative items with spacing',
      'Discard or donate unwanted items',
    ],
  },
];

// ---------------------------------------------------------------------------
// Bedroom
// ---------------------------------------------------------------------------

const bedroomTemplates: ChoreTemplate[] = [
  {
    name: 'Make Bed',
    description: 'Straighten sheets, fluff pillows, and make the bed look tidy.',
    difficulty: 1,
    estimatedMinutes: 5,
    icon: 'bed',
    category: 'Bedroom',
    checklist: [
      'Pull up flat sheet and tuck at bottom',
      'Straighten comforter or duvet',
      'Fluff and arrange pillows',
      'Fold throw blanket at foot if applicable',
    ],
  },
  {
    name: 'Organize Closet',
    description: 'Sort clothes, organize shoes, and tidy up the closet.',
    difficulty: 3,
    estimatedMinutes: 30,
    icon: 'shirt',
    category: 'Bedroom',
    checklist: [
      'Remove items from closet floor',
      'Sort clothes: keep, donate, wash',
      'Organize by category (shirts, pants, etc.)',
      'Arrange shoes neatly',
      'Fold and stack items on shelves',
      'Return seasonal items to storage',
    ],
  },
  {
    name: 'Dust Bedroom',
    description: 'Dust all surfaces including nightstands, dressers, and fixtures.',
    difficulty: 2,
    estimatedMinutes: 15,
    icon: 'sparkles',
    category: 'Bedroom',
    checklist: [
      'Dust nightstands and lamps',
      'Wipe dresser tops and mirrors',
      'Dust window sills and blinds',
      'Clean ceiling fan blades if reachable',
      'Wipe baseboards',
    ],
  },
  {
    name: 'Change Sheets',
    description: 'Remove old bedding, put on fresh sheets, and remake the bed.',
    difficulty: 2,
    estimatedMinutes: 15,
    icon: 'bed-double',
    category: 'Bedroom',
    checklist: [
      'Remove pillowcases',
      'Strip fitted and flat sheets',
      'Put dirty linens in laundry',
      'Put on clean fitted sheet',
      'Add clean flat sheet and blanket',
      'Put on fresh pillowcases',
      'Make the bed neatly',
    ],
  },
];

// ---------------------------------------------------------------------------
// Outdoor
// ---------------------------------------------------------------------------

const outdoorTemplates: ChoreTemplate[] = [
  {
    name: 'Mow Lawn',
    description: 'Mow the front and back lawn to an even height.',
    difficulty: 4,
    estimatedMinutes: 45,
    icon: 'trees',
    category: 'Outdoor',
    checklist: [
      'Check mower fuel or charge level',
      'Clear yard of debris and toys',
      'Set mower to appropriate height',
      'Mow in straight parallel lines',
      'Edge along walkways and flower beds',
      'Empty grass clippings bag',
      'Put mower away and clean up',
    ],
  },
  {
    name: 'Water Plants',
    description: 'Water all indoor and outdoor plants appropriately.',
    difficulty: 1,
    estimatedMinutes: 15,
    icon: 'flower-2',
    category: 'Outdoor',
    checklist: [
      'Check soil moisture before watering',
      'Water outdoor garden beds',
      'Water potted plants on porch/patio',
      'Water indoor houseplants',
      'Empty saucers of excess water',
    ],
  },
  {
    name: 'Sweep Porch',
    description: 'Sweep the front and/or back porch and entryway areas.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'wind',
    category: 'Outdoor',
    checklist: [
      'Move door mats and furniture aside',
      'Sweep from back corners toward the edge',
      'Clean cobwebs from corners and railings',
      'Wipe down porch railings',
      'Replace door mats and furniture',
    ],
  },
  {
    name: 'Clean Gutters',
    description: 'Remove leaves and debris from rain gutters and check downspouts.',
    difficulty: 5,
    estimatedMinutes: 60,
    icon: 'cloud-rain',
    category: 'Outdoor',
    checklist: [
      'Set up ladder safely on level ground',
      'Wear gloves and safety glasses',
      'Scoop debris from gutters into bucket',
      'Work along entire gutter length',
      'Flush gutters with garden hose',
      'Check downspouts for clogs',
      'Clean up debris from ground',
    ],
  },
  {
    name: 'Trim Hedges',
    description: 'Trim and shape hedges, bushes, and shrubs around the property.',
    difficulty: 3,
    estimatedMinutes: 30,
    icon: 'scissors',
    category: 'Outdoor',
    checklist: [
      'Inspect hedges for uneven growth',
      'Use hedge trimmers or shears',
      'Trim top to desired level first',
      'Shape the sides evenly',
      'Clear trimmings from base',
      'Bag or compost clippings',
    ],
  },
];

// ---------------------------------------------------------------------------
// Laundry
// ---------------------------------------------------------------------------

const laundryTemplates: ChoreTemplate[] = [
  {
    name: 'Wash Clothes',
    description: 'Sort, load, and run a load of laundry in the washing machine.',
    difficulty: 2,
    estimatedMinutes: 15,
    icon: 'washing-machine',
    category: 'Laundry',
    checklist: [
      'Sort clothes by color and fabric type',
      'Check pockets for items',
      'Pre-treat any stains',
      'Load washing machine (not too full)',
      'Add detergent and select cycle',
      'Start the wash',
    ],
  },
  {
    name: 'Fold & Put Away',
    description: 'Fold clean laundry and put everything away in drawers and closets.',
    difficulty: 2,
    estimatedMinutes: 20,
    icon: 'layers',
    category: 'Laundry',
    checklist: [
      'Remove clothes from dryer promptly',
      'Sort by person or type',
      'Fold shirts, pants, and towels',
      'Hang items that need hanging',
      'Match and fold socks',
      'Put folded items in correct drawers and closets',
    ],
  },
  {
    name: 'Iron',
    description: 'Iron wrinkled clothes and hang or fold them neatly.',
    difficulty: 3,
    estimatedMinutes: 25,
    icon: 'thermometer',
    category: 'Laundry',
    checklist: [
      'Set up ironing board',
      'Fill iron with water and heat up',
      'Sort clothes by temperature setting',
      'Iron delicates first at low heat',
      'Iron heavier fabrics at higher heat',
      'Hang or fold each item immediately after ironing',
      'Turn off and cool down iron',
    ],
  },
  {
    name: 'Sort Darks/Lights',
    description: 'Separate laundry into darks, lights, and delicates for washing.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'palette',
    category: 'Laundry',
    checklist: [
      'Gather all dirty laundry from hampers',
      'Separate into darks pile',
      'Separate into lights/whites pile',
      'Pull out delicates and hand-wash items',
      'Check for heavily soiled items needing pre-treatment',
    ],
  },
];

// ---------------------------------------------------------------------------
// Pets
// ---------------------------------------------------------------------------

const petTemplates: ChoreTemplate[] = [
  {
    name: 'Feed Pets',
    description: 'Prepare and serve meals for household pets according to their feeding schedule.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'bone',
    category: 'Pets',
    checklist: [
      'Wash food and water bowls',
      'Measure correct portion of food',
      'Serve fresh food in clean bowl',
      'Refill water bowl with fresh water',
      'Store remaining food properly',
    ],
  },
  {
    name: 'Walk Dog',
    description: 'Take the dog for a walk around the neighborhood.',
    difficulty: 2,
    estimatedMinutes: 30,
    icon: 'dog',
    category: 'Pets',
    checklist: [
      'Get leash and waste bags',
      'Check collar and ID tag',
      'Walk for at least 20 minutes',
      'Pick up any waste with bags',
      'Provide water if it is a long walk',
      'Wipe paws before coming inside',
    ],
  },
  {
    name: 'Clean Litter Box',
    description: 'Scoop waste from the litter box and replenish litter as needed.',
    difficulty: 2,
    estimatedMinutes: 10,
    icon: 'cat',
    category: 'Pets',
    checklist: [
      'Scoop all waste clumps into bag',
      'Check litter depth and add more if needed',
      'Wipe edges and exterior of litter box',
      'Dispose of waste bag in outdoor trash',
      'Wash hands thoroughly',
    ],
  },
  {
    name: 'Groom Pet',
    description: 'Brush fur, check ears and nails, and bathe the pet if needed.',
    difficulty: 3,
    estimatedMinutes: 30,
    icon: 'scissors',
    category: 'Pets',
    checklist: [
      'Brush fur to remove loose hair and tangles',
      'Check ears for dirt or signs of infection',
      'Inspect nails and trim if needed',
      'Bathe with pet shampoo if scheduled',
      'Dry thoroughly with towel',
      'Give a treat for good behavior',
    ],
  },
];

// ---------------------------------------------------------------------------
// General
// ---------------------------------------------------------------------------

const generalTemplates: ChoreTemplate[] = [
  {
    name: 'Take Out Trash',
    description: 'Collect trash from all rooms and take bags to the outdoor bin.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'trash-2',
    category: 'General',
    checklist: [
      'Collect trash bags from all rooms',
      'Tie bags securely',
      'Take to outdoor trash bin',
      'Replace bin liners in all trash cans',
      'Check recycling and take out if full',
    ],
  },
  {
    name: 'Check Mail',
    description: 'Retrieve mail from the mailbox and sort it.',
    difficulty: 1,
    estimatedMinutes: 5,
    icon: 'mail',
    category: 'General',
    checklist: [
      'Walk to mailbox and collect all mail',
      'Sort into categories (bills, personal, junk)',
      'Recycle junk mail',
      'Place important mail in designated spot',
    ],
  },
  {
    name: 'Wipe Light Switches',
    description: 'Disinfect all light switches and door handles throughout the home.',
    difficulty: 1,
    estimatedMinutes: 10,
    icon: 'zap',
    category: 'General',
    checklist: [
      'Spray disinfectant on cloth (not directly on switches)',
      'Wipe all light switches in each room',
      'Clean all door handles and knobs',
      'Wipe cabinet handles in kitchen and bathroom',
      'Allow to air dry',
    ],
  },
];

// ---------------------------------------------------------------------------
// All Templates
// ---------------------------------------------------------------------------

export const CHORE_TEMPLATES: ChoreTemplate[] = [
  ...kitchenTemplates,
  ...bathroomTemplates,
  ...livingAreasTemplates,
  ...bedroomTemplates,
  ...outdoorTemplates,
  ...laundryTemplates,
  ...petTemplates,
  ...generalTemplates,
];

/**
 * All templates organized by category for easy lookup.
 */
export const CHORE_TEMPLATES_BY_CATEGORY: Record<string, ChoreTemplate[]> = {
  Kitchen: kitchenTemplates,
  Bathroom: bathroomTemplates,
  'Living Areas': livingAreasTemplates,
  Bedroom: bedroomTemplates,
  Outdoor: outdoorTemplates,
  Laundry: laundryTemplates,
  Pets: petTemplates,
  General: generalTemplates,
};

/**
 * Returns templates for a given category name.
 */
export function getTemplatesByCategory(category: string): ChoreTemplate[] {
  return CHORE_TEMPLATES_BY_CATEGORY[category] ?? [];
}

/**
 * Searches templates by name (case-insensitive substring match).
 */
export function searchTemplates(query: string): ChoreTemplate[] {
  const lower = query.toLowerCase();
  return CHORE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower)
  );
}
