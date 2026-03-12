import { removeFillers, type FillerResult } from "./removeFillers";
import { detectIntent, type IntentResult } from "./detectIntent";
import { applyTemplate, type ResponseLength } from "./promptTemplates";
import type { IntentRule } from "./intentStore";

export interface GeneratedPrompt {
  originalQuestion: string;
  fillerResult: FillerResult;
  intentResult: IntentResult;
  optimizedPrompt: string;
  responseLength: ResponseLength;
}

export function generatePrompt(
  question: string,
  responseLength: ResponseLength,
  translatedText?: string,
  fillers?: string[],
  intentRules?: IntentRule[]
): GeneratedPrompt {
  const fillerResult = removeFillers(question, fillers);
  const intentResult = detectIntent(fillerResult.cleanedText, intentRules);
  const contentText = translatedText ?? fillerResult.cleanedText;
  const optimizedPrompt = applyTemplate(
    contentText,
    intentResult.intent,
    responseLength
  );

  return {
    originalQuestion: question,
    fillerResult,
    intentResult,
    optimizedPrompt,
    responseLength,
  };
}
