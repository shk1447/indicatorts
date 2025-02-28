// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from '../asset';
import { Action } from '../action';
import {
  StochConfig,
  StochResult,
  StochDefaultConfig,
  stoch,
} from '../../indicator/momentum/stochasticOscillator';

/**
 * Stochastic oscillator strategy function.
 *
 * @param asset asset object.
 * @param config configuration.
 * @return strategy actions.
 */
export function stochStrategy(
  asset: Asset,
  config: StochConfig = {}
): { actions: Action[]; result: StochResult } {
  const strategyConfig = { ...StochDefaultConfig, ...config };
  const result = stoch(asset.highs, asset.lows, asset.closings, strategyConfig);

  const actions = new Array<Action>(result.k.length);

  for (let i = 1; i < actions.length; i++) {
    // 매수: %K가 %D를 상향 돌파 + 과매도 구간
    if (
      result.k[i] > result.d[i] &&
      result.k[i - 1] <= result.d[i - 1] &&
      result.k[i] < 20
    ) {
      actions[i] = Action.BUY;
    }
    // 매도: %K가 %D를 하향 돌파 + 과매수 구간
    else if (
      result.k[i] < result.d[i] &&
      result.k[i - 1] >= result.d[i - 1] &&
      result.k[i] > 80
    ) {
      actions[i] = Action.SELL;
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions, result };
}

// Export full name
export { stochStrategy as stochasticOscillatorStrategy };
