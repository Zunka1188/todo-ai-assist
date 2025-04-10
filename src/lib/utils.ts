
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for conditionally joining class names together
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date relative to the current time (e.g., "3 days ago", "in 2 hours")
 * @param date - The date to format
 * @param now - Optional reference date, defaults to current time
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const absDiffDays = Math.abs(diffDays);
  const absDiffHours = Math.abs(diffHours);
  const absDiffMins = Math.abs(diffMins);

  if (diffDays > 0) {
    return absDiffDays === 1 ? 'in 1 day' : `in ${absDiffDays} days`;
  } else if (diffDays < 0) {
    return absDiffDays === 1 ? '1 day ago' : `${absDiffDays} days ago`;
  } else if (diffHours > 0) {
    return absDiffHours === 1 ? 'in 1 hour' : `in ${absDiffHours} hours`;
  } else if (diffHours < 0) {
    return absDiffHours === 1 ? '1 hour ago' : `${absDiffHours} hours ago`;
  } else if (diffMins > 0) {
    return absDiffMins === 1 ? 'in 1 minute' : `in ${absDiffMins} minutes`;
  } else if (diffMins < 0) {
    return absDiffMins === 1 ? '1 minute ago' : `${absDiffMins} minutes ago`;
  } else {
    return diffSecs >= 0 ? 'just now' : 'just now';
  }
}

