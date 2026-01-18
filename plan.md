# Dart Game Counter - Implementation Plan

## Epics & Stories Overview

| Epic | Description  | Stories                                  |
| ---- | ------------ | ---------------------------------------- |
| E0   | Foundation   | Types, Stores, Theme, App Shell          |
| E1   | Player Setup | S11, S12, S13 (S14-S16 optional)         |
| E2   | Game Setup   | S21, S22 (S23 optional)                  |
| E3   | Play X01     | S31, S33, S341, S342, S35, S36, S37, S38 |
| E4   | Checkout     | E41                                      |

---

## Increment 1: Foundation + E1 (Player Setup)

### E0 - Foundation (no user-facing features yet)

| Task | Description                                 |
| ---- | ------------------------------------------- |
| E0.1 | Define TypeScript types (`src/types/`)      |
| E0.2 | Create Game interface (`src/games/Game.ts`) |
| E0.3 | Create RootStore with React context         |
| E0.4 | Set up MUI theme provider                   |
| E0.5 | Create app shell with view routing          |

### E1 - Player Setup

| Story | Description                          | Acceptance Criteria                          |
| ----- | ------------------------------------ | -------------------------------------------- |
| S11   | Setup players entering names         | Add/remove players, edit names, min 1 player |
| S12   | Reorder player list with drag & drop | Drag handle, visual feedback, order persists |
| S13   | Navigate to game setup               | "Next" button enabled when ≥1 player         |

**Checkpoint**: User can add players, reorder them, and proceed to game setup.

---

## Increment 2: E2 (Game Setup)

| Story | Description         | Acceptance Criteria                             |
| ----- | ------------------- | ----------------------------------------------- |
| S21   | Select game variant | Choose 301/501, single/double out               |
| S22   | Start game          | "Start Game" creates X01Game, navigates to play |

**Checkpoint**: User can configure game and start playing.

---

## Increment 3: E3 (Core Gameplay)

| Story | Description          | Acceptance Criteria                                   |
| ----- | -------------------- | ----------------------------------------------------- |
| S31   | X01Game class        | Initialize 301/501, track scores per player           |
| S33   | Player score display | Current player large, others small                    |
| S341  | Button input         | Grid 1-20, 25, Bull + modifiers (2x, 3x, M)           |
| S35   | Game loop            | Modifier applies to next throw, subtract score        |
| S36   | Visit display        | Show 3 darts with D/T/Bull/M prefixes                 |
| S37   | Bust detection       | Score < 0 or invalid double-out → revert, next player |
| S38   | Finish detection     | Score = 0 → winner dialog with confetti               |

**Checkpoint**: Full game playable with button input.

---

## Increment 4: E3 (Dartboard Input)

| Story | Description   | Acceptance Criteria                              |
| ----- | ------------- | ------------------------------------------------ |
| S342  | SVG dartboard | Clickable segments, enlarged double/triple zones |

**Checkpoint**: Both input methods working.

---

## Increment 5: E4 (Checkout Suggestions)

| Story | Description         | Acceptance Criteria               |
| ----- | ------------------- | --------------------------------- |
| E41   | Checkout calculator | Show best finish when score ≤ 170 |

**Checkpoint**: Checkout suggestions displayed during gameplay.

---

## Increment 6: Optional Features (Later)

| Story | Description                           |
| ----- | ------------------------------------- |
| S14   | Remember player setup in IndexedDB    |
| S15   | Preset list with one-click game start |
| S16   | Multi-leg rotation                    |
| S23   | Full game presets                     |
| S32   | Game-specific presets                 |
| PWA   | manifest.json + service worker        |

---

## Architecture

### MobX Store Structure

```
RootStore
├── PlayerSetupStore    # E1: Player list management
├── GameStore           # E2+E3: Unified game management
│   └── currentGame     # Active game instance (X01Game)
├── PresetStore         # Optional: Presets + persistence
└── UIStore             # UI state (current view, input method)
```

### Game Interface (Extensible)

```typescript
interface Game {
  readonly type: GameType;
  readonly config: GameConfig;
  readonly state: GameState;

  recordThrow(dart: Dart): void;
  undoLastThrow(): void;
  isFinished(): boolean;
  getWinner(): Player | null;
}

class X01Game implements Game {
  // 301/501 logic, bust detection, checkout calc
}
```

### Folder Structure

```
src/
├── types/              # Type definitions
├── stores/             # MobX stores
├── games/              # Game implementations (X01Game)
├── components/
│   ├── player-setup/   # E1 components
│   ├── game-config/    # E2 components
│   ├── game-play/      # E3 components
│   ├── input/          # Button input
│   ├── dartboard/      # SVG dartboard
│   └── dialogs/        # Winner dialog
├── hooks/              # useStores
└── theme/              # MUI theme
```

---

## Workflow

### Per Story

1. Write failing tests (TDD)
2. Implement to make tests pass
3. `bun run build && bun test && bun run lint`
4. Commit with descriptive message

### Per Epic

1. Complete all stories
2. Verify build/test/lint pass
3. **Wait for user validation**

---

## Current Status

- [x] Dependencies installed (MUI, @dnd-kit)
- [ ] **Starting: Increment 1 (E0 + E1)**
