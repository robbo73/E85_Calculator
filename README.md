# Ethanol Blender Pro

A web calculator for blending pump gasoline (91, 93, 95 or 98 RON) with E85 to reach a target ethanol percentage such as E30, E50 or E85. Tell it what is already in the tank and what you are aiming for, and it works out how much of each fuel to add.

## Features

- **Three calculation modes**
  - **Fill Tank** – top the tank up to its full capacity and land on your target blend.
  - **Add Direct** – mix an exact batch size (for example a 20 L jerrycan).
  - **Top-up Mix** – find the single fuel (E85 or pump gas) that moves the current tank to the target.
- **Clear error messages** when a target can't be reached, including the closest blend you can reach.
- **Cost estimate** and comparison against filling with pump gas alone.
- **Estimated octane** and gas/E85 breakdown of the final blend.
- **Fuel tank visualiser** showing existing fuel and what you're adding.
- **Log book** to save recipes with notes, reload them, copy a shareable recipe card, and export to CSV or JSON.
- **Calibration settings** for tank size, base gas type and ethanol content, E85 pump ethanol content (for example E70 in winter), prices, currency, units (L / Gal / %) and default target.
- **Four visual themes:** Racing, Cosmic, Italian and Retro.

Settings and the log book are stored in your browser's local storage. Nothing is sent to a server.

## Getting started

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Type-check with `tsc --noEmit`       |
| `npm run clean`   | Remove the `dist/` folder            |

## How the maths works

The calculator does a simple ethanol mass balance on volumes. With `V_curr` litres of fuel at ethanol fraction `E_curr` in the tank, adding `V_add` litres in total to reach `V_final = V_curr + V_add` at `E_target`:

```
V_e85 = (V_final × E_target − V_curr × E_curr − V_add × E_gas) / (E_e85 − E_gas)
V_gas = V_add − V_e85
```

`E_gas` is the ethanol fraction of your base pump gas and `E_e85` is the actual ethanol fraction of the E85 you buy. Real E85 varies by season and supplier, so set it in Calibration to match your pump. A blend is reported as unreachable when either volume would be negative.

**Octane is an estimate.** It is a straight volume-weighted average of the base gas RON and an assumed 108 RON for E85. Real ethanol blending is not perfectly linear, so treat the figure as a guide only.

## Safety

This tool is intended for automotive calibration and motorsport use. Always check the ethanol content of the fuel you actually buy, make sure your engine, fuel system and tune are suitable for the blend, and verify results before relying on them.

## Project structure

```
src/
  App.tsx                         Main UI and state
  utils.ts                        Blend calculation, share text, CSV export
  defaults.ts                     Default settings
  types.ts                        Shared TypeScript types
  components/
    SettingsModal.tsx             Calibration dialog
    FuelTankVisualizer.tsx        Animated tank graphic
```

Built with React 19, TypeScript, Vite, Tailwind CSS 4, Motion and Lucide icons.

## License

Source files carry Apache-2.0 license headers.
