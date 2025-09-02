# JSON Expressions

A powerful JavaScript expression engine for JSON-based dynamic computations and function composition. JSON Expressions provides a declarative syntax for creating complex logic, transformations, and calculations that can be serialized, stored, and executed safely.

Perfect for configuration-driven applications, business rules engines, and anywhere you need dynamic logic represented as data. Inspired by the Lisp concept of data as code.

## Overview

JSON Expressions is built around several key principles:

- **Serializable Logic**: Express complex computations as JSON that can be stored, transmitted, and versioned
- **Composable**: Build complex logic by combining simple expressions using `$pipe` and `$compose`
- **Extensible**: Easily add custom expressions
- **Safe Evaluation**: Controlled execution environment without the risks of `eval()`
- **Type-Aware**: Rich set of expressions for different data types (numbers, strings, arrays, objects)
- **Dual Execution Modes**: Apply expressions to input data, or evaluate them standalone

## Core Concepts

### Expressions

Expressions are JSON objects that describe computations to be performed on data. Each expression has a single key that identifies the expression type (prefixed with `$`) and a value that provides the parameters:

Simple comaprison:
```json
{ "$gt": 18 }
```

Logical expressions:
```json
{ "$and": [
  { "$gt": 80 },
  { "$lt": 5 }
]}
```

Conditional logic:
```json
{ "$if": {
  "if": { "$eq": "active" },
  "then": { "$get": "fullName" },
  "else": "Inactive User"
}}
```

### Expression Engine

The expression engine holds the expression definitions and provides two main execution modes:

#### `apply(expression, inputData)`

Applies the expression like a function to input data.

```javascript
import { defaultExpressionEngine } from "json-expressions";

const expression = { $gt: 21 };
const data = 25;

const result = defaultExpressionEngine.apply(expression, data);
// Returns: true
```

#### `evaluate(expression)`

Takes an expression and evaluates it independently, returning a value wholly determined by the expression itself. It is not applied to input data, but is fully self-contained.

```javascript
// Evaluate expressions without input data (for static expressions)
const staticResult = defaultExpressionEngine.evaluate({ $sum: [1, 2, 3] });
// Returns: 6
```

## API Reference

### Core Functions

#### `createExpressionEngine(definitions, mergeDefaults)`

Creates a custom expression engine with expression definitions.

**Parameters:**

- `definitions` (object) - Custom expression definitions to add to the engine
- `mergeDefaults` (boolean, optional) - Whether to include core definitions in the engine (default: true)

**Returns:** ExpressionEngine with custom expressions (and core expressions if mergeDefaults is true)

```javascript
import { createExpressionEngine } from "json-expressions";

// Create engine with custom expressions + core expressions (default)
const customEngine = createExpressionEngine({
  $customOp: {
    apply: (operand, inputData) => {
      // Custom expression logic
      return operand + inputData;
    },
    evaluate: (operand) => {
      // Static evaluation logic
      return operand * 2;
    },
  },
});

// Create engine with only custom expressions (no core expressions)
const customOnlyEngine = createExpressionEngine(
  {
    $customOp: {
      apply: (operand, inputData) => operand + inputData,
      evaluate: (operand) => operand * 2,
    },
  },
  false,
);
```

#### `defaultExpressionEngine`

Pre-configured expression engine with all built-in expressions.

```javascript
import { defaultExpressionEngine } from "json-expressions";

const result = defaultExpressionEngine.apply(expression, data);
```

### ExpressionEngine Methods

#### `apply(expression, inputData)`

Evaluates an expression against input data.

**Parameters:**

- `expression` (Expression) - The expression to evaluate
- `inputData` (any) - The input data context for evaluation

**Returns:** Result of the expression evaluation

```javascript
const expression = { $sum: [10, 20] };
const data = null; // Not used for this static expression

const result = engine.apply(expression, data);
// Returns: 30
```

#### `evaluate(expression)`

Evaluates an expression without input data (for static expressions).

**Parameters:**

- `expression` (Expression) - The expression to evaluate

**Returns:** Static result of the expression

