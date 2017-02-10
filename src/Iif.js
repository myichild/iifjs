/* iif function

  Inference if functionality

an inference function takes a knowledge base of procedural rules, facts, kbstate
and produces a conclusion from an initial state. States can be altered
as inference runs. Inference ends when no rule fires.

 kb = {properties: 'string', rules: {}, (facts, {}, kbstate {}) };

*/

"use strict";

var Iif = function () {

}

// load a knowledge base (rules plus facts)
// also domain specific methods can be added to the object if needed
//
Iif.prototype.load = function (kb) {
  this.name = kb.name || 'No Name Knowledge Base';
  var txt = kb.properties;
  eval(txt);
  this.rules = kb.rules;
  this.factStack = kb.facts || {_present: false};
  var ruleLen = kb.rules.length;
  for (var r=0; r < ruleLen; r++) {
    kb.rules[r].fired = 0;
    if (!kb.rules[r].hasOwnProperty('name')) {
      kb.rules[r].name = 'NoName';
    }
    if (!kb.rules[r].hasOwnProperty('repeatable')) {
      kb.rules[r].repeatable = false;
    }
    if (!kb.rules[r].hasOwnProperty('priority')) {
      kb.rules[r].priority = 1;
    }
  }
  this.priority = 0;
  this.kbstate = 'innactive';
  this.history = [];
  if(this.rules.constructor === Array) {
    this.kbLoaded = true;
  } else {
    this.kbLoaded = false;
  }
};

// Print a trace of the inference process to the console
// by setting to true.
//
Iif.prototype.debug = function () {
  this.debug = false;
};

// Set maxCycles when the possibility of infinite rule inference exists.
// forces the inference process to after maxCycles of the engine
//
Iif.prototype.cycles = function () {
  this.cycles = 0;
};

Iif.prototype.maxCycles = function () {
  this.maxCycles = 1000;
};

// log debug messages to the console
//
Iif.prototype.log = function (message) {
  if (this.debug === true) {
    console.log(message);
  }
};

// test an if: clause
//
Iif.prototype.executeIf = function (ifClause) {
  return eval(ifClause);
};

// test an if: and/or ask: clauses
//
Iif.prototype.testAssertions = function (rule) {

  var rv = 0, clause = 0;

  if(rule.hasOwnProperty('if')) {
    this.log("Testing IF: " + JSON.stringify(rule.if));
    clause = clause | 1;
   if(this.executeIf(rule.if)) {
      rv = rv | 1;
    }
  } 

  if(rule.hasOwnProperty('ask')) {
    this.log("Testing ASK: " + JSON.stringify(rule.ask));
    clause = clause | 2;
    if(this.ask(rule.ask)) {
      rv = rv | 2;
    }
  }
this.log('RV: ' + rv + ' clause cnt: ' + clause);
  if(clause === 3 && rv === 3) {
    return true;
  } else if ((clause === 1 || clause === 2) && (rv === 1 || rv === 2)) {
    return true;
  } else {
    return false;
  }
//  if(rv > 0) {
//    if(clause === 3)
//    return true;
//  } else {
//    return false;
//  }
};

// execute a then clause
//
Iif.prototype.executeThen = function (thenClause) {
  return eval(thenClause);
};

// run the inference
//
Iif.prototype.run = function () {
  try {
    if (!this.kbLoaded === true) {
      throw new Error("IIF Error: cannot run, no knowledge base loaded");
    }
  }
  catch (error) {
    throw error;
    return 0;
  };

  try {
    if (this.kbstate === 'active') {
      throw new Error("IIF Error: KB has already run to completion");
    }
  }
  catch (error) {
    throw error;
    return 0;
  };
  // run inference
  // infer() returns the number of cycles the engine has run
  return this.infer();
};

