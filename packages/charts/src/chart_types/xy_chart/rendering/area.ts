/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { area } from 'd3-shape';

import { Color } from '../../../common/colors';
import { Scale } from '../../../scales';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { Dimensions } from '../../../utils/dimensions';
import { AreaGeometry } from '../../../utils/geometry';
import { AreaSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';
import { renderPoints } from './points';
import {
  getClippedRanges,
  getY0ScaledValueFn,
  getY1ScaledValueFn,
  getYDatumValueFn,
  isYValueDefinedFn,
  MarkSizeOptions,
} from './utils';

/** @internal */
export function renderArea(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale<number | string>,
  yScale: Scale<number>,
  panel: Dimensions,
  color: Color,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: AreaSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isStacked = false,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
): {
  areaGeometry: AreaGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueFn(yScale);
  const y0Fn = getY0ScaledValueFn(yScale);
  const definedFn = isYValueDefinedFn(yScale, xScale);
  const y1DatumAccessor = getYDatumValueFn();
  const y0DatumAccessor = getYDatumValueFn('y0');
  const pathGenerator = area<DataSeriesDatum>()
    .x(({ x }) => (xScale.scale(x) ?? NaN) - xScaleOffset)
    .y1(y1Fn)
    .y0(y0Fn)
    .defined((datum) => {
      return definedFn(datum, y1DatumAccessor) && (hasY0Accessors ? definedFn(datum, y0DatumAccessor) : true);
    })
    .curve(getCurveFactory(curve));

  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);

  const lines: string[] = [];
  const y0Line = hasY0Accessors && pathGenerator.lineY0()(dataSeries.data);
  const y1Line = pathGenerator.lineY1()(dataSeries.data);
  if (y1Line) lines.push(y1Line);
  if (y0Line) lines.push(y0Line);

  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    seriesStyle.point,
    hasY0Accessors,
    markSizeOptions,
    pointStyleAccessor,
    false,
  );

  const areaGeometry: AreaGeometry = {
    area: pathGenerator(dataSeries.data) || '',
    lines,
    points: pointGeometries,
    color,
    transform: {
      y: 0,
      x: shift,
    },
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
      smHorizontalAccessorValue: dataSeries.smHorizontalAccessorValue,
      smVerticalAccessorValue: dataSeries.smVerticalAccessorValue,
    },
    seriesAreaStyle: seriesStyle.area,
    seriesAreaLineStyle: seriesStyle.line,
    seriesPointStyle: seriesStyle.point,
    isStacked,
    clippedRanges,
    hideClippedRanges: !hasFit,
  };
  return {
    areaGeometry,
    indexedGeometryMap,
  };
}