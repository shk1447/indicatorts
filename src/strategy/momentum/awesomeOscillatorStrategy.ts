// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from '../asset';
import { Action } from '../action';
import {
  AOConfig,
  AODefaultConfig,
  ao,
} from '../../indicator/momentum/awesomeOscillator';

/**
 * Awesome oscillator strategy function.
 *
 * @param asset asset object.
 * @param config configuration.
 * @return strategy actions.
 */
export function aoStrategy(
  asset: Asset,
  config: AOConfig = {}
): { actions: Action[]; result: number[] } {
  const strategyConfig = { ...AODefaultConfig, ...config };
  const result = ao(asset.highs, asset.lows, strategyConfig);

  const actions = result.map((value) => {
    if (value > 0) {
      return Action.BUY;
    } else if (value < 0) {
      return Action.SELL;
    } else {
      return Action.HOLD;
    }
  });

  return {
    actions,
    result,
  };
}

// Export full name
export { aoStrategy as awesomeOscillatorStrategy };
