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

// Test Fixtures
// a knowledge base (KB) is an object containing rules, properties and facts

  // benchmark flip-flop rules, without a fact stack
  // test one million cycles of the rule engine
  // no facts are used in this fixture
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
             because: 'Stop the engine with a stop rule'}
    ],
    };

  // This fixture adds facts to its fact stack via an ask clause, asking the
  // the user to assert the state (true/false) of a presented assertion (a fact)
  // An ask clause can interface with a user via a console or 
  // HTML (in a web app).
  var askTestKB = {
    properties: "this.maxCycles = 1000000; this.count = 0; " + 
                "this.stopAt = this.maxCycles; this.state = false;",
    facts: {"_present": true, "adult": true},
    rules: [
      { name: "Gender",
        if: 'this.facts("adult") === true',
             then: 'this.underAge = false;',
             priority: 1,
             repeatable: false,
             because: 'if you are not male then you are female or intersex'},
      { name: "Age",
        ask: 'are you older than 16 years',
             then: 'this.facts("adult", true);',
             priority: 1,
             repeatable: false,
             because: 'if you are sixteen or younger you are a minor'},
      { name: "Orientation passes",
        if: 'this.facts("adult") === true',
        ask: 'you identify as gay/bi/other',
             then: 'this.facts("orientation", "other");',
             priority: 10,
             because: 'tell us about your gender identification'},
      { name: "Orientation fails on if:",
        if: 'this.facts("adult") === true',
        ask: 'you identify as gay/bi/other',
             then: 'this.facts("orientation", "other");',
             priority: 10,
             because: 'tell us about your gender identification'},
      { name: "Orientation fails on ask:",
        if: 'this.facts("adult") === true',
        ask: 'you identify as gay/bi/other',
             then: 'this.facts("orientation", "other");',
             priority: 10,
             because: 'tell us about your gender identification'}
    ],
    };

  beforeEach( function () {
    iif = new Iif();
    //iif.debug = true; // uncomment to turn on debug throughout the tests
  });

  describe("Running without a KB,", function (){
    it("Should throw an errror if called without a KB loaded.", function () {
      expect(function() {
        iif.run();
      }).toThrowError("IIF Error: cannot run, no knowledge base loaded");
    });
  });

