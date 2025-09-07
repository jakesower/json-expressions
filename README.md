# JSON Expressions

A powerful JavaScript expression engine for JSON-based dynamic computations and function composition. JSON Expressions provides a declarative syntax for creating complex logic, transformations, and calculations that can be serialized, stored, and executed safely.

Perfect for configuration-driven applications, business rules engines, and anywhere you need dynamic logic represented as data.

## Overview

JSON Expressions is built around several key principles:

- **Serializable Logic**: Express complex computations as JSON that can be stored, transmitted, and versioned
- **Composable**: Build complex logic by combining simple expressions using `$pipe`
- **Extensible**: Easily add custom expressions through packs and custom definitions
- **Safe Evaluation**: Controlled execution environment without the risks of `eval()`
- **Type-Aware**: Rich set of expressions for different data types (numbers, strings, arrays, objects)
- **Dual Execution Modes**: Apply expressions to input data, or evaluate them standalone

## What Expressions Look Like

Expressions are JSON objects that describe computations to be performed. Each expression has a single key that identifies the expression type (prefixed with `$`) and a value that provides the parameters:

**Simple comparison:**
```json
{ "$gt": 18 }
```

**Logical expressions:**
```json
{ "$and": [
  { "$gte": 18 },
  { "$lt": 65 }
]}
```

**Conditional logic:**
```json
{ "$if": {
  "if": { "$eq": "active" },
  "then": { "$get": "fullName" },
  "else": "Inactive User"
}}
```

**Data transformation:**
```json
{ "$pipe": [
  { "$get": "children" },
  { "$filter": { "$gte": 4 } },
  { "$map": { "$get": "name" } }
]}
```

## Apply vs Evaluate: The Critical Difference

JSON Expressions provides two distinct execution modes that serve different purposes:

### `apply(expression, inputData)`

Applies the expression **to** input data. The expression acts like a function that receives the input data and transforms or tests it.

```javascript
import { defaultExpressionEngine } from "json-expressions";

// Expression: "is the input greater than 18?"
const expression = { $gt: 18 };
const inputData = 25;

const result = defaultExpressionEngine.apply(expression, inputData);
// Returns: true (because 25 > 18)
```

In apply mode, expressions receive the input data as context and operate on it:
- `{ $get: "name" }` gets the "name" property from input data
- `{ $gt: 18 }` tests if input data is greater than 18
- `{ $filter: { $gte: 4 } }` filters input array for items >= 4

### `evaluate(expression)`

Evaluates the expression **independently** without input data. The expression is fully self-contained and produces a static result.

```javascript
// Expression: "what is the sum of these numbers?"
const expression = { $sum: [1, 2, 3, 4] };

const result = defaultExpressionEngine.evaluate(expression);
// Returns: 10 (static calculation)
```

In evaluate mode, expressions contain all the data they need:
- `{ $get: { object: data, path: "name" } }` gets property from the provided object
- `{ $gt: [25, 18] }` tests if 25 > 18
- `{ $sum: [1, 2, 3] }` calculates sum of the provided numbers

**When to use which:**
- Use **apply** for data transformation pipelines, filtering, validation, and business rules
- Use **evaluate** for static calculations, configuration values, and self-contained computations

## Quick Start

Get up and running in 30 seconds:

```javascript
import { defaultExpressionEngine } from "json-expressions";

// Simple data filtering
const children = [
  { name: "Chen", age: 3 },
  { name: "Amara", age: 5 },
  { name: "Diego", age: 4 }
];

// Find school-age children (5+)
const schoolAge = defaultExpressionEngine.apply(
  {
    $pipe: [
      { $filter: { $gte: 5 } },
      { $map: { $get: "name" } }
    ]
  },
  children
);
// Returns: ["Amara"]
```

## API Reference

### Core Functions

#### `defaultExpressionEngine`

Pre-configured expression engine with base expressions included.

```javascript
import { defaultExpressionEngine } from "json-expressions";

const result = defaultExpressionEngine.apply(expression, data);
const staticResult = defaultExpressionEngine.evaluate(expression);
```

#### `createExpressionEngine(config)`

Creates a custom expression engine with specified configuration.

**Parameters:**

- `config.packs` (Array, optional) - Array of expression pack objects to include
- `config.custom` (Object, optional) - Custom expression definitions
- `config.includeBase` (Boolean, default: true) - Whether to include base expressions

