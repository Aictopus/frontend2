import { useEditor, useNode } from '@craftjs/core';
import { MonitorPlay, Smartphone, Code, Redo, Undo, Eye, EyeOff } from 'lucide-react';
import React, { useState, createContext } from 'react';
import { getOutputCode, getOutputHTMLFromId } from '@/lib/code-gen';
import { CodeView } from '@/components/code-view';
import { DrawerTrigger, DrawerContent, Drawer } from '@/components/ui/drawer';

export const PreviewContext = createContext({
  isPreview: false,
  setIsPreview: (value: boolean) => {}
});

type CanvasProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const Canvas = ({ children, style = {} }: CanvasProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [canvasWidth, setCanvasWidth] = useState('w-[100%]');
  const { canUndo, canRedo, actions, query } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));
  const [output, setOutput] = useState<string | null>();
  const [htmlOutput, setHtmlOutput] = useState<string | null>();
  const [open, setOpen] = useState(false);
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const generateCode = () => {
    const nodes = query.getNodes();
    console.log('Nodes from query:', nodes);
    const { importString, output } = getOutputCode(query.getNodes());

    console.log('printing ', importString, output);

    setOutput(`${importString}\n\n${output}`);
  };

  const generateHTML = () => {
    const htmlOutput = getOutputHTMLFromId('canvas-iframe');

    setHtmlOutput(htmlOutput);
  };

  const handleIconClick = (newWidth: any) => {
    setCanvasWidth(newWidth);
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <PreviewContext.Provider value={{ isPreview, setIsPreview }}>
      <div className="w-full h-full flex justify-center" style={style}>
        <div className={`${canvasWidth} flex flex-col h-full border rounded-sm`}>
          <div className="flex justify-between items-center p-4 w-full bg-gray-200">
            <div className="flex gap-3">
              {/* Existing code */}
            </div>
            <div className="flex items-center gap-4">
              <Drawer
                open={open}
                onOpenChange={(value: boolean) => {
                  generateCode();
                  setOpen(value);
                }}
              >
                <DrawerTrigger>
                  <Code
                    size={24}
                    strokeWidth={1.75}
                    className="text-gray-500 hover:text-primary transition duration-300"
                  />
                </DrawerTrigger>

                <DrawerContent className="h-[75vh]">
                  <CodeView codeString={output as string} />
                </DrawerContent>
              </Drawer>
              
              <div className="flex items-center gap-2">
                <div className="w-8">
                  {canUndo && (
                    <Undo
                      size={24}
                      strokeWidth={1.75}
                      className="text-gray-500 hover:text-primary transition duration-300"
                      onClick={() => actions.history.undo()}
                    />
                  )}
                </div>
                <div className="w-8">
                  {canRedo && (
                    <Redo
                      size={24}
                      strokeWidth={1.75}
                      className="text-gray-500 hover:text-primary transition duration-300"
                      onClick={() => actions.history.redo()}
                    />
                  )}
                </div>
              </div>
              
              <button
                onClick={togglePreview}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 transition duration-300"
              >
                {isPreview ? (
                  <EyeOff
                    size={20}
                    strokeWidth={1.75}
                    className="text-gray-700"
                  />
                ) : (
                  <Eye
                    size={20}
                    strokeWidth={1.75}
                    className="text-gray-700"
                  />
                )}
              </button>
            </div>
          </div>

          <div
            className="w-full flex-1 bg-white rounded-b-lg"
            ref={(ref) => {
              if (ref) {
                connect(drag(ref));
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </PreviewContext.Provider>
  );
};

Canvas.craft = {
  displayName: 'div',
  props: {
    className: 'w-full h-full',
  },
};