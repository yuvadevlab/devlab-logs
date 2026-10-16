import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind and utility class names safely using clsx and twMerge.
 *
 * @param inputs - List of class names, conditionals, or objects.
 * @returns Combined and deduplicated CSS class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
