// Type definitions for the Snake Game Model

// Invariant 1: Grid Structure
export type GridDimensions = {
  width: number;
  height: number;
};

// Invariant 12: Movement Direction
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Invariant 14: Segment Location Uniqueness
export type Position = {
  x: number;
  y: number;
};

// Helper type for comparisons
export type EntityId = 'SNAKE_HEAD' | 'SNAKE_BODY' | 'FOOD' | 'OBSTACLE' | 'EMPTY';

// Invariant 14: Segment Location Uniqueness
export type Cell = {
  position: Position;
  content: EntityId;
};

// Invariant 2 & 13 & 15: Snake Continuity, Head-Body Relationship, Head Uniqueness
export type Snake = {
  head: Position;
  body: Position[]; // Body segments excluding head
  direction: Direction; // Invariant 12: Movement Direction
  growing: boolean; // Flag to indicate if snake is currently growing after eating
};

// Invariant 6 & 7: Food Existence and Placement
export type Food = {
  position: Position;
  value: number; // Score value of the food
};

// Invariant 9: Game State
export type GameStatus = 'RUNNING' | 'PAUSED' | 'GAME_OVER';

// Combined Game State representing all invariants
export interface Model {
  // Invariant 1: Grid Structure
  grid: {
    dimensions: GridDimensions;
    cells: Cell[][]; // 2D grid of cells
  };
  
  // Invariant 2, 13, 15: Snake properties
  snake: Snake;
  
  // Invariant 6, 7: Food Existence and Placement
  food: Food;
  
  // Invariant 9: Game State
  status: GameStatus;
  
  // Invariant 10: Score Progression
  score: number;
  
  // Additional properties for game variations
  speed: number; // Affects Invariant 3: Snake Movement
  obstacles: Position[]; // For maze variations
  isPaused: boolean; // Detailed pause state
  
  // For special variations
  hasWalls: boolean; // Invariant 11: Boundary Enforcement
  allowWrapping: boolean; // Negation of Invariant 11 for wrapping mode
}

// Messages that can be dispatched to update the model
export type Msg = 
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'MOVE_SNAKE' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESET_GAME' };

// For collision checking (Invariant 8)
export type CollisionResult = {
  hasCollision: boolean;
  collisionType: 'NONE' | 'WALL' | 'SELF' | 'FOOD' | 'OBSTACLE';
};

// Model initialization configuration
export type InitConfig = {
  gridWidth: number;
  gridHeight: number;
  initialSnakeLength: number;
  hasWalls: boolean;
  speed: number;
  allowWrapping: boolean;
};

/**
 * Initialize the game state (model)
 * This ensures that all invariants are satisfied at the start of the game
 */
export function init(config: InitConfig): Model {
  const { gridWidth, gridHeight, initialSnakeLength, hasWalls, speed, allowWrapping } = config;
  
  // Create empty grid cells (Invariant 1)
  const cells: Cell[][] = Array(gridHeight).fill(null).map((_, y) => 
    Array(gridWidth).fill(null).map((_, x) => ({
      position: { x, y },
      content: 'EMPTY'
    }))
  );
  
  // Initialize snake in the left quarter of the grid (Invariants 2, 13, 15)
  const headX = Math.floor(gridWidth / 4);
  const headY = Math.floor(gridHeight / 2);
  
  // Initialize snake body (extending to the right from the head)
  const body: Position[] = [];
  for (let i = 1; i < initialSnakeLength; i++) {
    body.push({ x: headX + i, y: headY });
  }
  
  // Set snake elements in the grid
  cells[headY][headX].content = 'SNAKE_HEAD';
  body.forEach(segment => {
    if (segment.y >= 0 && segment.y < gridHeight && segment.x >= 0 && segment.x < gridWidth) {
      cells[segment.y][segment.x].content = 'SNAKE_BODY';
    }
  });
  
  // Initialize snake (Invariants 2, 12, 13, 15)
  const snake: Snake = {
    head: { x: headX, y: headY },
    body,
    direction: 'LEFT', // Initial direction
    growing: false
  };
  
  // Place food in an empty cell (Invariants 6, 7)
  let foodPosition = getRandomEmptyPosition(cells, gridWidth, gridHeight);
  cells[foodPosition.y][foodPosition.x].content = 'FOOD';
  
  // Return complete initial state
  return {
    grid: {
      dimensions: { width: gridWidth, height: gridHeight },
      cells
    },
    snake,
    food: {
      position: foodPosition,
      value: 1
    },
    status: 'RUNNING', // Invariant 9
    score: 0, // Invariant 10
    speed,
    obstacles: [], // No obstacles initially
    isPaused: false,
    hasWalls, // Invariant 11
    allowWrapping
  };
}

/**
 * Find a random empty position on the grid
 * Ensures food is placed in a valid location (Invariant 7)
 */
