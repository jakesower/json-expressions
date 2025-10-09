# JSON Expressions Reference

This document provides comprehensive documentation for all expressions available in the JSON Expressions library. All examples show expressions operating on input data.

> **Looking for pack information?** See the **[Pack Reference](packs.md)** to understand which expressions are available in each pack.

**Important note on equality:** JavaScript has the notion of `undefined` being distinct from `null`. JSON Expressions is designed to be useful regardless of the implementing language, and most languages do not distinguish between the two. Therefore, `undefined` and `null` are considered to be **equal** throughout the library. Use `$exists` if you wish to determine if a key in an object is undefined.

```javascript
const child = { name: "Zoë", age: null };

engine.apply({ $eq: [undefined, null] }, {}); // returns true
engine.apply({ $eq: null }, child.petName); // returns true
engine.apply({ $eq: [{ $get: "petName" }, { $get: "age" }] }, child); // returns true

engine.apply({ $exists: "age" }, child); // returns true
engine.apply({ $exists: "petName" }, child); // returns false
```

## $abs

Returns the absolute value of a number.

```javascript
apply({ $abs: null }, -2.5);
// Returns: 2.5
```

## $add

Performs addition of two numbers.

```javascript
// Single operand: add to input data
apply({ $add: 5 }, 12);
// Returns: 17 (12 + 5)

// Array form: add two expressions
apply(
  { $add: [{ $get: "baseScore" }, { $get: "bonus" }] },
  { baseScore: 10, bonus: 3 },
);
// Returns: 13 (10 + 3)

// Mixed form: expression + literal (expression + expression is OK too)
apply({ $add: [{ $get: "age" }, 12] }, { age: 4 });
// Returns: 16 (4 + 12)
```

## $addDays

Adds a specified number of days to a date.

```javascript
// Array form: add days to date
apply({ $addDays: ["2025-10-05T00:00:00.000Z", 7] }, null);
// Returns: "2025-10-12T00:00:00.000Z"

// Input data form: add days to input date
apply({ $addDays: 7 }, "2025-10-05T00:00:00.000Z");
// Returns: "2025-10-12T00:00:00.000Z"

// Negative days subtract from date
apply({ $addDays: ["2025-10-05T00:00:00.000Z", -3] }, null);
// Returns: "2025-10-02T00:00:00.000Z"
```

## $addHours

Adds a specified number of hours to a date.

```javascript
// Array form: add hours to date
apply({ $addHours: ["2025-10-05T10:00:00.000Z", 5] }, null);
// Returns: "2025-10-05T15:00:00.000Z"

// Handles day boundaries
apply({ $addHours: ["2025-10-05T22:00:00.000Z", 3] }, null);
// Returns: "2025-10-06T01:00:00.000Z"
```

## $addMinutes

Adds a specified number of minutes to a date.

```javascript
// Array form: add minutes to date
apply({ $addMinutes: ["2025-10-05T10:30:00.000Z", 45] }, null);
// Returns: "2025-10-05T11:15:00.000Z"

// Handles hour boundaries
apply({ $addMinutes: ["2025-10-05T10:50:00.000Z", 20] }, null);
// Returns: "2025-10-05T11:10:00.000Z"
```

## $addMonths

Adds a specified number of months to a date.

```javascript
// Array form: add months to date
apply({ $addMonths: ["2025-10-05T00:00:00.000Z", 3] }, null);
// Returns: "2026-01-05T00:00:00.000Z"

// Input data form: add months to input date
apply({ $addMonths: 3 }, "2025-10-05T00:00:00.000Z");
// Returns: "2026-01-05T00:00:00.000Z"
```

## $addYears

Adds a specified number of years to a date.

```javascript
// Array form: add years to date
apply({ $addYears: ["2025-10-05T00:00:00.000Z", 5] }, null);
// Returns: "2030-10-05T00:00:00.000Z"

// Input data form: add years to input date
apply({ $addYears: 5 }, "2025-10-05T00:00:00.000Z");
// Returns: "2030-10-05T00:00:00.000Z"
```

## $all

Tests if all elements in an array satisfy a predicate expression.

```javascript
// Check if all children are ready for outdoor play
const children = [
  { name: "Aria", hasJacket: true },
  { name: "Kai", hasJacket: true },
  { name: "Zara", hasJacket: true },
];
apply({ $all: { $get: "hasJacket" } }, children);
// Returns: true
```

## $and

Logical AND operation - returns true if all expressions are truthy.

```javascript
// Check if child meets multiple criteria for field trip
const child = { age: 5, hasPermission: true, isHealthy: true };
apply(
  {
    $and: [
      { $pipe: [{ $get: "age" }, { $gte: 4 }] },
      { $get: "hasPermission" },
      { $get: "isHealthy" },
    ],
  },
  child,
);
// Returns: true
```

## $any

Tests if any element in an array satisfies a predicate expression.

```javascript
// Check if any child needs a nap
const children = [
  { name: "Chen", tired: false },
  { name: "Luna", tired: true },
  { name: "Diego", tired: false },
];
apply({ $any: { $get: "tired" } }, children);
// Returns: true
```

## $between

Tests if a value is between two bounds (inclusive).

```javascript
// Check if child's age is in preschool range
apply({ $between: { min: 3, max: 5 } }, 4);
// Returns: true
```

## $case

Unified conditional expression supporting both literal comparisons and boolean predicates.

The `$case` expression automatically determines how to handle each `when` clause:

- **Boolean predicate expressions** (`$gt`, `$eq`, `$and`, etc.) → Applied as predicates with the case value as input
- **All other values** → Compared literally using deep equality

```javascript
// Flexible activity assignment using both literal and predicate matching
const child = { age: 4, status: "active" };
apply(
  {
    $case: {
      value: { $get: "age" },
      cases: [
        { when: 2, then: "Sensory play and simple puzzles" }, // Literal comparison
        { when: 3, then: "Art activities and story time" }, // Literal comparison
        { when: { $eq: 4 }, then: "Pre-writing skills and group games" }, // Boolean predicate
        { when: { $gte: 5 }, then: "Early math and reading readiness" }, // Boolean predicate
      ],
      default: "Age-appropriate developmental activities",
    },
  },
  child,
);
// Returns: "Pre-writing skills and group games"
```

