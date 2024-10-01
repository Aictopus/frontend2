// @/components/codeGenerator.tsx
import React, { useState, useCallback, useContext } from 'react';
import { useNode, useEditor, Editor, Element } from '@craftjs/core';
import {
  Sandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SandpackRenderer } from '@/components/SandpackRenderer';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { CodeGenerationContext } from '@/contexts/CodeGenerationContext';
import styles from './dialog.module.css';
import { componentMap, componentNameMap } from '@/lib/component-map'
import { renderComponents } from '@/lib/componentRenderer'

const fallbackCode = `export default function App() {
  return <h1>Welcome to the AI Code!</h1>
}`;

const createCraftElement = (component) => {
  if (typeof component !== 'object' || component === null) {
    return component;
  }

  const { type, props } = component;
  const Component = componentMap[type] || type;

  if (!Component) {
    console.error(`Component type "${type}" not found in componentMap`);
    return null;
  }

  const craftProps = { ...props };

  if (props && props.children) {
    craftProps.children = Array.isArray(props.children)
      ? props.children.map(createCraftElement)
      : createCraftElement(props.children);
  }

  return (
    <Element canvas is={Component} {...craftProps}>
      {craftProps.children}
    </Element>
  );
};

export const CodeGenerator = ({ id, defaultCode }) => {

  const { active, related, query, actions } = useEditor((state, query) => ({
    active: query.getEvent('selected').first(),
    related: state.nodes[query.getEvent('selected').first()]?.related
  }))

  const { connectors: { connect, drag }} = useNode();
  const { 
    generatedCodes, 
    setGeneratedCodes,
    isGenerating, 
    selectedId, 
    sendCodeToBackend,
    prompt,
    setPrompt,
    handleGenerate,
    // chatHistory,
    // setChatHistory
  } = useContext(CodeGenerationContext);
  
  const codeToDisplay = generatedCodes[id] || defaultCode || fallbackCode;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [codeVariants, setCodeVariants] = useState([]);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false)



  const generateCodeVariant = useCallback(async (originalCode, index) => {
    try {
      let variantCode = '';
      setCodeVariants(prev => {
        const newVariants = [...prev];
        newVariants[index] = { code: '', isGenerating: true };
        return newVariants;
      });

      await fetchEventSource('https://api-dev.aictopusde.com/api/v1/ai/generate-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA', 
        },
        body: JSON.stringify({
          sessionId: `variant_${index}_${Date.now()}`,
          prompt: `Generate a variant of the following code that has similar functionality but different implementation:\n\n${originalCode}`,
          mode: 'DETAIL',
        }),
        async onopen(response) {
          if (!response.ok || response.headers.get('content-type') !== 'text/event-stream') {
            throw new Error('Failed to establish connection');
          }
        },
        onmessage(event) {
          const line = event.data.replace(/data:\s*/g, '');
          variantCode += line || ' ';
          setCodeVariants(prev => {
            const newVariants = [...prev];
            newVariants[index] = { code: variantCode, isGenerating: true };
            return newVariants;
          });
        },
        onerror(err) {
          console.error('Error in fetchEventSource:', err);
          throw err;
        },
        onclose() {
          setCodeVariants(prev => {
            const newVariants = [...prev];
            newVariants[index] = { code: variantCode, isGenerating: false };
            return newVariants;
          });
        },
        openWhenHidden: true,
      });
    } catch (error) {
      console.error('Error generating code variant:', error);
      setError('An error occurred while generating code variants. Please try again.');
      setCodeVariants(prev => {
        const newVariants = [...prev];
        newVariants[index] = { code: '', isGenerating: false };
        return newVariants;
      });
    }
  }, []);

  const handleGenerateVariants = async () => {
    setError(null);
    setCodeVariants(Array(5).fill({ code: '', isGenerating: true }));
    setIsDialogOpen(true);

    try {
      for (let i = 0; i < 5; i++) {
        await generateCodeVariant(codeToDisplay, i);
      }
    } catch (error) {
      console.error('Error generating variants:', error);
      setError('An error occurred while generating code variants. Please try again.');
    }
  };



  const handleFullReplace = (variantCode) => {
    console.log('called', variantCode)
    if (active && active !== 'ROOT') {
      const node = query.node(active).get();
      if (node.data.displayName === 'AI Code Generator') {
        setGeneratedCodes(prevCodes => ({
          ...prevCodes,
          [node.data.props.id]: variantCode
        }));
      } else {
      const parentId = node.data.parent
      const currentIndex = query
        .node(parentId)
        .get()
        .data.nodes.indexOf(active)

      try {
        const parsedComponents = renderComponents(variantCode)

        const processComponent = (component) => {
          const craftElement = createCraftElement(component)

          if (craftElement) {
            console.log('craftElement', craftElement)
            const nodeTree = query.parseReactElement(craftElement).toNodeTree()
            actions.addNodeTree(nodeTree, parentId, currentIndex)
            console.log('nodeTree', nodeTree)
          }
        }

        console.log('Parsed components:', parsedComponents)

        if (Array.isArray(parsedComponents)) {
          console.log('!')
          parsedComponents.forEach(processComponent)
        } else {
          console.log('!!')
          processComponent(parsedComponents)
        }

        // Delete the old node
        actions.delete(active)
      } catch (error) {
        console.error('Error updating content:', error)
      }
    }
    setIsOpen(false)
  }
}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerate();
  };

  const placeholders = [
    "Enter your prompt...",
    "Describe your component...",
    "What would you like to create?",
    "Type your idea here...",
  ];

  const chatHistory = [];

  // const filesToDisplay = files || {
    const filesToDisplay = {
    "/App.js": {
      code: defaultCode || fallbackCode,
      active: true
    }
  };

  return (
    <div 
      ref={(ref) => connect(drag(ref) as any)}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="absolute top-2 right-2 z-10"
            onClick={handleGenerateVariants}
          >
            -
          </Button>
        </DialogTrigger>
        <DialogContent showOverlay={false} className="max-w-3xl max-h-[80vh] overflow-auto bg-white dark:bg-gray-800">
          <DialogHeader>
            {/* <DialogTitle>Code Variants</DialogTitle> */}
          </DialogHeader>
          <div className="p-4">
          <div className="mb-6">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                chatHistory={chatHistory}
                functionList={[]}
                // showChatHistory={false}
              />
            </div>
            {/* <h4 className="text-sm font-semibold mt-4 mb-2">Original Code:</h4> */}
            <SandpackRenderer 
              code={codeToDisplay} 
              isGenerating={false}
            />
            {/* <h4 className="text-sm font-semibold mt-6 mb-2">Code Variants:</h4> */}
            {codeVariants.map((variant, index) => (
              <div key={index} className="mb-4 ">
                <SandpackRenderer 
                  code={variant.code} 
                  isGenerating={variant.isGenerating}
                />
                <Button
                  variant="default"
                  className="mt-2"
                  onClick={() => handleFullReplace(variant.code)}
                  disabled={variant.isGenerating || !variant.code}
                >
                  Full Replace
                </Button>
              </div>
            ))}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>

      <SandpackProvider
        template="react"
        files={{
          "/App.js": {
            code: codeToDisplay,
            active: true
          },
        }}
        // files={filesToDisplay}
        customSetup={{
          dependencies: {
            "react": "^18.0.0",
            "react-dom": "^18.0.0"
          }
        }}
      >
        <SandpackLayout>
          <SandpackPreview style={{ height: '500px' }} />
          <SandpackCodeEditor 
            showLineNumbers
            style={{ height: '500px' }}
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