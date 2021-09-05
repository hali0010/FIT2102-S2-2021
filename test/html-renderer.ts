import { empty, player, invader, shot } from './constants';

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

export const paint = (game: number[][], playerLives: number, score: number, isGameOver: boolean) => {
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