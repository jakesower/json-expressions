# Evaluate Mode Documentation

This is advanced documentation for the **evaluate method** of JSON Expressions. Most users should start with the **[main README](../README.md)** which focuses on the **apply method** (90%+ of use cases).

The expression engine provides **dual-mode support** with both apply and evaluate capabilities. This documentation focuses on evaluate mode for advanced scenarios requiring static calculations or template-style expressions.

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
- `{ $identity: null }` returns the input data unchanged (identity function)
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
- `{ $identity: "value" }` returns "value" unchanged
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

| Expression  | Apply Mode (Single)             | Apply Mode (Array)                              | Evaluate Mode                        |
| ----------- | ------------------------------- | ----------------------------------------------- | ------------------------------------ |
| `$gt`       | `{ $gt: 18 }`                   | `{ $gt: [{ $get: "age" }, 18] }`                | `{ $gt: [25, 18] }`                  |
| `$add`      | `{ $add: 5 }`                   | `{ $add: [{ $get: "base" }, { $get: "tax" }] }` | `{ $add: [10, 5] }`                  |
| `$get`      | `{ $get: "name" }`              | N/A                                             | `{ $get: { object, path: "name" } }` |
| `$identity` | `{ $identity: null }`           | N/A                                             | `{ $identity: "value" }`             |
| `$sum`      | `{ $sum: { $identity: null } }` | N/A                                             | `{ $sum: [1, 2, 3] }`                |

**Key difference**: Apply mode expressions operate **on** the input data, while evaluate mode expressions contain **all** the data they need.

### Array Forms in Apply Mode

Many arithmetic and comparison expressions support **array forms** in apply mode, allowing you to compare or compute with multiple values from your input data:

```javascript
const user = { age: 25, yearJoined: 2020, currentYear: 2024 };

// Comparison with multiple input values
engine.apply({ $gt: [{ $get: "age" }, { $get: "yearJoined" }] }, user);
// Returns: true (25 > 2020 is false, but this compares age > yearJoined)

// Arithmetic with multiple input values
engine.apply({ $add: [{ $get: "currentYear" }, { $get: "yearJoined" }] }, user);
// Returns: 4044 (2024 + 2020)

// Mixed input and literal values
engine.apply({ $multiply: [{ $get: "age" }, 12] }, user);
// Returns: 300 (age * 12 months)
```

**When to use array forms:**

- Comparing multiple properties: `{ $gt: [{ $get: "endDate" }, { $get: "startDate" }] }`
- Computing with multiple inputs: `{ $add: [{ $get: "base" }, { $get: "tax" }] }`
- Mixed input/literal operations: `{ $multiply: [{ $get: "hours" }, 40] }`

**When to use single operand:**

