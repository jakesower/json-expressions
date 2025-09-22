// TypeScript definitions for json-expressions
// JSON-based expression engine for dynamic computations and function composition

// === CORE TYPES ===

/**
 * A JSON expression that can be evaluated against input data
 */
export interface Expression {
	[key: string]: unknown;
}

/**
 * Expression engine for evaluating JSON expressions
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
	 * Evaluate an expression without input data (for static expressions)
	 * @param expression - The expression to evaluate
	 * @returns The evaluated result
	 */
	evaluate(expression: Expression): unknown;
	
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
	$get: string | [string, unknown] | [unknown, string] | [unknown, string, unknown];
}

export interface LiteralExpression {
	$literal: unknown;
}

export interface PropExpression {
	$prop: string | number | symbol | [unknown, string | number | symbol];
}

export interface IsDefined {
	$isDefined: unknown | [unknown];
}


export interface DebugExpression {
	$debug: Expression | unknown;
}

export interface PipeExpression {
	$pipe: Expression[] | [Expression[], unknown];
}

export interface WhereExpression {
	$where: { [path: string]: Expression } | [unknown, { [path: string]: Expression }];
}

export interface SelectExpression {
	$select: string[] | { [newKey: string]: Expression } | [unknown, string[] | { [newKey: string]: Expression }];
}

export interface SortExpression {
	$sort: string | { by: string | Expression; desc?: boolean } | Array<{ by: string | Expression; desc?: boolean }> | [unknown[], string | { by: string | Expression; desc?: boolean } | Array<{ by: string | Expression; desc?: boolean }>];
}

export interface MergeExpression {
	$merge: unknown[] | [unknown[]];
}

export interface PickExpression {
	$pick: string[] | [unknown, string[]];
}

export interface OmitExpression {
	$omit: string[] | [unknown, string[]];
}

export interface KeysExpression {
	$keys: null | [unknown];
}

export interface ValuesExpression {
	$values: null | [unknown];
}

export interface PairsExpression {
	$pairs: null | [unknown];
}

export interface FromPairsExpression {
	$fromPairs: null | [unknown[]];
}

export interface PluckExpression {
	$pluck: string | Expression | [unknown[], string | Expression];
}

export interface DefaultExpression {
	$default: Expression[];
}

export interface WhereExpression {
	$where: { [path: string]: Expression } | [unknown[], { [path: string]: Expression }];
}

export interface HasExpression {
	$has: string | [unknown, string];
}

export interface UniqueExpression {
	$unique: null | [unknown[]];
}

export interface FlattenExpression {
	$flatten: { depth?: number } | [unknown[], { depth?: number }];
}

export interface GroupByExpression {
	$groupBy: string | Expression | [unknown[], string | Expression];
}


// === COMPARATIVE EXPRESSIONS ===

export interface EqualExpression {
	$eq: unknown | [unknown, unknown];
}

export interface NotEqualExpression {
	$ne: unknown | [unknown, unknown];
}

export interface GreaterThanExpression {
	$gt: number | [number, number];
}

export interface GreaterThanOrEqualExpression {
	$gte: number | [number, number];
}

export interface LessThanExpression {
	$lt: number | [number, number];
}

export interface LessThanOrEqualExpression {
	$lte: number | [number, number];
}

export interface InExpression {
	$in: unknown[] | [unknown[], unknown];
}

export interface NotInExpression {
	$nin: unknown[] | [unknown[], unknown];
}

export interface MatchesRegexExpression {
	$matchesRegex: string | [string, string];
}

export interface MatchesLikeExpression {
	$matchesLike: string | [string, string];
}

export interface MatchesGlobExpression {
	$matchesGlob: string | [string, string];
}

// === LOGICAL EXPRESSIONS ===

export interface AndExpression {
	$and: Expression[];
}

export interface OrExpression {
	$or: Expression[];
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
		value: unknown;
		cases: Array<{
			when: unknown; // Can be literal value OR boolean predicate expression
			then: unknown;
		}>;
		default: unknown;
	} | [{
		value: unknown;
		cases: Array<{
			when: unknown; // Can be literal value OR boolean predicate expression
			then: unknown;
		}>;
		default: unknown;
	}];
}

// === AGGREGATIVE EXPRESSIONS ===

export interface CountExpression {
	$count: unknown[];
}

export interface SumExpression {
	$sum: number[];
}

export interface MaxExpression {
	$max: number[];
}

export interface MinExpression {
	$min: number[];
}

