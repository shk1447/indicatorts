// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from '../asset';
import { Action } from '../action';
import {
  VortexConfig,
  VortexResult,
  VortexDefaultConfig,
  vortex,
} from '../../indicator/trend/vortex';

/**
 * Vortex strategy.
 * @param asset asset object.
 * @param config configuration.
 * @return strategy actions.
 */
export function vortexStrategy(
  asset: Asset,
  config: VortexConfig = {}
): { actions: Action[]; result: VortexResult } {
  const strategyConfig = { ...VortexDefaultConfig, ...config };
  const indicator = vortex(
    asset.highs,
    asset.lows,
    asset.closings,
    strategyConfig
  );

  const actions = new Array<Action>(indicator.plus.length);

  for (let i = 0; i < actions.length; i++) {
    if (indicator.plus[i] > indicator.minus[i]) {
      actions[i] = Action.BUY;
    } else if (indicator.plus[i] < indicator.minus[i]) {
      actions[i] = Action.SELL;
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions, result: indicator };
}
