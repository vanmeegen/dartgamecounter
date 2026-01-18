# Dart Game Counter - Implementation Plan

## Current Status

### Completed

- [x] **E0 - Foundation**: Types, stores, theme, app shell
- [x] **E1 - Player Setup**: S11 (add/edit/remove), S12 (drag & drop), S13 (navigation)
- [x] **E2 - Game Setup**: S21 (variant selection), S22 (start game)
- [x] **E3 - Core Gameplay**: S33 (score display), S341 (button input), S35 (game loop), S36 (visit display), S37 (bust), S38 (winner)
- [x] **E4 - Checkout**: E41 (checkout calculator & display)
- [x] **E5 - Presets**: S14 (IndexedDB persistence), S15 (preset list), S23 (full game presets)
- [x] **E6 - PWA**: manifest.json, service worker, iOS meta tags

### Missing / Future

- [ ] **S342 - SVG Dartboard**: Clickable dartboard with enlarged double/triple zones
- [ ] **S16 - Multi-leg support**: Play multiple legs with player rotation
- [ ] **S32 - Game-specific presets**: Different preset types per game mode
- [ ] **S24 - Other game modes**: Cricket, Around the Clock, etc.

---

## Epics & Stories Overview

| Epic | Description  | Status |
| ---- | ------------ | ------ |
| E0   | Foundation   | Done   |
| E1   | Player Setup | Done   |
| E2   | Game Setup   | Done   |
| E3   | Play X01     | Done   |
| E4   | Checkout     | Done   |
| E5   | Presets      | Done   |
| E6   | PWA          | Done   |

---

## Completed Increments

### E0 - Foundation

- [x] TypeScript types (`src/types/`)
- [x] Game interface (`src/games/Game.ts`)
- [x] RootStore with React context
- [x] MUI dark theme provider
- [x] App shell with view routing

### E1 - Player Setup

- [x] S11: Add/remove/edit players
- [x] S12: Drag & drop reordering with @dnd-kit
- [x] S13: Navigation to game config

### E2 - Game Setup

- [x] S21: Select game variant (301/501, single/double out)
- [x] S22: Start game (creates X01Game instance)

### E3 - Core Gameplay

- [x] S33: Player score display (current large, others small)
- [x] S341: Button input (S/D/T/M modifiers, 1-20, 25, Bull)
- [x] S35: Game loop (modifier applies, subtract score)
- [x] S36: Visit display (3 darts with D/T/Bull prefixes)
- [x] S37: Bust detection (revert score, next player)
- [x] S38: Winner detection (dialog on checkout)

### E4 - Checkout Suggestions

- [x] E41: Checkout calculator (common table + brute force)
- [x] E41: CheckoutDisplay component (shows when score ≤ 170)

### E5 - Presets & Persistence

- [x] S14: PresetStore with IndexedDB (idb library)
- [x] S15: PresetList with one-click game start
- [x] S23: Full game presets (players + config)
- [x] SavePresetDialog for saving current setup

### E6 - PWA

- [x] manifest.json with app metadata
- [x] Service worker with cache-first strategy
- [x] iOS/Safari PWA meta tags
- [x] Build script copies PWA files to dist

---

## Architecture

### MobX Store Structure

```
RootStore
├── PlayerSetupStore    # Player list management
├── GameStore           # Game config + currentGame instance
├── PresetStore         # IndexedDB persistence
└── UIStore             # Current view, dialogs
```

### Folder Structure

```
src/
├── types/              # Type definitions
├── stores/             # MobX stores
├── games/              # X01Game implementation
├── components/
│   ├── player-setup/   # PlayerSetupView, PlayerList, etc.
│   ├── game-config/    # GameConfigView
│   ├── game-play/      # GamePlayView, PlayerScoreDisplay, etc.
│   ├── input/          # ButtonInput
│   ├── presets/        # PresetList, SavePresetDialog
│   └── dialogs/        # WinnerDialog
├── utils/              # Checkout calculator
├── hooks/              # useStores
└── theme/              # MUI theme
```

---

## Commits

1. `45d8adc` - Initial commit
2. `732222c` - Development tooling and React setup
3. `1b014d5` - MUI and dnd-kit dependencies
4. `50c2d4e` - E0: Foundation
5. `ee70701` - S11: Player setup
6. `3a9220e` - S12: Drag & drop
7. `3fc9dde` - S13: Navigation
8. `e27d9fd` - Fix: MobX reactivity
9. `16b2cae` - UX: Auto-focus
10. `c7119fa` - E2: Game Setup
11. `6267070` - E3: Core Gameplay
12. `4a05df8` - E4: Checkout calculator
13. `9866cde` - E5: Presets & Persistence
14. `a8309b3` - E6: PWA
15. `1c45f74` - Fix: Preset loading, S/D/T modifiers
