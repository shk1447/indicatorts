/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { vwma } from '../trend/volumeWeightedMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTSVWConfig {
  period?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTSVWDefaultConfig: Required<RTSVWConfig> = {
  period: 20,
};

export function rtsvw(
  code: string,
  values: number[],
  volumes: number[],
  config: RTSVWConfig = {}
): number[] {
  const { period } = { ...RTSVWDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const result = vwma(rtsResults.strength, volumes, { period });

  return result;
}

// Export full name
export { rtsvw as rtsVolumeWeighted };
