/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { avg } from '../../helper/numArray';
import { ema } from '../trend/exponentialMovingAverage';
import { sma } from '../trend/simpleMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTS_ResistConfig {
  period?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTS_ResistDefaultConfig: Required<RTS_ResistConfig> = {
  period: 20,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export function rtsResist(
  code: string,
  values: number[],
  config: RTS_ResistConfig = {}
): number[] {
  const { period } = { ...RTS_ResistDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const result = ema(avg(rtsResults.resist, rtsResults.support), {
    period,
  });

  return result;
}
