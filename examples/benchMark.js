// a simple benchmark example running 1 million inference cycles

  var Iif = require('../src/Iif.js');

  var benchMarkKB = {
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

var iif = new Iif();

iif.load(benchMarkKB);

var start = new Date();

iif.run();

var stop = new Date();

var lapsed = ((stop - start)/1000);

if(iif.done === true) {
  console.log("Test conducted OK");
} else {
console.log("Test failed to run");
}

// report the benchmark performance for one million cycles
console.log('Lapsed time for ' + iif.maxCycles + ' inference cycles = ' + lapsed + ' seconds.');
console.log('Inference Rate: ' + Math.floor((iif.cycles + 0)/lapsed) + ' rules per second.');


