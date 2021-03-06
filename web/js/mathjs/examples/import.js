/**
 * Math.js can easily be extended with functions and variables using the
 * `import` function. The function `import` accepts a module name or an object
 * containing functions and variables.
 */

// load math.js
var math = require('../index');

/**
 * Helper function to output a value in the console. Value will be formatted.
 * @param {*} value
 */
function print (value) {
  var precision = 14;
  console.log(math.format(value, precision));
}

/**
 * Define new functions and variables
 */
math.import({
  myConstant: 42,
  hello: function (name) {
    return 'hello, ' + name + '!';
  }
});

// defined methods can be used in both JavaScript as well as the parser
print(math.myConstant * 2);           // 84
print(math.hello('user'));            // 'hello, user!'

print(math.eval('myConstant + 10'));  // 52
print(math.eval('hello("user")'));    // 'hello, user!'


/**
 * Import the math library numbers.js, https://github.com/sjkaliski/numbers.js
 * The library must be installed first using npm:
 *     npm install numbers
 */
try {
  // import the numbers.js library into math.js
  math.import('numbers', {wrap: true});
}
catch (err) {
  console.log('Warning: to import numbers.js, the library must\n' +
      'be installed first via `npm install numbers`.');
}

if (math.fibonacci) {
  // calculate fibonacci
  print(math.fibonacci(7));           // 13
  print(math.eval('fibonacci(7)'));   // 13
}

/**
 * Import the math library numeric.js, http://numericjs.com/
 * The library must be installed first using npm:
 *     npm install numeric
 */
try {
  // import the numeric.js library into math.js
  math.import('numeric', {wrap: true});
}
catch (err) {
  console.log('Warning: to import numeric.js, the library must\n' +
      'be installed first via `npm install numeric`.');
}

if (math.eig) {
  // calculate eigenvalues of a matrix
  print(math.eval('eig([1, 2; 4, 3])').lambda.x); // [5, -1];

  // solve AX = b
  var A = math.eval('[1, 2, 3; 2, -1, 1; 3, 0, -1]');
  var b = [9, 8, 3];
  print(math.solve(A, b)); // [2, -1, 3]
}

/**
 * By default, the function import does not allow overriding existing functions.
 * Existing functions can be overridden by specifying option `override=true`
 */
math.import({
  pi: 3.14
}, {
  override: true
});

print(math.pi); // returns 3.14 instead of 3.141592653589793