```javascript
// Mix literal status checks with computed conditions
const child = { status: "active", energy: 8 };
apply(
  {
    $case: {
      value: { $get: "status" },
      cases: [
        { when: "napping", then: "Quiet time activities" }, // Literal comparison
        { when: "active", then: "High energy games" }, // Literal comparison
        { when: { $get: "fallbackStatus" }, then: "Custom activity" }, // Expression applied to literal
      ],
      default: "Free play",
    },
  },
  child,
);
// Returns: "High energy games"
```

## $ceil

Returns the smallest integer greater than or equal to the input number (rounds up).

```javascript
apply({ $ceil: null }, 4.1);
// Returns: 5

apply({ $ceil: null }, -4.9);
// Returns: -4
```

## $day

Extracts the day of the month from a date (1-31).

```javascript
// Extract day from date
apply({ $day: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 5

// Works with input data form
apply({ $day: null }, "2025-10-31T15:23:45.234Z");
// Returns: 31
```

## $dayOfWeek

Returns the day of the week as a number (0=Sunday, 6=Saturday).

```javascript
// Get day of week (Sunday = 0)
apply({ $dayOfWeek: "2025-10-05T00:00:00.000Z" }, null);
// Returns: 0 (Sunday)

// Monday = 1
apply({ $dayOfWeek: "2025-10-06T00:00:00.000Z" }, null);
// Returns: 1

// Saturday = 6
apply({ $dayOfWeek: "2025-10-04T00:00:00.000Z" }, null);
// Returns: 6
```

## $dayOfYear

Returns the day of the year (1-365/366).

```javascript
// First day of year
apply({ $dayOfYear: "2025-01-01T00:00:00.000Z" }, null);
// Returns: 1

// Calculate day number
apply({ $dayOfYear: "2025-10-05T00:00:00.000Z" }, null);
// Returns: 278
```

## $coalesce

Returns the first non-null value from an array.

```javascript
// Get first available contact method
const parent = {
  phone: null,
  email: "parent@example.com",
  emergency: "555-1234",
};
apply(
  { $coalesce: [{ $get: "phone" }, { $get: "email" }, { $get: "emergency" }] },
  parent,
);
// Returns: "parent@example.com"
```

## $concat

Concatenates multiple arrays together.

```javascript
// Combine current children with new arrivals
const currentChildren = ["Aria", "Kai"];
apply({ $concat: [["Zara"], ["Luna", "Diego"]] }, currentChildren);
// Returns: ["Aria", "Kai", "Zara", "Luna", "Diego"]
```

## $count

Returns the count of items in an array. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Count items in input data array
const children = ["Amara", "Chen", "Fatima", "Kai"];
apply({ $count: null }, children);
// Returns: 4

// Count items in operand array
apply({ $count: [1, 2, 3, 4, 5] }, null);
// Returns: 5

// Count items from expression result
const data = { scores: [95, 87, 92, 88] };
apply({ $count: { $get: "scores" } }, data);
// Returns: 4
```

## $debug

Logs a value to console and returns it unchanged (useful for debugging pipelines). This is a good expression for custom implementations.

```javascript
// Debug intermediate value in pipeline
apply(
  {
    $pipe: [
      { $get: "children" },
      { $debug: null },
      { $filter: { $pipe: [{ $get: "age" }, { $gte: 4 }] } },
    ],
  },
  daycareData,
);
// Logs the children array and continues processing
```

## $diffDays

Calculates the difference in days between two dates.

```javascript
// Array form: difference in days
apply({ $diffDays: ["2025-10-05T00:00:00.000Z", "2025-10-12T00:00:00.000Z"] }, null);
// Returns: 7

// Input data form: difference from input date
apply({ $diffDays: "2025-10-12T00:00:00.000Z" }, "2025-10-05T00:00:00.000Z");
// Returns: 7

