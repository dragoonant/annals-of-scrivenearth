import type { Subject } from '../style';

export type Subjects = Record<string, Subject>;
export const s = (subject: string, scene: string): Subject => ({ subject, scene });
