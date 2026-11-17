/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationResult, MixMode, Settings } from './types';

/**
 * Calculates the exact amounts of 98 RON gas and E85 required.
 */
export function calculateBlend(
  mode: MixMode,
  currentLiters: number,
  currentEthanol: number, // 0 - 100
  targetEthanol: number,  // 0 - 100
  customAddLiters: number, // only used in 'specific_add' mode
  settings: Settings
): CalculationResult {
  const E_curr = currentEthanol / 100;
  const E_target = targetEthanol / 100;
  const E_gas = settings.gasEthanol / 100;
  const E_e85 = settings.e85Ethanol / 100;
  const V_curr = Math.max(0, currentLiters);

  // Initialize result
  const result: CalculationResult = {
    gasLiters: 0,
    e85Liters: 0,
    currentLiters: V_curr,
    currentEthanol,
    targetEthanol,
    targetLiters: 0,
    addedLiters: 0,
    isPossible: true,
  };

  // Helper to attach cost and octane calculations
  const applyCost = (r: CalculationResult) => {
    if (settings.gasPrice > 0 || settings.e85Price > 0) {
      r.gasPriceTotal = r.gasLiters * settings.gasPrice;
      r.e85PriceTotal = r.e85Liters * settings.e85Price;
      r.totalCost = (r.gasPriceTotal || 0) + (r.e85PriceTotal || 0);
      
      // Calculate savings. If the user had loaded equivalent liters of base gas,
      // compared to this blend.
      const alternativeCost = r.addedLiters * settings.gasPrice;
      r.savingsVsRegular = alternativeCost - (r.totalCost || 0);
    }

    // Parse base gas name for its base octane (e.g. "98 RON" -> 98, "91 RON" -> 91, etc.)
    const gasMatch = settings.baseGasName ? settings.baseGasName.match(/\d+/) : null;
    const RON_gas = gasMatch ? parseInt(gasMatch[0], 10) : 98;
    const RON_e85 = 108; // Standard E85 RON octane

    // Deconstruct E85 and Gas fractions for starting pool
    let e85_curr_fraction = 0;
    if (settings.e85Ethanol > settings.gasEthanol) {
      e85_curr_fraction = Math.min(1, Math.max(0, (r.currentEthanol - settings.gasEthanol) / (settings.e85Ethanol - settings.gasEthanol)));
    }

    const V_e85_curr = r.currentLiters * e85_curr_fraction;
    const V_gas_curr = r.currentLiters * (1 - e85_curr_fraction);

    // Total volumes in the final blend
    const V_gas_total = r.gasLiters + V_gas_curr;
    const V_e85_total = r.e85Liters + V_e85_curr;
    const V_final_total = V_gas_total + V_e85_total;

    if (V_final_total > 0) {
      r.gasRatioPercent = (V_gas_total / V_final_total) * 100;
      r.e85RatioPercent = (V_e85_total / V_final_total) * 100;
      r.blendedOctane = (V_gas_total / V_final_total) * RON_gas + (V_e85_total / V_final_total) * RON_e85;
    } else {
      r.gasRatioPercent = 100;
      r.e85RatioPercent = 0;
      r.blendedOctane = RON_gas;
    }

    return r;
  };

  // Check setup sanity
  if (E_gas >= E_e85) {
    result.isPossible = false;
    result.errorMessage = `Configuration Error: Base ${settings.baseGasName} ethanol percentage cannot exceed or equal E85 actual ethanol percentage.`;
    return result;
  }

  // --- MODE 1: FILL TO CAPACITY ---
  if (mode === 'full') {
    const V_final = settings.tankCapacity;
    const V_add = V_final - V_curr;
    result.targetLiters = V_final;
    result.addedLiters = Math.max(0, V_add);

    if (V_final <= 0) {
      result.isPossible = false;
      result.errorMessage = "Please enter a valid tank capacity in Settings.";
      return result;
    }

    if (V_curr > V_final) {
      result.isPossible = false;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Your current fuel (${V_curr}${unitLabel}) exceeds your tank capacity (${V_final}${unitLabel}) under Settings. Reset current fuel or expand tank size.`;
      return result;
    }

    if (V_add === 0) {
      // Tank already full
      if (Math.abs(currentEthanol - targetEthanol) > 0.5) {
        result.isPossible = false;
        result.errorMessage = "The tank is already full, so no fuel can be added to adjust the blend.";
        return result;
      }
      result.gasLiters = 0;
      result.e85Liters = 0;
      return applyCost(result);
    }

    // Formulas:
    // V_e85 * (E_e85 - E_gas) = V_final * E_target - V_curr * E_curr - V_add * E_gas
    const nominator = (V_final * E_target) - (V_curr * E_curr) - (V_add * E_gas);
    const denominator = E_e85 - E_gas;
    const V_e85_calc = nominator / denominator;
    const V_gas_calc = V_add - V_e85_calc;

    // Boundary calculations for beautiful UX suggestions
    const maxPossibleEth = ((V_curr * E_curr) + (V_add * E_e85)) / V_final;
    const minPossibleEth = ((V_curr * E_curr) + (V_add * E_gas)) / V_final;

    if (V_e85_calc < 0) {
      result.isPossible = false;
      result.gasLiters = V_add;
      result.e85Liters = 0;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Target E${targetEthanol} is unreachable. The current tank already contains too much ethanol. Even if you fill the remaining ${V_add.toFixed(1)}${unitLabel} with pure 98 RON, the lowest percentage you can reach is E${Math.round(minPossibleEth * 100)}.`;
      return result;
    }

    if (V_gas_calc < 0) {
      result.isPossible = false;
      result.gasLiters = 0;
      result.e85Liters = V_add;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Target E${targetEthanol} is unreachable. Your current tank is too low in ethanol. Even if you fill the remaining ${V_add.toFixed(1)}${unitLabel} with pure E85, the maximum blend you can reach is E${Math.round(maxPossibleEth * 100)}.`;
      return result;
    }

    result.e85Liters = V_e85_calc;
    result.gasLiters = V_gas_calc;
    return applyCost(result);
  }

  // --- MODE 2: CUSTOM ADD VOLUME ---
  if (mode === 'specific_add') {
    const V_add = Math.max(0, customAddLiters);
    const V_final = V_curr + V_add;
    result.addedLiters = V_add;
    result.targetLiters = V_final;

    if (V_add <= 0) {
      result.isPossible = false;
      result.errorMessage = "Please enter a valid add volume greater than 0.";
      return result;
    }

    // Checking if final tank size exceeds settings.tankCapacity as a warning (not a failure)
    const nominator = (V_final * E_target) - (V_curr * E_curr) - (V_add * E_gas);
    const denominator = E_e85 - E_gas;
    const V_e85_calc = nominator / denominator;
    const V_gas_calc = V_add - V_e85_calc;

    const maxPossibleEth = ((V_curr * E_curr) + (V_add * E_e85)) / V_final;
    const minPossibleEth = ((V_curr * E_curr) + (V_add * E_gas)) / V_final;

    if (V_e85_calc < 0) {
      result.isPossible = false;
      result.gasLiters = V_add;
      result.e85Liters = 0;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Unreachable target blend. To add precisely ${V_add}${unitLabel} and hit E${targetEthanol}, your starting fuel needs more ethanol. By adding 100% 98 RON, the lowest mix you can reach is E${Math.round(minPossibleEth * 100)}.`;
      return result;
    }

    if (V_gas_calc < 0) {
      result.isPossible = false;
      result.gasLiters = 0;
      result.e85Liters = V_add;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Unreachable target blend. To add precisely ${V_add}${unitLabel} and hit E${targetEthanol}, your starting fuel needs less ethanol. By adding 100% E85, the maximum mix you can reach is E${Math.round(maxPossibleEth * 100)}.`;
      return result;
    }

    result.e85Liters = V_e85_calc;
    result.gasLiters = V_gas_calc;
    return applyCost(result);
  }

  // --- MODE 3: SINGLE-FUEL TOP-UP / ADJUSTMENT ---
  if (mode === 'adjustment') {
    if (V_curr > settings.tankCapacity) {
      result.isPossible = false;
      const unitLabel = settings.unit || 'L';
      result.errorMessage = `Your current fuel (${V_curr.toFixed(1)}${unitLabel}) exceeds your tank capacity (${settings.tankCapacity}${unitLabel}) under Settings. Reset current fuel or expand tank size.`;
      return result;
    }

    if (Math.abs(E_target - E_curr) < 0.001) {
      result.isPossible = true;
      result.gasLiters = 0;
      result.e85Liters = 0;
      result.addedLiters = 0;
      result.targetLiters = V_curr;
      return applyCost(result);
    }

    const V_add_max = Math.max(0, settings.tankCapacity - V_curr);
    if (V_add_max < 0.05) {
      result.isPossible = false;
      result.errorMessage = "The tank is already full, so no fuel can be added to adjust the blend.";
      return result;
    }

    if (E_target > E_curr) {
      // Must add E85 only
      if (E_target >= E_e85) {
        result.isPossible = false;
        result.errorMessage = `Target E${targetEthanol} is impossible to reach. Your E85 fuel only contains ${settings.e85Ethanol}% ethanol. You cannot exceed or reach E${settings.e85Ethanol}% by adding E85 to a lower blend.`;
        return result;
      }

      // V_e85 = V_curr * (E_target - E_curr) / (E_e85 - E_target)
      const V_e85_calc = V_curr * (E_target - E_curr) / (E_e85 - E_target);
      
      if (V_curr + V_e85_calc > settings.tankCapacity) {
        result.isPossible = false;
        result.e85Liters = V_add_max;
        result.gasLiters = 0;
        result.addedLiters = V_add_max;
        result.targetLiters = settings.tankCapacity;

        const maxPossibleEth = ((V_curr * E_curr) + (V_add_max * E_e85)) / settings.tankCapacity;
        const unitLabel = settings.unit || 'L';
        result.errorMessage = `Target E${targetEthanol} is unreachable. It requires adding ${V_e85_calc.toFixed(1)}${unitLabel} of E85, which exceeds your remaining tank space of ${V_add_max.toFixed(1)}${unitLabel}. By filling the remaining space with pure E85, the maximum blend you can reach is E${Math.round(maxPossibleEth * 100)}.`;
        return result;
      }

      result.e85Liters = V_e85_calc;
      result.gasLiters = 0;
      result.addedLiters = V_e85_calc;
      result.targetLiters = V_curr + V_e85_calc;
      return applyCost(result);
    } else {
      // Must add 98 RON gas only
      if (E_target <= E_gas) {
        result.isPossible = false;
        result.errorMessage = `Target E${targetEthanol} is too low. Your 98 RON contains ${settings.gasEthanol}% ethanol. You cannot dilute the tank down to or below E${settings.gasEthanol}% by adding 98 RON fuel.`;
        return result;
      }

      // V_gas = V_curr * (E_curr - E_target) / (E_target - E_gas)
      const V_gas_calc = V_curr * (E_curr - E_target) / (E_target - E_gas);
      
      if (V_curr + V_gas_calc > settings.tankCapacity) {
        result.isPossible = false;
        result.gasLiters = V_add_max;
        result.e85Liters = 0;
        result.addedLiters = V_add_max;
        result.targetLiters = settings.tankCapacity;

        const minPossibleEth = ((V_curr * E_curr) + (V_add_max * E_gas)) / settings.tankCapacity;
        const unitLabel = settings.unit || 'L';
        result.errorMessage = `Target E${targetEthanol} is unreachable. It requires adding ${V_gas_calc.toFixed(1)}${unitLabel} of ${settings.baseGasName || '98 RON'}, which exceeds your remaining tank space of ${V_add_max.toFixed(1)}${unitLabel}. By filling the remaining space with pure ${settings.baseGasName || '98 RON'}, the lowest blend you can reach is E${Math.round(minPossibleEth * 100)}.`;
        return result;
      }

      result.gasLiters = V_gas_calc;
      result.e85Liters = 0;
      result.addedLiters = V_gas_calc;
      result.targetLiters = V_curr + V_gas_calc;
      return applyCost(result);
    }
  }

  return result;
}

/**
 * Formats a shareable text card for clipboard copy
 */
export function generateShareText(
  mode: MixMode,
  result: CalculationResult,
  currency: string = '$',
  gasName: string = '98 RON',
  notes?: string,
  unit: 'L' | 'Gal' | '%' = 'L'
): string {
  const modeLabel = 
    mode === 'full' ? 'Full tank calculation' :
    mode === 'specific_add' ? 'Specific add volume' :
    'Fuel top-up adjustment';

  const unitLabel = unit === 'Gal' ? 'Gal' : unit === '%' ? '%' : 'L';
  const unitFullLabel = unit === 'Gal' ? 'Gallons' : unit === '%' ? 'Percent' : 'Liters';

  const octaneSection = result.blendedOctane
    ? `\n🧪 EST. OCTANE: ${result.blendedOctane.toFixed(1)} RON\n📊 BREAKDOWN: ${result.gasRatioPercent?.toFixed(1)}% ${gasName} | ${result.e85RatioPercent?.toFixed(1)}% E85`
    : '';

  const notesSection = notes ? `\n📝 NOTES: ${notes}` : '';
  const costSection = result.totalCost 
    ? `\n💰 EST. COST: ${currency}${result.totalCost.toFixed(2)}` + 
      (result.savingsVsRegular && result.savingsVsRegular > 0 
        ? ` (Saved ${currency}${result.savingsVsRegular.toFixed(2)} vs pure ${gasName}!)` 
        : '')
    : '';

  return `⛽ ETHANOL BLENDER PRO - MIX RECIPE
----------------------------------------
📋 Mode: ${modeLabel}
🚗 Starting: ${result.currentLiters.toFixed(1)}${unitLabel} of E${result.currentEthanol}
🎯 Target blend: E${result.targetEthanol}${octaneSection}
----------------------------------------
👉 INSTRUCTIONS:
${result.e85Liters > 0 ? `• Add ${result.e85Liters.toFixed(2)} ${unitFullLabel} of E85 (${result.e85Liters.toFixed(1)}${unitLabel})` : ''}
${result.gasLiters > 0 ? `• Add ${result.gasLiters.toFixed(2)} ${unitFullLabel} of ${gasName} (${result.gasLiters.toFixed(1)}${unitLabel})` : ''}
----------------------------------------
📦 Total Added: ${result.addedLiters.toFixed(2)} ${unitFullLabel}
🧪 Final Fuel Volume: ${result.targetLiters.toFixed(2)} ${unitFullLabel} of E${result.targetEthanol}${costSection}${notesSection}
----------------------------------------
Calculated at ${new Date().toLocaleDateString()} via Ethanol Blender Pro.
`;
}

/**
 * Exports data table to CSV
 */
export function exportToCSV(savedMixes: any[], currency: string = '$', gasName: string = '98 RON', unit: 'L' | 'Gal' | '%' = 'L'): string {
  const unitLabel = unit === 'Gal' ? 'Gal' : unit === '%' ? '%' : 'L';
  const headers = [
    'Saved Name', 
    'Date', 
    'Mode', 
    `Start Vol (${unitLabel})`, 
    'Start Eth (%)', 
    'Target Eth (%)', 
    `Added Vol (${unitLabel})`, 
    `"${gasName} Needed (${unitLabel})"`, 
    `E85 Needed (${unitLabel})`, 
    'Est Octane (RON)',
    'Gas Portion (%)',
    'E85 Portion (%)',
    'Cost', 
    'Notes'
  ];
  
  const rows = savedMixes.map(mix => {
    const dateStr = new Date(mix.timestamp).toLocaleDateString();
    const modeLabel = 
      mix.mixMode === 'full' ? 'Full Fill' : 
      mix.mixMode === 'specific_add' ? 'Specific Add' : 
      'Single-Fuel Topup';
      
    return [
      `"${mix.name.replace(/"/g, '""')}"`,
      `"${dateStr}"`,
      `"${modeLabel}"`,
      mix.currentLiters.toFixed(1),
      mix.currentEthanol,
      mix.targetEthanol,
      mix.addedLiters.toFixed(1),
      mix.gasLiters.toFixed(2),
      mix.e85Liters.toFixed(2),
      mix.blendedOctane ? mix.blendedOctane.toFixed(1) : 'N/A',
      mix.gasRatioPercent ? mix.gasRatioPercent.toFixed(1) : 'N/A',
      mix.e85RatioPercent ? mix.e85RatioPercent.toFixed(1) : 'N/A',
      mix.totalCost ? `${currency}${mix.totalCost.toFixed(2)}` : 'N/A',
      `"${(mix.notes || '').replace(/"/g, '""')}"`
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
