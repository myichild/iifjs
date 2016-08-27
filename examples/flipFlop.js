var Iif = require('../src/Iif.js');
/* Flip flop Rules */

var rules = {
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

var flipFlop = new Iif();

flipFlop.load(rules);

flipFlop.run();

console.log('Executed ' + flipFlop.count + ' inference cycles');
