// Target prompts for Stormrail cards: one line per target slot, saying what the choice decides.
export const storm: Record<string, string[]> = {
  'storm-dispatcher': ['Choose an ally to get +2|+0 and Aerial this round'],
  'storm-tailwind': ['Choose an ally to get +1|+1 this round'],
  'storm-updraft': ['Choose an ally to get +1|+0 and Aerial this round'],
  'storm-crosswind': ['Choose an enemy unit to put in Stasis'],
  'storm-skyhook': ["Choose an enemy unit to return to its owner's hand"],
};
