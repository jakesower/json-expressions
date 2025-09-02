import { isEqual } from "es-toolkit";

/**
 * Creates a comparative expression that applies a comparison function to resolved operands.
 *
 * @param {function(any, any): boolean} compareFn - Function that takes two values and returns a boolean comparison result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createComparativeExpression = (compareFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    return compareFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    const [left, right] = operand;
    return compareFn(evaluate(left), evaluate(right));
  },
});

/**
 * Creates an inclusion expression that checks if a value is in/not in an array.
 *
 * @param {function(any, Array): boolean} inclusionFn - Function that takes a value and array and returns boolean
 * @param {string} expressionName - Name of the expression for error messages
 * @returns {object} Expression object with apply and evaluate methods
 */
const createInclusionExpression = (expressionName, inclusionFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    if (!Array.isArray(resolvedOperand)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    const [array, value] = evaluate(operand);
    if (!Array.isArray(array)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(value, array);
  },
});

const $eq = createComparativeExpression((a, b) => isEqual(a, b));
const $ne = createComparativeExpression((a, b) => !isEqual(a, b));
const $gt = createComparativeExpression((a, b) => a > b);
const $gte = createComparativeExpression((a, b) => a >= b);
const $lt = createComparativeExpression((a, b) => a < b);
const $lte = createComparativeExpression((a, b) => a <= b);

const $in = createInclusionExpression("$in", (value, array) =>
  array.includes(value),
);
const $nin = createInclusionExpression(
  "$nin",
  (value, array) => !array.includes(value),
);

/**
 * Tests if a string matches a regular expression pattern.
 *
 * **Uses PCRE (Perl Compatible Regular Expression) semantics** as the canonical standard
 *
 * Supports inline flags using the syntax (?flags)pattern where flags can be:
 * - i: case insensitive matching
 * - m: multiline mode (^ and $ match line boundaries)
 * - s: dotall mode (. matches newlines)
 *
 * PCRE defaults (when no flags specified):
 * - Case-sensitive matching
 * - ^ and $ match string boundaries (not line boundaries)
 * - . does not match newlines
 *
 * @example
 * // Basic pattern matching
 * apply("hello", "hello world") // true
 * apply("\\d+", "abc123") // true
 *
 * @example
 * // With inline flags
 * apply("(?i)hello", "HELLO WORLD") // true (case insensitive)
 * apply("(?m)^line2", "line1\nline2") // true (multiline)
 * apply("(?s)hello.world", "hello\nworld") // true (dotall)
 * apply("(?ims)^hello.world$", "HELLO\nWORLD") // true (combined flags)
 *
 * @example
 * // In WHERE clauses
 * { name: { $matchesRegex: "^[A-Z].*" } } // Names starting with capital letter
 * { email: { $matchesRegex: "(?i).*@example\\.com$" } } // Case-insensitive email domain check
 */
const $matchesRegex = {
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    const pattern = resolvedOperand;
    if (typeof inputData !== "string") {
      throw new Error("$matchesRegex requires string input");
    }

    // Extract inline flags and clean pattern
    const flagMatch = pattern.match(/^\(\?([ims]*)\)(.*)/);
    if (flagMatch) {
      const [, flags, patternPart] = flagMatch;
      let jsFlags = "";

      if (flags.includes("i")) jsFlags += "i";
      if (flags.includes("m")) jsFlags += "m";
      if (flags.includes("s")) jsFlags += "s";

      const regex = new RegExp(patternPart, jsFlags);
      return regex.test(inputData);
    }

    // Check for unsupported inline flags and strip them
    const unsupportedFlagMatch = pattern.match(/^\(\?[^)]*\)(.*)/);
    if (unsupportedFlagMatch) {
      const [, patternPart] = unsupportedFlagMatch;
      const regex = new RegExp(patternPart);
      return regex.test(inputData);
    }

    // No inline flags - use PCRE defaults
    const regex = new RegExp(pattern);
    return regex.test(inputData);
  },
  evaluate: (operand, { evaluate }) => {
    const [pattern, inputData] = operand;
    const resolvedPattern = evaluate(pattern);
    const resolvedInputData = evaluate(inputData);
    if (typeof resolvedInputData !== "string") {
      throw new Error("$matchesRegex requires string input");
    }

    // Extract inline flags and clean pattern
    const flagMatch = resolvedPattern.match(/^\(\?([ims]*)\)(.*)/);
    if (flagMatch) {
      const [, flags, patternPart] = flagMatch;
      let jsFlags = "";

      if (flags.includes("i")) jsFlags += "i";
      if (flags.includes("m")) jsFlags += "m";
      if (flags.includes("s")) jsFlags += "s";

      const regex = new RegExp(patternPart, jsFlags);
      return regex.test(resolvedInputData);
    }

    // Check for unsupported inline flags and strip them
    const unsupportedFlagMatch = resolvedPattern.match(/^\(\?[^)]*\)(.*)/);
    if (unsupportedFlagMatch) {
      const [, patternPart] = unsupportedFlagMatch;
      const regex = new RegExp(patternPart);
      return regex.test(resolvedInputData);
    }

    // No inline flags - use PCRE defaults
    const regex = new RegExp(resolvedPattern);
    return regex.test(resolvedInputData);
  },
};

