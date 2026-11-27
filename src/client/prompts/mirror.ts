// Target prompts for Mirrorwatch cards: one line per target slot, saying what the choice decides.
export const mirror: Record<string, string[]> = {
  'mirror-sabeline': ['Choose an enemy unit to put a Glimmer copy of in your hand'],
  'mirror-spark': ['Choose an enemy unit to deal 1 to'],
  'mirror-glintpicker': ['Choose an enemy unit with 2 or less power to put a Glimmer copy of in your hand'],
  'mirror-twincourier': ['Choose another allied unit to put a Glimmer copy of in your hand'],
  'mirror-masquedancer': ['Choose an allied unit to gain Veiled and +1|+0'],
  'mirror-curatoroffaces': ['Choose an enemy unit to put a copy of in your hand'],
  'mirror-flickeredge': ['Choose an allied unit to get +1|+1 this round'],
  'mirror-echoneedle': ['Choose an enemy unit to deal 1 to'],
  'mirror-sleightofglass': ['Choose an allied unit to gain Veiled'],
  'mirror-glanceback': ['Choose an enemy unit to put a Glimmer copy of in your hand'],
  'mirror-falseglare': ['Choose an enemy unit to get -2|+0 this round'],
  'mirror-stolenverse': ['Choose an enemy glyph on the stack to copy into your hand'],
  'mirror-ricochetlight': ['Choose an enemy unit or the enemy Spire to deal 2 to'],
  'mirror-reversepane': ['Choose an enemy glyph on the stack to negate and copy into your hand'],
  'mirror-vanityglass': ['Choose an enemy unit to take damage equal to its own power'],
};
