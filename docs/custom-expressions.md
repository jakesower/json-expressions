# Custom Expressions Guide

This guide covers creating custom expressions for the apply-only JSON Expressions engine. Custom expressions allow you to extend JSON Expressions with domain-specific functionality while maintaining the declarative nature of the expression system.

> **Note:** This guide covers function-based custom expressions. The unified `createExpressionEngine` supports both apply and evaluate modes when your expressions provide both methods.

## Overview

Custom expressions in apply mode are functions that operate on input data. They receive an operand (the expression's parameter), the input data being processed, and a context object with access to the expression engine's core functions.

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
import { createExpressionEngine, filtering } from "json-expressions";

const $validateChild = (operand, inputData, { apply }) => {
  // Check each validation rule and collect errors
  const errors = Object.entries(operand.rules)
    .map(([field, rule]) => {
      const value = apply({ $get: field }, inputData);
      const isValid = apply(rule, value);
      return isValid ? null : `${field} validation failed`;
    })
    .filter((error) => error !== null);

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

const engine = createExpressionEngine({
  packs: [filtering],
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
const $enrichChild = (operand, inputData, { apply }) => {
  const child = inputData;

  return {
    ...child,
    ageGroup: apply({ $ageGroup: null }, child),
    displayName: apply({ $uppercase: null }, child.name),
    isSchoolReady: apply({ $gte: 5 }, child.age),
    nextBirthday: apply({ $add: 1 }, child.age),
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

## Advanced Patterns

### Recursive Expression Processing

```javascript
const $deepTransform = (operand, inputData, { apply, isExpression }) => {
  if (Array.isArray(inputData)) {
    return inputData.map((item) => apply({ $deepTransform: operand }, item));
  }

  if (typeof inputData === "object" && inputData !== null) {
    return Object.entries(inputData).reduce(
      (result, [key, value]) =>
        isExpression(operand[key])
          ? { ...result, [key]: apply(operand[key], value) }
          : { ...result, [key]: value },
      {},
    );
  }

  return inputData;
};

// Usage: Apply transformations recursively to nested data
const children = [
  { name: "aria", age: 4 },
  { name: "kai", age: 5 },
];
const result = engine.apply(
  {
    $deepTransform: {
      name: { $uppercase: null },
    },
  },
  children,
);
// Returns: [{ name: "ARIA", age: 4 }, { name: "KAI", age: 5 }]
```

### Conditional Expression Execution

```javascript
const $conditional = (operand, inputData, { apply }) => {
  const condition = apply(operand.if, inputData);

  if (condition) {
    return operand.then !== undefined
      ? apply(operand.then, inputData)
      : inputData;
  } else {
    return operand.else !== undefined
      ? apply(operand.else, inputData)
      : inputData;
  }
};

// Usage: Conditional transformation
const child = { name: "Kai", age: 5 };
const result = engine.apply(
  {
    $conditional: {
      if: { $pipe: [{ $get: "age" }, { $gte: 5 }] },
      then: { $pipe: [{ $get: "name" }, { $uppercase: null }] },
      else: { $pipe: [{ $get: "name" }, { $lowercase: null }] },
    },
  },
  child,
);
// Returns: "KAI" (since age >= 5)
```

## Best Practices

### 1. Always Use Context Functions

Always use the `apply` function from context to resolve operands that might contain expressions.

```javascript
// Good: Uses apply to resolve nested expressions
const $example = (operand, inputData, { apply }) => {
  const resolved = apply(operand, inputData);
  return processValue(resolved);
};

// Bad: Doesn't handle nested expressions
const $badExample = (operand, inputData) => {
  return processValue(operand); // Will fail if operand contains expressions!
};
```

### 2. Handle Operands Properly

Always resolve operands using `apply` before using them in your logic:

```javascript
const $smartProcess = (operand, inputData, { apply }) => {
  // Use apply for expressions that operate on inputData
  const childAge = apply({ $get: "age" }, inputData);

  // Resolve operand expressions too
  const baseAge = apply(operand.baseAge, inputData);
  const threshold = baseAge + 2;

  return childAge >= threshold;
};
```

### 3. Maintain Determinism

Custom expressions should be deterministic whenever possible - same inputs always produce same outputs:

```javascript
// Good: Deterministic
const $calculateScore = (operand, inputData, { apply }) => {
  const base = apply({ $get: "baseScore" }, inputData);
  const multiplier = apply(operand.multiplier, inputData);
  return base * multiplier;
};

// Bad: Non-deterministic (uses current time)
const $addTimestamp = (operand, inputData) => {
  return { ...inputData, timestamp: Date.now() }; // Don't do this!
};
```

Some expressions have side effects by their nature. A `$random` expression that returns a random number is non-deterministic. Expressions like this should be clearly labeled to preserve user expectations.

### 4. Error Handling

Provide clear error messages:

```javascript
const $safeGet = (operand, inputData, { apply }) => {
  if (!operand || typeof operand !== "string") {
    throw new Error("$safeGet operand must be a string path");
  }

  try {
    return apply({ $get: operand }, inputData);
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
