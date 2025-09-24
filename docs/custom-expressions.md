# Custom Expressions Guide

This guide covers the advanced aspects of creating custom expressions in JSON Expressions, including how to properly handle the execution context and create sophisticated custom behavior.

## Overview

Custom expressions allow you to extend JSON Expressions with domain-specific functionality while maintaining the nature of the expression system. When creating custom expressions, you define both `apply` and `evaluate` forms and have access to the execution context.

## Basic Custom Expression Structure

Every custom expression must provide both `apply` and `evaluate` methods:

```javascript
const $myExpression = {
  apply: (operand, inputData, context) => {
    // Apply the expression to input data
    // operand: the expression's operand/parameter
    // inputData: the data being processed
    // context: execution context with apply, evaluate, isExpression, isWrappedLiteral
    return result;
  },
  evaluate: (operand, context) => {
    // Evaluate the expression without input data
    // operand: the expression's operand/parameter
    // context: execution context with apply, evaluate, isExpression, isWrappedLiteral
    return result;
  },
};
```

## Execution Context

The `context` parameter provides access to the expression engine's core functions:

### `context.apply(expression, data)`

Applies an expression to input data. Use this when you need to evaluate nested expressions against specific data.

```javascript
const $processChild = {
  apply: (operand, inputData, { apply }) => {
    // Get a child's data and apply an expression to it
    const child = inputData.children[operand.index];
    return apply(operand.expression, child);
  },
  evaluate: (operand, { apply }) => {
    // In evaluate form, both child and expression are provided
    return apply(operand.expression, operand.child);
  },
};
```

### `context.evaluate(expression)`

Evaluates an expression independently. Use this for static expressions that don't need input data.

```javascript
const $computeMetric = {
  apply: (operand, inputData, { evaluate }) => {
    // Apply some transformation to input, then compute a static metric
    const processed = processData(inputData);
    return evaluate(operand.computation);
  },
  evaluate: (operand, { evaluate }) => {
    // Pure computation
    return evaluate(operand.computation);
  },
};
```

### `context.isExpression(value)`

Tests if a value is a valid expression. Useful for conditional processing.

```javascript
const $conditionalProcess = {
  apply: (operand, inputData, { apply, isExpression }) => {
    if (isExpression(operand)) {
      // If operand is an expression, apply it
      return apply(operand, inputData);
    } else {
      // If operand is a literal value, return it directly
      return operand;
    }
  },
  evaluate: (operand, { evaluate, isExpression }) => {
    if (isExpression(operand)) {
      return evaluate(operand);
    } else {
      return operand;
    }
  },
};
```

### `context.isWrappedLiteral(value)`

Tests if a value is specifically a `$literal` expression. The `$literal` expression is used to wrap values that should be returned as-is without any evaluation, even if they look like expressions. This is seldom used functionality because most expressions want to make use of the wrapped value and not treat it any more specially than that. For examples of when it should be used, check the code definitions of `$identity` and `$case`.

## Nested Expressions

It is important to be aware that your custom expressions may themselves contain expressions.

```javascript
const $toTheNthWRONG = {
  apply: (operand, inputData) => Math.pow(inputData, operand),
  evaluate: (operand) => Math.pow(operand.base, operand.power),
};

const result = engine.evaluate({
  $toTheNthWRONG: { base: 10, power: { $double: 1 } },
});
// This will CRASH because nothing evaluated the $double expression!

const $toTheNth = {
  apply: (operand, inputData) => Math.pow(inputData, operand),
  evaluate: (operand, { evaluate }) =>
    Math.pow(evaluate(operand.base), evaluate(operand.power)),
};

const result = engine.evaluate({
  $toTheNth: { base: 10, power: { $double: 1 } },
});
// Returns 100
```

It is good practice to pass your operands to apply or evaluate as appropriate to ensure nested expressions are handled.

## Real-World Examples

### Example 1: Daycare Age Group Classification

```javascript
const $ageGroup = {
  apply: (operand, inputData, { apply }) => {
    const { age } = inputData;

    if (age < 2) return "infant";
    if (age < 4) return "toddler";
    if (age < 6) return "preschool";
    return "school-age";
  },
  evaluate: (operand, { evaluate }) => {
    // Age is provided directly in evaluate form
    const age = evaluate(operand);

    if (age < 2) return "infant";
    if (age < 4) return "toddler";
    if (age < 6) return "preschool";
    return "school-age";
  },
};

// Usage:
// Apply form: { $ageGroup: null } - operates on inputData.age
// Evaluate form: { $ageGroup: 3 } - returns "toddler"
```