```javascript
const expression = { $sum: [10, 20] };
const result = engine.evaluate(expression);
// Returns: 30
```

#### `isExpression(value)`

Tests whether a value is a valid expression.

**Parameters:**

- `value` (any) - The value to test

**Returns:** Boolean indicating if the value is an expression

```javascript
const isExpr1 = engine.isExpression({ $get: "name" }); // true
const isExpr2 = engine.isExpression({ name: "Juan" }); // false
```

#### `expressionNames`

Array of all available expression names.

```javascript
console.log(engine.expressionNames);
// Returns: ["$get", "$add", "$eq", "$and", ...]
```

## Built-in Expressions

### Core Expressions

#### `$compose`

Composes multiple expressions together using mathematical composition order (right-to-left). The expressions are applied in the order `f(g(h(x)))` where `[f, g, h]` means `f` applied to the result of `g` applied to the result of `h` applied to `x`.

**Apply form:**

```javascript
apply(
  {
    $compose: [
      { $map: { $get: "name" } }, // f: map to names
      { $filter: { $gte: 18 } }, // g: filter adults
      { $get: "users" }, // h: get users
    ],
  },
  data,
);
```

**Evaluate form:**

```javascript
evaluate({
  $compose: [
    [{ $add: 1 }, { $multiply: 2 }], // expressions array
    5, // initial value
  ],
});
// Returns: 11 (multiply(2, add(1, 5)))
```

#### `$debug`

Evaluates an expression, logs the result to console, and returns the result (useful for debugging intermediate values in expression chains).

```javascript
apply({ $debug: { $get: "name" } }, data); // Logs the value of data.name, returns data.name
evaluate({ $debug: { $sum: [1, 2, 3] } }); // Logs 6, returns 6
```

#### `$ensurePath`

Validates that a path exists in the data, throwing an error if not found.

**Apply form:**

```javascript
apply({ $ensurePath: "user.profile.email" }, data); // Throws if path doesn't exist
```

**Evaluate form:**

```javascript
evaluate({ $ensurePath: [data, "user.profile.email"] }); // Throws if path doesn't exist
```

#### `$get`

Retrieves a value from the data object using lodash-style path notation.

**Apply form:**

```javascript
apply({ $get: "name" }, data); // Gets data.name
apply({ $get: "user.age" }, data); // Gets data.user.age (nested path)
```

**Evaluate form:**

```javascript
evaluate({ $get: [data, "user.age"] }); // Gets data.user.age
```

#### `$isDefined`

Tests whether the input data is defined (not undefined).

**Apply form:**

```javascript
apply({ $isDefined: null }, data); // Returns true if data !== undefined
```

**Evaluate form:**

```javascript
evaluate({ $isDefined: [someValue] }); // Returns true if someValue !== undefined
```

#### `$literal`

Returns a literal value (useful when you need to pass a value that might be confused with an expression).

```javascript
apply({ $literal: { $get: "not-an-expression" } }, data);
evaluate({ $literal: { $get: "not-an-expression" } });
// Both return: { "$get": "not-an-expression" }
```

#### `$pipe`

Pipes data through multiple expressions using pipeline order (left-to-right). The expressions are applied in the order `h(g(f(x)))` where `[f, g, h]` means `f` applied to `x`, then `g` applied to that result, then `h` applied to that result.

**Apply form:**

```javascript
apply(
  {
    $pipe: [
      { $get: "users" }, // f: get users
      { $filter: { $gte: 18 } }, // g: filter adults
      { $map: { $get: "name" } }, // h: map to names
    ],
  },
  data,
);
```

**Evaluate form:**

```javascript
evaluate({
  $pipe: [
    [{ $add: 1 }, { $multiply: 2 }], // expressions array
    5, // initial value
  ],
});
// Returns: 12 (multiply(2, add(1, 5)))
```

**Note**: `$pipe` is often more intuitive as it matches the natural reading order, while `$compose` follows mathematical function composition conventions.

### Conditional Expressions

JSON Expressions provides two distinct conditional operators that handle different matching scenarios:

#### `$switch` - Deep Equality Matching

