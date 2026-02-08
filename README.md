# Dart Game Counter

A mobile-first Progressive Web App (PWA) for scoring dart games. Track scores, manage players, and play multiple game modes -- all from your phone with **no server required**. Everything runs in your browser and data is stored locally on your device.

<!-- Screenshots: replace the placeholder paths below with actual screenshots -->

|                    Player Setup                    |               Game Play (X01)                |                     Dartboard Input                      |             Winner Dialog              |
| :------------------------------------------------: | :------------------------------------------: | :------------------------------------------------------: | :------------------------------------: |
| ![Player Setup](docs/screenshots/player-setup.png) | ![Game Play](docs/screenshots/game-play.png) | ![Dartboard Input](docs/screenshots/dartboard-input.png) | ![Winner](docs/screenshots/winner.png) |

## Why Dart Game Counter?

- **No server, no account, no signup.** Open the app and start playing immediately.
- **Works offline.** Once loaded, the app is fully functional without an internet connection.
- **Install to your home screen.** Add it like a native app on iOS or Android -- no app store needed.
- **Your data stays on your device.** All scores, statistics, and presets are stored locally in your browser.

## Game Modes

| Game                 | Description                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **X01 (301 / 501)**  | Classic countdown game. Choose between 301 or 501 starting score, with single-out or double-out finish rules. Includes a built-in checkout calculator that suggests optimal finishes when your remaining score is 170 or below. |
| **Cricket**          | Close numbers 15--20 and Bull by hitting them three times. Score points on numbers you've closed that your opponents haven't.                                                                                                   |
| **Around the Clock** | Hit every number from 1 to 20 in order. Optional Bull as a final target and optional multiplier advancement (doubles skip ahead by 2, triples by 3).                                                                            |
| **Around the World** | A variant of Around the Clock with alternative configurations.                                                                                                                                                                  |
| **Shanghai**         | Target a specific number each round. Land a single, double, and triple of the round's number in one turn for an instant "Shanghai" win.                                                                                         |
| **Halve-It**         | Hit the target for each round to score, or miss and have your total halved. Progressively more challenging targets keep the pressure on.                                                                                        |

## Features

### Player Management

- Add, edit, and remove players
- Drag-and-drop reordering of the player list
- Remembered players list for quick access in future games
- Player presets -- save groups of players you play with regularly
- Random player order to keep things fair

### Scoring Input

- **Number pad** -- tap the number and a multiplier (Double / Triple) for fast entry
- **Interactive dartboard** -- tap directly on an SVG dartboard with enlarged touch zones for doubles and triples
- Undo / redo individual darts within a visit
- Bust detection -- the app automatically reverts invalid scores

### Checkout Suggestions (X01)

- When your remaining score is 170 or below, the app displays recommended finishing combinations
- Respects your chosen out rule (single-out or double-out)

### Statistics

- Per-game session stats: darts thrown, averages, highest visits
- All-time player statistics stored across sessions
- X01-specific tracking: legs played, best leg, 60+, 100+, 140+, and 180 visits

### Presets

- Save full game presets (players + game type + settings) for one-tap game setup
- Save and load player group presets separately

### Progressive Web App

- Install to your home screen on iOS and Android
- Offline support via service worker
- Standalone display mode -- looks and feels like a native app
- Responsive portrait layout optimized for phones and tablets
- Light and dark theme that follows your system preference

## No Server Required

Dart Game Counter is a **purely client-side application**. There is no backend, no cloud sync, and no external API calls. All data is persisted in your browser's IndexedDB. Simply open the app in any modern browser and start playing.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3.6 or later)

### Install & Run

```bash
# Install dependencies
bun install

# Start the development server
bun dev

# Build for production
bun run build

# Serve the production build
bun start
```

### Deploy

The production build outputs static files to `dist/`. Host them on any static file server or CDN -- no server-side runtime is needed. Popular free options include GitHub Pages, Netlify, and Vercel.

## Tech Stack

- **React 19** + **TypeScript** -- UI framework
- **MobX** -- reactive state management
- **Material UI (MUI)** -- component library
- **Tailwind CSS** -- utility-first styling
- **Bun** -- JavaScript runtime, bundler, and test runner
- **IndexedDB** (`idb`) -- local data persistence

## License

This project is open source. See the repository for license details.
