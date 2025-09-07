/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisProps } from './axis_props';
import { renderText } from '../../../../../renderers/canvas/primitives/text';
import { renderDebugRectCenterRotated } from '../../../../../renderers/canvas/utils/debug';
import { Position } from '../../../../../utils/common';
import type { AxisTick } from '../../../utils/axis_utils';
import { getTickLabelPosition } from '../../../utils/axis_utils';

const TICK_TO_LABEL_GAP = 2;

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec, dimension, size, debug, axisStyle }: AxisProps,
  layerGirth: number,
) {
  const { position } = axisSpec;
  const labelStyle = axisStyle.tickLabel;
  const tickLabelProps = getTickLabelPosition(
    axisStyle,
    tick.domainClampedPosition,
    position,
    labelStyle.rotation,
    size,
    dimension,
    showTicks,
    labelStyle.offset,
    labelStyle.alignment,
  );

  const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };

  if (debug) {
    const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth: width, maxLabelTextHeight: height } = dimension;
    // full text container
    renderDebugRectCenterRotated(ctx, center, { ...center, width, height }, undefined, undefined, labelStyle.rotation);
    // rotated text container
    if (labelStyle.rotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, center, { ...center, width: maxLabelBboxWidth, height: maxLabelBboxHeight });
    }
  }

  const tickOnTheSide = tick.multilayerTimeAxis && Number.isFinite(tick.layer);

  // Edmar Moretti - remoção do ,00 e ,000 dos labels dos eixos
  const suffixes = [
    { suffix: ',00', replace: '' },
    { suffix: ',00%', replace: '%' },
    { suffix: ',00mil', replace: 'mil' },
    { suffix: ',00mi', replace: 'mi' },
    { suffix: ',00bi', replace: 'bi' },
    { suffix: ',00tri', replace: 'tri' },
    { suffix: ',00 %', replace: ' %' },
    { suffix: ',00 mil', replace: ' mil' },
    { suffix: ',00 mi', replace: ' mi' },
    { suffix: ',00 bi', replace: ' bi' },
    { suffix: ',00 tri', replace: ' tri' },
    { suffix: ',000', replace: '' },
    { suffix: ',000%', replace: '%' },
    { suffix: ',000mil', replace: 'mil' },
    { suffix: ',000mi', replace: 'mi' },
    { suffix: ',000bi', replace: 'bi' },
    { suffix: ',000tri', replace: 'tri' },
    { suffix: ',000 %', replace: ' %' },
    { suffix: ',000 mil', replace: ' mil' },
    { suffix: ',000 mi', replace: ' mi' },
    { suffix: ',000 bi', replace: ' bi' },
    { suffix: ',000 tri', replace: ' tri' },
  ];

  for (const { suffix, replace } of suffixes) {
    if (tick.label.endsWith(suffix)) {
      tick.label = tick.label.slice(0, -suffix.length) + replace;
      break;
    }
  } 

  renderText(
    ctx,
    center,
    tick.label,
    {
      fontFamily: labelStyle.fontFamily,
      fontStyle: labelStyle.fontStyle ?? 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textColor: labelStyle.fill,
      fontSize: labelStyle.fontSize,
      align: tickLabelProps.horizontalAlign,
      baseline: tickLabelProps.verticalAlign,
    },
    labelStyle.rotation,
    tickLabelProps.textOffsetX + (tickOnTheSide ? TICK_TO_LABEL_GAP : 0),
    tickLabelProps.textOffsetY + (tick.layer || 0) * layerGirth * (position === Position.Top ? -1 : 1),
    1,
    tick.direction,
  );
}
