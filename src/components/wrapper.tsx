import React, { useState, useEffect, createContext } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { MonitorPlay, Smartphone, Tablet, Code, Redo, Undo, Save, Upload, Eye, EyeOff } from 'lucide-react';
import { getOutputCode } from '@/lib/code-gen';
import { CodeView } from '@/components/code-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const PreviewContext = createContext({
  isPreview: false,
  setIsPreview: (value: boolean) => {}
});

type WrapperProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const Wrapper = ({ children, style = {} }: WrapperProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const { query, actions, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));
  const [wrapperWidth, setWrapperWidth] = useState('w-full');
  const [output, setOutput] = useState<string | null>();
  const [codeOpen, setCodeOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const layouts = Object.keys(localStorage).filter(key => key.startsWith('craftjs_layout_'));
    setSavedLayouts(layouts.map(key => key.replace('craftjs_layout_', '')));
  }, []);

  const generateCode = () => {
    const nodes = query.getNodes();
    const { importString, output } = getOutputCode(nodes);
    setOutput(`${importString}\n\n${output}`);
  };

  const handleIconClick = (newWidth: string) => {
    setWrapperWidth(newWidth);
  };

  const handleSave = () => {
    if (layoutName) {
      const json = query.serialize();
      localStorage.setItem(`craftjs_layout_${layoutName}`, JSON.stringify(json));
      setSavedLayouts([...savedLayouts, layoutName]);
      setLayoutName('');
      setSaveOpen(false);
    }
  };

  const handleLoad = (name: string) => {
    const json = localStorage.getItem(`craftjs_layout_${name}`);
    if (json) {
      actions.deserialize(JSON.parse(json));
      setLoadOpen(false);
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <PreviewContext.Provider value={{ isPreview, setIsPreview }}>
      <div className="w-full h-full flex justify-center" style={style}>
        <div className={`${wrapperWidth} flex flex-col h-full border rounded-sm bg-white shadow-lg`}>
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100/50 border-b">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleIconClick('w-full')}>
                <MonitorPlay size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleIconClick('w-[768px]')}>
                <Tablet size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleIconClick('w-[375px]')}>
                <Smartphone size={18} />
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => canUndo && actions.history.undo()} disabled={!canUndo || isPreview}>
                <Undo size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => canRedo && actions.history.redo()} disabled={!canRedo || isPreview}>
                <Redo size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSaveOpen(true)} disabled={isPreview}>
                <Save size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLoadOpen(true)} disabled={isPreview}>
                <Upload size={18} />
              </Button>
              <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={generateCode} disabled={isPreview}>
                    <Code size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Generated Code</DialogTitle>
                  </DialogHeader>
                  <CodeView codeString={output as string} />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={togglePreview}>
                {isPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>

          <div
            className={`${wrapperWidth} flex-1 bg-white rounded-b-lg mx-auto transition-all duration-300 overflow-auto`}
            ref={(ref) => {
              if (ref) {
                connect(drag(ref));
              }
            }}
          >
            {children}
          </div>
        </div>

        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Layout</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
                className="mb-4"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Layout</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {savedLayouts.map((name) => (
                <Button key={name} onClick={() => handleLoad(name)} className="block w-full mb-2">
                  {name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PreviewContext.Provider>
  );
};

Wrapper.craft = {
  displayName: 'Wrapper',
  props: {
    className: 'w-full h-full',
  },
};