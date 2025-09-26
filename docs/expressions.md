# JSON Expressions Reference

This document provides comprehensive documentation for all expressions available in the JSON Expressions library. Each expression is documented with both apply and evaluate forms, complete with examples using daycare/childcare themes.

JSON Expressions support two execution modes:

- **Apply form**: Expression operates on input data (e.g., `{ $gt: 18 }` tests if input > 18)
- **Evaluate form**: Expression is self-contained (e.g., `{ $gt: [25, 18] }` tests if 25 > 18)

## $abs

Returns the absolute value of a number.

**Apply Form:**

```javascript
// Test if child's temperature deviation is concerning
apply({ $abs: null }, -2.5);
// Returns: 2.5
```

**Evaluate Form:**

```javascript
// Calculate absolute temperature difference
evaluate({ $abs: -1.8 });
// Returns: 1.8
```

## $add

Performs addition of two numbers.

**Apply Form:**

```javascript
// Add bonus points to child's current score
apply({ $add: 5 }, 12);
// Returns: 17
```

**Evaluate Form:**

```javascript
// Calculate total meal cost
evaluate({ $add: [8.5, 4.25] });
// Returns: 12.75
```

## $all

Tests if all elements in an array satisfy a predicate expression.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Check if all children in array meet age requirement
evaluate({ $all: [{ $gte: 3 }, [3, 4, 5, 2]] });
// Returns: false (2 is less than 3)
```

## $and

Logical AND operation - returns true if all expressions are truthy.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Check multiple boolean conditions
evaluate({ $and: [true, true, false] });
// Returns: false
```

## $any

Tests if any element in an array satisfies a predicate expression.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Check if any age is below minimum
evaluate({ $any: [{ $lt: 3 }, [4, 5, 2, 6]] });
// Returns: true (2 is less than 3)
```

## $append

Appends an array to the end of the input array.

**Apply Form:**

```javascript
// Add new children to existing group
const currentGroup = ["Amara", "Kenji", "Sofia"];
apply({ $append: ["Nina", "Omar"] }, currentGroup);
// Returns: ["Amara", "Kenji", "Sofia", "Nina", "Omar"]
```

**Evaluate Form:**

```javascript
// Combine two arrays
evaluate({
  $append: [
    ["Amara", "Kenji"],
    ["Sofia", "Nina"],
  ],
});
// Returns: ["Amara", "Kenji", "Sofia", "Nina"]
```

## $between

Tests if a value is between two bounds (inclusive).

**Apply Form:**

```javascript
// Check if child's age is in preschool range
apply({ $between: { min: 3, max: 5 } }, 4);
// Returns: true
```

**Evaluate Form:**

```javascript
// Check if temperature is in comfortable range
evaluate({ $between: { value: 72, min: 68, max: 75 } });
// Returns: true
```

## $case

Unified conditional expression supporting both literal comparisons and boolean predicates.

The `$case` expression automatically determines how to handle each `when` clause:

- **Boolean predicate expressions** (`$gt`, `$eq`, `$and`, etc.) → Applied as predicates with the case value as input
- **All other values** → Evaluated and compared literally using deep equality

**Apply Form - Mixed literal and predicate conditions:**

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

**Apply Form - Status-based with mixed conditions:**

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
        { when: { $get: "fallbackStatus" }, then: "Custom activity" }, // Expression evaluated to literal
      ],
      default: "Free play",
    },
  },
  child,
);
// Returns: "High energy games"
```

**Evaluate Form:**

```javascript
// Static conditional logic with mixed condition types
evaluate({
  $case: {
    value: 4,
    cases: [
      { when: 2, then: "Toddler activities" }, // Literal comparison: 4 === 2? No
      { when: { $gt: 3 }, then: "Preschool activities" }, // Boolean predicate: 4 > 3? Yes!
      { when: { $eq: 4 }, then: "Age four activities" }, // Would match but already found one
    ],
    default: "Mixed age activities",
  },
});
// Returns: "Preschool activities"
```

## $coalesce

