// @/app/page.tsx
"use client"
import React, { useEffect, useState, createContext } from 'react'
import { Editor, Frame, Element, useEditor, useNode } from '@craftjs/core'
import { renderComponents } from '@/lib/componentRenderer'
// import { Canvas } from '@/components/canvas'
import { Wrapper } from '@/components/wrapper'
import { SideMenu } from '@/components/side-menu'
import { ControlPanel } from '@/components/control-panel'
import { Viewport } from '@/components/viewport'
import { componentsMap } from '@/components/node/components-map'
import { DynamicContent } from '@/components/dynamicContent';
import { componentMap } from '@/lib/component-map'
import { componentStrings } from '@/lib/test-string'
import { CodeGenerator } from '@/components/codeGenerator'
import { TextGenerator } from '@/components/textGenerator'
import { ResizableComponent } from '@/components/resizableComponent'
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { CodeGenerationContext } from '@/contexts/CodeGenerationContext'
// import { EditorContent } from '@/components/EditorContent';

interface NewContentProps {
  buttonStrings: string[];
  stage: number;
}

interface CraftComponent<T> extends React.FC<T> {
  craft: {
    displayName: string;
    props: Partial<T>;
    related: {
      toolbar: () => React.ReactElement;
    };
  };
}

const NewContent: CraftComponent<NewContentProps> = ({ buttonStrings, stage }) => {
  const { connectors: { connect, drag } } = useNode();

  const renderContent = () => {
    const combinedString = buttonStrings.slice(stage, stage + 1).join('\n');
    const ButtonComponent = renderComponents(combinedString);
		return (
      <Element 
        id="dynamic_content_container" 
        is={Container} 
        canvas 
        className={`dynamic-class-${stage}`}
      >
        {ButtonComponent}
      </Element>
    );
  };

	return (<div>{renderContent()}</div>);
  // return (
  //   <div
  //     ref={(ref) => connect(drag(ref))}
  //     className="p-2 m-1 border border-dashed border-gray-300"
  //   >
  //     {renderContent()}
  //   </div>
  // );
};

NewContent.craft = {
  displayName: '',
  props: {
    buttonStrings: [],
    stage: 0
  },
  related: {
    toolbar: () => <div>Custom Toolbar</div>
  }
};


// TextBox component
const TextBox = ({ text, className }) => {
	const {
		connectors: { connect, drag }
	} = useNode()

	return (
		<div
      ref={(ref) => connect(drag(ref)) as any}
			className={`bg-blue-100 p-2 m-2 border border-dashed border-blue-300 ${className}`}
		>
			{text}
		</div>
	)
}

TextBox.craft = {
	displayName: 'Text Box',
	props: {
		text: 'Draggable Text Box',
		className: ''
	}
}

// Container component
const Container = ({ children, className }) => {
	const {
		connectors: { connect, drag }
	} = useNode()

	return (
		<div
    ref={(ref) => connect(drag(ref)) as any}
			className={`  min-h-[100px] border border-dashed border-green-300 ${className}`}
		>
			{children}
		</div>
	)
}

Container.craft = {
	displayName: 'Container',
	props: {
		className: ''
	}
}


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
// Updated ContentUpdater component
const ContentUpdater = () => {
  const { actions, query } = useEditor();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const addComponent = () => {
      if (stage >= componentStrings.length) {
        console.log('All stages have been added.');
        return;
      }

      console.log('Adding stage:', stage);

      try {
        const currentComponentString = componentStrings[stage];
        console.log("mycomp", currentComponentString)
        const parsedComponents = renderComponents(currentComponentString);
        parsedComponents.forEach((parsedComponent) => {
          console.log("myparse", parsedComponent)
          const craftElement = createCraftElement(parsedComponent);
          console.log("mycraft", craftElement)
          if (craftElement) {
            const nodeTree = query.parseReactElement(craftElement).toNodeTree();
            console.log("mynode", nodeTree)
            actions.addNodeTree(nodeTree, 'ROOT');
          }
        });

        setStage(prevStage => prevStage + 1);
      } catch (error) {
        console.error('Error updating content:', error);
      }
    };

    // Only add the component if we haven't reached the end
    if (stage < componentStrings.length) {
      const timer = setTimeout(addComponent, 1000); // Increased delay to 1 second
      return () => clearTimeout(timer);
    }
  }, [actions, query, stage, componentStrings]);

  return null;
};