- Comparing input to constant: `{ $gt: 18 }` (simpler than `{ $gt: [{ $identity: null }, 18] }`)
- Operating on entire input: `{ $add: 5 }` when input is a number

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
engine.apply({ $mean: { $identity: null } }, [85, 90, 88]);
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
  $matches: {
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
const userEngine = createExpressionEngine({ packs: [filteringPack] });

// Full-featured engine for admin interfaces
const adminEngine = createExpressionEngine({
  packs: [filteringPack, projectionPack, mathPack],
});

// Specialized engine for specific domains
const geoEngine = createExpressionEngine({
  packs: [filteringPack],
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
      { $filter: { $matches: { age: { $gte: 5 } } } },
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
- `config.includeBase` (Boolean, default: true) - Whether to include base expressions. Note that $literal cannot be excluded or overwritten.

```javascript
import { createExpressionEngine, mathPack } from "json-expressions";

// Create engine with math pack
const mathEngine = createExpressionEngine({
  packs: [mathPack],
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
engine.apply({ $get: "name" }, null);
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

- [**$and**](docs/expressions.md#and) - Logical AND operation across multiple expressions
- [**$default**](docs/expressions.md#default) - Returns first non-null/undefined value from array of expressions
- [**$filter**](docs/expressions.md#filter) - Filters array items based on a condition
- [**$filterBy**](docs/expressions.md#filterby) - Filters arrays by object property conditions (combines $filter + $matches)
- [**$get**](docs/expressions.md#get) - Retrieves a value from data using dot notation paths with optional defaults
- [**$identity**](docs/expressions.md#identity) - Returns input data unchanged in apply mode, or evaluates/returns the operand in evaluate mode
- [**$if**](docs/expressions.md#if) - Conditional expression that evaluates different branches based on a condition
- [**$isPresent**](docs/expressions.md#hasvalue) - Tests if a value is meaningful (not null or undefined)
- [**$isEmpty**](docs/expressions.md#isempty) - Tests if a value is empty/absent (null or undefined)
- [**$exists**](docs/expressions.md#exists) - Tests if a property or path exists in an object
- [**$literal**](docs/expressions.md#literal) - Returns a literal value (useful when you need to pass values that look like expressions)
- [**$map**](docs/expressions.md#map) - Transforms each item in an array using an expression
- [**$not**](docs/expressions.md#not) - Logical NOT operation that inverts a boolean expression
- [**$or**](docs/expressions.md#or) - Logical OR operation across multiple expressions
- [**$pipe**](docs/expressions.md#pipe) - Pipes data through multiple expressions in sequence (left-to-right)
- [**$sort**](docs/expressions.md#sort) - Sorts arrays by property or expression with optional desc flag
- [**$matches**](docs/expressions.md#matches) - **Primary tool for object-based conditions** - tests objects against property patterns using dot notation and predicates

**Comparison expressions (support array forms for comparing multiple input values):**

- [**$eq**](docs/expressions.md#eq) - Tests equality: `{ $eq: "active" }` or `{ $eq: [{ $get: "status" }, { $get: "expectedStatus" }] }`
- [**$gt**](docs/expressions.md#gt) - Tests greater than: `{ $gt: 18 }` or `{ $gt: [{ $get: "endDate" }, { $get: "startDate" }] }`
- [**$gte**](docs/expressions.md#gte) - Tests greater than or equal: `{ $gte: 21 }` or `{ $gte: [{ $get: "score" }, { $get: "threshold" }] }`
- [**$lt**](docs/expressions.md#lt) - Tests less than: `{ $lt: 100 }` or `{ $lt: [{ $get: "price" }, { $get: "budget" }] }`
- [**$lte**](docs/expressions.md#lte) - Tests less than or equal: `{ $lte: 65 }` or `{ $lte: [{ $get: "age" }, { $get: "retirementAge" }] }`
- [**$ne**](docs/expressions.md#ne) - Tests inequality: `{ $ne: null }` or `{ $ne: [{ $get: "current" }, { $get: "previous" }] }`

### Available Packs

Beyond the base pack, you can import additional functionality as needed:

```javascript
import { createExpressionEngine, mathPack, stringPack } from "json-expressions";

const engine = createExpressionEngine({
  packs: [mathPack, stringPack],
});
```

#### Aggregation Pack

Statistical and aggregation functions for data analysis:

- [**$count**](docs/expressions.md#count) - Count of items in an array
- [**$first**](docs/expressions.md#first) - First item in an array
- [**$last**](docs/expressions.md#last) - Last item in an array
- [**$max**](docs/expressions.md#max) - Maximum value in an array
- [**$mean**](docs/expressions.md#mean) - Arithmetic mean (average) of array values
- [**$min**](docs/expressions.md#min) - Minimum value in an array
- [**$sum**](docs/expressions.md#sum) - Sum of array values

#### Array Pack

Complete array manipulation toolkit:

- [**$all**](docs/expressions.md#all) - Tests if all elements in an array satisfy a predicate
- [**$any**](docs/expressions.md#any) - Tests if any element in an array satisfies a predicate
- [**$append**](docs/expressions.md#append) - Appends an array to the end of another array
- [**$coalesce**](docs/expressions.md#coalesce) - Returns the first non-null value from an array
- [**$concat**](docs/expressions.md#concat) - Concatenates multiple arrays together
- [**$find**](docs/expressions.md#find) - Returns first element that satisfies a predicate
- [**$flatMap**](docs/expressions.md#flatmap) - Maps and flattens array items
- [**$flatten**](docs/expressions.md#flatten) - Flattens nested arrays to specified depth
- [**$groupBy**](docs/expressions.md#groupby) - Groups array elements by a property or expression
- [**$join**](docs/expressions.md#join) - Joins array elements into a string with a separator
- [**$pluck**](docs/expressions.md#pluck) - Extracts property values from array of objects
- [**$prepend**](docs/expressions.md#prepend) - Prepends an array to the beginning of another array
- [**$reverse**](docs/expressions.md#reverse) - Returns array with elements in reverse order
- [**$skip**](docs/expressions.md#skip) - Skips first N elements of an array
- [**$take**](docs/expressions.md#take) - Takes first N elements of an array
- [**$unique**](docs/expressions.md#unique) - Returns unique values from an array

#### Comparison Pack

Scalar comparison operations for filtering and validation. Includes all base comparison expressions plus specialized comparison utilities:

- [**$between**](docs/expressions.md#between) - Tests if value is between two bounds (inclusive)
- [**$has**](docs/expressions.md#has) - Tests if object has property at specified path (supports dot notation)
- [**$in**](docs/expressions.md#in) - Tests if value exists in an array
- [**$isPresent**](docs/expressions.md#hasvalue) - Tests if value is meaningful (not null or undefined)
- [**$isEmpty**](docs/expressions.md#isempty) - Tests if value is empty/absent (null or undefined)
- [**$exists**](docs/expressions.md#exists) - Tests if property or path exists in an object
- [**$nin**](docs/expressions.md#nin) - Tests if value does not exist in an array

All basic comparison expressions (`$eq`, `$gt`, `$gte`, `$lt`, `$lte`, `$ne`) support both single operand and array forms for comparing multiple input values.

#### Filtering Pack

Complete toolkit for WHERE clause logic and data filtering - combines field access, comparisons, logic, and pattern matching:

- [**$and**](docs/expressions.md#and), [**$or**](docs/expressions.md#or), [**$not**](docs/expressions.md#not) - Boolean logic
- [**$eq**](docs/expressions.md#eq), [**$ne**](docs/expressions.md#ne), [**$gt**](docs/expressions.md#gt), [**$gte**](docs/expressions.md#gte), [**$lt**](docs/expressions.md#lt), [**$lte**](docs/expressions.md#lte) - Basic comparisons
- [**$get**](docs/expressions.md#get) - Field access with dot notation paths
- [**$in**](docs/expressions.md#in), [**$nin**](docs/expressions.md#nin) - Membership tests
- [**$matches**](docs/expressions.md#matches) - **Primary tool for object conditions** - handles complex property patterns with dot notation
- [**$isPresent**](docs/expressions.md#hasvalue), [**$isEmpty**](docs/expressions.md#isempty), [**$exists**](docs/expressions.md#exists) - Value and existence checks
- [**$matchesRegex**](docs/expressions.md#matchesregex), [**$matchesLike**](docs/expressions.md#matcheslike), [**$matchesGlob**](docs/expressions.md#matchesglob) - Pattern matching
- [**$pipe**](docs/expressions.md#pipe) - Chain multiple filtering operations

Perfect for building complex filters with a single import. Use `$matches` as your primary tool for object-based conditions:

```javascript
import { createExpressionEngine, filteringPack } from "json-expressions";

const engine = createExpressionEngine({ packs: [filteringPack] });

// Complex daycare filtering with nested properties
const activeToddlers = engine.apply(
  {
    $matches: {
      age: { $and: [{ $gte: 2 }, { $lte: 4 }] }, // Age between 2 and 4
      status: { $eq: "active" }, // Active enrollment status
      "guardian.contact.phone": { $isPresent: true }, // Emergency contact required
      "medical.allergies": { $nin: ["severe-nuts", "severe-dairy"] }, // Safety restrictions
      activity: { $nin: ["napping", "sick"] }, // Currently available
    },
  },
  children,
);
```

#### Projection Pack

Complete toolkit for SELECT clause operations and data transformation - combines aggregation, array operations, string transforms, and conditionals:

- [**$get**](docs/expressions.md#get) - Field access with dot notation paths
- [**$pipe**](docs/expressions.md#pipe) - Chain multiple projection operations
- [**$select**](docs/expressions.md#select) - Projects/selects specific properties from objects
- [**$count**](docs/expressions.md#count), [**$sum**](docs/expressions.md#sum), [**$min**](docs/expressions.md#min), [**$max**](docs/expressions.md#max), [**$mean**](docs/expressions.md#mean) - Aggregation functions
- [**$map**](docs/expressions.md#map), [**$filter**](docs/expressions.md#filter), [**$flatMap**](docs/expressions.md#flatmap), [**$distinct**](docs/expressions.md#distinct) - Array transformations
- [**$concat**](docs/expressions.md#concat), [**$join**](docs/expressions.md#join), [**$substring**](docs/expressions.md#substring), [**$uppercase**](docs/expressions.md#uppercase), [**$lowercase**](docs/expressions.md#lowercase) - String/value operations
- [**$if**](docs/expressions.md#if), [**$case**](docs/expressions.md#case) - Conditionals for computed fields

Perfect for transforming and projecting data with a single import:

```javascript
import { createExpressionEngine, projectionPack } from "json-expressions";

const engine = createExpressionEngine({ packs: [projectionPack] });

// Complex daycare reporting
const report = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      { $filter: { $get: "active" } },
      {
        $map: {
          name: { $get: "name" },
          displayName: { $uppercase: { $get: "name" } },
          ageGroup: {
            $if: {
              if: { $matches: { age: { $gte: 4 } } },
              then: "Pre-K",
              else: "Toddler",
            },
          },
          activities: { $join: ", " },
        },
      },
    ],
  },
  daycareData,
);
```

#### Object Pack

Key-value manipulation and object operations:

- [**$fromPairs**](docs/expressions.md#frompairs) - Creates object from array of [key, value] pairs
- [**$keys**](docs/expressions.md#keys) - Returns array of object property names
- [**$merge**](docs/expressions.md#merge) - Merges multiple objects together
- [**$omit**](docs/expressions.md#omit) - Creates object excluding specified properties
- [**$pairs**](docs/expressions.md#pairs) - Returns array of [key, value] pairs from object
- [**$pick**](docs/expressions.md#pick) - Creates object with only specified properties
- [**$values**](docs/expressions.md#values) - Returns array of object property values

#### Math Pack

Arithmetic operations and mathematical functions. All binary operations support both single operand and array forms in apply mode:

- [**$abs**](docs/expressions.md#abs) - Absolute value of a number
- [**$add**](docs/expressions.md#add) - Addition: `{ $add: 5 }` or `{ $add: [{ $get: "x" }, { $get: "y" }] }`
- [**$divide**](docs/expressions.md#divide) - Division: `{ $divide: 2 }` or `{ $divide: [{ $get: "total" }, { $get: "count" }] }`
- [**$modulo**](docs/expressions.md#modulo) - Modulo (remainder): `{ $modulo: 10 }` or `{ $modulo: [{ $get: "value" }, 100] }`
- [**$multiply**](docs/expressions.md#multiply) - Multiplication: `{ $multiply: 1.5 }` or `{ $multiply: [{ $get: "price" }, { $get: "quantity" }] }`
- [**$pow**](docs/expressions.md#pow) - Power/exponentiation: `{ $pow: 2 }` or `{ $pow: [{ $get: "base" }, { $get: "exponent" }] }`
- [**$sqrt**](docs/expressions.md#sqrt) - Square root of a number
- [**$subtract**](docs/expressions.md#subtract) - Subtraction: `{ $subtract: 10 }` or `{ $subtract: [{ $get: "total" }, { $get: "discount" }] }`

#### String Pack

String processing and pattern matching:

- [**$lowercase**](docs/expressions.md#lowercase) - Converts string to lowercase
- [**$matchesRegex**](docs/expressions.md#matchesregex) - Tests if string matches a regular expression
- [**$replace**](docs/expressions.md#replace) - Replaces occurrences of a pattern in a string
- [**$split**](docs/expressions.md#split) - Splits a string into an array using a separator
- [**$substring**](docs/expressions.md#substring) - Extracts a portion of a string
- [**$trim**](docs/expressions.md#trim) - Removes whitespace from beginning and end of string
- [**$uppercase**](docs/expressions.md#uppercase) - Converts string to uppercase

## Individual Expression Imports

Some expressions are available for direct import when you need them outside of packs:

### Debug Expression

The `$debug` expression is useful for development and troubleshooting but isn't included in any pack by default. Import it directly when needed:

```javascript
import { createExpressionEngine } from "json-expressions";
import { $debug } from "json-expressions/src/definitions/flow";

