// Improved Type definitions for the Snake Game Model

// Invariant 1: Grid Structure
export type GridDimensions = {
  width: number;
  height: number;
};

// Invariant 12: Movement Direction
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Speed = -1 | 1 | 2 | 3 | 4 | 5;

// Invariant 14: Segment Location Uniqueness
export type Position = {
  x: number;
  y: number;
};

// Define distinct entity types instead of a union
// export type Empty = {
//   kind: 'EMPTY';
//   position: Position;
// };

// export type Head = {
//   kind: 'HEAD';
//   position: Position;
// };

// export type Body = {
//   kind: 'BODY';
//   position: Position;
// };

// export type Food = {
//   kind: 'FOOD';
//   position: Position;
//   value: number;
// };

export type Content = 'EMPTY' | 'HEAD' | 'BODY' | 'FOOD' | 'OBSTACLE'

// export type Obstacle = {
//   type: 'OBSTACLE';
//   position: Position;
// };

// A cell can contain one of these entity types
// export type Cell = EmptyCell | Head | Body | Food | Obstacle;
export interface Cell {
  content: Content
  position: Position;
  // type?: 'EMPTY' | 'HEAD' | 'BODY' | 'FOOD' | 'OBSTACLE';
}

export type Collision = 'NONE' | 'WALL' | 'BODY' | 'FOOD' | 'OBSTACLE'| 'SELF';

// Invariant 2 & 13 & 15: Snake Continuity, Head-Body Relationship, Head Uniqueness
export type Snake = {
  head: Position;
  body: Position[]; // Body segments excluding head
  direction: Direction; // Invariant 12: Movement Direction
  growing: boolean; // Flag to indicate if snake is currently growing after eating
};

// Invariant 9: Game State
export type GameStatus = 'RUNNING' | 'PAUSED' | 'GAME_OVER';

// For collision checking (Invariant 8)
export type CollisionResult = {
  hasCollision: boolean;
  collisionType: Collision;
};

// Combined Game State representing all invariants
export interface Model {
  // maxSpeed(arg0: number, maxSpeed: any): unknown;
  // minSpeed(arg0: number, minSpeed: any): unknown;
  // hasWalls: any;
  speedStep: number;
  // Invariant 1: Grid Structure
  grid: {
    dimensions: GridDimensions;
    cells: Cell[][]; // 2D grid of cells
  };
  
  // Invariant 2, 13, 15: Snake properties
  snake: Snake;
  
  // Invariant 6, 7: Food Existence and Placement
  food: Cell;
  
  // Invariant 9: Game State
  status: GameStatus;
  
  // Invariant 10: Score Progression
  score: number;
  
  // Additional properties for game variations
  speed: number; // Affects Invariant 3: Snake Movement
  obstacles: Position[]; // For maze variations
  isPaused: boolean; // Detailed pause state
  
  // For special variations
  // hasWalls: boolean; // Invariant 11: Boundary Enforcement
  allowWrapping: boolean; // Negation of Invariant 11 for wrapping mode
}

// Messages that can be dispatched to update the model
export type Msg = 
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'CHANGE_SPEED'; payload: Speed }
  | { type: 'MOVE_SNAKE' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESET_GAME' };

// Model initialization configuration
export type InitConfig = {
  gridWidth: number;
  gridHeight: number;
  initialSnakeLength: number;
  // hasWalls: boolean;
  speed: number;
  allowWrapping: boolean;
};

/**
 * Initialize the game state (model)
 * This ensures that all invariants are satisfied at the start of the game
 */
export function init(config: InitConfig): Model {
  const { gridWidth, gridHeight, initialSnakeLength,  allowWrapping } = config;
  
  // Create empty grid cells (Invariant 1)
  const cells: Cell[][] = Array(gridHeight).fill(null).map((_, y) => 
    Array(gridWidth).fill(null).map((_, x) => ({
      content: 'EMPTY',
      position: { x, y }
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
  cells[headY][headX] = {
    content: 'HEAD',
    position: { x: headX, y: headY }
  };
  
  body.forEach(segment => {
    if (segment.y >= 0 && segment.y < gridHeight && segment.x >= 0 && segment.x < gridWidth) {
      cells[segment.y][segment.x] = {
        content: 'BODY',
        position: segment
      };
    }
  });
  
  // Initialize snake (Invariants 2, 12, 13, 15)
  const snake: Snake = {
    head: { x: headX, y: headY },
    body,
    direction: 'LEFT', // Initial direction
    growing: false,
    
  };
  
  // Place food in an empty cell (Invariants 6, 7)
  let foodPosition = getRandomEmptyPosition(cells, gridWidth, gridHeight);
  cells[foodPosition.y][foodPosition.x] = {
    content: 'FOOD',
    position: foodPosition,
  };
  
  // Return complete initial state
  return {
    // maxSpeed: 5,
    // minSpeed: (arg0: number, minSpeed: 1) => { /* implementation */ },
    //hasWalls: false, // or true based on your game logic
    speedStep: 1,
    grid: {
      dimensions: { width: gridWidth, height: gridHeight },
      cells
    },
    snake,
    food: {
      content: 'FOOD',
      position: foodPosition,
    },
    status: 'RUNNING', // Invariant 9
    score: 0, // Invariant 10
    speed:1,
    obstacles: [], // No obstacles initially
    isPaused: false,
    // hasWalls, // Invariant 11
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
  
  // Check for head in the grid
  const { x: headX, y: headY } = head;
  const { width, height } = model.grid.dimensions;
  
  if (headX >= 0 && headX < width && headY >= 0 && headY < height) {
    const cell = model.grid.cells[headY][headX];
    if (cell.content !== 'HEAD') {
      console.error("Invariant 15 violated: Head position doesn't match grid");
      return false;
    }
  }
  
  // Check for unique segments
  const positions = new Map<string, string>();
  
  // Add head position
  positions.set(`${head.x},${head.y}`, 'HEAD');
  
  // Add body positions
  for (const segment of body) {
    const key = `${segment.x},${segment.y}`;
    if (positions.has(key)) {
      console.error("Invariant 14 violated: Multiple entities in the same cell");
      return false;
    }
    positions.set(key, 'BODY');
  }
  
  // Check food position
  const { position: foodPos } = model.food;
  const foodKey = `${foodPos.x},${foodPos.y}`;
  if (positions.has(foodKey)) {
    console.error("Invariant 7 violated: Food overlaps with another entity");
    return false;
  }
  
  // All invariants are satisfied
  return true;
}
