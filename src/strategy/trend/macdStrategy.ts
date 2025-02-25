// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from '../asset';
import { Action } from '../action';
import {
  MACDConfig,
  MACDResult,
  MACDDefaultConfig,
  macd,
} from '../../indicator/trend/movingAverageConvergenceDivergence';

/**
 * MACD strategy.
 * @param asset asset object.
 * @param config configuration.
 * @return strategy actions.
 */
export function macdStrategy(
  asset: Asset,
  config: MACDConfig = {}
): { actions: Action[]; result: MACDResult } {
  const strategyConfig = { ...MACDDefaultConfig, ...config };
  const result = macd(asset.closings, strategyConfig);
  const actions = new Array<number>(result.macdLine.length);

  for (let i = 0; i < actions.length; i++) {
    if (i > 0) {
      if (
        result.macdLine[i] > result.signalLine[i] &&
        result.macdLine[i - 1] <= result.signalLine[i - 1]
      ) {
        actions[i] = Action.BUY;
      } else if (
        result.macdLine[i] < result.signalLine[i] &&
        result.macdLine[i - 1] >= result.signalLine[i - 1]
      ) {
        actions[i] = Action.SELL;
      } else {
        actions[i] = Action.HOLD;
      }
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions, result };
}

// Export full name
export { macdStrategy as movingAverageConvergenceDivergenceStrategy };
