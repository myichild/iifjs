// Interactive test for ask on the command line
// this knowledge base shows how use ask: and thenAsk: clauses
// Note: Gathering 
var Iif = require('../src/Iif.js');

var iif = new Iif();

var askFacts = {
  name: "Testing ASK clauses",
  properties: "",
  facts: {"_present": true, "adult": true}, // initialised facts
  rules: [
    {
      name: "Test for Child",
      priority: 100,
      repeatable: false,
      ask: "you are a child",
      then: "this.facts('adult', false);this.log('Child');", // change existing fact
      thenAsk: "you are female"
    },
    {
      name: "Test for girl likes computer games",
      priority: 90,
      repeatable: false,
      if: "this.facts('you are a child') === true && this.facts('you are female') === true",
      ask: "computer games are cool",
      then: "this.facts('gender', 'female');this.log('Female');" // add a new fact
    },
    {
      name: "Test girl likes the colour Pink",
      priority: 80,
      repeatable: false,
      if: "this.facts('you are female') === true && this.facts('you are a child') === true",
      thenAsk: "you like pink", // a thenAsk: is tested before then: is run
      then: "this.facts('likes pink', true);this.log('Pink');" // add another new fact
    }
  ]
};

iif.load(askFacts);

iif.askOn('console');

iif.debug = false;

iif.run();

iif.ls();