```javascript
import { createExpressionEngine } from "json-expressions";
import { math } from "json-expressions/packs/math";

// Create engine with math pack
const mathEngine = createExpressionEngine({
  packs: [math]
});

// Create engine with only custom expressions (no base pack)
const customEngine = createExpressionEngine({
  includeBase: false,
  custom: {
    $double: {
      apply: (operand, inputData) => inputData * 2,
      evaluate: (operand) => operand * 2
    }
  }
});
```

### Engine Methods

#### `apply(expression, inputData)`

Evaluates an expression against input data.

- **expression** (Object) - The expression to evaluate
- **inputData** (any) - The input data context for evaluation
- **Returns:** Result of the expression evaluation

#### `evaluate(expression)`

Evaluates an expression without input data (for static expressions).

- **expression** (Object) - The expression to evaluate
- **Returns:** Static result of the expression

#### `isExpression(value)`

Tests whether a value is a valid expression.

- **value** (any) - The value to test
- **Returns:** Boolean indicating if the value is an expression

#### `expressionNames`

Array of all available expression names in the engine.

## Error Handling

JSON Expressions provides clear error messages for common issues:

### Invalid Expressions

```javascript
// Unknown expression
defaultExpressionEngine.apply({ $unknown: 5 }, 10);
// Error: Unknown expression operator: "$unknown". Did you mean "$not"?

// Values that look like expressions but aren't
defaultExpressionEngine.apply({ $notAnExpression: 5 }, 10);
// Error: Unknown expression operator: "$notAnExpression". Use { $literal: {"$notAnExpression": 5} } if you meant this as a literal value.
```

### Type Errors

```javascript
// Wrong operand type
defaultExpressionEngine.apply({ $get: 123 }, { name: "Chen" });
// Error: $get operand must be string or object with {path, default?}

// Boolean required for conditionals
defaultExpressionEngine.apply({ $case: { value: 5, cases: [{ when: "not boolean", then: "result" }] } });
// Error: $case.when must resolve to a boolean, got "not boolean"
```

### Data Access Errors

```javascript
// Strict property access on null/undefined
defaultExpressionEngine.apply({ $prop: "name" }, null);
// Error: Cannot read properties of null (reading 'name')

// Missing required properties
defaultExpressionEngine.evaluate({ $get: { path: "name" } });
// Error: $get evaluate form requires 'object' and 'path' properties
```

### Best Practices

- Use `$get` with defaults for safe property access: `{ $get: { path: "name", default: "Unknown" } }`
- Use `$literal` for values that might be confused with expressions
- Test expressions with sample data before using in production
- Use `$debug` to inspect intermediate values in complex pipelines

## TypeScript Support

JSON Expressions includes comprehensive TypeScript definitions for type safety and better developer experience.

### Basic Usage

```typescript
import { defaultExpressionEngine, Expression } from "json-expressions";

// Type-safe expression definition
const expression: Expression = { $gt: 18 };

// Apply with typed input and output
const result: unknown = defaultExpressionEngine.apply(expression, 25);

// Type guards for expressions
if (defaultExpressionEngine.isExpression(someValue)) {
  // someValue is now typed as Expression
  const result = defaultExpressionEngine.apply(someValue, data);
}
```

### Custom Engine Types

```typescript
import { createExpressionEngine, ExpressionEngine } from "json-expressions";

// Create typed engine
const engine: ExpressionEngine = createExpressionEngine({
  custom: {
    $myExpression: {
      apply: (operand: string, inputData: any) => inputData + operand,
      evaluate: (operand: string) => operand.toUpperCase()
    }
  }
});
```

### Expression Types

The library provides specific interfaces for each expression type:

```typescript
import { 
  GetExpression, 
  PipeExpression, 
  FilterExpression 
} from "json-expressions";

const getExpr: GetExpression = { $get: "name" };
const pipeExpr: PipeExpression = { 
  $pipe: [
    { $get: "children" },
    { $filter: { $gte: 5 } }
  ] 
};
```

## Expression Packs

JSON Expressions organizes functionality into packs - curated collections of expressions for specific use cases. 

### Base Pack (Always Included)

The base pack contains near-universal expressions used across almost all scenarios. These expressions are included by default in every engine unless explicitly excluded.

