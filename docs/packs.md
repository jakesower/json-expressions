# Expression Packs Reference

This document provides a comprehensive overview of all expression packs available in JSON Expressions and the expressions they contain.

> **Quick Start:** Most users should start with the [basePack](#basepack---essential-expressions) which includes the most commonly used expressions. Add additional packs as needed for your specific use cases.

## Pack Selection Guide

Choose packs based on your application's needs:

- **Configuration & Rules**: [basePack](#basepack---essential-expressions) + [filteringPack](#filteringpack---data-filtering-toolkit)
- **Data Transformation**: [arrayPack](#arraypack---array-manipulation) + [projectionPack](#projectionpack---data-transformation)
- **Mathematical Computation**: [mathPack](#mathpack---arithmetic-operations) + [aggregationPack](#aggregationpack---statistical-functions)
- **String Processing**: [stringPack](#stringpack---string-operations)
- **Object Manipulation**: [objectPack](#objectpack---key-value-manipulation)

## Available Packs

### basePack - Essential Expressions

**Use case:** Near-universal expressions for most applications. Includes data access, basic conditionals, comparisons, boolean logic, and common array operations.

**When to use:** Start here for almost all applications. This pack covers 80% of common use cases.

```javascript
import { createExpressionEngine, basePack } from "json-expressions";
const engine = createExpressionEngine({ packs: [basePack] });
```

#### Data Access

- [`$get`](expressions.md#get) - Access object properties by path
- [`$identity`](expressions.md#identity) - Return input unchanged (identity function)

#### Conditionals

- [`$case`](expressions.md#case) - Multi-branch conditional with literal and predicate support
- [`$if`](expressions.md#if) - Simple if-then-else conditional

#### Comparisons

- [`$eq`](expressions.md#eq) - Test equality
- [`$gt`](expressions.md#gt) - Test greater than
- [`$gte`](expressions.md#gte) - Test greater than or equal
- [`$lt`](expressions.md#lt) - Test less than
- [`$lte`](expressions.md#lte) - Test less than or equal
- [`$ne`](expressions.md#ne) - Test not equal

#### Boolean Logic

- [`$and`](expressions.md#and) - Logical AND operation
- [`$not`](expressions.md#not) - Logical NOT operation
- [`$or`](expressions.md#or) - Logical OR operation

#### Array Operations

- [`$filter`](expressions.md#filter) - Filter array by predicate
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria
- [`$map`](expressions.md#map) - Transform array elements

#### Validation & Utility

- [`$exists`](expressions.md#exists) - Test if object property exists
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined)
- [`$matches`](expressions.md#matches) - Test if object matches criteria

#### Flow Control

- [`$default`](expressions.md#default) - Provide default value for null/undefined
- [`$literal`](expressions.md#literal) - Treat value as literal (not expression)
- [`$pipe`](expressions.md#pipe) - Chain expressions in sequence
- [`$sort`](expressions.md#sort) - Sort array by criteria

---

### mathPack - Arithmetic Operations

**Use case:** Mathematical calculations, arithmetic operations, and basic statistical functions.

**When to use:** Applications involving numerical computations, calculations, or mathematical transformations.

```javascript
import { createExpressionEngine, mathPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [mathPack] });
```

#### Basic Arithmetic

- [`$abs`](expressions.md#abs) - Absolute value of a number
- [`$add`](expressions.md#add) - Addition of numbers
- [`$divide`](expressions.md#divide) - Division of numbers
- [`$modulo`](expressions.md#modulo) - Modulo operation
- [`$multiply`](expressions.md#multiply) - Multiplication of numbers
- [`$subtract`](expressions.md#subtract) - Subtraction of numbers

#### Mathematical Functions

- [`$pow`](expressions.md#pow) - Exponentiation
- [`$sqrt`](expressions.md#sqrt) - Square root

#### Aggregations

- [`$count`](expressions.md#count) - Count elements in array
- [`$max`](expressions.md#max) - Find maximum value
- [`$mean`](expressions.md#mean) - Calculate average
- [`$min`](expressions.md#min) - Find minimum value
- [`$sum`](expressions.md#sum) - Sum of numbers

---

### comparisonPack - Scalar Comparison Operations

**Use case:** Basic comparison operations for WHERE clause logic and validation.

**When to use:** Applications focusing on filtering, validation, or conditional logic based on scalar comparisons.

```javascript
import { createExpressionEngine, comparisonPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [comparisonPack] });
```

#### Basic Comparisons

- [`$eq`](expressions.md#eq) - Test equality
- [`$gt`](expressions.md#gt) - Test greater than
- [`$gte`](expressions.md#gte) - Test greater than or equal
- [`$lt`](expressions.md#lt) - Test less than
- [`$lte`](expressions.md#lte) - Test less than or equal
- [`$ne`](expressions.md#ne) - Test not equal

#### Range & Membership

- [`$between`](expressions.md#between) - Test if value is within range
- [`$in`](expressions.md#in) - Test if value is in array
- [`$nin`](expressions.md#nin) - Test if value is not in array

#### Value Validation

- [`$exists`](expressions.md#exists) - Test if object property exists
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined)

---

### arrayPack - Array Manipulation

**Use case:** Complete array manipulation toolkit for data transformation and processing.

**When to use:** Applications that work extensively with arrays, lists, or collections requiring transformation, filtering, or manipulation.

```javascript
import { createExpressionEngine, arrayPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [arrayPack] });
```

#### Core Transformations

- [`$filter`](expressions.md#filter) - Filter array by predicate
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria
- [`$find`](expressions.md#find) - Find first matching element
- [`$map`](expressions.md#map) - Transform array elements

#### Predicates & Testing

- [`$all`](expressions.md#all) - Test if all elements match predicate
- [`$any`](expressions.md#any) - Test if any element matches predicate

#### Advanced Operations

- [`$flatMap`](expressions.md#flatmap) - Map and flatten results
- [`$flatten`](expressions.md#flatten) - Flatten nested arrays

#### Array Modifications

- [`$append`](expressions.md#append) - Add elements to end of array
- [`$concat`](expressions.md#concat) - Concatenate multiple arrays
- [`$join`](expressions.md#join) - Join array elements into string
- [`$prepend`](expressions.md#prepend) - Add elements to start of array
- [`$reverse`](expressions.md#reverse) - Reverse array order
- [`$unique`](expressions.md#unique) - Remove duplicate elements

#### Array Slicing

- [`$skip`](expressions.md#skip) - Skip first N elements
- [`$take`](expressions.md#take) - Take first N elements

#### Array Accessors

- [`$first`](expressions.md#first) - Get first element of array
- [`$last`](expressions.md#last) - Get last element of array

#### Data Extraction

- [`$pluck`](expressions.md#pluck) - Extract property values from object array

#### Utility

- [`$coalesce`](expressions.md#coalesce) - Get first non-null value

#### Grouping

- [`$groupBy`](expressions.md#groupby) - Group array elements by criteria

---

### objectPack - Key-Value Manipulation

**Use case:** Object and dictionary operations for property manipulation and introspection.

**When to use:** Applications working with complex objects, needing property selection, merging, or object transformation.

```javascript
import { createExpressionEngine, objectPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [objectPack] });
```

#### Property Access

- [`$select`](expressions.md#select) - Select and transform object properties

#### Property Selection

- [`$omit`](expressions.md#omit) - Create object without specified properties
- [`$pick`](expressions.md#pick) - Create object with only specified properties

#### Object Combination

- [`$merge`](expressions.md#merge) - Merge multiple objects

#### Object Introspection

- [`$fromPairs`](expressions.md#frompairs) - Create object from key-value pairs
- [`$keys`](expressions.md#keys) - Get object property names
- [`$pairs`](expressions.md#pairs) - Convert object to key-value pairs
- [`$values`](expressions.md#values) - Get object property values

---

### stringPack - String Operations

**Use case:** String processing and transformation functions.

**When to use:** Applications involving text processing, formatting, or string manipulation.

```javascript
import { createExpressionEngine, stringPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [stringPack] });
```

#### String Transformations

- [`$lowercase`](expressions.md#lowercase) - Convert to lowercase
- [`$trim`](expressions.md#trim) - Remove whitespace from ends
- [`$uppercase`](expressions.md#uppercase) - Convert to uppercase

#### String Operations

- [`$replace`](expressions.md#replace) - Replace text in string
- [`$split`](expressions.md#split) - Split string into array
- [`$substring`](expressions.md#substring) - Extract substring

---

### filteringPack - Data Filtering Toolkit

**Use case:** Comprehensive WHERE clause logic and data filtering operations.

**When to use:** Applications with complex filtering requirements, search functionality, or business rule evaluation.

```javascript
import { createExpressionEngine, filteringPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [filteringPack] });
```

#### Basic Comparisons

- [`$between`](expressions.md#between) - Test if value is within range
- [`$eq`](expressions.md#eq) - Test equality
- [`$gt`](expressions.md#gt) - Test greater than
- [`$gte`](expressions.md#gte) - Test greater than or equal
- [`$lt`](expressions.md#lt) - Test less than
- [`$lte`](expressions.md#lte) - Test less than or equal
- [`$ne`](expressions.md#ne) - Test not equal

#### Logic Operations

- [`$and`](expressions.md#and) - Logical AND operation
- [`$not`](expressions.md#not) - Logical NOT operation
- [`$or`](expressions.md#or) - Logical OR operation

#### Array Filtering

- [`$all`](expressions.md#all) - Test if all elements match predicate
- [`$any`](expressions.md#any) - Test if any element matches predicate
- [`$filter`](expressions.md#filter) - Filter array by predicate
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria
- [`$find`](expressions.md#find) - Find first matching element

#### Object Filtering

- [`$matches`](expressions.md#matches) - Test if object matches criteria

#### Membership Tests

- [`$in`](expressions.md#in) - Test if value is in array
- [`$nin`](expressions.md#nin) - Test if value is not in array

#### Value & Existence Checks

- [`$exists`](expressions.md#exists) - Test if object property exists
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined)

#### Pattern Matching

- [`$matchesRegex`](expressions.md#matchesregex) - Test if string matches regex pattern

---

### projectionPack - Data Transformation

**Use case:** SELECT clause operations and data transformation for reshaping and projecting data.

**When to use:** Applications that need to transform, reshape, or project data into different formats or structures.

```javascript
import { createExpressionEngine, projectionPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [projectionPack] });
```

#### Field Access

- [`$get`](expressions.md#get) - Access object properties by path
- [`$select`](expressions.md#select) - Select and transform object properties

#### Array Transformations

- [`$concat`](expressions.md#concat) - Concatenate multiple arrays
- [`$filter`](expressions.md#filter) - Filter array by predicate
- [`$flatMap`](expressions.md#flatmap) - Map and flatten results
- [`$join`](expressions.md#join) - Join array elements into string
- [`$map`](expressions.md#map) - Transform array elements
- [`$pluck`](expressions.md#pluck) - Extract property values from object array
- [`$unique`](expressions.md#unique) - Remove duplicate elements

#### String Transformations

- [`$lowercase`](expressions.md#lowercase) - Convert to lowercase
- [`$substring`](expressions.md#substring) - Extract substring
- [`$uppercase`](expressions.md#uppercase) - Convert to uppercase

#### Conditionals for Computed Fields

- [`$case`](expressions.md#case) - Multi-branch conditional with literal and predicate support
- [`$if`](expressions.md#if) - Simple if-then-else conditional

#### Comparison Operations

- [`$eq`](expressions.md#eq) - Test equality
- [`$gt`](expressions.md#gt) - Test greater than
- [`$gte`](expressions.md#gte) - Test greater than or equal
- [`$in`](expressions.md#in) - Test if value is in array
- [`$lt`](expressions.md#lt) - Test less than
- [`$lte`](expressions.md#lte) - Test less than or equal
- [`$ne`](expressions.md#ne) - Test not equal
- [`$nin`](expressions.md#nin) - Test if value is not in array

---

### aggregationPack - Statistical Functions

**Use case:** Statistical and aggregation functions for data analysis and summarization.

**When to use:** Applications requiring statistical analysis, data summarization, or aggregation operations.

```javascript
import { createExpressionEngine, aggregationPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [aggregationPack] });
```

#### Basic Aggregations

- [`$count`](expressions.md#count) - Count elements in array
- [`$max`](expressions.md#max) - Find maximum value
- [`$min`](expressions.md#min) - Find minimum value
- [`$sum`](expressions.md#sum) - Sum of numbers

#### Statistical Measures

- [`$mean`](expressions.md#mean) - Calculate average

#### Array Accessors

- [`$first`](expressions.md#first) - Get first element of array
- [`$last`](expressions.md#last) - Get last element of array

#### Grouping Operations

- [`$groupBy`](expressions.md#groupby) - Group array elements by criteria

---

## Other Expressions

### Debug Expression

- [`$debug`](expressions.md#debug) - Debug helper for development (available in all engines)

## Expression Coverage by Pack

| Expression      | base\* | math | comparison | array | object | string | filtering | projection | aggregation |
| --------------- | ------ | ---- | ---------- | ----- | ------ | ------ | --------- | ---------- | ----------- |
| `$abs`          |        | ✓    |            |       |        |        |           |            |             |
| `$add`          |        | ✓    |            |       |        |        |           |            |             |
| `$all`          |        |      |            | ✓     |        |        | ✓         |            |             |
| `$and`          | ✓      |      |            |       |        |        | ✓         |            |             |
| `$any`          |        |      |            | ✓     |        |        | ✓         |            |             |
| `$append`       |        |      |            | ✓     |        |        |           |            |             |
| `$between`      |        |      | ✓          |       |        |        | ✓         |            |             |
| `$case`         | ✓      |      |            |       |        |        |           | ✓          |             |
| `$coalesce`     |        |      |            | ✓     |        |        |           |            |             |
| `$concat`       |        |      |            | ✓     |        |        |           | ✓          |             |
| `$count`        |        | ✓    |            |       |        |        |           |            | ✓           |
| `$debug`†       |        |      |            |       |        |        |           |            |             |
| `$default`      | ✓      |      |            |       |        |        |           |            |             |
| `$divide`       |        | ✓    |            |       |        |        |           |            |             |
| `$eq`           | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$exists`       | ✓      |      | ✓          |       |        |        | ✓         |            |             |
| `$filter`       | ✓      |      |            | ✓     |        |        | ✓         | ✓          |             |
| `$filterBy`     | ✓      |      |            | ✓     |        |        | ✓         |            |             |
| `$find`         |        |      |            | ✓     |        |        | ✓         |            |             |
| `$first`        |        |      |            | ✓     |        |        |           |            | ✓           |
| `$flatMap`      |        |      |            | ✓     |        |        |           | ✓          |             |
| `$flatten`      |        |      |            | ✓     |        |        |           |            |             |
| `$fromPairs`    |        |      |            |       | ✓      |        |           |            |             |
| `$get`          | ✓      |      |            |       |        |        |           | ✓          |             |
| `$groupBy`      |        |      |            | ✓     |        |        |           |            | ✓           |
| `$gt`           | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$gte`          | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$identity`     | ✓      |      |            |       |        |        |           |            |             |
| `$if`           | ✓      |      |            |       |        |        |           | ✓          |             |
| `$in`           |        |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$isEmpty`      | ✓      |      | ✓          |       |        |        | ✓         |            |             |
| `$isPresent`    | ✓      |      | ✓          |       |        |        | ✓         |            |             |
| `$join`         |        |      |            | ✓     |        |        |           | ✓          |             |
| `$keys`         |        |      |            |       | ✓      |        |           |            |             |
| `$last`         |        |      |            | ✓     |        |        |           |            | ✓           |
| `$literal`      | ✓      |      |            |       |        |        |           |            |             |
| `$lowercase`    |        |      |            |       |        | ✓      |           | ✓          |             |
| `$lt`           | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$lte`          | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$map`          | ✓      |      |            | ✓     |        |        |           | ✓          |             |
| `$matches`      | ✓      |      |            |       |        |        | ✓         |            |             |
| `$matchesRegex` |        |      |            |       |        |        | ✓         |            |             |
| `$max`          |        | ✓    |            |       |        |        |           |            | ✓           |
| `$mean`         |        | ✓    |            |       |        |        |           |            | ✓           |
| `$merge`        |        |      |            |       | ✓      |        |           |            |             |
| `$min`          |        | ✓    |            |       |        |        |           |            | ✓           |
| `$modulo`       |        | ✓    |            |       |        |        |           |            |             |
| `$multiply`     |        | ✓    |            |       |        |        |           |            |             |
| `$ne`           | ✓      |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$nin`          |        |      | ✓          |       |        |        | ✓         | ✓          |             |
| `$not`          | ✓      |      |            |       |        |        | ✓         |            |             |
| `$omit`         |        |      |            |       | ✓      |        |           |            |             |
| `$or`           | ✓      |      |            |       |        |        | ✓         |            |             |
| `$pairs`        |        |      |            |       | ✓      |        |           |            |             |
| `$pick`         |        |      |            |       | ✓      |        |           |            |             |
| `$pipe`         | ✓      |      |            |       |        |        |           |            |             |
| `$pluck`        |        |      |            | ✓     |        |        |           | ✓          |             |
| `$pow`          |        | ✓    |            |       |        |        |           |            |             |
| `$prepend`      |        |      |            | ✓     |        |        |           |            |             |
| `$replace`      |        |      |            |       |        | ✓      |           |            |             |
| `$reverse`      |        |      |            | ✓     |        |        |           |            |             |
| `$select`       |        |      |            |       | ✓      |        |           | ✓          |             |
| `$skip`         |        |      |            | ✓     |        |        |           |            |             |
| `$sort`         | ✓      |      |            |       |        |        |           |            |             |
| `$split`        |        |      |            |       |        | ✓      |           |            |             |
| `$sqrt`         |        | ✓    |            |       |        |        |           |            |             |
| `$substring`    |        |      |            |       |        | ✓      |           | ✓          |             |
| `$subtract`     |        | ✓    |            |       |        |        |           |            |             |
| `$sum`          |        | ✓    |            |       |        |        |           |            | ✓           |
| `$take`         |        |      |            | ✓     |        |        |           |            |             |
| `$trim`         |        |      |            |       |        | ✓      |           |            |             |
| `$unique`       |        |      |            | ✓     |        |        |           | ✓          |             |
| `$uppercase`    |        |      |            |       |        | ✓      |           | ✓          |             |
| `$values`       |        |      |            |       | ✓      |        |           |            |             |

> \* The base pack is included in the expression engine by default. It must explicitly be excluded.

> † The `$debug` expression is not in any packs and must be imported manually.

---

## Related Documentation

- **[Expression Reference](expressions.md)** - Complete documentation for all expressions
- **[Quick Start Guide](quick-start.md)** - Get started with JSON expressions
- **[Custom Expressions](custom-expressions.md)** - Create your own expressions
