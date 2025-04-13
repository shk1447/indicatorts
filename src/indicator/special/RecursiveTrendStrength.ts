/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SegmentationResult = {
  init_trend: 1 | -1;
  curr_trend: 1 | -1;
  recent_trend: number;
  segmentation: {
    from: number;
    to: number;
    min: number;
    max: number;
    degree: number;
    type: 'upward' | 'downward';
    upward_point: {
      degree: number;
      close: number;
      diff: number;
      date: number;
      seg_idx: number;
    }[];
    downward_point: {
      degree: number;
      close: number;
      diff: number;
      date: number;
      seg_idx: number;
    }[];
  }[];
  upward_point: {
    degree: number;
    close: number;
    diff: number;
    date: number;
    seg_idx: number;
  }[];
  downward_point: {
    degree: number;
    close: number;
    diff: number;
    date: number;
    seg_idx: number;
  }[];
};

export class StockAnalysis {
  constructor() {}

  segmentationByClose(data: number[], result: SegmentationResult) {
    if (data.length > 1) {
      const max = data.reduce(function (prev, curr) {
        return prev > curr ? prev : curr;
      });

      const min = data.reduce(function (prev: any, curr: any) {
        return prev < curr ? prev : curr;
      });

      var min_idx = data.indexOf(min);
      var max_idx = data.indexOf(max);

      if (min_idx !== max_idx) {
        const trend_type: any = min_idx < max_idx ? 'upward' : 'downward';

        const range =
          trend_type == 'upward'
            ? [min_idx, max_idx + 1]
            : [max_idx, min_idx + 1];

        if (!result.init_trend)
          result.init_trend = trend_type == 'upward' ? 1 : -1;

        switch (trend_type) {
          case 'upward':
            var std_degree =
              (Math.atan2(max - min, range[1] - range[0]) * 180) / Math.PI;
            result.segmentation.push({
              from: min,
              to: max,
              min: min,
              max: max,
              degree: std_degree,
              type: trend_type,
              upward_point: [],
              downward_point: [],
            });

            this.trend(
              [...data].slice(range[0], range[1]),
              result,
              trend_type,
              min
            );
            data = data.slice(max_idx);
            result.curr_trend = trend_type == 'upward' ? 1 : -1;

            break;
          case 'downward':
            var std_degree =
              (Math.atan2(min - max, range[1] - range[0]) * 180) / Math.PI;
            result.segmentation.push({
              from: max,
              to: min,
              min: min,
              max: max,
              degree: std_degree,
              type: trend_type,
              upward_point: [],
              downward_point: [],
            });
            this.trend(
              [...data].slice(range[0], range[1]),
              result,
              trend_type,
              max
            );
            data = data.slice(min_idx);
            result.curr_trend = trend_type == 'upward' ? 1 : -1;

            break;
        }

        this.segmentationByClose(data, result);
      }
    }
  }
  trend(data: number[], result: any, trend_type: any, firstValue: any) {
    if (data.length > 1) {
      var start_x = 1000;
      var start_y = data[0];
      var end_x = data.length * 1000;
      var end_y = data[data.length - 1];

      var std_degree =
        (Math.atan2(Math.abs(end_y - start_y), Math.abs(end_x - start_x)) *
          180) /
        Math.PI;

      var min_idx = null;
      var min_degree = 0;
      var diff = 0;
      var _cnt = 0;

      var _close = 0;
      data.forEach((d: number, i: any) => {
        var dynamic_x = (i + 1) * 1000;
        var dynamic_y = d;

        var dynamic_degree =
          (Math.atan2(
            Math.abs(dynamic_y - start_y),
            Math.abs(dynamic_x - start_x)
          ) *
            180) /
          Math.PI;

        _cnt++;
        if (std_degree > dynamic_degree && dynamic_degree != 0) {
          if (min_degree > 0) {
            if (dynamic_degree < min_degree) {
              _close = dynamic_y;
              min_degree = dynamic_degree;
              diff = (dynamic_y - firstValue) / _cnt;
              min_idx = i;
            }
          } else {
            _close = dynamic_y;
            min_degree = dynamic_degree;
            diff = (dynamic_y - firstValue) / _cnt;
            min_idx = i;
          }
        }
      });

      if (min_idx) {
        result.segmentation[result.segmentation.length - 1].avg =
          (result.segmentation[result.segmentation.length - 1].avg + _close) /
          2;
        result.segmentation[result.segmentation.length - 1][
          trend_type + '_point'
        ].push({
          degree: min_degree * (trend_type === 'upward' ? 1 : -1),
          close: _close,
          diff: diff,
          date: (min_idx + 1) * 1000,
          seg_idx: result.segmentation.length - 1,
        });
        result[trend_type + '_point'].push({
          degree: min_degree * (trend_type === 'upward' ? 1 : -1),
          close: _close,
          diff: diff,
          date: (min_idx + 1) * 1000,
          seg_idx: result.segmentation.length - 1,
        });

        this.trend(
          data.slice(min_idx, data.length),
          result,
          trend_type,
          data[min_idx]
        );
      }
    }
  }

