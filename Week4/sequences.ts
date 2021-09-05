/* 
Complete the following table when you submit this file:

Surname     | Firstname | email | Contribution% | Any issues?
=============================================================
Person 1... |           |       | 25%           |
Person 2... |           |       | 25%           |
Person 3... |           |       | 25%           |
Person 4... |           |       | 25%           |

complete Worksheet 4 by entering code in the places marked below...

For full instructions and tests open the file worksheetChecklist.html
in Chrome browser.  Keep it open side-by-side with your editor window.
You will edit this file (main.ts), save it, and reload the 
browser window to run the test. 
*/

/*
    Exercise 1 - General Purpose infinite sequence function
 */

    interface LazySequence<T> {
        value: T;
        next(): LazySequence<T>;
    }
    
    function initSequence<T>(transform: (value:T) => T): (initialValue:T) =>LazySequence<T> {
        return function _next(v:T):LazySequence<T> {
            return {
                value: v,
                next: ()=>_next(transform(v))
            }
        }
    }
    
    // /*
    //     Exercise 2
    //  */
    
    function map<T>(func: (v: T)=>T, seq: LazySequence<T>): LazySequence<T> {
        return seq.next() ? {value: func(seq.value), next: () => map(func, seq.next()) } as LazySequence<T> : undefined
    }
    
    function filter<T>(func: (v: T)=>boolean, seq: LazySequence<T>): LazySequence<T> {
        return !func(seq.value) ? filter(func, seq.next()) : {value: seq.value, next: () => filter(func, seq.next())}
    }
    
    function take<T>(amount: number, seq: LazySequence<T>): LazySequence<T> | undefined {
       return !amount ? undefined : {value: seq.value, next: () => take(amount -1, seq.next())} as LazySequence<T>
    }
    
    function reduce<T,V>(func: (v:V, t: T)=>V, seq: LazySequence<T>, start:V): V {
        return seq.next()? reduce(func, seq.next(), func(start, seq.value)): func(start, seq.value)
    }
    
    function reduceRight<T,V>(func: (v:V, t: T)=>V, seq: LazySequence<T>, start:V): V {
        return seq.next()? func(reduceRight(func, seq.next(), start), seq.value): func(start, seq.value)
    }
    
     /*
        Exercise 3
     */
    function maxNumber<T>(seq:LazySequence<T>){
        // at each step reduce returns the max of its max and the current value
        const func = (x,y) => x>y ? x : y
        return reduce(func, seq, 0)
    }
    
    function lengthOfSequence<T>(seq:LazySequence<T>){
        // at each step reduce returns its current length + 1
        const func = (x,y) => x+1
        return reduce(func, seq, 0)
    } 
    
    function toArray<T>(seq:LazySequence<T>){
        // at each step reduce returns its current concatenated array + [value]
        const func = (x,y) => [...x,y]
        return reduce(func, seq, [])
    }
    /*
        Exercise 4 
     */
        function exercise4Solution (seriesLength: number): number {
            // Your solution using lazy lists.
            // Use `take` to only take the right amount of the infinite list.
            const inverse = x => 1/x
            const sum = (x,y) => x + y
            const alternateOddNums = initSequence((v:number) => v < 0? -v + 2: -v -2)(1);
            //start from 1 every step alternate +/- v then +/- 2 respectively
            // 1, -3, 5, -7
            let resSeq = take(seriesLength, map(inverse,  alternateOddNums))
            return reduce(sum, resSeq, 0)
    
    
    
        };
        
        // Expect return of approximation of pi/4 based on the length of the series passed in.
    
        // function exercise4Solution (seriesLength: number): number {
        //     const inverse = x => 1/x
        //     const sum = (x,y) => x + y
        //     const gen1 = initSequence((v:number) => v + 1)(1);
        //     const neg = (x:number) => x%2? (x*(-1) -1): x;
        //     let oddNums = take(seriesLength, map(inverse,  map(neg,gen1)))
        //     return reduce(sum, oddNums, 0)
    
    
    
        // };
        
    
const s1 = initSequence((x: number) => -(x + Math.sign(x)))(1),seq = map((x) => -x, s1)

console.log(s1) 