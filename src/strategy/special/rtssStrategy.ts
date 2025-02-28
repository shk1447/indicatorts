import { RTSSConfig, RTSSResult, rtsStochastic } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtssStrategy(
  code: string,
  asset: Asset,
  config: RTSSConfig = {}
): { actions: Action[]; result: RTSSResult } {
  const result = rtsStochastic(code, asset.closings, config);

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
