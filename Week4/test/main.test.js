// naturalNumbers function from the course notes.
const naturalNumbers = (initialValue) => {
    return function _next(v) {
        return {
            value: v,
            next: _ => _next(v + 1),
        }
    }(initialValue)
  };

describe("exercise_1_suite", function() {
  describe("Implement: `function initSequence<T>(transform: (value: T) => T): (initialValue: T) => LazySequence<T>`", function() {
    it("initSequence is a function", function() {
      expect(initSequence).is.a('function');
    });
    it("initSequence(v => v + 1) returns a function", function() {
      expect(initSequence(v => v + 1)).is.a("function");
    });
    it("initSequence(v => v + 1)(0) returns LazySequence<number>", function(){
      expect(initSequence(v => v + 1)(0), "Should have value property set at 0").to.have.property("value", 0);
      expect(initSequence(v => v + 1)(0)).to.have.property("next");
    });
    it("initSequence(v => v + 1) returns a function identical to naturalNumbers function in the course notes.", function () {
      const yourNaturals = initSequence(v => v + 1);

      let gen1 = naturalNumbers(0);
      let gen2 = yourNaturals(0);
      
      let val1 = 0;
      for (let i = 0; i < 500; i++) {
        val1 += 1;
        gen1 = gen1.next();
        gen2 = gen2.next();
        expect(gen1.value).to.equal(val1);
        expect(gen1.value).to.equal(gen2.value);
      }
    });
  });
});


describe("exercise_2_suite", function(){
  describe("Implement: function map<T>(func: (v: T)=>T, seq: LazySequence<T>): LazySequence<T>", function() {
    it("map is a function", function(){
      expect(map).is.a("function");
    });
    it("simple map test", function() {
      const gen1 = naturalNumbers(1);
      let evenNums = map(v => v * 2, gen1);

      let i = 2;
      let count = 0;
      while (i < 200) {
        count ++;
        expect(evenNums.value, `Failed at iteration: ${count}. ${evenNums.value} should be ${i}`).to.equal(i);
        evenNums = evenNums.next();
        i += 2;
      }
    });

    it("checking nesting maps", function() {
      const gen1 = naturalNumbers(1);
      let evenNums = map(v => v * 2, gen1);
      let oddNums = map(v => v + 1, evenNums);

      let i = 2;
      while (i < 200) {
        expect(evenNums.value).to.equal(i);
        expect(oddNums.value).to.equal(i + 1);
        evenNums = evenNums.next();
        oddNums = oddNums.next();
        i += 2;
      }
    });
  });

  describe("Implement: function filter<T>(func: (v: T)=>boolean, seq: LazySequence<T>): LazySequence<T> {", function() {
    it("filter is a function", function() {
      expect(filter).is.a("function");
    });
    it("filter(v => v % 2 == 0, naturalNumbers(1)) gets expected result (only even numbers)", function() {
      let gen1 = naturalNumbers(1);
      let filtered = filter(v => v % 2 == 0, gen1);

      let i = 2;
      let count = 0;
      while (i < 200) {
        count ++;
        expect(filtered.value, `Failed at iteration: ${count}. ${filtered.value} should be ${i}`).to.equal(i);
        filtered = filtered.next();
        i += 2;
      }
    });
  });
  describe("Implement: function take", function() {
    it("take is a function", function(){
      expect(take).is.a("function");
    });
    it("take(10, naturalNumbers(1)) yields 10 elements", function() {
      let naturals = naturalNumbers(1);
      let generated = take(10, naturals);

      let returnedNumbers = [];
      let safeGuard = 0;
      // while loop stops when .next property is undefined or
      // loop counter exceeds 150.
      while (generated !== undefined && safeGuard < 150) {
        safeGuard ++;
        returnedNumbers.push(generated.value);
        generated = generated.next();
      }

      if (safeGuard >= 130) expect(safeGuard, `Infinite loop safeguard kicked in at element ${safeGuard}.`).to.equal(10);
      else expect(returnedNumbers.length, `Expected 10 numbers to be yielded from the lazy iterator, got ${returnedNumbers.length}`).to.equal(10);
    });
  });

  describe("Implement: reduce", function() {
    it("reduce exists and is a function", function(){
      expect(reduce).is.a("function");
    });
    it("reduce((acc, e)=>acc + e, take(10, naturalNumbers(0)), 0)", function() {
      expect(reduce((acc, e)=>acc + e, take(10, naturalNumbers(0)), 0)).to.equal([0,1,2,3,4,5,6,7,8,9].reduce((a,b) => a + b, 0));
    });
    it("reduce order matters", function(){
      expect(reduce((acc, e)=>`${acc},${e}`, take(3, naturalNumbers(0)), -1)).to.deep.equal("-1,0,1,2");

    });
  });

  describe("Implement: reduceRight", function() {
    it("reduceRight exists and is a function", function(){
      expect(reduceRight).is.a("function");
    });
    it("reduceRight((acc, e)=>acc + e, take(10, naturalNumbers(0)), 0)", function() {
      expect(reduceRight((acc, e)=>acc + e, take(10, naturalNumbers(0)), 0)).to.equal([0,1,2,3,4,5,6,7,8,9].reduce((a,b) => a + b, 0));
    });
    it("reduceRight order matters", function(){
      expect(reduceRight((acc, e)=>`${acc},${e}`, take(3, naturalNumbers(0)), -1)).to.deep.equal("-1,2,1,0");
    });
  });
});


