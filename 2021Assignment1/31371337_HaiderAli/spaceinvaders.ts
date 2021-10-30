import { fromEvent,interval,Observable,merge } from 'rxjs'; 
import { map,filter,takeUntil,flatMap, take,scan } from 'rxjs/operators';
type Key = 'ArrowLeft' | 'ArrowRight' | 'Space'
type Event = 'keydown' | 'keyup'
function spaceinvaders() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!

    const 
    Constants = {
      CanvasSize: 600,
      BulletExpirationTime: 100,
      BulletRadius: 4,
      BulletVelocity: 5,
      StartAlienRadius: 10,
      StartAliensPerRow: 5,
      AliensRows:3,
      RotationAcc: 0.1,
      MOVEMENTSPEED:5,
      ThrustAcc: 0.1,
      StartTime: 0
    } as const

    // our game has the following view element types:
  type ViewType = 'ship' | 'alien' | 'bullet'

  // Four types of game state transitions
  class Tick { constructor(public readonly elapsed:number) {} }
  class Move { constructor(public readonly direction:number) {} }
  class Shoot { constructor() {} }
  
  const 
    gameClock = interval(10)
      .pipe(map(elapsed=>new Tick(elapsed))),
      keyObservable = <T>(e:Event, k:Key, result:()=>T)=>
      fromEvent<KeyboardEvent>(document,e)
        .pipe(
          filter(({code})=>code === k),
          filter(({repeat})=>!repeat),
          map(result)),

    startLeftRotate = keyObservable('keydown','ArrowLeft',()=>new Move(-1*Constants.MOVEMENTSPEED)),
    startRightRotate = keyObservable('keydown','ArrowRight',()=>new Move(1*Constants.MOVEMENTSPEED)),
    stopLeftRotate = keyObservable('keyup','ArrowLeft',()=>new Move(0)),
    stopRightRotate = keyObservable('keyup','ArrowRight',()=>new Move(0)),
    shoot = keyObservable('keydown','Space', ()=>new Shoot())

  type Circle = Readonly<{pos:Vec, radius:number}>
  type ObjectId = Readonly<{id:string,createTime:number}>
  interface IBody extends Circle, ObjectId {
    viewType: ViewType,
    vel:Vec,
    acc:Vec,
    angle:number,
    rotation:number,
    torque:number
  }
 // Every object that participates in physics is a Body
 type Body = Readonly<IBody>

 // Game state
 type State = Readonly<{
   time:number,
   ship:Body,
   bullets:ReadonlyArray<Body>,
   aliens:ReadonlyArray<Body>,
   score:number,
   exit:ReadonlyArray<Body>,
   objCount:number,
   gameOver:boolean
 }>

 // Rocks and bullets are both just circles
 const createCircle = (viewType: ViewType)=> (oid:ObjectId)=> (circ:Circle)=> (vel:Vec)=>
   <Body>{
     ...oid,
     ...circ,
     vel:vel,
     acc:Vec.Zero,
     angle:0, rotation:0, torque:0,
     id: viewType+oid.id,
     viewType: viewType
     
   },
   createAlien = createCircle('alien'),
   createBullet = createCircle('bullet')

 function createShip():Body {
   return {
     id: 'ship',
     viewType: 'ship',
     pos: new Vec(285,570),
     vel: Vec.Zero,
     acc: Vec.Zero,
     angle:0,
     rotation:0,
     torque:0,
     radius:15,
     createTime:0
   }
 }

 const
   // note: Math.random() is impure and non-deterministic (by design) it takes its seed from external state.
   // if we wanted to use randomness inside the Observable streams below, it would be better to create a
   // pseudo-random number sequence Observable that we have complete control over.
   initialAliensDirections = [...Array(Constants.StartAliensPerRow)]
     .map(()=>new Vec(1, 0)),

   startAliens = [...Array(Constants.StartAliensPerRow)]
     .map((_,i)=>createAlien({id:String(i),createTime:Constants.StartTime})
                           ({pos:new Vec(( 100 * ( i + 1)),30 ),radius:Constants.StartAlienRadius})
                           (initialAliensDirections[i])),
      

   initialState:State = {
     time:0,
     ship: createShip(),
     bullets: [],
     aliens: startAliens,
     exit: [],
     objCount:Constants.StartAliensPerRow ,
     score:0,
     gameOver: false
   },

   // wrap a positions around edges of the screen
   torusWrap = ({x,y}:Vec) => { 
     const s=Constants.CanvasSize, 
     wrap = (v:number) => v<0? 0 : v>s? s-1:v;//prevents the body passed in from going out of bounds
     return new Vec(wrap(x),wrap(y))
   },
   torusWrapAlien = ({x,y}:Vec) => { 
    const s=Constants.CanvasSize, 
      wrap = (v:number) => v<0? 0 : v>s? s-1:v;//prevents the aliens from going out of bounds
    return new Vec(wrap(x),wrap(y))
  },
  torusWrapShip = ({x,y}:Vec) => { 
    const s=Constants.CanvasSize - 30, 
      wrap = (v:number) => v<0? 0 : v>s? s-1:v;//prevents the ship from going out of bounds
    return new Vec(wrap(x),wrap(y))
  },

   // all movement comes through here
   moveBody = (o:Body) => <Body>{
     ...o,
     rotation: o.rotation + o.torque,
     angle:o.angle+o.rotation,
     pos:torusWrap(o.pos.add(o.vel)),
     vel:o.vel.add(o.acc)
   },
   moveAlienY = (o:Body) => <Body>{
    ...o,
    pos:torusWrap(o.pos.addY(20)) // moves the aliens downwards 
  },
  moveAlienXNe = (o:Body) => <Body>{
    ...o,
    vel:o.vel.scaleX(-1) //changes the aliens X velocity to make aliens move in the opposite direction
  },
  moveAlienX = (o:Body) => <Body>{
    ...o,
    pos:torusWrapAlien(o.pos.add(o.vel))  // makes the aliens move along the x direction with the given velocity 
  },
   moveShip = (o:Body) => <Body>{
    ...o,
    pos:torusWrapShip(o.pos.add(o.vel)) // moves the ship along x-axis
  },
   
   // check a State for collisions:
   //   bullets destroy aliens
   //   ship colliding with aliens ends game
   handleCollisions = (s:State) => {
     const
       bodiesCollided = ([a,b]:[Body,Body]) => a.pos.sub(b.pos).len() < a.radius + b.radius,
       shipCollided = s.aliens.filter(r=>bodiesCollided([s.ship,r])).length > 0,
       allBulletsAndAliens = flatMape(s.bullets, b=> s.aliens.map<[Body,Body]>(r=>([b,r]))),
       collidedBulletsAndAliens = allBulletsAndAliens.filter(bodiesCollided),
       collidedBullets = collidedBulletsAndAliens.map(([bullet,_])=>bullet),
       collidedAliens = collidedBulletsAndAliens.map(([_,alien])=>alien),
       AllAliensKilled = (s.aliens.length===0), // checks if there are aliens left. end game if no aliens left
       cut = except((a:Body)=>(b:Body)=>a.id === b.id)
    
     return <State>{
       ...s,
       bullets: cut(s.bullets)(collidedBullets), //removes the bullets that hit aliens
       aliens: cut(s.aliens)(collidedAliens),// removes the destroyed aliens from the original aliens
       exit: s.exit.concat(collidedBullets,collidedAliens),
       objCount: s.objCount,// updates the state object count
       score:s.score + collidedAliens.length, // updates the score to include the number of aliens killed
       gameOver: shipCollided || AllAliensKilled // checks whether the aliens have hit the ship or all aliens have been killed
     }
   },

   // interval tick: bodies move, bullets expire
   tick = (s:State,elapsed:number) => {
     const 
       expired = (b:Body)=>(elapsed - b.createTime) > 100,
       expiredBullets:Body[] = s.bullets.filter(expired),
       activeBullets = s.bullets.filter(not(expired));
     return handleCollisions({...s, 
       ship:moveShip(s.ship), 
       bullets:activeBullets.map(moveBody), 
       aliens: ((elapsed % 100===0 )? (s.aliens.map(moveAlienY).map(moveAlienXNe)):s.aliens.map(moveAlienX)),
       exit:expiredBullets,
       time:elapsed
     })
   },

   // state transducer
   reduceState = (s:State, e:Move|Tick|Shoot)=>
     e instanceof Move ? {...s,
       ship: {...s.ship,vel:new Vec(e.direction,0)} // moves the ship in the direction of the arrow key pressed
     } :
     e instanceof Shoot ? {...s,
       bullets: s.bullets.concat(
               createBullet({id:String(s.objCount),createTime:s.time})
                 ({radius:Constants.BulletRadius,pos:s.ship.pos.add(new Vec(1,-1).scale(s.ship.radius))}) // makes a bullet whenever it detects a spacebar event has occured
                 (s.ship.vel.add(new Vec(0,-1).scale(Constants.BulletVelocity)))
              ),
       objCount: s.objCount + 1
     } : 
     tick(s,e.elapsed)

 // main game stream
 const subscription =
   merge(gameClock,
     startLeftRotate,startRightRotate,
     stopLeftRotate,stopRightRotate,
     shoot)
   .pipe(
     scan(reduceState, initialState))
   .subscribe(updateView)

 // Update the svg scene.  
 // This is the one impure function in this program
 function updateView(s: State) {
   const 
     svg = document.getElementById("canvas")!,
     ship = document.getElementById("ship")!,
     updateBodyView = (b:Body) => {
       function createBodyView() {
         const v = document.createElementNS(svg.namespaceURI, "ellipse")!;
         attr(v,{id:b.id,rx:b.radius,ry:b.radius});
         v.classList.add(b.viewType)
         svg.appendChild(v)
         return v;
       }
       const v = document.getElementById(b.id) || createBodyView();
       attr(v,{cx:b.pos.x,cy:b.pos.y});
     };
    //  ship.setAttribute('x',String(s.ship.pos.x))
    //  ship.setAttribute('y',String(s.ship.pos.y))
     attr(ship,{x:s.ship.pos.x,y:s.ship.pos.y});
    s.bullets.forEach(updateBodyView);
   s.aliens.forEach(updateBodyView);
   s.exit.map(o=>document.getElementById(o.id))
         .filter(isNotNullOrUndefined)
         .forEach(v=>{
           try {
             svg.removeChild(v)
           } catch(e) {
             // rarely it can happen that a bullet can be in exit 
             // for both expiring and colliding in the same tick,
             // which will cause this exception
             console.log("Already removed: "+v.id)
           }
         })
   if(s.gameOver) {
     subscription.unsubscribe();
     const v = document.createElementNS(svg.namespaceURI, "text")!;
     attr(v,{x:Constants.CanvasSize/6,y:Constants.CanvasSize/2,class:"gameover"});
     v.textContent = "Game Over";
     svg.appendChild(v);
     const sc = document.createElementNS(svg.namespaceURI, "text")!;
     attr(sc,{x:180,y:390,class:"score"});
     sc.textContent = "Score :";
     svg.appendChild(sc);
     const sco = document.createElementNS(svg.namespaceURI, "text")!;
     attr(sco,{x:280,y:450,class:"score"});
     sco.textContent = String(s.score);
     svg.appendChild(sco);
   }
 }
  
     
} 
    