Switch-like expression for deep equality comparisons. Use when you need to match against specific values, including complex objects and arrays.

```javascript
apply(
  {
    $switch: {
      value: { $get: "activity" },
      cases: [
        { when: "playing", then: "Child is playing" },
        { when: "napping", then: "Child is napping" },
        { when: "eating", then: "Child is eating" },
      ],
      default: "Unknown activity",
    },
  },
  data,
);
```

**Key characteristics:**
- Deep equality comparison for objects, arrays, and primitives
- Handles complex nested structures
- Simple and efficient for value-based routing
- `when` parameter accepts any value type for comparison

**Deep equality examples:**

```javascript
// Object matching
apply(
  {
    $switch: {
      value: { name: "Amina", age: 4, allergies: ["peanuts"] },
      cases: [
        { when: { name: "Amina", age: 4, allergies: ["peanuts"] }, then: "Amina found" },
        { when: { name: "Chen", age: 3, allergies: [] }, then: "Chen found" },
      ],
      default: "Child not found",
    },
  },
  data,
);

// Array matching
apply(
  {
    $switch: {
      value: ["apple", "crackers", "juice"],
      cases: [
        { when: ["apple", "crackers", "juice"], then: "Full snack" },
        { when: ["banana", "crackers"], then: "Light snack" },
      ],
      default: "Unknown meal",
    },
  },
  data,
);
```

**Evaluate form:**
```javascript
evaluate({
  $switch: [
    {
      value: "playing",
      cases: [{ when: "playing", then: "Child is playing" }],
      default: "Unknown activity",
    },
  ],
});
```

#### `$case` - Boolean Predicate Matching

Conditional expression for complex logic and boolean predicates. Use when you need conditional logic based on expressions that evaluate to true/false.

```javascript
apply(
  {
    $case: {
      value: { $get: "age" },
      cases: [
        { when: { $lt: 3 }, then: "Toddler" },
        { when: { $and: [{ $gte: 3 }, { $lt: 5 }] }, then: "Preschooler" },
        { when: { $gte: 5 }, then: "School age" },
      ],
      default: "Unknown age group",
    },
  },
  data,
);
```

**Key characteristics:**
- **Boolean validation**: `when` expressions must resolve to `true` or `false`
- Supports complex conditional logic with comparison and logical operators
- Throws error if `when` expression doesn't return a boolean
- More flexible but slower than `$switch`

**Evaluate form:**
```javascript
evaluate({
  $case: [
    {
      value: 4,
      cases: [
        { when: { $lt: 3 }, then: "Toddler" },
        { when: { $gte: 3 }, then: "Preschooler" },
      ],
      default: "Unknown",
    },
  ],
});
// Returns: "Preschooler"
```

**Error handling:**
```javascript
// This throws an error because "string" is not a boolean
apply(
  {
    $case: {
      value: 5,
      cases: [{ when: "string", then: "Result" }],
      default: "Default",
    },
  },
  data,
);
// Throws: "$case.when must resolve to a boolean, got "string""
```

**When to use which:**
- Use `$switch` for value matching with deep equality (objects, arrays, primitives, enums)
- Use `$case` for conditional logic (ranges, complex conditions, boolean expressions)

#### `$if`

Conditional expression that evaluates different branches based on a condition.

```javascript
apply(
  {
    $if: {
      if: { $gte: 18 },
      then: "Adult",
      else: "Minor",
    },
  },
  data,
);
```

**Evaluate form:**

```javascript
evaluate({
  $if: {
    if: true,
    then: "Adult",
    else: "Minor",
  },
});
// Returns: "Adult"
```

### Logical Expressions

#### `$and`

Logical AND expression - all expressions must be truthy.

```javascript
apply({ $and: [{ $gt: 18 }, { $eq: "active" }] }, data);
```

#### `$not`

Logical NOT expression - inverts the truthiness of an expression.

```javascript
apply({ $not: { $eq: true } }, data);
evaluate({ $not: false }); // Returns: true
```

#### `$or`

Logical OR expression - at least one expression must be truthy.

