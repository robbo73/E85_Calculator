/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface FuelTankVisualizerProps {
  capacity: number;
  current: number;
  gasAdded: number;
  e85Added: number;
  currentEthanol: number;
  targetEthanol: number;
  isPossible: boolean;
  baseGasName?: string;
  theme?: 'cosmic' | 'racing' | 'retro' | 'italian';
  unit?: 'L' | 'Gal' | '%';
}

export const FuelTankVisualizer: React.FC<FuelTankVisualizerProps> = ({
  capacity,
  current,
  gasAdded,
  e85Added,
  currentEthanol,
  targetEthanol,
  isPossible,
  baseGasName = '98 RON',
  theme = 'cosmic',
  unit = 'L',
}) => {
  const cap = capacity || 60;
  
  // Calculate percentage heights (0 to 100)
  const currentPct = Math.min(100, (current / cap) * 100);
  const gasPct = isPossible ? Math.min(100 - currentPct, (gasAdded / cap) * 100) : 0;
  const e85Pct = isPossible ? Math.min(100 - currentPct - gasPct, (e85Added / cap) * 100) : 0;
  
  const totalPct = currentPct + gasPct + e85Pct;
  const emptyPct = Math.max(0, 100 - totalPct);

  // Theme-specific colors and formatting
  const themeSpecs = {
    cosmic: {
      accentText: 'text-indigo-400',
      accentBg: 'bg-indigo-400',
      accentShadow: 'shadow-[0_0_8px_rgba(139,92,246,0.6)]',
      gasFill: 'bg-gradient-to-t from-cyan-600/90 to-cyan-400/90 border-cyan-300/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.3)]',
      gasIndicator: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
      gasLabel: 'Cyan Fuel',
      e85Fill: 'bg-gradient-to-t from-emerald-600/90 to-emerald-400/90 border-emerald-300/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      e85Indicator: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      e85Label: 'Green Fuel',
      baseFill: 'bg-gradient-to-t from-indigo-700/85 to-indigo-500/85 border-indigo-300/20 text-indigo-200 border-indigo-500/20',
      containerBg: 'from-slate-900 via-slate-950 to-black',
      containerBorder: 'border-slate-800/80',
    },
    racing: {
      accentText: 'text-yellow-400',
      accentBg: 'bg-yellow-400',
      accentShadow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      gasFill: 'bg-gradient-to-t from-yellow-600/95 to-yellow-400/95 border-yellow-300/20 text-yellow-200 border-yellow-500/30 shadow-[0_0_8px_rgba(251,191,36,0.3)]',
      gasIndicator: 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      gasLabel: 'Yellow Octane',
      e85Fill: 'bg-gradient-to-t from-amber-600/90 to-amber-400/90 border-amber-300/20 text-amber-200 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      e85Indicator: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      e85Label: 'E85 High-Eth',
      baseFill: 'bg-gradient-to-t from-zinc-700/90 to-zinc-500/90 border-zinc-500/20 text-zinc-300 border-zinc-650/20',
      containerBg: 'from-neutral-900 via-zinc-950 to-neutral-950',
      containerBorder: 'border-zinc-800',
    },
    retro: {
      accentText: 'text-[#00ff66]',
      accentBg: 'bg-[#00ff66]',
      accentShadow: 'shadow-[0_0_8px_rgba(0,255,102,0.6)]',
      gasFill: 'bg-gradient-to-t from-stone-850 to-stone-750 border-stone-700 text-stone-200 border-stone-880 shadow-none',
      gasIndicator: 'bg-stone-500 shadow-none border border-stone-400',
      gasLabel: 'Base Petrol',
      e85Fill: 'bg-gradient-to-t from-amber-800/90 to-amber-500/90 border-amber-600/20 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      e85Indicator: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      e85Label: 'Spirt Blend',
      baseFill: 'bg-gradient-to-t from-[#00aa44]/80 to-[#00f055]/80 border-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/20 shadow-none',
      containerBg: 'from-[#0b0c03] via-[#101205] to-black',
      containerBorder: 'border-stone-800/80',
    },
    italian: {
      accentText: 'text-emerald-400',
      accentBg: 'bg-[#008c45]',
      accentShadow: 'shadow-[0_0_8px_rgba(0,140,69,0.5)]',
      gasFill: 'bg-gradient-to-t from-red-700/90 to-red-500/90 border-red-500/20 text-red-200 border-red-500/30 shadow-[0_0_8px_rgba(205,33,42,0.3)]',
      gasIndicator: 'bg-red-500 shadow-[0_0_8px_rgba(205,33,42,0.6)]',
      gasLabel: 'Rosso Gas',
      e85Fill: 'bg-gradient-to-t from-[#008c45]/90 to-emerald-500/90 border-emerald-500/20 text-emerald-250 border-emerald-500/30 shadow-[0_0_8px_rgba(0,140,69,0.3)]',
      e85Indicator: 'bg-emerald-500 shadow-[0_0_8px_rgba(0,140,69,0.6)]',
      e85Label: 'Verde E85',
      baseFill: 'bg-gradient-to-t from-stone-200/90 to-stone-100/90 border-stone-300/40 text-stone-900 border-stone-250/50 shadow-none',
      containerBg: 'from-stone-900 via-neutral-950 to-stone-950',
      containerBorder: 'border-stone-800',
    }
  };

  const spec = themeSpecs[theme] || themeSpecs.cosmic;

  return (
    <div id="fuel-tank-visualizer-container" className={`flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl relative overflow-hidden h-full border ${spec.containerBorder}`}>
      {/* Background grids */}
      <div className={`absolute inset-0 bg-radial ${spec.containerBg} opacity-90 -z-10`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] -z-10" />

      <h3 className="text-sm font-semibold tracking-wider font-display text-slate-400 mb-6 uppercase text-center w-full flex justify-between items-center px-2">
        <span>Fuel Cell Simulation</span>
        <span className={`text-xs bg-slate-900/80 px-2 py-0.5 rounded ${spec.accentText} font-mono`}>CAP: {cap}{unit}</span>
      </h3>

      <div className="flex w-full items-stretch justify-around gap-6 h-[260px] relative">
        
        {/* Left Side: Measurement Ticks */}
        <div id="tank-ticks" className="flex flex-col justify-between py-2 text-slate-500 font-mono text-[10px] w-8 select-none">
          <div className="flex items-center gap-1"><span className="w-2 h-px bg-slate-700"></span>100%</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-px bg-slate-800"></span>75%</div>
          <div className="flex items-center gap-1"><span className="w-2 h-px bg-slate-700"></span>50%</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-px bg-slate-800"></span>25%</div>
          <div className="flex items-center gap-1"><span className="w-2 h-px bg-slate-700"></span>0%</div>
        </div>

        {/* Center: The Fuel Tank Graphic */}
        <div className={`relative w-28 md:w-32 h-full bg-slate-950/80 rounded-3xl border-3 ${spec.containerBorder} p-1 shadow-inner flex flex-col justify-end overflow-hidden group`}>
          
          {/* Subtle reflection overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 via-transparent to-black/10 pointer-events-none rounded-2xl z-20" />
          <div className="absolute top-2 left-3 w-1.5 h-[90%] bg-white/10 rounded-full blur-[1px] pointer-events-none z-20" />

          {/* Liquid segments wrapped in motion.divs for satisfying slide up animation */}
          <div className="w-full flex flex-col justify-end h-full relative">
            
            {/* 1. E85 Added Segment (Top Added Fuel) */}
            {e85Pct > 0 && isPossible && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${e85Pct}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                className={`w-full relative ${spec.e85Fill.split(' ')[0]} ${spec.e85Fill.split(' ')[1]} ${spec.e85Fill.split(' ')[2]} border-b ${spec.e85Fill.split(' ')[3]}`}
              >
                {/* Visual fluid bubbles */}
                <div className="absolute inset-0 bg-radial from-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/30 blur-[0.5px]" />
                <div className="absolute bottom-2 left-0 right-0 text-center select-none">
                  <span className={`text-[10px] bg-slate-900/90 font-mono font-bold px-1 py-0.2 rounded border ${spec.e85Fill.split(' ')[5]}`}>
                    +{e85Added.toFixed(1)}{unit}
                  </span>
                </div>
              </motion.div>
            )}

            {/* 2. Base Gas Added Segment */}
            {gasPct > 0 && isPossible && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${gasPct}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.1 }}
                className={`w-full relative ${spec.gasFill.split(' ')[0]} ${spec.gasFill.split(' ')[1]} ${spec.gasFill.split(' ')[2]} border-b ${spec.gasFill.split(' ')[3]}`}
              >
                <div className="absolute inset-0 bg-radial from-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/30 blur-[0.5px]" />
                <div className="absolute bottom-2 left-0 right-0 text-center select-none">
                  <span className={`text-[10px] bg-slate-900/90 font-mono font-bold px-1 py-0.2 rounded border ${spec.gasFill.split(' ')[5]}`}>
                    +{gasAdded.toFixed(1)}{unit}
                  </span>
                </div>
              </motion.div>
            )}

            {/* 3. Initial Base Fuel Segment */}
            {currentPct > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${currentPct}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                className={`w-full relative ${
                  isPossible 
                    ? `${spec.baseFill.split(' ')[0]} ${spec.baseFill.split(' ')[1]} ${spec.baseFill.split(' ')[2]} border-b ${spec.baseFill.split(' ')[3]}` 
                    : 'bg-gradient-to-t from-rose-800/80 to-rose-600/80 border-b border-rose-400/30'
                } shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]`}
              >
                <div className="absolute inset-0 bg-radial from-transparent to-slate-900/40 pointer-events-none" />
                <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/20 blur-[0.5px]" />
                <div className="absolute inset-0 flex items-center justify-center text-center select-none p-1">
                  <span className={`text-[10px] bg-slate-950/90 font-mono font-bold px-1 py-0.5 rounded border ${spec.baseFill.split(' ')[5] || 'border-indigo-500/20'} truncate max-w-full`}>
                    {current.toFixed(0)}{unit} (E{currentEthanol})
                  </span>
                </div>
              </motion.div>
            )}

            {/* If fully empty */}
            {totalPct === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-slate-600 text-xs font-mono select-none">
                EMPTY FUEL CELL
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Fuel Proportions / Status Legend */}
        <div className="flex flex-col justify-center gap-4 w-28 font-mono text-xs text-slate-400 select-none">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-display font-semibold">Targets</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${spec.accentBg} ${spec.accentShadow}`}></span>
              <div>
                <p className="text-white font-bold font-display">E{targetEthanol}</p>
                <p className="text-[10px] text-slate-500">Aim Blend</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-display font-semibold">{baseGasName} Added</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded ${spec.gasIndicator}`}></span>
              <div>
                <p className="text-white font-bold">{isPossible ? `${gasAdded.toFixed(1)} ${unit}` : `0.0 ${unit}`}</p>
                <p className="text-[10px] text-slate-500">{spec.gasLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-display font-semibold">E85 Added</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded ${spec.e85Indicator}`}></span>
              <div>
                <p className="text-white font-bold">{isPossible ? `${e85Added.toFixed(1)} ${unit}` : `0.0 ${unit}`}</p>
                <p className="text-[10px] text-slate-500">{spec.e85Label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Badge at bottom */}
      <div className="mt-5 w-full bg-slate-900/65 px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">Fill Level:</span>
        <span className={`text-xs font-bold font-mono ${totalPct > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
          {totalPct > 100 ? 'OVER CAPACITY!' : `${totalPct.toFixed(1)}% Full (${(current + (isPossible ? gasAdded + e85Added : 0)).toFixed(1)}${unit})`}
        </span>
      </div>
    </div>
  );
};
