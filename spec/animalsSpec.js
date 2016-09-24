/* backward chaining inference */

var = animals = [
{ if: 'it has hair',
  then: 'it is a mammal'},
{ if: 'it gives milk',
  then: 'it is a mammal'},
{ if: 'it has feathers',
  then: 'it is a bird'},
{ if: 'it flies',
  andif: ['it lays eggs'],
  then: 'it is a bird'},
{ if: 'it is a mammal',
  andif: ['it eats meat'],
  then: 'it is a carnivore'},
{ if: 'it is a mammal',
  andif: ['it has pointed teeth'],
  then: 'it is a carnivore'},
{ if: 'it is a mammal',
  andif: ['it has hoofs'],
  then: 'it is an ungulate'},
{ if: 'it is a mammal',
  andif: ['it chews cud'],
  then: 'it is an ungulate'},
{ if: 'it is a carnivor',
  andif: ['it has dark spots'],
  thenhype: 'it is a cheetah'},
{ if: 'it is a carnivor',
  andif: ['it has black stripes'],
  thenhyp: 'it is a tiger'},
{ if: 'it is an ungulate',
  andif: ['it has a long neck'],
  thenhyp: 'it is a giraffe'},
{ if: 'it is an ungulate',
  andif: ['it has black stripes'],
  thenhyp: 'it is a zebra'},
{ if: 'it is a bird',
  andnot: ['it flies'],
  andif: ['has long legs', 'has long neck', 'is black and white'],
  thenhype: 'it is an ostrich'},
{ if: 'it is a bird',
  andnot: ['it flies'],
  andif: ['it swims', 'is black and white'],
  thenhype: 'it is an penguin'},
{ if: 'it is a bird',
  andif: ['it is a good flier'],
  thenhype: 'it is an albatross'}

];