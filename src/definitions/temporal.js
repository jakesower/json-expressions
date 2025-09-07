/**
 * Creates a temporal expression that generates time-based values without needing operands or input data.
 * @param {function(): any} generateFn - Function that generates a time-based value
 * @returns {object} Expression object with apply and evaluate methods
 */
const createTemporalExpression = (generateFn) => ({
  apply: generateFn,
  evaluate: generateFn,
});

const $nowLocal = createTemporalExpression(() => {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return now.toISOString().slice(0, -1) + sign + hours + ":" + minutes;
});

const $nowUTC = createTemporalExpression(() => new Date().toISOString());

const $timestamp = createTemporalExpression(() => Date.now());

/**
 * Internal helper to add time to a date.
 * @param {Date} date - The base date
 * @param {number} amount - The amount to add
 * @param {string} unit - The unit (milliseconds, seconds, minutes, hours, days, weeks, months, years)
 * @returns {Date} New date with time added
 */
const addTimeToDate = (date, amount, unit) => {
  switch (unit) {
    case "milliseconds":
      return new Date(date.getTime() + amount);
    case "seconds":
      return new Date(date.getTime() + amount * 1000);
    case "minutes":
      return new Date(date.getTime() + amount * 60 * 1000);
    case "hours":
      return new Date(date.getTime() + amount * 60 * 60 * 1000);
    case "days":
      return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
    case "weeks":
      return new Date(date.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
    case "months": {
      const result = new Date(date);
      result.setMonth(result.getMonth() + amount);
      return result;
    }
    case "years": {
      const result = new Date(date);
      result.setFullYear(result.getFullYear() + amount);
      return result;
    }
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

const $timeAdd = {
  apply: (operand, inputData, { apply }) => {
    const { amount, unit } = apply(operand, inputData);
    const date = new Date(inputData);
    return addTimeToDate(date, amount, unit);
  },
  evaluate: (operand, { evaluate }) => {
    const { date, amount, unit } = evaluate(operand);
    const dateObj = new Date(date);
    return addTimeToDate(dateObj, amount, unit);
  },
};

/**
 * Internal helper to convert millisecond difference to specified unit.
 * @param {number} diffMs - Difference in milliseconds
 * @param {string} unit - The unit to convert to
 * @returns {number} The difference in the specified unit
 */
const convertTimeDifference = (diffMs, unit) => {
  switch (unit) {
    case "milliseconds":
      return diffMs;
    case "seconds":
      return Math.floor(diffMs / 1000);
    case "minutes":
      return Math.floor(diffMs / (60 * 1000));
    case "hours":
      return Math.floor(diffMs / (60 * 60 * 1000));
    case "days":
      return Math.floor(diffMs / (24 * 60 * 60 * 1000));
    case "weeks":
      return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

const $timeDiff = {
  apply: (operand, inputData, { apply }) => {
    const { endDate, unit = "milliseconds" } = apply(operand, inputData);
    const startDate = new Date(inputData);
    const end = new Date(endDate);
    const diffMs = end.getTime() - startDate.getTime();
    return convertTimeDifference(diffMs, unit);
  },
  evaluate: (operand, { evaluate }) => {
    const { startDate, endDate, unit = "milliseconds" } = evaluate(operand);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    return convertTimeDifference(diffMs, unit);
  },
};

/**
 * Internal helper to format a date according to a format string.
 * @param {Date} date - The date to format
 * @param {string} format - The format type (iso, date, time)
 * @returns {string} The formatted date string
 */
const formatDate = (date, format) => {
  return date.toLocaleString("en-US", {
    ...(format === "iso" && {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    ...(format === "date" && {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    ...(format === "time" && {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  });
};

const $formatTime = {
  apply: (operand, inputData, { apply }) => {
    const format = apply(operand, inputData);
    const date = new Date(inputData);
    return formatDate(date, format);
  },
  evaluate: (operand, { evaluate }) => {
    const { date, format } = evaluate(operand);
    const dateObj = new Date(date);
    return formatDate(dateObj, format);
  },
};

// Individual exports for tree shaking
export { $nowLocal, $nowUTC, $timestamp, $timeAdd, $timeDiff, $formatTime };
