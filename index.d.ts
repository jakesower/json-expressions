// TypeScript definitions for json-expressions
// JSON-based expression engine for dynamic computations and function composition

// === CORE TYPES ===

/**
 * Generic expression-like object (custom expressions)
 */
export interface ExpressionLike {
  [key: `$${string}`]: unknown;
}

/**
 * Expression engine for applying JSON expressions to input data
 */
export interface ExpressionEngine {
  /**
   * Apply an expression with input data
   * @param expression - The expression to apply
   * @param inputData - The input data context
   * @returns The result of the expression
   */
  apply(expression: Expression, inputData: unknown): unknown;

  /**
   * Array of available expression names
   */
  expressionNames: string[];

  /**
   * Check if a value is an expression
   * @param value - The value to check
   * @returns True if the value is an expression
   */
  isExpression(value: unknown): boolean;
}

// === CORE EXPRESSIONS ===

export interface GetExpression {
  $get: string | (string | number)[] | Expression;
}

export interface IdentityExpression {
  $identity: null;
}

export interface LiteralExpression {
  $literal: unknown;
}

export interface IsPresentExpression {
  $isPresent: boolean;
}

export interface IsEmptyExpression {
  $isEmpty: boolean;
}

export interface ExistsExpression {
  $exists: string | (string | number)[];
}

export interface DebugExpression {
  $debug: Expression | unknown;
}

export interface PipeExpression {
  $pipe: Expression[];
}

export interface MatchesExpression {
  $matches: { [path: string]: Expression | unknown };
}

export interface MatchesAnyExpression {
  $matchesAny: { [path: string]: Expression | unknown };
}

export interface SelectExpression {
  $select: { [newKey: string]: Expression | unknown };
}

export interface SortExpression {
  $sort:
    | string
    | { by: string | Expression; desc?: boolean }
    | Array<{ by: string | Expression; desc?: boolean }>;
}

export interface MergeExpression {
  $merge: Record<string, unknown>;
}

export interface PickExpression {
  $pick: string[];
}

export interface OmitExpression {
  $omit: string[];
}

export interface KeysExpression {
  $keys: null;
}

export interface ValuesExpression {
  $values: null;
}

export interface PairsExpression {
  $pairs: null;
}

export interface FromPairsExpression {
  $fromPairs: null;
}

export interface PluckExpression {
  $pluck: string | Expression;
}

export interface DefaultExpression {
  $default: { expression: Expression; default: unknown } | [Expression, unknown];
}

export interface UniqueExpression {
  $unique: null;
}

export interface FlattenExpression {
  $flatten: null | { depth?: number };
}

export interface GroupByExpression {
  $groupBy: string | Expression;
}

// === COMPARATIVE EXPRESSIONS ===

export interface EqualExpression {
  $eq: unknown | [Expression, unknown];
}

export interface NotEqualExpression {
  $ne: unknown | [Expression, unknown];
}

export interface GreaterThanExpression {
  $gt: number | Expression | [number | Expression, number | Expression];
}

export interface GreaterThanOrEqualExpression {
  $gte: number | Expression | [number | Expression, number | Expression];
}

export interface LessThanExpression {
  $lt: number | Expression | [number | Expression, number | Expression];
}

export interface LessThanOrEqualExpression {
  $lte: number | Expression | [number | Expression, number | Expression];
}

export interface InExpression {
  $in: unknown[];
}

export interface NotInExpression {
  $nin: unknown[];
}

export interface MatchesRegexExpression {
  $matchesRegex: string;
}

// === LOGICAL EXPRESSIONS ===

export interface AndExpression {
  $and: (Expression | boolean)[];
}

export interface OrExpression {
  $or: (Expression | boolean)[];
}

export interface NotExpression {
  $not: Expression | boolean;
}

// === CONDITIONAL EXPRESSIONS ===

export interface IfExpression {
  $if: {
    if: Expression | boolean;
    then: unknown;
    else: unknown;
  };
}

export interface CaseExpression {
  $case: {
    value: Expression | unknown;
    cases: Array<{
      when: Expression | unknown; // Can be literal value OR boolean predicate expression
      then: Expression | unknown;
    }>;
    default: Expression | unknown;
  };
}

