export interface State {
    delta: number,
    game: number[][];
    shipY: number;
    playerLives: number;
    isGameOver: boolean;
    score: number;
    invadersDirY: number,
    invaders: any[];
    invadersShoots: any[];
    shoots: any[];
    shootFrequency: number;
  }
  
  export interface Input {
    dlta: number, key: string
  }