window.onload = ()=>{
  spaceinvaders();
}
  
/////////////////////////////////////////////////////////////////////
// Utility functions taken from asteroids example

/**
 * apply f to every element of a and return the result in a flat array
 * @param a an array
 * @param f a function that produces an array
 */
 function flatMape<T,U>(
  a:ReadonlyArray<T>,
  f:(a:T)=>ReadonlyArray<U>
): ReadonlyArray<U> {
  return Array.prototype.concat(...a.map(f));
}

const 
/**
 * Composable not: invert boolean result of given function
 * @param f a function returning boolean
 * @param x the value that will be tested with f
 */
  not = <T>(f:(x:T)=>boolean)=> (x:T)=> !f(x),
/**
 * is e an element of a using the eq function to test equality?
 * @param eq equality test function for two Ts
 * @param a an array that will be searched
 * @param e an element to search a for
 */
  elem = 
    <T>(eq: (_:T)=>(_:T)=>boolean)=> 
      (a:ReadonlyArray<T>)=> 
        (e:T)=> a.findIndex(eq(e)) >= 0,
/**
 * array a except anything in b
 * @param eq equality test function for two Ts
 * @param a array to be filtered
 * @param b array of elements to be filtered out of a
 */ 
  except = 
    <T>(eq: (_:T)=>(_:T)=>boolean)=>
      (a:ReadonlyArray<T>)=> 
        (b:ReadonlyArray<T>)=> a.filter(not(elem(eq)(b))),
