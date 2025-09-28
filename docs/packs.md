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
- [`$identity`](expressions.md#identity) - Return input unchanged (identity function) ([evaluate mode](dual-mode-expressions.md#identity))

#### Conditionals

- [`$case`](expressions.md#case) - Multi-branch conditional with literal and predicate support ([evaluate mode](dual-mode-expressions.md#case))
- [`$if`](expressions.md#if) - Simple if-then-else conditional ([evaluate mode](dual-mode-expressions.md#if))

#### Comparisons

- [`$eq`](expressions.md#eq) - Test equality ([evaluate mode](dual-mode-expressions.md#eq))
- [`$gt`](expressions.md#gt) - Test greater than ([evaluate mode](dual-mode-expressions.md#gt))
- [`$gte`](expressions.md#gte) - Test greater than or equal ([evaluate mode](dual-mode-expressions.md#gte))
- [`$lt`](expressions.md#lt) - Test less than ([evaluate mode](dual-mode-expressions.md#lt))
- [`$lte`](expressions.md#lte) - Test less than or equal ([evaluate mode](dual-mode-expressions.md#lte))
- [`$ne`](expressions.md#ne) - Test not equal ([evaluate mode](dual-mode-expressions.md#ne))

#### Boolean Logic

- [`$and`](expressions.md#and) - Logical AND operation ([evaluate mode](dual-mode-expressions.md#and))
- [`$not`](expressions.md#not) - Logical NOT operation ([evaluate mode](dual-mode-expressions.md#not))
- [`$or`](expressions.md#or) - Logical OR operation ([evaluate mode](dual-mode-expressions.md#or))

#### Array Operations

- [`$filter`](expressions.md#filter) - Filter array by predicate ([evaluate mode](dual-mode-expressions.md#filter))
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria ([evaluate mode](dual-mode-expressions.md#filterby))
- [`$map`](expressions.md#map) - Transform array elements ([evaluate mode](dual-mode-expressions.md#map))

#### Validation & Utility

- [`$exists`](expressions.md#exists) - Test if object property exists ([evaluate mode](dual-mode-expressions.md#exists))
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty ([evaluate mode](dual-mode-expressions.md#isempty))
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined) ([evaluate mode](dual-mode-expressions.md#ispresent))
- [`$matches`](expressions.md#matches) - Test if object matches criteria ([evaluate mode](dual-mode-expressions.md#matches))

#### Flow Control

- [`$default`](expressions.md#default) - Provide default value for null/undefined
- [`$literal`](expressions.md#literal) - Treat value as literal (not expression) ([evaluate mode](dual-mode-expressions.md#literal))
- [`$pipe`](expressions.md#pipe) - Chain expressions in sequence ([evaluate mode](dual-mode-expressions.md#pipe))
- [`$sort`](expressions.md#sort) - Sort array by criteria ([evaluate mode](dual-mode-expressions.md#sort))

---

### mathPack - Arithmetic Operations

**Use case:** Mathematical calculations, arithmetic operations, and basic statistical functions.

**When to use:** Applications involving numerical computations, calculations, or mathematical transformations.

```javascript
import { createExpressionEngine, mathPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [mathPack] });
```

#### Basic Arithmetic

- [`$abs`](expressions.md#abs) - Absolute value of a number ([evaluate mode](dual-mode-expressions.md#abs))
- [`$add`](expressions.md#add) - Addition of numbers ([evaluate mode](dual-mode-expressions.md#add))
- [`$divide`](expressions.md#divide) - Division of numbers ([evaluate mode](dual-mode-expressions.md#divide))
- [`$modulo`](expressions.md#modulo) - Modulo operation ([evaluate mode](dual-mode-expressions.md#modulo))
- [`$multiply`](expressions.md#multiply) - Multiplication of numbers ([evaluate mode](dual-mode-expressions.md#multiply))
- [`$subtract`](expressions.md#subtract) - Subtraction of numbers ([evaluate mode](dual-mode-expressions.md#subtract))

#### Mathematical Functions

- [`$pow`](expressions.md#pow) - Exponentiation ([evaluate mode](dual-mode-expressions.md#pow))
- [`$sqrt`](expressions.md#sqrt) - Square root ([evaluate mode](dual-mode-expressions.md#sqrt))

#### Aggregations

- [`$count`](expressions.md#count) - Count elements in array ([evaluate mode](dual-mode-expressions.md#count))
- [`$max`](expressions.md#max) - Find maximum value ([evaluate mode](dual-mode-expressions.md#max))
- [`$mean`](expressions.md#mean) - Calculate average ([evaluate mode](dual-mode-expressions.md#mean))
- [`$min`](expressions.md#min) - Find minimum value ([evaluate mode](dual-mode-expressions.md#min))
- [`$sum`](expressions.md#sum) - Sum of numbers ([evaluate mode](dual-mode-expressions.md#sum))

---

### comparisonPack - Scalar Comparison Operations

**Use case:** Basic comparison operations for WHERE clause logic and validation.

**When to use:** Applications focusing on filtering, validation, or conditional logic based on scalar comparisons.

```javascript
import { createExpressionEngine, comparisonPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [comparisonPack] });
```

#### Basic Comparisons

- [`$eq`](expressions.md#eq) - Test equality ([evaluate mode](dual-mode-expressions.md#eq))
- [`$gt`](expressions.md#gt) - Test greater than ([evaluate mode](dual-mode-expressions.md#gt))
- [`$gte`](expressions.md#gte) - Test greater than or equal ([evaluate mode](dual-mode-expressions.md#gte))
- [`$lt`](expressions.md#lt) - Test less than ([evaluate mode](dual-mode-expressions.md#lt))
- [`$lte`](expressions.md#lte) - Test less than or equal ([evaluate mode](dual-mode-expressions.md#lte))
- [`$ne`](expressions.md#ne) - Test not equal ([evaluate mode](dual-mode-expressions.md#ne))

#### Range & Membership

- [`$between`](expressions.md#between) - Test if value is within range ([evaluate mode](dual-mode-expressions.md#between))
- [`$in`](expressions.md#in) - Test if value is in array ([evaluate mode](dual-mode-expressions.md#in))
- [`$nin`](expressions.md#nin) - Test if value is not in array ([evaluate mode](dual-mode-expressions.md#nin))

#### Value Validation

- [`$exists`](expressions.md#exists) - Test if object property exists ([evaluate mode](dual-mode-expressions.md#exists))
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty ([evaluate mode](dual-mode-expressions.md#isempty))
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined) ([evaluate mode](dual-mode-expressions.md#ispresent))

---

### arrayPack - Array Manipulation

**Use case:** Complete array manipulation toolkit for data transformation and processing.

**When to use:** Applications that work extensively with arrays, lists, or collections requiring transformation, filtering, or manipulation.

```javascript
import { createExpressionEngine, arrayPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [arrayPack] });
```

#### Core Transformations

- [`$filter`](expressions.md#filter) - Filter array by predicate ([evaluate mode](dual-mode-expressions.md#filter))
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria ([evaluate mode](dual-mode-expressions.md#filterby))
- [`$find`](expressions.md#find) - Find first matching element ([evaluate mode](dual-mode-expressions.md#find))
- [`$map`](expressions.md#map) - Transform array elements ([evaluate mode](dual-mode-expressions.md#map))

#### Predicates & Testing

- [`$all`](expressions.md#all) - Test if all elements match predicate ([evaluate mode](dual-mode-expressions.md#all))
- [`$any`](expressions.md#any) - Test if any element matches predicate ([evaluate mode](dual-mode-expressions.md#any))

#### Advanced Operations

- [`$flatMap`](expressions.md#flatmap) - Map and flatten results ([evaluate mode](dual-mode-expressions.md#flatmap))
- [`$flatten`](expressions.md#flatten) - Flatten nested arrays ([evaluate mode](dual-mode-expressions.md#flatten))

#### Array Modifications

- [`$append`](expressions.md#append) - Add elements to end of array ([evaluate mode](dual-mode-expressions.md#append))
- [`$concat`](expressions.md#concat) - Concatenate multiple arrays ([evaluate mode](dual-mode-expressions.md#concat))
- [`$join`](expressions.md#join) - Join array elements into string ([evaluate mode](dual-mode-expressions.md#join))
- [`$prepend`](expressions.md#prepend) - Add elements to start of array ([evaluate mode](dual-mode-expressions.md#prepend))
- [`$reverse`](expressions.md#reverse) - Reverse array order ([evaluate mode](dual-mode-expressions.md#reverse))
- [`$unique`](expressions.md#unique) - Remove duplicate elements ([evaluate mode](dual-mode-expressions.md#unique))

#### Array Slicing

- [`$skip`](expressions.md#skip) - Skip first N elements ([evaluate mode](dual-mode-expressions.md#skip))
- [`$take`](expressions.md#take) - Take first N elements ([evaluate mode](dual-mode-expressions.md#take))

#### Array Accessors

- [`$first`](expressions.md#first) - Get first element of array ([evaluate mode](dual-mode-expressions.md#first))
- [`$last`](expressions.md#last) - Get last element of array ([evaluate mode](dual-mode-expressions.md#last))

#### Data Extraction

- [`$pluck`](expressions.md#pluck) - Extract property values from object array ([evaluate mode](dual-mode-expressions.md#pluck))

#### Utility

- [`$coalesce`](expressions.md#coalesce) - Get first non-null value ([evaluate mode](dual-mode-expressions.md#coalesce))

#### Grouping

- [`$groupBy`](expressions.md#groupby) - Group array elements by criteria ([evaluate mode](dual-mode-expressions.md#groupby))

---

### objectPack - Key-Value Manipulation

**Use case:** Object and dictionary operations for property manipulation and introspection.

**When to use:** Applications working with complex objects, needing property selection, merging, or object transformation.

```javascript
import { createExpressionEngine, objectPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [objectPack] });
```

#### Property Access

- [`$prop`](expressions.md#prop) - Access object property (alias for $get) ([evaluate mode](dual-mode-expressions.md#prop))
- [`$select`](expressions.md#select) - Select and transform object properties ([evaluate mode](dual-mode-expressions.md#select))

#### Property Selection

- [`$omit`](expressions.md#omit) - Create object without specified properties ([evaluate mode](dual-mode-expressions.md#omit))
- [`$pick`](expressions.md#pick) - Create object with only specified properties ([evaluate mode](dual-mode-expressions.md#pick))

#### Object Combination

- [`$merge`](expressions.md#merge) - Merge multiple objects ([evaluate mode](dual-mode-expressions.md#merge))

#### Object Introspection

- [`$fromPairs`](expressions.md#frompairs) - Create object from key-value pairs ([evaluate mode](dual-mode-expressions.md#frompairs))
- [`$keys`](expressions.md#keys) - Get object property names ([evaluate mode](dual-mode-expressions.md#keys))
- [`$pairs`](expressions.md#pairs) - Convert object to key-value pairs ([evaluate mode](dual-mode-expressions.md#pairs))
- [`$values`](expressions.md#values) - Get object property values ([evaluate mode](dual-mode-expressions.md#values))

---

### stringPack - String Operations

**Use case:** String processing and transformation functions.

**When to use:** Applications involving text processing, formatting, or string manipulation.

```javascript
import { createExpressionEngine, stringPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [stringPack] });
```

#### String Transformations

- [`$lowercase`](expressions.md#lowercase) - Convert to lowercase ([evaluate mode](dual-mode-expressions.md#lowercase))
- [`$trim`](expressions.md#trim) - Remove whitespace from ends ([evaluate mode](dual-mode-expressions.md#trim))
- [`$uppercase`](expressions.md#uppercase) - Convert to uppercase ([evaluate mode](dual-mode-expressions.md#uppercase))

#### String Operations

- [`$replace`](expressions.md#replace) - Replace text in string ([evaluate mode](dual-mode-expressions.md#replace))
- [`$split`](expressions.md#split) - Split string into array ([evaluate mode](dual-mode-expressions.md#split))
- [`$substring`](expressions.md#substring) - Extract substring ([evaluate mode](dual-mode-expressions.md#substring))

---

### filteringPack - Data Filtering Toolkit

**Use case:** Comprehensive WHERE clause logic and data filtering operations.

**When to use:** Applications with complex filtering requirements, search functionality, or business rule evaluation.

```javascript
import { createExpressionEngine, filteringPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [filteringPack] });
```

#### Basic Comparisons

- [`$between`](expressions.md#between) - Test if value is within range ([evaluate mode](dual-mode-expressions.md#between))
- [`$eq`](expressions.md#eq) - Test equality ([evaluate mode](dual-mode-expressions.md#eq))
- [`$gt`](expressions.md#gt) - Test greater than ([evaluate mode](dual-mode-expressions.md#gt))
- [`$gte`](expressions.md#gte) - Test greater than or equal ([evaluate mode](dual-mode-expressions.md#gte))
- [`$lt`](expressions.md#lt) - Test less than ([evaluate mode](dual-mode-expressions.md#lt))
- [`$lte`](expressions.md#lte) - Test less than or equal ([evaluate mode](dual-mode-expressions.md#lte))
- [`$ne`](expressions.md#ne) - Test not equal ([evaluate mode](dual-mode-expressions.md#ne))

#### Logic Operations

- [`$and`](expressions.md#and) - Logical AND operation ([evaluate mode](dual-mode-expressions.md#and))
- [`$not`](expressions.md#not) - Logical NOT operation ([evaluate mode](dual-mode-expressions.md#not))
- [`$or`](expressions.md#or) - Logical OR operation ([evaluate mode](dual-mode-expressions.md#or))

#### Array Filtering

- [`$all`](expressions.md#all) - Test if all elements match predicate ([evaluate mode](dual-mode-expressions.md#all))
- [`$any`](expressions.md#any) - Test if any element matches predicate ([evaluate mode](dual-mode-expressions.md#any))
- [`$filter`](expressions.md#filter) - Filter array by predicate ([evaluate mode](dual-mode-expressions.md#filter))
- [`$filterBy`](expressions.md#filterby) - Filter array by object property criteria ([evaluate mode](dual-mode-expressions.md#filterby))
- [`$find`](expressions.md#find) - Find first matching element ([evaluate mode](dual-mode-expressions.md#find))

#### Object Filtering

- [`$matches`](expressions.md#matches) - Test if object matches criteria ([evaluate mode](dual-mode-expressions.md#matches))

#### Membership Tests

- [`$in`](expressions.md#in) - Test if value is in array ([evaluate mode](dual-mode-expressions.md#in))
- [`$nin`](expressions.md#nin) - Test if value is not in array ([evaluate mode](dual-mode-expressions.md#nin))

#### Value & Existence Checks

- [`$exists`](expressions.md#exists) - Test if object property exists ([evaluate mode](dual-mode-expressions.md#exists))
- [`$isEmpty`](expressions.md#isempty) - Test if value is empty ([evaluate mode](dual-mode-expressions.md#isempty))
- [`$isPresent`](expressions.md#ispresent) - Test if value is present (not null/undefined) ([evaluate mode](dual-mode-expressions.md#ispresent))

#### Pattern Matching

- [`$matchesRegex`](expressions.md#matchesregex) - Test if string matches regex pattern ([evaluate mode](dual-mode-expressions.md#matchesregex))

---

### projectionPack - Data Transformation

**Use case:** SELECT clause operations and data transformation for reshaping and projecting data.

**When to use:** Applications that need to transform, reshape, or project data into different formats or structures.

```javascript
import { createExpressionEngine, projectionPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [projectionPack] });
```

#### Field Access

- [`$get`](expressions.md#get) - Access object properties by path ([evaluate mode](dual-mode-expressions.md#get))
- [`$select`](expressions.md#select) - Select and transform object properties ([evaluate mode](dual-mode-expressions.md#select))

#### Array Transformations

- [`$concat`](expressions.md#concat) - Concatenate multiple arrays ([evaluate mode](dual-mode-expressions.md#concat))
- [`$filter`](expressions.md#filter) - Filter array by predicate ([evaluate mode](dual-mode-expressions.md#filter))
- [`$flatMap`](expressions.md#flatmap) - Map and flatten results ([evaluate mode](dual-mode-expressions.md#flatmap))
- [`$join`](expressions.md#join) - Join array elements into string ([evaluate mode](dual-mode-expressions.md#join))
- [`$map`](expressions.md#map) - Transform array elements ([evaluate mode](dual-mode-expressions.md#map))
- [`$pluck`](expressions.md#pluck) - Extract property values from object array ([evaluate mode](dual-mode-expressions.md#pluck))
- [`$unique`](expressions.md#unique) - Remove duplicate elements ([evaluate mode](dual-mode-expressions.md#unique))

#### String Transformations

- [`$lowercase`](expressions.md#lowercase) - Convert to lowercase ([evaluate mode](dual-mode-expressions.md#lowercase))
- [`$substring`](expressions.md#substring) - Extract substring ([evaluate mode](dual-mode-expressions.md#substring))
- [`$uppercase`](expressions.md#uppercase) - Convert to uppercase ([evaluate mode](dual-mode-expressions.md#uppercase))

#### Conditionals for Computed Fields

- [`$case`](expressions.md#case) - Multi-branch conditional with literal and predicate support ([evaluate mode](dual-mode-expressions.md#case))
- [`$if`](expressions.md#if) - Simple if-then-else conditional ([evaluate mode](dual-mode-expressions.md#if))

#### Comparison Operations

- [`$eq`](expressions.md#eq) - Test equality ([evaluate mode](dual-mode-expressions.md#eq))
- [`$gt`](expressions.md#gt) - Test greater than ([evaluate mode](dual-mode-expressions.md#gt))
- [`$gte`](expressions.md#gte) - Test greater than or equal ([evaluate mode](dual-mode-expressions.md#gte))
- [`$in`](expressions.md#in) - Test if value is in array ([evaluate mode](dual-mode-expressions.md#in))
- [`$lt`](expressions.md#lt) - Test less than ([evaluate mode](dual-mode-expressions.md#lt))
- [`$lte`](expressions.md#lte) - Test less than or equal ([evaluate mode](dual-mode-expressions.md#lte))
- [`$ne`](expressions.md#ne) - Test not equal ([evaluate mode](dual-mode-expressions.md#ne))
- [`$nin`](expressions.md#nin) - Test if value is not in array ([evaluate mode](dual-mode-expressions.md#nin))

---

### aggregationPack - Statistical Functions

**Use case:** Statistical and aggregation functions for data analysis and summarization.

**When to use:** Applications requiring statistical analysis, data summarization, or aggregation operations.

```javascript
import { createExpressionEngine, aggregationPack } from "json-expressions";
const engine = createExpressionEngine({ packs: [aggregationPack] });
```

#### Basic Aggregations

- [`$count`](expressions.md#count) - Count elements in array ([evaluate mode](dual-mode-expressions.md#count))
- [`$max`](expressions.md#max) - Find maximum value ([evaluate mode](dual-mode-expressions.md#max))
- [`$min`](expressions.md#min) - Find minimum value ([evaluate mode](dual-mode-expressions.md#min))
- [`$sum`](expressions.md#sum) - Sum of numbers ([evaluate mode](dual-mode-expressions.md#sum))

#### Statistical Measures

- [`$mean`](expressions.md#mean) - Calculate average ([evaluate mode](dual-mode-expressions.md#mean))

#### Array Accessors

- [`$first`](expressions.md#first) - Get first element of array ([evaluate mode](dual-mode-expressions.md#first))
- [`$last`](expressions.md#last) - Get last element of array ([evaluate mode](dual-mode-expressions.md#last))

#### Grouping Operations

- [`$groupBy`](expressions.md#groupby) - Group array elements by criteria ([evaluate mode](dual-mode-expressions.md#groupby))

---

## Other Expressions

### Debug Expression

- [`$debug`](expressions.md#debug) - Debug helper for development (available in all engines) ([evaluate mode](dual-mode-expressions.md#debug))

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
| `$prop`         |        |      |            |       | ✓      |        |           |            |             |
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

> \* The base pack is always included in the expression engine unless explicitly excluded.

> † The `$debug` expression is not in any packs and must be imported manually.

---

## Related Documentation

- **[Expression Reference](expressions.md)** - Complete documentation for all expressions
- **[Quick Start Guide](quick-start.md)** - Get started with JSON expressions
- **[Custom Expressions](custom-expressions.md)** - Create your own expressions
- **[Evaluate Method](evaluate-method.md)** - Advanced static calculations and template expressions
