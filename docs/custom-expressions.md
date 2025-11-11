# Custom Expressions Guide

This guide covers creating custom expressions for JSON Expressions. Custom expressions allow you to extend JSON Expressions with domain-specific functionality while maintaining the declarative nature of the expression system.

> **Need built-in expressions?** Check the **[Pack Reference](packs.md)** for coverage of all available expression packs.

**Important note on equality:** JavaScript has the notion of `undefined` being distinct from `null`. JSON Expressions is designed to be useful regardless of the implementing language, and most languages do not distinguish between the two. Therefore, `undefined` and `null` are considered to be **equal** throughout the library. Use `$exists` if you wish to determine if a key in an object is undefined.

## Overview

Custom expressions are functions that operate on input data. They receive an operand (the expression's parameter), the input data being processed, and a context object with access to the expression engine's core functions.

## Basic Custom Expression Structure

Custom expressions are functions with this signature:

```javascript
const $myExpression = (operand, inputData, context) => {
  // Apply the expression to input data
  // operand: the expression's operand/parameter
  // inputData: the data being processed
  // context: execution context with apply, isExpression, isWrappedLiteral
  return result;
};
```

## Expression Authoring Helpers

JSON Expressions provides helper functions to simplify creating custom expressions. These helpers handle common patterns so you can focus on your expression's core logic.

### `withResolvedOperand`

Automatically resolves the operand before calling your function. Use this when your expression always works with resolved values and doesn't need to inspect the raw operand structure.

```javascript
import { createExpressionEngine, withResolvedOperand } from "json-expressions";

// Simple: just define what to do with the resolved value
const $trim = withResolvedOperand((resolved) => {
  return resolved.trim();
});

// With access to inputData and context
const $appendAge = withResolvedOperand((resolved, inputData, context) => {
  return `${resolved} (${inputData.age})`;
});

const engine = createExpressionEngine({ custom: { $trim, $appendAge } });

// Usage
engine.apply({ $trim: { $get: "name" } }, { name: "  Amara  " });
// Returns: "Amara"

engine.apply({ $appendAge: { $get: "name" } }, { name: "Chen", age: 4 });
// Returns: "Chen (4)"
```

**When to use:** Your expression needs the resolved operand value and doesn't care about the raw operand structure.

### `createBimodalExpression`

Creates expressions that work in two modes: operating on inputData with operand as parameters, or operating on the operand itself. This enables flexible, composable expressions that feel natural in both contexts.

```javascript
import { createExpressionEngine, createBimodalExpression } from "json-expressions";

// Unary (1 parameter): operates on a single value
const $square = createBimodalExpression((val) => val * val);

// Binary (2 parameters): operates on two values
const $power = createBimodalExpression((base, exp) => Math.pow(base, exp));

const engine = createExpressionEngine({ custom: { $square, $power } });

// Unary usage:
engine.apply({ $square: null }, 5);           // inputData mode: 5² = 25
engine.apply({ $square: { $get: "age" } }, { age: 3 }); // operand mode: 3² = 9

// Binary usage:
engine.apply({ $power: 2 }, 8);               // inputData^operand: 8² = 64
engine.apply({ $power: [2, 8] }, null);       // array mode: 2⁸ = 256
engine.apply({ $power: [{ $get: "base" }, 3] }, { base: 2 }); // 2³ = 8
```

**How it works:**

For **unary functions** (1 parameter):
- If operand is `null` or `undefined`, operates on inputData
- Otherwise, operates on resolved operand

For **binary functions** (2 parameters):
- If operand resolves to a 2-element array, spreads as both arguments
- Otherwise, inputData is first arg, resolved operand is second arg

**When to use:**
- Transformations that can work on piped data or specified values
- Operations where inputData is the natural "subject" (like comparisons: `inputData > threshold`)
- Expressions that benefit from both `{ $expr: null }` and `{ $expr: value }` patterns

**Limitations:** Only supports unary and binary functions. For more complex arities or custom logic, write the full expression function manually.

### Choosing the Right Helper

| Helper | Use When | Example |
|--------|----------|---------|
| `withResolvedOperand` | You always need the resolved value and don't care about raw operand | `$trim`, `$uppercase`, custom validators |
| `createBimodalExpression` | Expression should work on inputData OR operand flexibly | `$square`, `$power`, comparisons, math ops |
| Manual expression | Need fine-grained control, multiple modes, or complex operand handling | `$case`, `$if`, `$map`, `$filter` |

These helpers eliminate boilerplate while maintaining the clarity and power of custom expressions.

## Execution Context

The `context` parameter provides access to the expression engine's core functions:

### `context.apply(expression, data)`

Applies an expression to input data. Use this when you need to evaluate nested expressions against specific data.

```javascript
const $processChild = (operand, inputData, { apply }) => {
  // Get a child's data and apply an expression to it
  const child = inputData.children[operand.index];
  return apply(operand.expression, child);
};
```

### `context.isExpression(value)`

Tests if a value is a valid expression. Useful for conditional processing.

```javascript
const $conditionalProcess = (operand, inputData, { apply, isExpression }) => {
  if (isExpression(operand)) {
    // If operand is an expression, apply it
    return apply(operand, inputData);
  } else {
    // If operand is a literal value, return it directly
    return operand;
  }
};
```

### `context.isWrappedLiteral(value)`

Tests if a value is specifically a `$literal` expression. The `$literal` expression is used to wrap values that should be returned as-is without any evaluation, even if they look like expressions. This is seldom used functionality because most expressions want to make use of the wrapped value and not treat it any more specially than that. For examples of when it should be used, check the code definitions of `$identity` and `$case`.

## Nested Expressions

It is important to be aware that your custom expressions may themselves contain expressions. Always use the `apply` function from context to resolve nested expressions.

```javascript
// WRONG: Doesn't handle nested expressions
const $powerWRONG = (operand, inputData) => {
  return Math.pow(inputData, operand);
};

engine.apply({ $powerWRONG: { $get: "exponent" } }, { base: 5, exponent: 2 });
// This will CRASH because { $get: "exponent" } wasn't resolved!

// CORRECT: Uses apply to resolve nested expressions
const $power = (operand, inputData, { apply }) => {
  const exponent = apply(operand, inputData);
  return Math.pow(inputData, exponent);
};

engine.apply({ $power: { $get: "exponent" } }, { base: 5, exponent: 2 });
// Returns 25 (5^2)
```

Always use `apply` to resolve operands that might contain expressions.

## Real-World Examples

### Example 1: Daycare Age Group Classification

```javascript
const $ageGroup = (operand, inputData, { apply }) => {
  // Get age from input data (operand ignored for this expression)
  const { age } = inputData;

  if (age < 2) return "infant";
  if (age < 4) return "toddler";
  if (age < 6) return "preschool";
  return "school-age";
};

// Usage:
const child = { name: "Aria", age: 3 };
engine.apply({ $ageGroup: null }, child);
// Returns: "toddler"
```

### Example 2: Validation with Context

```javascript
// Note: This example uses $matchesRegex which requires the filtering pack
import { createExpressionEngine, filteringPack } from "json-expressions";

// This example delegates to other expressions This is an anti-pattern because
// expressions can be overwritten. Doing full implementations keeps things decoupled.
const $validateChild = (operand, inputData) => {
  const errors = Object.entries(operand.rules)
    .map(([field, rule]) => {
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], inputData)
        : inputData[field];

      let isValid = true;
      if (rule.$gte !== undefined) isValid = value >= rule.$gte;
      else if (rule.$lte !== undefined) isValid = value <= rule.$lte;
      else if (rule.$and)
        isValid = rule.$and.every((cond) => {
          if (cond.$gte !== undefined) return value >= cond.$gte;
          if (cond.$lte !== undefined) return value <= cond.$lte;
          return true;
        });
      else if (rule.$matchesRegex) {
        const regex = new RegExp(rule.$matchesRegex);
        isValid = typeof value === "string" && regex.test(value);
      }

      return isValid ? null : `${field} validation failed`;
    })
    .filter((error) => error !== null);

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

const engine = createExpressionEngine({
  packs: [filteringPack], // See Pack Reference for all available packs
  custom: { $validateChild },
});

// Usage:
const childData = { name: "Aria", age: 3 };
const validationResult = engine.apply(
  {
    $validateChild: {
      rules: {
        age: { $and: [{ $gte: 2 }, { $lte: 6 }] },
        name: { $matchesRegex: "^[A-Za-z\\s]+$" },
      },
    },
  },
  childData,
);
// Returns: { isValid: true, errors: [] }
```

### Example 3: Complex Data Transformation

```javascript
const $enrichChild = (operand, inputData) => {
  const child = inputData;

  let ageGroup;
  if (child.age < 1) ageGroup = "infant";
  else if (child.age < 3) ageGroup = "toddler";
  else if (child.age < 5) ageGroup = "preschool";
  else ageGroup = "school-age";

  return {
    ...child,
    ageGroup: ageGroup,
    displayName: child.name.toUpperCase(),
    isSchoolReady: child.age >= 5,
    nextBirthday: child.age + 1,
  };
};

// Usage:
const child = { name: "Zoë", age: 4 };
const enriched = engine.apply({ $enrichChild: null }, child);
// Returns: {
//   name: "Zoë",
//   age: 4,
//   ageGroup: "preschool",
//   displayName: "ZOË",
//   isSchoolReady: false,
//   nextBirthday: 5
// }
```

## Expression Design Patterns

### Operand-Over-InputData Pattern

> **Helper available:** For simple unary and binary expressions, consider using `createBimodalExpression` which implements this pattern automatically. See [Expression Authoring Helpers](#expression-authoring-helpers) above.

When designing expressions that **extract or compute values from collections** (arrays, objects), prefer the operand-over-inputData pattern with fallback. This pattern makes expressions more composable and eliminates the need for verbose pipelines.

**Pattern:**

1. Try to resolve and use the operand (if it's an array/collection)
2. Fall back to input data if operand is null or not a collection
3. Use `isWrappedLiteral` to respect `$literal` wrapping

**When to use:**

- **Aggregations**: `$count`, `$sum`, `$min`, `$max`, `$mean`
- **Accessors**: `$first`, `$last`
- **Transformations**: `$abs`, `$ceil`, `$floor`, `$sqrt`, `$lowercase`, `$uppercase`, `$trim`, `$reverse`, `$unique`
- Any expression that answers "what value from this collection?" or "transform this value"

**When NOT to use:**

- **Array iteration expressions**: `$filter`, `$map`, `$find` (always iterate over input data with operand as predicate)
- **Binary operations**: `$add`, `$subtract`, `$multiply` (operand is the second argument, not alternative data source)
- Expressions where the operand fundamentally serves a different semantic purpose

```javascript
// Example: Custom aggregation following the pattern
const createAggregativeExpression =
  (expressionName, calculateFn) =>
  (operand, inputData, { apply, isWrappedLiteral }) => {
    // Resolve operand, respecting $literal wrapping
    const resolved = isWrappedLiteral(operand)
      ? operand.$literal
      : apply(operand, inputData);

    // Require either operand or input data to be an array
    if (!Array.isArray(resolved) && !Array.isArray(inputData)) {
      throw new Error(`${expressionName} requires array operand or input data`);
    }

    // Prefer operand, fall back to input data
    return Array.isArray(resolved)
      ? calculateFn(resolved)
      : calculateFn(inputData);
  };

const $median = createAggregativeExpression("$median", (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
});

// Usage examples demonstrating composability:

// Traditional: operates on input data
engine.apply({ $median: null }, [1, 5, 3, 9, 2]);
// Returns: 3

// Operand: operates on literal array
engine.apply({ $median: [1, 5, 3, 9, 2] }, null);
// Returns: 3

// Composable: operates on expression result
engine.apply({ $median: { $get: "scores" } }, { scores: [85, 92, 78] });
// Returns: 85

// Most powerful: eliminates verbose pipelines
// Before pattern:
engine.apply(
  { $pipe: [{ $filter: { $gt: 3 } }, { $median: null }] },
  [1, 2, 3, 4, 5, 6],
);

// After pattern:
engine.apply({ $median: { $filter: { $gt: 3 } } }, [1, 2, 3, 4, 5, 6]);
// Returns: 5 (median of [4, 5, 6])
```

**Benefits:**

- Natural composition without `$pipe`
- Operands are no longer wasted parameters
- Clear mental model: "operate on what I specify, or what I have"

## Best Practices

### 1. Don't Create Expressions Inside Expressions

Custom expressions should use native JavaScript, not create new expression objects internally. When you need to use other expressions, let users compose them in the operand.

```javascript
// Anti-Pattern: Creating expressions inside the implementation
const $badExample = (operand, inputData, { apply }) => {
  const childAge = apply({ $get: "age" }, inputData); // WRONG: creating { $get: "age" }
  const threshold = apply({ $add: 2 }, operand.baseAge); // WRONG: creating { $add: 2 }
  return apply({ $gte: threshold }, childAge); // WRONG: creating { $gte: ... }
};

// Good: Use native JavaScript
const $goodExample = (operand, inputData, { apply }) => {
  const threshold = apply(operand.threshold, inputData); // GOOD: resolve user's operand
  const childAge = inputData.age; // Direct property access
  return childAge >= threshold; // Direct comparison
};

// Usage - user composes expressions in their JSON:
engine.apply(
  { $goodExample: { threshold: { $add: [{ $get: "baseAge" }, 2] } } },
  childData,
);
```

**Why?** Creating expressions inside your implementation hides composition from users, prevents customization, and defeats serializability. The user's job is to compose expressions in JSON; your job is to implement atomic operations in JavaScript.

### 2. Maintain Determinism (When Possible)

Custom expressions should be deterministic whenever possible - same inputs always produce same outputs:

```javascript
// Deterministic
const $calculateScore = (operand, inputData) => {
  const base = inputData.baseScore;
  const multiplier = operand.multiplier;
  return base * multiplier;
};

// Non-deterministic (uses current time)
const $addTimestamp = (operand, inputData) => {
  return { ...inputData, timestamp: Date.now() };
};
```

Some expressions have side effects by their nature. A `$random` expression that returns a random number is non-deterministic. Expressions like this should be clearly labeled to preserve user expectations. A single non-deterministic expression contaminates every expression that uses it. That said, it can absolutely be worth the tradeoff. Only do it with care.

### 3. Error Handling

Provide clear error messages:

```javascript
const $safeGet = (operand, inputData) => {
  if (!operand || typeof operand !== "string") {
    throw new Error("$safeGet operand must be a string path");
  }

  try {
    // Complete implementation: safe property access without delegation
    return operand.split(".").reduce((obj, key) => obj?.[key], inputData);
  } catch (error) {
    return null; // Safe fallback
  }
};
```

## Integration with Expression Engine

Register custom expressions when creating your engine:

```javascript
import { createExpressionEngine } from "json-expressions";

const engine = createExpressionEngine({
  custom: {
    $ageGroup,
    $validateChild,
    $enrichChild,
    $conditionalProcess,
  },
});

// Now use your custom expressions
const result = engine.apply(
  {
    $pipe: [
      { $enrichChild: null },
      {
        $validateChild: {
          rules: {
            age: { $gte: 2 },
          },
        },
      },
    ],
  },
  childData,
);
```

## Custom Packs

Custom packs are nothing more than collections of expressions.

```javascript
const daycare = {
  $ageGroup,
  $validateChild,
  $enrichChild,
  $conditionalProcess,
};
const engine = createExpressionEngine({ packs: [daycare] });
```

## Testing Custom Expressions

Always test your custom expressions thoroughly:

```javascript
describe("$ageGroup", () => {
  it("classifies ages correctly", () => {
    const infant = { name: "Olivia", age: 1 };
    const toddler = { name: "Zara", age: 3 };
    const preschooler = { name: "Kai", age: 5 };

    expect(engine.apply({ $ageGroup: null }, infant)).toBe("infant");
    expect(engine.apply({ $ageGroup: null }, toddler)).toBe("toddler");
    expect(engine.apply({ $ageGroup: null }, preschooler)).toBe("preschool");
  });

  it("handles edge cases", () => {
    const edgeCase1 = { age: 2 };
    const edgeCase2 = { age: 4 };

    expect(engine.apply({ $ageGroup: null }, edgeCase1)).toBe("toddler");
    expect(engine.apply({ $ageGroup: null }, edgeCase2)).toBe("preschool");
  });

  it("works with nested expressions", () => {
    const data = { child: { age: 3 } };
    expect(
      engine.apply(
        {
          $pipe: [{ $get: "child" }, { $ageGroup: null }],
        },
        data,
      ),
    ).toBe("toddler");
  });
});
```

This guide should help you create powerful, maintainable custom expressions that integrate seamlessly with the JSON Expressions ecosystem.
