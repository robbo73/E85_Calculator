/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Plus, 
  Share2, 
  TrendingUp, 
  Gauge as GaugeIcon,
  HelpCircle,
  FileText,
  Bookmark,
  ChevronDown,
  Info
} from 'lucide-react';

import { MixMode, Settings, CalculationResult, SavedMix } from './types';
import { calculateBlend, generateShareText, exportToCSV } from './utils';
import { FuelTankVisualizer } from './components/FuelTankVisualizer';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_SETTINGS: Settings = {
  gasEthanol: 0,
  e85Ethanol: 85,
  gasPrice: 2.15,
  e85Price: 2.25,
  currency: '$',
  tankCapacity: 60,
  baseGasName: '98 RON',
  theme: 'racing',
  unit: 'L',
  defaultTargetEthanol: 40,
};

export default function App() {
  // --- STATE DECLARATIONS ---
  const [settings, setSettings] = useState<Settings>(() => {
    const cached = localStorage.getItem('ebp_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!parsed.baseGasName) {
          parsed.baseGasName = '98 RON';
        }
        if (!parsed.theme) {
          parsed.theme = 'racing';
        }
        if (!parsed.unit) {
          parsed.unit = 'L';
        }
        if (parsed.defaultTargetEthanol === undefined) {
          parsed.defaultTargetEthanol = 40;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [mixMode, setMixMode] = useState<MixMode>('full');
  
  // Input states
  const [currentLiters, setCurrentLiters] = useState<number>(15);
  const [currentEthanol, setCurrentEthanol] = useState<number>(10);
  const [targetEthanol, setTargetEthanol] = useState<number>(settings.defaultTargetEthanol ?? 40);
  const [customAddLiters, setCustomAddLiters] = useState<number>(20);
  
  // History and exports
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>(() => {
    const cached = localStorage.getItem('ebp_saved_mixes');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Saving recipe state
  const [recipeName, setRecipeName] = useState<string>('');
  const [recipeNotes, setRecipeNotes] = useState<string>('');

  // UI status states
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSaveFeedback, setShowSaveFeedback] = useState<boolean>(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // --- PERSISTENCE EFFECT HANDLERS ---
  useEffect(() => {
    localStorage.setItem('ebp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ebp_saved_mixes', JSON.stringify(savedMixes));
  }, [savedMixes]);

  // Handle automatic constraints when settings update (e.g. capacity reduces below current fuel)
  useEffect(() => {
    if (mixMode === 'full' && currentLiters > settings.tankCapacity) {
      setCurrentLiters(Math.min(currentLiters, settings.tankCapacity));
    }
  }, [settings, mixMode]);

  // Update active target ethanol when default target changes in calibration modal
  useEffect(() => {
    if (settings.defaultTargetEthanol !== undefined) {
      setTargetEthanol(settings.defaultTargetEthanol);
    }
  }, [settings.defaultTargetEthanol]);

  // --- MATHEMATICAL EVALUATOR ---
  const result: CalculationResult = useMemo(() => {
    return calculateBlend(
      mixMode,
      currentLiters,
      currentEthanol,
      targetEthanol,
      customAddLiters,
      settings
    );
  }, [mixMode, currentLiters, currentEthanol, targetEthanol, customAddLiters, settings]);

  const currentTheme = settings.theme || 'cosmic';

  const themeStyles = {
    cosmic: {
      wrapperBg: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative",
      ambientGlow: "absolute top-0 left-0 right-0 h-[500px] bg-radial from-indigo-900/10 via-emerald-950/5 to-transparent pointer-events-none -z-10",
      headerClass: "border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40",
      accentTitle: "from-white via-slate-100 to-indigo-300",
      logoBadge: "bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
      configuratorPanel: "lg:col-span-12 xl:col-span-7 space-y-6 bg-slate-950/80 p-5 sm:p-7 rounded-3xl border border-slate-900 shadow-xl relative overflow-hidden",
      panelAccentTop: "absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500",
      accentBar: "bg-indigo-500",
      accentText: "text-indigo-400",
      subAccentText: "text-emerald-400",
      buttonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-indigo-900/30",
      buttonTabSelected: "bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40",
      buttonTabNormal: "hover:bg-slate-950 hover:text-slate-200 text-slate-500 border border-transparent",
      visualizerCard: "bg-slate-950/60 shadow-xl",
      innerCard: "bg-slate-950/60 p-4 rounded-2xl border border-slate-900/60",
      resultCard: "bg-indigo-950/10 border-indigo-900/20",
      glowCyan: "text-cyan-400 tuner-glow-cyan font-bold",
      glowEmerald: "text-emerald-400 tuner-glow-emerald font-bold",
      glowViolet: "text-indigo-400 tuner-glow-indigo font-bold",
      gasBadge: "bg-cyan-950/40 border border-cyan-800/30 text-cyan-400",
      e85Badge: "bg-emerald-950/40 border border-emerald-800/30 text-emerald-400",
      tableHeaderBg: "bg-slate-900/30 text-slate-400",
      rowClass: "hover:bg-slate-900/30 hover:text-white transition-colors",
      highlightClass: "text-indigo-400",
    },
    racing: {
      wrapperBg: "min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono selection:bg-yellow-500/30 selection:text-black relative",
      ambientGlow: "absolute top-0 left-0 right-0 h-[350px] bg-radial from-yellow-500/5 via-neutral-950/0 to-transparent pointer-events-none -z-10",
      headerClass: "border-b border-zinc-900 bg-zinc-950/95 sticky top-0 z-40",
      accentTitle: "from-white via-zinc-200 to-yellow-400",
      logoBadge: "bg-zinc-900 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.25)]",
      configuratorPanel: "lg:col-span-12 xl:col-span-7 space-y-6 bg-zinc-900/90 p-5 sm:p-7 rounded-xl border border-zinc-800/80 shadow-2xl relative overflow-hidden",
      panelAccentTop: "absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-400 via-zinc-650 to-amber-500",
      accentBar: "bg-yellow-500",
      accentText: "text-yellow-400",
      subAccentText: "text-amber-500",
      buttonPrimary: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold shadow-md border border-yellow-500",
      buttonTabSelected: "bg-yellow-500/10 text-yellow-400 border border-yellow-500 font-bold shadow-md",
      buttonTabNormal: "hover:bg-zinc-950 hover:text-slate-200 text-zinc-400 border border-transparent",
      visualizerCard: "bg-zinc-900 border border-zinc-800 shadow-lg",
      innerCard: "bg-zinc-950 p-4 rounded-lg border border-zinc-800",
      resultCard: "bg-yellow-500/5 border border-yellow-500/15 animate-none",
      glowCyan: "text-yellow-400 font-extrabold shadow-[0_0_8px_rgba(250,204,21,0.25)]",
      glowEmerald: "text-amber-500 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.25)]",
      glowViolet: "text-yellow-400 font-bold",
      gasBadge: "bg-yellow-950/40 border border-yellow-500/30 text-yellow-400",
      e85Badge: "bg-amber-950/40 border border-amber-500/30 text-amber-500",
      tableHeaderBg: "bg-zinc-900/50 text-zinc-450 border-b border-zinc-800",
      rowClass: "hover:bg-zinc-900/70 hover:text-white transition-colors border-b border-zinc-900",
      highlightClass: "text-yellow-450",
    },
    retro: {
      wrapperBg: "min-h-screen bg-[#080904] text-[#00ff66] flex flex-col font-mono selection:bg-[#00ff66]/30 selection:text-[#0b0c03] relative border-x border-[#00ff66]/10",
      ambientGlow: "absolute top-0 left-0 right-0 h-[400px] bg-radial from-[#00ff63]/5 via-transparent to-transparent pointer-events-none -z-10",
      headerClass: "border-b-2 border-stone-850 bg-[#0e1003]/95 backdrop-blur-md sticky top-0 z-40 font-mono",
      accentTitle: "from-[#00ff66] via-amber-300 to-[#10f030]",
      logoBadge: "bg-[#0b0c03] border-2 border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.4)]",
      configuratorPanel: "lg:col-span-12 xl:col-span-7 space-y-6 bg-[#0c0d05]/95 p-5 sm:p-7 rounded-md border border-stone-800 shadow-lg relative overflow-hidden",
      panelAccentTop: "absolute top-0 left-0 w-full h-[2px] bg-stone-700",
      accentBar: "bg-[#00ff66]",
      accentText: "text-[#00ff66] [text-shadow:_0_0_5px_rgba(0,255,102,0.5)] font-bold",
      subAccentText: "text-[#ff9900]",
      buttonPrimary: "bg-stone-900 border border-[#00ff66] hover:bg-[#00ff66]/20 text-[#00ff66] font-mono [text-shadow:_0_0_3px_rgb(0,255,100)]",
      buttonTabSelected: "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66] font-extrabold shadow-sm shadow-[#00ff66]/20",
      buttonTabNormal: "hover:bg-stone-900 hover:text-slate-200 text-emerald-700 font-mono border border-transparent",
      visualizerCard: "bg-[#0f1003]/80 border border-stone-800 shadow-lg",
      innerCard: "bg-[#090b02] p-4 rounded border border-stone-800/80",
      resultCard: "bg-[#00ff66]/5 border border-stone-800",
      glowCyan: "text-stone-300 [text-shadow:_0_0_3px_rgba(255,255,255,0.3)] font-bold",
      glowEmerald: "text-amber-500 font-bold shadow-none",
      glowViolet: "text-[#00ff66] [text-shadow:_0_0_4px_rgba(0,255,102,0.8)] font-bold",
      gasBadge: "bg-stone-900 border border-stone-800 text-stone-200",
      e85Badge: "bg-amber-950/20 border border-amber-900/60 text-amber-500 font-bold",
      tableHeaderBg: "bg-[#090b02] text-[#00cc55] border-b border-stone-800",
      rowClass: "hover:bg-[#00ff66]/5 hover:text-white border-b border-stone-900 transition-colors",
      highlightClass: "text-[#00ff66]",
    },
    italian: {
      wrapperBg: "min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-red-650/30 selection:text-white relative",
      ambientGlow: "absolute top-0 left-0 right-0 h-[450px] bg-radial from-red-900/10 via-emerald-950/5 to-transparent pointer-events-none -z-10",
      headerClass: "border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40",
      accentTitle: "from-white via-[#008C45] to-[#CD212A]",
      logoBadge: "bg-gradient-to-br from-[#008C45] via-stone-200 to-[#CD212A] shadow-[0_0_15px_rgba(205,33,42,0.3)] border border-stone-800",
      configuratorPanel: "lg:col-span-12 xl:col-span-7 space-y-6 bg-stone-900/90 p-5 sm:p-7 rounded-2xl border border-stone-850 shadow-2xl relative overflow-hidden",
      panelAccentTop: "absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#008C45] via-stone-200 to-[#CD212A]",
      accentBar: "bg-[#CD212A]",
      accentText: "text-[#CD212A]",
      subAccentText: "text-[#008C45]",
      buttonPrimary: "bg-gradient-to-r from-[#008C45] to-[#CD212A] hover:opacity-95 text-white font-bold tracking-wide shadow-md border border-stone-800",
      buttonTabSelected: "bg-stone-950/60 text-[#008C45] border border-[#008C45]/30 shadow-lg shadow-stone-950/40 font-bold",
      buttonTabNormal: "hover:bg-stone-950 hover:text-stone-200 text-stone-500 border border-transparent",
      visualizerCard: "bg-stone-950/60 shadow-xl border border-stone-900",
      innerCard: "bg-stone-950/60 p-4 rounded-xl border border-stone-900/60",
      resultCard: "bg-gradient-to-br from-[#008C45]/5 to-[#CD212A]/5 border border-stone-850",
      glowCyan: "text-[#CD212A] hover:text-[#e42e37] font-bold",
      glowEmerald: "text-[#008C45] font-bold",
      glowViolet: "text-stone-100 font-bold",
      gasBadge: "bg-red-950/40 border border-red-800/30 text-red-400",
      e85Badge: "bg-emerald-950/40 border border-emerald-800/30 text-emerald-400",
      tableHeaderBg: "bg-stone-900/40 text-stone-400",
      rowClass: "hover:bg-stone-900/50 hover:text-white transition-colors border-b border-stone-900",
      highlightClass: "text-[#CD212A]",
    }
  };

  const style = themeStyles[currentTheme] || themeStyles.cosmic;

  // Helper to compute percentage for range sliders
  const getSliderPercent = (val: number, min: number, max: number): number => {
    if (max <= min) return 0;
    const pct = ((val - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  // Dual-color gradient showing distinct separation between left (selected/filled) and right (remaining/unfilled) portions
  const getSliderGradient = (
    theme: string,
    type: 'existing' | 'currentEth' | 'targetAdd' | 'targetEth',
    percent: number
  ) => {
    let leftColor = '#0ea5e9';
    let rightColor = '#1e293b';

    if (theme === 'cosmic') {
      rightColor = '#1e293b';
      switch (type) {
        case 'existing':
          leftColor = '#0ea5e9'; // Sky blue
          break;
        case 'currentEth':
          leftColor = '#6366f1'; // Indigo
          break;
        case 'targetAdd':
          leftColor = '#06b6d4'; // Cyan
          break;
        case 'targetEth':
          leftColor = '#8b5cf6'; // Violet
          break;
      }
    } else if (theme === 'racing') {
      rightColor = '#27272a';
      switch (type) {
        case 'existing':
          leftColor = '#eab308'; // Racing Yellow
          break;
        case 'currentEth':
          leftColor = '#f59e0b'; // Amber
          break;
        case 'targetAdd':
          leftColor = '#eab308'; // Racing Yellow
          break;
        case 'targetEth':
          leftColor = '#f97316'; // High-octane Orange / Red
          break;
      }
    } else if (theme === 'italian') {
      rightColor = '#292524';
      switch (type) {
        case 'existing':
          leftColor = '#008C45'; // Italian Verde Green
          break;
        case 'currentEth':
          leftColor = '#CD212A'; // Scuderia Red
          break;
        case 'targetAdd':
          leftColor = '#008C45'; // Italian Verde Green
          break;
        case 'targetEth':
          leftColor = '#CD212A'; // Scuderia Red
          break;
      }
    } else if (theme === 'retro') {
      rightColor = '#0d2818';
      leftColor = '#00ff66'; // Phosphor Green
    }

    return `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percent}%, ${rightColor} ${percent}%, ${rightColor} 100%)`;
  };

  // --- ACTIONS & UTILITY HANDLERS ---
  const handleSaveMix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.isPossible) return;

    const nickname = recipeName.trim() || `E${targetEthanol} Mix (${result.addedLiters.toFixed(0)}${settings.unit})`;
    const newMix: SavedMix = {
      id: Math.random().toString(36).substring(2, 9),
      name: nickname,
      timestamp: Date.now(),
      mixMode,
      currentLiters: result.currentLiters,
      currentEthanol: result.currentEthanol,
      targetEthanol: result.targetEthanol,
      targetLiters: result.targetLiters,
      addedLiters: result.addedLiters,
      gasLiters: result.gasLiters,
      e85Liters: result.e85Liters,
      notes: recipeNotes.trim() || undefined,
      gasPriceTotal: result.gasPriceTotal,
      e85PriceTotal: result.e85PriceTotal,
      totalCost: result.totalCost,
      blendedOctane: result.blendedOctane,
      gasRatioPercent: result.gasRatioPercent,
      e85RatioPercent: result.e85RatioPercent
    };

    setSavedMixes(prev => [newMix, ...prev]);
    setRecipeName('');
    setRecipeNotes('');
    setShowSaveFeedback(true);
    setTimeout(() => {
      setShowSaveFeedback(false);
    }, 3000);
  };

  const handleDeleteMix = (id: string) => {
    setSavedMixes(prev => prev.filter(mix => mix.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to wipe all saved mix history?")) {
      setSavedMixes([]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadSavedMix = (mix: SavedMix) => {
    setMixMode(mix.mixMode);
    setCurrentLiters(mix.currentLiters);
    setCurrentEthanol(mix.currentEthanol);
    setTargetEthanol(mix.targetEthanol);
    if (mix.mixMode === 'specific_add') {
      setCustomAddLiters(mix.addedLiters);
    }
    // Scroll to calculator
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(savedMixes, settings.currency, settings.baseGasName || '98 RON', settings.unit);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ethanol_blender_mixes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(savedMixes, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ethanol_blender_mixes_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset quick triggers
  const targetPresets = [30, 40, 50, 60, 85];
  const currentPresets = [settings.gasEthanol, 15, 30, 50, 60, 85];

  return (
    <div className={style.wrapperBg}>
      
      {/* Decorative ambient lighting */}
      <div className={style.ambientGlow} />

      {/* HEADER SECTION */}
      <header className={style.headerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className={`relative p-2 rounded-xl transition-all duration-300 ${style.logoBadge}`}>
              <GaugeIcon size={24} className={currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-white'} />
              {currentTheme !== 'retro' && (
                <>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                </>
              )}
            </div>
            <div>
              <h1 className={`text-md sm:text-lg font-black tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r ${style.accentTitle}`}>
                ETHANOL BLENDER PRO
              </h1>
              <span className={`text-[10px] uppercase font-mono tracking-widest font-bold block leading-none ${currentTheme === 'retro' ? 'text-[#00cc55]' : 'text-slate-500'}`}>
                Precision Octane Formulation Engine
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Visual Skin Switcher */}
            <div className={`flex items-center p-0.5 rounded-xl font-mono text-[10px] sm:text-xs ${currentTheme === 'retro' ? 'bg-[#090b02] border-2 border-stone-850' : 'bg-slate-900/60 border border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, theme: 'racing' }))}
                className={`px-1.5 py-1 sm:px-2.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  currentTheme === 'racing'
                    ? 'bg-yellow-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Carbon Racing theme"
              >
                🏁 Racing
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, theme: 'cosmic' }))}
                className={`px-1.5 py-1 sm:px-2.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  currentTheme === 'cosmic'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cosmic Overdrive theme"
              >
                🌌 Cosmic
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, theme: 'italian' }))}
                className={`px-1.5 py-1 sm:px-2.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  currentTheme === 'italian'
                    ? 'bg-red-600 text-white shadow border border-red-500 font-extrabold shadow-[0_0_8px_rgba(205,33,42,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Italian Scuderia theme"
              >
                🇮🇹 Italian
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, theme: 'retro' }))}
                className={`px-1.5 py-1 sm:px-2.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  currentTheme === 'retro'
                    ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Amber Retro terminal theme"
              >
                📟 Retro
              </button>
            </div>

            {/* Live Pricing Summary Indicator */}
            <div className={`hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs font-mono ${currentTheme === 'retro' ? 'bg-black border-stone-800' : 'bg-slate-900/60 border-slate-800'}`}>
              <span className="text-slate-500">Live Calibration:</span>
              <span className={style.glowCyan}>{settings.baseGasName || '98 RON'}={settings.currency}{settings.gasPrice.toFixed(2)} [E{settings.gasEthanol}]</span>
              <span className="text-slate-700">|</span>
              <span className={style.glowEmerald}>E85={settings.currency}{settings.e85Price.toFixed(2)} [E{settings.e85Ethanol}]</span>
            </div>

            {/* Config Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border font-display font-medium text-xs tracking-wider uppercase text-white transition-all cursor-pointer group active:scale-95 ${
                currentTheme === 'retro' 
                  ? 'bg-stone-900 border-stone-800 hover:bg-[#00ff66]/5 hover:text-[#00ff66]' 
                  : currentTheme === 'racing'
                    ? 'bg-zinc-905 bg-black border-zinc-800 hover:border-yellow-500/50'
                    : currentTheme === 'italian'
                      ? 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-[#CD212A]'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
              }`}
            >
              <SettingsIcon size={14} className={`group-hover:rotate-45 transition-transform duration-300 ${currentTheme === 'retro' ? 'text-[#00ff66]' : currentTheme === 'racing' ? 'text-yellow-400' : currentTheme === 'italian' ? 'text-emerald-500 font-bold' : 'text-indigo-400'}`} />
              <span>Calibrate</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* UPPER PANEL: CALCULATOR & VISUALIZER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: Configurator Controls (7 Cols) */}
          <section id="configurator-panel" className={style.configuratorPanel}>
            
            {/* Header / Accent */}
            <div className={style.panelAccentTop} />

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold tracking-wider font-display text-white uppercase flex items-center gap-2">
                <span className={`w-1.5 h-3 rounded-full ${style.accentBar}`} />
                Input Parameters
              </h2>
              <button 
                onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                className={`transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer ${currentTheme === 'retro' ? 'text-[#00ff66]/60 hover:text-[#00ff66]' : 'text-slate-500 hover:text-indigo-400'}`}
              >
                <HelpCircle size={14} />
                <span>{showFormulaInfo ? "Hide formula" : "How is this calculated?"}</span>
              </button>
            </div>

            {/* Expandable Mathematical proof explaining exact formulas */}
            <AnimatePresence>
              {showFormulaInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 font-mono leading-relaxed ${currentTheme === 'retro' ? 'bg-[#090b02] border-stone-850 text-stone-300' : 'bg-slate-900/60 border-indigo-950/60 text-slate-400'}`}>
                    <p className={`font-bold ${style.accentText}`}>⚛️ Standard Mass-balance Mixing Formulas:</p>
                    <p>
                      Let <span className="text-white">V<sub>curr</sub></span> contain <span className="text-white">E<sub>curr</sub></span> fraction of ethanol. We add <span className="text-white">V<sub>gas</sub></span> (E{settings.baseGasName || '98 RON'} base) and <span className="text-white">V<sub>e85</sub></span> (E85 actual base) to reach a final volume <span className="text-white">V<sub>final</sub></span> and target blend <span className="text-white">E<sub>target</sub></span>.
                    </p>
                    <p className={`p-2.5 rounded-lg text-center font-bold text-[11px] ${currentTheme === 'retro' ? 'bg-black text-[#00ff66]' : 'bg-slate-950/80 text-emerald-400'}`}>
                      V<sub>e85</sub> = [ (V<sub>final</sub> × E<sub>target</sub>) - (V<sub>curr</sub> × E<sub>curr</sub>) - (V<sub>add</sub> × E<sub>gas</sub>) ] / [ E<sub>e85</sub> - E<sub>gas</sub> ]
                    </p>
                    <p>
                      The remainder of available empty space is topped with regular fuel: <span className="text-white">V<sub>gas</sub> = V<sub>add</sub> - V<sub>e85</sub></span>. In "Single top-up" mode, we hold one fuel to 0 and calculate exactly how many liters of E85 (or {settings.baseGasName || '98 RON'}) will adjust your current pool to target.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB INTERFACE: SELECT CALCULATING MIX MODE */}
            <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border ${currentTheme === 'retro' ? 'bg-[#090b02] border-stone-800' : 'bg-slate-900/50 border-slate-800/80'}`}>
              
              <button
                onClick={() => setMixMode('full')}
                className={`py-2 text-center rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mixMode === 'full' 
                    ? currentTheme === 'retro'
                      ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/50 shadow'
                      : currentTheme === 'racing'
                        ? 'bg-yellow-500 text-black border border-yellow-550 font-extrabold shadow'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30' 
                    : `${currentTheme === 'retro' ? 'text-emerald-700 hover:text-[#00ff66]' : 'text-slate-400 hover:text-white'} hover:bg-slate-900/60`
                }`}
              >
                Fill Tank
              </button>

              <button
                onClick={() => setMixMode('specific_add')}
                className={`py-2 text-center rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mixMode === 'specific_add' 
                    ? currentTheme === 'retro'
                      ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/50 shadow'
                      : currentTheme === 'racing'
                        ? 'bg-yellow-500 text-black border border-yellow-550 font-extrabold shadow'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30' 
                    : `${currentTheme === 'retro' ? 'text-emerald-700 hover:text-[#00ff63]' : 'text-slate-400 hover:text-white'} hover:bg-slate-900/60`
                }`}
              >
                Add Direct
              </button>

              <button
                onClick={() => setMixMode('adjustment')}
                className={`py-2 text-center rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mixMode === 'adjustment' 
                    ? currentTheme === 'retro'
                      ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/50 shadow'
                      : currentTheme === 'racing'
                        ? 'bg-yellow-500 text-black border border-yellow-550 font-extrabold shadow'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30' 
                    : `${currentTheme === 'retro' ? 'text-emerald-700 hover:text-[#00ff63]' : 'text-slate-400 hover:text-white'} hover:bg-slate-900/60`
                }`}
              >
                Top-up Mix
              </button>

            </div>

            {/* Tab Descriptions */}
            <div className={`px-4 py-2 border-l-2 text-xs font-mono leading-none flex items-center gap-2 ${currentTheme === 'retro' ? 'bg-[#090b02]/50 border-[#00ff66] text-stone-300' : 'bg-slate-950/60 border-indigo-500 text-slate-400'}`}>
              <Info size={13} className={`shrink-0 ${style.accentText}`} />
              <span>
                {mixMode === 'full' && `Fill your tank fully to its current ${settings.tankCapacity}${settings.unit} maximum capacity.`}
                {mixMode === 'specific_add' && `Specify a custom target load size (e.g. adding exactly 25${settings.unit} of combined fuel).`}
                {mixMode === 'adjustment' && `Determine the single fuel of choice (pure E85 or ${settings.baseGasName || '98 RON'}) to add to hit target.`}
              </span>
            </div>

            {/* PARAMETERS SECTION */}
            <div className="space-y-5 pt-2">
              
              {/* CURRENT LITERS IN TANK */}
              <div className={`p-4 rounded-2xl border space-y-2 ${style.innerCard}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                    Existing Fuel in Tank
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentLiters}
                      onChange={e => setCurrentLiters(Math.max(0, Math.min(settings.tankCapacity, parseFloat(e.target.value) || 0)))}
                      className={`w-16 text-right font-bold text-xs p-1 rounded font-mono focus:outline-none transition-colors ${
                        currentTheme === 'retro' 
                          ? 'bg-black border-stone-800 text-[#00ff66] focus:border-[#00ff66]' 
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border-zinc-800 text-yellow-500 focus:border-yellow-500'
                            : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                      }`}
                      min="0"
                      max={settings.tankCapacity}
                      step="0.5"
                    />
                    <span className="text-xs text-slate-500 font-mono">{settings.unit === 'Gal' ? 'Gallons' : settings.unit === '%' ? 'Percent' : 'Liters'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={settings.tankCapacity}
                    step="0.5"
                    value={currentLiters}
                    onChange={e => setCurrentLiters(parseFloat(e.target.value))}
                    className={`flex-1 cursor-pointer dual-range-slider dual-range-slider-${currentTheme}`}
                    style={{
                      background: getSliderGradient(
                        currentTheme,
                        'existing',
                        getSliderPercent(currentLiters, 0, settings.tankCapacity)
                      )
                    }}
                  />
                </div>
                
                {/* Visual meter percentage helper */}
                <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                  <span>0{settings.unit} (Empty)</span>
                  <span>{((currentLiters / settings.tankCapacity) * 100).toFixed(0)}% Tank Full</span>
                  <span>{settings.tankCapacity}{settings.unit} (Max)</span>
                </div>
              </div>

              {/* CURRENT ETHANOL IN TANK */}
              <div className={`p-4 rounded-2xl border space-y-2 ${style.innerCard}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                    Current Bio-ethanol Mix
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentEthanol}
                      onChange={e => setCurrentEthanol(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className={`w-16 text-right font-bold text-xs p-1 rounded font-mono focus:outline-none transition-colors ${
                        currentTheme === 'retro' 
                          ? 'bg-black border-stone-800 text-[#00ff66] focus:border-[#00ff66]' 
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border-zinc-800 text-yellow-550 focus:border-yellow-500'
                            : currentTheme === 'italian'
                              ? 'bg-stone-950 border-stone-800 text-red-400 focus:border-red-500'
                              : 'bg-slate-950 border-slate-800 text-indigo-400 focus:border-indigo-500'
                      }`}
                      min="0"
                      max={settings.e85Ethanol}
                      step="0.5"
                    />
                    <span className="text-xs text-slate-500 font-mono">E%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={settings.gasEthanol}
                    max={settings.e85Ethanol}
                    step="0.5"
                    value={currentEthanol}
                    onChange={e => setCurrentEthanol(parseFloat(e.target.value))}
                    className={`flex-1 cursor-pointer dual-range-slider dual-range-slider-${currentTheme}`}
                    style={{
                      background: getSliderGradient(
                        currentTheme,
                        'currentEth',
                        getSliderPercent(currentEthanol, settings.gasEthanol, settings.e85Ethanol)
                      )
                    }}
                  />
                </div>

                {/* Bullet Preset Selector for Current Ethanol */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] uppercase font-mono text-slate-600 mr-2">Presets:</span>
                  {currentPresets.map(preset => (
                    <button
                      key={`curr-${preset}`}
                      onClick={() => setCurrentEthanol(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono leading-none font-bold tracking-tight border transition-all cursor-pointer ${
                        currentEthanol === preset
                          ? currentTheme === 'retro'
                            ? 'bg-[#00ff66]/10 border-[#00ff66]/50 text-[#00ff66]'
                            : currentTheme === 'racing'
                              ? 'bg-yellow-500 border-yellow-500 text-black font-extrabold'
                              : currentTheme === 'italian'
                                ? 'bg-[#CD212A] border-[#CD212A] text-white font-bold'
                                : 'bg-indigo-600 border-indigo-500 text-white'
                          : currentTheme === 'retro'
                            ? 'bg-black border-stone-855 text-emerald-700 hover:text-[#00ff66]'
                            : currentTheme === 'racing'
                              ? 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:text-yellow-400'
                              : currentTheme === 'italian'
                                ? 'bg-stone-950 border-stone-850 text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      E{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* TARGET ADD CAPACITY (Only visible in MODE 2 'specific_add') */}
              {mixMode === 'specific_add' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl border space-y-2 ${style.innerCard}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                      Total Added Fuel Volume Required
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customAddLiters}
                        onChange={e => setCustomAddLiters(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className={`w-16 text-right font-bold text-xs p-1 rounded font-mono focus:outline-none transition-colors ${
                          currentTheme === 'retro' 
                            ? 'bg-black border-stone-800 text-[#00ff66] focus:border-[#00ff66]' 
                            : currentTheme === 'racing'
                              ? 'bg-zinc-950 border-zinc-800 text-yellow-550 focus:border-yellow-500'
                              : currentTheme === 'italian'
                                ? 'bg-stone-950 border-stone-800 text-emerald-400 focus:border-emerald-500'
                                : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                        }`}
                        min="0.1"
                        step="0.5"
                      />
                      <span className="text-xs text-slate-500 font-mono">{settings.unit === 'Gal' ? 'Gallons' : settings.unit === '%' ? 'Percent' : 'Liters'}</span>
                    </div>
                  </div>

                  {(() => {
                    const maxAdd = settings.unit === '%' ? Math.max(1, settings.tankCapacity - currentLiters) : Math.max(20, settings.tankCapacity - currentLiters);
                    return (
                      <input
                        type="range"
                        min="1"
                        max={maxAdd}
                        step="0.5"
                        value={customAddLiters}
                        onChange={e => setCustomAddLiters(parseFloat(e.target.value))}
                        className={`w-full cursor-pointer dual-range-slider dual-range-slider-${currentTheme}`}
                        style={{
                          background: getSliderGradient(
                            currentTheme,
                            'targetAdd',
                            getSliderPercent(customAddLiters, 1, maxAdd)
                          )
                        }}
                      />
                    );
                  })()}

                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>1 {settings.unit === 'Gal' ? 'Gal' : settings.unit === '%' ? '%' : 'Liter'}</span>
                    <span>Custom jerrycan/mix batch size</span>
                    <span>
                      {settings.unit === '%' 
                        ? `${(settings.tankCapacity - currentLiters).toFixed(1)}%` 
                        : `${Math.max(20, settings.tankCapacity - currentLiters)}${settings.unit}`
                      } (Empty Space)
                    </span>
                  </div>
                </motion.div>
              )}

              {/* TARGET ETHANOL AIMING FOR */}
              <div className={`p-4 rounded-2xl border space-y-2 ${style.innerCard}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                      Target Ethanol Fuel Blend
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${currentTheme === 'retro' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'bg-indigo-500/15 text-indigo-400'}`}>
                      AIM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetEthanol}
                      onChange={e => setTargetEthanol(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className={`w-16 text-right font-bold text-sm p-1 rounded font-mono focus:outline-none transition-colors ${
                        currentTheme === 'retro' 
                          ? 'bg-black border-stone-800 text-[#00ff66] focus:border-[#00ff66]' 
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border-zinc-800 text-yellow-500 focus:border-yellow-500'
                            : currentTheme === 'italian'
                              ? 'bg-stone-950 border-stone-800 text-red-400 focus:border-red-500'
                              : 'bg-slate-950 border-slate-800 text-violet-400 focus:border-indigo-500'
                      }`}
                      min={settings.gasEthanol}
                      max={settings.e85Ethanol}
                      step="1"
                    />
                    <span className="text-xs text-slate-500 font-mono">E%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={settings.gasEthanol}
                    max={settings.e85Ethanol}
                    step="1"
                    value={targetEthanol}
                    onChange={e => setTargetEthanol(parseFloat(e.target.value))}
                    className={`flex-1 cursor-pointer dual-range-slider dual-range-slider-${currentTheme}`}
                    style={{
                      background: getSliderGradient(
                        currentTheme,
                        'targetEth',
                        getSliderPercent(targetEthanol, settings.gasEthanol, settings.e85Ethanol)
                      )
                    }}
                  />
                </div>

                {/* Target Presets with description */}
                <div className="flex flex-col gap-2 pt-1 font-mono">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] uppercase text-slate-600 mr-2">Presets:</span>
                    {targetPresets.map(preset => (
                      <button
                        key={`target-${preset}`}
                        onClick={() => setTargetEthanol(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono leading-none font-bold tracking-tight border transition-all cursor-pointer ${
                          targetEthanol === preset
                            ? currentTheme === 'retro'
                              ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66]'
                              : currentTheme === 'racing'
                                ? 'bg-yellow-500 border-yellow-550 text-black font-extrabold shadow'
                                : 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                            : currentTheme === 'retro'
                              ? 'bg-black border-stone-850 text-emerald-700 hover:text-[#00ff66]'
                              : currentTheme === 'racing'
                                ? 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900 hover:text-yellow-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        E{preset}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono leading-relaxed mt-1">
                    💡 <span className="text-slate-300 font-medium">E30</span> is ideal for standard fuel pump setups. <span className="text-slate-300 font-medium font-bold">E50</span> provides maximum knock protection for highly tuned engines. <span className="text-slate-300 font-medium">E85</span> is dedicated racing compound.
                  </span>
                </div>
              </div>

            </div>
          </section>

             {/* RIGHT: Live Output Readings & Graphic Visualization (5 Cols) */}
          <section id="results-panel" className="lg:col-span-5 flex flex-col gap-6 h-full">
            
            {/* 1. Main Calculation Display */}
            <div className={`p-6 rounded-3xl relative overflow-hidden flex-grow flex flex-col justify-between border ${
              currentTheme === 'retro' 
                ? 'bg-[#0f1003]/80 border-stone-800' 
                : currentTheme === 'racing' 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-slate-950/80 border-slate-900 shadow-xl'
            }`}>
              
              {/* Corner accent glow */}
              {currentTheme !== 'retro' && (
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none blur-3xl -z-10 ${
                  result.isPossible 
                    ? 'bg-emerald-500/10' 
                    : 'bg-red-500/10'
                }`} />
              )}

              <div>
                <h3 className="text-xs font-bold tracking-widest font-display text-slate-400 uppercase mb-4 flex items-center justify-between">
                  <span>Blend Readings</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    result.isPossible 
                      ? currentTheme === 'retro' 
                        ? 'bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66]' 
                        : 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 animate-pulse' 
                      : 'bg-rose-950/80 border border-rose-500/30 text-rose-400'
                  }`}>
                    {result.isPossible ? 'Ready' : 'Computation Error'}
                  </span>
                </h3>

                {/* SUCCESS READOUT */}
                {result.isPossible ? (
                  <div className="space-y-6">
                    
                    {/* Primary Two-Row readouts for base pump vs e85 */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Base Gas Card */}
                      <div className={`p-4 border shadow-inner ${style.innerCard}`}>
                        <span className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-1 font-bold">
                          {settings.baseGasName || '98 RON'} Gas
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl sm:text-3xl font-black font-display ${style.glowCyan}`}>
                            {result.gasLiters.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{settings.unit}</span>
                        </div>
                        {result.gasPriceTotal && result.gasPriceTotal > 0 ? (
                          <span className="text-[10px] font-mono text-slate-500 block mt-1.5">
                            Cost: {settings.currency}{result.gasPriceTotal.toFixed(2)}
                          </span>
                        ) : null}
                      </div>

                      {/* E85 CARD */}
                      <div className={`p-4 border shadow-inner ${style.innerCard}`}>
                        <span className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-1 font-bold">
                          E85 Pump
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl sm:text-3xl font-black font-display ${style.glowEmerald}`}>
                            {result.e85Liters.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{settings.unit}</span>
                        </div>
                        {result.e85PriceTotal && result.e85PriceTotal > 0 ? (
                          <span className="text-[10px] font-mono text-slate-500 block mt-1.5">
                            Cost: {settings.currency}{result.e85PriceTotal.toFixed(2)}
                          </span>
                        ) : null}
                      </div>

                    </div>

                    {/* Pricing, Arbitrage, Savings vs Standard details */}
                    {result.totalCost && result.totalCost > 0 ? (
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        currentTheme === 'retro' 
                          ? 'bg-[#090b02] border-stone-850' 
                          : currentTheme === 'racing' 
                            ? 'bg-zinc-950 border-zinc-800' 
                            : 'bg-slate-900/40 border-slate-800'
                      }`}>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-mono">Estimated Total Cost</p>
                          <p className={`text-md font-bold font-mono ${currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-white'}`}>
                            {settings.currency}{result.totalCost.toFixed(2)}
                          </p>
                        </div>
                        {result.savingsVsRegular && result.savingsVsRegular !== 0 ? (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-mono">
                              {result.savingsVsRegular > 0 ? "Arbitrage Savings" : "Performance Cost Difference"}
                            </p>
                            <p className={`text-xs font-bold font-mono flex items-center gap-1 justify-end ${
                              result.savingsVsRegular > 0 
                                ? currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-emerald-400' 
                                : 'text-slate-400'
                            }`}>
                              {result.savingsVsRegular > 0 && <TrendingUp size={12} />}
                              {result.savingsVsRegular > 0 ? '+' : ''}
                              {settings.currency}{result.savingsVsRegular.toFixed(2)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Est. Octane and Proportional Blend Breakdown Card */}
                    {result.blendedOctane && (
                      <div className={`p-4 border shadow-inner rounded-xl ${style.innerCard}`}>
                        <span className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-1 font-bold">
                          Formulated Performance Octane
                        </span>
                        <div className="flex items-baseline justify-between mb-3">
                          <span className={`text-2xl sm:text-3xl font-black font-display text-white`}>
                            {result.blendedOctane.toFixed(1)} <sub className="text-xs font-semibold font-sans">RON</sub>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wide">Standard Octane Blended Value</span>
                        </div>
                        
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between items-center text-slate-400 font-semibold font-mono text-[8px] uppercase tracking-wider">
                            <span>{settings.baseGasName || '98 RON'} portion</span>
                            <span>E85 Pump Portion</span>
                          </div>
                          
                          {/* Segmented ratio bar */}
                          <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                            <div 
                              className="h-full bg-cyan-500/80 transition-all duration-500" 
                              style={{ width: `${result.gasRatioPercent || 0}%` }}
                              title={`${settings.baseGasName}: ${result.gasRatioPercent?.toFixed(1)}%`}
                            />
                            <div 
                              className="h-full bg-emerald-500/80 transition-all duration-500" 
                              style={{ width: `${result.e85RatioPercent || 0}%` }}
                              title={`E85 Pump: ${result.e85RatioPercent?.toFixed(1)}%`}
                            />
                          </div>
                          
                          <div className="flex justify-between text-slate-500 text-[10px] font-mono leading-none pt-0.5">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                              {result.gasRatioPercent?.toFixed(1)}% ({settings.baseGasName})
                            </span>
                            <span className="flex items-center gap-1 justify-end">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {result.e85RatioPercent?.toFixed(1)}% (E85)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Instruction */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed font-mono ${
                      currentTheme === 'retro' 
                        ? 'bg-black border-stone-800 text-stone-300' 
                        : currentTheme === 'racing' 
                          ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
                          : 'bg-indigo-950/30 border-indigo-900/30 text-indigo-400'
                    }`}>
                      👉 Pour <span className={`font-bold ${currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-white'}`}>{result.e85Liters.toFixed(2)}{settings.unit}</span> of E85 then add <span className={`font-bold ${currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-white'}`}>{result.gasLiters.toFixed(2)}{settings.unit}</span> of {settings.baseGasName || '98 RON'} to achieve a pristine <span className={`font-black ${style.accentText}`}>E{result.targetEthanol}</span> blend.
                    </div>

                  </div>
                ) : (
                  /* ERROR DISCLOSURE / MATHEMATICAL BOUNDARIES WARNING */
                  <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-900/30 text-rose-300 font-mono text-xs space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold uppercase font-display">
                      <span className="w-1.5 h-3 bg-rose-500 rounded-full" />
                      Constraints Unmet
                    </div>
                    <p className="leading-relaxed">
                      {result.errorMessage}
                    </p>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-slate-500 text-[10px] space-y-1">
                      <p className="font-bold uppercase tracking-wider text-slate-400">System Parameters:</p>
                      <p>Current pool: {currentLiters.toFixed(1)}{settings.unit} @ {currentEthanol}% Eth</p>
                      <p>Target pool desired: E{targetEthanol}</p>
                      <p>Maximum tank size: {settings.tankCapacity}{settings.unit}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* SAVE / EXPORT CARD (Only if target mix handles perfectly) */}
              {result.isPossible && (
                <form onSubmit={handleSaveMix} className="mt-6 pt-5 border-t border-slate-900/80 space-y-3">
                  
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Bookmark size={13} className="text-zinc-500" />
                      Save Formula Recipe
                    </span>
                    <span className="text-[9px] text-slate-600">Enter moniker for the log book</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. M3 Track E30"
                      value={recipeName}
                      onChange={e => setRecipeName(e.target.value)}
                      className={`rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:ring-1 ${
                        currentTheme === 'retro' 
                          ? 'bg-black border border-stone-800 focus:border-[#00ff66] focus:ring-[#00ff66]/30' 
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:ring-yellow-500/20'
                            : 'bg-slate-950 border border-slate-900 focus:border-indigo-500'
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Optional notes..."
                      value={recipeNotes}
                      onChange={e => setRecipeNotes(e.target.value)}
                      className={`rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 ${
                        currentTheme === 'retro' 
                          ? 'bg-black border border-stone-800 focus:border-[#00ff66] focus:ring-[#00ff66]/30' 
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:ring-yellow-500/20'
                            : 'bg-slate-950 border border-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`flex-grow flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer ${style.buttonPrimary}`}
                    >
                      <Plus size={14} className={currentTheme === 'retro' ? 'text-[#00ff66]' : currentTheme === 'racing' ? 'text-black font-extrabold' : 'text-indigo-400'} />
                      <span>Add to Log Book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(generateShareText(mixMode, result, settings.currency, settings.baseGasName || '98 RON', recipeNotes, settings.unit), 'clipboard-main')}
                      className={`p-2 rounded-xl group relative transition-all cursor-pointer border ${
                        currentTheme === 'retro'
                          ? 'bg-black border-stone-800 hover:bg-stone-900 text-[#00ff66]'
                          : currentTheme === 'racing'
                            ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-yellow-500'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400'
                      }`}
                      title="Copy recipe card to clipboard"
                    >
                      {copiedId === 'clipboard-main' ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Share2 size={16} className="group-hover:scale-105 transition-transform" />
                      )}
                      
                      {/* Mini absolute bubble toast */}
                      {copiedId === 'clipboard-main' && (
                        <div className={`absolute bottom-11 right-1/2 translate-x-1/2 border px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap uppercase tracking-wider ${
                          currentTheme === 'retro' ? 'bg-[#090b02] border-stone-805 text-[#00ff66]' : 'bg-slate-900 border-slate-800 text-emerald-400'
                        }`}>
                          Copied!
                        </div>
                      )}
                    </button>
                  </div>

                  {showSaveFeedback && (
                    <p className={`text-[10px] text-center font-mono animate-pulse ${style.accentText}`}>
                      ✓ Mix successfully archived to local logs below!
                    </p>
                  )}

                </form>
              )}

            </div>

            {/* 2. Secondary Fuel Tank Visualizer Block */}
            <div className="h-[360px] lg:h-auto font-mono">
              <FuelTankVisualizer
                capacity={settings.tankCapacity}
                current={currentLiters}
                gasAdded={result.gasLiters}
                e85Added={result.e85Liters}
                currentEthanol={currentEthanol}
                targetEthanol={targetEthanol}
                isPossible={result.isPossible}
                theme={currentTheme}
                baseGasName={settings.baseGasName}
                unit={settings.unit}
              />
            </div>

          </section>

        </div>

        {/* LOWER SECTION: HISTORICAL ARCHIVE LOGS & DATA PORTABILITY (Full size) */}
        <section id="log-book-panel" className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${style.innerCard}`}>
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
            <div>
              <h2 className="text-md font-bold tracking-wider font-display text-white uppercase flex items-center gap-2">
                <span className={`w-1.5 h-3.5 rounded-full ${style.accentBar}`} />
                Mix log Book & Archives
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Archived calculations stored in this browser session ({savedMixes.length} total entries)
              </p>
            </div>

            {savedMixes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 font-mono">
                
                <button
                  onClick={handleDownloadCSV}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    currentTheme === 'retro' 
                      ? 'bg-black hover:bg-stone-900 border-stone-800 text-[#00ff66] hover:text-white' 
                      : currentTheme === 'racing'
                        ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-805 text-yellow-450 hover:text-yellow-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Download size={13} className={currentTheme === 'retro' ? 'text-[#00ff66]' : currentTheme === 'racing' ? 'text-yellow-500' : 'text-cyan-400'} />
                  <span>Download .CSV</span>
                </button>

                <button
                  onClick={handleDownloadJSON}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    currentTheme === 'retro' 
                      ? 'bg-black hover:bg-stone-900 border-stone-800 text-[#00ff66] hover:text-white' 
                      : currentTheme === 'racing'
                        ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-805 text-yellow-450 hover:text-yellow-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Download size={13} className={currentTheme === 'retro' ? 'text-[#00ff66]' : currentTheme === 'racing' ? 'text-yellow-500' : 'text-indigo-400'} />
                  <span>Download .JSON</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    currentTheme === 'retro'
                      ? 'bg-stone-900/15 border-stone-800 text-stone-500 hover:text-red-400'
                      : 'bg-red-950/20 hover:bg-red-950/40 border-red-900/30 text-rose-300'
                  }`}
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>

              </div>
            )}
          </div>

          {/* Table / Grid list */}
          {savedMixes.length > 0 ? (
            <div className={`overflow-x-auto rounded-2xl border ${currentTheme === 'retro' ? 'border-stone-800 bg-[#090b02]' : currentTheme === 'racing' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-900 bg-slate-950/40'}`}>
              <table className="w-full text-left border-collapse text-xs select-none">
                
                <thead>
                  <tr className={`border-b font-display font-semibold uppercase tracking-wider text-[10px] ${style.tableHeaderBg}`}>
                    <th className="py-3 px-4 font-bold">Formula Moniker</th>
                    <th className="py-3 px-4 font-bold">Mix Mode</th>
                    <th className="py-3 px-4 font-bold">Starting Pool</th>
                    <th className="py-3 px-4 font-bold">Instructions (Add Specs)</th>
                    <th className="py-3 px-4 font-bold">Target Blend</th>
                    <th className="py-3 px-4 font-bold">Total Cost</th>
                    <th className="py-3 px-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody className={`divide-y font-mono ${currentTheme === 'retro' ? 'divide-stone-900' : currentTheme === 'racing' ? 'divide-zinc-900' : 'divide-slate-900'}`}>
                  {savedMixes.map((mix) => {
                    const textCard = generateShareText(mix.mixMode, mix as unknown as CalculationResult, settings.currency, settings.baseGasName || '98 RON', mix.notes, settings.unit);
                    
                    return (
                      <tr key={mix.id} className={style.rowClass}>
                        
                        {/* Name & Notes */}
                        <td className="py-4 px-4">
                          <div className={`font-bold uppercase text-xs ${currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-white'}`}>{mix.name}</div>
                          {mix.notes && (
                            <div className="text-[10px] text-zinc-500 mt-0.5 max-w-xs truncate" title={mix.notes}>
                              Note: {mix.notes}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-600 mt-1">
                            {new Date(mix.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>

                        {/* Mode */}
                        <td className="py-4 px-4">
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${currentTheme === 'retro' ? 'bg-[#090b02] text-emerald-600 border-stone-850 font-bold' : currentTheme === 'racing' ? 'bg-zinc-950 text-zinc-400 border-zinc-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                            {mix.mixMode === 'full' ? 'Full Fill' : mix.mixMode === 'specific_add' ? 'Direct Load' : 'Fuel Topup'}
                          </span>
                        </td>

                        {/* Starting conditions */}
                        <td className="py-4 px-4 text-slate-400">
                          {mix.currentLiters.toFixed(1)}{settings.unit} of <span className={`font-black ${style.accentText}`}>E{mix.currentEthanol}</span>
                        </td>

                        {/* Calculation instructional outputs */}
                        <td className="py-4 px-4 font-semibold">
                          <div className="flex flex-col gap-1 font-bold">
                            {mix.gasLiters > 0 && (
                              <span className={currentTheme === 'retro' ? 'text-stone-300' : currentTheme === 'racing' ? 'text-yellow-400' : 'text-cyan-400'}>
                                ⛽ +{mix.gasLiters.toFixed(2)}{settings.unit} {settings.baseGasName || '98 RON'}
                              </span>
                            )}
                            {mix.e85Liters > 0 && (
                              <span className={currentTheme === 'retro' ? 'text-[#00ff66]' : currentTheme === 'racing' ? 'text-amber-500' : 'text-emerald-400'}>
                                🍀 +{mix.e85Liters.toFixed(2)}{settings.unit} E85
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Target blend output and resulting fuel volume */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div>
                              <span className={`font-black font-display text-sm mr-1 ${currentTheme === 'retro' ? 'text-[#00ff66]' : 'text-violet-400'}`}>
                                E{mix.targetEthanol}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                ({mix.targetLiters.toFixed(1)}{settings.unit} Total)
                              </span>
                            </div>
                            {mix.blendedOctane ? (
                              <div className="text-[10px] text-slate-400 font-mono leading-none flex items-center gap-1 mt-0.5" title={`${mix.gasRatioPercent?.toFixed(0)}% Gas / ${mix.e85RatioPercent?.toFixed(0)}% E85`}>
                                🧪 <span className="font-bold text-slate-200">{mix.blendedOctane.toFixed(1)}</span> RON
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Total pricing */}
                        <td className="py-4 px-4 font-medium text-slate-300">
                          {mix.totalCost ? `${settings.currency}${mix.totalCost.toFixed(2)}` : 'N/A'}
                        </td>

                        {/* Actions block */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Recall parameters into active slots */}
                            <button
                              onClick={() => loadSavedMix(mix)}
                              className={`px-2.5 py-1 border text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${
                                currentTheme === 'retro'
                                  ? 'bg-black border-stone-800 hover:bg-stone-900 text-[#00ff66]'
                                  : currentTheme === 'racing'
                                    ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-yellow-500'
                                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:text-white text-indigo-400'
                              }`}
                              title="Load parameters back into tuner dashboard"
                            >
                              Load Raw
                            </button>

                            {/* Share copying button per table column */}
                            <button
                              onClick={() => copyToClipboard(textCard, mix.id)}
                              className={`p-1.5 border rounded-lg transition-all cursor-pointer relative ${
                                currentTheme === 'retro'
                                  ? 'bg-black border-stone-800 hover:bg-stone-900 text-[#00ff66]'
                                  : currentTheme === 'racing'
                                    ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-905 text-zinc-400 hover:text-white'
                                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                              title="Copy recipe card text"
                            >
                              {copiedId === mix.id ? (
                                <Check size={14} className="text-emerald-400" />
                              ) : (
                                <Copy size={14} />
                              )}

                              {copiedId === mix.id && (
                                <div className={`absolute bottom-8 right-1/2 translate-x-1/2 border px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap uppercase tracking-wider ${
                                  currentTheme === 'retro' ? 'bg-[#090b02] border-stone-805 text-[#00ff66]' : 'bg-slate-900 border-slate-800 text-emerald-400'
                                }`}>
                                  Copied!
                                </div>
                              )}
                            </button>

                            {/* Delete specific items */}
                            <button
                              onClick={() => handleDeleteMix(mix.id)}
                              className="p-1.5 bg-rose-950/10 hover:bg-rose-900/30 border border-rose-900/20 hover:border-rose-950 rounded-lg text-rose-400 transition-all cursor-pointer"
                              title="Delete archived recipe"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          ) : (
            <div className={`text-center py-10 rounded-2xl border border-dashed ${currentTheme === 'retro' ? 'border-stone-800 bg-black/60' : currentTheme === 'racing' ? 'border-zinc-800 bg-zinc-950/40' : 'border-slate-900 bg-slate-950/50'}`}>
              <FileText size={32} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Log Book is currently empty.</p>
              <p className="text-xs text-slate-600 font-mono mt-1">Configure formulas and save your fuel recipes to log session stats here.</p>
            </div>
          )}

        </section>

      </main>

      {/* FOOTER CODA */}
      <footer className={`border-t py-6 mt-12 text-center text-[10px] font-mono ${
        currentTheme === 'retro' 
          ? 'border-stone-850 bg-[#0e1003]/60 text-emerald-800' 
          : currentTheme === 'racing' 
            ? 'border-zinc-900/60 bg-zinc-950 text-zinc-500' 
            : 'border-slate-900 bg-slate-950/60 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <p>ETHANOL BLENDER PRO © 2026 CALCULATOR ENGINE | DESIGNED FOR AUTOMOTIVE ENGINE CALIBRATIONS & MOTORSPORT APPLICATIONS ONLY</p>
          <p className="mt-1 text-[9px] text-zinc-750">Calculate carefully. Always cross-verify pump actual fuels to ensure safety metrics match your target maps.</p>
        </div>
      </footer>

      {/* SETTINGS DRAWER OVERLAY */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

    </div>
  );
}
