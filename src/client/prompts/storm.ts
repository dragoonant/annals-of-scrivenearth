// Target prompts for Stormrail cards: one line per target slot, saying what the choice decides.
export const storm: Record<string, string[]> = {
  'storm-dispatcher': ['Choose an ally to get +2|+0 and Aerial this round'],
  'storm-tailwind': ['Choose an ally to get +1|+1 this round'],
  'storm-updraft': ['Choose an ally to get +1|+0 and Aerial this round'],
  'storm-crosswind': ['Choose an enemy unit to put in Stasis'],
  'storm-skyhook': ["Choose an enemy unit to return to its owner's hand"],
  'storm-ribbonkite': ['Choose an Aerial ally to get +1|+1'],
  'storm-windrigger': ['Choose an ally: with Aerial it gets +1|+1, without Aerial it gains Aerial'],
  'storm-anchorleg': ['Choose an ally to get +1|+0 this round (+1|+1 more with 3+ attackers declared this round)'],
  'storm-sinkingair': ['Choose an enemy unit to get -2|+0 this round'],
  'storm-steepdive': ['Choose the Aerial ally that strikes', 'Choose the enemy unit it strikes'],
  // ---------- set x1: The Mirror Quarter ----------
  'storm-passforger': ['Choose an ally to copy into your hand as a Glimmer card (a token cannot be copied)'],
  'storm-quartermaster': ['Choose an ally to get +1|+1 and gain Veiled (an ally that has already struck stays unveiled)'],
  'storm-turnedcollar': ['Choose an ally to get +1|+0 and Veiled this round'],
  'storm-smokelantern': ['Choose an enemy unit with 3 or less power to put in Stasis'],
  // ---------- set x2: The Starward Rise ----------
  'storm-coursecorrection': ['Choose an ally to get +1|+0 and Vanguard this round (+0|+2 more with Conjunction)'],
};
