/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { sma } from '../trend/simpleMovingAverage';

export type SegmentationResult = {
  init_trend: 1 | -1;
  curr_trend: 1 | -1;
  segmentation: {
    from: number;
    to: number;
    min: number;
    max: number;
    degree: number;
    type: 'upward' | 'downward';
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
        result[trend_type + '_point'].push({
          degree: min_degree,
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
      return d.close >= pick;
    });

    var support = cross.filter((d: any) => {
      return d.close <= pick;
    });

    return {
      resist: resist,
      support: support,
    };
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
}

function getTrendReversalSignals(segments: SegmentationResult['segmentation']) {
  const signals = [];
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].type !== segments[i - 1].type) {
      signals.push({
        index: i,
        type: segments[i].type === 'upward' ? 'buy' : 'sell',
        strength: Math.abs(segments[i].degree - segments[i - 1].degree),
      });
    }
  }
  return signals;
}

function getBreakoutSignals(data: number[], result: SegmentationResult) {
  const analysis = new StockAnalysis();
  const currentPrice = data[data.length - 1];
  const currentIndex = data.length - 1;

  const { resist, support } = analysis.cross_point(
    result,
    currentPrice,
    currentIndex
  );

  const resistanceLevels = resist.map((r) => {
    return r.close;
  });

  const supportLevels = support.map((s) => {
    return s.close;
  });

  return {
    resistanceBreak: resist.length > 0,
    supportBreak: support.length > 0,
    resistanceLevels,
    supportLevels,
  };
}

function calculateTrendStrength(segments: SegmentationResult['segmentation']) {
  if (segments.length === 0) return 0;

  const currentTrend = segments[segments.length - 1];
  const avgDegree =
    segments.reduce((sum, seg) => sum + seg.degree, 0) / segments.length;

  return currentTrend.degree - avgDegree;
}

export interface RMSConfig {
  period?: number;
}

/**
 * The default configuration of RMS.
 */
export const RMSDefaultConfig: Required<RMSConfig> = {
  period: 20,
};

/**
 * Simple moving average (SMA).
 * @param values values array.
 * @param config configuration.
 * @return SMA values.
 */

export type AnalysisResult = {
  // trendReversals: { index: number; type: string; strength: number }[];
  // breakouts: {
  //   resistanceBreak: boolean;
  //   supportBreak: boolean;
  //   resistanceLevels: number[];
  //   supportLevels: number[];
  // };

  trendStrength: number[];
};

export function rms(values: number[], config: RMSConfig = {}): AnalysisResult {
  const { period } = { ...RMSDefaultConfig, ...config };
  const analysis = new StockAnalysis();

  const result: AnalysisResult = {
    trendStrength: [],
  };

  let sumTrendStrength = 0;

  for (let i = 0; i < values.length; i++) {
    const segR: SegmentationResult = {
      init_trend: 1,
      curr_trend: 1,
      segmentation: [],
      upward_point: [],
      downward_point: [],
    };
    analysis.segmentationByClose(values.slice(0, i + 1), segR);

    // const analysisR = {
    //   trendReversals: getTrendReversalSignals(segR.segmentation),
    //   breakouts: getBreakoutSignals(values, segR),
    //   trendStrength: calculateTrendStrength(segR.segmentation),
    // };

    result.trendStrength.push(calculateTrendStrength(segR.segmentation));

    sumTrendStrength += result.trendStrength[i];

    if (i >= period) {
      sumTrendStrength -= result.trendStrength[i - period];

      result.trendStrength[i] = sumTrendStrength / period;
    } else {
      result.trendStrength[i] = sumTrendStrength / (i + 1);
    }
  }

  return result;
}

// Export full name
export { rms as recursiveMovingSegment };