export function getRandomEmptyPosition(cells: Cell[][], width: number, height: number): Position {
  const emptyCells: Position[] = [];
  
  // Find all empty cells
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cells[y][x].content === 'EMPTY') {
        emptyCells.push({ x, y });
      }
    }
  }
  
  // Return a random empty cell
  if (emptyCells.length === 0) {
    throw new Error('No empty cells available');
  }
  
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

/**
 * Validate that the model satisfies all invariants
 * Used for testing to ensure the implementation maintains the required invariants
 */
export function validateGameState(model: Model): boolean {
  // Invariant 1: Grid Structure
  if (model.grid.dimensions.width <= 0 || model.grid.dimensions.height <= 0) {
    console.error("Invariant 1 violated: Invalid grid dimensions");
    return false;
  }
  
  // Invariant 2: Snake Continuity
  // Check if snake segments are continuous
  const { head, body } = model.snake;
  let lastSegment = head;
  for (const segment of body) {
    const dx = Math.abs(segment.x - lastSegment.x);
    const dy = Math.abs(segment.y - lastSegment.y);
    if (dx + dy !== 1) {
      console.error("Invariant 2 violated: Snake segments not continuous");
      return false;
    }
    lastSegment = segment;
  }
  
  // Invariant 3: Snake Movement (always in motion when game is running)
  // This is enforced by the game loop, not directly by the state
  
  // Invariant 4: Direction Consistency
  // This is enforced in the CHANGE_DIRECTION action handler
  
  // Invariant 5: Snake Growth
  // This is enforced in the MOVE_SNAKE action handler
  
  // Invariant 6: Food Existence
  if (model.status === 'RUNNING' && (!model.food || !model.food.position)) {
    console.error("Invariant 6 violated: No food on the grid");
    return false;
  }
  
  // Invariant 7: Food Placement
  if (model.food) {
    const { x, y } = model.food.position;
    
    // Food position is within grid bounds
    if (x < 0 || x >= model.grid.dimensions.width || 
        y < 0 || y >= model.grid.dimensions.height) {
      console.error("Invariant 7 violated: Food outside grid boundaries");
      return false;
    }
    
    // Food not on snake
    if ((x === head.x && y === head.y) || 
        body.some(segment => segment.x === x && segment.y === y)) {
      console.error("Invariant 7 violated: Food placed on snake");
      return false;
    }
    
    // Food not on obstacle
    if (model.obstacles.some(obs => obs.x === x && obs.y === y)) {
      console.error("Invariant 7 violated: Food placed on obstacle");
      return false;
    }
  }
  
  // Invariant 8: Collision Detection
  // Enforced by the MOVE_SNAKE action handler
  
  // Invariant 9: Game State
  if (!['RUNNING', 'PAUSED', 'GAME_OVER'].includes(model.status)) {
    console.error("Invariant 9 violated: Invalid game status");
    return false;
  }
  
  // Invariant 10: Score Progression
  // Enforced by the MOVE_SNAKE action handler
  
  // Invariant 11: Boundary Enforcement
  // Enforced by the MOVE_SNAKE action handler
  
  // Invariant 12: Movement Direction
  if (!['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(model.snake.direction)) {
    console.error("Invariant 12 violated: Invalid movement direction");
    return false;
  }
  
  // Invariant 13: Head-Body Relationship
  // Checked as part of Snake Continuity (Invariant 2)
  
  // Invariant 14: Segment Location Uniqueness
  // Check if multiple entities are in the same cell
  const entityPositions = new Map<string, EntityId>();
  
  // Add snake head position
  entityPositions.set(`${head.x},${head.y}`, 'SNAKE_HEAD');
  
  // Add snake body positions
  for (const segment of body) {
    const key = `${segment.x},${segment.y}`;
    if (entityPositions.has(key)) {
      console.error("Invariant 14 violated: Multiple entities in the same cell");
      return false;
    }
    entityPositions.set(key, 'SNAKE_BODY');
  }
  
  // Add food position
  if (model.food) {
    const { x, y } = model.food.position;
    const key = `${x},${y}`;
    if (entityPositions.has(key)) {
      console.error("Invariant 14 violated: Food overlaps with another entity");
      return false;
    }
    entityPositions.set(key, 'FOOD');
  }
  
  // Add obstacle positions
  for (const obstacle of model.obstacles) {
    const key = `${obstacle.x},${obstacle.y}`;
    if (entityPositions.has(key)) {
      console.error("Invariant 14 violated: Obstacle overlaps with another entity");
      return false;
    }
    entityPositions.set(key, 'OBSTACLE');
  }
  
  // Invariant 15: Snake Head Uniqueness
  // This is enforced by the data structure (there is only one head property)
  
  // All invariants are satisfied
  return true;
}