  getLineIntersect(
    point1: any,
    slope1: any,
    point2: any,
    slope2: any
  ): { date: number; close: number } {
    var intersectX = 0,
      intersectY = 0;

    // x = (m1x1 - m2x2 + y2 - y1) / (m1 - m2)
    intersectX =
      (slope1 * point1.date -
        slope2 * point2.date +
        point2.close -
        point1.close) /
      (slope1 - slope2);
    // y = m1(x - x1) + y1
    intersectY = slope1 * (intersectX - point1.date) + point1.close;

    var result = {
      date: intersectX,
      close: intersectY,
    };

    return result;
  }

  cross_point(result: any, pick: number, idx: number) {
    let cross: { date: number; close: number }[] = [];
    result.upward_point.forEach((up: any, up_idx: any) => {
      result.downward_point.forEach((down: any, down_idx: any) => {
        var test = this.getLineIntersect(
          up,
          up.diff / 1000,
          down,
          down.diff / 1000
        );
        var std = up.date < down.date ? up : down;
        var std_idx = std.seg_idx;

        if (
          test.close >= result.segmentation[std_idx].min &&
          result.segmentation[std_idx].max >= test.close
        ) {
          cross.push(test);
        }
      });
    });

    var resist = cross.filter((d: any) => {
      return d.close >= pick && idx > d.date;
    });

    var support = cross.filter((d: any) => {
      return d.close <= pick && idx > d.date;
    });

    var future_resist = cross.filter((d: any) => {
      return d.close >= pick && idx <= d.date;
    });

    var future_support = cross.filter((d: any) => {
      return d.close <= pick && idx <= d.date;
    });

    return {
      resist: resist,
      support: support,
      future_resist,
      future_support,
    };
  }
}

function getBreakoutPrices(data: number[], result: SegmentationResult) {
  const analysis = new StockAnalysis();
  const currentPrice = data[data.length - 1];
  const currentIndex = data.length - 1;

  const { resist, support, future_resist, future_support } =
    analysis.cross_point(result, currentPrice, currentIndex);

  return {
    resist_count: resist.length,
    support_count: support.length,
    future_resist_count: future_resist.length,
    future_support_count: future_support.length,
    resist:
      resist.length > 0
        ? resist.map((r) => r.close).reduce((acc, curr) => acc + curr, 0) /
          resist.length
        : currentPrice,
    support:
      support.length > 0
        ? support.map((s) => s.close).reduce((acc, curr) => acc + curr, 0) /
          support.length
        : currentPrice,
    future_resist:
      future_resist.length > 0
        ? future_resist
            .map((r) => r.close)
            .reduce((acc, curr) => acc + curr, 0) / future_resist.length
        : currentPrice,
    future_support:
      future_support.length > 0
        ? future_support
            .map((s) => s.close)
            .reduce((acc, curr) => acc + curr, 0) / future_support.length
        : currentPrice,
  };
}

