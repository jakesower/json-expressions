export type ApplyFn = (value: any, inputData: any) => any;

export type ExecContext = {
	apply: ApplyFn;
	isExpression: (val: any) => boolean;
	isWrappedLiteral: (val: any) => boolean;
};

type IsNever<T> = [T] extends [never] ? true : false;

type IsUnion<T, U = T> =
	IsNever<T> extends true
		? false
		: T extends U
			? IsNever<Exclude<U, T>> extends true
				? false
				: true
			: false;

type Moo<T = number> = T;
const bad1: Moo = "bad";
const good1: Moo = 5;

type Object = { [k: string]: any };

type SingleKeyObject<T = Object, K = keyof T> =
	IsNever<K> extends true ? never : IsUnion<K> extends true ? never : T;

const skoBad1: SingleKeyObject = {};
const skoBad2: SingleKeyObject = { this: "OK", that: "nope" };
const skoBad3: SingleKeyObject = 3;
const skoGood: SingleKeyObject = { this: "OK" };

const skoishGood: SingleKeyObject<{ a: string }> = { a: "car" };

type SKOFn = <T>(obj: SingleKeyObject<T>) => any;
const skaFn: SKOFn = (obj) => "hi";
const skaFnBad = skaFn({});
const skaFnBad2 = skaFn({ this: "OK", that: "nope" });
const skaFnGood = skaFn({ this: "OK" });

type SKOFn2 = (obj: SingleKeyObject<{ [k: string]: any }>) => any;
const skaFn2: SKOFn2 = (obj) => "hi";
const skaFn2Bad = skaFn2({});
const skaFn2Bad2 = skaFn2({ this: "OK", that: "nope" });
const skaFn2Good = skaFn2({ this: "OK" });

type SKOResolved<T = Object> = T extends SingleKeyObject<T> ? T : never;
const skoResolvedBad: SKOResolved = "hi";
const skoResolvedBad2: SKOResolved = { this: "OK", that: "nope" };
const skoResolvedGood: SKOResolved<{ [k: string]: any }> = { this: "OK" };

type DollarSignPrefixed = `$${string}`;

type Foo = Record<DollarSignPrefixed, any>;
const fooBad: Foo = { no: "way" };
const fooGood: Foo = { $yes: "way" };

type AOrB = { a: any } | { b: any } | { [k: string]: any };
type RCOAOrB<T> = T extends SingleKeyObject<T> ? T : never;
const rcoPlusBad1: RCOAOrB<AOrB> = { c: "thing" };
const rcoPlusGood: RCOAOrB<AOrB> = { a: "thing" };

// weird
type DSPObj = Record<DollarSignPrefixed, any>;
const dspBad = { not: "this" };

// also weird
type DSPObj2 = { [k: DollarSignPrefixed]: any };
const dsp2Bad = { not: "this" };


type Expression = SingleKeyObject<Record<DollarSignPrefixed, any>>;
const expressionBad: Expression = { hi: 3 };
const expressionBad2: Expression = { $one: "hi", $two: "nope" };
const expressionGood: Expression = { $this: "that" };

export type ExpressionDefinition<Operand, InputData, Return> = (
	operand: Operand,
	inputData: InputData,
	execContext?: ExecContext,
) => Return;
