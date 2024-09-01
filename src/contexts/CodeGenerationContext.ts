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
};

export const CodeGenerationContext = createContext<CodeGenerationContextType | undefined>(undefined);