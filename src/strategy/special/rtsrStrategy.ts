import { RTSRConfig, rtsRSI, sma } from '../../indicator/index';
import { Action } from '../action';
import { Asset } from '../asset';

export function rtsrStrategy(
  code: string,
  asset: Asset,
  config: RTSRConfig = {}
): { actions: Action[]; result: number[] } {
  const result = rtsRSI(code, asset.closings, config);

  const sma50 = sma(asset.closings, { period: config.period });

  const actions = new Array<Action>(result.length).fill(Action.HOLD);

  for (let i = 2; i < actions.length; i++) {
    const [rsiPrev2, rsiPrev1, rsiCurrent] = [
      result[i - 2],
      result[i - 1],
      result[i],
    ];

    const priceUpTrend = asset.closings[i] > sma50[i];
    const priceConfirmedUp = asset.closings[i] > asset.closings[i - 1];
    const priceConfirmedDown = asset.closings[i] < asset.closings[i - 1];

    // 강력한 매수 조건
    const buyCondition1 = rsiCurrent > 10 && rsiPrev1 <= 10 && rsiPrev2 <= 10; // 2연속 초과매수
    const buyCondition2 = rsiCurrent > rsiPrev1 && rsiPrev1 > rsiPrev2; // 상승 모멘텀 확인
    const buySignal =
      buyCondition1 && buyCondition2 && priceUpTrend && priceConfirmedUp;

    // 강력한 매도 조건
    const sellCondition1 = rsiCurrent < 90 && rsiPrev1 >= 90 && rsiPrev2 >= 90; // 2연속 초과매도
    const sellCondition2 = rsiCurrent < rsiPrev1 && rsiPrev1 < rsiPrev2; // 하락 모멘텀 확인
    const sellSignal =
      sellCondition1 && sellCondition2 && !priceUpTrend && priceConfirmedDown;

    if (buySignal) {
      actions[i] = Action.BUY;
    } else if (sellSignal) {
      actions[i] = Action.SELL;
    }
  }

  return { actions, result };
}
