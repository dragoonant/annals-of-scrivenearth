// Target prompts for Undervolt cards: one line per target slot, saying what the choice decides.
export const under: Record<string, string[]> = {
  'under-furnacehand': ['Choose an allied unit to destroy'],
  'under-leechwiresurgeon': ['Choose an enemy unit to drain 2 from'],
  'under-pullplug': ['Choose an allied unit to destroy (then drain 2 from the enemy Spire)'],
  'under-siphontap': ['Choose an enemy unit to drain 2 from'],
  'under-acidbath': ['Choose an allied unit to gain Corrosive this round'],
  'under-burnledger': ['Choose an allied unit to destroy (then you draw 2)'],
  'under-snuffedfuse': ['Choose an enemy unit with 3 or less power to destroy'],
  'under-bleeddry': ['Choose an enemy unit or the enemy Spire to drain 4 from'],
};