function simpleCalculateTrendStrength(
  segments: SegmentationResult['segmentation']
) {
  if (segments.length === 0) return 0;

  const currentTrend = segments[segments.length - 1];
  const avgDegree =
    segments.reduce((sum, seg) => sum + seg.degree, 0) / segments.length;

  return currentTrend.degree - avgDegree;
}

function calculateTrendStrength(segments: SegmentationResult['segmentation']) {
  if (segments.length === 0) return 0;

  const calculateSegmentStrength = (seg: (typeof segments)[0]) => {
    let avgDiff = 0;
    let count = 0;

    if (seg.type === 'upward') {
      count = seg.upward_point.length;
      if (count > 0) {
        avgDiff =
          seg.upward_point.reduce((sum, p) => sum + p.degree, 0) / count;
      }
    } else {
      count = seg.downward_point.length;
      if (count > 0) {
        avgDiff =
          seg.downward_point.reduce((sum, p) => sum + p.degree, 0) / count;
      }
    }

    return (seg.degree + avgDiff) / 2;
  };

  const currentSeg = segments[segments.length - 1];
  // const prevSeg =
  const currentStrength = calculateSegmentStrength(currentSeg);

  const totalStrength = segments.reduce(
    (sum, seg) => sum + calculateSegmentStrength(seg),
    0
  );
  const avgStrength = totalStrength / segments.length;

  return currentStrength - avgStrength;
}

export interface RTSConfig {
  cacheDisable?: boolean;
}

/**
 * The default configuration of RMS.
 */
export const RTSDefaultConfig: Required<RTSConfig> = {
  cacheDisable: false,
};

export type RTSResult = {
  recent_trend: number[];
  strength: number[];
  support: number[];
  resist: number[];
  future_support: number[];
  future_resist: number[];
  support_count: number[];
  resist_count: number[];
  future_support_count: number[];
  future_resist_count: number[];
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export function rts(value: {
  closings: number[];
  segs: SegmentationResult[];
}): RTSResult {
  let _preSegR: SegmentationResult | undefined = undefined;
  const _cacheResult: RTSResult = {
    recent_trend: [],
    strength: [],
    support: [],
    resist: [],
    future_support: [],
    future_resist: [],
    support_count: [],
    resist_count: [],
    future_support_count: [],
    future_resist_count: [],
  };

  // 기존 결과와 비교해서 새로 추가해야 할 값이 있는지 확인

  for (let i = 0; i < value.segs.length; i++) {
    const segR: SegmentationResult = value.segs[i];

    if (_preSegR !== undefined) {
      if (
        _preSegR.curr_trend == segR.curr_trend &&
        _preSegR.segmentation.length - segR.segmentation.length > 0
      ) {
        segR.recent_trend = segR.curr_trend > 0 ? +1 : -1;
      } else {
        segR.recent_trend = _preSegR.recent_trend;
      }
    }

    const ts = calculateTrendStrength(segR.segmentation);

    const breakout = getBreakoutPrices(value.closings.slice(0, i + 1), segR);
    _cacheResult.strength.push(ts);
    _cacheResult.support.push(breakout.support);
    _cacheResult.support_count.push(breakout.support_count);
    _cacheResult.resist.push(breakout.resist);
    _cacheResult.resist_count.push(breakout.resist_count);

    _cacheResult.future_support.push(breakout.future_support);
    _cacheResult.future_support_count.push(breakout.future_support_count);
    _cacheResult.future_resist.push(breakout.future_resist);
    _cacheResult.future_resist_count.push(breakout.future_resist_count);
    _cacheResult.recent_trend.push(segR.recent_trend);
    _preSegR = segR;
  }

  return _cacheResult;
}

// Export full name
export { rts as recursiveTrendStrength };
