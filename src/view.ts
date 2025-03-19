import { Model } from './model';

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

  // Render snake body
  model.snake.body.forEach(segment => {
    const segmentElement = document.createElement('div');
    segmentElement.style.position = 'absolute';
    segmentElement.style.width = '18px';
    segmentElement.style.height = '18px';
    segmentElement.style.backgroundColor = 'green';
    segmentElement.style.border = '1px solid darkgreen';
    segmentElement.style.left = `${segment.x * 20}px`;
    segmentElement.style.top = `${segment.y * 20}px`;
    gridElement.appendChild(segmentElement);
  });

  // Render snake head
  const headElement = document.createElement('div');
  headElement.style.position = 'absolute';
  headElement.style.width = '18px';
  headElement.style.height = '18px';
  headElement.style.backgroundColor = 'darkgreen';
  headElement.style.border = '1px solid black';
  headElement.style.left = `${model.snake.head.x * 20}px`;
  headElement.style.top = `${model.snake.head.y * 20}px`;
  gridElement.appendChild(headElement);

  // Render food
  const foodElement = document.createElement('div');
  foodElement.style.position = 'absolute';
  foodElement.style.width = '18px';
  foodElement.style.height = '18px';
  foodElement.style.backgroundColor = 'red';
  foodElement.style.border = '1px solid darkred';
  foodElement.style.borderRadius = '50%';
  foodElement.style.left = `${model.food.position.x * 20}px`;
  foodElement.style.top = `${model.food.position.y * 20}px`;
  gridElement.appendChild(foodElement);

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
}
