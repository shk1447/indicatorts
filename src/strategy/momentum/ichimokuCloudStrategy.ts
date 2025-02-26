// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from '../asset';
import { Action } from '../action';
import {
  ichimokuCloud,
  IchimokuCloudConfig,
  IchimokuCloudDefaultConfig,
  IchimokuCloudResult,
} from '../../indicator/momentum/ichimokuCloud';

/**
 * Ichimoku cloud.
 *
 * @param asset asset object.
 * @oaram config configuration.
 * @return strategy actions.
 */
export function ichimokuCloudStrategy(
  asset: Asset,
  config: IchimokuCloudConfig = {}
): { actions: Action[]; result: IchimokuCloudResult } {
  const strategyConfig = { ...IchimokuCloudDefaultConfig, ...config };
  const indicator = ichimokuCloud(
    asset.highs,
    asset.lows,
    asset.closings,
    strategyConfig
  );

  const actions = new Array<Action>(indicator.kijun.length).fill(Action.HOLD);

  for (let i = 1; i < actions.length; i++) {
    const currentClose = asset.closings[i];
    const currentSSA = indicator.ssa[i];
    const currentSSB = indicator.ssb[i];
    const priceAboveCloud =
      currentClose > currentSSA && currentClose > currentSSB;
    const priceBelowCloud =
      currentClose < currentSSA && currentClose < currentSSB;

    const tenkanCrossAbove =
      indicator.tenkan[i] > indicator.kijun[i] &&
      indicator.tenkan[i - 1] <= indicator.kijun[i - 1];
    const tenkanCrossBelow =
      indicator.tenkan[i] < indicator.kijun[i] &&
      indicator.tenkan[i - 1] >= indicator.kijun[i - 1];

    if (tenkanCrossAbove && priceAboveCloud) {
      actions[i] = Action.BUY;
    } else if (tenkanCrossBelow && priceBelowCloud) {
      actions[i] = Action.SELL;
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions, result: indicator };
}
