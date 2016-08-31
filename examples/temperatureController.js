var Iif = require('../src/Iif.js');
/* temperature controller */

TempController = function (T) {

T = T || 22;

var props =  "this.targetTemp = 22;" +
             "this.currentTemp = T;" +
             "this.externalTemp = 12;" +
             "this.solarGain = 28;" +
             "this.thermalImpedance = 1;" + // loss/gain in joules/hour/M^3
             "this.windSpeed = 9;" + // miles per hour " +
             "this.windLoss = 20;" + // joules loss per mile per hour windspeed
             "this.stepResponse = 20;" + // time for temp to rise 80%
             "this.energy = 0;" + // the amount of energy to add/remove
             "this.action = '';" + // boost-heat, heat, no-change, cool, boost-cool" +
             "this.addEnergy = function () { return 20; };";

  var rules = {
    properties: props,
    name: "Temperature controller simple example",
    rules: [
      { name: 'Boost Heat',
        if: 'this.targetTemp - this.currentTemp > + 7',
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
      { name: 'Cooling',
        if: 'this.CurrentTemp > 1.01 * this.targetTemp',
        then: 'this.action = "open-window"',
        priority: 1,
        because: 'Who needs AC when you live in England'
      }/*,
*/
    ],
  };

  var tcKB = tcKB || new Iif();

  tcKB.load(rules)
  tcKB.run();

};
