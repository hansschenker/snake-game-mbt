# Snake Game MVU

A functional reactive implementation of the classic Snake Game using the Model-View-Update (MVU) architecture, TypeScript, and RxJS. This implementation follows functional programming principles and avoids classes in favor of a more functional approach.

## Features

- **Model-View-Update (MVU) Architecture**: Inspired by Elm, providing a clear separation of concerns
- **Reactive Programming**: Built with RxJS for handling reactive data streams
- **Functional Programming**: Pure functions, immutability, and functional composition
- **Model-Based Testing**: Comprehensive test suite using property-based testing with Fast-Check
- **Type Safety**: Fully typed with TypeScript

## Demo

[Click here to play the game!](https://your-github-username.github.io/snake-game-mvu/) (Update this link once deployed)

## Table of Contents

- [Installation](#installation)
- [Running the Game](#running-the-game)
- [Testing](#testing)
- [Game Controls](#game-controls)
- [Architecture](#architecture)
- [Model Invariants](#model-invariants)
- [Credits](#credits)
- [License](#license)

## Installation

1. Clone this repository
2. Install dependencies

```bash
npm install
```

## Running the Game

```bash
npm run dev
```

Then open your browser at http://localhost:5173

## Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Game Controls

- **Arrows keys** or **WASD**: Change snake direction
- **Pause/Resume**: Toggle game pause
- **Reset Game**: Restart the game

## Architecture

The project follows the Model-View-Update (MVU) architecture, inspired by Elm. This pattern provides a clean and predictable way to manage state changes:

- **Model**: Represents the complete game state
- **View**: Pure function that renders the Model to HTML
- **Update**: Pure function that produces a new Model based on the current Model and a message

Using RxJS, these components are connected in a reactive cycle, where user inputs and game ticks produce messages, which update the model, which is then rendered to the DOM.

## Model Invariants

This implementation maintains 15 critical invariants that ensure the game behaves correctly:

1. **Grid Structure Invariant**: The game grid always maintains its defined dimensions
2. **Snake Continuity Invariant**: The snake is always a continuous chain of connected segments
3. **Snake Movement Invariant**: The snake is always in motion when the game is running
4. **Direction Consistency Invariant**: The snake can only change direction by 90 degrees at a time
5. **Snake Growth Invariant**: The snake only grows when it consumes food
6. **Food Existence Invariant**: Exactly one food item exists on the grid at any time
7. **Food Placement Invariant**: Food only appears in empty cells
8. **Collision Detection Invariant**: The game detects and responds to collisions
9. **Game State Invariant**: The game is always in exactly one of these states: running, paused, or game over
10. **Score Progression Invariant**: The score only increases, never decreases
11. **Boundary Enforcement Invariant**: In standard mode, the snake cannot move beyond grid boundaries
12. **Movement Direction Invariant**: The snake only moves in one of four cardinal directions
13. **Head-Body Relationship Invariant**: The head leads the movement, all other segments follow
14. **Segment Location Uniqueness Invariant**: Each cell contains at most one entity at any time
15. **Snake Head Uniqueness Invariant**: There is always exactly one head segment in the snake

These invariants are verified through comprehensive model-based testing using the Fast-Check library.

## Credits

- This project was created with the help of [Claude.ai Sonnet](https://claude.ai/), which provided valuable guidance on implementing the MVU architecture and model-based testing.
- Inspired by the [Elm Architecture](https://guide.elm-lang.org/architecture/).
- Built with [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [RxJS](https://rxjs.dev/), and [Fast-Check](https://github.com/dubzzz/fast-check).

## License

MIT
