import {
  AnalysisResult,
  recursiveMovingSegment,
  RMSConfig,
} from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rmsStrategy(
  asset: Asset,
  config: RMSConfig = {}
): { actions: Action[]; result: AnalysisResult } {
  const result = recursiveMovingSegment(asset.closings, config);

  const actions = new Array<number>(result.trendStrength.length);

  for (let i = 0; i < actions.length; i++) {
    if (i > 0) {
      if (result.trendStrength[i] <= 0 && result.trendStrength[i - 1] > 0) {
        actions[i] = Action.BUY;
      } else {
        actions[i] = Action.SELL;
      }
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions, result };
}