```javascript
apply({ $or: [{ $eq: "admin" }, { $eq: "moderator" }] }, data);
```

### Comparison Expressions

All comparison expressions use mathematical abbreviations for consistency and brevity.

#### `$eq`

Equality comparison using deep equality.

**Apply form:**

```javascript
apply({ $eq: "published" }, data); // data === "published"
```

**Evaluate form:**

```javascript
evaluate({ $eq: ["published", "published"] }); // Returns: true
```

#### `$gt` / `$gte` / `$lt` / `$lte`

Numerical comparison expressions.

**Apply form:**

```javascript
apply({ $gt: 90 }, data); // data > 90
apply({ $gte: 18 }, data); // data >= 18
apply({ $lt: 100 }, data); // data < 100
apply({ $lte: 3 }, data); // data <= 3
```

**Evaluate form:**

```javascript
evaluate({ $gt: [95, 90] }); // Returns: true
evaluate({ $gte: [18, 18] }); // Returns: true
```

#### `$in` / `$nin`

Array membership tests.

**Apply form:**

```javascript
apply({ $in: ["tech", "science", "math"] }, data); // data is in array
apply({ $nin: ["deleted", "archived"] }, data); // data is not in array
```

**Evaluate form:**

```javascript
evaluate({ $in: [["tech", "science"], "tech"] }); // Returns: true
evaluate({ $nin: [["deleted", "archived"], "tech"] }); // Returns: true
```

#### `$ne`

Inequality comparison using deep equality.

**Apply form:**

```javascript
apply({ $ne: "draft" }, data); // data !== "draft"
```

**Evaluate form:**

```javascript
evaluate({ $ne: ["draft", "published"] }); // Returns: true
```

### Pattern Matching Expressions

#### `$matchesRegex`

Tests if a string matches a regular expression pattern with PCRE semantics.

**Features:**

- Supports inline flags: `(?i)` (case insensitive), `(?m)` (multiline), `(?s)` (dotall)
- PCRE defaults: case-sensitive, string boundaries for ^ and $, . doesn't match newlines

**Apply form:**

```javascript
apply({ $matchesRegex: "\\d+" }, "abc123"); // Returns: true
apply({ $matchesRegex: "(?i)hello" }, "HELLO WORLD"); // Returns: true (case insensitive)
```

**Evaluate form:**

```javascript
evaluate({ $matchesRegex: ["\\d+", "abc123"] }); // Returns: true
```

#### `$matchesLike`

Tests if a string matches a SQL LIKE pattern.

**Features:**

- `%` matches any sequence of characters (including none)
- `_` matches exactly one character
- Case-sensitive matching

**Apply form:**

```javascript
apply({ $matchesLike: "hello%" }, "hello world"); // Returns: true
apply({ $matchesLike: "h_llo" }, "hello"); // Returns: true
```

**Evaluate form:**

```javascript
evaluate({ $matchesLike: ["hello%", "hello world"] }); // Returns: true
```

#### `$matchesGlob`

Tests if a string matches a Unix shell GLOB pattern.

**Features:**

- `*` matches any sequence of characters
- `?` matches exactly one character
- `[chars]` matches any single character in the set
- `[!chars]` or `[^chars]` matches any character not in the set

**Apply form:**

```javascript
apply({ $matchesGlob: "*.txt" }, "file.txt"); // Returns: true
apply({ $matchesGlob: "[hw]ello" }, "hello"); // Returns: true
```

**Evaluate form:**

```javascript
evaluate({ $matchesGlob: ["*.txt", "file.txt"] }); // Returns: true
```

### Aggregative Expressions

#### `$count`

Count of items in an array.

```javascript
apply({ $count: null }, [1, 2, 3, 4]); // Returns: 4
evaluate({ $count: [1, 2, 3, 4] }); // Returns: 4
```

#### `$max` / `$min`

Maximum/minimum of array values.

```javascript
apply({ $max: null }, [1, 5, 3, 9]); // Returns: 9
apply({ $min: null }, [1, 5, 3, 9]); // Returns: 1
evaluate({ $max: [1, 5, 3, 9] }); // Returns: 9
```

