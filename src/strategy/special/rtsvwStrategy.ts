import { rtsVolumeWeighted, RTSVWConfig } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtsvwStrategy(
  code: string,
  asset: Asset,
  config: RTSVWConfig = {}
): { actions: Action[]; result: number[] } {
  const result = rtsVolumeWeighted(code, asset.closings, asset.volumes, config);

  const actions = new Array<number>(result.length);

  for (let i = 0; i < actions.length; i++) {
    if (i > 0) {
      if (result[i] > 0 && result[i - 1] <= 0) {
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
