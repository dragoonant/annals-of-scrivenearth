// Target prompts for Orrery Conclave cards: one line per target slot, saying what the choice decides.
export const orrery: Record<string, string[]> = {
  'orrery-lanternacolyte': ['Choose another allied unit to gain Ward'],
  'orrery-cometherald': ['Choose an enemy unit to deal 2 to if you have Conjunction'],
  'orrery-gyrewarden': ['Choose another allied unit to gain Mend'],
  'orrery-trinelight': ['Choose an allied unit to get +1|+1 this round'],
  'orrery-brassshelter': ['Choose an allied unit to get +0|+3 this round (and Ward with Conjunction)'],
  'orrery-fallingglint': ['Choose an enemy unit to deal 2 to (3 with Resonant)'],
  'orrery-longpatience': ['Choose an allied unit to gain Mend and +0|+2'],
  'orrery-gravitywell': ['Choose an enemy unit to get -2|+0 this round (and Stasis with Resonant)'],
  'orrery-cometlance': ['Choose an enemy unit to deal 3 to'],
  'orrery-occultation': ['Choose an enemy glyph on the stack to negate'],
};