Returns `undefined` for empty arrays.

#### `$mean`

Arithmetic mean (average) of array values.

```javascript
apply({ $mean: null }, [1, 2, 3, 4, 5]); // Returns: 3
evaluate({ $mean: [1, 2, 3, 4, 5] }); // Returns: 3
```

Returns `undefined` for empty arrays.

#### `$median`

Median (middle value) of array values.

```javascript
apply({ $median: null }, [1, 2, 3, 4, 5]); // Returns: 3
apply({ $median: null }, [1, 2, 3, 4]); // Returns: 2.5 (average of middle two)
evaluate({ $median: [1, 2, 3, 4, 5] }); // Returns: 3
```

Returns `undefined` for empty arrays.

#### `$mode`

Mode (most frequent value) of array values.

```javascript
apply({ $mode: null }, [1, 2, 2, 3, 4]); // Returns: 2 (single mode)
apply({ $mode: null }, [1, 1, 2, 2, 3]); // Returns: [1, 2] (multiple modes)
apply({ $mode: null }, [1, 2, 3, 4, 5]); // Returns: undefined (no mode)
evaluate({ $mode: [1, 2, 2, 3, 4] }); // Returns: 2
```

Returns the single mode value, array of multiple modes, or `undefined` if no mode exists.

#### `$sum`

Sum of array values.

```javascript
apply({ $sum: null }, [1, 2, 3, 4]); // Returns: 10
evaluate({ $sum: [1, 2, 3, 4] }); // Returns: 10
```

### Iterative Expressions

#### `$all`

Tests if all elements in an array satisfy a predicate (similar to Array.every).

**Apply form:**

```javascript
apply({ $all: { $gt: 0 } }, [1, 2, 3, 4]); // Returns: true (all items > 0)
```

**Evaluate form:**

```javascript
evaluate({ $all: [{ $gt: 0 }, [1, 2, 3, 4]] }); // Returns: true
```

#### `$any`

Tests if any element in an array satisfies a predicate (similar to Array.some).

**Apply form:**

```javascript
apply({ $any: { $gt: 50 } }, [10, 60, 30]); // Returns: true (any item > 50)
```

**Evaluate form:**

```javascript
evaluate({ $any: [{ $gt: 50 }, [10, 60, 30]] }); // Returns: true
```

#### `$append`

Appends an array to the end of another array.

**Apply form:**

```javascript
apply({ $append: [4, 5] }, [1, 2, 3]); // Returns: [1, 2, 3, 4, 5]
```

**Evaluate form:**

```javascript
evaluate({
  $append: [
    [4, 5],
    [1, 2, 3],
  ],
}); // Returns: [1, 2, 3, 4, 5]
```

#### `$filter`

Filter array items based on a condition.

**Apply form:**

```javascript
apply({ $filter: { $gt: 50 } }, [10, 60, 30, 80]); // Returns: [60, 80]
```

**Evaluate form:**

```javascript
evaluate({ $filter: [{ $gt: 50 }, [10, 60, 30, 80]] }); // Returns: [60, 80]
```

#### `$find`

Returns the first element in an array that satisfies a predicate, or undefined if none found.

**Apply form:**

```javascript
apply({ $find: { $eq: "target" } }, ["a", "target", "b"]); // Returns: "target"
```

**Evaluate form:**

```javascript
evaluate({ $find: [{ $eq: "target" }, ["a", "target", "b"]] }); // Returns: "target"
```

#### `$flatMap`

Transform and flatten array items.

**Apply form:**

```javascript
apply({ $flatMap: { $get: "items" } }, [{ items: [1, 2] }, { items: [3, 4] }]); // Returns: [1, 2, 3, 4]
```

**Evaluate form:**

```javascript
evaluate({
  $flatMap: [{ $get: "items" }, [{ items: [1, 2] }, { items: [3, 4] }]],
});
```

#### `$join`

Joins array elements into a string with a separator.

**Apply form:**

```javascript
apply({ $join: ", " }, [1, 2, 3]); // Returns: "1, 2, 3"
apply({ $join: "" }, ["a", "b", "c"]); // Returns: "abc"
```

