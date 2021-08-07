
// Surname     | Firstname | Contribution % | Any issues?
// =====================================================
// Person 1... |           | 25%
// Person 2... |           | 25%
// Person 3... |           | 25%
// Person 4... |           | 25%
//
// complete Worksheet 2 by entering code in the places marked below...
//
// For full instructions and tests open the file worksheetChecklist.html
// in Chrome browser.  Keep it open side-by-side with your editor window.
// You will edit this file (main.js), save it, and reload the
// browser window to run the test.

/**
 * Exercise 1
 */

const myObj = {
    aProperty: "I hate mondays",
    anotherProperty: 2021
};

/**
 * Exercise 2
 */

function operationOnTwoNumbers(func) {
    return function (firstNum) {
        return function (secondNum) {
            return func(firstNum, secondNum)
        };
    };
};

/**
 * Exercise 3
 */

function callEach(functionArray) {
    functionArray.forEach(func => func());
}

/**
 * Exercise 4
 */
function addN(n, array) {
    return array.map(x => x + n); // x is the element of the array that is being passed to the map function. 
}
function getEvens(array) {
    return array.filter(x => x % 2 === 0); // x is the element being checked and added to the array if the condition is met
}
function multiplyArray(array) {
    let acc = 1;
    return array.reduce((acc, x) => (x != 0) ? x * acc : acc);
}
/**
 * Exercise 5
 */

function range(n) {
    if (n === 0) {
        return [];
    }
    else {
        return range(n - 1).concat([n - 1]);
    }
}

/**
 * Exercise 6
 */

function Euler1() {
    let res = 0;
    let array = range(1000);
    array = array.filter(num => num % 3 === 0 || num % 5 === 0);
    for (let i = 0; i < array.length; i++) {
        res += array[i];
    }
    return res;
}

/**
 * Exercise 7
 */

function infinite_series_calculator(accumulate) {
    return function (predicate) {
        return function (transform) {
            return function (n) {
                let array = range(n);
                array = array.filter(num => predicate(num));
                for (let i = 0; i < array.length; i++) {
                    array[i] = transform(array[i]);
                }
                let res = array[0];
                for (let i = 1; i < array.length; i++) {
                    res = accumulate(res, array[i]);
                }
                return res;

            }
        }
    }
}

/**
 * Exercise 8
 */
function calculatePiTerm(n) {
    return ((4 * n * n) / (4 * n * n - 1));
}
function skipZero(n) {
    return n != 0 ? true
        : false;
}
function productAccumulate(x, y) {
    return x * y;
}
function calculatePi(n) {
    return 2*infinite_series_calculator(productAccumulate)(skipZero)(calculatePiTerm)(n);
    
}
const pi = calculatePi(100);
/**
 * Exercise 9
 */

function factorial(n) {
    return (n === 1 || n === 0) ? 1
        : factorial(n - 1) * n;
}

function calculateETerm(n) {
    return ((2 * (n + 1)) / factorial((2 * n + 1)));
}

function sumAccumulate(x, y) {
    return x + y;
}

function alwaysTrue() {
    return true;
}
function sum_series_calculator(transform) {
    return function(n) {
        return infinite_series_calculator(sumAccumulate)(alwaysTrue)(transform)(n);
    }
}

function calculateE(n) {
    return sum_series_calculator(calculateETerm)(n);
}

const e = calculateE(3);




/**
 * Exercise 10
 *
 */
 function sin(x) {
    function sinTerm(n) {
        return (((-1)**n)*(x**(2*n + 1))) / (factorial((2*n + 1)));
    }
    function sinSeriesCalculator(transform){
        return function(n) {
            return infinite_series_calculator(sumAccumulate)(alwaysTrue)(transform)(3);
        } 
    }
    return sinSeriesCalculator(sinTerm)(x);
 }