// Negative for earlier second date
apply({ $diffDays: ["2025-10-12T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] }, null);
// Returns: -7
```

## $diffHours

Calculates the difference in hours between two dates.

```javascript
// Array form: difference in hours
apply({ $diffHours: ["2025-10-05T10:00:00.000Z", "2025-10-05T15:00:00.000Z"] }, null);
// Returns: 5

// Handles day boundaries
apply({ $diffHours: ["2025-10-05T22:00:00.000Z", "2025-10-06T01:00:00.000Z"] }, null);
// Returns: 3
```

## $diffMilliseconds

Calculates the difference in milliseconds between two dates.

```javascript
// Array form: difference in milliseconds
apply({ $diffMilliseconds: ["2025-10-05T10:00:00.000Z", "2025-10-05T10:00:01.000Z"] }, null);
// Returns: 1000
```

## $diffMinutes

Calculates the difference in minutes between two dates.

```javascript
// Array form: difference in minutes
apply({ $diffMinutes: ["2025-10-05T10:00:00.000Z", "2025-10-05T10:45:00.000Z"] }, null);
// Returns: 45
```

## $diffMonths

Calculates the difference in months between two dates.

```javascript
// Array form: difference in months
apply({ $diffMonths: ["2025-10-05T00:00:00.000Z", "2026-01-05T00:00:00.000Z"] }, null);
// Returns: 3

// Handles year boundaries
apply({ $diffMonths: ["2025-12-15T00:00:00.000Z", "2026-02-15T00:00:00.000Z"] }, null);
// Returns: 2
```

## $diffSeconds

Calculates the difference in seconds between two dates.

```javascript
// Array form: difference in seconds
apply({ $diffSeconds: ["2025-10-05T10:00:00.000Z", "2025-10-05T10:01:00.000Z"] }, null);
// Returns: 60
```

## $diffYears

Calculates the difference in years between two dates.

```javascript
// Array form: difference in years
apply({ $diffYears: ["2025-10-05T00:00:00.000Z", "2030-10-05T00:00:00.000Z"] }, null);
// Returns: 5
```

## $default

Returns a default value if the expression result is null (or undefined). Supports both object form and array form.

```javascript
// Array form (concise): [expression, defaultValue]
const child = { name: "Amara", pickupTime: null };
apply(
  {
    $default: [{ $get: "pickupTime" }, "5:00 PM"],
  },
  child,
);
// Returns: "5:00 PM"

// Object form (legacy): { expression, default }
apply(
  {
    $default: {
      expression: { $get: "pickupTime" },
      default: "5:00 PM",
    },
  },
  child,
);
// Returns: "5:00 PM"

// Works with expression defaults
apply(
  {
    $default: [{ $get: "primaryContact" }, { $get: "secondaryContact" }],
  },
  { primaryContact: null, secondaryContact: "555-1234" },
);
// Returns: "555-1234"

// Preserves falsy non-null values
apply({ $default: [{ $get: "count" }, 10] }, { count: 0 });
// Returns: 0 (not 10, because 0 is not null/undefined)
```

## $divide

Performs division operation.

```javascript
// Single operand: divide input data
apply({ $divide: 4 }, 20.0);
// Returns: 5.00 (20.0 / 4)

// Array form: divide two expressions
apply(
  { $divide: [{ $get: "total" }, { $get: "children" }] },
  { total: 24, children: 6 },
);
// Returns: 4 (24 / 6)

// Mixed form: expression / literal
apply({ $divide: [{ $get: "minutes" }, 60] }, { minutes: 150 });
// Returns: 2.5 (150 / 60)
```

## $eq

Tests equality using deep comparison. JSON has no notion of `undefined`, which means that `undefined` and `null` will be treated as equal when using `$eq`. If you wish to distinguish between the two, use `$exists` instead.

```javascript
// Single operand: compare input data
apply({ $eq: "reading" }, "reading");
// Returns: true ("reading" === "reading")

// Array form: compare two expressions
apply(
  { $eq: [{ $get: "status" }, { $get: "expectedStatus" }] },
  { status: "active", expectedStatus: "active" },
);
// Returns: true ("active" === "active")
```

## $endOfDay

Returns the end of day (23:59:59.999) for a given date.

```javascript
// Get end of day
apply({ $endOfDay: "2025-10-05T15:23:45.234Z" }, null);
// Returns: "2025-10-05T23:59:59.999Z"
```

## $endOfMonth

Returns the last moment of the month for a given date.

```javascript
// End of 31-day month
apply({ $endOfMonth: "2025-10-15T15:23:45.234Z" }, null);
// Returns: "2025-10-31T23:59:59.999Z"

// End of 30-day month
apply({ $endOfMonth: "2025-11-15T15:23:45.234Z" }, null);
// Returns: "2025-11-30T23:59:59.999Z"

// End of February (non-leap year)
apply({ $endOfMonth: "2025-02-15T15:23:45.234Z" }, null);
// Returns: "2025-02-28T23:59:59.999Z"
```

## $endOfYear

Returns the last moment of the year for a given date.

```javascript
// Get end of year
apply({ $endOfYear: "2025-10-15T15:23:45.234Z" }, null);
// Returns: "2025-12-31T23:59:59.999Z"
```

## $exists

Tests if a property or path exists in an object, regardless of its value. Different from $isPresent - this checks existence, not meaningfulness.

```javascript
// Check if child has allergies field (even if null)
const student = { name: "Zara", allergies: null, age: 4 };
apply({ $exists: "allergies" }, student);
// Returns: true (property exists, even though it's null)

apply({ $exists: "missing" }, student);
// Returns: false

// Works with nested paths
apply({ $exists: "parent.phone" }, { parent: { phone: "555-0123" } });
// Returns: true
```

## $filter

Filters array items based on a condition.

```javascript
// Find children who need extra help
const children = [
  { name: "Aria", needsHelp: true, age: 4 },
  { name: "Kai", needsHelp: false, age: 5 },
  { name: "Zara", needsHelp: true, age: 3 },
];
apply({ $filter: { $get: "needsHelp" } }, children);
// Returns: [{ name: "Aria", needsHelp: true, age: 4 }, { name: "Zara", needsHelp: true, age: 3 }]
```

## $filterBy

Filters arrays by object property conditions (shorthand for $filter + $matches).

```javascript
// Find active children ready for kindergarten
const children = [
  { name: "Aria", age: 4, active: true },
  { name: "Kai", age: 5, active: true },
  { name: "Zara", age: 5, active: false },
  { name: "Leo", age: 6, active: true },
];
apply({ $filterBy: { age: { $gte: 5 }, active: true } }, children);
// Returns: [{ name: "Kai", age: 5, active: true }, { name: "Leo", age: 6, active: true }]
```

## $find

Returns the first element that satisfies a predicate.

```javascript
// Find first child ready for kindergarten
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 6 },
];
apply({ $find: { $match: { age: { $gte: 5 } } } }, children);
// Returns: { name: "Kai", age: 5 }
```

## $first

Returns the first item in an array. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Get first item from input data array
const lineup = ["Chen", "Fatima", "Diego", "Luna"];
apply({ $first: null }, lineup);
// Returns: "Chen"

// Get first item from operand array
apply({ $first: [10, 20, 30] }, null);
// Returns: 10

// Get first item from expression result
const data = { scores: [95, 87, 92] };
apply({ $first: { $get: "scores" } }, data);
// Returns: 95

// Common pattern: filter then get first
apply({ $first: { $filter: { $gt: 3 } } }, [1, 2, 3, 4, 5]);
// Returns: 4
```

## $floor

Returns the largest integer less than or equal to the input number (rounds down).

```javascript
apply({ $floor: null }, 4.9);
// Returns: 4

apply({ $floor: null }, -4.1);
// Returns: -5
```

## $fromPairs

Converts an array of [key, value] pairs into an object.

```javascript
// Convert child data pairs to object
const childPairs = [
  ["name", "Zara"],
  ["age", 4],
  ["group", "Butterflies"],
];
apply({ $fromPairs: null }, childPairs);
// Returns: { name: "Zara", age: 4, group: "Butterflies" }
```

## $formatDate

Formats a date using a format pattern string (follows date-fns format tokens).

```javascript
// Array form: format date with pattern
apply({ $formatDate: ["2025-10-05T11:23:45.234Z", "yyyy-MM-dd"] }, null);
// Returns: "2025-10-05"

// Input data form: format input date
apply({ $formatDate: "yyyy-MM-dd" }, "2025-10-05T11:23:45.234Z");
// Returns: "2025-10-05"

// Custom pattern with month name
apply({ $formatDate: ["2025-10-05T11:23:45.234Z", "MMMM do, yyyy"] }, null);
// Returns: "October 5th, 2025"

// Format day of week
apply({ $formatDate: ["2025-10-05T11:23:45.234Z", "EEEE"] }, null);
// Returns: "Sunday"
```

## $flatMap

Maps and flattens array items.

```javascript
// Get all toys from all children's belongings
const children = [
  { belongings: ["teddy", "book"] },
  { belongings: ["blocks", "puzzle", "crayons"] },
  { belongings: ["doll"] },
];
apply({ $flatMap: { $get: "belongings" } }, children);
// Returns: ["teddy", "book", "blocks", "puzzle", "crayons", "doll"]
```

## $flatten

Flattens nested arrays by one level by default, with optional depth control.

```javascript
// Flatten one level (default)
const nestedBelongings = [
  ["teddy", "book"],
  ["blocks", ["puzzle", "crayons"]],
  ["doll"],
];
apply({ $flatten: null }, nestedBelongings);
// Returns: ["teddy", "book", "blocks", ["puzzle", "crayons"], "doll"]

// Flatten multiple levels with depth
apply({ $flatten: { depth: 2 } }, nestedBelongings);
// Returns: ["teddy", "book", "blocks", "puzzle", "crayons", "doll"]
```

## $get

Retrieves a value from data using dot notation paths or array paths. Supports the `$` wildcard for array element iteration and flattening. Returns `null` if the path does not exist. Combines well with `$default`.

```javascript
// Simple path access with dot notation
apply({ $get: "info.age" }, child);
// Returns: 4

// Path access with array notation
apply({ $get: ["info", "age"] }, child);
// Returns: 4

// Deep nesting with array path
const data = { child: { profile: { contact: { email: "test@example.com" } } } };
apply({ $get: ["child", "profile", "contact", "email"] }, data);
// Returns: "test@example.com"

// Array iteration with $ wildcard
const children = [
  { name: "Chen", age: 3 },
  { name: "Amira", age: 4 },
  { name: "Diego", age: 5 },
];
apply({ $get: "$.name" }, children);
// Returns: ["Chen", "Amira", "Diego"]

// Nested array iteration
const classrooms = {
  rooms: [
    { children: [{ name: "Sofia" }, { name: "Miguel" }] },
    { children: [{ name: "Zara" }, { name: "Omar" }] },
  ],
};
apply({ $get: "rooms.$.children.$.name" }, classrooms);
// Returns: ["Sofia", "Miguel", "Zara", "Omar"] (flattened)
```

## $groupBy

Groups array elements by a specified key or expression result.

```javascript
// Group children by age
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 4 },
  { name: "Chen", age: 5 },
];
apply({ $groupBy: { $get: "age" } }, children);
// Returns: {
//   "4": [{ name: "Aria", age: 4 }, { name: "Zara", age: 4 }],
//   "5": [{ name: "Kai", age: 5 }, { name: "Chen", age: 5 }]
// }
```

## $gt

Tests if value is greater than operand.

```javascript
// Single operand: compare input data
apply({ $gt: 4 }, 5);
// Returns: true (5 > 4)

// Array form: compare two expressions
apply({ $gt: [{ $get: "age" }, { $get: "minAge" }] }, { age: 6, minAge: 4 });
// Returns: true (6 > 4)

// Mixed form: expression > literal
apply({ $gt: [{ $get: "score" }, 80] }, { score: 85 });
// Returns: true (85 > 80)
```

## $gte

Tests if value is greater than or equal to operand.

```javascript
// Single operand: compare input data
apply({ $gte: 3 }, 3);
// Returns: true (3 >= 3)

// Array form: compare two expressions
apply(
  { $gte: [{ $get: "currentAge" }, { $get: "requiredAge" }] },
  { currentAge: 5, requiredAge: 4 },
);
// Returns: true (5 >= 4)

// Mixed form: expression >= literal
apply({ $gte: [{ $get: "attendance" }, 90] }, { attendance: 95 });
// Returns: true (95 >= 90)
```

## $hour

Extracts the hour from a date (0-23).

```javascript
// Extract hour from date
apply({ $hour: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 15

// Midnight returns 0
apply({ $hour: "2025-10-05T00:23:45.234Z" }, null);
// Returns: 0
```

## $if

Conditional expression that evaluates different branches based on a condition.

```javascript
// Assign activity based on weather
const weather = { condition: "rainy", temperature: 65 };
apply(
  {
    $if: {
      if: { $pipe: [{ $get: "condition" }, { $eq: "sunny" }] },
      then: "Outdoor playground",
      else: "Indoor activities",
    },
  },
  weather,
);
// Returns: "Indoor activities"
```

## $identity

Returns input data unchanged. This is useful as an identity function in pipelines or when you need to pass through values.

```javascript
// Return child data unchanged (identity function)
const childData = { name: "Chen", age: 4 };
apply({ $identity: null }, childData);
// Returns: { name: "Chen", age: 4 }

// Operand is ignored (the convention is to use null here)
apply({ $identity: "ignored" }, "hello");
// Returns: "hello"

// Input data can be addressed with $identity
apply({ $if: { if: { $identity: null }, then: "yes", else: "no" } }, true);
// Returns: "yes"
```

## $in

Tests if value exists in an array.

```javascript
// Check if child's dietary need is in available options
const availableOptions = ["vegetarian", "gluten-free", "dairy-free"];
apply({ $in: availableOptions }, "vegetarian");
// Returns: true
```

## $isAfter

Tests if the first date is after the second date.

```javascript
// Array form: compare two dates
apply({ $isAfter: ["2025-10-12T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] }, null);
// Returns: true

// Input data form
apply({ $isAfter: "2025-10-05T00:00:00.000Z" }, "2025-10-12T00:00:00.000Z");
// Returns: true

// Returns false for equal dates
apply({ $isAfter: ["2025-10-05T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] }, null);
// Returns: false
```

## $isBefore

Tests if the first date is before the second date.

```javascript
// Array form: compare two dates
apply({ $isBefore: ["2025-10-05T00:00:00.000Z", "2025-10-12T00:00:00.000Z"] }, null);
// Returns: true

// Returns false for equal dates
apply({ $isBefore: ["2025-10-05T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] }, null);
// Returns: false
```

## $isDateValid

Validates if a date string is valid, returning true or false instead of throwing.

```javascript
// Array form: validate with format
apply({ $isDateValid: ["10/05/2025", "MM/dd/yyyy"] }, null);
// Returns: true

// Input data form
apply({ $isDateValid: "MM/dd/yyyy" }, "10/05/2025");
// Returns: true

// Invalid date returns false
apply({ $isDateValid: ["not-a-date", "MM/dd/yyyy"] }, null);
// Returns: false

// Validate ISO string
apply({ $isDateValid: "2025-10-05T11:23:45.234Z" }, null);
// Returns: true
```

## $isEmpty

Tests if a value is empty or absent (null or undefined). The semantic inverse of $isPresent.

```javascript
// Check if pickup time is not set
apply({ $isEmpty: null }, null);
// Returns: true

apply({ $isEmpty: null }, undefined);
// Returns: true

apply({ $isEmpty: null }, "");
// Returns: false (empty string is not null/undefined)

apply({ $isEmpty: null }, 0);
// Returns: false (zero is not empty)
```

## $isPresent

Tests if a value is meaningful (not null or undefined). Provides cross-language clarity about value presence.

```javascript
// Check if emergency contact is provided
apply({ $isPresent: null }, "555-1234");
// Returns: true

// Check if child has meaningful data
apply({ $isPresent: null }, null);
// Returns: false

apply({ $isPresent: null }, undefined);
// Returns: false

apply({ $isPresent: null }, 0);
// Returns: true (zero is meaningful)
```

## $isSameDay

Tests if two dates are on the same calendar day.

```javascript
// Array form: compare two dates
apply({ $isSameDay: ["2025-10-05T10:00:00.000Z", "2025-10-05T15:00:00.000Z"] }, null);
// Returns: true

// Different days return false
apply({ $isSameDay: ["2025-10-05T23:59:59.999Z", "2025-10-06T00:00:00.000Z"] }, null);
// Returns: false
```

## $isWeekday

Tests if a date falls on a weekday (Monday-Friday).

```javascript
// Monday is a weekday
apply({ $isWeekday: "2025-10-06T00:00:00.000Z" }, null);
// Returns: true

// Friday is a weekday
apply({ $isWeekday: "2025-10-10T00:00:00.000Z" }, null);
// Returns: true

// Saturday is not a weekday
apply({ $isWeekday: "2025-10-04T00:00:00.000Z" }, null);
// Returns: false
```

## $isWeekend

Tests if a date falls on a weekend (Saturday or Sunday).

```javascript
// Saturday is a weekend
apply({ $isWeekend: "2025-10-04T00:00:00.000Z" }, null);
// Returns: true

// Sunday is a weekend
apply({ $isWeekend: "2025-10-05T00:00:00.000Z" }, null);
// Returns: true

// Monday is not a weekend
apply({ $isWeekend: "2025-10-06T00:00:00.000Z" }, null);
// Returns: false
```

## $join

Joins array elements into a string with a separator. **Note:** This is intended to join arrays of string values. Attempting to join values of other types may behave differently across different runtimes. Consider overriding this expression if you have use cases more complex than joining arrays of strings.

```javascript
// Create list of children's names
const names = ["Aria", "Chen", "Diego", "Luna"];
apply({ $join: ", " }, names);
// Returns: "Aria, Chen, Diego, Luna"
```

## $keys

Returns an array of all property names from an object.

```javascript
// Get all field names from child record
const child = { name: "Amara", age: 4, group: "Butterflies", present: true };
apply({ $keys: null }, child);
// Returns: ["name", "age", "group", "present"]
```

## $last

Returns the last item in an array. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Get last item from input data array
const pickupOrder = ["Kai", "Zara", "Amara", "Chen"];
apply({ $last: null }, pickupOrder);
// Returns: "Chen"

// Get last item from operand array
apply({ $last: [10, 20, 30] }, null);
// Returns: 30

// Get last item from expression result
const data = { scores: [95, 87, 92] };
apply({ $last: { $get: "scores" } }, data);
// Returns: 92

// Common pattern: filter then get last
apply({ $last: { $filter: { $gt: 3 } } }, [1, 2, 3, 4, 5]);
// Returns: 5
```

## $literal

Returns a literal value (useful when you need to pass values that look like expressions). **This expression cannot be excluded or overridden.**

```javascript
// Return exact object structure
apply({ $literal: { $special: "not an expression" } }, anyInput);
// Returns: { $special: "not an expression" }
```

## $lowercase

Converts string to lowercase.

```javascript
// Normalize child's name input
apply({ $lowercase: null }, "Amara Rodriguez");
// Returns: "amara holt"
```

## $lt

Tests if value is less than operand.

```javascript
// Single operand: compare input data
apply({ $lt: 4 }, 3);
// Returns: true (3 < 4)

// Array form: compare two expressions
apply({ $lt: [{ $get: "age" }, { $get: "maxAge" }] }, { age: 3, maxAge: 5 });
// Returns: true (3 < 5)

// Mixed form: expression < literal
apply({ $lt: [{ $get: "temperature" }, 75] }, { temperature: 68 });
// Returns: true (68 < 75)
```

## $lte

Tests if value is less than or equal to operand.

```javascript
// Single operand: compare input data
apply({ $lte: 6 }, 6);
// Returns: true (6 <= 6)

// Array form: compare two expressions
apply(
  { $lte: [{ $get: "groupSize" }, { $get: "maxCapacity" }] },
  { groupSize: 8, maxCapacity: 10 },
);
// Returns: true (8 <= 10)

// Mixed form: expression <= literal
apply({ $lte: [{ $get: "napTime" }, 120] }, { napTime: 90 });
// Returns: true (90 <= 120)
```

## $map

Transforms each item in an array using an expression.

```javascript
// Get all children's ages
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 3 },
];
apply({ $map: { $get: "age" } }, children);
// Returns: [4, 5, 3]

