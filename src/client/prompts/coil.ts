// Target prompts for Verdant Coil cards: one line per target slot, saying what the choice decides.
export const coil: Record<string, string[]> = {
  'coil-vinewhip': ['Choose an enemy unit for it to strike'],
  'coil-behemoth': ['Choose an enemy unit for it to strike (Pierce)'],
  'coil-bristle': ['Choose an ally to get +3|+0 this round'],
  'coil-overgrowth': ['Choose an ally to get +3|+3 and Pierce this round'],
  'coil-duel-of-thorns': ['Choose your unit for the duel', 'Choose the enemy unit it strikes and is struck by'],
  'coil-lash-out': ['Choose your unit that will strike', 'Choose the enemy unit it strikes'],
  'coil-grafting': ['Choose an ally to get +2|+2 and Mend'],
  'coil-snare-trapper': ['Choose an enemy unit to take 1 damage (2 if Resonant)'],
  'coil-tusk-challenger': ['Choose the enemy unit it strikes and is struck by'],
  'coil-snaring-vine': ['Choose an enemy unit to get -2|+0 this round'],
  'coil-compost-heap': ['Choose your Sapling to destroy for 3 Charge'],
  'coil-run-down': ['Choose the damaged enemy unit every ally strikes'],
  'coil-thorn-volley': ['Choose the enemy unit every allied Sapling strikes'],
  'coil-transplant': ['Choose your Sapling to replace with a Thornwood'],
  // ---------- set x1: The Mirror Quarter ----------
  'coil-cutting-gatherer': ['Choose your beast to put a Glimmer copy of in your hand'],
  'coil-take-a-cutting': ['Choose your damaged unit to put a Glimmer copy of in your hand'],
  'coil-twice-grown-thorns': ['Choose an ally to get +2|+0 and Pierce this round'],
  'coil-strike-from-the-ferns': ['Choose your Veiled unit to get +2|+0 and strike', 'Choose the enemy unit it strikes'],
  // ---------- set x2: The Starward Rise ----------
  'coil-spring-rush': ['Choose an ally to get +2|+2 this round (and a lasting +1|+1 with Conjunction)'],
};
