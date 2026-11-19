/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings } from '../types';
import { X, RotateCcw, HelpCircle } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../defaults';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = React.useState<Settings>(() => ({
    unit: 'L',
    ...settings,
  }));

  React.useEffect(() => {
    setLocalSettings({ unit: 'L', ...settings });
  }, [settings]);

  // Close on Escape while the dialog is open.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Settings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setLocalSettings({ ...DEFAULT_SETTINGS });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  return (
    <div
      id="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
            <h2 id="settings-modal-title" className="text-lg font-bold font-display text-white uppercase tracking-wider">Dashboard Calibration</h2>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Tank Capacity & Pump Gas Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tank Capacity */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
              <label htmlFor="setting-tank-capacity" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-2">
                Tank capacity ({localSettings.unit === 'Gal' ? 'Gallons' : localSettings.unit === '%' ? 'Percent' : 'Liters'})
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="setting-tank-capacity"
                  type="number"
                  value={localSettings.tankCapacity || ''}
                  onChange={e => handleChange('tankCapacity', Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2 text-white font-mono placeholder-slate-700 focus:outline-none transition-all"
                  placeholder={localSettings.unit === 'Gal' ? "15" : localSettings.unit === '%' ? "100" : "60"}
                  min="1"
                  step="0.1"
                  required
                />
                <span className="text-xs text-slate-500 font-mono">{localSettings.unit}</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-1.5">
                {localSettings.unit === 'Gal' 
                  ? "Common vehicle tank: 12-18 Gal." 
                  : localSettings.unit === '%' 
                    ? "Full-tank standard: 100%." 
                    : "Common vehicle tank: 50-70L."}
              </p>
            </div>

            {/* Default Pump Gas selection */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-2">
                Default Pump Gas
              </label>
              <div className="grid grid-cols-4 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const currentGasVal = localSettings.baseGasName;
                    handleChange('baseGasName', '91 RON');
                    if (currentGasVal === '98 RON' && localSettings.gasEthanol === 5) {
                      handleChange('gasEthanol', 10);
                    }
                  }}
                  className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                    localSettings.baseGasName === '91 RON'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  91 RON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentGasVal = localSettings.baseGasName;
                    handleChange('baseGasName', '93 RON');
                    if (currentGasVal === '98 RON' && localSettings.gasEthanol === 5) {
                      handleChange('gasEthanol', 10);
                    }
                  }}
                  className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                    localSettings.baseGasName === '93 RON'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  93 RON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentGasVal = localSettings.baseGasName;
                    handleChange('baseGasName', '95 RON');
                    if (currentGasVal === '98 RON' && localSettings.gasEthanol === 5) {
                      handleChange('gasEthanol', 10);
                    }
                  }}
                  className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                    localSettings.baseGasName === '95 RON'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  95 RON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentGasVal = localSettings.baseGasName;
                    handleChange('baseGasName', '98 RON');
                    if (currentGasVal !== '98 RON' && localSettings.gasEthanol === 10) {
                      handleChange('gasEthanol', 5);
                    }
                  }}
                  className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                    localSettings.baseGasName === '98 RON'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  98 RON
                </button>
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-1.5">Default baseline gas used in mixes.</p>
            </div>

          </div>

          {/* Section 2: Fuel Blend Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Base Gas Ethanol Content */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
              <label htmlFor="setting-gas-ethanol" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-2">
                {localSettings.baseGasName || '98 RON'} Base Ethanol
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="setting-gas-ethanol"
                  type="number"
                  value={localSettings.gasEthanol ?? ''}
                  onChange={e => handleChange('gasEthanol', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none transition-all"
                  min="0"
                  max="50"
                  step="0.5"
                  required
                />
                <span className="text-xs text-slate-500 font-mono">%</span>
              </div>
              <p className="text-[9px] text-slate-600 font-mono mt-1">
                {localSettings.baseGasName === '98 RON' 
                  ? '98 Premium standard = 5% (E5) or 0%.' 
                  : `${localSettings.baseGasName} is typically 10% (E10) or 0% (E0).`}
              </p>
            </div>

            {/* E85 actual Ethanol Content */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
              <label htmlFor="setting-e85-ethanol" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-2">
                E85 Pump Ethanol
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="setting-e85-ethanol"
                  type="number"
                  value={localSettings.e85Ethanol ?? ''}
                  onChange={e => handleChange('e85Ethanol', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none transition-all"
                  min="50"
                  max="100"
                  step="0.5"
                  required
                />
                <span className="text-xs text-slate-500 font-mono">%</span>
              </div>
              <p className="text-[9px] text-slate-600 font-mono mt-1">Slightly lower in winter (e.g. 70%-80%).</p>
            </div>

            {/* Default Target Ethanol Blend */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 sm:col-span-2">
              <label htmlFor="setting-default-target" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-2">
                Default Target Ethanol Blend
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="setting-default-target"
                  type="number"
                  value={localSettings.defaultTargetEthanol ?? 40}
                  onChange={e => handleChange('defaultTargetEthanol', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none transition-all"
                  min="0"
                  max="100"
                  step="1"
                  required
                />
                <span className="text-xs text-slate-500 font-mono">E%</span>
              </div>
              <p className="text-[9px] text-slate-600 font-mono mt-1">
                The startup/default target ethanol blend for active screens (can still be adjusted on-the-fly).
              </p>
            </div>

          </div>

          {/* Section 3: Costs and Currencies */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-4">
            
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
                Regional Preferences & Calibration Units
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Currency selector */}
                <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Currency:</span>
                  <select
                    value={localSettings.currency}
                    onChange={e => handleChange('currency', e.target.value)}
                    className="bg-transparent text-xs text-white font-bold font-mono focus:outline-none border-none cursor-pointer"
                  >
                    <option value="$">$ (USD)</option>
                    <option value="A$">A$ (AUD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="kr">kr (SEK/NOK)</option>
                  </select>
                </div>

                {/* Liters or Gallons choose option */}
                <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Unit:</span>
                  <select
                    value={localSettings.unit || 'L'}
                    onChange={e => {
                      const nextUnit = e.target.value as 'L' | 'Gal' | '%';
                      handleChange('unit', nextUnit);
                      
                      // Auto-scale defaults to be realistic for selected unit
                      if (nextUnit === 'Gal' && localSettings.tankCapacity === 60) {
                        handleChange('tankCapacity', 15);
                        if (localSettings.gasPrice === 2.15) handleChange('gasPrice', 5.50);
                        if (localSettings.e85Price === 1.65) handleChange('e85Price', 4.20);
                      } else if (nextUnit === 'L' && localSettings.tankCapacity === 15) {
                        handleChange('tankCapacity', 60);
                        if (localSettings.gasPrice === 5.50) handleChange('gasPrice', 2.15);
                        if (localSettings.e85Price === 4.20) handleChange('e85Price', 1.65);
                      } else if (nextUnit === '%') {
                        handleChange('tankCapacity', 100);
                      }
                    }}
                    className="bg-transparent text-xs text-white font-bold font-mono focus:outline-none border-none cursor-pointer"
                  >
                    <option value="L">Liters (L)</option>
                    <option value="Gal">Gallons (Gal)</option>
                    <option value="%">Percent (%)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Pump Gas Price */}
              <div>
                <span className="block text-[10px] text-slate-500 font-mono mb-1">
                  {localSettings.baseGasName || '98 RON'} Price/{localSettings.unit === 'Gal' ? 'Gal' : localSettings.unit === '%' ? '%' : 'L'}
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                    {localSettings.currency}
                  </span>
                  <input
                    type="number"
                    value={localSettings.gasPrice ?? ''}
                    onChange={e => handleChange('gasPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none"
                    step="0.01"
                    min="0"
                    placeholder={localSettings.unit === 'Gal' ? "5.50" : localSettings.unit === '%' ? "1.00" : "2.15"}
                  />
                </div>
              </div>

              {/* E85 Price */}
              <div>
                <span className="block text-[10px] text-slate-500 font-mono mb-1">
                  E85 Price/{localSettings.unit === 'Gal' ? 'Gal' : localSettings.unit === '%' ? '%' : 'L'}
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                    {localSettings.currency}
                  </span>
                  <input
                    type="number"
                    value={localSettings.e85Price ?? ''}
                    onChange={e => handleChange('e85Price', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none"
                    step="0.01"
                    min="0"
                    placeholder={localSettings.unit === 'Gal' ? "4.20" : localSettings.unit === '%' ? "1.00" : "1.65"}
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-2 items-start bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10 text-slate-400">
              <HelpCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-normal font-sans">
                By specifying fuel pricing, Ethanol Blender Pro compares the cost of your custom blend against regular performance fuel ({localSettings.baseGasName || '98 RON'}) and computes the financial arbitrage.
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Default
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-500/20 text-white font-bold font-display text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/20 active:scale-98 transition-all cursor-pointer"
            >
              Apply Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
