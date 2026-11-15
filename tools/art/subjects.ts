// One entry per card (heroes also get '<id>--ascended'). Written by hand, one subject and one scene each.
import type { Subject } from './style';

export const SUBJECTS: Record<string, Subject> = {};

/** Non-card plates: full prompts (the style words are included by hand, and linted the same way). */
export const EXTRA: Record<string, { prompt: string; aspect: '3:2' | '2:3' }> = {};
