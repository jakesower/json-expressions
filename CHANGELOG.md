# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.13.3] - 2025-11-10

### Added

- **Bracket notation support** in `$get` and `$pluck` expressions
  - Array index access: `"items[0].name"` accesses first item's name property
  - Consecutive brackets: `"matrix[0][1]"` accesses nested arrays
  - Mixed notation: `"users[0].profile.age"` combines brackets and dots
  - Wildcard in brackets: `"[$].name"` or `"items[$].id"` iterates arrays
  - Nested wildcards: `"teams[$].members[$].name"` flattens nested arrays

### Changed

- **Wildcard validation** - Wildcards (`$`) are now explicitly controlled per expression
  - `$get` and `$pluck` support wildcards for array iteration
  - `$matchesAll`, `$matchesAny`, `$filterBy`, `$exists`, and `$sort` reject wildcards with clear error messages
  - Helps prevent confusing behavior where wildcards produce unexpected results

## [0.13.2] - 2025-10-25

### Added

- **Expression validation methods** on the expression engine
  - `validateExpression(value)` - Returns array of all validation errors (empty array if valid)
  - `ensureValidExpression(value)` - Validates expression tree, throwing all errors joined by newline
  - Both methods perform deep recursive validation of nested expressions
  - Returns all errors at once for better user experience (not just first error)
  - `$literal` operands are correctly excluded from validation (treated as data)
  - Useful for validating user-provided expressions before evaluation

## [0.13.1] - 2025-10-24

### Changed

- **Extended operand-over-inputData pattern** to more expression types
  - Array transformation expressions (`$reverse`, `$sort`, `$unique`, etc.) now support operand form
  - Math transformation expressions (`$abs`, `$ceil`, `$floor`, `$sqrt`) now support operand form
  - String transformation expressions (`$uppercase`, `$lowercase`, `$trim`, etc.) now support operand form
  - These expressions now operate on either the resolved operand (if it matches the expected type) or input data
  - Enables more composable patterns like `{ $abs: { $get: "value" } }` without requiring `$pipe`

## [0.13.0] - 2025-10-18

### Added

- **Middleware support** - Add middleware functions to wrap expression evaluation for logging, telemetry, error handling, and more
  - Middleware can observe expression evaluation (operand, inputData, expressionName, path)
  - Middleware can transform operand and inputData before evaluation
  - Middleware can transform results, catch errors, or short-circuit evaluation
  - Multiple middleware compose in order with proper before/after wrapping
- **`$prop` expression** - Fast simple property access without path traversal features
  - 2.5x faster than `$get` for simple property access (obj[key] only)
  - No dot notation, wildcards, or array paths - just direct property lookup
  - Included in base pack for opt-in performance optimization

### Performance

- **~26x performance improvement** for expression evaluation through optimistic error handling
  - Fast path avoids closure creation overhead for path tracking
  - Error path rebuilds with full path information on demand
  - Simple operations now achieve 1.2-2.1M ops/sec (previously ~450K ops/sec)

## [0.12.1] - 2025-10-13

### Changed

- Removed language around tree shaking
- `$debug` is now included in the base pack for easier debugging during development
- **Temporal pack redesigned** with more flexible, composable expressions
  - Replaced individual arithmetic operations with unified `$addTime` (supports years, months, weeks, days, hours, minutes, seconds, milliseconds)
  - Negative values in `$addTime` enable subtraction (e.g., `{ days: -3 }`)
  - Replaced individual difference operations with unified `$diffTime` (supports all time units)
  - Replaced individual boundary operations with `$startOf` and `$endOf` (supports day, week, month, year)
  - Replaced individual component extractors with unified `$getTime` (supports year, month, day, hour, minute, second, dayOfWeek, dayOfYear)
  - Simplified comparison operations to `$isAfter` and `$isBefore`
  - Removed predicates like `$isWeekend`, `$isWeekday`, `$isSameDay` (can be achieved with `$getTime` and comparisons)
  - All temporal expressions preserve error types when throwing errors

## [0.12.0] - 2025-10-08

### Added

- **Temporal Pack** - Comprehensive date/time operations with 38 expressions
  - Date arithmetic: `$addDays`, `$addMonths`, `$addYears`, `$addHours`, `$addMinutes`, `$addSeconds`, `$subDays`, `$subMonths`, `$subYears`, `$subHours`, `$subMinutes`, `$subSeconds`
  - Date components: `$year`, `$month`, `$day`, `$hour`, `$minute`, `$second`, `$dayOfWeek`, `$dayOfYear`, `$weekOfYear`
  - Date boundaries: `$startOfDay`, `$endOfDay`, `$startOfMonth`, `$endOfMonth`, `$startOfYear`, `$endOfYear`, `$startOfWeek`, `$endOfWeek`
  - Date comparison: `$isBefore`, `$isAfter`, `$isSameDay`, `$isSameMonth`, `$isSameYear`, `$isBetween`
  - Date predicates: `$isWeekend`, `$isWeekday`, `$isLeapYear`
  - Date differences: `$diffDays`, `$diffHours`, `$diffMinutes`, `$diffSeconds`, `$diffMonths`, `$diffYears`
  - Date parsing/formatting: `$formatDate`, `$parseDate`, `$isDateValid`
- All temporal expressions use ISO 8601 string format for JSON compatibility
- All temporal expressions support both array form and input data form patterns
- Added `date-fns` dependency for date parsing and formatting operations

### Changed

- Temporal expressions use UTC-based operations to ensure consistent behavior across timezones

## [0.11.0] - 2025-10-07

- `$matchAny` is now in the base pack
- `exclude` can now specify the names of expressions meant to be excluded from the engine (so `{ packs: [mathPack], exclude: ["$add"] }` would work as expected)

