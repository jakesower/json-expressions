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
	$get: string;
}

export interface IdentityExpression {
	$identity: unknown;
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
	$exists: string;
}


export interface DebugExpression {
	$debug: Expression | unknown;
}

export interface PipeExpression {
	$pipe: Expression[];
}

export interface MatchesExpression {
	$matches: { [path: string]: Expression };
}

export interface SelectExpression {
	$select: { [newKey: string]: Expression };
}

export interface SortExpression {
	$sort: string | { by: string | Expression; desc?: boolean } | Array<{ by: string | Expression; desc?: boolean }>;
}

export interface MergeExpression {
	$merge: unknown | unknown[];
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
	$default: { expression: Expression; default: unknown; allowNull?: boolean };
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
	$eq: unknown;
}

export interface NotEqualExpression {
	$ne: unknown;
}

export interface GreaterThanExpression {
	$gt: number;
}

export interface GreaterThanOrEqualExpression {
	$gte: number;
}

export interface LessThanExpression {
	$lt: number;
}

export interface LessThanOrEqualExpression {
	$lte: number;
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



// === ITERATIVE EXPRESSIONS ===

export interface FilterExpression {
	$filter: Expression;
}

export interface FilterByExpression {
	$filterBy: { [path: string]: Expression };
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
	$concat: unknown[];
}

export interface JoinExpression {
	$join: string;
}

export interface ReverseExpression {
	$reverse: null;
}

// === MATH EXPRESSIONS ===

export interface AddExpression {
	$add: number[];
}

export interface SubtractExpression {
	$subtract: [number, number];
}

export interface MultiplyExpression {
	$multiply: number[];
}

export interface DivideExpression {
	$divide: [number, number];
}

export interface ModuloExpression {
	$modulo: [number, number];
}

export interface CeilExpression {
	$ceil: unknown;
}

export interface FloorExpression {
	$floor: unknown;
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
	// Math
	| AddExpression
	| SubtractExpression
	| MultiplyExpression
	| DivideExpression
	| ModuloExpression
	| CeilExpression
	| FloorExpression;

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
 * Configuration object for creating an expression engine
 */
export interface ExpressionEngineConfig {
	/** Array of expression pack objects to include */
	packs?: object[];
	/** Custom expression definitions */
	custom?: { [k: string]: (operand: unknown, inputData: unknown, context: ExpressionContext) => unknown };
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
export const math: { [k: string]: unknown };
export const object: { [k: string]: unknown };
export const projection: { [k: string]: unknown };
export const string: { [k: string]: unknown };

// === INDIVIDUAL EXPRESSION DEFINITION EXPORTS ===

// All individual expression definitions are exported via export * statements
// from their respective definition files (access, array, conditional, flow,
// math, object, predicate, string)