# Quick Start Guide

Get up and running with JSON Expressions in minutes. This guide focuses on **apply mode** - expressions that operate on your input data.

## Installation

```bash
npm install json-expressions
```

## Basic Setup

```javascript
import {
  createExpressionEngine,
  mathPack,
  comparisonPack,
  arrayPack,
} from "json-expressions";

const engine = createExpressionEngine({
  packs: [mathPack, comparisonPack, arrayPack],
});
```

> **Need help choosing packs?** See the **[Pack Reference](packs.md)** for a complete guide to all available packs and their expressions.

```javascript
// Most users start with basePack for essential expressions
import { createExpressionEngine, basePack } from "json-expressions";
const engine = createExpressionEngine({ packs: [basePack] });
```

## Your First Expression

Let's start with a simple daycare scenario:

```javascript
const child = { name: "Ximena", age: 4 };

// Is this child 4 or older?
const result = engine.apply({ $gte: 4 }, child.age);
// Returns: true
```

**How it works:** The expression `{ $gte: 4 }` asks "is the input >= 4?". We pass `child.age` (which is 4) as input data.

## Working with Objects

Most real data comes as objects. Use `$get` to access properties:

```javascript
const child = { name: "Yousef", age: 5, classroom: "Rainbow" };

// Get the child's name
engine.apply({ $get: "name" }, child);
// Returns: "Yousef"

// Is the child old enough for preschool? (using pipe)
engine.apply(
  {
    $pipe: [{ $get: "age" }, { $gte: 4 }],
  },
  child,
);
// Returns: true

// More readable: combine them (using array form)
engine.apply(
  {
    $gte: [{ $get: "age" }, 4],
  },
  child,
);
// Returns: true
```

## Complex Conditions

Use `$matches` to check multiple properties at once:

```javascript
const children = [
  { name: "Ximena", age: 4, vaccinated: true },
  { name: "Yousef", age: 5, vaccinated: false },
  { name: "Zoë", age: 6, vaccinated: true },
];

// Check if a child meets enrollment requirements
const isEligible = {
  $matches: {
    age: { $gte: 4 },
    vaccinated: true,
  },
};

engine.apply(isEligible, children[0]); // true (Ximena)
engine.apply(isEligible, children[1]); // false (Yousef - not vaccinated)
engine.apply(isEligible, children[2]); // true (Zoë)
```

## Working with Arrays

Filter and transform lists of children:

```javascript
const classroom = {
  teacher: "Ms. Chen",
  children: [
    { name: "Ximena", age: 4, group: "preschool" },
    { name: "Yousef", age: 5, group: "preschool" },
    { name: "Maria", age: 3, group: "toddler" },
    { name: "Zoë", age: 6, group: "kindergarten" },
  ],
};

// Get all preschool children
const preschoolers = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $filter: {
          $matches: { group: "preschool" },
        },
      },
    ],
  },
  classroom,
);
// Returns: [{ name: "Ximena", age: 4, group: "preschool" }, { name: "Yousef", age: 5, group: "preschool" }]

// Get just their names
const preschoolNames = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $filter: {
          $matches: { group: "preschool" },
        },
      },
      { $map: { $get: "name" } },
    ],
  },
  classroom,
);
// Returns: ["Ximena", "Yousef"]
```

## Calculations

Work with numbers and perform calculations:

```javascript
const activityReport = {
  children: [
    { name: "Ximena", activities: ["art", "music", "story"] },
    { name: "Yousef", activities: ["music", "blocks"] },
    { name: "Zoë", activities: ["art", "music", "story", "blocks", "outside"] },
  ],
};

// Average number of activities per child
const avgActivities = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $map: {
          $pipe: [{ $get: "activities" }, { $count: { $identity: null } }],
        },
      },
      { $mean: { $identity: null } },
    ],
  },
  activityReport,
);
// Returns: 3.33 (average of [3, 2, 5])

// Find the most active child
const mostActive = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $sort: {
          by: {
            $pipe: [{ $get: "activities" }, { $count: { $identity: null } }],
          },
          desc: true,
        },
      },
      { $first: { $identity: null } },
      { $get: "name" },
    ],
  },
  activityReport,
);
// Returns: "Zoë"
```

