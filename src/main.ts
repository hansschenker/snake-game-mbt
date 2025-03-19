import { fromEvent, interval, merge, Subject, Observable, BehaviorSubject } from 'rxjs';
import { filter, map, scan, startWith, tap, throttleTime, catchError, switchMap } from 'rxjs/operators';

import { Msg, init, Model } from './model';
import { update } from './update';
import { view } from './view';
import { applyStyles } from './styles';

/**
 * Configuration for the game
 */
const gameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  initialSnakeLength: 3,
  hasWalls: true,
  speed: 3, // Cells per second
  allowWrapping: false
};

/**
 * Main entry point for the MVU architecture
 * Sets up the reactive streams and connects the Model, View, and Update functions
 */
function main() {
  // Create the initial model
  const initialModel = init(gameConfig);
  
  // Cleanup subject for managing subscriptions
  const destroy$ = new Subject<void>();
  
  // Reset subject for handling game restarts
  const reset$ = new Subject<void>();

  // Create a speed$ subject to handle speed changes
  const speed$ = new BehaviorSubject<number>(gameConfig.speed);

  // Create a stream for keyboard events with throttling
  const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    throttleTime(50), // Prevent event queue overflow
    filter(event => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'd', 'r', 'p', 'u', 'd'].includes(event.key)),
    map(event => {
      switch (event.key) {
        case 'r':
          return { type: 'RESET_GAME' } as Msg;    
        case 'p':
          return { type: 'TOGGLE_PAUSE' } as Msg;
        
        case 'u':
          return { type: 'CHANGE_SPEED', payload: +1 }  as Msg;
        
        case 'd':
          return { type: 'CHANGE_SPEED', payload: -1 }  as Msg;
        
        case 'ArrowUp':
          return { type: 'CHANGE_DIRECTION', payload: 'UP' } as Msg;
        
        case 'ArrowDown':
          return { type: 'CHANGE_DIRECTION', payload: 'DOWN' } as Msg;
        
        case 'ArrowLeft':
          return { type: 'CHANGE_DIRECTION', payload: 'LEFT' } as Msg;
        
        case 'ArrowRight':
          return { type: 'CHANGE_DIRECTION', payload: 'RIGHT' } as Msg;
        
        default:
          
      }
    }),
    filter((msg): msg is Msg => msg !== undefined)
  );
  
  // Create a stream for the game clock that responds to speed changes
  const tick$ = speed$.pipe(
    switchMap(speed => interval(1000 / speed)),
    map(() => ({ type: 'MOVE_SNAKE' } as Msg))
  );
  
  // Create a stream for custom events from UI
  const action$ = fromEvent<CustomEvent<Msg>>(document, 'game-action').pipe(
    map(event => event.detail)
  );
  
  // Combine all message sources
  const messages$ = merge(
    keydown$,
    tick$,
    action$
  );
  
  // Create the game state stream using scan (similar to Redux's reducer)
  const state$: Observable<Model> = messages$.pipe(
    startWith({ type: 'RESET_GAME' } as Msg),
    scan<Msg, Model>(update, initialModel),
    tap(model => {
      // Update speed when it changes
      if (speed$.value !== model.speed) {
        speed$.next(model.speed);
      }
      
      // Render the view
      const gameElement = document.getElementById('game-container');
      if (gameElement) {
        view(model);
      }
      
      // Handle game over state
      if (model.status === 'GAME_OVER') {
        console.log('Game Over! Press R to restart');
      }
    }),
    catchError(error => {
      console.error('Game error:', error);
      reset$.next();
      return messages$.pipe(
        scan<Msg, Model>(update, initialModel)
      );
    })
  );
  
  // Subscribe to start the game with error handling
  state$.subscribe(
    model => {
      if (model.status === 'GAME_OVER') {
        console.log('Game Over! Press R to restart');
      }
    },
    error => console.error('Fatal game error:', error)
  );

  // Cleanup function for removing subscriptions
  const cleanup = () => {
    destroy$.next();
    destroy$.complete();
    reset$.complete();
  };

  // Clean up only on page unload
  window.addEventListener('unload', cleanup);
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Apply styles
  applyStyles();
  
  // Create game container with proper styling
  const container = document.getElementById('game-container');
  if (container) {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.padding = '20px';
    container.style.backgroundColor = '#fff';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }
  
  // Start the game
  main();
});
