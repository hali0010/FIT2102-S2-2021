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
function initSequence(transform) {
    return function _next(v) {
        return {
            value: v,
            next: () => _next(transform(v))
        };
    };
}
// /*
//     Exercise 2
//  */
function map(func, seq) {
    return seq.next() ? { value: func(seq.value), next: () => map(func, seq.next()) } : undefined;
}
function filter(func, seq) {
    return !func(seq.value) ? filter(func, seq.next()) : { value: seq.value, next: () => filter(func, seq.next()) };
}
function take(amount, seq) {
    return !amount ? undefined : { value: seq.value, next: () => take(amount - 1, seq.next()) };
}
function reduce(func, seq, start) {
    return seq.next() ? reduce(func, seq.next(), func(start, seq.value)) : func(start, seq.value);
}
function reduceRight(func, seq, start) {
    return seq.next() ? func(reduceRight(func, seq.next(), start), seq.value) : func(start, seq.value);
}
/*
   Exercise 3
*/
function maxNumber(seq) {
    // at each step reduce returns the max of its max and the current value
    const func = (x, y) => x > y ? x : y;
    return reduce(func, seq, 0);
}
function lengthOfSequence(seq) {
    // at each step reduce returns its current length + 1
    const func = (x, y) => x + 1;
    return reduce(func, seq, 0);
}
function toArray(seq) {
    // at each step reduce returns its current concatenated array + [value]
    const func = (x, y) => [...x, y];
    return reduce(func, seq, []);
}
/*
    Exercise 4
 */
function exercise4Solution(seriesLength) {
    // Your solution using lazy lists.
    // Use `take` to only take the right amount of the infinite list.
    const inverse = x => 1 / x;
    const sum = (x, y) => x + y;
    const alternateOddNums = initSequence((v) => v < 0 ? -v + 2 : -v - 2)(1);
    //start from 1 every step alternate +/- v then +/- 2 respectively
    // 1, -3, 5, -7
    let resSeq = take(seriesLength, map(inverse, alternateOddNums));
    return reduce(sum, resSeq, 0);
}
;
// Expect return of approximation of pi/4 based on the length of the series passed in.
// function exercise4Solution (seriesLength: number): number {
//     const inverse = x => 1/x
//     const sum = (x,y) => x + y
//     const gen1 = initSequence((v:number) => v + 1)(1);
//     const neg = (x:number) => x%2? (x*(-1) -1): x;
//     let oddNums = take(seriesLength, map(inverse,  map(neg,gen1)))
//     return reduce(sum, oddNums, 0)
// };
//# sourceMappingURL=sequences.js.map