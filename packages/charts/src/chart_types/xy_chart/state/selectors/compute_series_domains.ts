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

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SeriesDomainsAndData } from '../utils/types';
import { computeSeriesDomains } from '../utils/utils';
import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getSeriesSpecsSelector, getSmallMultiplesIndexOrderSelector } from './get_specs';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const computeSeriesDomainsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getDeselectedSeriesSelector,
    getSettingsSpecSelector,
    getSmallMultiplesIndexOrderSelector,
    getScaleConfigsFromSpecsSelector,
  ],
  (seriesSpecs, deselectedDataSeries, settingsSpec, smallMultiples, scaleConfigs): SeriesDomainsAndData => {
    return computeSeriesDomains(
      seriesSpecs,
      scaleConfigs,
      deselectedDataSeries,
      settingsSpec.orderOrdinalBinsBy,
      smallMultiples,
      // @ts-ignore
      settingsSpec.sortSeriesBy,
    );
  },
);