## [0.10.3] - 2025-10-03

### Changed

- `$get` now returns `null` instead of `undefined` for non-existent paths, aligning with JSON semantics
- `undefined` and `null` are now treated as equal throughout the library to support JSON-first design

### Fixed

- Fixed `$get` path resolution edge cases

## [0.10.2] - 2025-10-03

### Removed

- Removed `$prepend` and `$append` expressions in favor of `$concat` for better API consistency

## [0.10.1] - 2025-10-01

### Added

- Operand-over-inputData pattern for aggregative expressions (`$count`, `$sum`, `$min`, `$max`, `$mean`, `$first`, `$last`)
- These expressions can now operate on either an operand expression result or input data

### Changed

- Aggregative expressions now support more composable patterns without requiring `$pipe`

## [0.9.0] - 2025-09-29

### Added

- Math operation edge case handling and improvements
- Comprehensive documentation in `docs/` directory
  - Quick Start Guide
  - Expression Reference
  - Pack Reference
  - Custom Expressions Guide

### Changed

- Renamed "Pack" suffix added to all pack exports for consistency (`mathPack`, `arrayPack`, etc.)
- Improved null/undefined equality handling across all comparison operations
- Updated documentation to focus on "apply mode" as primary usage pattern

### Fixed

- Improved test coverage across all expression definitions

## [0.8.0] - 2025-09-27

### Added

- Array form for binary comparison operators (`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`)
- Array form for math operations (`$add`, `$subtract`, `$multiply`, `$divide`, `$modulo`, `$pow`)
- Support for comparing or computing values from two expressions

### Changed

- Pack reorganization for better logical grouping
- Documentation synchronized with pack structure

## [0.7.0] - 2025-09-24

### Added

- `$identity` expression for identity function pattern
- `$literal` expression for wrapping values that should not be evaluated
- `isWrappedLiteral` context function for custom expressions

### Changed

- Renamed `isLiteral` to `isWrappedLiteral` in expression context for clarity
- Renamed `all` pack to `allExpressionsForTesting` to clarify its purpose

### Removed

- Non-deterministic expressions removed from core library

## [0.6.0] - 2025-09-23

### Changed

- Updated core expression definitions with improvements to evaluation logic
- Reorganized expression files for better maintainability
- Combined `$case` and `$switch` into unified `$case` expression supporting both literal and predicate matching

### Breaking Changes

- `$switch` expression removed; use `$case` instead

## [0.5.0] - 2025-09-06

### Added

- Packs system for modular expression loading
- `createExpressionEngine` configuration object supporting:
  - `packs`: Array of expression pack objects
  - `custom`: Custom expression definitions
  - `includeBase`: Option to exclude base expressions

### Changed

- Moved to packs-based architecture for better tree-shaking and modularity
- Updated package structure to support selective imports

### Breaking Changes

- Changed from flat export to pack-based export system
- Engine creation now requires explicit pack imports

## [0.4.0] - 2025-09-05

### Changed

- Adjusted `$get` signature for better path handling
- Improved `.gitignore` for better development workflow

### Fixed

- `$get` now properly handles default values for missing paths

## [0.3.0] - 2025-09-03

### Added

- `$prop` expression for property access (later renamed to `$get`)
- Default value support for `$get` expression

## [0.2.0] - 2025-09-02

### Changed

- Updated dependencies to latest versions
- Improved README documentation

## [0.1.0] - 2025-09-02

### Added

- Initial release of JSON Expressions
- Core expression engine with `apply` method
- Basic expression types:
  - Access: `$get`
  - Comparison: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`
  - Logic: `$and`, `$or`, `$not`
  - Math: `$add`, `$subtract`, `$multiply`, `$divide`, `$modulo`, `$abs`, `$ceil`, `$floor`, `$pow`, `$sqrt`
  - Array: `$filter`, `$map`, `$find`, `$all`, `$any`, `$concat`, `$flatten`, `$unique`, `$sort`, `$reverse`, `$first`, `$last`, `$skip`, `$take`, `$pluck`, `$groupBy`, `$flatMap`
  - Object: `$pick`, `$omit`, `$merge`, `$keys`, `$values`, `$pairs`, `$fromPairs`, `$select`
  - String: `$uppercase`, `$lowercase`, `$trim`, `$split`, `$join`, `$replace`, `$substring`
  - Conditional: `$if`, `$case`
  - Flow: `$pipe`, `$default`, `$debug`
  - Predicate: `$matchesAll`, `$filterBy`, `$exists`, `$isEmpty`, `$isPresent`, `$between`, `$matchesRegex`, `$coalesce`
  - Aggregation: `$count`, `$sum`, `$min`, `$max`, `$mean`
- MIT License
- TypeScript definitions
- Comprehensive test suite
- Build tooling (Rollup for ESM/CJS)
- ESLint and Prettier configuration

[Unreleased]: https://github.com/toddwiin/json-expressions/compare/v0.13.0...HEAD
[0.13.0]: https://github.com/toddwiin/json-expressions/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/toddwiin/json-expressions/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/toddwiin/json-expressions/compare/v0.10.3...v0.12.0
[0.10.3]: https://github.com/toddwiin/json-expressions/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/toddwiin/json-expressions/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/toddwiin/json-expressions/compare/v0.9.0...v0.10.1
[0.9.0]: https://github.com/toddwiin/json-expressions/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/toddwiin/json-expressions/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/toddwiin/json-expressions/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/toddwiin/json-expressions/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/toddwiin/json-expressions/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/toddwiin/json-expressions/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/toddwiin/json-expressions/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/toddwiin/json-expressions/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/toddwiin/json-expressions/releases/tag/v0.1.0
