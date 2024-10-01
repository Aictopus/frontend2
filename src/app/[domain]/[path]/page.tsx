// @/app/page.tsx
"use client"
import React, { useEffect, useState, createContext } from 'react'
import { Editor, Frame, Element, useEditor, useNode } from '@craftjs/core'
import { renderComponents } from '@/lib/componentRenderer'
// import { Canvas } from '@/components/canvas'
import { Wrapper } from '@/components/wrapper'
import { SideMenu } from '@/components/side-menu'
// import { ControlPanel } from  '@/components/control-panel'
import { Viewport } from '@/components/viewport'
import { componentsMap } from '@/components/node/components-map'
import { DynamicContent } from '@/components/dynamicContent';
import { componentMap } from '@/lib/component-map'
import { CodeGenerator } from '@/components/codeGenerator'
import { TextGenerator } from '@/components/textGenerator'
import { ResizableComponent } from '@/components/resizableComponent'
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { CodeGenerationContext } from '@/contexts/CodeGenerationContext'
// import { EditorContent } from '@/components/EditorContent';

interface PageData {
  id: string;
  componentStrings: string[];
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
const ContentUpdater = ({ currentPage }) => {
  const { actions, query } = useEditor();
  const [stage, setStage] = useState(0);

  // Move clearCurrentContent outside of useEffect
  const clearCurrentContent = () => {
    const nodes = query.getNodes();
    Object.keys(nodes).forEach((nodeId) => {
      if (nodeId !== 'ROOT' && nodes[nodeId].data.parent === 'ROOT') {
        actions.delete(nodeId);
      }
    });
  };
  

  // Add useEffect to reset stage and clear content when currentPage changes
  useEffect(() => {
    setStage(0);
    clearCurrentContent();
  }, [currentPage]);

  useEffect(() => {
    const addComponent = () => {
      if (stage === currentPage.componentStrings.length) {
        console.log('All stages have been added.');
        return;
      }

      console.log('Adding stage:', stage);

      try {
        const currentComponentString = currentPage.componentStrings[stage];
        const parsedComponents = renderComponents(currentComponentString);
        parsedComponents.forEach((parsedComponent) => {
          const craftElement = createCraftElement(parsedComponent);
          if (craftElement) {
            const nodeTree = query.parseReactElement(craftElement).toNodeTree();
            actions.addNodeTree(nodeTree, 'ROOT');
          }
        });

        setStage((prevStage) => prevStage + 1);

        if (stage === currentPage.componentStrings.length - 1) {
          console.log('All stages have been added!');
          return;
        }
      } catch (error) {
        console.error('Error updating content:', error);
      }
    };

    if (stage < currentPage.componentStrings.length) {
      const timer = setTimeout(addComponent, 100);
      return () => clearTimeout(timer);
    }
  }, [actions, query, stage, currentPage.componentStrings]);

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

  const [pagesData, setPagesData] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<PageData | null>(null);

  const [pageStages, setPageStages] = useState(pagesData.map(() => 0));
  const [functionList, setFunctionList] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    handlePageChange(currentPageIndex);
  }, []);


 // 在组件挂载时获取页面数据
 useEffect(() => {
  const fetchPagesData = async () => {
    try {
      const pageIds = ['page1', 'page2', 'page3'];
      const pagesPromises = pageIds.map(async (pageId) => {
        const response = await fetch(`/api/pages/${pageId}`);
        if (response.ok) {
          const data = await response.json();
          return data.pageData;
        } else {
          console.error(`Failed to fetch data for ${pageId}`);
          return null;
        }
      });
      const pages = await Promise.all(pagesPromises);
      const filteredPages = pages.filter((page) => page !== null);
      setPagesData(filteredPages as PageData[]);

      // 设置初始的 currentPageData
      if (filteredPages.length > 0) {
        setCurrentPageData(filteredPages[0]);
      }
    } catch (error) {
      console.error('Error fetching pages data:', error);
    }
  };

  fetchPagesData();
}, []);

// 更新 handlePageChange 函数以设置 currentPageData
const handlePageChange = async (index: number) => {
  setCurrentPageIndex(index);
  // 重置生成的代码和其他相关状态
  setGeneratedCodes({});
  setNewGeneratedCode('');
  // 重置当前页面的阶段
  setPageStages((prevStages) => {
    const newStages = [...prevStages];
    newStages[index] = 0;
    return newStages;
  });

  // 设置当前页面数据
  const selectedPageData = pagesData[index];
  if (selectedPageData) {
    setCurrentPageData(selectedPageData);
  } else {
    console.error('Selected page data not found');
    setCurrentPageData(null);
  }

  // 获取新的 function list
  const pageId = `page${index + 1}`;
  try {
    const response = await fetch(`/api/functionlists/${pageId}`);
    if (response.ok) {
      const data = await response.json();
      setFunctionList(data.functionList);
    } else {
      console.error('Failed to fetch function list');
      setFunctionList([]);
    }
  } catch (error) {
    console.error('Error fetching function list:', error);
    setFunctionList([]);
  }
};


  const updatePageStage = (pageIndex: number, newStage: number) => {
    setPageStages(prevStages => {
      const newStages = [...prevStages];
      newStages[pageIndex] = newStage;
      return newStages;
    });
  };

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
      await fetchEventSource('https://api-dev.aictopusde.com/api/v1/projects/ai/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA', 
        },
        body: JSON.stringify({
          // sessionId: '012580975',
          // prompt,
          // mode: 'DETAIL',
          projectCode: '112244',
          prompt,
          payload: ''
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
    currentPage: pagesData[currentPageIndex],
    handlePageChange,
    pageStages,
    updatePageStage,
  };

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


  return (
    <CodeGenerationContext.Provider value={contextValue}>
      <div className="h-screen">
        
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
            <SideMenu componentsMap={componentsMap}
            pages={pagesData}
            currentPageIndex={currentPageIndex}
            onPageChange={handlePageChange} />
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
          {currentPageData && (
  <ContentUpdater currentPage={currentPageData} />
)}       </Editor>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-transparen dark:bg-zinc-900 shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
        <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            chatHistory={chatHistory}
            functionList={functionList}
          />
        </div>
      </div>

    </CodeGenerationContext.Provider>
  );
};


export default App