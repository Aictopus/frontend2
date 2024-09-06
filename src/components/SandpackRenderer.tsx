import React, { useState, useEffect } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Button } from '@/components/ui/button';

interface SandpackRendererProps {
  code: string;
  isGenerating?: boolean;
}

export const SandpackRenderer: React.FC<SandpackRendererProps> = ({ code, isGenerating = false }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [showCode, setShowCode] = useState(!isComplete);

  useEffect(() => {
    if (code && !isGenerating) {
      setIsComplete(true);
      setShowCode(false);
    } else {
      setIsComplete(false);
      setShowCode(true);
    }
  }, [code, isGenerating]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <SandpackProvider
        template="react"
        files={{
          "/App.js": {
            code: code || '// Generating code...',
            active: true
          },
        }}
        customSetup={{
          dependencies: {
            "react": "^18.0.0",
            "react-dom": "^18.0.0"
          }
        }}
        options={{
          classes: {
            "sp-layout": "!bg-transparent",
            "sp-editor": "!border !rounded-md !overflow-hidden",
            "sp-preview": "!border !rounded-md !overflow-hidden",
          }
        }}
      >
        <SandpackLayout>
          {showCode && (
            <SandpackCodeEditor 
              showLineNumbers 
              readOnly
              wrapContent
              style={{ height: '300px', width: '100%' }}
            />
          )}
          {!showCode && (
            <SandpackPreview style={{ height: '300px', width: '100%' }} />
          )}
        </SandpackLayout>
      </SandpackProvider>
      {isComplete && (
        <Button 
          onClick={() => setShowCode(!showCode)} 
          className="mt-2"
        >
          {showCode ? 'Show Preview' : 'Show Code'}
        </Button>
      )}
    </div>
  );
};