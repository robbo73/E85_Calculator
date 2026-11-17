/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MixMode = 'full' | 'specific_add' | 'adjustment';

export interface CalculationResult {
  gasLiters: number;
  e85Liters: number;
  currentLiters: number;
  currentEthanol: number;
  targetEthanol: number;
  targetLiters: number;
  addedLiters: number;
  isPossible: boolean;
  errorMessage?: string;
  gasPriceTotal?: number;
  e85PriceTotal?: number;
  totalCost?: number;
  savingsVsRegular?: number;
  blendedOctane?: number;
  gasRatioPercent?: number;
  e85RatioPercent?: number;
}

export interface SavedMix {
  id: string;
  name: string;
  timestamp: number;
  mixMode: MixMode;
  currentLiters: number;
  currentEthanol: number;
  targetEthanol: number;
  targetLiters: number;
  addedLiters: number;
  gasLiters: number;
  e85Liters: number;
  notes?: string;
  gasPriceTotal?: number;
  e85PriceTotal?: number;
  totalCost?: number;
  blendedOctane?: number;
  gasRatioPercent?: number;
  e85RatioPercent?: number;
}

export interface Settings {
  gasEthanol: number; // usually 5% for E5 regular/98 RON, or 10% for E10
  e85Ethanol: number; // usually 85%, sometimes lower in winter (e.g. 70-80%)
  gasPrice: number;   // price per liter
  e85Price: number;   // price per liter
  currency: string;   // "$", "€", "£", "kr", etc.
  tankCapacity: number; // default tank capacity (e.g. 60L)
  baseGasName: '91 RON' | '93 RON' | '95 RON' | '98 RON';
  theme: 'cosmic' | 'racing' | 'retro' | 'italian';
  unit: 'L' | 'Gal' | '%';
  defaultTargetEthanol: number; // default target ethanol percentage (e.g., 40, 50, etc.)
}