describe("exercise_3_suite", function() {
  describe("maxNumber", function() {
    it("maxNumber returns a single number", function(){
      expect(maxNumber(take(1, naturalNumbers(0)))).is.a("number");
    });
    it("maxNumber returns the maximum number in a sequence", function() {
      let result = maxNumber(take(3, naturalNumbers(0)));
      expect(result, `Expect max of [0, 1, 2] to equal 2, instead got ${result}`).to.equal(2);
    });
  });
  describe("lengthOfSequence", function() {
    it("lengthOfSequence returns a number", function() {
      expect(lengthOfSequence(take(1, naturalNumbers(0)))).is.a("number");
    });
    it("lengthOfSequence returns correct results for a bunch of random cases", function() {
      for (let i = 0; i < 40; i++) {
        let length = Math.floor(Math.random() * 10) + 1;
        let result = lengthOfSequence(take(length, naturalNumbers(0)));
        expect(result, `Expected ${length} to equal ${result}.`).to.equal(length);
      }
    });
  });
  describe("Implement: toArray", function() {
    it("toArray exists and is a function", function(){
      expect(toArray).is.a("function");
    });
    it("toArray(take(10, naturalNumbers(0))", function() {
      expect(toArray(take(10, naturalNumbers(0)))).to.deep.equal([0,1,2,3,4,5,6,7,8,9]);
    });
  });

});

describe("exercise_4_suite", function() {
  describe("pi / 4 = 1 - 1 / 3 + 1 / 5 - 1 / 7 .......", function(){
    it("exercise4Solution is a function", function() {
      expect(exercise4Solution).is.a("function");
    });
    it("exercise4Solution(1) returns 1", function() {
      expect(exercise4Solution(1), "exercise4Solution must return a number").is.a("number");
      expect(exercise4Solution(1), "exercise4Solution(1) returns the pi approximation of `1/1`").is.equal(1);
    });
    it("exercise4Solution(2) returns ((1/1) - (1/3)) which is 0.66666", function() {
      expect(exercise4Solution(2)).is.closeTo(0.6666666, 0.00001);
    });
    it("exercise4Solution(3) returns (1/1) - (1/3) + (1/5)) which is 0.8666", function() {
      expect(exercise4Solution(3)).is.closeTo(0.86666, 0.00001);
    });
    it("Approximating Pi/4 using a series", function(){
      let accumulator = 1;
      let toggle = false;
      for (let i = 3; i < 1000; i += 2) {
          expect(exercise4Solution(Math.floor(i/2)), `Failed on iteration ${Math.floor(i/2)}.`).is.closeTo(accumulator, 0.00001);
          
          accumulator = toggle ? accumulator + (1 / i) : accumulator - (1 / i);
          toggle = !toggle;
      }
      // Check that pi has been gotten to 2 decimal places.
      expect(exercise4Solution(999) * 4).is.closeTo(Math.PI, 0.01);
    });
  });
});