// Target prompts for Prismguard cards: one line per target slot, saying what the choice decides.
export const prism: Record<string, string[]> = {
  'prism-facet-initiate': ['Choose an ally to get +0|+1'],
  'prism-pane-mender': ['Choose an ally to repair by 4'],
  'prism-sentinel-lens': ['Choose an ally to gain Ward'],
  'prism-hold-the-line': ['Choose an ally to gain Plated this round'],
  'prism-mirror-ward': ['Choose an ally to gain Ward'],
  'prism-patch-the-pane': ['Choose an ally to repair by 4'],
  'prism-call-out': ['Choose an ally to gain Dueler and +0|+2 this round'],
  'prism-lightwall-oath': ['Choose an ally to get +0|+2 and Plated'],
};
