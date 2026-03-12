import { DEFAULT_FILLERS } from "./fillerStore";

export interface FillerResult {
  cleanedText: string;
  removedFillers: string[];
}

export function removeFillers(question: string, fillers: string[] = DEFAULT_FILLERS): FillerResult {
  const removedFillers: string[] = [];
  let cleanedText = question;

  for (const filler of fillers) {
    if (cleanedText.includes(filler)) {
      removedFillers.push(filler);
      cleanedText = cleanedText.replaceAll(filler, "");
    }
  }

  cleanedText = cleanedText.replace(/\s{2,}/g, " ").trim();

  return { cleanedText, removedFillers };
}