### Example 2: Validation with Context

```javascript
const $validateChild = {
  apply: (operand, inputData, { apply }) => {
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
  },
  evaluate: (operand, { apply }) => {
    // In evaluate form, both data and rules are provided
    return apply({ $validateChild: { rules: operand.rules } }, operand.data);
  },
};

// Usage:
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
```

### Example 3: Complex Data Transformation

```javascript
const $enrichChild = {
  apply: (operand, inputData, { apply, evaluate }) => {
    const child = inputData;

    return {
      ...child,
      ageGroup: apply({ $ageGroup: null }, child),
      displayName: evaluate({ $uppercase: child.name }),
      isSchoolReady: apply({ $gte: 5 }, child.age),
      nextBirthday: evaluate({
        $add: [child.age, 1],
      }),
    };
  },
  evaluate: (operand, { apply }) => {
    // Delegate to apply form
    return apply({ $enrichChild: null }, operand);
  },
};
```

## Advanced Patterns

### Recursive Expression Processing

```javascript
const $deepTransform = {
  apply: (operand, inputData, { apply, isExpression }) => {
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
  },
  evaluate: (operand, { apply }) => {
    return apply({ $deepTransform: operand.transform }, operand.data);
  },
};
```

### Conditional Expression Execution

```javascript
const $conditional = {
  apply: (operand, inputData, { apply }) => {
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
  },
  evaluate: (operand, { apply, evaluate }) => {
    const condition = evaluate(operand.if);

    if (condition) {
      return operand.then !== undefined ? evaluate(operand.then) : null;
    } else {
      return operand.else !== undefined ? evaluate(operand.else) : null;
    }
  },
};
```

## Best Practices

### 1. Handle Both Forms Properly

Always implement both `apply` and `evaluate` forms. The apply form should work with input data, while evaluate should be self-contained.

```javascript
// Good: Both forms handled appropriately
const $example = {
  apply: (operand, inputData, { apply }) => apply(operand, inputData),
  evaluate: (operand, { evaluate }) => evaluate(operand),
};

// Bad: Missing evaluate form
const $badExample = {
  apply: (operand, inputData, { apply }) => apply(operand, inputData),
  // Missing evaluate!
};
```

### 2. Use Context Functions Appropriately

Use `apply` for expressions that need input data, `evaluate` for static expressions:

```javascript
const $smartProcess = {
  apply: (operand, inputData, { apply, evaluate }) => {
    // Use apply for expressions that operate on inputData
    const childAge = apply({ $get: "age" }, inputData);

    // Use evaluate for static computations
    const threshold = evaluate({ $add: [operand.baseAge, 2] });

    return childAge >= threshold;
  },
};
```

### 3. Maintain Determinism

Custom expressions should be deterministic whenever possible - same inputs always produce same outputs:

```javascript
// Good: Deterministic
const $calculateScore = {
  apply: (operand, inputData, { apply }) => {
    const base = apply({ $get: "baseScore" }, inputData);
    return base * operand.multiplier;
  },
};

// Bad: Non-deterministic (uses current time)
const $addTimestamp = {
  apply: (operand, inputData) => {
    return { ...inputData, timestamp: Date.now() }; // Don't do this!
  },
};
```

Some expressions have side effects by their nature. A `$random` expression that returns a random number is non-deterministic. Expressions like this should be clearly labeled to preserve user expectations.

### 4. Error Handling

Provide clear error messages:

```javascript
const $safeGet = {
  apply: (operand, inputData, { apply }) => {
    if (!operand || typeof operand !== "string") {
      throw new Error("$safeGet operand must be a string path");
    }

    try {
      return apply({ $get: operand }, inputData);
    } catch (error) {
      return operand.default ?? null;
    }
  },
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

Always test both forms of your custom expressions:

```javascript
describe("$ageGroup", () => {
  it("apply form classifies age correctly", () => {
    const child = { name: "Zara", age: 3 };
    expect(engine.apply({ $ageGroup: null }, child)).toBe("toddler");
  });

  it("evaluate form works with direct age", () => {
    expect(engine.evaluate({ $ageGroup: 3 })).toBe("toddler");
  });

  it("handles edge cases", () => {
    expect(engine.evaluate({ $ageGroup: 2 })).toBe("toddler");
    expect(engine.evaluate({ $ageGroup: 4 })).toBe("preschool");
  });
});
```

This guide should help you create powerful, maintainable custom expressions that integrate seamlessly with the JSON Expressions ecosystem.
