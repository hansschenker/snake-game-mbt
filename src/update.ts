import { 
    Model, 
    Msg, 
    Position, 
    CollisionResult, 
    Direction,
    init,
    getRandomEmptyPosition
  } from './model';
  
  /**
   * Detect collision between snake head and other entities
   * Implements Invariant 8: Collision Detection
   */
  export function detectCollision(model: Model, newHead: Position): CollisionResult {
    const { grid, snake, food, obstacles, hasWalls } = model;
    const { width, height } = grid.dimensions;
    
    // Check wall collision (Invariant 11)
    if (newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height) {
      console.log('Wall collision detected:', {
        position: newHead,
        bounds: { width, height }
      });
      return { hasCollision: true, collisionType: 'WALL' };
    }
    
    // Check self collision (Invariant 2)
    if (snake.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      console.log('Self collision detected:', {
        head: newHead,
        body: snake.body
      });
      return { hasCollision: true, collisionType: 'SELF' };
    }
    
    // Check obstacle collision
    if (obstacles.some(obstacle => obstacle.x === newHead.x && obstacle.y === newHead.y)) {
      console.log('Obstacle collision detected:', {
        position: newHead,
        obstacles
      });
      return { hasCollision: true, collisionType: 'OBSTACLE' };
    }
    
    // Check food collision (Invariants 5, 6, 7)
    if (food.position.x === newHead.x && food.position.y === newHead.y) {
      console.log('Food collision detected');
      return { hasCollision: true, collisionType: 'FOOD' };
    }
    
    // No collision
    return { hasCollision: false, collisionType: 'NONE' };
  }
  
  /**
   * Check if a direction change is valid (Invariant 4)
   * Cannot reverse direction (e.g., LEFT -> RIGHT or UP -> DOWN)
   */
  export function isValidDirectionChange(
    currentDirection: Direction, 
    newDirection: Direction
  ): boolean {
    return !(
      (currentDirection === 'UP' && newDirection === 'DOWN') ||
      (currentDirection === 'DOWN' && newDirection === 'UP') ||
      (currentDirection === 'LEFT' && newDirection === 'RIGHT') ||
      (currentDirection === 'RIGHT' && newDirection === 'LEFT')
    );
  }
  
  /**
   * Calculate new head position based on current direction
   */
  export function calculateNewHeadPosition(position: Position, direction: Direction): Position {
    const newHead: Position = { ...position };
    
    switch (direction) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }
    
    // Debug new position
    console.log('New head position:', newHead, 'Direction:', direction);
    return newHead;
  }
  
  /**
   * Apply wrapping to a position if needed
   */
  export function applyWrapping(position: Position, width: number, height: number): Position {
    const wrappedPosition = { ...position };
    
    if (wrappedPosition.x < 0) wrappedPosition.x = width - 1;
    if (wrappedPosition.x >= width) wrappedPosition.x = 0;
    if (wrappedPosition.y < 0) wrappedPosition.y = height - 1;
    if (wrappedPosition.y >= height) wrappedPosition.y = 0;
    
    return wrappedPosition;
  }
  
  /**
   * Update function for the MVU architecture
   * Takes the current model and a message, returns updated model
   * This is a pure function that enforces all invariants
   */
  export function update(model: Model, msg: Msg): Model {
    // Create a deep copy to maintain immutability
    const newModel = JSON.parse(JSON.stringify(model)) as Model;
    
    // If game is over, only respond to RESET_GAME
    if (model.status === 'GAME_OVER' && msg.type !== 'RESET_GAME') {
      return model;
    }
    
    switch (msg.type) {
      case 'CHANGE_DIRECTION': {
        // Invariant 4: Direction Consistency
        const newDirection = msg.payload;
        const currentDirection = model.snake.direction;
        
        // Cannot reverse direction directly
        if (!isValidDirectionChange(currentDirection, newDirection)) {
          return model; // Return unchanged model
        }
        
        newModel.snake.direction = newDirection;
        return newModel;
      }
      
      case 'MOVE_SNAKE': {
        // Skip if paused
        if (model.isPaused || model.status === 'PAUSED') {
          return model;
        }
        
        // Invariant 3: Snake Movement
        // Calculate new head position based on current direction
        const { head, direction } = model.snake;
        let newHead = calculateNewHeadPosition(head, direction);
        
        // Handle wrapping if allowed (affects Invariant 11)
        if (model.allowWrapping) {
          const { width, height } = model.grid.dimensions;
          newHead = applyWrapping(newHead, width, height);
        }
        
        // Detect collisions (Invariant 8)
        const collision = detectCollision(model, newHead);
        
        // Handle wall or self collision
        if (collision.collisionType === 'WALL' || collision.collisionType === 'SELF' || 
            collision.collisionType === 'OBSTACLE') {
          console.log('Game over due to collision:', collision.collisionType);
          newModel.status = 'GAME_OVER'; // Invariant 9
          return newModel;
        }
        
        // Handle food collision (Invariants 5, 6, 7, 10)
        const ateFood = collision.collisionType === 'FOOD';
        
        // Move snake (Invariants 2, 13, 15)
        // Copy current head to beginning of body
        const newBody = [head, ...model.snake.body];
        
        // If not growing, remove tail (Invariant 5)
        if (!model.snake.growing && !ateFood) {
          newBody.pop();
        }
        
        // Update snake
        newModel.snake = {
          ...newModel.snake,
          head: newHead,
          body: newBody,
          growing: ateFood // Set growing flag if food eaten (Invariant 5)
        };
        
        // Update grid cells (Invariant 14)
        // Clear old snake positions
        const { cells } = newModel.grid;
        for (let y = 0; y < cells.length; y++) {
          for (let x = 0; x < cells[y].length; x++) {
            if (cells[y][x].content === 'SNAKE_HEAD' || cells[y][x].content === 'SNAKE_BODY') {
              cells[y][x].content = 'EMPTY';
            }
          }
        }
        
        // Place snake head on grid (Invariants 13, 14, 15)
        cells[newHead.y][newHead.x].content = 'SNAKE_HEAD';
        
        // Place snake body on grid (Invariants 2, 14)
        for (const segment of newModel.snake.body) {
          cells[segment.y][segment.x].content = 'SNAKE_BODY';
        }
        
        // Handle food eating and placement (Invariants 6, 7)
        if (ateFood) {
          try {
            // Update score (Invariant 10)
            newModel.score += newModel.food.value;
            
            // Generate new food position
            const newFoodPosition = getRandomEmptyPosition(cells, model.grid.dimensions.width, model.grid.dimensions.height);
            
            // Update food
            newModel.food = {
              position: newFoodPosition,
              value: 1
            };
            
            // Place new food on grid
            cells[newFoodPosition.y][newFoodPosition.x].content = 'FOOD';
          } catch (error) {
            console.error('Error placing new food:', error);
          }
        }
        
        return newModel;
      }
      
      case 'TOGGLE_PAUSE': {
        newModel.isPaused = !model.isPaused;
        newModel.status = newModel.isPaused ? 'PAUSED' : 'RUNNING';
        return newModel;
      }
      
      case 'RESET_GAME': {
        return init({
          gridWidth: model.grid.dimensions.width,
          gridHeight: model.grid.dimensions.height,
          initialSnakeLength: 3,
          hasWalls: model.hasWalls,
          speed: model.speed,
          allowWrapping: model.allowWrapping
        });
      }
      
      default:
        return model;
    }
  }
