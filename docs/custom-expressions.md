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

When designing expressions that **extract or compute values from collections** (arrays, objects), prefer the operand-over-inputData pattern with fallback. This pattern makes expressions more composable and eliminates the need for verbose pipelines.

**Pattern:**

1. Try to resolve and use the operand (if it's an array/collection)
2. Fall back to input data if operand is null or not a collection
3. Use `isWrappedLiteral` to respect `$literal` wrapping

**When to use:**

- **Aggregations**: `$count`, `$sum`, `$min`, `$max`, `$mean`
- **Accessors**: `$first`, `$last`
- Any expression that answers "what value from this collection?"

**When NOT to use:**

- **Transformations**: `$reverse`, `$uppercase`, `$trim` (operate on "data you have")
- Expressions that fundamentally operate on input data context

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
  childData
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
