/*
// Surname     | Firstname | email | Contribution% | Any issues?
// =============================================================
// Hackwill    |Riley      |rhac0001@student.monash.edu| 35%           |
// Ali         |Haider     |hali0010@student.monash.edu| 35%           |
// Mark        |Stoeghofer |msto0012@student.monash.edu| 5%           |Was unable to attend any meetings outside class where majority of work was completed
// Whittaker   |Finn       |fwhi0002@student.monash.edu| 25%           |
//
complete Worksheet 4/5 by entering code in the places marked below...
*/

import { interval, fromEvent, zip, range,Observable} from 'rxjs'
import { map, filter,flatMap,takeUntil,scan,take,merge} from 'rxjs/operators'

// Simple demonstration 
// ===========================================================================================
// ===========================================================================================
/**
 * an example of traditional event driven programming style - this is what we are
 * replacing with observable.
 * The following adds a listener for the mouse event
 * handler, sets p and adds or removes a highlight depending on x position
 */
function mousePosEvents() {
  const pos = document.getElementById("pos")!;

  document.addEventListener("mousemove", ({ clientX, clientY }) => {
    const p = clientX + ', ' + clientY;
    pos.innerHTML = p;
    if (clientX > 400) {
      pos.classList.add('highlight');
    } else {
      pos.classList.remove('highlight');
    }
  });
}

/**
 * constructs an Observable event stream with three branches:
 *   Observable<x,y>
 *    |- set <p>
 *    |- add highlight
 *    |- remove highlight
 */
function mousePosObservable() {
  const
    pos = document.getElementById("pos")!,
    o = fromEvent<MouseEvent>(document, "mousemove")
        .pipe(map(({ clientX, clientY }) => ({ x: clientX, y: clientY })))

  o.pipe(map(({ x, y }) => `${x},${y}`))
    .subscribe((s : string) => pos.innerHTML = s);

  o.pipe(filter(({ x }) => x > 400))
    .subscribe(_ => pos.classList.add('highlight'));

  o.pipe(filter(({ x }) => x <= 400))
    .subscribe(({x,y}) => { 
      pos.classList.remove('highlight')
    });
}

// Exercise 5
// ===========================================================================================
// ===========================================================================================
function piApproximation() {
  // a simple, seedable, pseudo-random number generator
  class RNG {
    // LCG using GCC's constants
    m = 0x80000000// 2**31
    a = 1103515245
    c = 12345
    state:number
    constructor(seed:number) {
      this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }
    nextInt() {
      this.state = (this.a * this.state + this.c) % this.m;
      return this.state;
    }
    nextFloat() {
      // returns in range [0,1]
      return this.nextInt() / (this.m - 1);
    }
  }

  const
    resultInPage = document.getElementById("value_piApproximation"),
    canvas = document.getElementById("piApproximationVis");

  if (!resultInPage || !canvas) {
    console.log("Not on the observableexamples.html page")
    return;
  }

  // Some handy types for passing data around
  type Colour = "red" | "green";
  type Dot = { x: number, y: number, colour?: Colour };
  interface Data {
    point?: Dot,
    insideCount: number,
    totalCount: number
  }

  const data = {insideCount: 0, totalCount:0}
  // an instance of the Random Number Generator with a specific seed
  const rng = new RNG(20)
  // return a random number in the range [-1,1]
  const nextRandom = ()=>rng.nextFloat()*2 - 1
  // you'll need the circleDiameter to scale the dots to fit the canvas
  const circleRadius = Number(canvas.getAttribute("width"))/2
  // test if a point is inside a unit circle
  const inCircle = ({ x, y }: Dot) => (x * x) + (y * y) <= 1;
  // you'll also need to set innerText with the pi approximation
  resultInPage.innerText = "...Update this text to show the Pi approximation...";

  // Your code starts here!
  // =========================================================================================
  function createDot(xIn:number, yIn:number) {
    if (!canvas) throw "Couldn't get canvas element!";
    const dot = document.createElementNS(canvas.namespaceURI, "circle");
    let newDot = {x: xIn+circleRadius,y: yIn+circleRadius, colour:"red"}
    inCircle({x:xIn,y:yIn})? newDot = {x:xIn*circleRadius,y:yIn*circleRadius,colour:"green"}: newDot = {x:xIn*circleRadius,y:yIn*circleRadius,colour:"red"}
    if (newDot.colour == "green") {data.insideCount++}
    data.totalCount++
    resultInPage.innerText = (4*data.insideCount/data.totalCount).toString()
    //Set circle properties
    dot.setAttribute("cx", String(xIn*circleRadius+circleRadius));
    dot.setAttribute("cy", String(yIn*circleRadius+circleRadius));
    dot.setAttribute("r", '5');
    dot.setAttribute("fill", newDot.colour);
  
    // Add the dot to the canvas
    canvas.appendChild(dot);

    
  }
  // method in rxjs zipWith 
  // A stream of random numbers
  const randomNumberStream = interval(50).pipe(map(nextRandom))
  const randPairs = zip(randomNumberStream, randomNumberStream).subscribe(pair => createDot(pair[0], pair[1]))
  

  
// zip(randomNumberStream, randomNumberStream.pipe((
//     map(() => ([Rand1, Rand2])))
//       .subscribe(x => createDot(Rand1, Rand2));

  //const randomNumberStream = interval(50).pipe(map(zip)).subscribe((, nextRandom) =createDot)
  
}

// o.pipe(map(({ x, y }) => `${x},${y}`))
// .subscribe((s : string) => pos.innerHTML = s);

