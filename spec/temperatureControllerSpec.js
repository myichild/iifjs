var Iif = require('../src/Iif.js');

/* tests for temp controller rules */

describe("Temperature controller rules", function () {

/* Simple controller for heating
  these rules arbitrate between solar gain, loss through windSpeed
  loss via outside air temperature and the thermal capacity of the
  volume being controlled.

  The target is a volume whose temperature
*/

// Object properties are built as string concatinations *outside* the kb object
// string + string across multiple lines does not work inside an object
// declaration.
var txt =    "this.targetTemp = 22;" +
             "this.currentTemp = 22;" +
             "this.externalTemp = 12;" +
             "this.solarGain = 28;" +
             "this.thermalImpedance = 1;" + // loss/gain in joules/hour/M^3
             "this.windSpeed = 9;" + // miles per hour " +
             "this.windLoss = 20;" + // joules loss per mile per hour windspeed
             "this.stepResponse = 20;" + // time for temp to rise 80%
             "this.energy = 0;" + // the amount of energy to add/remove
             "this.action = '';" + // boost-heat, heat, no-change, cool, boost-cool" +
             "this.addEnergy = function () { return 20; };";

  var kbTempController = {
    properties: txt,
    name: "Temperature controller simple example",
    rules: [
      { name: 'Boost Heat',
        if: 'this.currentTemp < this.targetTemp && this.targetTemp - this.currentTemp > + 7',
        then: 'this.action = "boost-heat"; this.energy = this.addEnergy();',
        priority: 11,
        because: 'Conditions for boost-heat detected'
      },
      { name: 'Normal Heat',
        if: 'this.currentTemp < this.targetTemp',
        then: 'this.action = "heat"; this.energy = this.addEnergy()',
        priority: 10,
        because: 'Conditions for normal heat application detected'
      },
      { name: 'No Heat',
        if: 'this.currentTemp > this.targetTemp * 0.99 &&' +
             'this.currentTemp < this.targetTemp * 1.01',
        then: 'this.action = "no-change", this.energy = 0',
        priority: 9,
        because: 'Conditions require no heating or cooling detected'
      },
      { name: 'Conclusion',
        if: 'this.action != ""',
        then: 'this.running = false',
        priority: 1,
        because: 'A conclusion has been reached'
      }/*,
      { name:
        if: '',
        then: '',
        priority: 1,
        because: 'Run the model of the environment'
      }/*,
*/
    ],
  };

  // the rules use a model of a building with a temperature response time
  var buildingSIM = function (power, nt) {

  };

  beforeEach( function () {
  iifTC = new Iif();
  iifTC.load(kbTempController);
  });

  it("Should load the temperature controller rules", function () {
    expect(iifTC.name).toMatch(/simple example/);
    expect(iifTC.targetTemp).toBe(22);
    expect(iifTC.addEnergy).toBeDefined();

  });

  it("Should run without any input data for one cycle", function () {
    // default settings require no-change to energy input or output
    // iifTC.debug = true;
    iifTC.run();
    console.log('Action: => ' + iifTC.action);
    expect(iifTC.cycles).toBe(2); // the stop rule ended the inference
    expect(iifTC.action).toBe('no-change');
    expect(iifTC.energy).toBe(0);
    iifTC.debug = false;
  });

  it("Should conclude no-change when currentTemp = 22", function () {
    // iifTC.debug = true;
    iifTC.currentTemp = 22;
    iifTC.run();
    console.log('Action: => ' + iifTC.action);
    expect(iifTC.cycles).toBe(2); // the stop rule ended the inference
    expect(iifTC.action).toBe('no-change');
    iifTC.debug = false;
  });

  it("Should conclude no-change when currentTemp = 21.78", function () {
    // iifTC.debug = true;
    iifTC.currentTemp = 21.79;
    iifTC.run();
    console.log('Action: => ' + iifTC.action);
    expect(iifTC.cycles).toBe(2); // the stop rule ended the inference
    expect(iifTC.action).toBe('no-change');
    iifTC.debug = false;
  });

  it("Should conclude no-change when currentTemp = 21.7", function () {
    // iifTC.debug = true;
    iifTC.currentTemp = 21.7;
    iifTC.run();
    console.log('Action: => ' + iifTC.action);
    expect(iifTC.cycles).toBe(2); // the stop rule ended the inference
    expect(iifTC.action).toBe('heat');
    iifTC.debug = false;
  });



  // it("should fail this test", function () {
  //   expect(false).toBe(true);
  // });


});
