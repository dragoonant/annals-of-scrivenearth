// Target prompts for Tidewardens cards: one line per target slot, saying what the choice decides.
export const tide: Record<string, string[]> = {
  'tide-ilvane': ['Choose an enemy unit to put in Stasis'],
  'tide-mirroreel': ['Choose an enemy unit with 2 or less power to put in Stasis'],
  'tide-eddycourier': ['Choose an allied unit to return to your hand'],
  'tide-lockkeeper': ["Choose an enemy unit with 2 or less power to return to its owner's hand"],
  'tide-stillwaterbailiff': ['Choose an enemy unit to put in Stasis'],
  'tide-frostmeremagistrate': ['Choose the first enemy unit to put in Stasis', 'Choose the second enemy unit to put in Stasis'],
  'tide-slipunder': ['Choose an allied unit to return to your hand'],
  'tide-heldbreath': ['Choose an enemy unit to put in Stasis'],
  'tide-tidalveil': ['Choose an allied unit to gain Ward'],
  'tide-unwrite': ['Choose an enemy glyph on the stack to negate'],
  'tide-backwash': ["Choose an enemy unit to return to its owner's hand"],
  'tide-sluiceclose': ['Choose the first enemy unit to put in Stasis', 'Choose the second enemy unit to put in Stasis'],
};
