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

## When to Use JSON Expressions

### Excellent fit for:

- **Configuration-driven applications** - Store complex logic as data in databases
- **Domain experts who understand their rules** - Semi-technical users comfortable with structured data (GIS analysts, statisticians, financial modelers)
- **Business rules that change frequently** - Avoid code deployments for logic updates
- **Cross-platform logic sharing** - Same rules run in frontend (testing) and backend (production)
- **Multi-tenant SaaS applications** - Different customers need different business logic
- **Complex conditional logic** - Beyond simple boolean flags but not warranting full programming languages

### Poor fit for:

- **Simple boolean flags or key-value configs** - Simple key/value JSON objects are completely adequate
- **Performance-critical hot paths** - Direct JavaScript functions will be faster
- **Logic that rarely changes** - Code deployments may be simpler

### Performance Characteristics

JSON Expressions is **optimized for flexibility over raw execution speed**. Expect:

- **Development speed gains** from eliminating deployment cycles
- **Cross-platform consistency** from shared logic evaluation
- **Execution overhead** compared to native JavaScript functions
- **Good performance** for business rules, data transformations, and configuration logic
- **Consider caching** for frequently-evaluated complex expressions

## What Expressions Look Like

Expressions are JSON objects that describe computations to be performed. Each expression has a single key that identifies the expression type (prefixed with `$`) and a value that provides the parameters:

**Simple comparison:**

```javascript
{ $gt: 18 }
```

**Logical expressions:**

```javascript
{ $and: [{ $gte: 18 }, { $lt: 65 }] }
```

**Conditional logic:**

```javascript
{
  $case: {
    value: { $get: "status" },
    cases: [{ when: "active", then: { $get: "fullName" } }],
    default: "Inactive user"
  }
}
```

**Data transformation:**

```javascript
{
  $pipe: [
    { $get: "children" },
    { $filterBy: { age: { $gte: 4 } } },
    { $map: { $get: "name" } }
  ]
}
```

## Apply vs Evaluate

JSON Expressions provides **two distinct execution modes** that serve different purposes:

### `apply(expression, inputData)`

Applies the expression **to** input data. The expression acts like a function that receives the input data and transforms or tests it.

```javascript
import { createExpressionEngine } from "json-expressions";

// Create an engine (users choose their own packs)
const engine = createExpressionEngine();

// Expression: "is the input greater than 18?"
const expression = { $gt: 18 };
const inputData = 25;

const result = engine.apply(expression, inputData);
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

const result = engine.evaluate(expression);
// Returns: 10 (static calculation)
```

In evaluate mode, expressions contain all the data they need:

- `{ $get: { object: { "name": "Hadley" }, path: "name" } }` gets property from the provided object
- `{ $gt: [25, 18] }` tests if 25 > 18
- `{ $sum: [1, 2, 3] }` calculates sum of the provided numbers

**When to use which:**

- Use **apply** when you have input data and want to transform, filter, or test it
  - Data processing pipelines: `engine.apply(expression, userData)`
  - Business rules: `engine.apply(rule, customerData)`
  - Validation: `engine.apply(validator, formData)`

- Use **evaluate** when you need static calculations or have all data in the expression
  - Configuration values: `engine.evaluate({ $sum: [10, 20, 30] })`
  - Static computations: `engine.evaluate({ $gt: [userAge, minimumAge] })`
  - Template rendering: `engine.evaluate({ $get: { object: config, path: "apiUrl" } })`

**Rule of thumb**: If your expression needs external input data, use `apply`. If it's self-contained, use `evaluate`. If still in doubt, try to use the evaluate form first. If you run into a wall, you probably need to switch over to apply.

| Expression | Apply Mode         | Evaluate Mode                           |
| ---------- | ------------------ | --------------------------------------- |
| `$gt`      | `{ $gt: 18 }`      | `{ $gt: [25, 18] }`                     |
| `$get`     | `{ $get: "name" }` | `{ $get: { object, path: "name" } }`    |
| `$sum`     | `{ $sum: null }`   | `{ $sum: [1, 2, 3] }`                   |
| `$mean`    | `{ $mean: null }`  | `{ $mean: [85, 90, 88] }`               |

**Key difference**: Apply mode expressions operate **on** the input data, while evaluate mode expressions contain **all** the data they need.

### Mode-Specific Examples

**Apply Mode - Operating on input data:**