//  describe("Running a KB for a second time,", function (){
//    it("Should throw an errror if attempting to run again.", function () {
//      expect(function() {
//        iif.run();
//      }).toThrowError("IIF Error: KB has already run to completion");
//    });
//  });

  describe("Knowledge Base Structure and parts,", function () {
    it("Should load at least one rule and run.", function () {
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

  describe("Loading a KB into the inference engine,", function () {
    it("Should load the KB specific parameters into this scope.", function () {
      iif.load(kbTest);
      expect(iif.count).toBe(0);
      expect(iif.stopAt).toBe(iif.maxCycles);
      expect(iif.state).toBe(false);
      expect(iif.name).toMatch(/No Name/);
    });

    it("Should have inference control parameters intialised.", function () {
      iif.load(kbTest);
      expect(iif.kbstate).toBe('innactive');
    });

    describe("How the fact stack is initialised,", function (){
      it("Should report a false value " +
         "when a fact stack is not present in the knowledge base.", function (){
        iif.load(kbTest);
        expect(iif.facts("_present")).toBe(false);
      });
      it("Should report a true value " +
         "when a fact stack is present in the knowledge base", function (){
        iif.load(askTestKB);
        expect(iif.facts("_present")).toBe(true);
      });

    });

  });

  describe("Execution of if:, ask: and then: clauses,", function () {

    describe("How the if and ask clauses work,", function () {
      // indexes for test rules
      var hasLoneIf = 0, hasLoneAsk = 1, hasIfAndAsk = 2,
      ifFalseAskTrue = 3, ifTrueAskFalse = 4;
      var rv; // the return value of a test (if:) or an assertion (ask:)

      beforeEach(function(){
        rv = undefined;
        spyOn(iif, 'ask').and.returnValue(true);

      
        iif.askOn('console');
        iif.load(askTestKB);

      });

      it("Should execute a rule's if clause.", function () {
        iif.load(kbTest);
        expect(iif.rules.constructor === Array).toBe(true);
        expect(iif.rules[hasLoneIf].if.constructor === String).toBe(true);
        rv = iif.testAssertions(iif.rules[hasLoneIf]);
        expect(rv).toBe(true);
      });

      it("Should execute a rules ask clause.", function (){
        // iif.debug = true; //to see the assertions passed
        rv = iif.testAssertions(iif.rules[hasLoneAsk]);
        expect(iif.ask).toHaveBeenCalled();
        expect(rv).toBe(true);
      });

      it("Should execute both an if and an ask clause.", function (){
        // iif.debug = true;
        rv = iif.testAssertions(iif.rules[hasIfAndAsk]);
        expect(iif.ask).toHaveBeenCalled();
        expect(rv).toBe(true);
      });

      it("Should fail when if: fails and Ask: succedes.", function (){
        // iif.debug = true;
        // make the if: clause fail
        iif.facts('adult', false);
        rv = iif.testAssertions(iif.rules[ifFalseAskTrue]);
        var assertion = iif.rules[ifTrueAskFalse].ask;
        expect(iif.ask).toHaveBeenCalled();
        expect(iif.ask).toHaveBeenCalledWith(assertion);
        expect(rv).toBe(false);
      });


    });

    it("Should execute a rule's then clause", function () {
      iif.load(kbTest);
      expect(iif.executeThen(iif.rules[0].then)).toBe(0);
      expect(iif.state).toBe(true);
      expect(iif.count).toBe(1);
    });
  });

  describe("How a dual clause rule fails function,", function (){
    var ifTrueAskFalse = 4;
    beforeEach(function(){
      rv = undefined;
      spyOn(iif, 'ask').and.returnValue(true);

        
      iif.askOn('console');
      iif.load(askTestKB);

    });

    it("Should fail when the if: succedes and the Ask: fails.", function (){
      // iif.debug = true;
      rv = iif.testAssertions(iif.rules[ifTrueAskFalse]);
      var assertion = iif.rules[ifTrueAskFalse].ask;
      expect(iif.ask).toHaveBeenCalled();
      expect(iif.ask).toHaveBeenCalledWith(assertion);
      expect(rv).toBe(false);
    });

  });


  describe("The iif Inference Operation,", function () {
    it("Should run until no rules fire.", function (done) {
      iif.load(kbTest);
      var start = new Date();
      expect(iif.done()).toBe(false);
      expect(iif.run()).toBe(iif.maxCycles + 1);
      expect(iif.done()).toBe(true);
      var stop = new Date();
      var lapsed = ((stop - start)/1000);
      done();
//      describe("Repeatable rules performance,", function () {
//        it("Should run many times in the same inference session.", function () {
          expect(iif.rules[0].fired).toBe(iif.maxCycles/2);
          expect(iif.rules[1].fired).toBe(iif.maxCycles/2);
//        });
//      });
//      describe("Default non repeatable rule performance,", function () {
//        it("Should only run once(because it is not repeatable).", function (){
          expect(iif.rules[2].fired).toBe(1);
//        });
//      });
//        it("Running again will do nothing until KB has been reset", function () {
            expect(function() {
              iif.run();
            }).toThrowError("IIF Error: KB has already run to completion");
//      });
      // report the benchmark performance for one million cycles
      if(iif.debug === true) {
      console.log('Lapsed time for ' + 
                   iif.maxCycles + ' = ' + lapsed + ' seconds.');
      console.log('Inference Rate: ' + 
                   Math.floor((iif.cycles + 0)/lapsed) + ' rules per second.');
      }
   });
});

  describe("how console ask: assertions are written and executed:", function (){
    var consoleScreen = '??';
    beforeEach( function () {

    iif.askOn('console');

      spyOn(iif, 'consoleQuery').and.callFake( function (msg) {
          consoleScreen = msg;
          return 'y';
      });

    });

    it("Should throw an error when unknown ask handler is found", function () {
      var assertion = 'an unknown fact';
      iif.askOn('database');
      var rv;
      var testIifAsk = function () {
        rv = iif.ask(assertion);
      }
      expect(testIifAsk).toThrowError(
             "IIF Error: requested ASK handler not found: " + iif._askOn);

    });


    it("Should write the ask statement being asserted to the console " + 
       "if the fact is not already known.", function (){

      var assertion = 'You are male';
    
      var rv = iif.ask(assertion);

      expect(consoleScreen).toBe('IS THIS TRUE: ' + assertion);
      expect(rv).toBe(true);

    });

    it("Should not write the ask statement to the console " +
       "when the asserted fact is known", function () {

      var assertion = 'You are female';

      consoleScreen = '';

      // make the fact known on the fact stack
      iif.facts(assertion, false);

      var rv = iif.ask(assertion);

      expect(consoleScreen).toBe('');
      expect(rv).toBe(false);


    });

    it("Should perform multiple asks when a list of assertions " +
       "is present in an ask: property", function (){
        // TODO: Is this feature needed in a minimal system?? 
        // If so then how is a logical OR implemented in a list?

    });

  });

  //TODO Section


});
