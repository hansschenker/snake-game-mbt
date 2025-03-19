/**
 * Styles for the Snake Game
 * This module contains styling code to make the game visually appealing
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
  
  .cell {
    width: 20px;
    height: 20px;
    background-color: #f5f5f5;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
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
`;

/**
 * Create a style element with the game styles and append it to the document head
 */
export function applyStyles(): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