// Transform to different output structure
apply({
  $map: {
    nombre: { $get: "name" },
    ageInMonths: { $multiply: [{ $get: "age" }, 12] },
  },
});
```

## $matches

Tests if an object matches **all** specified property conditions (AND logic). Supports literal values, expressions, and $literal-wrapped values for flexible matching.

```javascript
// Check if child meets multiple criteria
const child = {
  name: "Aria",
  age: 5,
  active: true,
  activity: { $get: "current" },
};
apply(
  {
    $matches: {
      age: { $gte: 4 }, // match on an expression
      active: true, // match on a literal value
      activity: { $literal: { $get: "current" } }, // match the literal object (not as expression)
    },
  },
  child,
);
// Returns: true (all conditions match)
```

## $matchesAny

Tests if an object matches **at least one** specified property condition (OR logic). Supports literal values, expressions, and $literal-wrapped values for flexible matching.

```javascript
// Check if child meets any of the criteria for special activity
const child = {
  name: "Kai",
  age: 3,
  hasSpecialNeeds: false,
  isPremium: true,
};
apply(
  {
    $matchesAny: {
      age: { $gte: 5 }, // doesn't match (age is 3)
      hasSpecialNeeds: true, // doesn't match (false)
      isPremium: true, // matches!
    },
  },
  child,
);
// Returns: true (at least one condition matches)

