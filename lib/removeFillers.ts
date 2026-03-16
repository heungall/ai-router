import { DEFAULT_FILLERS } from "./fillerStore";

export interface FillerResult {
  cleanedText: string;
  removedFillers: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function removeFillers(question: string, fillers: string[] = DEFAULT_FILLERS): FillerResult {
  if (fillers.length === 0) {
    return { cleanedText: question.trim(), removedFillers: [] };
  }

  const removedFillers: string[] = [];
  const pattern = new RegExp(fillers.map(escapeRegExp).join("|"), "g");
  const cleanedText = question
    .replace(pattern, (match) => {
      if (!removedFillers.includes(match)) removedFillers.push(match);
      return "";
    })
    .replace(/\s{2,}/g, " ")
    .trim();

  return { cleanedText, removedFillers };
}
