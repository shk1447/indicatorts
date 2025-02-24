// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import {
  MFIConfig,
  MFIDefaultConfig,
  mfi,
} from '../../indicator/volume/moneyFlowIndex';
import { Action } from '../action';
import { Asset } from '../asset';

/**
 * Money flow index strategy.
 *
 * @param asset asset object.
 * @param config configuration.
 * @return strategy actions.
 */
export function mfiStrategy(
  asset: Asset,
  config: MFIConfig = {}
): { actions: Action[]; result: number[] } {
  const strategyConfig = { ...MFIDefaultConfig, ...config };
  const result = mfi(
    asset.highs,
    asset.lows,
    asset.closings,
    asset.volumes,
    strategyConfig
  );

  const actions = result.map((value) => {
    if (value >= 80) {
      return Action.SELL;
    } else {
      return Action.BUY;
    }
  });

  return { actions, result };
}

// Export full name
export { mfiStrategy as moneyFlowIndexStrategy };
