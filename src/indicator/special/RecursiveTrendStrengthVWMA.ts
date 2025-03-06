/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { vwma } from '../trend/volumeWeightedMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTSVMConfig {
  short?: number;
  long?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTSVMDefaultConfig: Required<RTSVMConfig> = {
  short: 20,
  long: 60,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export type RTSVMResult = {
  shortTrendStrength: number[];
  longTrendStrength: number[];
};

export function rtsvm(
  code: string,
  values: number[],
  volumes: number[],
  config: RTSVMConfig = {}
): RTSVMResult {
  const { short, long } = { ...RTSVMDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const shortResults = vwma(rtsResults.strength, volumes, { period: short });
  const longResults = vwma(rtsResults.strength, volumes, { period: long });

  return {
    shortTrendStrength: shortResults,
    longTrendStrength: longResults,
  };
}

// Export full name
export { rtsvm as rtsVWMA };
