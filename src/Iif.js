/* iif function
  Inference if functionality

an inference function takes a knowledge base of procedural rules, facts, kbstate
and produces a conclusion from an initial state. States can be altered
as inference runs. Inference ends when no rule fires.

 kb = {locals: 'string', rules: {}, (facts, {}, kbstate {}) };

*/

var Iif = function () {

}

// load a knowledge base (rules plus facts)
Iif.prototype.load = function (kb) {
  this.name = kb.name || 'No Name Knowledge Base';
  var txt = kb.locals;
  eval(txt);
  this.rules = kb.rules;
  this.facts = kb.facts || {present: false};
  for (var r=0; r < kb.rules.length; r++) {
    kb.rules[r].fired = 0;
    if (!kb.rules[r].hasOwnProperty('repeatable')) {
      kb.rules[r].repeatable = false;
    }
  }
  this.kbstate = 'innactive';
  this.history = [];
  if(this.rules.constructor === Array) {
    this.kbLoaded = true;
  } else {
    this.kbLoaded = false;
  }
};

Iif.prototype.debug = function () {
  this.debug = false;
};

Iif.prototype.cycles = function () {
  this.cycles = 0;
};

Iif.prototype.maxCycles = function () {
  this.maxCycles = 1000;
};

Iif.prototype.log = function (message) {
  if (this.debug === true) {
    console.log(message);
  }
};

Iif.prototype.executeIf = function (ifClause) {
  return eval(ifClause);
};

Iif.prototype.executeThen = function (thenClause) {
  return eval(thenClause);
};

// run the inference
Iif.prototype.run = function () {
  try {
    if (!this.kbLoaded === true) {
      throw new Error("IFF Error: cannot run, no knowledge base loaded");
    }
  }
  catch (error) {
    throw error;
  }
  // run inference
  this.infer();
};

// infer()
// inference continues as long as a rule is fired
//
Iif.prototype.infer = function () {
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
    for(var i=0; i < this.rules.length; i++) {
      var rule = this.rules[i];
      // if the rule has not fired previously or if the rule is repeatable then check it
      if(rule.fired < 1 || rule.repeatable === true){
        this.log('Testing Rule: ' + rule.name + ', IIF => ' + rule.if);
        if (this.executeIf(rule.if)) {
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
            console.log('Setting Best Rule: ' + this.rules[this.best].name);
          }
        } // executeIf
      } // check fired or repeatable
    }// if loop
    //fire the best rule
    if (this.fired === true) {
      // execute the best rule's then clause
      this.executeThen(this.rules[this.best].then);
      this.kbstate = 'active';
      // update the rules fired counter
      this.rules[this.best].fired++;
      this.log('Fired rule: ' + this.best + ' => ' + this.rules[this.best].name);
      this.log('Fired State: ' + this.best + ' => ' + this.rules[this.best].fired);
      //console.log('Fired rule: ' + this.best);
    }
    if (this.debug === true) {
      this.log('PRIORITY => ' + this.priority);
      this.log('RUNNING => ' + this.running);
      this.log('FIRED => ' + this.fired);
      this.log('COUNT => ' + this.count);
    }
    this.cycles++;
  } while (this.fired === true && this.running === true);
  // clean up
  return this.cycles;
};

// find out the state of a fact from an outside source
Iif.prototype.ask = function (fact) {


};

module.exports = Iif;
