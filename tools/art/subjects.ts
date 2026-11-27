// One entry per card (heroes also get '<id>--ascended'), one file per faction in tools/art/subjects/.
import type { Subject } from './style';
import { prism } from './subjects/prism';
import { ember } from './subjects/ember';
import { tide } from './subjects/tide';
import { coil } from './subjects/coil';
import { under } from './subjects/under';
import { storm } from './subjects/storm';
import { mirror } from './subjects/mirror';

export const SUBJECTS: Record<string, Subject> = { ...prism, ...ember, ...tide, ...coil, ...under, ...storm, ...mirror };

const GEM =
  'crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, ' +
  'a single large cut gem centred in the frame on a plain dark indigo background, luminous glow from within, deep indigo shadows, wordless and unlettered, full-bleed';

/** Non-card plates: full prompts (the style words are included by hand, and linted the same way). */
export const EXTRA: Record<string, { prompt: string; aspect: '3:2' | '2:3' }> = {
  'crest-prism': { aspect: '3:2', prompt: `a pale gold and white cut gem with a simple round lens silhouette glowing inside it, ${GEM}` },
  'crest-ember': { aspect: '3:2', prompt: `an orange and soot-black cut gem with a simple anvil and flame silhouette glowing inside it, ${GEM}` },
  'crest-tide': { aspect: '3:2', prompt: `a deep blue cut gem with a simple curling wave silhouette glowing inside it, ${GEM}` },
  'crest-coil': { aspect: '3:2', prompt: `a green cut gem with a simple coiled vine and leaf silhouette glowing inside it, ${GEM}` },
  'crest-under': { aspect: '3:2', prompt: `a violet and black cut gem with a simple lit fuse and cable knot silhouette glowing inside it, ${GEM}` },
  'crest-storm': { aspect: '3:2', prompt: `a teal and silver cut gem with a simple spread wing and lightning bolt silhouette glowing inside it, ${GEM}` },
  'crest-mirror': { aspect: '3:2', prompt: `a rose and silver cut gem with a simple pair of facing profiles silhouette glowing inside it, ${GEM}` },
  cardback: {
    aspect: '2:3',
    prompt: 'a perfectly symmetrical pattern of interlocking faceted crystals in indigo and cyan, a central starburst of cut facets with mirrored rows of smaller gems around it, crisp digital illustration, flat cel shading with hard-edged faceted highlights, luminous cyan rim light, deep indigo shadows, wordless and unlettered, full-bleed',
  },
  'title-skyline': {
    aspect: '3:2',
    prompt: 'wide establishing view of a city of pale cut crystal spires at the blue hour, a very tall central spire glowing cyan and amber above terraces, glass bridges and canals reflecting the sky, small airships drifting in the distance, crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, deep indigo shadows, wordless and unlettered, full-bleed',
  },
  'board-backdrop': {
    aspect: '3:2',
    prompt: 'a calm, dark, low-contrast top-down view of a plaza of cut glass tiles in deep indigo with faint cyan conduits running between them, an open central area, soft even light, crisp digital illustration, flat cel shading with subtle faceted highlights, wordless and unlettered, full-bleed',
  },
};
