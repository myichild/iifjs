var Iif = require('../src/Iif.js');

/* Functional tests for the inline javascript inference engine Iif() */

describe("Iif functionality::", function () {

  var brokenKB = {
    properties: 'this.result = "none"',
    rules: [
      {
        if: 'true === true',
        then: 'this.result = "passed"'
      }
    ],
  };

  // benchmark flip-flop rules, without a fact stack
  // test one million cycles of the rule engine

  var kbTest = {
    properties: "this.maxCycles = 1000000; this.count = 0; this.stopAt = this.maxCycles; this.state = false;",
    rules: [
      { name: "Flip",
             if: 'this.state === false',
             then: 'this.state = true; this.count++;',
             priority: 1,
             repeatable: true,
             because: 'Flips false state to true'},
      { name: "Flop",
        if: 'this.state === true',
             then: 'this.state = false; this.count++;',
             priority: 1,
             repeatable: true,
             because: 'Flips a true state to false'},
      { name: "Count up to stop",
        if: 'this.count >= this.stopAt && this.running === true',
             then: 'this.running = false;',
             priority: 10,
             because: 'Stop the engine with a stop rule because we have repeatable rules'}
    ],
    };

  var askTest = {
    properties: "this.maxCycles = 1000000; this.count = 0; this.stopAt = this.maxCycles; this.state = false; this.gender = 'male'; this.age = 'minor'; this.orientation = 'straight'",
    rules: [
      { name: "Gender",
        ask: 'are you female',
             then: 'this.gender = "female";',
             priority: 1,
             repeatable: false,
             because: 'if you are not male then you are female or intersex'},
      { name: "Age",
        ask: 'are you older than 16 years',
             then: 'this.fact = "adult";',
             priority: 1,
             repeatable: false,
             because: 'if you are sixteen or younger you are a minor'},
      { name: "Orientation",
        ask: 'you identify as gay/bi/other',
             then: 'this.fact("orientation", "other");',
             priority: 10,
             because: 'tell us about your gender identification'}
    ],
    };

  beforeEach( function () {
    iif = new Iif();
    //iif.debug = true;
  });

  describe("Running without a KB", function (){
    it("Should throw an errror if called without a KB loaded.", function () {
      expect(function() {
        iif.run();
      }).toThrowError("IIF Error: cannot run, no knowledge base loaded");
    });
  });

  describe("Knowledge Base Structure and parts", function () {
    it("Should load at least one rule and run", function () {
      // iif.debug = true; // selectively use debug to see what happens here
      iif.load(brokenKB);
      iif.run();
      // default values for name: and priority: added during loading
      expect(iif.rules[0].name).toBe('NoName');
      expect(iif.rules[0].priority).toBe(1);
      // one rule fires and inference ends after completing the second cycle
      // when no rule fires
      expect(iif.cycles).toBe(2);
      // the fired rule set a conclusion as a property of the iif object
      expect(iif.result).toBe("passed");
      // iif.debug = false;
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
          expect(iif.facts._present).toBe(false);
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

  describe("how console 'Ask' assertions are written and executed:", function (){
    var consoleScreen = '??';
    beforeEach( function () {

    iif.askOn('console');

      spyOn(iif, 'consoleQuery').and.callFake( function (msg) {
          consoleScreen = msg;
          return 'y';
      });

    });

    it("Should throw an error when an unknown ask handler is requested", function () {
      var assertion = 'an unknown fact';
      iif.askOn('database');
      var rv;
//      var testIifAsk = function () {
//        rv = iif.ask(assertion);
//      }
//      expect(testIifAsk).toThrow('IIF Error: requested ASK handler not found: database.');

    });


    it("Should write the ask statement being asserted to the console if the fact is not already known.", function (){

      var assertion = 'You are male';
    
      var rv = iif.ask(assertion);

      expect(consoleScreen).toBe('IS THIS TRUE: ' + assertion);
      expect(rv).toBe(true);

    });

    it("Should not write the ask statement to the console when the asserted fact is known", function () {

      var assertion = 'You are female';

      consoleScreen = '';

      // make the fact known on the fact stack
      iif.facts(assertion, false);

      var rv = iif.ask(assertion);

      expect(consoleScreen).toBe('');
      expect(rv).toBe(false);


    });

    it("Should read a rule and either execute an ASK and and IF when either or both are present", function (){



    });






})

});