Returns the first non-null value from an array.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Find first non-null value
evaluate({ $coalesce: [null, undefined, "Daycare Center", "Backup Name"] });
// Returns: "Daycare Center"
```

## $concat

Concatenates multiple arrays together.

**Apply Form:**

```javascript
// Combine current children with new arrivals
const currentChildren = ["Aria", "Kai"];
apply({ $concat: [["Zara"], ["Luna", "Diego"]] }, currentChildren);
// Returns: ["Aria", "Kai", "Zara", "Luna", "Diego"]
```

**Evaluate Form:**

```javascript
// Combine multiple groups
evaluate({
  $concat: [["Morning group"], ["Afternoon group"], ["Extended care"]],
});
// Returns: ["Morning group", "Afternoon group", "Extended care"]
```

## $count

Returns the count of items in an array.

**Apply Form:**

```javascript
// Count number of children in group
const children = ["Amara", "Chen", "Fatima", "Kai"];
apply({ $count: null }, children);
// Returns: 4
```

**Evaluate Form:**

```javascript
// Count items in static array
evaluate({ $count: ["apple", "banana", "crackers", "juice"] });
// Returns: 4
```

## $debug

Logs a value to console and returns it unchanged (useful for debugging pipelines).

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Debug static value
evaluate({ $debug: "Current meal time: lunch" });
// Logs: "Current meal time: lunch"
// Returns: "Current meal time: lunch"
```

## $default

Returns a default value if the expression result is null or undefined.

**Apply Form:**

```javascript
// Provide default pickup time if not specified
const child = { name: "Amara", pickupTime: null };
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
```

**Evaluate Form:**

```javascript
// Use default value for missing data
evaluate({
  $default: {
    expression: null,
    default: "No data available",
  },
});
// Returns: "No data available"
```

## $divide

Performs division operation.

**Apply Form:**

```javascript
// Calculate per-child snack cost
apply({ $divide: 4 }, 20.0);
// Returns: 5.00
```

**Evaluate Form:**

```javascript
// Calculate cost per child
evaluate({ $divide: [24.0, 6] });
// Returns: 4.00
```

## $eq

Tests equality using deep comparison.

**Apply Form:**

```javascript
// Check if child's current activity matches target
apply({ $eq: "reading" }, "reading");
// Returns: true
```

**Evaluate Form:**

```javascript
// Compare two values
evaluate({ $eq: ["storytime", "storytime"] });
// Returns: true
```

## $exists

Tests if a property or path exists in an object, regardless of its value. Different from $isPresent - this checks existence, not meaningfulness.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Test property existence in provided object
evaluate({ $exists: { object: { name: "Chen" }, path: "name" } });
// Returns: true

evaluate({ $exists: { object: {}, path: "missing" } });
// Returns: false

// Works with nested paths
evaluate({
  $exists: {
    object: { daycare: { rooms: { toddler: "Room A" } } },
    path: "daycare.rooms.toddler",
  },
});
// Returns: true
```

## $filter

Filters array items based on a condition.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Filter numbers greater than threshold
evaluate({ $filter: [{ $gt: 3 }, [2, 4, 1, 5, 3, 6]] });
// Returns: [4, 5, 6]
```

## $filterBy

Filters arrays by object property conditions (shorthand for $filter + $matches).

**Apply Form:**

```javascript
// Find active children ready for kindergarten
const children = [
  { name: "Aria", age: 4, active: true },
  { name: "Kai", age: 5, active: true },
  { name: "Zara", age: 3, active: false },
  { name: "Leo", age: 6, active: true },
];
apply({ $filterBy: { age: { $gte: 5 }, active: { $eq: true } } }, children);
// Returns: [{ name: "Kai", age: 5, active: true }, { name: "Leo", age: 6, active: true }]
```

**Evaluate Form:**

```javascript
// Filter students by multiple criteria
evaluate({
  $filterBy: [
    [
      { name: "Alice", score: 85, grade: "A" },
      { name: "Bob", score: 65, grade: "C" },
      { name: "Carol", score: 95, grade: "A" },
    ],
    { score: { $gte: 80 }, grade: { $eq: "A" } },
  ],
});
// Returns: [{ name: "Alice", score: 85, grade: "A" }, { name: "Carol", score: 95, grade: "A" }]
```