// naive infer(), no forward or backward chaining to an hypothesis.
// inference continues as long as a rule is fired
//
Iif.prototype.infer = function () {
  // check infer is not being 
  // start inference
  this.running = true;
  this.cycles = 0;
  do {
    // reset the KB fired state for the next inference pass
    this.log('New Inference Cycle...');
    this.fired = false;
    // reset the best rule memory
    this.best = 0;
    this.priority = 0;
    // loop through all the rules executing each if clause
    //this.log('Rule stack => ' + this.rules.length);
    //console.log('Rule stack => ' + this.rules.length);
    var ruleLen = this.rules.length;
    for(var i=0; i < ruleLen; i++) {
      var rule = this.rules[i];
      // if the rule has not fired previously or if the rule is repeatable then check it
      if(rule.fired < 1 || rule.repeatable === true){
        this.log('Testing Rule: ' + rule.name + ', IIF => ' + rule.if);
 // WIP       if (this.executeIf(rule.if)) {
        if(this.testAssertions(rule)) {
          this.log('TRUE');
          // check if it is the best so far
          this.log('Rule to check[' + i + '] => ' + rule.name + ' prority => ' + rule.priority);
          // console.log('Rule to check => ' + i);
          if (this.rules[i].priority >= rule.priority) {
            // we have a new best rule so set its idx and priority as the new
            // reference to better.
            this.best = i;
            rule.priority = this.rules[this.best].priority;
            this.fired = true;
            this.log('Setting Best Rule: ' + this.rules[this.best].name);
          }
        } // executeIf
      } // check fired or repeatable
    }// if loop
    //fire the best rule
    if (this.fired === true) {
      // execute the best rule's then clause
      // first check to see if a user is being asked to assert
      if (this.rules[this.best].hasOwnProperty('thenAsk')) {
        this.ask(this.rules[this.best].thenAsk);
      }
      // now fire then:
      this.executeThen(this.rules[this.best].then);
      this.kbstate = 'active';
      // update the rules fired counter
      this.rules[this.best].fired++;
      this.log('Fired rule: ' + this.best + ' => ' + this.rules[this.best].name);
      this.log('Fired State: ' + this.best + ' => ' + this.rules[this.best].fired);
      //console.log('Fired rule: ' + this.best);
    }
    this.cycles++;
    if (this.debug === true) {
      this.log('PRIORITY => ' + this.priority);
      this.log('RUNNING => ' + this.running);
      this.log('FIRED => ' + this.fired);
      this.log('CYCLES => ' + this.cycles);
    }
  } while (this.fired === true && this.running === true);
  // clean up
  return this.cycles;
};

// returns true if the KB has already been run
// at least one rule has fired  (running === false || this.best > 0 )
Iif.prototype.done = function () {
  return this.kbstate === 'active';
};


// provide a fact stack for the object, this may be overridden on creation
Iif.prototype.factStack = {_present: false};

Iif.prototype.present = function () {
  if ( this.factStack._present === true ) {
    return true;
  } else {
    return false;  
  }

};

// find out the state of a fact from an outside source
// the process of answering an assertion creates facts that have a value
Iif.prototype.consoleQuery = function (consoleAssertion) {
    var	query = require('cli-interact').getYesNo;
    return query(consoleAssertion);
};

// set where the ask string will be displayed and the response will be coming from
Iif.prototype.askOn = function (location) {

  this._askOn = location || 'console';

};

Iif.prototype.askConsole = function (assertion) {
    if(!this.factStack.hasOwnProperty(assertion)) { 
      // assertion is not already known
      var assertionState = this.consoleQuery('IS THIS TRUE: ' + assertion);
      this.log('Response to [' + assertion + '] is, ' + assertionState);
      if (assertionState === true) {
        assertionState = true;
      } else {
        assertionState = false;    
      }
      this.factStack[assertion] = assertionState;
      return assertionState;
    } else { 
      // the assertion is already a known fact
      return this.factStack[assertion];
    }
};

Iif.prototype.askHTML = function (assertion) {


};


Iif.prototype.ask = function (assertion) {

  if(this._askOn === 'console') {

     return this.askConsole(assertion);

  } else if (this._askOn === 'html') {

     return this.askHTMl(assertion);

  } else {
    // requested askOn not supported
    try {
      throw new Error("IIF Error: requested ASK handler not found: " + this._askOn);
    }
    catch (error) {
      throw error;
      return 0;
    }
  }
};

// ask then
Iif.prototype.thenAsk == function (assertion) {

  return this.ask(assertion);

};


// set or return a fact's asserted value
// a fact can be true, a number or a string value
Iif.prototype.facts = function (name, value) {
  if (value === true || value === false || value !== undefined) {
    this.factStack[name] = value;
    return value;
  } else {
    return this.factStack[name];
  }
};

Iif.prototype.ls = function (fact) {
  if(fact) {
    console.log(fact + ' is ' + this.facts(fact));
  } else {
    console.log('\n\nFacts for KB: ' + this.name);
    for (var thisFact in this.factStack) {
      console.log('\t\t' + thisFact + ' is ' + this.facts(thisFact));
    }
    console.log('\n\n');
  }


};

module.exports = Iif;
