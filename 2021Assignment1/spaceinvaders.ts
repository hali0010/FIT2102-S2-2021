import { fromEvent,interval,Observable } from 'rxjs'; 
import { map,filter,flatMap,takeUntil, take,scan } from 'rxjs/operators';
function spaceinvaders() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
    const canvas = document.getElementById("canvas");
    const alien_10 = document.getElementById("alien-10");
    const MOVEMENT_SPEED = 4;
    type ship_State = Readonly<{
      x : number,
      y : number
    }>
    const initialShipState: ship_State = { x: 285, y: 570};
    function moveShip(s:ship_State,moveDelta:number):ship_State{
      return {...s,
        x:s.x + (moveDelta*MOVEMENT_SPEED)
      }
    }
    function updateView(state:ship_State): void {
      const ship = document.getElementById("ship_n")!;
      ship.setAttribute('x',String(state.x)
       )
      canvas.appendChild(ship)
    }
    fromEvent<KeyboardEvent>(document, 'keydown')
    .pipe(
      filter(({code})=>code === 'ArrowLeft' || code === 'ArrowRight'),
      filter(({repeat})=>!repeat),
      flatMap(d=>interval(10).pipe(
        takeUntil(fromEvent<KeyboardEvent>(document, 'keyup').pipe(
          filter(({code})=>code === d.code)
        )),
        map(_=>d))
      ),
      map(({code})=>code==='ArrowLeft'?-1:1),
      scan(moveShip, initialShipState))
    .subscribe(updateView)
}
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      spaceinvaders();
    }
  
  