## $find

Returns the first element that satisfies a predicate.

**Apply Form:**

```javascript
// Find first child ready for kindergarten
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 6 },
];
apply({ $find: { $pipe: [{ $get: "age" }, { $gte: 5 }] } }, children);
// Returns: { name: "Kai", age: 5 }
```

**Evaluate Form:**

```javascript
// Find first number greater than threshold
evaluate({ $find: [{ $gt: 10 }, [5, 8, 12, 15, 3]] });
// Returns: 12
```

## $first

Returns the first item in an array.

**Apply Form:**

```javascript
// Get first child in lineup
const lineup = ["Chen", "Fatima", "Diego", "Luna"];
apply({ $first: null }, lineup);
// Returns: "Chen"
```

**Evaluate Form:**

```javascript
// Get first item from array
evaluate({ $first: ["Monday", "Tuesday", "Wednesday"] });
// Returns: "Monday"
```

## $fromPairs

Converts an array of [key, value] pairs into an object.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Create object from key-value pairs
evaluate({
  $fromPairs: [
    ["room", "A"],
    ["capacity", 20],
    ["teacher", "Ms. Chen"],
  ],
});
// Returns: { room: "A", capacity: 20, teacher: "Ms. Chen" }
```

## $flatMap

Maps and flattens array items.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Flatten mapped results
evaluate({ $flatMap: [{ $split: "," }, ["a,b", "c,d", "e"]] });
// Returns: ["a", "b", "c", "d", "e"]
```

## $flatten

Flattens nested arrays by one level by default, with optional depth control.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Flatten array operand
evaluate({ $flatten: [["a", "b"], ["c", ["d", "e"]], "f"] });
// Returns: ["a", "b", "c", ["d", "e"], "f"]

// Flatten with specific depth
evaluate({ $flatten: { array: [["a", ["b", "c"]], ["d"]], depth: 2 } });
// Returns: ["a", "b", "c", "d"]
```

## $get

Retrieves a value from data using dot notation paths.

**Apply Form:**

```javascript
// Get child's name with default
const child = { info: { name: "Amara", age: 4 } };
apply({ $get: { path: "info.name", default: "Unknown" } }, child);
// Returns: "Amara"

// Simple path access
apply({ $get: "info.age" }, child);
// Returns: 4
```

**Evaluate Form:**

```javascript
// Get property from provided object
const daycare = { name: "Sunshine Daycare", capacity: 24 };
evaluate({ $get: { object: daycare, path: "capacity" } });
// Returns: 24
```

## $groupBy

Groups array elements by a specified key or expression result.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Group items by property
evaluate({
  $groupBy: [
    [
      { type: "fruit", name: "apple" },
      { type: "vegetable", name: "carrot" },
      { type: "fruit", name: "banana" },
    ],
    { $get: "type" },
  ],
});
// Returns: {
//   "fruit": [{ type: "fruit", name: "apple" }, { type: "fruit", name: "banana" }],
//   "vegetable": [{ type: "vegetable", name: "carrot" }]
// }
```

## $gt

Tests if value is greater than operand.

**Apply Form:**

```javascript
// Check if child is old enough for advanced activities
apply({ $gt: 4 }, 5);
// Returns: true
```

**Evaluate Form:**

```javascript
// Compare two values
evaluate({ $gt: [6, 4] });
// Returns: true
```

## $gte

Tests if value is greater than or equal to operand.

**Apply Form:**

```javascript
// Check minimum age requirement
apply({ $gte: 3 }, 3);
// Returns: true
```

**Evaluate Form:**

```javascript
// Compare values for minimum threshold
evaluate({ $gte: [4, 4] });
// Returns: true
```

## $if