## Conditional Logic

Make decisions based on data:

```javascript
const child = { name: "Elena", age: 4, hasAllergies: true };

// Determine appropriate snack
const snackType = engine.apply(
  {
    $if: {
      if: { $get: "hasAllergies" },
      then: "allergy-safe snack",
      else: "regular snack",
    },
  },
  child,
);
// Returns: "allergy-safe snack"

// Complex case logic
const classroom = { name: "rainbow", teacher: "Ms. Chen", size: 12 };

const status = engine.apply(
  {
    $case: {
      value: { $get: "size" },
      cases: [
        { when: { $lte: 8 }, then: "Small class" },
        { when: { $lte: 15 }, then: "Medium class" },
        { when: { $lte: 20 }, then: "Large class" },
      ],
      default: "Oversized class",
    },
  },
  classroom,
);
// Returns: "Medium class"
```

## Real-World Example: Daily Report

Here's a complete example that generates a daily classroom report:

```javascript
const dayData = {
  date: "2024-03-15",
  classroom: "Rainbow Room",
  teacher: "Ms. Chen",
  children: [
    {
      name: "Ximena",
      present: true,
      activities: ["art", "music"],
      mood: "happy",
      lunch: "ate well",
    },
    {
      name: "Yousef",
      present: true,
      activities: ["blocks", "story"],
      mood: "tired",
      lunch: "picked at food",
    },
    {
      name: "Zoë",
      present: false,
      activities: [],
      mood: null,
      lunch: null,
    },
  ],
};

// Generate attendance summary
const attendanceReport = engine.apply(
  {
    present: {
      $pipe: [
        { $get: "children" },
        { $filter: { $get: "present" } },
        { $count: { $identity: null } },
      ],
    },
    absent: {
      $pipe: [
        { $get: "children" },
        { $filter: { $not: { $get: "present" } } },
        { $count: { $identity: null } },
      ],
    },
    total: {
      $pipe: [{ $get: "children" }, { $count: { $identity: null } }],
    },
  },
  dayData,
);
// Returns: { present: 2, absent: 1, total: 3 }

// Get children who need attention
const needsAttention = engine.apply(
  {
    $pipe: [
      { $get: "children" },
      {
        $filter: {
          $and: [
            { $get: "present" },
            {
              $or: [
                { $eq: [{ $get: "mood" }, "upset"] },
                { $eq: [{ $get: "mood" }, "tired"] },
                { $eq: [{ $get: "lunch" }, "refused"] },
                { $eq: [{ $get: "lunch" }, "picked at food"] },
              ],
            },
          ],
        },
      },
      { $map: { $get: "name" } },
    ],
  },
  dayData,
);
// Returns: ["Yousef"]
```

## Common Patterns Cheat Sheet

| Goal                   | Expression Pattern                                                  |
| ---------------------- | ------------------------------------------------------------------- |
| Get property           | `{ $get: "propertyName" }`                                          |
| Test condition         | `{ $gt: 5 }`, `{ $eq: "value" }`                                    |
| Multiple conditions    | `{ $and: [condition1, condition2] }`                                |
| Object matching        | `{ $matches: { prop1: condition1, prop2: condition2 } }`            |
| Filter array           | `{ $filter: condition }`                                            |
| Match and filter array | `{ $filterBy: { prop1: condition1, prop2: condition2 } }`           |
| Transform array        | `{ $map: transformation }`                                          |
| Count items            | `{ $count: { $identity: null } }`                                   |
| Get first/last         | `{ $first: { $identity: null } }`, `{ $last: { $identity: null } }` |
| Sort array             | `{ $sort: { by: "property" } }`                                     |
| Chain operations       | `{ $pipe: [step1, step2, step3] }`                                  |
| If/then/else           | `{ $if: { if: condition, then: value1, else: value2 } }`            |

## Next Steps

- **[Expression Reference](expressions.md)** - Complete list of available expressions
- **[Custom Expressions](custom-expressions.md)** - Creating your own expressions
- **[Evaluate Method](evaluate-method.md)** - Advanced static calculations and template expressions

Ready to start building? Import the packs you need and start applying expressions to your data!
