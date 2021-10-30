import { fromEvent,interval,Observable } from 'rxjs'; 
import { map, scan, tap, startWith, withLatestFrom, takeUntil, repeat } from 'rxjs/operators';

const empty = 0, player = 1, invader = 2 ,  shot = 3, noOfInvadersRows = 6;


interface State {
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

interface Input {
  dlta: number, key: string
}

const createElem = col => {
  const elem = document.createElement('div');
  elem.classList.add('board');
  elem.style.display = 'inline-block';
  elem.style.marginLeft = '10px';
  elem.style.height = '6px';
  elem.style.width = '6px';
  elem.style['background-color'] =
    col === empty
      ? 'white'
      : (col === player
        ? 'cornflowerblue'
        : col === invader
          ? 'gray'
          : 'silver');
  elem.style['border-radius'] = '90%';
  return elem;
}

const paint = (game: number[][], playerLives: number, score: number, isGameOver: boolean) => {
  document.body.innerHTML = '';
  document.body.innerHTML += `Score: ${score} Lives: ${playerLives}`;

  if (isGameOver) {
    document.body.innerHTML += ' GAME OVER!';
    return;
  }

  game.forEach(row => {
    const rowContainer = document.createElement('div');
    row.forEach(col => rowContainer.appendChild(createElem(col)));
    document.body.appendChild(rowContainer);
  });

};
const gameObject = (x, y) => ({ x: x, y: y });
const gameSize = 20;
const clearGame = () => Array(gameSize).fill(empty).map(e => Array(gameSize).fill(empty));

const createInvaders = () => Array.from(Array(noOfInvadersRows).keys())
  .reduce((invds, row) => [...invds, ...createRowOfInvaders(row)], [])
const createRowOfInvaders = row => Array.from(Array(gameSize / 2).keys())
  .filter(e => row % 2 === 0 ? e % 2 === 0 : e % 2 !== 0)
  .map(e => gameObject(row, e + 4));

const initialState: State = {
    delta: 0,
    game: clearGame(),
    shipY: 10,
    playerLives: 3,
    isGameOver: false,
    score: 0,
    invadersDirY: 1,
    invaders: createInvaders(),
    invadersShoots: [],
    shoots: [],
    shootFrequency: 20
  };
  
const invadersDirection = (state: State): number =>
  state.invaders.length && state.invaders[0].y <= 0
    ? 1
    : (state.invaders.length && state.invaders[state.invaders.length - 1].y >= gameSize - 1
      ? -1
      : state.invadersDirY);

const drawGame = (state: State): number[][] => (
  keepShipWithinGame(state),
  state.game = clearGame(),
  state.game[state.game.length - 1][state.shipY] = player,
  state.invaders.forEach(i => state.game[i.x][i.y] = invader),
  state.invadersShoots.forEach(s => state.game[s.x][s.y] = shot),
  state.shoots.forEach(s => state.game[s.x][s.y] = shot),
  state.game
);

const addInvaderShoot = state => (randomInvader => gameObject(randomInvader.x, randomInvader.y))
  (state.invaders[Math.floor(Math.random() * state.invaders.length)]);

const collision = (e1, e2) => e1.x === e2.x && e1.y === e2.y;
const filterOutCollisions = (c1: any[], c2: any[]): any[] =>
  c1.filter(e1 => !c2.find(e2 => collision(e1, e2)));
const updateScore = (state: State): number =>
  state.shoots.find(s => state.invaders.find(i => collision(s, i))) ? state.score + 1 : state.score;

const updateState = (state: State): State => ({
  delta: state.delta,
  game: drawGame(state),
  shipY: state.shipY,
  playerLives: state.invadersShoots.some(e => e.x === gameSize - 1 && e.y === state.shipY)
    ? state.playerLives - 1
    : state.playerLives,
  isGameOver: state.playerLives <= 0,
  score: updateScore(state),
  invadersDirY: invadersDirection(state),
  invaders: (!state.invaders.length
    ? createInvaders()
    : filterOutCollisions(state.invaders, state.shoots)
      .map(i => state.delta % 10 === 0
        ? gameObject(
          i.x + (state.delta % (state.shootFrequency + 10) === 0 ? 1 : 0),
          i.y + state.invadersDirY)
        : i)),
  invadersShoots: (
    state.invadersShoots = state.delta % state.shootFrequency === 0
      ? [...state.invadersShoots, addInvaderShoot(state)]
      : state.invadersShoots,
    state.invadersShoots
      .filter(e => e.x < gameSize - 1)
      .map(e => gameObject(e.x + 1, e.y))
  ),
  shoots: filterOutCollisions(state.shoots, state.invaders)
    .filter(e => e.x > 0)
    .map(e => gameObject(e.x - 1, e.y)),
  shootFrequency: !state.invaders.length ? state.shootFrequency - 5 : state.shootFrequency
});

const keepShipWithinGame = (state: State): number => (
  state.shipY = state.shipY < 0 ? 0 : state.shipY,
  state.shipY = state.shipY >= gameSize - 1 ? gameSize - 1 : state.shipY
);

const updateShipY = (state: State, input: Input): number =>
  input.key !== 'ArrowLeft' && input.key !== 'ArrowRight'
    ? state.shipY
    : (state.shipY -= input.key === 'ArrowLeft' ? 1 : -1);

const addShots = (state: State, input: Input) =>
  state.shoots = input.key === 'Space'
    ? [...state.shoots, gameObject(gameSize - 2, state.shipY)]
    : state.shoots;

const isGameOver = (state: State): boolean =>
  state.playerLives <= 0
  || (state.invaders.length
    && state.invaders[state.invaders.length - 1].x >= gameSize - 1
  );

  const processInput = (state: State, input: Input) => (
    updateShipY(state, input),
    addShots(state, input)
  );
  const whileNotGameOver = (state: State, input: Input) =>
    state.delta = isGameOver(state) ? undefined : input.dlta;
  
  const gameUpdate = (state: State, input: Input): State =>
    (
      whileNotGameOver(state, input),
      processInput(state, input),
      updateState(state)
    );

    const spaceInvaders$ =
    interval(100).pipe(
      withLatestFrom(fromEvent(document, 'keydown').pipe(
        startWith({ code: '' }),
        takeUntil(fromEvent(document, 'keyup')),
        repeat()
      )),
      map(([intrvl, event]: [number, KeyboardEvent]): Input =>
        ({ dlta: intrvl, key: event.code })),
      scan<Input, State>(gameUpdate, initialState),
      tap(e => paint(e.game, e.playerLives, e.score, e.isGameOver)),
    );
  
  spaceInvaders$.subscribe();