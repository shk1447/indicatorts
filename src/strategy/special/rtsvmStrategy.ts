import { subtract } from '../../helper/numArray';
import { RTSVMResult, RTSVMConfig, rtsVWMA } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtsvmStrategy(
  code: string,
  asset: Asset,
  config: RTSVMConfig = {}
): { actions: Action[]; result: RTSVMResult } {
  const result = rtsVWMA(code, asset.closings, asset.volumes, config);

  const actions = new Array<number>(result.shortTrendStrength.length);

  const oscillator = subtract(
    result.shortTrendStrength,
    result.longTrendStrength
  );

  for (let i = 0; i < actions.length; i++) {
    if (i > 0) {
      if (oscillator[i] > 0 && oscillator[i - 1] <= 0) {
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
