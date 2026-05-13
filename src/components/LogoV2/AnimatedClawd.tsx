import * as React from 'react';
import { Clawd } from './Clawd.js';

/**
 * XCLAW logo - static CLAWD ASCII art, no animations.
 * Identical to <Clawd /> but kept for API compatibility.
 */
export function AnimatedClawd(): React.ReactNode {
  return <Clawd />;
}
