// lib/types.ts
export type CVType = "finance-conseil" | "general";

export type SuggestionType = "content"; // Removed "visual" type

export interface Suggestion {
  type: SuggestionType;
  title: string;
  description: string;
}

export interface AnalysisResult {
  summary: string;
  suggestions: Suggestion[];
  rating?: number;
}