Conditional expression that evaluates different branches based on a condition.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Simple conditional logic
evaluate({
  $if: {
    if: { $gt: [75, 70] },
    then: "Air conditioning on",
    else: "Normal temperature",
  },
});
// Returns: "Air conditioning on"
```

## $identity

Returns input data unchanged in apply mode, or evaluates/returns the operand in evaluate mode. This is useful as an identity function in pipelines or when you need to pass through values. `$identity` will evaluate nested expressions except for literals, which will be preserved.

**Apply Form:**

```javascript
// Return child data unchanged (identity function)
const childData = { name: "Chen", age: 4 };
apply({ $identity: null }, childData);
// Returns: { name: "Chen", age: 4 }

// Operand is ignored in apply mode
apply({ $identity: "ignored" }, "hello");
// Returns: "hello"

// Input data can be addressed with $identity
apply({ $if: { if: { $identity: null }, then: "yes", else: "no" } }, true);
// Returns: "yes"
```

**Evaluate Form:**

```javascript
// Return the operand as-is for literals
evaluate({ $identity: "Preschool Room A" });
// Returns: "Preschool Room A"

// Evaluate expressions in the operand
evaluate({ $identity: { $add: [2, 3] } });
// Returns: 5

// Return literal objects unchanged
evaluate({ $identity: { name: "Amara", age: 5 } });
// Returns: { name: "Amara", age: 5 }
```

## $in

Tests if value exists in an array.

**Apply Form:**

```javascript
// Check if child's dietary need is in available options
const availableOptions = ["vegetarian", "gluten-free", "dairy-free"];
apply({ $in: availableOptions }, "vegetarian");
// Returns: true
```

**Evaluate Form:**

```javascript
// Check if value is in array
evaluate({ $in: [["apple", "banana", "orange"], "banana"] });
// Returns: true
```

## $isEmpty

Tests if a value is empty or absent (null or undefined). The semantic inverse of $isPresent.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Test if value is empty/absent
evaluate({ $isEmpty: null });
// Returns: true

evaluate({ $isEmpty: "some value" });
// Returns: false
```

## $isPresent

Tests if a value is meaningful (not null or undefined). Provides cross-language clarity about value presence.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Test if value is meaningful
evaluate({ $isPresent: "some value" });
// Returns: true

evaluate({ $isPresent: null });
// Returns: false

evaluate({ $isPresent: undefined });
// Returns: false
```

## $join

Joins array elements into a string with a separator. **Note:** This is intended to join arrays of string values. Attempting to join values of other types may behave differently across different runtimes. Consider overriding this expression if you have use cases more complex than joining arrays of strings.

**Apply Form:**

```javascript
// Create list of children's names
const names = ["Aria", "Chen", "Diego", "Luna"];
apply({ $join: ", " }, names);
// Returns: "Aria, Chen, Diego, Luna"
```

**Evaluate Form:**

```javascript
// Join array with separator
evaluate({ $join: [" | ", ["Morning", "Afternoon", "Evening"]] });
// Returns: "Morning | Afternoon | Evening"
```

## $keys

Returns an array of all property names from an object.

**Apply Form:**

```javascript
// Get all field names from child record
const child = { name: "Amara", age: 4, group: "Butterflies", present: true };
apply({ $keys: null }, child);
// Returns: ["name", "age", "group", "present"]
```

**Evaluate Form:**

```javascript
// Extract object keys
evaluate({ $keys: { room: "A", capacity: 20, teacher: "Ms. Chen" } });
// Returns: ["room", "capacity", "teacher"]
```

## $last

Returns the last item in an array.

**Apply Form:**

```javascript
// Get last child picked up
const pickupOrder = ["Kai", "Zara", "Amara", "Chen"];
apply({ $last: null }, pickupOrder);
// Returns: "Chen"
```

**Evaluate Form:**

```javascript
// Get last item from array
evaluate({ $last: ["breakfast", "snack", "lunch", "dinner"] });
// Returns: "dinner"
```

## $literal

Returns a literal value (useful when you need to pass values that look like expressions). **This expression cannot be excluded or overridden.**

**Apply Form:**

```javascript
// Return exact object structure
apply({ $literal: { $special: "not an expression" } }, anyInput);
// Returns: { $special: "not an expression" }
```

**Evaluate Form:**

```javascript
// Return literal value
evaluate({ $literal: { $get: "this looks like an expression but isn't" } });
// Returns: { $get: "this looks like an expression but isn't" }
```

## $lowercase

Converts string to lowercase.

**Apply Form:**

```javascript
// Normalize child's name input
apply({ $lowercase: null }, "AMARA");
// Returns: "amara"
```

**Evaluate Form:**

```javascript
// Convert to lowercase
evaluate({ $lowercase: "SUNSHINE DAYCARE" });
// Returns: "sunshine daycare"
```

## $lt

Tests if value is less than operand.

**Apply Form:**

```javascript
// Check if child needs booster seat
apply({ $lt: 4 }, 3);
// Returns: true
```

**Evaluate Form:**

```javascript
// Compare two values
evaluate({ $lt: [3, 5] });
// Returns: true
```

## $lte

Tests if value is less than or equal to operand.

**Apply Form:**

```javascript
// Check maximum group size
apply({ $lte: 6 }, 6);
// Returns: true
```

**Evaluate Form:**

```javascript
// Test less than or equal
evaluate({ $lte: [4, 6] });
// Returns: true
```

## $map

Transforms each item in an array using an expression.

**Apply Form:**

```javascript
// Get all children's ages
const children = [
  { name: "Aria", age: 4 },
  { name: "Kai", age: 5 },
  { name: "Zara", age: 3 },
];
apply({ $map: { $get: "age" } }, children);
// Returns: [4, 5, 3]
```

**Evaluate Form:**

```javascript
// Transform array items
evaluate({ $map: [{ $multiply: 2 }, [1, 2, 3, 4]] });
// Returns: [2, 4, 6, 8]
```

## $matches

Tests if an object matches all specified property conditions. Supports literal values, expressions, and $literal-wrapped values for flexible matching.

**Apply Form:**

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
// Returns: true
```