- [**$debug**](expressions.md#debug) - Logs a value to console and returns it (useful for debugging pipelines)
- [**$filter**](expressions.md#filter) - Filters array items based on a condition
- [**$get**](expressions.md#get) - Retrieves a value from data using dot notation paths with optional defaults
- [**$if**](expressions.md#if) - Conditional expression that evaluates different branches based on a condition
- [**$literal**](expressions.md#literal) - Returns a literal value (useful when you need to pass values that look like expressions)
- [**$map**](expressions.md#map) - Transforms each item in an array using an expression
- [**$pipe**](expressions.md#pipe) - Pipes data through multiple expressions in sequence (left-to-right)

**Comparison expressions:**
- [**$eq**](expressions.md#eq) - Tests equality using deep comparison
- [**$gt**](expressions.md#gt) - Tests if value is greater than operand  
- [**$gte**](expressions.md#gte) - Tests if value is greater than or equal to operand
- [**$lt**](expressions.md#lt) - Tests if value is less than operand
- [**$lte**](expressions.md#lte) - Tests if value is less than or equal to operand
- [**$ne**](expressions.md#ne) - Tests inequality using deep comparison

### Available Packs

Beyond the base pack, you can import additional functionality as needed:

```javascript
import { createExpressionEngine } from "json-expressions";
import { math } from "json-expressions/packs/math";
import { string } from "json-expressions/packs/string";

const engine = createExpressionEngine({
  packs: [math, string]
});
```

#### Aggregation Pack

Statistical and aggregation functions for data analysis:

- [**$count**](expressions.md#count) - Count of items in an array
- [**$first**](expressions.md#first) - First item in an array  
- [**$last**](expressions.md#last) - Last item in an array
- [**$max**](expressions.md#max) - Maximum value in an array
- [**$mean**](expressions.md#mean) - Arithmetic mean (average) of array values
- [**$median**](expressions.md#median) - Median (middle value) of array values
- [**$min**](expressions.md#min) - Minimum value in an array
- [**$sum**](expressions.md#sum) - Sum of array values

#### Array Pack

Complete array manipulation toolkit:

- [**$all**](expressions.md#all) - Tests if all elements in an array satisfy a predicate
- [**$any**](expressions.md#any) - Tests if any element in an array satisfies a predicate
- [**$append**](expressions.md#append) - Appends an array to the end of another array
- [**$coalesce**](expressions.md#coalesce) - Returns the first non-null value from an array
- [**$concat**](expressions.md#concat) - Concatenates multiple arrays together
- [**$distinct**](expressions.md#distinct) - Returns unique values from an array
- [**$find**](expressions.md#find) - Returns first element that satisfies a predicate
- [**$flatMap**](expressions.md#flatmap) - Maps and flattens array items
- [**$join**](expressions.md#join) - Joins array elements into a string with a separator
- [**$prepend**](expressions.md#prepend) - Prepends an array to the beginning of another array
- [**$reverse**](expressions.md#reverse) - Returns array with elements in reverse order
- [**$skip**](expressions.md#skip) - Skips first N elements of an array
- [**$take**](expressions.md#take) - Takes first N elements of an array

#### Comparison Pack

Scalar comparison operations for filtering and validation:

- [**$between**](expressions.md#between) - Tests if value is between two bounds (inclusive)
- [**$in**](expressions.md#in) - Tests if value exists in an array
- [**$isNotNull**](expressions.md#isnotnull) - Tests if value is not null or undefined
- [**$isNull**](expressions.md#isnull) - Tests if value is null or undefined
- [**$nin**](expressions.md#nin) - Tests if value does not exist in an array

#### Logic Pack

Boolean logic and conditional operations:

- [**$and**](expressions.md#and) - Logical AND - all expressions must be truthy
- [**$case**](expressions.md#case) - Conditional expression using boolean predicates for complex logic
- [**$not**](expressions.md#not) - Logical NOT - inverts the truthiness of an expression
- [**$or**](expressions.md#or) - Logical OR - at least one expression must be truthy
- [**$switch**](expressions.md#switch) - Switch-like expression for deep equality matching

#### Math Pack

Arithmetic operations and mathematical functions:

- [**$abs**](expressions.md#abs) - Absolute value of a number
- [**$add**](expressions.md#add) - Addition operation
- [**$divide**](expressions.md#divide) - Division operation
- [**$modulo**](expressions.md#modulo) - Modulo (remainder) operation
- [**$multiply**](expressions.md#multiply) - Multiplication operation
- [**$pow**](expressions.md#pow) - Power/exponentiation operation
- [**$sqrt**](expressions.md#sqrt) - Square root operation
- [**$subtract**](expressions.md#subtract) - Subtraction operation

#### String Pack

String processing and pattern matching:

- [**$lowercase**](expressions.md#lowercase) - Converts string to lowercase
- [**$matchesGlob**](expressions.md#matchesglob) - Tests if string matches a Unix shell GLOB pattern
- [**$matchesLike**](expressions.md#matcheslike) - Tests if string matches a SQL LIKE pattern
- [**$matchesRegex**](expressions.md#matchesregex) - Tests if string matches a regular expression
- [**$replace**](expressions.md#replace) - Replaces occurrences of a pattern in a string
- [**$split**](expressions.md#split) - Splits a string into an array using a separator
- [**$substring**](expressions.md#substring) - Extracts a portion of a string
- [**$trim**](expressions.md#trim) - Removes whitespace from beginning and end of string
- [**$uppercase**](expressions.md#uppercase) - Converts string to uppercase

#### Time Pack

Temporal functions for date/time operations:

- [**$formatTime**](expressions.md#formattime) - Formats a timestamp using a format string
- [**$nowLocal**](expressions.md#nowlocal) - Current date/time as local RFC3339 string with timezone
- [**$nowUTC**](expressions.md#nowutc) - Current date/time as UTC RFC3339 string
- [**$timeAdd**](expressions.md#timeadd) - Adds a duration to a timestamp
- [**$timeDiff**](expressions.md#timediff) - Calculates difference between two timestamps
- [**$timestamp**](expressions.md#timestamp) - Current timestamp as milliseconds since Unix epoch

## Usage Examples

### Basic Data Transformation

```javascript
import { defaultExpressionEngine } from "json-expressions";

const daycareData = {
  teacher: { name: "Amara", age: 28 },
  children: [
    { name: "Chen", age: 4, activity: "playing" },
    { name: "Fatima", age: 5, activity: "reading" },
    { name: "Diego", age: 3, activity: "napping" }
  ]
};

// Get teacher name with default
const teacherName = defaultExpressionEngine.apply(
  { $get: { path: "name", default: "Unknown" } },
  daycareData.teacher
);
// Returns: "Amara"

// Find children ready for kindergarten (age 5+)
const kindergartenReady = defaultExpressionEngine.apply(
  {
    $pipe: [
      { $get: "children" },
      { $filter: { $gte: 5 } },
      { $map: { $get: "name" } }
    ]
  },
  daycareData
);
// Returns: ["Fatima"]
```

### Static Calculations

```javascript
// Calculate meal budget
const totalMealCost = defaultExpressionEngine.evaluate({
  $sum: [8.50, 12.75, 4.25]  // breakfast, lunch, snack
});
// Returns: 25.5

// Generate unique session ID
const sessionId = defaultExpressionEngine.evaluate({ $uuid: null });
// Returns: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### Complex Business Logic

```javascript
// Age-based activity recommendations
const activityRecommendation = defaultExpressionEngine.apply(
  {
    $switch: {
      value: { $get: "age" },
      cases: [
        { when: 2, then: "Sensory play and simple puzzles" },
        { when: 3, then: "Art activities and story time" },
        { when: 4, then: "Pre-writing skills and group games" },
        { when: 5, then: "Early math and reading readiness" }
      ],
      default: "Age-appropriate developmental activities"
    }
  },
  { age: 4 }
);
// Returns: "Pre-writing skills and group games"
```

## Custom Expressions

You can easily extend JSON Expressions with custom functionality:

```javascript
import { createExpressionEngine } from "json-expressions";

const customEngine = createExpressionEngine({
  custom: {
    // Custom validation
    $isValidEmail: {
      apply: (operand, inputData) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(inputData);
      },
      evaluate: (operand) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(operand);
      }
    },

    // Custom transformation
    $titleCase: {
      apply: (operand, inputData) => {
        return inputData.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      },
      evaluate: (operand) => {
        return operand.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }
});

// Use custom expressions
const isValid = customEngine.apply({ $isValidEmail: null }, "user@example.com");
// Returns: true

const formatted = customEngine.evaluate({ $titleCase: "john doe" });
// Returns: "John Doe"
```

## Installation

```bash
npm install json-expressions
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.