export interface MeanExpression {
	$mean: number[];
}

export interface MedianExpression {
	$median: number[];
}

export interface ModeExpression {
	$mode: unknown[];
}

// === ITERATIVE EXPRESSIONS ===

export interface FilterExpression {
	$filter: Expression | [Expression, unknown[]];
}

export interface MapExpression {
	$map: Expression | [Expression, unknown[]];
}

export interface FlatMapExpression {
	$flatMap: Expression | [Expression, unknown[]];
}

export interface FindExpression {
	$find: Expression | [Expression, unknown[]];
}

export interface AllExpression {
	$all: Expression | [Expression, unknown[]];
}

export interface AnyExpression {
	$any: Expression | [Expression, unknown[]];
}

export interface ConcatExpression {
	$concat: unknown[] | [unknown[], unknown[]];
}

export interface JoinExpression {
	$join: string | [string, unknown[]];
}

export interface ReverseExpression {
	$reverse: {} | unknown[];
}

// === MATH EXPRESSIONS ===

export interface AddExpression {
	$add: number | [number, number];
}

export interface SubtractExpression {
	$subtract: number | [number, number];
}

export interface MultiplyExpression {
	$multiply: number | [number, number];
}

export interface DivideExpression {
	$divide: number | [number, number];
}

export interface ModuloExpression {
	$modulo: number | [number, number];
}

// === GENERATIVE EXPRESSIONS ===

export interface RandomExpression {
	$random: {
		min?: number;
		max?: number;
		precision?: number | null;
	} | {};
}

export interface UuidExpression {
	$uuid: unknown;
}

// === TEMPORAL EXPRESSIONS ===

export interface NowUTCExpression {
	$nowUTC: unknown;
}

export interface NowLocalExpression {
	$nowLocal: unknown;
}

export interface TimestampExpression {
	$timestamp: unknown;
}

// === UNION TYPE FOR ALL EXPRESSIONS ===

export type AnyExpression =
	// Core
	| GetExpression
	| LiteralExpression
	| PropExpression
	| IsDefined
	| DebugExpression
	| PipeExpression
	| DefaultExpression
	| WhereExpression
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
	| HasExpression
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
	| MapExpression
	| FlatMapExpression
	| FindExpression
	| AllExpression
	| AnyExpression
	| ConcatExpression
	| JoinExpression
	| ReverseExpression
	// Math
	| AddExpression
	| SubtractExpression
	| MultiplyExpression
	| DivideExpression
	| ModuloExpression
	// Generative
	| RandomExpression
	| UuidExpression
	// Temporal
	| NowUTCExpression
	| NowLocalExpression
	| TimestampExpression;

// === MAIN EXPORTS ===

/**
 * Configuration object for creating an expression engine
 */
export interface ExpressionEngineConfig {
	/** Array of expression pack objects to include */
	packs?: object[];
	/** Custom expression definitions */
	custom?: { [k: string]: {
		apply: (operand: unknown, inputData: unknown, context?: { 
			apply: (expr: Expression, data: unknown) => unknown;
			evaluate: (expr: Expression) => unknown;
			isExpression: (value: unknown) => boolean;
		}) => unknown;
		evaluate: (operand: unknown, context?: {
			apply: (expr: Expression, data: unknown) => unknown;
			evaluate: (expr: Expression) => unknown;
			isExpression: (value: unknown) => boolean;
		}) => unknown;
	} };
	/** Whether to include base expressions (default: true) */
	includeBase?: boolean;
}

/**
 * Creates a new expression engine with specified configuration
 * @param config - Configuration object for the expression engine
 * @returns Expression engine instance
 */
export function createExpressionEngine(config?: ExpressionEngineConfig): ExpressionEngine;


// === PACK EXPORTS ===

export const aggregation: { [k: string]: unknown };
export const all: { [k: string]: unknown };
export const array: { [k: string]: unknown };
export const base: { [k: string]: unknown };
export const comparison: { [k: string]: unknown };
export const filtering: { [k: string]: unknown };
export const logic: { [k: string]: unknown };
export const math: { [k: string]: unknown };
export const object: { [k: string]: unknown };
export const projection: { [k: string]: unknown };
export const string: { [k: string]: unknown };
export const time: { [k: string]: unknown };

// === INDIVIDUAL EXPRESSION DEFINITION EXPORTS ===

// All individual expression definitions are exported via export * statements
// from their respective definition files (access, array, conditional, flow,
// generative, math, object, predicate, string, temporal, utility)