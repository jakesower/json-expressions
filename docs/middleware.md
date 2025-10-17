# Middleware

Middleware functions wrap expression evaluation to add cross-cutting concerns like logging, performance monitoring, error handling, and telemetry.

## Overview

Middleware receives each expression evaluation and can:

- **Observe** - Log operand, inputData, expression name, and path
- **Transform** - Modify operand or inputData before evaluation
- **Control** - Short-circuit evaluation or catch errors
- **Measure** - Time performance or track usage

## Basic Usage

```javascript
import { createExpressionEngine } from "json-expressions";

const logger = (operand, inputData, next, { expressionName, path }) => {
  console.log(`Evaluating ${expressionName} at ${path.join(".")}`);
  return next(operand, inputData);
};

const engine = createExpressionEngine({
  middleware: [logger],
});

engine.apply({ $get: "name" }, { name: "Ximena", age: 4 });
// Logs: Evaluating $get at
// Returns: "Ximena"
```

## Middleware Signature

```typescript
type Middleware = (
  operand: unknown,
  inputData: unknown,
  next: (operand: unknown, inputData: unknown) => unknown,
  context: { expressionName: string; path: (string | number)[] },
) => unknown;
```

**Parameters:**

- `operand` - The expression's operand (e.g., `"name"` for `{ $get: "name" }`)
- `inputData` - The input data being processed
- `next` - Call this to continue evaluation (optionally with modified operand/inputData)
- `context` - Metadata about the expression being evaluated
  - `expressionName` - The expression operator (e.g., `"$get"`, `"$filter"`)
  - `path` - Array representing the expression's location in the tree (e.g., `["$pipe", 0, "$map"]`)

## Common Use Cases

### Performance Monitoring

Track slow expressions in production:

```javascript
const performanceMonitor = (
  operand,
  inputData,
  next,
  { expressionName, path },
) => {
  const start = performance.now();
  const result = next(operand, inputData);
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(
      `Slow expression: ${expressionName} at ${path.join(".")} took ${duration}ms`,
    );
  }

  return result;
};

const engine = createExpressionEngine({
  middleware: [performanceMonitor],
});
```

### Error Reporting

Send errors to your monitoring service:

```javascript
const errorReporter = (operand, inputData, next, { expressionName, path }) => {
  try {
    return next(operand, inputData);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        expression: expressionName,
        path: path.join("."),
      },
      extra: { operand, inputData },
    });
    throw error;
  }
};
```

### Development Logging

Log specific expression types during development:

```javascript
const debugMiddleware = (operand, inputData, next, { expressionName }) => {
  if (expressionName === "$filter" || expressionName === "$map") {
    console.log(`[DEBUG] ${expressionName}:`, { operand, inputData });
    const result = next(operand, inputData);
    console.log(`[DEBUG] ${expressionName} result:`, result);
    return result;
  }
  return next(operand, inputData);
};

const engine = createExpressionEngine({
  middleware: process.env.NODE_ENV === "development" ? [debugMiddleware] : [],
});
```

### Telemetry

Track which expressions are actually used:

```javascript
const telemetry = (operand, inputData, next, { expressionName }) => {
  metrics.increment(`expression.${expressionName}.count`);
  return next(operand, inputData);
};
```

## Transforming Inputs

Middleware can modify operand or inputData before evaluation:

### Rewriting Property Paths

```javascript
const pathRewriter = (operand, inputData, next, { expressionName }) => {
  if (expressionName === "$get" && operand === "group") {
    // Rewrite deprecated "group" to "classroom"
    return next("classroom", inputData);
  }
  return next(operand, inputData);
};

// Child records migrated from "group" to "classroom"
engine.apply({ $get: "group" }, { name: "Amara", classroom: "Rainbow" });
// Returns: "Rainbow" (reads from "classroom")
```

### Injecting Context

```javascript
const contextInjector = (operand, inputData, next) => {
  // Add enrollment date and facility ID to all evaluations
  return next(operand, {
    ...inputData,
    _enrollmentDate: getCurrentDate(),
    _facilityId: getFacilityId(),
  });
};

// Context automatically available in all expressions
const child = { name: "Chen", age: 3 };
engine.apply({ $get: "_facilityId" }, child);
// Returns: "FAC-001" (injected by middleware)
```

## Controlling Evaluation

### Short-Circuiting

Skip evaluation and return early:

```javascript
const accessControl = (operand, inputData, next, { expressionName }) => {
  if (expressionName === "$get" && operand.startsWith("_internal")) {
    // Block access to internal administrative fields
    return null;
  }
  return next(operand, inputData);
};

// Protect sensitive staff data
const child = { name: "Jamal", _internalNotes: "sensitive info" };
engine.apply({ $get: "_internalNotes" }, child);
// Returns: null (blocked by middleware)
```

### Caching

Cache expensive expression results:

```javascript
const cache = new Map();

const cacheMiddleware = (operand, inputData, next, { expressionName }) => {
  if (expressionName === "$calculateTuition") {
    const key = JSON.stringify({ operand, inputData });
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = next(operand, inputData);
    cache.set(key, result);
    return result;
  }
  return next(operand, inputData);
};

// Expensive tuition calculations are cached
const enrollment = {
  childName: "Sofia",
  daysPerWeek: 5,
  hasSubsidy: true,
  siblings: 2,
};
```

## Composing Multiple Middleware

Middleware executes in order, with each wrapping the next:

```javascript
const timing = (operand, inputData, next, { expressionName }) => {
  console.log(`[TIMING] Before ${expressionName}`);
  const result = next(operand, inputData);
  console.log(`[TIMING] After ${expressionName}`);
  return result;
};

const logging = (operand, inputData, next, { expressionName }) => {
  console.log(`[LOGGING] Before ${expressionName}`);
  const result = next(operand, inputData);
  console.log(`[LOGGING] After ${expressionName}`);
  return result;
};

const engine = createExpressionEngine({
  middleware: [timing, logging],
});

engine.apply({ $get: "classroom" }, { name: "Kai", classroom: "Rainbow" });
// Output:
// [TIMING] Before $get
// [LOGGING] Before $get
// [LOGGING] After $get
// [TIMING] After $get
```

## Middleware vs $debug

**Middleware** is for production observability, performance monitoring, and cross-cutting concerns that apply to all or many expressions.

**$debug** is for quick, targeted debugging during development—like adding a `console.log` at a specific point in your expression.

Use both:

- Middleware for always-on telemetry and error reporting
- `$debug` for "what's happening here?" debugging

## Best Practices

### Keep It Fast

Middleware runs on every expression evaluation. Keep logic minimal:

```javascript
// Slow - performs expensive work on every expression
const badMiddleware = (operand, inputData, next) => {
  expensiveOperation();
  return next(operand, inputData);
};

// Fast - only works when needed
const goodMiddleware = (operand, inputData, next, { expressionName }) => {
  if (expressionName === "$specificExpression") {
    expensiveOperation();
  }
  return next(operand, inputData);
};
```

### Preserve Errors

Don't silently catch errors unless you're specifically handling them:

```javascript
// Swallows errors
const badErrorHandler = (operand, inputData, next) => {
  try {
    return next(operand, inputData);
  } catch (error) {
    return null; // User won't know anything went wrong
  }
};

// Reports and rethrows
const goodErrorHandler = (operand, inputData, next) => {
  try {
    return next(operand, inputData);
  } catch (error) {
    reportError(error);
    throw error; // Let caller handle it
  }
};
```

### Use Environment Checks

Only enable expensive middleware in development:

```javascript
const engine = createExpressionEngine({
  middleware: [
    ...(process.env.NODE_ENV === "development" ? [debugMiddleware] : []),
    errorReporter, // Always report errors
    ...(process.env.ENABLE_TELEMETRY ? [telemetry] : []),
  ],
});
```

## Examples

### Complete Production Setup

```javascript
import { createExpressionEngine, packs } from "json-expressions";

// Performance monitoring
const performance = (operand, inputData, next, { expressionName, path }) => {
  const start = Date.now();
  const result = next(operand, inputData);
  const duration = Date.now() - start;

  metrics.histogram("expression.duration", duration, {
    expression: expressionName,
    path: path.join("."),
  });

  return result;
};

// Error tracking
const errorTracker = (operand, inputData, next, { expressionName, path }) => {
  try {
    return next(operand, inputData);
  } catch (error) {
    logger.error("Expression evaluation failed", {
      expression: expressionName,
      path: path.join("."),
      error: error.message,
    });
    throw error;
  }
};

// Feature usage tracking
const usageTracker = (operand, inputData, next, { expressionName }) => {
  analytics.track("expression_used", { expression: expressionName });
  return next(operand, inputData);
};

const engine = createExpressionEngine({
  packs: [packs.base, packs.array, packs.logic],
  middleware: [performance, errorTracker, usageTracker],
});
```

### Testing with Middleware

Spy on expression evaluation in tests:

```javascript
import { describe, it, expect } from "vitest";

describe("classroom expressions", () => {
  it("calls the expected expressions", () => {
    const calls = [];

    const spy = (operand, inputData, next, { expressionName }) => {
      calls.push(expressionName);
      return next(operand, inputData);
    };

    const engine = createExpressionEngine({ middleware: [spy] });

    const classroom = {
      children: [
        { name: "Luna", enrolled: true },
        { name: "Diego", enrolled: false },
      ],
    };

    engine.apply(
      { $pipe: [{ $get: "children" }, { $filter: { $get: "enrolled" } }] },
      classroom,
    );

    expect(calls).toEqual(["$pipe", "$get", "$filter", "$get", "$get"]);
  });
});
```