// All conditions fail
apply(
  {
    $matchesAny: {
      age: { $gte: 5 }, // doesn't match
      hasSpecialNeeds: true, // doesn't match
    },
  },
  child,
);
// Returns: false (no conditions match)
```

## $matchesRegex

Tests if string matches a regular expression with support for PCRE-style inline flags.

**Supported flags:**

- `i`: Case insensitive matching
- `m`: Multiline mode (^ and $ match line boundaries)
- `s`: Single-line mode (. matches newlines)

**Flag syntax:**
Use `(?flags)` at the beginning of your pattern to set flags.

```javascript
// Basic pattern matching
apply({ $matchesRegex: "^\\d{3}-\\d{3}-\\d{4}$" }, "555-123-4567");
// Returns: true

// Case insensitive matching
apply({ $matchesRegex: "(?i)^hello" }, "HELLO world");
// Returns: true

// Multiple flags combined
apply({ $matchesRegex: "(?ims)test.*end" }, "TEST\nSOMETHING\nEND");
// Returns: true

// Multiline flag - match line boundaries
apply({ $matchesRegex: "(?m)^line" }, "first\nline two");
// Returns: true
```

## $max

Returns the maximum value in an array. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Find maximum in input data array
const ages = [3, 5, 4, 6, 2];
apply({ $max: null }, ages);
// Returns: 6

// Find maximum in operand array
apply({ $max: [10, 25, 15, 30] }, null);
// Returns: 30

// Find maximum from expression result
const data = { temperatures: [68, 72, 75, 73, 70] };
apply({ $max: { $get: "temperatures" } }, data);
// Returns: 75
```