const engine = createExpressionEngine({
  custom: { $debug },
});

// Use in pipelines to inspect intermediate values
const result = engine.apply(
  {
    $pipe: [
      { $get: "users" },
      { $debug: "After getting users" }, // Logs to console
      { $filter: { active: true } },
      { $debug: "After filtering active" }, // Logs to console
      { $map: { $get: "name" } },
    ],
  },
  data,
);
```

**Any** expression can be included with this method. Use it if you don't want the overhead of an entire pack.

## Usage Examples

### Building Blocks: Simple to Complex

JSON Expressions excel at composing simple operations into complex logic:

```javascript
// Start simple: basic comparison
{
  $gt: 5;
}

// Add logic: combine conditions
{
  $and: [{ $gt: 5 }, { $lt: 10 }];
}

// Add data access: work with objects
{
  $pipe: [{ $get: "age" }, { $and: [{ $gt: 5 }, { $lt: 10 }] }];
}

// Add transformation: complex pipeline
{
  $pipe: [
    { $filter: { $gte: 4 } }, // Filter items >= 4
    { $map: { $multiply: 2 } }, // Double each value
    { $sum: { $identity: null } }, // Sum the results
  ];
}
// Input: [1, 2, 4, 6, 8] → Output: 36
```

### Common Patterns

```javascript
// Object-based conditions (preferred approach)
{
  $matches: {
    age: { $gte: 18 },
    status: { $eq: "active" },
    "account.balance": { $gt: 0 }
  }
}

