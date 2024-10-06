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

  const { 
    // ... 其他上下文值
    functionList,
    setFunctionsList,
  } = useContext(CodeGenerationContext);

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

      await fetchEventSource(
        'https://api-dev.aictopusde.com/api/v1/projects/ai/assets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA'
          },
          body: JSON.stringify({
            projectCode: '11292448',
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
  functionList={functionList}
  setFunctionsList={setFunctionsList}
  currentPageId={id}
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
            "react-dom": "^18.0.0",
            
            // 状态管理
            "redux": "^4.2.1",
            "react-redux": "^8.1.2",
            "mobx": "^6.10.2",
            "mobx-react": "^7.6.0",
            "recoil": "^0.7.7",
            "zustand": "^4.3.8",
        
            // 路由
            "react-router-dom": "^6.14.2",
            "next": "^13.4.12",
            "@reach/router": "^1.3.4",
        
            // UI组件和样式
            "@mui/material": "^5.14.3",
            "@emotion/react": "^11.11.1",
            "@emotion/styled": "^11.11.0",
            "antd": "^5.8.6",
            "react-bootstrap": "^2.8.0",
            "bootstrap": "^5.3.1",
            "styled-components": "^5.3.11",
        
            // 数据获取和API
            "axios": "^1.4.0",
            "@tanstack/react-query": "^4.32.6",
            "swr": "^2.2.0",
            "@apollo/client": "^3.7.17",
            "graphql": "^16.7.1",
        
            // 表单处理和验证
            "formik": "^2.4.3",
            "react-hook-form": "^7.45.4",
            "yup": "^1.2.0",
            "joi": "^17.9.2",
        
            // 国际化
            "react-intl": "^6.4.4",
            "react-i18next": "^13.0.3",
            "i18next": "^23.4.4",
            "@lingui/core": "^4.3.0",
            "@lingui/react": "^4.3.0",
        
            // 地图和地理位置
            "@react-google-maps/api": "^2.19.2",
            "leaflet": "^1.9.4",
            "react-leaflet": "^4.2.1",
            "mapbox-gl": "^2.15.0",
            "react-map-gl": "^7.1.3",
        
            // 图表和数据可视化
            "d3": "^7.8.5",
            "chart.js": "^4.4.0",
            "react-chartjs-2": "^5.2.0",
            "recharts": "^2.7.2",
            "victory": "^36.6.11",
        
            // 3D图形和动画
            "three": "^0.156.1",
            "@react-three/fiber": "^8.13.6",
            "gsap": "^3.12.2",
            "animejs": "^3.2.1",
        
            // 音频和视频处理
            "howler": "^2.2.3",
            "tone": "^14.7.77",
            "video.js": "^8.5.2",
        
            // 认证
            "firebase": "^10.1.0",
            "@auth0/auth0-react": "^2.2.0",
            "passport": "^0.6.0",
        
            // 实时通信
            "socket.io-client": "^4.7.2",
            "pusher-js": "^8.3.0",
        
            // 工具库
            "lodash": "^4.17.21",
            "ramda": "^0.29.0",
            "immutable": "^4.3.1",
        
            // 日期和时间处理
            "date-fns": "^2.30.0",
            "dayjs": "^1.11.9",
            "moment": "^2.29.4",
        
            // 编辑器和富文本组件
            "draft-js": "^0.11.7",
            "slate": "^0.94.1",
            "slate-react": "^0.97.2",
            "react-quill": "^2.0.0",
        
            // 动画库
            "framer-motion": "^10.15.1",
            "react-spring": "^9.7.2",
            "react-transition-group": "^4.4.5",
            "lottie-web": "^5.12.2",
            "react-lottie": "^1.2.3",
            "velocity-animate": "^1.5.2",
            "popmotion": "^11.0.5",
            "react-move": "^6.5.0",
            "react-reveal": "^1.2.2"
          }
        }}
      >
        <SandpackLayout>
          <SandpackPreview style={{ height: '500px' }} />
          {/* <SandpackCodeEditor 
            showLineNumbers
            style={{ height: '500px' }}
            readOnly={isGenerating && id === selectedId} 
          /> */}
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