## $mean

Calculates the arithmetic mean (average) of array values. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Calculate mean of input data array
const napTimes = [45, 60, 30, 75, 50]; // minutes
apply({ $mean: null }, napTimes);
// Returns: 52

// Calculate mean of operand array
apply({ $mean: [10, 20, 30] }, null);
// Returns: 20

// Calculate mean from expression result
const data = { scores: [88, 92, 95, 87] };
apply({ $mean: { $get: "scores" } }, data);
// Returns: 90.5
```

## $merge

Merges an object into the input object, with the merge object properties overriding input object properties.

```javascript
// Merge child info with updates
const child = { name: "Aria", age: 4, group: "Butterflies" };
apply({ $merge: { age: 5, present: true } }, child);
// Returns: { name: "Aria", age: 5, group: "Butterflies", present: true }
```

## $min

Returns the minimum value in an array. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Find minimum in input data array
const ages = [3, 5, 4, 6, 2];
apply({ $min: null }, ages);
// Returns: 2

// Find minimum in operand array
apply({ $min: [10, 25, 15, 30] }, null);
// Returns: 10

// Find minimum from expression result
const data = { temperatures: [68, 72, 75, 73, 70] };
apply({ $min: { $get: "temperatures" } }, data);
// Returns: 68
```

## $minute

Extracts the minute from a date (0-59).

```javascript
// Extract minute from date
apply({ $minute: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 23
```

## $month

Extracts the month from a date (1-12, 1-indexed).

```javascript
// Extract month from date
apply({ $month: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 10

// January returns 1
apply({ $month: "2025-01-05T15:23:45.234Z" }, null);
// Returns: 1

// December returns 12
apply({ $month: "2025-12-05T15:23:45.234Z" }, null);
// Returns: 12
```

## $modulo

Performs modulo (remainder) operation.

```javascript
// Single operand: modulo input data
apply({ $modulo: 2 }, 6);
// Returns: 0 (6 % 2, even number)

// Array form: modulo two expressions
apply(
  { $modulo: [{ $get: "total" }, { $get: "groups" }] },
  { total: 13, groups: 4 },
);
// Returns: 1 (13 % 4)

// Mixed form: expression % literal
apply({ $modulo: [{ $get: "childCount" }, 3] }, { childCount: 10 });
// Returns: 1 (10 % 3)
```

## $multiply

Performs multiplication operation.

```javascript
// Single operand: multiply input data
apply({ $multiply: 4 }, 3.5);
// Returns: 14.00 (3.5 * 4)

// Array form: multiply two expressions
apply(
  { $multiply: [{ $get: "price" }, { $get: "quantity" }] },
  { price: 2.5, quantity: 6 },
);
// Returns: 15.0 (2.5 * 6)

// Mixed form: expression * literal
apply({ $multiply: [{ $get: "hours" }, 8] }, { hours: 5 });
// Returns: 40 (5 * 8)
```

## $ne

Tests inequality using deep comparison. JSON has no notion of `undefined`, which means that `undefined` and `null` will be treated as equal when using `$ne`.

```javascript
// Single operand: compare input data
apply({ $ne: "reading" }, "playing");
// Returns: true ("playing" !== "reading")

// Array form: compare two expressions
apply(
  { $ne: [{ $get: "current" }, { $get: "previous" }] },
  { current: "art", previous: "music" },
);
// Returns: true ("art" !== "music")

// Mixed form: expression !== literal
apply({ $ne: [{ $get: "mood" }, "upset"] }, { mood: "happy" });
// Returns: true ("happy" !== "upset")
```

