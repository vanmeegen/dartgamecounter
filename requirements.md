# Dart Game Counter - Requirements Document

Dart Game Counter is a Progressive Web App (PWA) to do the counting job on dart games.
It is built for mobile first so you can track your scores easily for multiple players.

## 1. Clarifications

The following clarifications were made during planning:

- **UI Framework**: MUI (Material UI) for components
- **Dartboard Input**: SVG-based implementation with enlarged touch targets for double/triple rings
- **Legs Configuration**: Best of N series (first player to win X legs wins the match)
- **Out Rules**: Single out = any number finishes, Double out = last dart must be a double
- **Max Checkout**: 170 points (mathematically correct: T20 + T20 + Bull)
- **PWA Scope**: Basic manifest + install prompt for initial release

## 2. Technical Architecture

### 2.1 Platform

- **Type**: Progressive Web App (PWA)
- **Target Devices**: iOS and Android smartphones
- **Browser Support**: Modern mobile browsers with Service Worker support
- **Installation**: Add to Home Screen functionality for app-like experience

### 2.2 Core Technologies

- **Frontend**: React + TypeScript + bun + MUI
- **State Management**: MobX
- **Synchronization**: no server needed, fully local running in browser

### 2.3 Infrastructure

- **Server Requirements**: None
- **Data Storage**: Local device storage (IndexedDB)
- **No Backend**: Pure Browser only app PWA without calling any services

# 3. Core Features

E meaning epics which are tackled in different fully functional increments
S meaning stories needed to complete an epic, tackled in a separate subagent each

### E1 Setup Player List and maintain legs

- S11: setup players entering names
- S12: reorder player list with d&d
- S13: select game after setting up players
- S14: optional: remember whole setup of players in local storage
- S15: optional: maintain a preset list to have one-click access to a fully set up game, order should be random
- S16: optional: play multiple legs with the same settings, rotate player order for each leg

### E2 Setup Dart Games

- S21: after player list select one of the Darts Game 501 and 301, choice of single or double out
- S22: start game after setup
- S23: be able to maintain game setup as a preset too (optionally, meaning I could only store players and names or a full game setup with legs and so on as preset, the preset knows what to load)
- S24: reserved for future game modes (Cricket, etc.)

### E3 Play x01

- S31 support 301 and 501 games as game specific setup
- S32 maintain game specific setup in presets too
- S33 show the player at turn on top in bigger font, the others smaller below
- S34 for entering scores there are 2 methods switchable via burger? menu entry or tab:
  - S341 a number field from 1 to 20, 25, Bull with modifier buttons 2x, 3x, M for missed
  - S342 a circular dart board with original colors and fields where you can click on, double and triple fields and bull are bigger than usual so you can easily hit them with your finger on a smartphone
- S35 Game Play Loop: The game play will be handled as follows:
  - pressing a modifier button will be applied to the next button multiplying the value accordingly
  - pressing a number field will directly subtract the value from the score left
- S36 Display Visit: for one visit consisting of throwing 3 darts the numbers will be displayed below the score of the player in 3 consecutive fields; a field will show D or T prefix for double and triple fields, e.g. D20 for double 20, Bull for Bull, M for missed
- S37 Bust: if score goes under 0 BUST will be displayed and its the next players turn
- S38 Finish: if the score goes exactly to 0 the leg is finished and the current player the winner, please show a winner dialog with fireworks
  - after pressing ok the next leg will be started
  - or back to setup of a new game if no leg left

### E4 Show Best Finish

- E41 If player has 170 or less points, there might be a finish available. Please calculate the best combination to exactly reach 0 and show it
- just do it brute force by iterating all possible numbers 1-20, double or triple of them and 25 for single bull and 50 for bull
- consider darts remaining in current visit when suggesting checkout
