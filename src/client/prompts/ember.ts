// Target prompts for Emberworks cards: one line per target slot, saying what the choice decides.
export const ember: Record<string, string[]> = {
  'ember-kessa': ['Choose an enemy unit or the enemy Spire to take 1 damage'],
  'ember-slagsmith': ['Choose an enemy unit to take 1 damage'],
  'ember-arcwelder': ['Choose an enemy unit to take 2 damage (3 while Resonant)'],
  'ember-moltenwarden': ['Choose an enemy unit to take 3 damage'],
  'ember-overdrive': ['Choose an ally to get +2|+0 this round'],
  'ember-pinprick': ['Choose an enemy unit or the enemy Spire to take 1 damage'],
  'ember-ventburst': ['Choose an enemy unit to take 2 damage (the enemy Spire takes 1)'],
  'ember-slagbolt': ['Choose an enemy unit to take 3 damage'],
  'ember-scrapburst': ['Choose an ally to destroy (the enemy Spire takes 3 damage)'],
  'ember-heatlance': ['Choose an enemy unit or the enemy Spire to take 3 damage'],
};