// Exercise 6
// ===========================================================================================
// ===========================================================================================
/**
 * animates an SVG rectangle, passing a continuation to the built-in HTML5 setInterval function.
 * a rectangle smoothly moves to the right for 1 second.
 */
function animatedRectTimer() {
  // get the svg canvas element
  const svg = document.getElementById("animatedRect")!;
  // create the rect
  const rect = document.createElementNS(svg.namespaceURI,'rect')
  Object.entries({
    x: 100, y: 70,
    width: 120, height: 80,
    fill: '#95B3D7',
  }).forEach(([key,val])=>rect.setAttribute(key,String(val)))
  svg.appendChild(rect);

  const animate = setInterval(() => rect.setAttribute('x', String(1 + Number(rect.getAttribute('x')))), 10);
  const timer = setInterval(() => {
    clearInterval(animate);
    clearInterval(timer);
  }, 1000);
}

/**
 * Demonstrates the interval method
 * You want to choose an interval so the rectangle animates smoothly
 * It terminates after 1 second (1000 milliseconds)
 */
function animatedRect() {
  // Your code starts here!
  // =========================================================================================
  // ...
  const svg = document.getElementById("animatedRect")!;
  // create the rect
  const rect = document.createElementNS(svg.namespaceURI,'rect')
  Object.entries({
    x: 100, y: 70,
    width: 120, height: 80,
    fill: '#95B3D7',
  }).forEach(([key,val])=>rect.setAttribute(key,String(val)))
  svg.appendChild(rect);


  const oneStream = interval(50).pipe(map(x=>5))
  const stream1 = oneStream.subscribe(moveRectangle)
  // const timer = Observable<number>  = timer(1000)
  // const timerStream = timer.subscribe(checkTime)

 setTimeout(() => {
  stream1.unsubscribe();
}, 1000);


  function moveRectangle(amount:number) {
    rect.setAttribute('x', String(amount + Number(rect.getAttribute('x'))));
  }

  // function checkTime(time:number) {
  //   if (time > 1000) {
  //     stream1.unsubscribe()
  //     timerStream.unsubscribe()
  //   }
  // }
}



// Exercise 7
// ===========================================================================================
// ===========================================================================================
/**
 * Create and control a rectangle using the keyboard! Use only one subscribe call and not the interval method
 * If statements  
 */

type Char ='x' |'y'
function keyboardControl() {
  // get the svg canvas element
  const svg = document.getElementById("moveableRect")!;
  const rect = document.createElementNS(svg.namespaceURI,'rect')
  Object.entries({
    x: 100, y: 70,
    width: 120, height: 80,
    fill: '#95B3D7',
  }).forEach(([key,val])=>rect.setAttribute(key,String(val)))
  svg.appendChild(rect);


  const MOVEMENT_SPEED = 4; // One button press moves the rectangle this many coordinates
  const arrowDown$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(event => event.key == 'ArrowDown'), map(_ => ({x: 0, y: 1})));
  const arrowUp$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(event => event.key == 'ArrowUp'), map(_ => ({x: 0, y: -1})), merge(arrowDown$));
  const arrowLeft$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(event => event.key == 'ArrowLeft'), map(_ => ({x: -1, y: 0})), merge(arrowUp$));
  const arrowRight$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(event => event.key == 'ArrowRight'), map(_ => ({x: 1, y: 0})), merge(arrowLeft$))
  .subscribe(({x, y}) => { 
    rect.setAttribute('x', String(x*MOVEMENT_SPEED + Number(rect.getAttribute('x')))); 
    rect.setAttribute('y', String(y*MOVEMENT_SPEED + Number(rect.getAttribute('y'))));
  });
  /*
function moveRectangle2(axis:Char,amount:number) {
  rect.setAttribute(axis, String(Number(rect.getAttribute(axis))+amount))
}


  fromEvent<KeyboardEvent>(document, 'keydown')
  .pipe(
    //Filters out all events except for the ones we want. Left/Right for moving, Up arrow for shooting
    filter(({code})=>code === 'ArrowLeft' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowDown'),
    //remove repeat keys
    filter(({repeat})=>!repeat),
    //Has 8 millisecond interval between movements, to avoid hyper movements
    flatMap(d=>interval(8).pipe(
      //Stops filtering once key is released, as backlog of keydown events would occur
      takeUntil(fromEvent<KeyboardEvent>(document, 'keyup').pipe(
        //returns code object as code
        filter(({code})=>code === d.code)
      )),
      map(_=>d))
    ),
    //Moves xaxis by 1 or -1 depending on which key is pressed.
    // map(({code})=>code==='ArrowLeft'? ['x',-1]:'ArrowRight'? ['x',1] : 'ArrowUp'? ['y',1] : ['y',-1]).scan(moveRectangle2, rect)

    map(({code})=>    
    code==='ArrowLeft'? moveRectangle2('x',(-1)) :
    (code ==='ArrowRight')? moveRectangle2('x',1):
    (code ==='ArrowUp')? moveRectangle2('y',(-1)) : rect.setAttribute('y', String(Number(rect.getAttribute('y'))+1))), 



    scan(moveRectangle2, rect)
    
    
    
    // .subscribe(moveRectangle2)

*/
}

 








  // Your code starts here!
  // =========================================================================================
  // ...


// Running the code
// ===========================================================================================
// ===========================================================================================
document.addEventListener("DOMContentLoaded", function(event) {
  piApproximation();

  // compare mousePosEvents and mousePosObservable for equivalent implementations
  // of mouse handling with events and then with Observable, respectively.
  //mousePosEvents();
  mousePosObservable();

  animatedRect();
  // replace the above call with the following once you have implemented it:
  //animatedRect()
  keyboardControl();

});