**Evaluate form:**

```javascript
evaluate({ $join: [", ", [1, 2, 3]] }); // Returns: "1, 2, 3"
```

#### `$map`

Transform each item in an array.

**Apply form:**

```javascript
apply({ $map: { $get: "name" } }, [{ name: "Alice" }, { name: "Bob" }]);
// Returns: ["Alice", "Bob"]
```

**Evaluate form:**

```javascript
evaluate({ $map: [{ $get: "name" }, [{ name: "Alice" }, { name: "Bob" }]] });
```

#### `$prepend`

Prepends an array to the beginning of another array (reverses the order of `$append`).

**Apply form:**

```javascript
apply({ $prepend: [4, 5] }, [1, 2, 3]); // Returns: [4, 5, 1, 2, 3]
```

**Evaluate form:**

```javascript
evaluate({
  $prepend: [
    [4, 5],
    [1, 2, 3],
  ],
}); // Returns: [4, 5, 1, 2, 3]
```

#### `$reverse`

Returns a new array with elements in reverse order.

**Apply form:**

```javascript
apply({ $reverse: {} }, [1, 2, 3]); // Returns: [3, 2, 1]
```

**Evaluate form:**

```javascript
evaluate({ $reverse: [1, 2, 3] }); // Returns: [3, 2, 1]
```

### Math Expressions

All math expressions support both apply and evaluate forms with different operand structures.

#### `$add`

Binary addition expression.

**Apply form** (operates on input data):

```javascript
apply({ $add: 3 }, 5); // Returns: 8 (5 + 3)
apply({ $add: -2 }, 10); // Returns: 8 (10 + (-2))
```

**Evaluate form** (pure calculation):

```javascript
evaluate({ $add: [5, 3] }); // Returns: 8
evaluate({ $add: [1, -2] }); // Returns: -1
```

#### `$subtract`

Binary subtraction expression.

**Apply form:**

```javascript
apply({ $subtract: 3 }, 10); // Returns: 7 (10 - 3)
apply({ $subtract: -2 }, 5); // Returns: 7 (5 - (-2))
```

**Evaluate form:**

```javascript
evaluate({ $subtract: [10, 3] }); // Returns: 7
evaluate({ $subtract: [5, -2] }); // Returns: 7
```

#### `$multiply`

Binary multiplication expression.

**Apply form:**

```javascript
apply({ $multiply: 3 }, 5); // Returns: 15 (5 * 3)
apply({ $multiply: 0.5 }, 4); // Returns: 2 (4 * 0.5)
```

**Evaluate form:**

```javascript
evaluate({ $multiply: [6, 7] }); // Returns: 42
evaluate({ $multiply: [5, 0] }); // Returns: 0
```

#### `$divide`

Binary division expression.

**Apply form:**

```javascript
apply({ $divide: 3 }, 15); // Returns: 5 (15 / 3)
apply({ $divide: 0.5 }, 1); // Returns: 2 (1 / 0.5)
```

**Evaluate form:**

```javascript
evaluate({ $divide: [15, 3] }); // Returns: 5
evaluate({ $divide: [1, 0.5] }); // Returns: 2
```

Throws "Division by zero" error for zero divisors.

#### `$modulo`

Binary modulo (remainder) expression.

**Apply form:**

```javascript
apply({ $modulo: 3 }, 10); // Returns: 1 (10 % 3)
apply({ $modulo: 4 }, 15); // Returns: 3 (15 % 4)
```

**Evaluate form:**

```javascript
evaluate({ $modulo: [10, 3] }); // Returns: 1
evaluate({ $modulo: [15, 4] }); // Returns: 3
```

Throws "Modulo by zero" error for zero divisors.

### Generative Expressions

#### `$random`

Generates a random number with optional range and precision control.

