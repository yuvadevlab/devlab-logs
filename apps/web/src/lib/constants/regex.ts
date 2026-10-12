/**
 * @file apps/web/src/lib/constants/regex.ts
 * @description Centralized regular expressions for telemetry parsing, SQL formatting, and search.
 * Adheres strictly to the centralized regex architectural invariant (zero ad-hoc inline regexes).
 * @module @devlab/logs-web/constants/regex
 */

export const REGEX = {
  DIGITS: /\d+/g,
  SQL_KEYWORDS:
    /\b(SELECT|FROM|WHERE|GROUP|BY|ORDER|LIMIT|AS|IN|AND|OR|DESC|ASC|FILTER|COUNT|AVG|MAX|MIN|QUANTILE_CONT|DATE_TRUNC|REGEXP_REPLACE)\b/gi,
  SQL_STRINGS: /('[^']*')/g,
  SQL_NUMBERS: /\b(\d+(?:\.\d+)?)\b/g,
  HTML_AMP: /&/g,
  HTML_LT: /</g,
} as const;