```javascript
const data = { scores: [85, 90, 88], threshold: 80 };

// Get a property from input
engine.apply({ $get: "scores" }, data);
// Returns: [85, 90, 88]

// Test input against threshold
engine.apply({ $gt: 80 }, 85);
// Returns: true

// Calculate mean of input array
engine.apply({ $mean: null }, [85, 90, 88]);
// Returns: 87.67
```

**Evaluate Mode - Self-contained expressions:**

```javascript
// Get property from provided object
engine.evaluate({ $get: { object: { name: "Hadley" }, path: "name" } });
// Returns: "Hadley"

// Compare two provided values
engine.evaluate({ $gt: [85, 80] });
// Returns: true

// Calculate mean of provided array
engine.evaluate({ $mean: [85, 90, 88] });
// Returns: 87.67
```

### Common Mode Pitfalls

```javascript
// Wrong: Using apply syntax in evaluate mode
engine.evaluate({ $gt: 18 }); // Error: needs comparison values

// Correct: Provide both values in evaluate mode
engine.evaluate({ $gt: [25, 18] }); // Returns: true

// Wrong: Using evaluate syntax in apply mode
engine.apply({ $gt: [25, 18] }, inputData); // Ignores inputData

// Correct: Test inputData against threshold
engine.apply({ $gt: 18 }, 25); // Returns: true
```

## Architecture Benefits

### Cross-Platform Logic Execution

The dual-mode architecture enables the same expressions to run consistently across different environments:

```javascript
// Same rule logic used in multiple contexts
const eligibilityRule = {
  $where: {
    age: { $gte: 18 },
    status: { $eq: "active" },
    balance: { $gt: 0 },
  },
};

// Frontend: Preview rule results
const previewResult = frontendEngine.apply(eligibilityRule, userData);

// Backend: Enforce rule in production
const productionResult = backendEngine.apply(eligibilityRule, userData);

// Database: Store rule for later execution
await database.saveRule("user-eligibility", eligibilityRule);
```

### JSON Serialization Advantages

Because expressions are pure JSON, they can be:

- **Stored in databases** as configuration data
- **Transmitted over HTTP** for distributed evaluation
- **Versioned and audited** using standard data tools and git
- **Validated with JSON Schema** for correctness
- **Generated programmatically** by rule builders
- **Cached and optimized** by infrastructure

### Expression Engine Flexibility

Different contexts can use different expression engines with tailored capabilities:

```javascript
// Restrictive engine for user-facing rule builders
const userEngine = createExpressionEngine({ packs: [filtering] });

// Full-featured engine for admin interfaces
const adminEngine = createExpressionEngine({
  packs: [filtering, projection, math],
});

// Specialized engine for specific domains
const geoEngine = createExpressionEngine({
  packs: [filtering],
  custom: { $withinRadius, $intersects, $contains },
});
```

## Production Usage

JSON Expressions powers production systems including:

- **SpectraGraph** - Unified query language across multiple data sources
- **Business rules engines** - Dynamic email triggers, pricing logic, access controls

## Quick Start

Get up and running in 30 seconds:

```javascript
import { createExpressionEngine } from "json-expressions";

// Create engine - users choose packs they need
const engine = createExpressionEngine();

// Data filtering
const children = [
  { name: "Chen", age: 3 },
  { name: "Amara", age: 5 },
  { name: "Diego", age: 4 },
];

// Find school-age children (5+)
const schoolAge = engine.apply(
  {
    $pipe: [
      { $filter: { $where: { age: { $gte: 5 } } } },
      { $map: { $get: "name" } },
    ],
  },
  children,
);
// Returns: ["Amara"]
```

## API Reference

### Core Functions

#### Basic Usage

Users create engines with the packs they need:

```javascript
import { createExpressionEngine } from "json-expressions";

const engine = createExpressionEngine(); // Includes base pack by default
const result = engine.apply(expression, data);
const staticResult = engine.evaluate(expression);
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
  packs: [math],
});

// Create engine with only custom expressions (no base pack)
const customEngine = createExpressionEngine({
  includeBase: false,
  custom: {
    $double: {
      apply: (operand, inputData) => inputData * 2,
      evaluate: (operand) => operand * 2,
    },
  },
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
engine.apply({ $unknown: 5 }, 10);
// Error: Unknown expression operator: "$unknown". Did you mean "$not"?

// Values that look like expressions but aren't
engine.apply({ $notAnExpression: 5 }, 10);
// Error: Unknown expression operator: "$notAnExpression". Use { $literal: {"$notAnExpression": 5} } if you meant this as a literal value.
```

