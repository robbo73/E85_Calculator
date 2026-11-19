/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Settings } from './types';

/** Single source of truth for first-load and "Reset Default" settings. */
export const DEFAULT_SETTINGS: Settings = {
  gasEthanol: 0,
  e85Ethanol: 85,
  gasPrice: 2.15,
  e85Price: 1.65,
  currency: '$',
  tankCapacity: 60,
  baseGasName: '98 RON',
  theme: 'racing',
  unit: 'L',
  defaultTargetEthanol: 40,
};
