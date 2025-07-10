import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type tokenBodyType = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export type JunkenRequest = {
  accessToken: string;
  targetURL: string;
  limit: number;
  title: string;
  payload: null | {};
  method: "GET" | "POST";
};