const CodeGenerationHandler = () => {
  const { actions, query } = useEditor();
  const { newGeneratedCode, setGeneratedCodes } = React.useContext(CodeGenerationContext);

  useEffect(() => {
    const convertTextGeneratorsToCodeGenerators = async () => {
      const nodes = query.getNodes();

      for (const [nodeId, node] of Object.entries(nodes)) {
        if (node.data.type === TextGenerator) {
          const parentId = node.data.parent;
          const currentIndex = query
            .node(parentId)
            .get()
            .data.nodes.indexOf(nodeId);

          try {
            const parsedComponents = renderComponents(newGeneratedCode);

            const processComponent = (component) => {
              const craftElement = createCraftElement({
                type: CodeGenerator,
                props: {
                  id: nodeId,
                  defaultCode: newGeneratedCode
                }
              });

              if (craftElement) {
                const nodeTree = query.parseReactElement(craftElement).toNodeTree();
                actions.addNodeTree(nodeTree, parentId, currentIndex);
              }
            };

            if (Array.isArray(parsedComponents)) {
              parsedComponents.forEach(processComponent);
            } else {
              processComponent(parsedComponents);
            }

            actions.delete(nodeId);

            setGeneratedCodes(prevCodes => ({
              ...prevCodes,
              [nodeId]: newGeneratedCode
            }));
          } catch (error) {
            console.error('Error updating content:', error);
          }
        }
      }
    };

    if (newGeneratedCode) {
      console.log("newGeneratedCode", newGeneratedCode)
      convertTextGeneratorsToCodeGenerators();
    }
  }, [newGeneratedCode, actions, query, setGeneratedCodes]);

  return null;
};


const App = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedId, setSelectedId] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState({});
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [generatedTexts, setGeneratedTexts] = useState({});
  const [newGeneratedCode, setNewGeneratedCode] = useState('');


  const handleGenerate = async () => {
    if (prompt.trim() === '') {
      setError('Please enter a prompt before generating code.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Add user input to chat history
    setChatHistory(prevHistory => [
      ...prevHistory,
      { id: Date.now().toString(), content: prompt, isUser: true }
    ]);
    let generatedCode = '';


    try {
      await fetchEventSource('https://api-dev.aictopusde.com/api/v1/ai/generate-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA', 
        },
        body: JSON.stringify({
          sessionId: '012580975',
          prompt,
          mode: 'DETAIL',
        }),
        async onopen(response) {
          if (!response.ok || response.headers.get('content-type') !== 'text/event-stream') {
            throw new Error('Failed to establish connection');
          }
        },
        onmessage(event) {
          const line = event.data.replace(/data:\s*/g, '');
          generatedCode += line || ' ';
          
          // Update generatedCodes for real-time display
          setGeneratedCodes(prevCodes => ({
            ...prevCodes,
            [selectedId]: generatedCode
          }));
        },
        onerror(err) {
          throw err;
        },
        onclose() {
          setIsGenerating(false);
          
          // Add final generated code to chat history
          setChatHistory(prevHistory => [
            ...prevHistory,
            { id: Date.now().toString(), content: generatedCode, isUser: false }
          ]);

          setNewGeneratedCode(generatedCode);


          // Update generatedCodes with the final result
          setGeneratedCodes(prevCodes => ({
            ...prevCodes,
            [selectedId]: generatedCode
          }));
        },
        openWhenHidden: true,

      });

    } catch (error) {
      console.error('Error generating code:', error);
      setError('An error occurred while generating code. Please try again.');
      setIsGenerating(false);

      // Add error message to chat history
      setChatHistory(prevHistory => [
        ...prevHistory,
        { id: Date.now().toString(), content: 'Error: Failed to generate code.', isUser: false }
      ]);
    }
  };


  const sendCodeToBackend = async (id: string, code: string) => {
    console.log(`Sending code for id ${id} to backend:`, code);
    // Implementation for sending code to backend
  };

  const getAllGeneratedCodes = () => {
    return generatedCodes;
  };

  const contextValue = {
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    generatedCodes,
    setGeneratedCodes,
    error,
    setError,
    handleGenerate,
    selectedId,
    setSelectedId,
    sendCodeToBackend,
    getAllGeneratedCodes,
    generatedTexts,
    setGeneratedTexts,
    newGeneratedCode,
    setNewGeneratedCode,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleGenerate();
    }
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


  return (
    <CodeGenerationContext.Provider value={contextValue}>
      <div className="p-4 pb-20">
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <Editor
          resolver={{
            ...componentMap,
            CodeGenerator,
            TextGenerator,
            // EditorContent,
            ResizableComponent,
            Wrapper,
          }}
        >
          <div className="flex flex-1 relative overflow-hidden">
            <SideMenu componentsMap={componentsMap} />
            <Viewport>
              <Frame>
              {/* <EditorContent /> */}
              

                <Element is={Wrapper} canvas id="root_wrapper">
                  <Element is={DynamicContent} id="dynamic_content">{null}</Element>
                </Element>
              </Frame>
            </Viewport>
            {/* <ControlPanel /> */}
          </div>
          <CodeGenerationHandler />
          <ContentUpdater />
        </Editor>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-transparen dark:bg-zinc-900 shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            chatHistory={chatHistory}
          />
        </div>
      </div>

    </CodeGenerationContext.Provider>
  );
};


export default App