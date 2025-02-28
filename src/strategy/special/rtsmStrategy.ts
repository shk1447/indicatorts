import { subtract } from '../../helper/numArray';
import { rtsMACD, RTSMConfig, RTSMResult } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtsmStrategy(
  code: string,
  asset: Asset,
  config: RTSMConfig = {}
): { actions: Action[]; result: RTSMResult } {
  const result = rtsMACD(code, asset.closings, config);

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
