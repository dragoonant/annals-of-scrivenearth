// Target prompts for Verdant Coil cards: one line per target slot, saying what the choice decides.
export const coil: Record<string, string[]> = {
  'coil-vinewhip': ['Choose an enemy unit for it to strike'],
  'coil-behemoth': ['Choose an enemy unit for it to strike (Pierce)'],
  'coil-bristle': ['Choose an ally to get +3|+0 this round'],
  'coil-overgrowth': ['Choose an ally to get +3|+3 and Pierce this round'],
  'coil-duel-of-thorns': ['Choose your unit for the duel', 'Choose the enemy unit it strikes and is struck by'],
  'coil-lash-out': ['Choose your unit that will strike', 'Choose the enemy unit it strikes'],
  'coil-grafting': ['Choose an ally to get +2|+2 and Mend'],
};