## $nin

Tests if value does not exist in an array.

```javascript
// Check if child doesn't have common allergies
const commonAllergies = ["nuts", "dairy", "eggs"];
apply({ $nin: commonAllergies }, "gluten");
// Returns: true
```

## $not

Logical NOT - inverts the truthiness of an expression.

```javascript
// Check if child is not sleeping
apply({ $not: { $get: "isNapping" } }, { isNapping: false });
// Returns: true
```

## $or

Logical OR - returns true if at least one expression is truthy.

```javascript
// Check if child can participate in activity
const child = { hasPermission: false, isEmergencyApproved: true };
apply(
  {
    $or: [{ $get: "hasPermission" }, { $get: "isEmergencyApproved" }],
  },
  child,
);
// Returns: true
```

## $omit

Returns a new object excluding the specified properties.

```javascript
// Remove sensitive data from child record
const child = {
  name: "Aria",
  age: 4,
  ssn: "123-45-6789",
  group: "Butterflies",
};
apply({ $omit: ["ssn"] }, child);
// Returns: { name: "Aria", age: 4, group: "Butterflies" }
```

## $pairs

Converts an object into an array of [key, value] pairs.

```javascript
// Convert child data to key-value pairs
const child = { name: "Zara", age: 4, group: "Butterflies" };
apply({ $pairs: null }, child);
// Returns: [["name", "Zara"], ["age", 4], ["group", "Butterflies"]]
```

## $parseDate

Parses a date string using a format pattern and returns an ISO 8601 string.

```javascript
// Array form: parse with format
apply({ $parseDate: ["10/05/2025", "MM/dd/yyyy"] }, null);
// Returns: "2025-10-05T00:00:00.000Z" (or with local timezone offset)

// Input data form
apply({ $parseDate: "MM/dd/yyyy" }, "10/05/2025");
// Returns: "2025-10-05T00:00:00.000Z" (or with local timezone offset)

// Validate ISO string without format
apply({ $parseDate: "2025-10-05T11:23:45.234Z" }, null);
// Returns: "2025-10-05T11:23:45.234Z"

// Parse date with time
apply({ $parseDate: ["10/05/2025 14:30:00", "MM/dd/yyyy HH:mm:ss"] }, null);
// Returns: ISO string with parsed time
```

## $pick

Returns a new object containing only the specified properties by name.

```javascript
// Extract only essential child info
const child = {
  name: "Aria",
  age: 4,
  ssn: "123-45-6789",
  group: "Butterflies",
  allergies: "none",
};
apply({ $pick: ["name", "age", "group"] }, child);
// Returns: { name: "Aria", age: 4, group: "Butterflies" }

// Works with nested property paths
const data = {
  child: { profile: { name: "Luna", age: 3 } },
  meta: { teacher: "Ms. Smith", room: "A" },
};
apply({ $pick: ["child.profile.name", "meta.teacher"] }, data);
// Returns: { "child.profile.name": "Luna", "meta.teacher": "Ms. Smith" }
```