### Type Errors

```javascript
// Wrong operand type
engine.apply({ $get: 123 }, { name: "Chen" });
// Error: $get operand must be string

// Boolean predicates must return boolean values
engine.apply({
  $case: {
    value: 5,
    cases: [{ when: { $literal: "not boolean" }, then: "result" }],
  },
});
// Works fine - literal comparison: 5 === "not boolean" → false, continues to default
```

### Data Access Errors

```javascript
// Strict property access on null/undefined
engine.apply({ $prop: "name" }, null);
// Error: Cannot read properties of null (reading 'name')

// Missing required properties
engine.evaluate({ $get: { path: "name" } });
// Error: $get evaluate form requires 'object' and 'path' properties
```

### Best Practices

- Use `$get` with defaults for safe property access: `{ $get: "name" }`
- Use `$literal` for values that might be confused with expressions
- Test expressions with sample data before using in production
- Use `$debug` (available via direct import) to inspect intermediate values in complex pipelines

## Expression Packs

JSON Expressions organizes functionality into packs - curated collections of expressions for specific use cases.

### Base Pack (Always Included)

The base pack contains near-universal expressions used across almost all scenarios. These expressions are included by default in every engine unless explicitly excluded.

- [**$and**](expressions.md#and) - Logical AND operation across multiple expressions
- [**$default**](expressions.md#default) - Returns first non-null/undefined value from array of expressions
- [**$filter**](expressions.md#filter) - Filters array items based on a condition
- [**$filterBy**](expressions.md#filterby) - Filters arrays by object property conditions (combines $filter + $where)
- [**$get**](expressions.md#get) - Retrieves a value from data using dot notation paths with optional defaults
- [**$if**](expressions.md#if) - Conditional expression that evaluates different branches based on a condition
- [**$isDefined**](expressions.md#isdefined) - Tests if a value is defined (not null or undefined)
- [**$literal**](expressions.md#literal) - Returns a literal value (useful when you need to pass values that look like expressions)
- [**$map**](expressions.md#map) - Transforms each item in an array using an expression
- [**$not**](expressions.md#not) - Logical NOT operation that inverts a boolean expression
- [**$or**](expressions.md#or) - Logical OR operation across multiple expressions
- [**$pipe**](expressions.md#pipe) - Pipes data through multiple expressions in sequence (left-to-right)
- [**$sort**](expressions.md#sort) - Sorts arrays by property or expression with optional desc flag
- [**$where**](expressions.md#where) - Filters arrays using object-based property conditions (shorthand for complex filters)

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
import { createExpressionEngine, math, string } from "json-expressions";

const engine = createExpressionEngine({
  packs: [math, string],
});
```

#### Aggregation Pack

Statistical and aggregation functions for data analysis:

- [**$count**](expressions.md#count) - Count of items in an array
- [**$first**](expressions.md#first) - First item in an array
- [**$last**](expressions.md#last) - Last item in an array
- [**$max**](expressions.md#max) - Maximum value in an array
- [**$mean**](expressions.md#mean) - Arithmetic mean (average) of array values
- [**$min**](expressions.md#min) - Minimum value in an array
- [**$sum**](expressions.md#sum) - Sum of array values

#### Array Pack

Complete array manipulation toolkit:

- [**$all**](expressions.md#all) - Tests if all elements in an array satisfy a predicate
- [**$any**](expressions.md#any) - Tests if any element in an array satisfies a predicate
- [**$append**](expressions.md#append) - Appends an array to the end of another array
- [**$coalesce**](expressions.md#coalesce) - Returns the first non-null value from an array
- [**$concat**](expressions.md#concat) - Concatenates multiple arrays together
- [**$find**](expressions.md#find) - Returns first element that satisfies a predicate
- [**$flatMap**](expressions.md#flatmap) - Maps and flattens array items
- [**$flatten**](expressions.md#flatten) - Flattens nested arrays to specified depth
- [**$groupBy**](expressions.md#groupby) - Groups array elements by a property or expression
- [**$join**](expressions.md#join) - Joins array elements into a string with a separator
- [**$pluck**](expressions.md#pluck) - Extracts property values from array of objects
- [**$prepend**](expressions.md#prepend) - Prepends an array to the beginning of another array
- [**$reverse**](expressions.md#reverse) - Returns array with elements in reverse order
- [**$skip**](expressions.md#skip) - Skips first N elements of an array
- [**$take**](expressions.md#take) - Takes first N elements of an array
- [**$unique**](expressions.md#unique) - Returns unique values from an array

#### Comparison Pack

Scalar comparison operations for filtering and validation:

- [**$between**](expressions.md#between) - Tests if value is between two bounds (inclusive)
- [**$has**](expressions.md#has) - Tests if object has property at specified path (supports dot notation)
- [**$in**](expressions.md#in) - Tests if value exists in an array
- [**$isNotNull**](expressions.md#isnotnull) - Tests if value is not null or undefined
- [**$isNull**](expressions.md#isnull) - Tests if value is null or undefined
- [**$nin**](expressions.md#nin) - Tests if value does not exist in an array

#### Filtering Pack

Complete toolkit for WHERE clause logic and data filtering - combines field access, comparisons, logic, and pattern matching:

- [**$and**](expressions.md#and), [**$or**](expressions.md#or), [**$not**](expressions.md#not) - Boolean logic
- [**$eq**](expressions.md#eq), [**$ne**](expressions.md#ne), [**$gt**](expressions.md#gt), [**$gte**](expressions.md#gte), [**$lt**](expressions.md#lt), [**$lte**](expressions.md#lte) - Basic comparisons
- [**$get**](expressions.md#get) - Field access with dot notation paths
- [**$in**](expressions.md#in), [**$nin**](expressions.md#nin) - Membership tests
- [**$where**](expressions.md#where) - Object-based property filtering (shorthand for complex conditions)
- [**$isNull**](expressions.md#isnull), [**$isNotNull**](expressions.md#isnotnull) - Existence checks
- [**$matchesRegex**](expressions.md#matchesregex), [**$matchesLike**](expressions.md#matcheslike), [**$matchesGlob**](expressions.md#matchesglob) - Pattern matching
- [**$pipe**](expressions.md#pipe) - Chain multiple filtering operations

Perfect for building complex filters with a single import:

```javascript
import { createExpressionEngine, filtering } from "json-expressions";

const engine = createExpressionEngine({ packs: [filtering] });

// Complex daycare filtering
const activeToddlers = engine.apply(
  {
    $where: {
      age: { $and: [{ $gte: 2 }, { $lte: 4 }] }, // Age between 2 and 4
      status: { $eq: "active" }, // Active status
      activity: { $nin: ["napping", "sick"] }, // Not napping or sick
    },
  },
  children,
);
```

#### Logic Pack

Boolean logic and conditional operations:

- [**$and**](expressions.md#and) - Logical AND - all expressions must be truthy
- [**$case**](expressions.md#case) - Unified conditional expression supporting both literal comparisons and boolean predicates
- [**$if**](expressions.md#if) - Conditional expression that evaluates different branches based on a condition
- [**$not**](expressions.md#not) - Logical NOT - inverts the truthiness of an expression
- [**$or**](expressions.md#or) - Logical OR - at least one expression must be truthy

#### Projection Pack

Complete toolkit for SELECT clause operations and data transformation - combines aggregation, array operations, string transforms, and conditionals:

- [**$get**](expressions.md#get) - Field access with dot notation paths
- [**$pipe**](expressions.md#pipe) - Chain multiple projection operations
- [**$select**](expressions.md#select) - Projects/selects specific properties from objects
- [**$count**](expressions.md#count), [**$sum**](expressions.md#sum), [**$min**](expressions.md#min), [**$max**](expressions.md#max), [**$mean**](expressions.md#mean) - Aggregation functions
- [**$map**](expressions.md#map), [**$filter**](expressions.md#filter), [**$flatMap**](expressions.md#flatmap), [**$distinct**](expressions.md#distinct) - Array transformations
- [**$concat**](expressions.md#concat), [**$join**](expressions.md#join), [**$substring**](expressions.md#substring), [**$uppercase**](expressions.md#uppercase), [**$lowercase**](expressions.md#lowercase) - String/value operations
- [**$if**](expressions.md#if), [**$case**](expressions.md#case) - Conditionals for computed fields

Perfect for transforming and projecting data with a single import:

```javascript
import { createExpressionEngine, projection } from "json-expressions";

const engine = createExpressionEngine({ packs: [projection] });

// Complex daycare reporting
const report = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $map: {
          name: { $get: "name" },
          displayName: { $uppercase: { $get: "name" } },
          ageGroup: {
            $if: {
              if: { $gte: 4 },
              then: "Pre-K",
              else: "Toddler",
            },
          },
          activities: { $join: ", " },
        },
      },
      { $filter: { $get: "active" } },
    ],
  },
  daycareData,
);
```

#### Object Pack

Key-value manipulation and object operations:

- [**$fromPairs**](expressions.md#frompairs) - Creates object from array of [key, value] pairs
- [**$keys**](expressions.md#keys) - Returns array of object property names
- [**$merge**](expressions.md#merge) - Merges multiple objects together
- [**$omit**](expressions.md#omit) - Creates object excluding specified properties
- [**$pairs**](expressions.md#pairs) - Returns array of [key, value] pairs from object
- [**$pick**](expressions.md#pick) - Creates object with only specified properties
- [**$prop**](expressions.md#prop) - Gets property value from object by dynamic key
- [**$values**](expressions.md#values) - Returns array of object property values

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

## Individual Expression Imports

Some expressions are available for direct import when you need them outside of packs:

### Debug Expression

The `$debug` expression is useful for development and troubleshooting but isn't included in any pack by default. Import it directly when needed:

```javascript
import { createExpressionEngine } from "json-expressions";
import { $debug } from "json-expressions/src/definitions/flow";

const engine = createExpressionEngine({
  custom: { $debug }
});

// Use in pipelines to inspect intermediate values
const result = engine.apply({
  $pipe: [
    { $get: "users" },
    { $debug: "After getting users" },  // Logs to console
    { $filter: { active: true } },
    { $debug: "After filtering active" }, // Logs to console
    { $map: { $get: "name" } }
  ]
}, data);
```

**Any** expression can be included with this method. Use it if you don't want the overhead of an entire pack.

## Usage Examples

### Building Blocks: Simple to Complex

JSON Expressions excel at composing simple operations into complex logic:

```javascript
// Start simple: basic comparison
{
  $gt: 5
}

// Add logic: combine conditions
{
  $and: [{ $gt: 5 }, { $lt: 10 }]
}

// Add data access: work with objects
{
  $pipe: [{ $get: "age" }, { $and: [{ $gt: 5 }, { $lt: 10 }] }]
}

// Add transformation: complex pipeline
{
  $pipe: [
    { $filter: { $gte: 4 } }, // Filter items >= 4
    { $map: { $multiply: 2 } }, // Double each value
    { $sum: null }, // Sum the results
  ]
}
// Input: [1, 2, 4, 6, 8] → Output: 36
```

### Common Patterns

```javascript
// Conditional values
{ $if: { if: { $gt: 18 }, then: "adult", else: "minor" } }

// Complex filtering with multiple conditions
{
  $filter: {
    $and: [
      { $get: "active" },
      { $pipe: [{ $get: "age" }, { $gte: 18 }] }
    ]
  }
}

// Simplified filtering by object properties
{ $filterBy: { active: { $eq: true }, age: { $gte: 18 } } }

// Nested data transformation
{
  $map: {
    name: { $get: "name" },
    isEligible: { $pipe: [{ $get: "score" }, { $gte: 75 }] },
    category: {
      $case: {
        value: { $get: "age" },
        cases: [
          { when: { $lt: 13 }, then: "child" },
          { when: { $lt: 20 }, then: "teen" }
        ],
        default: "adult"
      }
    }
  }
}
```

### Basic Data Transformation

```javascript
import { createExpressionEngine } from "json-expressions";

const engine = createExpressionEngine();

const daycareData = {
  teacher: { name: "James", age: 38 },
  children: [
    { name: "Chen", age: 4, activity: "playing" },
    { name: "Serafina", age: 5, activity: "reading" },
    { name: "Diego", age: 3, activity: "napping" },
  ],
};

// Get teacher name
const teacherName = engine.apply({ $get: "name" }, daycareData.teacher);
// Returns: "James"

// Find children ready for kindergarten (age 5+)
const kindergartenReady = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      { $filter: { $gte: 5 } },
      { $map: { $get: "name" } },
    ],
  },
  daycareData,
);
// Returns: ["Serafina"]
```

### Static Calculations

```javascript
// Calculate meal budget
const totalMealCost = engine.evaluate({
  $sum: [8.5, 12.75, 4.25], // breakfast, lunch, snack
});
// Returns: 25.5
```

### Complex Business Logic

```javascript
// Age-based activity recommendations with mixed literal and expression conditions
const activityRecommendation = engine.apply(
  {
    $case: {
      value: { $get: "age" },
      cases: [
        { when: 2, then: "Sensory play and simple puzzles" }, // Literal comparison
        { when: 3, then: "Art activities and story time" }, // Literal comparison
        { when: { $eq: 4 }, then: "Pre-writing skills and group games" }, // Expression predicate
        { when: { $gte: 5 }, then: "Early math and reading readiness" }, // Expression predicate
      ],
      default: "Age-appropriate developmental activities",
    },
  },
  { age: 4 },
);
// Returns: "Pre-writing skills and group games"
```

## Custom Expressions

You can extend JSON Expressions with custom functionality:

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
      },
    },

    // Custom transformation
    $titleCase: {
      apply: (operand, inputData) => {
        return inputData
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
  },
});

// Use custom expressions
const isValid = customEngine.apply({ $isValidEmail: null }, "user@example.com");
// Returns: true

const formatted = customEngine.evaluate({ $titleCase: "john doe" });
// Returns: "John Doe"
```

### More Examples

```javascript
import { createExpressionEngine } from "json-expressions";
import { object } from "json-expressions/packs/object";

const engine = createExpressionEngine({ packs: [object] });

const students = [
  { name: "Aisha", age: 3, scores: [85, 90, 88], active: true },
  { name: "Chen", age: 5, scores: [92, 87, 95], active: true },
  { name: "Diego", age: 3, scores: [78, 84, 91], active: false },
  { name: "Serafina", age: 6, scores: [88, 92, 85], active: true },
];

// Use $where for elegant filtering
const activeOlderStudents = engine.apply(
  {
    $filter: {
      $where: {
        active: { $eq: true },
        age: { $lt: 6 },
      },
    },
  },
  students,
);
// Returns: ["Aisha", "Chen"]

// Use $pluck to extract specific fields
const studentNames = engine.apply({ $pluck: "name" }, students);
// Returns: ["Aisha", "Chen", "Diego", "Serafina"]

// Use $groupBy to organize data
const studentsByAge = engine.apply({ $groupBy: "age" }, students);
// Returns: {
//   "3": [{ name: "Aisha", age: 3, scores: [85, 90, 88], active: true }, { name: "Diego", age: 3, scores: [78, 84, 91], active: false }],
//   "5": [{ name: "Chen", age: 5, scores: [92, 87, 95], active: true }],
//   "6": [{ name: "Serafina", age: 6, scores: [88, 92, 85], active: true }]
// }

// Use $select to project/transform objects
const summaries = engine.apply(
  {
    $map: {
      $select: {
        name: { $get: "name" },
        averageScore: { $pipe: [{ $get: "scores" }, { $mean: null }] },
        isActive: { $get: "active" },
      },
    },
  },
  students,
);
// Returns: [
//   { name: "Aisha", averageScore: 87.67, isActive: true },
//   { name: "Chen", averageScore: 91.33, isActive: true },
//   ...
// ]

// Use $has to check for property existence
const hasScores = engine.apply({ $has: "scores" }, students[0]);
// Returns: true

// Use $flatten for nested arrays
const allScores = engine.apply(
  {
    $pipe: [{ $pluck: "scores" }, { $flatten: null }],
  },
  students,
);
// Returns: [85, 90, 88, 92, 87, 95, 78, 84, 91, 88, 92, 85]

// Use $unique to remove duplicates
const uniqueAges = engine.apply(
  {
    $pipe: [{ $pluck: "age" }, { $unique: null }],
  },
  students,
);
// Returns: [4, 5, 3, 6]
```

## TypeScript Support

JSON Expressions includes comprehensive TypeScript definitions for type safety and better developer experience.

### Basic Usage

```typescript
import { createExpressionEngine, Expression } from "json-expressions";

const engine = createExpressionEngine();

// Type-safe expression definition
const expression: Expression = { $gt: 18 };

// Apply with typed input and output
const result: unknown = engine.apply(expression, 25);

// Type guards for expressions
if (engine.isExpression(someValue)) {
  // someValue is now typed as Expression
  const result = engine.apply(someValue, data);
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
      evaluate: (operand: string) => operand.toUpperCase(),
    },
  },
});
```

### Expression Types

The library provides specific interfaces for each expression type:

```typescript
import {
  GetExpression,
  PipeExpression,
  FilterExpression,
} from "json-expressions";

const getExpr: GetExpression = { $get: "name" };
const pipeExpr: PipeExpression = {
  $pipe: [{ $get: "children" }, { $filter: { $gte: 5 } }],
};
```

## Installation

```bash
npm install json-expressions
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