**Evaluate Form:**

```javascript
// Test object against conditions
evaluate({
  $matches: {
    data: { name: "Chen", age: 3, status: "active" },
    conditions: { age: { $gte: 3 }, status: { $eq: "active" } },
  },
});
// Returns: true
```

## $matchesRegex

Tests if string matches a regular expression.

**Apply Form:**

```javascript
// Validate phone number format
apply({ $matchesRegex: "^\\d{3}-\\d{3}-\\d{4}$" }, "555-123-4567");
// Returns: true
```

**Evaluate Form:**

```javascript
// Regex pattern matching
evaluate({ $matchesRegex: ["(?i)^child", "Child Development Center"] });
// Returns: true
```

## $max

Returns the maximum value in an array.

**Apply Form:**

```javascript
// Find oldest child's age
const ages = [3, 5, 4, 6, 2];
apply({ $max: null }, ages);
// Returns: 6
```

**Evaluate Form:**

```javascript
// Find maximum value
evaluate({ $max: [8, 12, 6, 15, 9] });
// Returns: 15
```

## $mean

Calculates the arithmetic mean (average) of array values.

**Apply Form:**

```javascript
// Calculate average nap duration
const napTimes = [45, 60, 30, 75, 50]; // minutes
apply({ $mean: null }, napTimes);
// Returns: 52
```

**Evaluate Form:**

```javascript
// Calculate average
evaluate({ $mean: [85, 92, 78, 94, 88] });
// Returns: 87.4
```

## $merge

Merges multiple objects into a single object.

**Apply Form:**

```javascript
// Merge child info with additional data
const baseInfo = { name: "Aria", age: 4 };
apply({ $merge: [{ group: "Butterflies" }, { present: true }] }, baseInfo);
// Returns: { name: "Aria", age: 4, group: "Butterflies", present: true }
```

**Evaluate Form:**

```javascript
// Combine multiple objects
evaluate({
  $merge: [{ room: "A" }, { capacity: 20 }, { teacher: "Ms. Chen" }],
});
// Returns: { room: "A", capacity: 20, teacher: "Ms. Chen" }
```

## $min

Returns the minimum value in an array.

