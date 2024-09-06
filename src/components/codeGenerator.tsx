// @/components/codeGenerator.tsx
import React from 'react';
import { useNode } from '@craftjs/core';
import {
  Sandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useCodeGenerationContext } from '@/hooks/useCodeGenerationContext';

const fallbackCode = `export default function App() {
  return <h1>Welcome to the AI Code!</h1>
}`;

export const CodeGenerator = ({ id, defaultCode }) => {
  const { connectors: { connect, drag }} = useNode();
  const { generatedCodes, isGenerating, selectedId, sendCodeToBackend } = useCodeGenerationContext();
  console.log('!!!', defaultCode);
  // Use the id to determine which code to display
  const codeToDisplay = generatedCodes[id] || defaultCode || fallbackCode;

  const handleClick = async () => {
    console.log(`Code for id ${id}:`, codeToDisplay);
    await sendCodeToBackend(id, codeToDisplay);
  };

  return (
    <div 
      ref={(ref) => connect(drag(ref) as any)}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={handleClick}
    >
      <SandpackProvider
        template="react"
        files={{
          "/App.js": {
            code: codeToDisplay,
            active: true
          },
        }}
        customSetup={{
          dependencies: {
            "react": "^18.0.0",
            "react-dom": "^18.0.0"
          }
        }}
      >
        <SandpackLayout>
          <SandpackPreview style={{ height: '1000px' }} />
          <SandpackCodeEditor 
            showLineNumbers
            style={{ height: '1000px' }}
            readOnly={isGenerating && id === selectedId} 
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

CodeGenerator.craft = {
  displayName: 'AI Code Generator',
  props: {
    defaultCode: ''
  },
  related: {
    toolbar: () => (
      <div>
        <h3 className="text-sm font-bold mb-2">AI Code Generator Settings</h3>
        <p className="text-xs">Customize settings as needed</p>
      </div>
    ),
  },
};