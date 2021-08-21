// Surname     | Firstname | email | Contribution% | Any issues?
// =============================================================
// Hackwill    |Riley      |rhac0001@student.monash.edu| 25%           |
// Ali         |Haider     |hali0010@student.monash.edu| 25%           |
// Mark        |Stoeghofer |msto0012@student.monash.edu| 25%           |
// Whittaker   |Finn       |fwhi0002@student.monash.edu| 25%           |
//
/*
complete Worksheet 3 by entering code in the places marked below...

For instructions and tests open the file worksheetChecklist.html
in Chrome browser.  Keep it open side-by-side with your editor window.
You will edit this file (main.ts), save it, and reload the
browser window to run the test.
*/
/**
 * Exercise 1:
*/
function addStuff(a, b) {
    return a + b;
}
function numberToString(input) {
    return JSON.stringify(input);
}
/**
 * Takes a string and adds "padding" to the left.
 * If 'padding' is a string, then 'padding' is appended to the left side.
 * If 'padding' is a number, then that number of spaces is added to the left side.
 */
function padLeft(value, padding) {
    if (typeof padding === "number") {
        return Array(padding + 1).join(" ") + value;
    }
    if (typeof padding === "string") {
        return padding + value;
    }
    throw new Error(`Expected string or number, got '${padding}'.`);
}
padLeft("Hello world", 4); // returns "    Hello world"
function curry(f) {
    return function (x) {
        return function (y) {
            return f(x, y);
        };
    };
}
/**
 * cons "constructs" a list node, if no second argument is specified it is the last node in the list
 */
function cons(head, rest) {
    return (selector) => selector(head, rest);
}
/**
 * head selector, returns the first element in the list
 * @param list is a Cons (note, not an empty ConsList)
 */
function head(list) {
    return list((head, rest) => head);
}
/**
 * rest selector, everything but the head
 * @param list is a Cons (note, not an empty ConsList)
 */
function rest(list) {
    return list((head, rest) => rest);
}
/**
 * Use this as an example for other functions!
 * @param f Function to use for each element
 * @param list is a Cons
 */
function forEach(f, list) {
    if (list) {
        f(head(list));
        forEach(f, rest(list));
    }
}
//const map = (f, list)=> !list ? null: cons(f(head(list)), map(f, rest(list)))
function map(f, l) {
    return !l ? null : cons(f(head(l)), map(f, rest(l)));
}
//
// Exercise 3: 
// 
function fromArray(arr) {
    return arr.length === 0 ? null : cons(arr[0], fromArray(arr.slice(1)));
}
// example use of reduce:
function countLetters(stringArray) {
    const list = fromArray(stringArray);
    return reduce((len, s) => len + s.length, 0, list);
}
console.log(countLetters(["Hello", "there!"]));
//filter(f: (_:T)=> boolean): List<T>
//creates a new node when f() = true and links the rest: to a recursive call of the the next new cons created
function filter(f, l) {
    return !l ? null : f(head(l)) ? cons(head(l), filter(f, rest(l))) : filter(f, rest(l)); // if the list isnt empty apply the filter on the current element of the list. If its true, return the head
}
function reduce(f, acc, l) {
    return !l ? acc : reduce(f, f(acc, head(l)), rest(l));
}
function reduceRight(f, acc, l) {
    return reduce(f, acc, reverse(l));
}
function reverse(l) {
    function reverse_aux(l, previous) {
        return !rest(l) ? cons(head(l), previous) : reverse_aux(rest(l), cons(head(l), previous));
    }
    return !l ? null : !rest(l) ? l : reverse_aux(rest(l), cons(head(l), null));
}
// 2 base cases, 1 for when list is empty or only one node in the list. 
// if next cons is null return the current node with a pointer to previous, otherwise move to next node
// passing in a new node pointing in current previous as the new previous
function concat(l1, l2) {
    return l1 ? cons(head(l1), concat(rest(l1), l2)) : l2;
}
//
// Exercise 4:
// 
/**
 * A linked list backed by a ConsList
 */
class List {
    constructor(list) {
        if (list instanceof Array) {
            this.head = fromArray(list);
            console.log(this);
        }
        else {
            this.head = list;
        }
    }
    /**
     * create an array containing all the elements of this List
     */
    toArray() {
        // Getting type errors here?
        // Make sure your type annotation for reduce()
        // in Exercise 3 is correct!
        return reduce((a, t) => [...a, t], [], this.head);
    }
    map(f) {
        return new List(map(f, this.head));
    }
    reduce(f, acc) {
        return reduce(f, acc, this.head);
    }
    filter(f) {
        return new List(filter(f, this.head));
    }
    concat(l2) {
        return new List(concat(this.head, l2.head));
    }
    forEach(f) {
        forEach(f, this.head);
        return this;
    }
}
/**
 * Exercise 5:
 */