**Apply Form:**

```javascript
// Find youngest child's age
const ages = [3, 5, 4, 6, 2];
apply({ $min: null }, ages);
// Returns: 2
```

**Evaluate Form:**

```javascript
// Find minimum value
evaluate({ $min: [8, 12, 6, 15, 9] });
// Returns: 6
```

## $modulo

Performs modulo (remainder) operation.

**Apply Form:**

```javascript
// Check if child count is even for pairing activities
apply({ $modulo: 2 }, 6);
// Returns: 0 (even number)
```

**Evaluate Form:**

```javascript
// Calculate remainder
evaluate({ $modulo: [17, 5] });
// Returns: 2
```

## $multiply

Performs multiplication operation.

**Apply Form:**

```javascript
// Calculate total snack cost for multiple children
apply({ $multiply: 4 }, 3.5);
// Returns: 14.00
```

**Evaluate Form:**

```javascript
// Multiply two numbers
evaluate({ $multiply: [6, 8] });
// Returns: 48
```

## $ne

Tests inequality using deep comparison.

**Apply Form:**

```javascript
// Check if child's current activity is different from scheduled
apply({ $ne: "reading" }, "playing");
// Returns: true
```

**Evaluate Form:**

```javascript
// Test not equal
evaluate({ $ne: ["morning", "afternoon"] });
// Returns: true
```

## $nin

Tests if value does not exist in an array.

**Apply Form:**

```javascript
// Check if child doesn't have common allergies
const commonAllergies = ["nuts", "dairy", "eggs"];
apply({ $nin: commonAllergies }, "gluten");
// Returns: true
```

**Evaluate Form:**

```javascript
// Check if value not in array
evaluate({ $nin: [["red", "blue", "green"], "yellow"] });
// Returns: true
```

## $not

Logical NOT - inverts the truthiness of an expression.

**Apply Form:**

```javascript
// Check if child is not sleeping
apply({ $not: { $get: "isNapping" } }, { isNapping: false });
// Returns: true
```

**Evaluate Form:**

```javascript
// Invert boolean value
evaluate({ $not: false });
// Returns: true
```

## $or

Logical OR - returns true if at least one expression is truthy.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Test multiple conditions
evaluate({ $or: [false, false, true] });
// Returns: true
```

## $omit

Returns a new object excluding the specified properties.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Exclude multiple properties
evaluate({
  $omit: {
    object: {
      id: 1,
      name: "Chen",
      password: "secret",
      email: "chen@daycare.com",
    },
    properties: ["password", "id"],
  },
});
// Returns: { name: "Chen", email: "chen@daycare.com" }
```

## $pairs

Converts an object into an array of [key, value] pairs.

**Apply Form:**

```javascript
// Convert child data to key-value pairs
const child = { name: "Zara", age: 4, group: "Butterflies" };
apply({ $pairs: null }, child);
// Returns: [["name", "Zara"], ["age", 4], ["group", "Butterflies"]]
```

**Evaluate Form:**

```javascript
// Extract object entries
evaluate({ $pairs: { room: "A", capacity: 20, teacher: "Ms. Chen" } });
// Returns: [["room", "A"], ["capacity", 20], ["teacher", "Ms. Chen"]]
```

## $pick

Returns a new object containing only the specified properties.

**Apply Form:**

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
```

**Evaluate Form:**

```javascript
// Select specific properties
evaluate({
  $pick: {
    object: {
      id: 1,
      name: "Chen",
      password: "secret",
      email: "chen@daycare.com",
    },
    properties: ["name", "email"],
  },
});
// Returns: { name: "Chen", email: "chen@daycare.com" }
```

## $pluck

Extracts a specific property from each object in an array (shorthand for $map + $get).

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Extract property from array of objects
evaluate({
  $pluck: [
    [
      { room: "A", teacher: "Ms. Chen" },
      { room: "B", teacher: "Mr. Ali" },
    ],
    "teacher",
  ],
});
// Returns: ["Ms. Chen", "Mr. Ali"]
```

## $pipe

