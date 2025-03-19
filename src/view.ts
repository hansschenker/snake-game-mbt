import { Model } from './model';

/**
 * Render the game state to the DOM
 * This function takes the current model and updates the DOM to reflect it
 */
export function view(model: Model) {
  const gameElement = document.getElementById('game-container');
  if (!gameElement) return;

  // Clear the previous state
  gameElement.innerHTML = '';

  // Create grid container with proper boundaries
  const gridElement = document.createElement('div');
  gridElement.style.position = 'relative';
  gridElement.style.width = `${model.grid.dimensions.width * 20}px`;
  gridElement.style.height = `${model.grid.dimensions.height * 20}px`;
  gridElement.style.border = '2px solid #333';
  gridElement.style.backgroundColor = '#f0f0f0';
  gameElement.appendChild(gridElement);

  // Render all game entities by iterating through the grid
  for (let y = 0; y < model.grid.dimensions.height; y++) {
    for (let x = 0; x < model.grid.dimensions.width; x++) {
      const cell = model.grid.cells[y][x];
      
      // Skip empty cells
      if (cell.type === 'EMPTY') continue;
      
      // Create element for this entity
      const entityElement = document.createElement('div');
      entityElement.style.position = 'absolute';
      entityElement.style.width = '18px';
      entityElement.style.height = '18px';
      entityElement.style.left = `${x * 20}px`;
      entityElement.style.top = `${y * 20}px`;
      
      // Style based on entity type
      switch (cell.type) {
        case 'HEAD':
          entityElement.style.backgroundColor = 'darkgreen';
          entityElement.style.border = '1px solid black';
          entityElement.style.zIndex = '2';
          break;
          
        case 'BODY':
          entityElement.style.backgroundColor = 'green';
          entityElement.style.border = '1px solid darkgreen';
          break;
          
        case 'FOOD':
          entityElement.style.backgroundColor = 'red';
          entityElement.style.border = '1px solid darkred';
          entityElement.style.borderRadius = '50%';
          break;
          
        case 'OBSTACLE':
          entityElement.style.backgroundColor = 'brown';
          entityElement.style.border = '1px solid #333';
          break;
      }
      
      gridElement.appendChild(entityElement);
    }
  }

  // Render score
  const scoreElement = document.createElement('div');
  scoreElement.style.marginTop = '10px';
  scoreElement.style.fontSize = '20px';
  scoreElement.textContent = `Score: ${model.score}`;
  gameElement.appendChild(scoreElement);

  // Show game over message
  if (model.status === 'GAME_OVER') {
    const gameOverElement = document.createElement('div');
    gameOverElement.style.marginTop = '10px';
    gameOverElement.style.color = 'red';
    gameOverElement.style.fontSize = '24px';
    gameOverElement.textContent = 'Game Over! Press R to restart';
    gameElement.appendChild(gameOverElement);
  }
  
  // Show pause message
  if (model.status === 'PAUSED') {
    const pauseElement = document.createElement('div');
    pauseElement.style.position = 'absolute';
    pauseElement.style.top = '50%';
    pauseElement.style.left = '50%';
    pauseElement.style.transform = 'translate(-50%, -50%)';
    pauseElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
    pauseElement.style.color = 'white';
    pauseElement.style.padding = '10px 20px';
    pauseElement.style.borderRadius = '4px';
    pauseElement.style.fontSize = '24px';
    pauseElement.textContent = 'PAUSED';
    gridElement.appendChild(pauseElement);
  }
  
  // Add instructions
  const instructionsElement = document.createElement('div');
  instructionsElement.style.marginTop = '10px';
  instructionsElement.style.fontSize = '14px';
  instructionsElement.innerHTML = `
    <p>Controls: Arrow keys or WASD to move | P to pause | R to restart</p>
  `;
  gameElement.appendChild(instructionsElement);
}