```javascript
apply({ $random: {} }, null); // 0 to 1 (default)
apply({ $random: { min: 10, max: 20 } }, null); // 10 to 20 range
apply({ $random: { min: 0, max: 1, precision: 2 } }, null); // 2 decimal places (0.XX)
apply({ $random: { min: 0, max: 100, precision: 0 } }, null); // Integers (0 decimal places)
apply({ $random: { min: 0, max: 1000, precision: -1 } }, null); // Round to nearest 10

evaluate({ $random: { min: 10, max: 20, precision: 0 } }); // Random integer 10-19
```

**Parameters:**

- `min` (default: 0): Minimum value (inclusive)
- `max` (default: 1): Maximum value (exclusive)
- `precision` (default: null): Decimal places for positive values, or power of 10 for negative values
  - `precision: 2` → 2 decimal places (0.01 precision)
  - `precision: 0` → integers (1.0 precision)
  - `precision: -1` → round to nearest 10
  - `precision: null` → no rounding (full precision)

#### `$uuid`

Generates a unique UUID v4 string.

```javascript
apply({ $uuid: null }, null); // Returns UUID like "f47ac10b-58cc-4372-a567-0e02b2c3d479"
evaluate({ $uuid: null }); // Returns UUID like "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

The operand is ignored - this expression always generates a new UUID.

### Temporal Expressions

#### `$nowLocal`

Returns the current date and time as a local RFC3339 string with timezone offset.

```javascript
apply({ $nowLocal: null }, null); // Returns "2024-01-01T05:00:00.000-07:00"
evaluate({ $nowLocal: null }); // Returns "2024-01-01T05:00:00.000-07:00"
```

#### `$nowUTC`

Returns the current date and time as a UTC RFC3339 string.

```javascript
apply({ $nowUTC: null }, null); // Returns "2024-01-01T12:00:00.000Z"
evaluate({ $nowUTC: null }); // Returns "2024-01-01T12:00:00.000Z"
```

#### `$timestamp`

Returns the current timestamp as a number (milliseconds since Unix epoch).

```javascript
apply({ $timestamp: null }, null); // Returns current timestamp like 1704067200000
evaluate({ $timestamp: null }); // Returns current timestamp like 1704067200000
```

All temporal expressions ignore their operand and return the current time when evaluated.

## Examples

### Basic Usage

```javascript
import { defaultExpressionEngine } from "json-expressions";

const daycareData = {
  teacher: { name: "Ahmed", age: 28 },
  children: [
    { name: "Ximena", age: 4, activity: "playing" },
    { name: "Kwame", age: 5, activity: "napping" },
    { name: "Aisha", age: 3, activity: "eating" },
    { name: "Hiroshi", age: 4, activity: "reading" },
  ],
  dailyMeals: [
    { meal: "breakfast", cost: 8.5 },
    { meal: "lunch", cost: 12.75 },
    { meal: "snack", cost: 4.25 },
  ],
};

// Check if teacher is adult
const isAdult = defaultExpressionEngine.apply(
  { $gte: 18 },
  daycareData.teacher.age,
);
// Returns: true

// Get teacher name
const teacherName = defaultExpressionEngine.apply(
  { $get: "name" },
  daycareData.teacher,
);
// Returns: "Ahmed"

// Calculate total daily meal cost using static evaluation
const mealCosts = daycareData.dailyMeals.map((meal) => meal.cost);
const totalMealCost = defaultExpressionEngine.evaluate({ $sum: mealCosts });
// Returns: 25.5

// Calculate average meal cost
const avgMealCost = defaultExpressionEngine.evaluate({ $mean: mealCosts });
// Returns: 8.5

// Get median meal cost
const medianMealCost = defaultExpressionEngine.evaluate({
  $median: mealCosts,
});
// Returns: 8.5

// Get names of children old enough for pre-K (4+) using pipe (left-to-right)
const preKChildren = defaultExpressionEngine.apply(
  {
    $pipe: [
      { $get: "children" },
      { $filter: { $pipe: [{ $get: "age" }, { $gte: 4 }] } },
      { $map: { $get: "name" } },
    ],
  },
  daycareData,
);
// Returns: ["Ximena", "Hiroshi"]

