// Copyright (c) 2022 Onur Cinar. All Rights Reserved.
// https://github.com/cinar/indicatorts

import { Asset } from './asset';
import { Action } from './action';

/**
 * Buy and hold strategy.
 *
 * @param asset asset object.
 * @return strategy actions.
 */
export function buyAndHoldStrategy(asset: Asset): {
  actions: Action[];
  result: number[];
} {
  return {
    actions: Array<Action>(asset.closings.length).fill(Action.BUY),
    result: asset.closings,
  };
}