// Conditional values based on object properties
{
  $if: {
    if: { $matches: { age: { $gte: 18 }, status: "active" } },
    then: "eligible",
    else: "not eligible",
  }
}

// Complex nested property conditions
{
  $matches: {
    "user.plan": { $in: ["pro", "enterprise"] },
    "user.signupDate": { $gte: "2024-01-01" },
    "user.riskScore": { $lt: 0.3 }
  }
}

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
          { when: { $lt: 20 }, then: "teen" },
        ],
        default: "adult"
      }
    }
  }
}
```

### $matches: The Object Condition Workhorse

`$matches` is the go-to expression for any daycare-based filtering or validation. It combines property access with predicate evaluation in a clean, readable syntax:

```javascript
// Instead of complex $and chains with $get and $pipe...
{
  $and: [
    { $pipe: [{ $get: "child.age" }, { $gte: 3 }] },
    { $pipe: [{ $get: "enrollment.status" }, { $eq: "active" }] },
    { $pipe: [{ $get: "guardian.emergency.phone" }, { $isPresent: true }] }
  ]
}

// Use $matches for clean, readable conditions
{
  $matches: {
    "child.age": { $gte: 3 },
    "enrollment.status": "active",
    "guardian.emergency.phone": { $isPresent: true }
  }
}
```

**Key features:**

- **Dot notation paths**: Access nested properties with `"child.medical.allergies"`
- **Mixed predicates and literals**: Combine `{ $gte: 3 }` with `"active"`
- **Implicit AND logic**: All conditions must be true
- **Performance**: More efficient than separate property access + predicate chains

### Basic Data Transformation

```javascript
import { createExpressionEngine } from "json-expressions";

