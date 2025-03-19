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
  const { grid, snake, hasWalls } = model;
  const { width, height } = grid.dimensions;
  
  // Check wall collision (Invariant 11) - only if walls are enabled
  if (hasWalls && (newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height)) {
    console.log('Wall collision detected:', {
      position: newHead,
      bounds: { width, height }
    });
    return { hasCollision: true, collisionType: 'WALL' };
  }
  
  // Check if the new position is within bounds
  if (newHead.y >= 0 && newHead.y < height && newHead.x >= 0 && newHead.x < width) {
    // Get the cell at the new head position
    const cellAtNewHead = grid.cells[newHead.y][newHead.x];
    
    // Check what type of entity is at that position
    switch (cellAtNewHead.type) {
      case 'BODY':
        // Only return collision if it's not the tail that's moving
        // This allows the snake to move forward properly
        if (snake.body.length > 1) {
          // Check if this is the last segment of the body (the tail)
          const tailPos = snake.body[snake.body.length - 1];
          
          // If it's not the tail, it's a self collision
          if (tailPos.x !== newHead.x || tailPos.y !== newHead.y) {
            console.log('Self collision detected:', {
              head: newHead,
              body: snake.body
            });
            return { hasCollision: true, collisionType: 'BODY' };
          }
        }
        break;
        
      case 'OBSTACLE':
        console.log('Obstacle collision detected');
        return { hasCollision: true, collisionType: 'OBSTACLE' };
        
      case 'FOOD':
        console.log('Food collision detected');
        return { hasCollision: true, collisionType: 'FOOD' };
    }
  }
  
  // No collision detected
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
  
  return newHead;
}

/**
 * Apply wrapping to a position if needed
 */
export function applyWrapping(position: Position, width: number, height: number): Position {
  const wrappedPosition = { ...position };
  
  if (wrappedPosition.x < 0) wrappedPosition.x = width - 1;
  else if (wrappedPosition.x >= width) wrappedPosition.x = 0;
  
  if (wrappedPosition.y < 0) wrappedPosition.y = height - 1;
  else if (wrappedPosition.y >= height) wrappedPosition.y = 0;
  
  return wrappedPosition;
}

/**
 * Update function for the MVU architecture with improved entity types
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
      
      // Calculate new head position based on current direction
      const { head, direction } = model.snake;
      let newHead = calculateNewHeadPosition(head, direction);
      
      // Handle wrapping if allowed
      if (model.allowWrapping) {
        const { width, height } = model.grid.dimensions;
        newHead = applyWrapping(newHead, width, height);
      }
      
      // Detect collisions
      const collision = detectCollision(model, newHead);
      
      // Handle wall, self, or obstacle collision
      if (collision.collisionType === 'WALL' || 
          collision.collisionType === 'BODY' || 
          collision.collisionType === 'OBSTACLE') {
        console.log('Game over due to collision:', collision.collisionType);
        newModel.status = 'GAME_OVER';
        return newModel;
      }
      
      // Handle food collision
      const ateFood = collision.collisionType === 'FOOD';
      
      // Move snake - prepare new body
      const newBody = [...model.snake.body];
      
      // Add old head to body
      newBody.unshift(head);
      
      // If not growing, remove tail
      if (!model.snake.growing && !ateFood) {
        newBody.pop();
      }
      
      // Update snake
      newModel.snake = {
        ...newModel.snake,
        head: newHead,
        body: newBody,
        growing: ateFood
      };
      
      // Reset the grid cells
      const { cells } = newModel.grid;
      const { width, height } = model.grid.dimensions;
      
      // First, set all cells where the snake was to empty
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (cells[y][x].type === 'HEAD' || cells[y][x].type === 'BODY') {
            cells[y][x] = {
              type: 'EMPTY',
              position: { x, y }
            };
          }
        }
      }
      
      // Place snake head on grid
      if (newHead.y >= 0 && newHead.y < height && newHead.x >= 0 && newHead.x < width) {
        cells[newHead.y][newHead.x] = {
          type: 'HEAD',
          position: newHead
        };
      }
      
      // Place snake body on grid
      for (const segment of newBody) {
        if (segment.y >= 0 && segment.y < height && segment.x >= 0 && segment.x < width) {
          cells[segment.y][segment.x] = {
            type: 'BODY',
            position: segment
          };
        }
      }
      
      // Handle food eating
      if (ateFood) {
        try {
          // Update score
          newModel.score += newModel.food.value;
          
          // Generate new food position
          const newFoodPosition = getRandomEmptyPosition(cells, width, height);
          
          // Update food
          newModel.food = {
            type: 'FOOD',
            position: newFoodPosition,
            value: 1
          };
          
          // Place new food on grid
          cells[newFoodPosition.y][newFoodPosition.x] = { ...newModel.food };
        } catch (error) {
          console.error('Error placing new food:', error);
          // Even if we can't place new food, game should continue
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
