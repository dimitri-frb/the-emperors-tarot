// Shared data: faction colors, map pools, mission matrix (GDM 2026, 11th ed.).
// Per-event rosters live in events/<id>.js (registered in events.js).

export const FACTION_COLORS = {
  "Necrons": "#30A46C",
  "Blood Angels": "#E5484D",
  "Space Marines": "#0A84FF",
  "Chaos Space Marines": "#8E4EC6",
  "Adeptus Mechanicus": "#E5484D",
  "Adeptus Custodes": "#B08A00",
  "Emperor's Children": "#D6409F",
  "Astra Militarum": "#8F8B5C",
  "Imperial Knights": "#F76B15",
  "T'au Empire": "#00A2C7",
  "Orks": "#46A758",
  "World Eaters": "#DC3E42",
  "Chaos Knights": "#5746AF",
  "Thousand Sons": "#12A594",
  "Tyranids": "#B04FCB",
  "Drukhari": "#207868",
  "Aeldari": "#0091B2",
  "Adepta Sororitas": "#C2255C",
  "Death Guard": "#5C7A29",
};

export const MAP_POOLS = {
  "Take and Hold": [
    { layout: "Layout 2", deployment: "Hammer & Anvil" },
    { layout: "Layout 4", deployment: "Search & Destroy" },
    { layout: "Layout 6", deployment: "Crucible of Battle" },
  ],
  "Purge the Foe": [
    { layout: "Layout 1", deployment: "Dawn of War" },
    { layout: "Layout 3", deployment: "Sweeping Engagement" },
    { layout: "Layout 8", deployment: "Hammer & Anvil" },
  ],
  "Priority Assets": [
    { layout: "Layout 2", deployment: "Crucible of Battle" },
    { layout: "Layout 5", deployment: "Dawn of War" },
    { layout: "Layout 7", deployment: "Search & Destroy" },
  ],
  "Reconnaissance": [
    { layout: "Layout 3", deployment: "Hammer & Anvil" },
    { layout: "Layout 6", deployment: "Sweeping Engagement" },
    { layout: "Layout 8", deployment: "Tipping Point" },
  ],
  "Disruption": [
    { layout: "Layout 1", deployment: "Crucible of Battle" },
    { layout: "Layout 4", deployment: "Dawn of War" },
    { layout: "Layout 7", deployment: "Tipping Point" },
  ],
};

// Primary mission = MISSION_MATRIX[yourDispo][opponentDispo] (GDM 2026, 11th ed.)
export const MISSION_MATRIX = {
  "Take and Hold": {
    "Take and Hold": "Battlefield Dominance",
    "Purge the Foe": "Immovable Object",
    "Disruption": "Determined Acquisition",
    "Reconnaissance": "Purge and Secure",
    "Priority Assets": "Inescapable Dominion",
  },
  "Purge the Foe": {
    "Take and Hold": "Unstoppable Force",
    "Purge the Foe": "Meatgrinder",
    "Disruption": "Punishment",
    "Reconnaissance": "Consecrate",
    "Priority Assets": "Destroyer's Wrath",
  },
  "Disruption": {
    "Take and Hold": "Death Trap",
    "Purge the Foe": "Delaying Action",
    "Disruption": "Outmanoeuvre",
    "Reconnaissance": "Smoke and Mirrors",
    "Priority Assets": "Locate and Deny",
  },
  "Reconnaissance": {
    "Take and Hold": "Reconnaissance Sweep",
    "Purge the Foe": "Triangulation",
    "Disruption": "Surveil the Foe",
    "Reconnaissance": "Gather Intel",
    "Priority Assets": "Search and Scour",
  },
  "Priority Assets": {
    "Take and Hold": "Secure Asset",
    "Purge the Foe": "Vital Link",
    "Disruption": "Extract Relic",
    "Reconnaissance": "Vanguard Operation",
    "Priority Assets": "Sabotage",
  },
};

