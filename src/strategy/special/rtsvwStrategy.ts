import { rts, rtsVolumeWeighted, RTSVWConfig } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtsvwStrategy(
  code: string,
  asset: Asset,
  config: RTSVWConfig = {}
): { actions: Action[] } {
  const rtsResult = rts(code, asset.closings, {});
  const result = rtsVolumeWeighted(code, asset.closings, asset.volumes, config);

  const actions = new Array<number>(result.length);

  for (let i = 0; i < actions.length; i++) {
    if (i > 1) {
      if (
        result[i] - result[i - 1] > 0 &&
        result[i - 1] - result[i - 2] > 0 &&
        result[i] - result[i - 1] > result[i - 1] - result[i - 2] &&
        rtsResult.resist[i - 1] > rtsResult.support[i - 1] &&
        rtsResult.resist[i - 1] <= rtsResult.support[i]
      ) {
        actions[i] = Action.BUY;
      } else {
        actions[i] = Action.SELL;
      }
    } else {
      actions[i] = Action.HOLD;
    }
  }

  return { actions };
}