// === AGGREGATIVE EXPRESSIONS ===

export interface CountExpression {
  $count: null | Expression | unknown[];
}

export interface SumExpression {
  $sum: null | Expression | number[];
}

export interface MaxExpression {
  $max: null | Expression | number[];
}

export interface MinExpression {
  $min: null | Expression | number[];
}

export interface MeanExpression {
  $mean: null | Expression | number[];
}

// === ITERATIVE EXPRESSIONS ===

export interface FilterExpression {
  $filter: Expression;
}

export interface FilterByExpression {
  $filterBy: { [path: string]: Expression | unknown };
}

export interface MapExpression {
  $map: Expression;
}

export interface FlatMapExpression {
  $flatMap: Expression;
}

export interface FindExpression {
  $find: Expression;
}

export interface AllExpression {
  $all: Expression;
}

export interface AnyExpression {
  $any: Expression;
}

export interface ConcatExpression {
  $concat: Expression | unknown[];
}

export interface JoinExpression {
  $join: string | Expression;
}

export interface ReverseExpression {
  $reverse: null;
}

export interface FirstExpression {
  $first: null | Expression | unknown[];
}

export interface LastExpression {
  $last: null | Expression | unknown[];
}

// === MATH EXPRESSIONS ===

export interface AddExpression {
  $add: number | Expression | [number | Expression, number | Expression];
}

export interface SubtractExpression {
  $subtract: number | Expression | [number | Expression, number | Expression];
}

export interface MultiplyExpression {
  $multiply: number | Expression | [number | Expression, number | Expression];
}

export interface DivideExpression {
  $divide: number | Expression | [number | Expression, number | Expression];
}

export interface ModuloExpression {
  $modulo: number | Expression | [number | Expression, number | Expression];
}

export interface CeilExpression {
  $ceil: null;
}

export interface FloorExpression {
  $floor: null;
}

export interface AbsExpression {
  $abs: null;
}

export interface PowExpression {
  $pow: number | Expression | [number | Expression, number | Expression];
}

export interface SqrtExpression {
  $sqrt: null;
}

// === STRING EXPRESSIONS ===

export interface LowercaseExpression {
  $lowercase: null;
}

export interface UppercaseExpression {
  $uppercase: null;
}

export interface TrimExpression {
  $trim: null;
}

export interface ReplaceExpression {
  $replace: [string | Expression, string | Expression];
}

export interface SplitExpression {
  $split: string | Expression;
}

export interface SubstringExpression {
  $substring: [number | Expression] | [number | Expression, number | Expression];
}

// === ARRAY EXPRESSIONS (ADDITIONAL) ===

export interface SkipExpression {
  $skip: number | Expression;
}

export interface TakeExpression {
  $take: number | Expression;
}

export interface CoalesceExpression {
  $coalesce: Expression | unknown[];
}

// === PREDICATE EXPRESSIONS (ADDITIONAL) ===

export interface BetweenExpression {
  $between: { min: number | Expression; max: number | Expression };
}

// === UNION TYPE FOR ALL EXPRESSIONS ===

export type AnyExpression =
  // Core
  | GetExpression
  | IdentityExpression
  | LiteralExpression
  | IsPresentExpression
  | IsEmptyExpression
  | ExistsExpression
  | DebugExpression
  | PipeExpression
  | DefaultExpression
  | MatchesExpression
  | MatchesAnyExpression
  | SelectExpression
  | SortExpression
  // Object
  | MergeExpression
  | PickExpression
  | OmitExpression
  | KeysExpression
  | ValuesExpression
  | PairsExpression
  | FromPairsExpression
  // Array
  | PluckExpression
  | UniqueExpression
  | FlattenExpression
  | GroupByExpression
  // Comparative
  | EqualExpression
  | NotEqualExpression
  | GreaterThanExpression
  | GreaterThanOrEqualExpression
  | LessThanExpression
  | LessThanOrEqualExpression
  | InExpression
  | NotInExpression
  | MatchesRegexExpression
  // Logical
  | AndExpression
  | OrExpression
  | NotExpression
  // Conditional
  | IfExpression
  | CaseExpression
  // Aggregative
  | CountExpression
  | SumExpression
  | MaxExpression
  | MinExpression
  | MeanExpression
  // Iterative
  | FilterExpression
  | FilterByExpression
  | MapExpression
  | FlatMapExpression
  | FindExpression
  | AllExpression
  | AnyExpression
  | ConcatExpression
  | JoinExpression
  | ReverseExpression
  | FirstExpression
  | LastExpression
  // Math
  | AddExpression
  | SubtractExpression
  | MultiplyExpression
  | DivideExpression
  | ModuloExpression
  | CeilExpression
  | FloorExpression
  | AbsExpression
  | PowExpression
  | SqrtExpression
  // String
  | LowercaseExpression
  | UppercaseExpression
  | TrimExpression
  | ReplaceExpression
  | SplitExpression
  | SubstringExpression
  // Array (Additional)
  | SkipExpression
  | TakeExpression
  | CoalesceExpression
  // Predicate (Additional)
  | BetweenExpression;