// Same operation using compose (right-to-left)
const preKChildrenComposed = defaultExpressionEngine.apply(
  {
    $compose: [
      { $map: { $get: "name" } },
      { $filter: { $pipe: [{ $get: "age" }, { $gte: 4 }] } },
      { $get: "children" },
    ],
  },
  daycareData,
);
// Returns: ["Ximena", "Hiroshi"]

// Determine child's activity status using $switch for exact matching
const activityStatus = defaultExpressionEngine.apply(
  {
    $switch: {
      value: { $get: "activity" },
      cases: [
        { when: "playing", then: "Child is playing with toys" },
        { when: "napping", then: "Child is taking a nap" },
        { when: "eating", then: "Child is having a meal" },
        { when: "reading", then: "Child is reading a book" },
      ],
      default: "Unknown activity",
    },
  },
  { activity: "playing" },
);
// Returns: "Child is playing with toys"

// Age-based classification using $case for range conditions  
const ageGroup = defaultExpressionEngine.apply(
  {
    $case: {
      value: { $get: "age" },
      cases: [
        { when: { $lt: 3 }, then: "Toddler" },
        { when: { $and: [{ $gte: 3 }, { $lt: 5 }] }, then: "Preschooler" },
        { when: { $gte: 5 }, then: "School age" },
      ],
      default: "Unknown age group",
    },
  },
  { age: 4 },
);
// Returns: "Preschooler"

// Generate random snack portions
const randomPortion = defaultExpressionEngine.apply({ $random: {} }, null);
// Returns: 0.7234 (random number 0-1 for portion size)

const randomGroupSize = defaultExpressionEngine.evaluate({
  $random: { min: 1, max: 6, precision: 0 },
});
// Returns: 4 (random group size 1-5)

const childId = defaultExpressionEngine.evaluate({ $uuid: null });
// Returns: "f47ac10b-58cc-4372-a567-0e02b2c3d479" (unique child ID)

// Get current naptime information
const naptimeStart = defaultExpressionEngine.evaluate({ $nowUTC: null });
// Returns: "2024-01-01T12:00:00.000Z" (naptime start time)

const timestamp = defaultExpressionEngine.evaluate({ $timestamp: null });
// Returns: 1704067200000 (current timestamp for attendance)

// Generate session ID for new child enrollment
const enrollmentId = defaultExpressionEngine.apply(
  {
    $if: {
      if: { $eq: null },
      then: { $uuid: null },
      else: { $get: "existingId" },
    },
  },
  { existingId: null },
);
// Returns: new UUID since this is a new enrollment
```

### Custom Expressions

```javascript
import { createExpressionEngine, defaultExpressions } from "json-expressions";

const customEngine = createExpressionEngine({
  ...defaultExpressions,

  // Custom string operation
  $titleCase: {
    apply: (operand, inputData) => {
      const str = inputData;
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    evaluate: (operand) => {
      return operand
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },

  // Custom validation operation
  $isValidEmail: {
    apply: (operand, inputData) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputData);
    },
    evaluate: (operand) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(operand);
    },
  },
});

// Use custom expressions
const result = customEngine.apply({ $titleCase: null }, "paul bunyan");
// Returns: "Paul Bunyan"

const staticResult = customEngine.evaluate({ $titleCase: "paul bunyan" });
// Returns: "Paul Bunyan"
```

### Reusable Logic Patterns

```javascript
import { defaultExpressionEngine } from "json-expressions";

// Define reusable expression
const discountPriceExpression = {
  $if: {
    if: { $pipe: [{ $get: "discount" }, { $gt: 0 }] },
    then: { $pipe: [{ $get: "price" }, { $subtract: { $get: "discount" } }] },
    else: { $get: "price" },
  },
};

// Apply to multiple products
const products = [
  { name: "Laptop", price: 1000, discount: 100 },
  { name: "Mouse", price: 50, discount: 2.5 },
  { name: "Keyboard", price: 100, discount: 0 },
];

const discountedPrices = products.map((product) =>
  defaultExpressionEngine.apply(discountPriceExpression, product),
);
// Returns: [900, 47.5, 100]
```

## Installation

```bash
npm install json-expressions
```

## License

MIT

## Contributing

Contributions are welcome!
