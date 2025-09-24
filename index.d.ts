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
	$get: string | { object: unknown; path: string };
}

export interface IdentityExpression {
	$identity: unknown;
}

export interface LiteralExpression {
	$literal: unknown;
}

export interface PropExpression {
	$prop: string | number | symbol | { object: unknown; property: string | number | symbol };
}

export interface IsDefined {
	$isDefined: unknown | [unknown];
}


export interface DebugExpression {
	$debug: Expression | unknown;
}

export interface PipeExpression {
	$pipe: Expression[] | { expressions: Expression[]; inputData: unknown };
}

export interface MatchesExpression {
	$matches: { [path: string]: Expression } | { data: unknown; conditions: { [path: string]: Expression } };
}

export interface SelectExpression {
	$select: string[] | { [newKey: string]: Expression } | { object: unknown; selection: string[] | { [newKey: string]: Expression } };
}

export interface SortExpression {
	$sort: string | { by: string | Expression; desc?: boolean } | Array<{ by: string | Expression; desc?: boolean }> | { array: unknown[]; sortCriteria: string | { by: string | Expression; desc?: boolean } | Array<{ by: string | Expression; desc?: boolean }> };
}

export interface MergeExpression {
	$merge: unknown[] | [unknown[]];
}

export interface PickExpression {
	$pick: string[] | { object: unknown; properties: string[] };
}

export interface OmitExpression {
	$omit: string[] | { object: unknown; properties: string[] };
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
	$pluck: string | Expression | { array: unknown[]; property: string | Expression };
}

export interface DefaultExpression {
	$default: Expression[];
}


export interface HasExpression {
	$has: string | { object: unknown; path: string };
}

export interface UniqueExpression {
	$unique: null | [unknown[]];
}

export interface FlattenExpression {
	$flatten: { depth?: number } | [unknown[], { depth?: number }];
}

export interface GroupByExpression {
	$groupBy: string | Expression | { array: unknown[]; groupBy: string | Expression };
}


// === COMPARATIVE EXPRESSIONS ===

export interface EqualExpression {
	$eq: unknown | { left: unknown; right: unknown };
}

export interface NotEqualExpression {
	$ne: unknown | { left: unknown; right: unknown };
}

export interface GreaterThanExpression {
	$gt: number | { left: number; right: number };
}

export interface GreaterThanOrEqualExpression {
	$gte: number | { left: number; right: number };
}

export interface LessThanExpression {
	$lt: number | { left: number; right: number };
}

export interface LessThanOrEqualExpression {
	$lte: number | { left: number; right: number };
}

export interface InExpression {
	$in: { array: unknown[]; value: unknown };
}

export interface NotInExpression {
	$nin: { array: unknown[]; value: unknown };
}

export interface MatchesRegexExpression {
	$matchesRegex: string | { pattern: string; text: string };
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
	$filter: Expression | { expression: Expression; array: unknown[] };
}

export interface FilterByExpression {
	$filterBy: { [path: string]: Expression } | [unknown[], { [path: string]: Expression }] | { array: unknown[]; conditions: { [path: string]: Expression } };
}

export interface MapExpression {
	$map: Expression | { expression: Expression; array: unknown[] };
}

export interface FlatMapExpression {
	$flatMap: Expression | { expression: Expression; array: unknown[] };
}

export interface FindExpression {
	$find: Expression | { expression: Expression; array: unknown[] };
}

export interface AllExpression {
	$all: Expression | { expression: Expression; array: unknown[] };
}

export interface AnyExpression {
	$any: Expression | { expression: Expression; array: unknown[] };
}

export interface ConcatExpression {
	$concat: unknown[] | [unknown[], unknown[]];
}

export interface JoinExpression {
	$join: string | { separator: string; array: unknown[] };
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




// === UNION TYPE FOR ALL EXPRESSIONS ===

export type AnyExpression =
	// Core
	| GetExpression
	| IdentityExpression
	| LiteralExpression
	| PropExpression
	| IsDefined
	| DebugExpression
	| PipeExpression
	| DefaultExpression
	| MatchesExpression
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
	| FilterByExpression
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
	| ModuloExpression;

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

// === INDIVIDUAL EXPRESSION DEFINITION EXPORTS ===

// All individual expression definitions are exported via export * statements
// from their respective definition files (access, array, conditional, flow,
// math, object, predicate, string)