Pipes data through multiple expressions in sequence (left-to-right).

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Chain operations on static data
evaluate([
  {
    $pipe: [
      { $filter: { $gte: 4 } },
      { $map: { $multiply: 2 } },
      { $sum: null },
    ],
  },
  [2, 4, 6, 8, 1],
]);
// Returns: 36 (filters [4,6,8], maps to [8,12,16], sums to 36)
```

## $pow

Performs power/exponentiation operation.

**Apply Form:**

```javascript
// Calculate area of square play area
apply({ $pow: 2 }, 8); // 8 squared
// Returns: 64
```

**Evaluate Form:**

```javascript
// Calculate power
evaluate({ $pow: [3, 4] }); // 3 to the 4th power
// Returns: 81
```

## $prepend

Prepends an array to the beginning of the input array.

**Apply Form:**

```javascript
// Add priority children to beginning of list
const regularChildren = ["Chen", "Diego"];
apply({ $prepend: ["Aria", "Kai"] }, regularChildren);
// Returns: ["Aria", "Kai", "Chen", "Diego"]
```

**Evaluate Form:**

```javascript
// Prepend to array
evaluate({
  $prepend: [
    ["First", "Second"],
    ["Third", "Fourth"],
  ],
});
// Returns: ["First", "Second", "Third", "Fourth"]
```

## $prop

Retrieves a property from an object using a dynamic property name.

**Apply Form:**

```javascript
// Get property using variable name
const child = { name: "Amara", age: 4, group: "Butterflies" };
apply({ $prop: "group" }, child);
// Returns: "Butterflies"
```

**Evaluate Form:**

```javascript
// Access object property dynamically
const daycare = { morning: 12, afternoon: 8, evening: 4 };
evaluate({ $prop: [daycare, "afternoon"] });
// Returns: 8
```

## $replace

Replaces occurrences of a pattern in a string.

**Apply Form:**

```javascript
// Clean up child's name input
apply({ $replace: ["\\s+", " "] }, "Amara   Chen");
// Returns: "Amara Chen"
```

**Evaluate Form:**

```javascript
// Replace text in string
evaluate({ $replace: ["Sunshine Daycare", "Center", "Academy"] });
// Returns: "Sunshine Academy"
```

## $reverse

Returns array with elements in reverse order.

**Apply Form:**

```javascript
// Reverse pickup order for dismissal
const pickupOrder = ["Aria", "Chen", "Diego", "Luna"];
apply({ $reverse: null }, pickupOrder);
// Returns: ["Luna", "Diego", "Chen", "Aria"]
```

**Evaluate Form:**

```javascript
// Reverse array elements
evaluate({ $reverse: [1, 2, 3, 4, 5] });
// Returns: [5, 4, 3, 2, 1]
```

## $skip

Skips first N elements of an array.

**Apply Form:**

```javascript
// Skip first two children in line
const lineup = ["Aria", "Chen", "Diego", "Luna", "Kai"];
apply({ $skip: 2 }, lineup);
// Returns: ["Diego", "Luna", "Kai"]
```

**Evaluate Form:**

```javascript
// Skip elements from beginning
evaluate({ $skip: [3, ["Mon", "Tue", "Wed", "Thu", "Fri"]] });
// Returns: ["Thu", "Fri"]
```

## $select

Creates a new object by selecting and optionally transforming properties.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Transform object structure
evaluate({
  $select: {
    object: { firstName: "Chen", lastName: "Li", age: 5 },
    selection: {
      fullName: { $join: [" ", [{ $get: "firstName" }, { $get: "lastName" }]] },
      isSchoolAge: { $pipe: [{ $get: "age" }, { $gte: 5 }] },
    },
  },
});
// Returns: { fullName: "Chen Li", isSchoolAge: true }
```

## $sort

Sorts an array based on specified criteria.

