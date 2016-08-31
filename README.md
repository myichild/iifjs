# iifjs Inference IF Engine

## Simple Inference Engine for javascript

Enables you to include an inference function directly within your javascript
code.

## Use it for:

- Replacing complex procedural logic.

- Helping with Natural Language processing.

- Further analysis of machine learning output.

- Helping capture domain specific knowledge.

- Other ??

## Why Use An In Line Inference Engine

In some projects the logic needed to implement some business or application
rules becomes unwieldy when written as a set of IF statements. In these
situations I have found the inference IF approach useful. Depending on the
problem being addressed when the business rules count starts to exceed eight to
twelve rules it may be better to consider moving towards using a simple
engine like iifjs. A move to using an inference IF approach is a judgement call.

These are some guidelines I have followed for choosing to move logic into
and inference IF set of rules:

1. The business logic is still unfolding and your code already looks
like a rat's nest. Applying change or new rules is causing you severe brain
ache.

2. You have a lot of parameters involved in the decision flow.

3. In the middle of a nicely structured set of rules you find an almost
arbitrary condition that is difficult to accommodate neatly in your code.

4. The business rules have a number of layers and parameters are inferred from
a lower layer for use in a higher layer.

5. You encounter two or more business rules with overlapping parameters (or completely different parameters) that need to be arbitrated/prioritised in some
 way.

 All of these situations can be solved using in line coding of the rules but I
 have found having an inference IF to hand can shorten the coding and testing
 time. Your code becomes easier to read.

## History.

Originally this function was written in Forth (circa 1979) and used with a
Reuters Foreign Exchange price feed from a PDP-8. The price protocol structure changed with currency pairs, we spent six weeks not getting the in line code to
run reliably. Switching to a rule engine we had it working reliably in 48 hours.

 Since then I have rewritten in Perl and Ruby, using it within a number of
 software products and services.

## Installation

Download an install the file ../src/iif.js in your applications source of lib
directory.
