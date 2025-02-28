/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { rsi } from '../momentum/relativeStrengthIndex';
import { rts } from './RecursiveTrendStrength';

export interface RTSRConfig {
  period?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTSRDefaultConfig: Required<RTSRConfig> = {
  period: 14,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export function rtsr(
  code: string,
  values: number[],
  config: RTSRConfig = {}
): number[] {
  const { period } = { ...RTSRDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const result = rsi(rtsResults, { period });

  return result;
}

// Export full name
export { rtsr as rtsRSI };