/**
 * A JSON expression - either built-in or custom
 */
export type Expression = ExpressionLike | AnyExpression;

// === MAIN EXPORTS ===

/**
 * Context object passed to custom expressions
 */
export interface ExpressionContext {
  /** Apply an expression to input data */
  apply: (expr: Expression, data: unknown) => unknown;
  /** Check if a value is an expression */
  isExpression: (value: unknown) => boolean;
  /** Check if a value is a wrapped literal */
  isWrappedLiteral: (value: unknown) => boolean;
}

/**
 * Function template for expressions
 */
export type ExpressionDefinition = (
  operand: unknown,
  inputData: unknown,
  context: ExpressionContext,
) => unknown;

/**
 * Configuration object for creating an expression engine
 */
export interface ExpressionEngineConfig {
  /** Array of expression pack objects to include */
  packs?: { [k: string]: ExpressionDefinition }[];
  /** Custom expression definitions */
  custom?: {
    [k: string]: ExpressionDefinition;
  };
  /** Whether to include base expressions (default: true) */
  includeBase?: boolean;
  /** Expression names to exclude (applied after all packs and custom are merged, but $literal cannot be excluded) */
  exclude?: string[];
}

/**
 * Creates a new expression engine with specified configuration
 * @param config - Configuration object for the expression engine
 * @returns Expression engine instance
 */
export function createExpressionEngine(
  config?: ExpressionEngineConfig,
): ExpressionEngine;

// === PACK EXPORTS ===

export const aggregation: { [k: string]: ExpressionDefinition };
export const all: { [k: string]: ExpressionDefinition };
export const array: { [k: string]: ExpressionDefinition };
export const base: { [k: string]: ExpressionDefinition };
export const comparison: { [k: string]: ExpressionDefinition };
export const filtering: { [k: string]: ExpressionDefinition };
export const math: { [k: string]: ExpressionDefinition };
export const object: { [k: string]: ExpressionDefinition };
export const projection: { [k: string]: ExpressionDefinition };
export const string: { [k: string]: ExpressionDefinition };
export const temporal: { [k: string]: ExpressionDefinition };

// === INDIVIDUAL EXPRESSION DEFINITION EXPORTS ===

// Access expressions
export const $get: ExpressionDefinition;
export const $identity: ExpressionDefinition;

// Array expressions
export const $all: ExpressionDefinition;
export const $any: ExpressionDefinition;
export const $coalesce: ExpressionDefinition;
export const $concat: ExpressionDefinition;
export const $filter: ExpressionDefinition;
export const $filterBy: ExpressionDefinition;
export const $find: ExpressionDefinition;
export const $first: ExpressionDefinition;
export const $flatMap: ExpressionDefinition;
export const $flatten: ExpressionDefinition;
export const $groupBy: ExpressionDefinition;
export const $join: ExpressionDefinition;
export const $last: ExpressionDefinition;
export const $map: ExpressionDefinition;
export const $pluck: ExpressionDefinition;
export const $reverse: ExpressionDefinition;
export const $skip: ExpressionDefinition;
export const $take: ExpressionDefinition;
export const $unique: ExpressionDefinition;

// Conditional expressions
export const $case: ExpressionDefinition;
export const $if: ExpressionDefinition;

