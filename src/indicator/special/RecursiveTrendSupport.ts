/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { avg } from '../../helper/numArray';
import { ema } from '../trend/exponentialMovingAverage';
import { sma } from '../trend/simpleMovingAverage';
import { rts } from './RecursiveTrendStrength';

export interface RTS_SupportConfig {
  period?: number;
}

/**
 * The default configuration of RMS.
 */
export const RTS_SupportDefaultConfig: Required<RTS_SupportConfig> = {
  period: 20,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export function rtsSupport(
  code: string,
  values: number[],
  config: RTS_SupportConfig = {}
): number[] {
  const { period } = { ...RTS_SupportDefaultConfig, ...config };

  const rtsResults = rts(code, values, {});

  const result = ema(avg(rtsResults.future_resist, rtsResults.future_support), {
    period,
  });

  return result;
}
