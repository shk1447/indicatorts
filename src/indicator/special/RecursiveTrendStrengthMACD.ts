/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ema } from '../trend/exponentialMovingAverage';
import { sma } from '../trend/simpleMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTSMConfig {
  short?: number;
  long?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTSMDefaultConfig: Required<RTSMConfig> = {
  short: 20,
  long: 60,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export type RTSMResult = {
  shortTrendStrength: number[];
  longTrendStrength: number[];
};

export function rtsm(
  code: string,
  values: number[],
  config: RTSMConfig = {}
): RTSMResult {
  const { short, long } = { ...RTSMDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const shortResults = ema(rtsResults.strength, { period: short });
  const longResults = ema(rtsResults.strength, { period: long });

  return {
    shortTrendStrength: shortResults,
    longTrendStrength: longResults,
  };
}

// Export full name
export { rtsm as rtsMACD };
