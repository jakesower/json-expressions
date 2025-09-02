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

export interface EnsurePathExpression {
	$ensurePath: string | [unknown, string];
}

export interface DebugExpression {
	$debug: Expression | unknown;
}

export interface PipeExpression {
	$pipe: Expression[] | [Expression[], unknown];
}

export interface ComposeExpression {
	$compose: Expression[] | [Expression[], unknown];
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

export interface SwitchExpression {
	$switch: {
		value: unknown;
		cases: Array<{
			when: unknown;
			then: unknown;
		}>;
		default: unknown;
	} | [{
		value: unknown;
		cases: Array<{
			when: unknown;
			then: unknown;
		}>;
		default: unknown;
	}];
}

export interface CaseExpression {
	$case: {
		value: unknown;
		cases: Array<{
			when: Expression;
			then: unknown;
		}>;
		default: unknown;
	} | [{
		value: unknown;
		cases: Array<{
			when: Expression;
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
	| EnsurePathExpression
	| DebugExpression
	| PipeExpression
	| ComposeExpression
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
	| MatchesLikeExpression
	| MatchesGlobExpression
	// Logical
	| AndExpression
	| OrExpression
	| NotExpression
	// Conditional
	| IfExpression
	| SwitchExpression
	| CaseExpression
	// Aggregative
	| CountExpression
	| SumExpression
	| MaxExpression
	| MinExpression
	| MeanExpression
	| MedianExpression
	| ModeExpression
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
 * Creates a new expression engine with optional custom expressions
 * @param customExpressions - Custom expression definitions to add
 * @returns Expression engine instance
 */
export function createExpressionEngine(customExpressions?: { [k: string]: {
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
} }): ExpressionEngine;

/**
 * The default expression engine with all built-in expressions
 */
export const defaultExpressionEngine: ExpressionEngine;

/**
 * Object containing all built-in expression definitions
 */
export const defaultExpressions: { [k: string]: {
	apply: (operand: unknown, inputData: unknown, context?: unknown) => unknown;
	evaluate: (operand: unknown, context?: unknown) => unknown;
} };

// === DEFINITION EXPORTS ===

export const coreDefinitions: { [k: string]: unknown };
export const aggregativeDefinitions: { [k: string]: unknown };
export const comparativeDefinitions: { [k: string]: unknown };
export const conditionalDefinitions: { [k: string]: unknown };
export const generativeDefinitions: { [k: string]: unknown };
export const iterativeDefinitions: { [k: string]: unknown };
export const logicalDefinitions: { [k: string]: unknown };
export const mathDefinitions: { [k: string]: unknown };
export const temporalDefinitions: { [k: string]: unknown };