# JSON Expressions

A JavaScript expression engine for JSON-based dynamic computations and function composition. JSON Expressions provides a declarative syntax for creating complex logic, transformations, and calculations that can be serialized, stored, and executed safely.

Well-suited for configuration-driven applications, business rules engines, and anywhere you need dynamic logic represented as data.

## Quick Start

```bash
npm install json-expressions
```

```javascript
import {
  createExpressionEngine,
  mathPack,
  comparisonPack,
} from "json-expressions";

// Create an engine with the packs you need
const engine = createExpressionEngine({ packs: [mathPack, comparisonPack] });

// Apply expressions to your data
const user = { age: 25, score: 85 };

// Simple comparisons
engine.apply({ $gt: 18 }, user.age); // true (25 > 18)

// Complex logic with input data
engine.apply(
  {
    $matchesAll: {
      age: { $gte: 18 },
      score: { $gt: 80 },
    },
  },
  user,
); // true
```

## What Are JSON Expressions?

JSON Expressions let you write logic as JSON that operates on input data. Each expression has a key starting with `$` and describes what operation to perform:

```javascript
// "Is the input greater than 18?"
{
  $gt: 18;
}

// "Get the 'name' property from input"
{
  $get: "name";
}

// "Filter input array for items with age >= 18"
{
  $filterBy: {
    age: {
      $gte: 18;
    }
  }
}
```

### Extensible by Design

Create custom expressions for your domain:

```javascript
const engine = createExpressionEngine({
  custom: {
    $isValidEmail: (operand, inputData) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputData),
  },
});

engine.apply({ $isValidEmail: null }, "user@example.com"); // true
```

[Read more](docs/custom-expressions.md) about creating custom expressions.

## Design Philosophy

JSON Expressions prioritizes **flexibility over raw performance**. This library is designed for scenarios where dynamic, data-driven logic is more valuable than execution speed. Performance is an important design goal to enable as many uses as possible, but it will never be a replacement for performance tuned code.

## Why JSON Expressions?

### Appropriate for:

- **Configuration-driven applications** - Store complex logic as data in databases
- **Business rules that change frequently** - Avoid code deployments for logic updates
- **Multi-tenant SaaS applications** - Different customers need different business logic
- **Cross-platform logic sharing** - Same rules run in frontend and backend

### When NOT to Use JSON Expressions

- High-frequency operations (>10k ops/sec requirements)
- Real-time systems with strict latency requirements
- Simple static logic that doesn't need to change
- Performance-critical hot paths

### Features:

- **Serializable Logic**: Express complex computations as JSON that can be stored and transmitted
- **Safe Evaluation**: Controlled execution environment without the risks of `eval()`
- **Composable**: Build complex logic by combining simple expressions
- **Extensible**: Add custom expressions through packs and custom definitions

### Limitations:

- **Performance and Memory Overhead**: Interpretation layer adds execution cost compared to native JavaScript
- **Runtime Validation**: Expression errors discovered at execution time, not compile time

## Common Patterns

### Data Access and Transformation

```javascript
const order = {
  items: [{ price: 10 }, { price: 15 }],
  tax: 0.08,
};

// Get nested data
engine.apply({ $get: "items" }, order);
// Returns: [{ price: 10 }, { price: 15 }]

// Transform arrays
engine.apply(
  {
    $pipe: [{ $get: "items" }, { $map: { $get: "price" } }, { $sum: null }],
  },
  order,
);
// Returns: 25 (sum of all prices)
```

### Conditional Logic

```javascript
const user = { status: "premium", age: 25 };

// Simple conditions
engine.apply(
  {
    $if: {
      if: { $eq: [{ $get: "status" }, "premium"] },
      then: "VIP Access",
      else: "Standard Access",
    },
  },
  user,
);
// Returns: "VIP Access"

// Complex case statements
engine.apply(
  {
    $case: {
      value: { $get: "status" },
      cases: [
        { when: "premium", then: "Gold Badge" },
        { when: "standard", then: "Silver Badge" },
      ],
      default: "No Badge",
    },
  },
  user,
);
// Returns: "Gold Badge"
```

### Filtering and Validation

```javascript
const children = [
  { name: "Ximena", age: 4, active: true },
  { name: "Yousef", age: 5, active: false },
  { name: "Zoë", age: 6, active: true },
];

// Filter with complex conditions
engine.apply(
  {
    $filter: {
      $and: [{ $get: "active" }, { $gte: [{ $get: "age" }, 5] }],
    },
  },
  users,
);
// Returns: [{ name: "Zoë", age: 6, active: true }]
```

## Available Expression Packs

Import only the functionality you need:

```javascript
import {
  createExpressionEngine,
  mathPack, // $add, $subtract, $multiply, $divide, $sum, $mean, etc.
  comparisonPack, // $eq, $ne, $gt, $lt, $gte, $lte, $in, $nin
  arrayPack, // $filter, $map, $sort, $unique, $flatten, $groupBy
  objectPack, // $pick, $omit, $merge, $keys, $values, $pairs
  stringPack, // $concat, $join, $matchesRegex
  filteringPack, // $filterBy, $find, $all, $any
  projectionPack, // $select, $pluck
  aggregationPack, // Statistical functions
  temporalPack, // $addDays, $formatDate, $diffDays, $isAfter, etc.
} from "json-expressions";

const engine = createExpressionEngine({
  packs: [mathPack, comparisonPack, arrayPack],
});
```

**[→ Complete Pack Reference](docs/packs.md)** - Detailed guide to all packs and their expressions

## Documentation

- **[Quick Start Guide](docs/quick-start.md)** - Get up and running in minutes
- **[Pack Reference](docs/packs.md)** - Complete guide to all expression packs
- **[Expression Reference](docs/expressions.md)** - Complete list of available expressions
- **[Custom Expressions](docs/custom-expressions.md)** - Creating your own expressions

## Performance

JSON Expressions is **optimized for flexibility over raw execution speed**. Expect:

- **Development speed gains** from eliminating deployment cycles
- **Good performance** for business rules, data transformations, and configuration logic
- **Execution overhead** compared to native JavaScript functions
- **Consider caching** for frequently-used complex expressions

### Benchmark Results

Performance varies based on operation complexity:

| Operation Type              | Performance          | Example                     |
| --------------------------- | -------------------- | --------------------------- |
| Simple operations           | **1-1.6M ops/sec**   | `$gt`, `$get`, `$add`       |
| Complex operations          | **300-700K ops/sec** | `$matchesAll`, `$filter`       |
| Nested data access          | **2.4M ops/sec**     | `$get: "user.profile.name"` |
| Data processing             | **70-300K ops/sec**  | Pipeline transformations    |
| Large datasets (1000 items) | **1.6-3.9K ops/sec** | Filtering, grouping         |

Run `npm run bench` for detailed performance metrics on your hardware.

Well suited for configuration logic, business rules, and data processing. Consider direct JavaScript functions for performance-critical hot paths.