const engine = createExpressionEngine();

const daycareData = {
  teacher: { name: "James", age: 46 },
  children: [
    { name: "Chen", age: 4, activity: "playing" },
    { name: "Serafina", age: 5, activity: "reading" },
    { name: "Diego", age: 3, activity: "napping" },
  ],
};

// Get teacher name
const teacherName = engine.apply({ $get: "teacher.name" }, daycareData);
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

You can extend JSON Expressions with custom functionality. For comprehensive documentation on creating custom expressions, see [Custom Expressions Guide](docs/custom-expressions.md).

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
import { createExpressionEngine, objectPack } from "json-expressions";

const engine = createExpressionEngine({ packs: [objectPack] });

const students = [
  { name: "Aisha", age: 3, scores: [85, 90, 88], active: true },
  { name: "Chen", age: 5, scores: [92, 87, 95], active: true },
  { name: "Diego", age: 3, scores: [78, 84, 91], active: false },
  { name: "Serafina", age: 6, scores: [88, 92, 85], active: true },
];

// Use $filterBy for elegant filtering
const activeOlderStudents = engine.apply(
  {
    $filterBy: {
      active: { $eq: true },
      age: { $lt: 6 },
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
        averageScore: {
          $pipe: [{ $get: "scores" }, { $mean: { $identity: null } }],
        },
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
    $pipe: [{ $pluck: "scores" }, { $flatten: { $identity: null } }],
  },
  students,
);
// Returns: [85, 90, 88, 92, 87, 95, 78, 84, 91, 88, 92, 85]

// Use $unique to remove duplicates
const uniqueAges = engine.apply(
  {
    $pipe: [{ $pluck: "age" }, { $unique: { $identity: null } }],
  },
  students,
);
// Returns: [3, 5, 6]
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
