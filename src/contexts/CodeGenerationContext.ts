// @/contexts/CodeGenerationContext.ts
import { createContext, Dispatch, SetStateAction } from 'react';

type CodeGenerationContextType = {
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  generatedCodes: Record<string, string>;
  setGeneratedCodes: Dispatch<SetStateAction<Record<string, string>>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  handleGenerate: () => Promise<void>;
  selectedId: string;
  setSelectedId: Dispatch<SetStateAction<string>>;
  sendCodeToBackend: (id: string, code: string) => Promise<void>;
  getAllGeneratedCodes: () => Record<string, string>;
  generatedTexts: Record<string, string>;
  setGeneratedTexts: Dispatch<SetStateAction<Record<string, string>>>;
  newGeneratedCode: string;
  setNewGeneratedCode: Dispatch<SetStateAction<string>>;
};

export const CodeGenerationContext = createContext<CodeGenerationContextType | undefined>(undefined);