/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */         
  attr = (e:Element,o:Object) =>
    { for(const k in o) e.setAttribute(k,String(o[k])) }
/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
function isNotNullOrUndefined<T extends Object>(input: null | undefined | T): input is T {
  return input != null;
}
/**
 * A simple immutable vector class */
class Vec {
  constructor(public readonly x: number = 0, public readonly y: number = 0) {}
  add = (b:Vec) => new Vec(this.x + b.x, this.y + b.y)
  addX = (b:number) => new Vec(this.x + b,this.y)
  addY = (b:number) => new Vec(this.x,this.y + b)
  sub = (b:Vec) => this.add(b.scale(-1))
  subX = (b:number) => new Vec(this.x - b,this.y)
  subY = (b:number) => new Vec(this.x,this.y - b)
  len = ()=> Math.sqrt(this.x*this.x + this.y*this.y)
  scale = (s:number) => new Vec(this.x*s,this.y*s)
  scaleX = (s:number) => new Vec(this.x*s,this.y)
  ortho = ()=> new Vec(this.y,-this.x)
  move = (val:number) => new Vec(this.x + val,this.y)
  rotate = (deg:number) =>
            (rad =>(
                (cos,sin,{x,y})=>new Vec(x*cos - y*sin, x*sin + y*cos)
              )(Math.cos(rad), Math.sin(rad), this)
            )(Math.PI * deg / 180)

  static unitVecInDirection = (deg: number) => new Vec(0,-1).rotate(deg)
  static Zero = new Vec();
}