/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { divide, multiplyBy, subtract } from '../../helper/numArray';

import { mmax } from '../trend/movingMax';
import { mmin } from '../trend/movingMin';
import { sma } from '../trend/simpleMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTSSConfig {
  kPeriod?: number;
  dPeriod?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTSSDefaultConfig: Required<RTSSConfig> = {
  kPeriod: 14,
  dPeriod: 3,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export type RTSSResult = {
  k: number[];
  d: number[];
};

export function rtss(
  code: string,
  values: number[],
  config: RTSSConfig = {}
): RTSSResult {
  const { kPeriod, dPeriod } = { ...RTSSDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const highestHigh = mmax(rtsResults.strength, { period: kPeriod });
  const lowestLow = mmin(rtsResults.strength, { period: kPeriod });

  const kValue = multiplyBy(
    100,
    divide(
      subtract(rtsResults.strength, lowestLow),
      subtract(highestHigh, lowestLow)
    )
  );

  const dValue = sma(kValue, { period: dPeriod });

  return {
    k: kValue,
    d: dValue,
  };
}

// Export full name
export { rtss as rtsStochastic };
