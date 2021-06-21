/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SeriesKey } from '../../../../common/series_id';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Color } from '../../../../utils/common';
import { getSeriesColors } from '../../utils/series';
import { getCustomSeriesColors } from '../utils/utils';
import { computeSeriesDomainsSelector } from './compute_series_domains';

function getColorOverrides({ colors }: GlobalChartState) {
  return colors;
}

/** @internal */
export const getSeriesColorsSelector = createCustomCachedSelector(
  [computeSeriesDomainsSelector, getChartThemeSelector, getColorOverrides],
  (seriesDomainsAndData, chartTheme, colorOverrides): Map<SeriesKey, Color> => {
    const updatedCustomSeriesColors = getCustomSeriesColors(seriesDomainsAndData.formattedDataSeries);

    return getSeriesColors(
      seriesDomainsAndData.formattedDataSeries,
      chartTheme.colors,
      updatedCustomSeriesColors,
      colorOverrides,
    );
  },
);