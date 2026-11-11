import { clsx, type ClassValue } from "clsx";

/**
 * Combines class names conditionally using clsx.
 *
 * @param inputs - List of class names, conditionals, or objects.
 * @returns Combined CSS class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
