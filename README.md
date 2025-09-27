# JSON Expressions

A powerful JavaScript expression engine for JSON-based dynamic computations and function composition. JSON Expressions provides a declarative syntax for creating complex logic, transformations, and calculations that can be serialized, stored, and executed safely.

Perfect for configuration-driven applications, business rules engines, and anywhere you need dynamic logic represented as data.

## Quick Start

```bash
npm install json-expressions
```

```javascript
import { createExpressionEngine, math, comparison } from "json-expressions";

// Create an engine with the packs you need
const engine = createExpressionEngine({ packs: [math, comparison] });

// Apply expressions to your data
const user = { age: 25, score: 85 };

// Simple comparisons
engine.apply({ $gt: 18 }, user.age); // true (25 > 18)

// Complex logic with input data
engine.apply(
  {
    $matches: {
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


## Why JSON Expressions?

### Excellent fit for:

- **Configuration-driven applications** - Store complex logic as data in databases
- **Business rules that change frequently** - Avoid code deployments for logic updates
- **Multi-tenant SaaS applications** - Different customers need different business logic
- **Cross-platform logic sharing** - Same rules run in frontend and backend

### Key Benefits:

- **Serializable Logic**: Express complex computations as JSON that can be stored and transmitted
- **Safe Evaluation**: Controlled execution environment without the risks of `eval()`
- **Composable**: Build complex logic by combining simple expressions
- **Extensible**: Add custom expressions through packs and custom definitions

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

## Advanced: Evaluate Method

The expression engine focuses on **apply mode** - expressions that operate on input data. This covers 90%+ of use cases.

For advanced scenarios requiring **static calculations** without input data, the `evaluate` method is available:

```javascript
import { createExpressionEngine } from "json-expressions";

const engine = createExpressionEngine();

// Primary usage: apply expressions to input data
engine.apply({ $gt: 18 }, 25); // true (apply mode)

// Advanced: static calculations (no input data needed)
engine.evaluate({ $add: [10, 20, 30] }); // 60
engine.evaluate({ $gt: [25, 18] }); // true (evaluate mode)
```

**When to use evaluate:**

- Template rendering with static data
- Complex expressions mixing static and dynamic data
- Compilation scenarios, like turning an expression into SQL

**Stick with apply for:**

- Processing user input, API responses, or database records
- Building filters, validators, or transformations
- Working with dynamic data (which is most use cases)

## Available Expression Packs

Import only the functionality you need:

```javascript
import {
  createExpressionEngine,
  math, // $add, $subtract, $multiply, $divide, $sum, $mean, etc.
  comparison, // $eq, $ne, $gt, $lt, $gte, $lte, $in, $nin
  array, // $filter, $map, $sort, $unique, $flatten, $groupBy
  object, // $pick, $omit, $merge, $keys, $values, $pairs
  string, // $concat, $join, $matchesRegex
  filtering, // $filterBy, $find, $all, $any
  projection, // $select, $pluck
  aggregation, // Statistical functions
} from "json-expressions";

const engine = createExpressionEngine({
  packs: [math, comparison, array],
});
```

## Documentation

- **[Quick Start Guide](docs/quick-start.md)** - Get up and running in minutes
- **[Expression Reference](docs/expressions.md)** - Complete list of available expressions
- **[Custom Expressions](docs/custom-expressions.md)** - Creating your own expressions
- **[Evaluate Method](docs/evaluate-method.md)** - Advanced static calculations and template expressions
- **[Dual-Mode Expressions](docs/dual-mode-expressions.md)** - Custom expressions with both apply and evaluate support

## Performance

JSON Expressions is **optimized for flexibility over raw execution speed**. Expect:

- **Development speed gains** from eliminating deployment cycles
- **Good performance** for business rules, data transformations, and configuration logic
- **Execution overhead** compared to native JavaScript functions
- **Consider caching** for frequently-evaluated complex expressions

Perfect for configuration logic, business rules, and data processing. Consider direct JavaScript functions for performance-critical hot paths.