function line(uglyString) {
    return [0, uglyString];
}
function lineToList(uglyString) {
    return new List([uglyString]);
}
class BinaryTreeNode {
    constructor(data, leftChild, rightChild) {
        this.data = data;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }
}
//nest
function nest(indent, l) {
    return l.map(x => [x[0] + indent, x[1]]); // x[i].a +indent
}
// example tree:
const myTree = new BinaryTreeNode(1, new BinaryTreeNode(2, new BinaryTreeNode(3)), new BinaryTreeNode(4));
// *** uncomment the following code once you have implemented List and nest function (above) ***
function prettyPrintBinaryTree(node) {
    if (!node) {
        return new List([]);
    }
    const thisLine = lineToList(line(node.data.toString())), leftLines = prettyPrintBinaryTree(node.leftChild), rightLines = prettyPrintBinaryTree(node.rightChild);
    return thisLine.concat(nest(1, leftLines.concat(rightLines)));
}
const output = prettyPrintBinaryTree(myTree)
    .map(aLine => new Array(aLine[0] + 1).join('-') + aLine[1])
    .reduce((a, b) => a + '\n' + b, '').trim();
console.log(output);
/**
 * Exercise 7:
 *  implement prettyPrintNaryTree, which takes a NaryTree as input
 *  and returns a list of the type expected by your nest function
 */
class NaryTree {
    constructor(data, children = new List(undefined)) {
        this.data = data;
        this.children = children;
    }
}
// Example tree for you to print:
let naryTree = new NaryTree(1, new List([
    new NaryTree(2),
    new NaryTree(3, new List([
        new NaryTree(4),
    ])),
    new NaryTree(5)
]));
// implement: function prettyPrintNaryTree(...)
function prettyPrintNaryTree(node) {
    if (!node) {
        return new List([]);
    }
    const thisLine = lineToList(line(node.data.toString())), restOfLines = node.children.reduce((x, y) => x.concat(prettyPrintNaryTree(y)), new List([]));
    return thisLine.concat(nest(1, restOfLines));
    //convert node (NaryTree) to a List<[number,string]>
}
// *** uncomment the following code once you have implemented prettyPrintNaryTree (above) ***
const outputNaryTree = prettyPrintNaryTree(naryTree)
    .map(aLine => new Array(aLine[0] + 1).join('-') + aLine[1])
    .reduce((a, b) => a + '\n' + b, '').trim();
console.log(outputNaryTree);
const jsonPrettyToDoc = json => {
    if (Array.isArray(json)) {
        // Handle the Array case.
        return json.reduce((x, y) => x.concat(jsonPrettyToDoc(y)), new List([]));
    }
    else if (typeof json === 'object' && json !== null) {
        // Handle the object case.
        // Hint: use Object.keys(json) to get a list of
        // keys that the object has.
        return Object.keys(json).reduce((x, y) => x.concat(jsonPrettyToDoc(y)), new List([]));
    }
    else if (typeof json === 'string') {
        // Handle string case.
        return lineToList(line(json + json.valueOf.toString()));
    }
    else if (typeof json === 'number') {
        // Handle number
        return lineToList(line(json.toString()));
    }
    else if (typeof json === 'boolean') {
        // Handle the boolean case
        return lineToList(line(json.toString() + json.valueOf));
    }
    else if (json === null) {
        // Handle the null case
        return lineToList([0, '']);
    }
    // Default case to fall back on.
    return new List([]);
};
// *** uncomment the following code once you are ready to test your implemented jsonPrettyToDoc ***
const json = {
    unit: "FIT2102",
    year: 2021,
    semester: "S2",
    active: true,
    assessments: { "week1": null, "week2": "Tutorial 1 Exercise", "week3": "Tutorial 2 Exercise" },
    languages: ["Javascript", "Typescript", "Haskell", "Minizinc"]
};
function lineIndented(aLine) {
    return new Array(aLine[0] + 1).join('    ') + aLine[1];
}
function appendLine(acc, nextLine) {
    return nextLine.slice(-1) === "," ? acc + nextLine.trim() :
        acc.slice(-1) === ":" ? acc + " " + nextLine.trim() :
            acc + '\n' + nextLine;
}
console.log(jsonPrettyToDoc(json)
    .map(lineIndented)
    .reduce(appendLine, '').trim());
// *** This is what it should look like in the console ***
// 
// {
//     unit: FIT2102,
//     year: 2021,
//     semester: S2,
//     active: true,
//     assessments: {
//         week1: null,
//         week2: Tutorial 1 Exercise,
//         week3: Tutorial 2 Exercise
//     },
//     languages: [
//         Javascript,
//         Typescript,
//         Haskell,
//         Minizinc
//     ]
// }
//# sourceMappingURL=main.js.map