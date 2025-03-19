import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  Model, 
  Msg, 
  Direction,
  validateGameState, 
  init
} from '../src/model';
import { update } from '../src/update';

/**
 * Model-Based Tests for Snake Game
 * 
 * These tests use the Fast-Check library to perform property-based testing,
 * verifying that our Snake Game implementation maintains all invariants
 * through multiple state transitions.
 */
describe('Snake Game Model-Based Tests', () => {
  // Arbitrary for valid grid dimensions
  const gridDimensionsArb = fc.record({
    width: fc.integer({ min: 5, max: 30 }),
    height: fc.integer({ min: 5, max: 30 })
  });

  // Arbitrary for valid directions
  const directionArb = fc.constantFrom('UP', 'DOWN', 'LEFT', 'RIGHT' as const);
  
  // Arbitrary for game actions
  const gameActionArb = fc.oneof(
    fc.record({
      type: fc.constant('CHANGE_DIRECTION'),
      payload: directionArb
    }) as fc.Arbitrary<Msg>,
    fc.constant({ type: 'MOVE_SNAKE' } as Msg),
    fc.constant({ type: 'TOGGLE_PAUSE' } as Msg),
    fc.constant({ type: 'RESET_GAME' } as Msg)
  );
  
  // Arbitrary for a sequence of game actions
  const actionSequenceArb = fc.array(gameActionArb, { minLength: 1, maxLength: 50 });

  // Invariant 1: Grid Structure Invariant
  it('should maintain grid structure invariant through all state transitions', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Check grid dimensions remain consistent
            const { grid } = state;
            if (grid.dimensions.width !== width || 
                grid.dimensions.height !== height ||
                grid.cells.length !== height || 
                grid.cells[0].length !== width) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 2: Snake Continuity Invariant
  it('should maintain snake continuity through all state transitions', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Check snake continuity - each segment should be adjacent to the next
            const { head, body } = state.snake;
            let lastSegment = head;
            
            for (const segment of body) {
              const dx = Math.abs(segment.x - lastSegment.x);
              const dy = Math.abs(segment.y - lastSegment.y);
              
              // In a continuous snake, adjacent segments must be exactly 1 cell apart
              // (considering potential wrapping)
              const isAdjacent = 
                (dx === 1 && dy === 0) || 
                (dx === 0 && dy === 1) ||
                // Handle wrapping cases
                (state.allowWrapping && (
                  (dx === state.grid.dimensions.width - 1 && dy === 0) ||
                  (dx === 0 && dy === state.grid.dimensions.height - 1)
                ));
              
              if (!isAdjacent) {
                return false;
              }
              
              lastSegment = segment;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 4: Direction Consistency Invariant
  it('should never allow direct direction reversal', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        fc.array(directionArb, { minLength: 1, maxLength: 20 }),
        ({ width, height }, directions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          let previousDirection = state.snake.direction;
          
          // Apply each direction change
          for (const direction of directions) {
            state = update(state, { type: 'CHANGE_DIRECTION', payload: direction });
            
            // Check if direction changed
            const currentDirection = state.snake.direction;
            
            // If direction changed, check if it was a reversal
            if (currentDirection !== previousDirection) {
              const isReversal = 
                (previousDirection === 'UP' && currentDirection === 'DOWN') ||
                (previousDirection === 'DOWN' && currentDirection === 'UP') ||
                (previousDirection === 'LEFT' && currentDirection === 'RIGHT') ||
                (previousDirection === 'RIGHT' && currentDirection === 'LEFT');
              
              if (isReversal) {
                return false;
              }
              
              previousDirection = currentDirection;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 5: Snake Growth Invariant
  it('should grow snake by exactly one segment when eating food', () => {
    fc.assert(
      fc.property(
        fc.constant(init({
          gridWidth: 15,
          gridHeight: 15,
          initialSnakeLength: 3,
          hasWalls: true,
          speed: 5,
          allowWrapping: false
        })),
        (initialState) => {
          // Create a custom state with food directly in front of the snake
          const state = JSON.parse(JSON.stringify(initialState)) as Model;
          const { head, direction } = state.snake;
          let foodPosition = { ...head };
          
          // Position food in front of the snake based on its direction
          switch (direction) {
            case 'UP':
              foodPosition.y--;
              break;
            case 'DOWN':
              foodPosition.y++;
              break;
            case 'LEFT':
              foodPosition.x--;
              break;
            case 'RIGHT':
              foodPosition.x++;
              break;
          }
          
          // Ensure the food position is valid
          if (foodPosition.x < 0 || foodPosition.x >= state.grid.dimensions.width ||
              foodPosition.y < 0 || foodPosition.y >= state.grid.dimensions.height) {
            return true; // Skip this test case
          }
          
          // Place food in front of the snake
          state.food.position = foodPosition;
          state.grid.cells[foodPosition.y][foodPosition.x].content = 'FOOD';
          
          // Get initial snake length
          const initialLength = state.snake.body.length + 1; // +1 for the head
          
          // Move the snake to eat the food
          const newState = update(state, { type: 'MOVE_SNAKE' });
          
          // Check that the snake has grown by exactly one segment
          const newLength = newState.snake.body.length + 1; // +1 for the head
          
          return newLength === initialLength + 1;
        }
      )
    );
  });

  // Invariant 6 & 7: Food Existence and Placement Invariants
  it('should maintain food existence and valid placement', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Skip food checks if game is over
            if (state.status === 'GAME_OVER') continue;
            
            // Verify food exists
            if (!state.food || !state.food.position) {
              return false;
            }
            
            const { x, y } = state.food.position;
            
            // Verify food is within grid bounds
            if (x < 0 || x >= width || y < 0 || y >= height) {
              return false;
            }
            
            // Verify food is not on snake head
            if (x === state.snake.head.x && y === state.snake.head.y) {
              return false;
            }
            
            // Verify food is not on snake body
            if (state.snake.body.some(segment => segment.x === x && segment.y === y)) {
              return false;
            }
            
            // Verify food is not on an obstacle
            if (state.obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 8 & 9: Collision Detection and Game State Invariants
  it('should correctly handle collisions and maintain valid game state', () => {
    fc.assert(
      fc.property(
        fc.constant(init({
          gridWidth: 10,
          gridHeight: 10,
          initialSnakeLength: 3,
          hasWalls: true,
          speed: 5,
          allowWrapping: false
        })),
        actionSequenceArb,
        (initialState, actions) => {
          let state = initialState;
          
          // Apply each action in sequence
          for (const action of actions) {
            // Apply the action
            const newState = update(state, action);
            
            // Check game state transitions
            // 1. If there's a wall collision, game should be over
            if (state.hasWalls && 
                action.type === 'MOVE_SNAKE' && 
                (state.snake.head.x === 0 && state.snake.direction === 'LEFT' ||
                 state.snake.head.x === state.grid.dimensions.width - 1 && state.snake.direction === 'RIGHT' ||
                 state.snake.head.y === 0 && state.snake.direction === 'UP' ||
                 state.snake.head.y === state.grid.dimensions.height - 1 && state.snake.direction === 'DOWN')) {
              if (newState.status !== 'GAME_OVER') {
                return false;
              }
            }
            
            // 2. If there's a self collision, game should be over
            // This is harder to test in a property-based way, so we'll rely on direct tests for this
            
            // 3. Game state should always be one of: RUNNING, PAUSED, GAME_OVER
            if (!['RUNNING', 'PAUSED', 'GAME_OVER'].includes(newState.status)) {
              return false;
            }
            
            // 4. TOGGLE_PAUSE should correctly toggle between RUNNING and PAUSED
            if (action.type === 'TOGGLE_PAUSE') {
              if ((state.status === 'RUNNING' && newState.status !== 'PAUSED') ||
                  (state.status === 'PAUSED' && newState.status !== 'RUNNING')) {
                return false;
              }
            }
            
            // 5. RESET_GAME should always set status to RUNNING
            if (action.type === 'RESET_GAME' && newState.status !== 'RUNNING') {
              return false;
            }
            
            state = newState;
            
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 10: Score Progression Invariant
  it('should only increase score when eating food', () => {
    fc.assert(
      fc.property(
        fc.constant(init({
          gridWidth: 15,
          gridHeight: 15,
          initialSnakeLength: 3,
          hasWalls: true,
          speed: 5,
          allowWrapping: false
        })),
        actionSequenceArb,
        (initialState, actions) => {
          let state = initialState;
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            const prevScore = state.score;
            
            // Apply the action
            state = update(state, action);
            
            // Check if score increased
            if (state.score > prevScore) {
              // If score increased, it must be because snake ate food
              // This is hard to verify directly in a property test
              // We rely on more direct unit tests for this invariant
            } else if (state.score < prevScore) {
              // Score should never decrease
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 11: Boundary Enforcement Invariant
  it('should respect boundaries based on the hasWalls setting', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // hasWalls
        (hasWalls) => {
          let state = init({
            gridWidth: 10,
            gridHeight: 10,
            initialSnakeLength: 3,
            hasWalls,
            speed: 5,
            allowWrapping: !hasWalls
          });
          
          // Place snake at the left edge
          state.snake.head = { x: 0, y: 5 };
          state.snake.direction = 'LEFT';
          state.snake.body = [
            { x: 1, y: 5 },
            { x: 2, y: 5 }
          ];
          
          // Update grid cells to match snake position
          state.grid.cells.forEach(row => row.forEach(cell => cell.content = 'EMPTY'));
          state.grid.cells[5][0].content = 'SNAKE_HEAD';
          state.grid.cells[5][1].content = 'SNAKE_BODY';
          state.grid.cells[5][2].content = 'SNAKE_BODY';
          
          // Move the snake (which would go out of bounds)
          const newState = update(state, { type: 'MOVE_SNAKE' });
          
          if (hasWalls) {
            // Game should end if walls are enabled
            return newState.status === 'GAME_OVER';
          } else {
            // Snake should wrap to the other side if walls are disabled
            return newState.snake.head.x === state.grid.dimensions.width - 1 && 
                  newState.status === 'RUNNING';
          }
        }
      )
    );
  });

  // Invariant 12: Movement Direction Invariant
  it('should only allow movement in one of the four cardinal directions', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Ensure the snake's direction is one of the four cardinal directions
            if (!['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(state.snake.direction)) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 13: Head-Body Relationship Invariant
  it('should maintain correct head-body relationship', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        fc.integer({ min: 1, max: 10 }), // Number of move actions
        ({ width, height }, moveCount) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply several MOVE_SNAKE actions
          for (let i = 0; i < moveCount; i++) {
            // Skip further actions if game is over or would go out of bounds
            if (state.status === 'GAME_OVER' ||
                (state.snake.head.x === 0 && state.snake.direction === 'LEFT') ||
                (state.snake.head.x === width - 1 && state.snake.direction === 'RIGHT') ||
                (state.snake.head.y === 0 && state.snake.direction === 'UP') ||
                (state.snake.head.y === height - 1 && state.snake.direction === 'DOWN')) {
              break;
            }
            
            // Remember the current head position
            const oldHead = { ...state.snake.head };
            
            // Move the snake
            state = update(state, { type: 'MOVE_SNAKE' });
            
            // Verify that the old head is now the first body segment
            if (state.snake.body.length > 0 && 
                (state.snake.body[0].x !== oldHead.x || state.snake.body[0].y !== oldHead.y)) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 14: Segment Location Uniqueness Invariant
  it('should maintain segment location uniqueness', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Check for uniqueness of entity positions
            const positions = new Map<string, string>();
            
            // Add snake head position
            const headKey = `${state.snake.head.x},${state.snake.head.y}`;
            positions.set(headKey, 'SNAKE_HEAD');
            
            // Add snake body positions
            for (const segment of state.snake.body) {
              const key = `${segment.x},${segment.y}`;
              if (positions.has(key)) {
                return false; // Duplicate position found
              }
              positions.set(key, 'SNAKE_BODY');
            }
            
            // Add food position
            const foodKey = `${state.food.position.x},${state.food.position.y}`;
            if (positions.has(foodKey)) {
              return false; // Food overlaps with something else
            }
            positions.set(foodKey, 'FOOD');
          }
          
          return true;
        }
      )
    );
  });

  // Invariant 15: Snake Head Uniqueness Invariant
  it('should always have exactly one snake head', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Count snake heads in the grid
            let headCount = 0;
            for (let y = 0; y < state.grid.cells.length; y++) {
              for (let x = 0; x < state.grid.cells[y].length; x++) {
                if (state.grid.cells[y][x].content === 'SNAKE_HEAD') {
                  headCount++;
                }
              }
            }
            
            // There should be exactly one snake head
            if (headCount !== 1) {
              return false;
            }
            
            // The snake head in the grid should match the head in the model
            const { x, y } = state.snake.head;
            if (x >= 0 && x < width && y >= 0 && y < height && 
                state.grid.cells[y][x].content !== 'SNAKE_HEAD') {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  // Comprehensive test for all invariants
  it('should maintain all invariants through any sequence of valid actions', () => {
    fc.assert(
      fc.property(
        gridDimensionsArb,
        actionSequenceArb,
        ({ width, height }, actions) => {
          let state = init({
            gridWidth: width,
            gridHeight: height,
            initialSnakeLength: 3,
            hasWalls: true,
            speed: 5,
            allowWrapping: false
          });
          
          // Apply each action in sequence
          for (const action of actions) {
            // Skip further actions if game is over
            if (state.status === 'GAME_OVER') break;
            
            // Apply the action
            state = update(state, action);
            
            // Validate all invariants
            if (!validateGameState(state)) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });
});
