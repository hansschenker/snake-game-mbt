import { Model } from './model';

export function view(model: Model): void {
  const container = document.getElementById('game-container');
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Create game grid
  const gridElement = document.createElement('div');
  gridElement.style.position = 'relative';
  gridElement.style.width = `${model.grid.dimensions.width * 20}px`;
  gridElement.style.height = `${model.grid.dimensions.height * 20}px`;
  gridElement.style.border = '2px solid #333';
  gridElement.style.margin = '20px auto';
  gridElement.style.backgroundColor = '#f0f0f0';

  // Render snake head
  const headElement = document.createElement('div');
  headElement.className = 'snake_head';
  headElement.style.position = 'absolute';
  headElement.style.width = '18px';
  headElement.style.height = '18px';
  headElement.style.backgroundColor = 'darkgreen';
  headElement.style.border = '1px solid black';
  headElement.style.left = `${model.snake.head.x * 20}px`;
  headElement.style.top = `${model.snake.head.y * 20}px`;
  gridElement.appendChild(headElement);

  // Render snake body
  model.snake.body.forEach(segment => {
    const segmentElement = document.createElement('div');
    segmentElement.className = 'snake_body';
    segmentElement.style.position = 'absolute';
    segmentElement.style.width = '18px';
    segmentElement.style.height = '18px';
    segmentElement.style.backgroundColor = 'green';
    segmentElement.style.border = '1px solid darkgreen';
    segmentElement.style.left = `${segment.x * 20}px`;
    segmentElement.style.top = `${segment.y * 20}px`;
    gridElement.appendChild(segmentElement);
  });

  // Render food
  const foodElement = document.createElement('div');
  foodElement.className = 'food';
  foodElement.style.position = 'absolute';
  foodElement.style.width = '18px';
  foodElement.style.height = '18px';
  foodElement.style.backgroundColor = 'red';
  foodElement.style.border = '1px solid darkred';
  foodElement.style.borderRadius = '50%';
  foodElement.style.left = `${model.food.position.x * 20}px`;
  foodElement.style.top = `${model.food.position.y * 20}px`;
  gridElement.appendChild(foodElement);

  // Create game info panel
  const infoPanel = document.createElement('div');
  infoPanel.style.textAlign = 'center';
  infoPanel.style.marginBottom = '20px';
  infoPanel.innerHTML = `
    <div class="score-display">
      <h2>Score: ${model.score}</h2>
      <p>Speed: ${model.speed}</p>
    </div>
  `;

  // Create high scores panel
  const highScoresPanel = document.createElement('div');
  highScoresPanel.className = 'high-scores';
  highScoresPanel.innerHTML = `
    <h3>High Scores</h3>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Score</th>
          <th>Length</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${model.highScores.map((score, index) => `
          <tr>
            <td>#${index + 1}</td>
            <td>${score.score}</td>
            <td>${score.length}</td>
            <td>${score.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Create controls help
  const controlsHelp = document.createElement('div');
  controlsHelp.className = 'controls-help';
  controlsHelp.innerHTML = `
    <h3>Controls</h3>
    <p>Arrow Keys / WASD: Move</p>
    <p>P: Pause</p>
    <p>R: Restart</p>
    <p>U/D: Speed Up/Down</p>
  `;

  // Add game status if needed
  if (model.status === 'GAME_OVER') {
    const gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = '<h2>Game Over!</h2><p>Press R to restart</p>';
    container.appendChild(gameOver);
  } else if (model.isPaused) {
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'pause-overlay';
    pauseOverlay.innerHTML = '<h2>Paused</h2><p>Press P to resume</p>';
    container.appendChild(pauseOverlay);
  }

  // Append all elements
  container.appendChild(infoPanel);
  container.appendChild(gridElement);
  container.appendChild(highScoresPanel);
  container.appendChild(controlsHelp);
}