**Note:** Use `$pick` to select properties by name. Use [`$select`](#select) to transform and rename properties.

## $pluck

Extracts a specific property from each object in an array (shorthand for $map + $get).

```javascript
// Get all children's names
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 3 },
];
apply({ $pluck: "name" }, children);
// Returns: ["Aria", "Kai", "Zara"]
```

## $pipe

Pipes data through multiple expressions in sequence (left-to-right), starting with the input data then feeding the result of one expression to the next returning the result of the last expression.

```javascript
// Process children data through multiple steps
const daycareData = {
  children: [
    { name: "Aria", age: 4, present: true },
    { name: "Kai", age: 5, present: true },
    { name: "Zara", age: 3, present: false },
  ],
};
apply(
  {
    $pipe: [
      { $get: "children" },
      { $filter: { $get: "present" } },
      { $map: { $get: "name" } },
      { $join: ", " },
    ],
  },
  daycareData,
);
// Returns: "Aria, Kai"
```

## $pow

Performs power/exponentiation operation.

```javascript
// Single operand: raise input data to power
apply({ $pow: 2 }, 8); // 8 squared
// Returns: 64 (8^2)

// Array form: power of two expressions
apply(
  { $pow: [{ $get: "base" }, { $get: "exponent" }] },
  { base: 3, exponent: 4 },
);
// Returns: 81 (3^4)

// Mixed form: expression ^ literal
apply({ $pow: [{ $get: "side" }, 2] }, { side: 5 });
// Returns: 25 (5^2)
```

## $replace

Replaces occurrences of a pattern in a string.

```javascript
// Clean up child's name input
apply({ $replace: ["\\s+", " "] }, "Amara   Rodriguez");
// Returns: "Amara Rodriguez"
```

## $reverse

Returns array with elements in reverse order.

```javascript
// Reverse pickup order for dismissal
const pickupOrder = ["Aria", "Chen", "Diego", "Luna"];
apply({ $reverse: null }, pickupOrder);
// Returns: ["Luna", "Diego", "Chen", "Aria"]
```

## $skip

Skips first N elements of an array.

```javascript
// Skip first two children in line
const lineup = ["Aria", "Chen", "Diego", "Luna", "Kai"];
apply({ $skip: 2 }, lineup);
// Returns: ["Diego", "Luna", "Kai"]
```

## $select

Creates a new object by selecting and transforming properties with custom key names.

```javascript
// Select and transform child data
const child = {
  name: "Aria",
  age: 4,
  birthDate: "2020-03-15",
  group: "Butterflies",
};
apply(
  {
    $select: {
      childName: { $get: "name" },
      ageInMonths: { $pipe: [{ $get: "age" }, { $multiply: 12 }] },
      group: { $get: "group" },
    },
  },
  child,
);
// Returns: { childName: "Aria", ageInMonths: 48, group: "Butterflies" }
```

**Note:** To select properties by name without transformation, use [`$pick`](#pick) instead.

## $second

Extracts the second from a date (0-59).

```javascript
// Extract second from date
apply({ $second: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 45
```

## $sort

Sorts an array based on specified criteria.

```javascript
// Sort children by age
const children = [
  { name: "Zara", age: 3 },
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
];
apply({ $sort: { by: "age" } }, children);
// Returns: [{ name: "Zara", age: 3 }, { name: "Aria", age: 4 }, { name: "Kai", age: 5 }]

// Sort descending by name
apply({ $sort: { by: "name", desc: true } }, children);
// Returns: [{ name: "Zara", age: 3 }, { name: "Kai", age: 5 }, { name: "Aria", age: 4 }]

// Sort by expression - calculated age in months
apply({ $sort: { by: { $multiply: [{ $get: "age" }, 12] } } }, children);
// Returns: [{ name: "Zara", age: 3 }, { name: "Aria", age: 4 }, { name: "Kai", age: 5 }]
```

**Note:** The `by` field can be a property name (string) or an expression that computes the sort value.

## $split

Splits a string into an array using a separator.

```javascript
// Split child's full name
apply({ $split: " " }, "Amara Devika Rodriguez");
// Returns: ["Amara", "Devika", "Rodriguez"]
```

## $startOfDay

Returns the start of day (00:00:00.000) for a given date.

```javascript
// Get start of day
apply({ $startOfDay: "2025-10-05T15:23:45.234Z" }, null);
// Returns: "2025-10-05T00:00:00.000Z"

// Works with input data form
apply({ $startOfDay: null }, "2025-10-05T15:23:45.234Z");
// Returns: "2025-10-05T00:00:00.000Z"
```

## $startOfMonth

Returns the first moment of the month for a given date.

```javascript
// Get start of month
apply({ $startOfMonth: "2025-10-15T15:23:45.234Z" }, null);
// Returns: "2025-10-01T00:00:00.000Z"
```

## $startOfYear

Returns the first moment of the year for a given date.

```javascript
// Get start of year
apply({ $startOfYear: "2025-10-15T15:23:45.234Z" }, null);
// Returns: "2025-01-01T00:00:00.000Z"
```

## $sqrt

Calculates the square root of a number.

```javascript
// Calculate side length of square play area
apply({ $sqrt: null }, 64);
// Returns: 8
```

## $substring

Extracts a portion of a string.

```javascript
// Get child's initials from name
apply({ $substring: [0, 1] }, "Amara");
// Returns: "A"
```

## $subtract

Performs subtraction operation.

```javascript
// Single operand: subtract from input data
apply({ $subtract: 15.5 }, 25.0);
// Returns: 9.50 (25.0 - 15.5)

// Array form: subtract two expressions
apply(
  { $subtract: [{ $get: "total" }, { $get: "discount" }] },
  { total: 20, discount: 3 },
);
// Returns: 17 (20 - 3)

// Mixed form: expression - literal
apply({ $subtract: [{ $get: "age" }, 2] }, { age: 6 });
// Returns: 4 (6 - 2)
```

## $subDays

Subtracts a specified number of days from a date.

```javascript
// Array form: subtract days from date
apply({ $subDays: ["2025-10-12T00:00:00.000Z", 7] }, null);
// Returns: "2025-10-05T00:00:00.000Z"

// Input data form: subtract days from input date
apply({ $subDays: 7 }, "2025-10-12T00:00:00.000Z");
// Returns: "2025-10-05T00:00:00.000Z"

// Handles month boundaries
apply({ $subDays: ["2025-11-01T00:00:00.000Z", 1] }, null);
// Returns: "2025-10-31T00:00:00.000Z"
```

## $subMonths

Subtracts a specified number of months from a date.

```javascript
// Array form: subtract months from date
apply({ $subMonths: ["2026-01-05T00:00:00.000Z", 3] }, null);
// Returns: "2025-10-05T00:00:00.000Z"

// Handles year boundaries
apply({ $subMonths: ["2026-02-15T00:00:00.000Z", 2] }, null);
// Returns: "2025-12-15T00:00:00.000Z"
```

## $subYears

Subtracts a specified number of years from a date.

```javascript
// Array form: subtract years from date
apply({ $subYears: ["2030-10-05T00:00:00.000Z", 5] }, null);
// Returns: "2025-10-05T00:00:00.000Z"
```

## $sum

Calculates the sum of array values. Can operate on either the operand (if provided and resolves to an array) or the input data.

```javascript
// Calculate sum of input data array
const temperatures = [68, 72, 75, 73, 70];
apply({ $sum: null }, temperatures);
// Returns: 358

// Calculate sum of operand array
apply({ $sum: [10, 20, 30, 40] }, null);
// Returns: 100

// Calculate sum from expression result
const data = { dailySteps: [5000, 7500, 6000, 8000] };
apply({ $sum: { $get: "dailySteps" } }, data);
// Returns: 26500
```

## $take

Takes first N elements of an array.

```javascript
// Get first three children for small group activity
const allChildren = ["Aria", "Chen", "Diego", "Luna", "Kai"];
apply({ $take: 3 }, allChildren);
// Returns: ["Aria", "Chen", "Diego"]
```

## $trim

Removes whitespace from beginning and end of string.

```javascript
// Clean up child name input
apply({ $trim: null }, "  Amara Rodriguez  ");
// Returns: "Amara Rodriguez"
```

## $uppercase

Converts string to uppercase.

```javascript
// Format child's name for name tag
apply({ $uppercase: null }, "Amara");
// Returns: "AMARA"
```

## $unique

Returns an array with duplicate values removed.

```javascript
// Get unique dietary restrictions
const restrictions = [
  "none",
  "nut allergy",
  "none",
  "vegetarian",
  "nut allergy",
];
apply({ $unique: null }, restrictions);
// Returns: ["none", "nut allergy", "vegetarian"]
```

## $values

Returns an array of all property values from an object.

```javascript
// Get all values from child record
const child = { name: "Amara", age: 4, group: "Butterflies", present: true };
apply({ $values: null }, child);
// Returns: ["Amara", 4, "Butterflies", true]
```

## $year

Extracts the year from a date.

```javascript
// Extract year from date
apply({ $year: "2025-10-05T15:23:45.234Z" }, null);
// Returns: 2025

// Works with input data form
apply({ $year: null }, "2025-10-05T15:23:45.234Z");
// Returns: 2025
```
