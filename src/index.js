// Main engine exports
export { createExpressionEngine } from "./expression-engine.js";

// Pack exports
export { aggregation as aggregationPack } from "./packs/aggregation.js";
export { allExpressionsForTesting } from "./packs/all.js";
export { array as arrayPack } from "./packs/array.js";
export { base as basePack } from "./packs/base.js";
export { comparison as comparisonPack } from "./packs/comparison.js";
export { filtering as filteringPack } from "./packs/filtering.js";
export { math as mathPack } from "./packs/math.js";
export { object as objectPack } from "./packs/object.js";
export { projection as projectionPack } from "./packs/projection.js";
export { string as stringPack } from "./packs/string.js";
export { temporal as temporalPack } from "./packs/temporal.js";

// Individual expression definitions exports (alphabetized)
export * from "./definitions/access.js";
export * from "./definitions/array.js";
export * from "./definitions/conditional.js";
export * from "./definitions/flow.js";
export * from "./definitions/math.js";
export * from "./definitions/object.js";
export * from "./definitions/predicate.js";
export * from "./definitions/string.js";
export * from "./definitions/temporal.js";
