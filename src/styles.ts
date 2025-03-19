/**
 * Styles for the Snake Game
 */
export const styles = `
  .snake-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    margin: 20px;
    position: relative;
  }
  
  .game-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .game-grid {
    display: grid;
    grid-gap: 1px;
    background-color: #ddd;
    border: 2px solid #333;
    margin-bottom: 20px;
  }
  
  .row {
    display: flex;
  }
  
  .cell {
    width: 20px;
    height: 20px;
    background-color: #f5f5f5;
  }
  
  .snake_head {
    background-color: #2c5530;
    border-radius: 4px;
    z-index: 2;
    box-shadow: 0 0 2px rgba(0,0,0,0.3);
  }
  
  .snake_body {
    background-color: #4CAF50;
    transition: all 0.1s linear;
    border-radius: 4px;
  }
  
  .food {
    background-color: #f44336;
    border-radius: 50%;
    z-index: 1;
    box-shadow: 0 0 4px rgba(244,67,54,0.5);
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .obstacle {
    background-color: #8B4513;
  }
  
  .game-controls {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s ease;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .game-over-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }
  
  .game-over-message {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .game-over-message h2 {
    margin-top: 0;
    color: #d9534f;
  }
  
  .game-over-message p {
    margin-bottom: 20px;
    font-size: 18px;
  }
  
  #restart-button {
    background-color: #5bc0de;
  }
  
  #restart-button:hover {
    background-color: #46b8da;
  }
  
  body {
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
  }

  #game-container {
    position: relative;
    margin: auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }

  #game-container > div:first-child {
    position: relative;
    border: 2px solid #333;
    background-color: #f8f8f8;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  }

  /* Grid lines for better visibility */
  #game-container > div:first-child::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  .high-scores {
    margin: 20px auto;
    max-width: 400px;
  }

  .high-scores table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  .high-scores th, .high-scores td {
    padding: 8px;
    border: 1px solid #ddd;
  }

  .high-scores th {
    background-color: #f5f5f5;
  }

  .high-scores tr:nth-child(1) {
    background-color: #fff9c4;
  }

  .controls-help {
    margin: 20px auto;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 4px;
    max-width: 300px;
  }

  .controls-help h3 {
    margin-top: 0;
  }

  .controls-help p {
    margin: 5px 0;
  }

  .game-over, .pause-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0,0,0,0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 8px;
    text-align: center;
  }

  .score-display {
    margin-bottom: 15px;
  }

  .score-display h2 {
    margin: 0;
    color: #2c5530;
  }

  .score-display p {
    margin: 5px 0;
    color: #666;
  }
`;

/**
 * Create a style element with the game styles and append it to the document head
 */
export function applyStyles(): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
