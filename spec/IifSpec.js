var Iif = require('../src/Iif.js');

/* Functional tests for the inline javascript inference engine Iif() */

describe("Iif functionality", function () {

  // benchmark flip-flop rules, without a fact stack 
  // test one million cycles of the rule engine

  var kbTest = {
    locals: "this.maxCycles = 1000000; this.count = 0; this.stopAt = this.maxCycles; this.state = false;",
    rules: [
      { if: 'this.state === false',
             then: 'this.state = true; this.count++;',
             priority: 1,
             repeatable: true,
             because: 'Flips false state to true'},
      { if: 'this.state === true',
             then: 'this.state = false; this.count++;',
             priority: 1,
             repeatable: true,
             because: 'Flips a true state to false'},
      { if: 'this.count >= this.stopAt && this.running === true',
             then: 'this.running = false;',
             priority: 10,
             because: 'Stop the engine with a stop rule because we have repeatable rules'}
    ],
    };

  beforeEach( function () {
    iif = new Iif();
  });

  describe("Running without a KB", function (){
    it("Should throw an errror if called without a KB loaded.", function () {
      expect(function() {
        iif.run();
      }).toThrowError("IFF Error: cannot run, no knowledge base loaded");
    });
  });

  describe("Loading a KB into the inference engine", function () {
    it("Should load the KB specific parameters into this scope", function () {
      iif.load(kbTest);
      expect(iif.count).toBe(0);
      expect(iif.stopAt).toBe(iif.maxCycles);
      expect(iif.state).toBe(false);
      expect(iif.name).toMatch(/No Name/);
    });

    it("Should have inference control parameters intialised", function () {
      iif.load(kbTest);
      expect(iif.kbstate).toBe('innactive');
    });

    describe("The fact stack is not needed in the benchmark tests", function (){
        it("Should report a false value for the present: fact", function (){
          iif.load(kbTest);
          expect(iif.facts.present).toBe(false);
      });
    });

  });

  describe("Execution of if and then clauses", function () {
    it("Should execute a rule's if clause", function () {
      iif.load(kbTest);
      // var rulestack = iif.rules;
      expect(iif.rules.constructor === Array).toBe(true);
      expect(iif.rules[0].if.constructor === String).toBe(true);
      expect(iif.executeIf(iif.rules[0].if)).toBe(true);
    });

    it("Should execute a rule's then clause", function () {
      iif.load(kbTest);
      expect(iif.executeThen(iif.rules[0].then)).toBe(0);
      expect(iif.state).toBe(true);
      expect(iif.count).toBe(1);
    });
  });

  describe("Inference Operation", function () {
    it("Should run an inference", function () {
      iif.load(kbTest);
      var start = new Date();
      expect(iif.infer()).toBe(iif.maxCycles + 1);
      var stop = new Date();
      var lapsed = ((stop - start)/1000);
      describe("Repeatable rules performance", function () {
        it("Should run many times in the same inference session", function () {
          expect(iif.rules[0].fired).toBe(iif.maxCycles/2);
          expect(iif.rules[1].fired).toBe(iif.maxCycles/2);
        });
      });
      describe("Default rule performance", function () {
        expect(iif.rules[2].fired).toBe(1);
      });
      // report the benchmark performance for one million cycles
      console.log('Lapsed time for ' + iif.maxCycles + ' = ' + lapsed + ' seconds.');
      console.log('Inference Rate: ' + Math.floor((iif.cycles + 0)/lapsed) + ' rules per second.');
    });
});

});