/**
 * Tests if a string matches a SQL LIKE pattern.
 *
 * Provides database-agnostic LIKE pattern matching with SQL standard semantics:
 * - % matches any sequence of characters (including none)
 * - _ matches exactly one character
 * - Case-sensitive matching (consistent across databases)
 *
 * @example
 * // Basic LIKE patterns
 * apply("hello%", "hello world") // true
 * apply("%world", "hello world") // true
 * apply("h_llo", "hello") // true
 * apply("h_llo", "hallo") // true
 *
 * @example
 * // In WHERE clauses
 * { name: { $matchesLike: "John%" } } // Names starting with "John"
 * { email: { $matchesLike: "%@gmail.com" } } // Gmail addresses
 * { code: { $matchesLike: "A_B_" } } // Codes like "A1B2", "AXBY"
 */
const $matchesLike = createComparativeExpression((inputData, pattern) => {
  if (typeof inputData !== "string") {
    throw new Error("$matchesLike requires string input");
  }

  // Convert SQL LIKE pattern to JavaScript regex
  let regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape regex special chars
    .replace(/%/g, ".*") // % becomes .*
    .replace(/_/g, "."); // _ becomes .

  // Anchor the pattern to match the entire string
  regexPattern = "^" + regexPattern + "$";

  const regex = new RegExp(regexPattern);
  return regex.test(inputData);
});

/**
 * Tests if a string matches a Unix shell GLOB pattern.
 *
 * Provides database-agnostic GLOB pattern matching with Unix shell semantics:
 * - * matches any sequence of characters (including none)
 * - ? matches exactly one character
 * - [chars] matches any single character in the set
 * - [!chars] or [^chars] matches any character not in the set
 * - Case-sensitive matching
 *
 * @example
 * // Basic GLOB patterns
 * apply("hello*", "hello world") // true
 * apply("*world", "hello world") // true
 * apply("h?llo", "hello") // true
 * apply("h?llo", "hallo") // true
 * apply("[hw]ello", "hello") // true
 * apply("[hw]ello", "wello") // true
 * apply("[!hw]ello", "bello") // true
 *
 * @example
 * // In WHERE clauses
 * { filename: { $matchesGlob: "*.txt" } } // Text files
 * { name: { $matchesGlob: "[A-Z]*" } } // Names starting with capital
 * { code: { $matchesGlob: "IMG_[0-9][0-9][0-9][0-9]" } } // Image codes
 */
const $matchesGlob = createComparativeExpression((inputData, pattern) => {
  if (typeof inputData !== "string") {
    throw new Error("$matchesGlob requires string input");
  }

  // Convert GLOB pattern to JavaScript regex
  let regexPattern = "";
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === "*") {
      regexPattern += ".*";
    } else if (char === "?") {
      regexPattern += ".";
    } else if (char === "[") {
      // Handle character classes
      let j = i + 1;
      let isNegated = false;

      // Check for negation
      if (j < pattern.length && (pattern[j] === "!" || pattern[j] === "^")) {
        isNegated = true;
        j++;
      }

      // Find the closing bracket
      let classContent = "";
      while (j < pattern.length && pattern[j] !== "]") {
        classContent += pattern[j];
        j++;
      }

      if (j < pattern.length) {
        // Valid character class
        regexPattern +=
          "[" +
          (isNegated ? "^" : "") +
          classContent.replace(/\\/g, "\\\\") +
          "]";
        i = j;
      } else {
        // No closing bracket, treat as literal
        regexPattern += "\\[";
      }
    } else {
      // Escape regex special characters
      regexPattern += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    i++;
  }

  // Anchor the pattern to match the entire string
  regexPattern = "^" + regexPattern + "$";

  const regex = new RegExp(regexPattern);
  return regex.test(inputData);
});

export const comparativeDefinitions = {
  $eq,
  $gt,
  $gte,
  $lt,
  $lte,
  $ne,
  $in,
  $nin,
  $matchesRegex,
  $matchesLike,
  $matchesGlob,
};
