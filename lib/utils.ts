import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function productPath(code: string) {
  return `/product/${code.split("/").map(encodeURIComponent).join("/")}`;
}

export function decodeProductCode(segments: string[]) {
  return segments.map(decodeURIComponent).join("/");
}

export function safeProductCode(code: string) {
  return code.replace(/\./g, "-").replace(/\//g, "-");
}