// Flow expressions
export const $debug: ExpressionDefinition;
export const $default: ExpressionDefinition;
export const $literal: ExpressionDefinition;
export const $pipe: ExpressionDefinition;
export const $sort: ExpressionDefinition;

// Math expressions
export const $abs: ExpressionDefinition;
export const $add: ExpressionDefinition;
export const $ceil: ExpressionDefinition;
export const $divide: ExpressionDefinition;
export const $floor: ExpressionDefinition;
export const $modulo: ExpressionDefinition;
export const $multiply: ExpressionDefinition;
export const $pow: ExpressionDefinition;
export const $sqrt: ExpressionDefinition;
export const $subtract: ExpressionDefinition;

// Object expressions
export const $fromPairs: ExpressionDefinition;
export const $keys: ExpressionDefinition;
export const $merge: ExpressionDefinition;
export const $omit: ExpressionDefinition;
export const $pairs: ExpressionDefinition;
export const $pick: ExpressionDefinition;
export const $select: ExpressionDefinition;
export const $values: ExpressionDefinition;

// Predicate expressions
export const $and: ExpressionDefinition;
export const $between: ExpressionDefinition;
export const $eq: ExpressionDefinition;
export const $exists: ExpressionDefinition;
export const $gt: ExpressionDefinition;
export const $gte: ExpressionDefinition;
export const $in: ExpressionDefinition;
export const $isEmpty: ExpressionDefinition;
export const $isPresent: ExpressionDefinition;
export const $lt: ExpressionDefinition;
export const $lte: ExpressionDefinition;
export const $matches: ExpressionDefinition;
export const $matchesAny: ExpressionDefinition;
export const $matchesRegex: ExpressionDefinition;
export const $ne: ExpressionDefinition;
export const $nin: ExpressionDefinition;
export const $not: ExpressionDefinition;
export const $or: ExpressionDefinition;

// String expressions
export const $lowercase: ExpressionDefinition;
export const $replace: ExpressionDefinition;
export const $split: ExpressionDefinition;
export const $substring: ExpressionDefinition;
export const $trim: ExpressionDefinition;
export const $uppercase: ExpressionDefinition;

// Aggregation expressions
export const $count: ExpressionDefinition;
export const $max: ExpressionDefinition;
export const $mean: ExpressionDefinition;
export const $min: ExpressionDefinition;
export const $sum: ExpressionDefinition;

// Temporal expressions
export const $addDays: ExpressionDefinition;
export const $addHours: ExpressionDefinition;
export const $addMinutes: ExpressionDefinition;
export const $addMonths: ExpressionDefinition;
export const $addYears: ExpressionDefinition;
export const $day: ExpressionDefinition;
export const $dayOfWeek: ExpressionDefinition;
export const $dayOfYear: ExpressionDefinition;
export const $diffDays: ExpressionDefinition;
export const $diffHours: ExpressionDefinition;
export const $diffMilliseconds: ExpressionDefinition;
export const $diffMinutes: ExpressionDefinition;
export const $diffMonths: ExpressionDefinition;
export const $diffSeconds: ExpressionDefinition;
export const $diffYears: ExpressionDefinition;
export const $endOfDay: ExpressionDefinition;
export const $endOfMonth: ExpressionDefinition;
export const $endOfYear: ExpressionDefinition;
export const $formatDate: ExpressionDefinition;
export const $hour: ExpressionDefinition;
export const $isAfter: ExpressionDefinition;
export const $isBefore: ExpressionDefinition;
export const $isDateValid: ExpressionDefinition;
export const $isSameDay: ExpressionDefinition;
export const $isWeekday: ExpressionDefinition;
export const $isWeekend: ExpressionDefinition;
export const $minute: ExpressionDefinition;
export const $month: ExpressionDefinition;
export const $parseDate: ExpressionDefinition;
export const $second: ExpressionDefinition;
export const $startOfDay: ExpressionDefinition;
export const $startOfMonth: ExpressionDefinition;
export const $startOfYear: ExpressionDefinition;
export const $subDays: ExpressionDefinition;
export const $subMonths: ExpressionDefinition;
export const $subYears: ExpressionDefinition;
export const $year: ExpressionDefinition;