**Apply Form:**

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
```

**Evaluate Form:**

```javascript
// Sort with multiple criteria
evaluate({
  $sort: {
    array: [
      { group: "A", score: 85 },
      { group: "B", score: 90 },
      { group: "A", score: 95 },
    ],
    sortCriteria: [{ by: "group" }, { by: "score", desc: true }],
  },
});
// Returns: [{ group: "A", score: 95 }, { group: "A", score: 85 }, { group: "B", score: 90 }]
```

## $split

Splits a string into an array using a separator.

**Apply Form:**

```javascript
// Split child's full name
apply({ $split: " " }, "Amara Chen Rodriguez");
// Returns: ["Amara", "Chen", "Rodriguez"]
```

**Evaluate Form:**

```javascript
// Split string by delimiter
evaluate({ $split: ["apple,banana,orange", ","] });
// Returns: ["apple", "banana", "orange"]
```

## $sqrt

Calculates the square root of a number.

**Apply Form:**

```javascript
// Calculate side length of square play area
apply({ $sqrt: null }, 64);
// Returns: 8
```

**Evaluate Form:**

```javascript
// Calculate square root
evaluate({ $sqrt: 25 });
// Returns: 5
```

## $substring

Extracts a portion of a string.

**Apply Form:**

```javascript
// Get child's initials from name
apply({ $substring: [0, 1] }, "Amara");
// Returns: "A"
```

**Evaluate Form:**

```javascript
// Extract substring
evaluate({ $substring: ["Sunshine Daycare", 0, 8] });
// Returns: "Sunshine"
```

## $subtract

Performs subtraction operation.

**Apply Form:**

```javascript
// Calculate remaining snack budget
apply({ $subtract: 15.5 }, 25.0);
// Returns: 9.50
```

**Evaluate Form:**

```javascript
// Subtract two numbers
evaluate({ $subtract: [20, 7] });
// Returns: 13
```

## $sum

Calculates the sum of array values.

**Apply Form:**

```javascript
// Calculate total daily temperatures
const temperatures = [68, 72, 75, 73, 70];
apply({ $sum: null }, temperatures);
// Returns: 358
```

**Evaluate Form:**

```javascript
// Sum array values
evaluate({ $sum: [5, 10, 15, 20] });
// Returns: 50
```

## $take

Takes first N elements of an array.

**Apply Form:**

```javascript
// Get first three children for small group activity
const allChildren = ["Aria", "Chen", "Diego", "Luna", "Kai"];
apply({ $take: 3 }, allChildren);
// Returns: ["Aria", "Chen", "Diego"]
```

**Evaluate Form:**

```javascript
// Take first elements
evaluate({ $take: [2, ["breakfast", "snack", "lunch", "dinner"]] });
// Returns: ["breakfast", "snack"]
```

## $trim

Removes whitespace from beginning and end of string.

**Apply Form:**

```javascript
// Clean up child name input
apply({ $trim: null }, "  Amara Chen  ");
// Returns: "Amara Chen"
```

**Evaluate Form:**

```javascript
// Trim whitespace
evaluate({ $trim: "  Sunshine Daycare  " });
// Returns: "Sunshine Daycare"
```

## $uppercase

Converts string to uppercase.

**Apply Form:**

```javascript
// Format child's name for name tag
apply({ $uppercase: null }, "amara");
// Returns: "AMARA"
```

**Evaluate Form:**

```javascript
// Convert to uppercase
evaluate({ $uppercase: "sunshine daycare" });
// Returns: "SUNSHINE DAYCARE"
```

## $unique

Returns an array with duplicate values removed.

**Apply Form:**

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

**Evaluate Form:**

```javascript
// Remove duplicates from array
evaluate({ $unique: ["apple", "banana", "apple", "orange", "banana"] });
// Returns: ["apple", "banana", "orange"]
```

## $values

Returns an array of all property values from an object.

**Apply Form:**

```javascript
// Get all values from child record
const child = { name: "Amara", age: 4, group: "Butterflies", present: true };
apply({ $values: null }, child);
// Returns: ["Amara", 4, "Butterflies", true]
```

**Evaluate Form:**

```javascript
// Extract object values
evaluate({ $values: { room: "A", capacity: 20, teacher: "Ms. Chen" } });
// Returns: ["A", 20, "Ms. Chen"]
```
