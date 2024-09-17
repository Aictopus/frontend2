import { useEditor, Editor, Element } from '@craftjs/core'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { VariantCanvas } from '@/components/variantCanvas'
import { NodeButton } from '@/components/node/button'
import { renderComponents } from '@/lib/componentRenderer'
import { componentMap, componentNameMap } from '@/lib/component-map'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCodeGenerationContext } from '@/hooks/useCodeGenerationContext'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { SandpackRenderer } from '@/components/SandpackRenderer'

function getComponentName(type) {
	if (typeof type === 'string') {
		console.log('-string', type)
		return type
	}
	if (typeof type === 'function') {
		console.log('-function', type.name)
		return componentNameMap[type.name] || type.name
	}
	if (type && type.craft) {
		let craftName = type.craft.name || type.craft.displayName
		craftName = craftName.replace(' ', '')
		console.log('-either', type.craft.name, type.craft.displayName)
		return componentNameMap[craftName] || craftName || 'UnknownComponent'
	}
	return 'UnknownComponent'
}

function generateComponentString(node, query) {
	const { type, props, nodes } = node.data
	const componentName = getComponentName(type)

	const propsString = Object.entries(props)
		.filter(([key, value]) => key !== 'children' && value !== undefined)
		.map(([key, value]) => {
			if (typeof value === 'string') {
				return `${key}="${value}"`
			}
			return `${key}={${JSON.stringify(value)}}`
		})
		.join(' ')

	let childrenString = ''
	if (nodes && nodes.length > 0) {
		childrenString = nodes
			.map((childId) => {
				const childNode = query.node(childId).get()
				return generateComponentString(childNode, query)
			})
			.join('')
	} else if (props.children) {
		if (typeof props.children === 'string') {
			childrenString = props.children
		} else if (React.isValidElement(props.children)) {
			childrenString = generateComponentString(
				{
					data: {
						type: props.children.type,
						props: props.children.props,
						nodes: []
					}
				},
				query
			)
		} else if (Array.isArray(props.children)) {
			childrenString = props.children
				.map((child) => {
					if (typeof child === 'string') return child
					if (React.isValidElement(child)) {
						return generateComponentString(
							{ data: { type: child.type, props: child.props, nodes: [] } },
							query
						)
					}
					return ''
				})
				.join('')
		}
	}

	return `<${componentName}${
		propsString ? ' ' + propsString : ''
	}>${childrenString}</${componentName}>`
}

// function renderComponents1(componentString) {
// 	const regex = /<(\w+)([^>]*)>(.*?)<\/\1>/
// 	const match = regex.exec(componentString)

// 	if (match) {
// 		const [, componentName, propsString, children] = match
// 		const fullComponentName = Object.keys(componentNameMap).find(
// 			(key) => componentNameMap[key] === componentName
// 		)
// 		const Component = componentMap[fullComponentName]

// 		if (Component) {
// 			const props = {}
// 			const propsRegex = /(\w+)=(?:{([^}]*)}|"([^"]*)")/g
// 			let propMatch
// 			while ((propMatch = propsRegex.exec(propsString))) {
// 				const [, key, objectValue, stringValue] = propMatch
// 				props[key] = objectValue ? JSON.parse(objectValue) : stringValue
// 			}

// 			const RenderedComponent = (nodeProps) => (
// 				<Component {...props} {...nodeProps}>
// 					{children}
// 				</Component>
// 			)
// 			RenderedComponent.displayName = `Rendered${componentName}`
// 			return RenderedComponent
// 		}
// 	}

// 	return () => null
// }

function generateRandomBgColor() {
	const colors = ['red', 'blue', 'green', 'yellow']
	const shades = ['400', '500']

	const randomColor = colors[Math.floor(Math.random() * colors.length)]
	const randomShade = shades[Math.floor(Math.random() * shades.length)]

	return `bg-${randomColor}-${randomShade}`
}

const UnrelatedButton = () => <NodeButton>Test1</NodeButton>
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

export const ControlPanel = () => {
  const { active, related, query, actions } = useEditor((state, query) => ({
    active: query.getEvent('selected').first(),
    related: state.nodes[query.getEvent('selected').first()]?.related
  }))

  const [variants, setVariants] = useState([])
  const [codeVariants, setCodeVariants] = useState([])
  const [editorKey, setEditorKey] = useState(0)
  const prevActiveRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const { generatedCodes, setGeneratedCodes } = useCodeGenerationContext()
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)
  const [error, setError] = useState(null)

	const [generatingVariantIndex, setGeneratingVariantIndex] = useState(-1);

  const generateCodeVariant = useCallback(async (originalCode, index) => {
		try {
			let variantCode = ''
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
					if (index === 4) setIsGeneratingVariants(false);
				},
				openWhenHidden: true,
			});
		} catch (error) {
			console.error('Error generating code variant:', error);
			setError('An error occurred while generating code variants. Please try again.');
			setIsGeneratingVariants(false);
			setCodeVariants(prev => {
				const newVariants = [...prev];
				newVariants[index] = { code: '', isGenerating: false };
				return newVariants;
			});
		}
	}, []);

  useEffect(() => {
    if (active && active !== 'ROOT') {
      const node = query.node(active).get();
      if (node.data.displayName === 'AI Code Generator') {
        const originalCode = generatedCodes[node.data.props.id] || '';
        setIsGeneratingVariants(true);
        setError(null);
        setCodeVariants(Array(5).fill(''));
        
        // Generate variants sequentially
        (async () => {
          for (let i = 0; i < 5; i++) {
            await generateCodeVariant(originalCode, i);
          }
        })();
      }
    }
  }, [active, query, generatedCodes, generateCodeVariant]);

  const handleReplace = (variantProps) => {
    if (active && active !== 'ROOT') {
      actions.setProp(active, (props) => {
        Object.assign(props, variantProps)
      })
    }
    setIsOpen(false)
  }

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

return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className="ml-2">
        Variants
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Component Variants</DialogTitle>
      </DialogHeader>
      {active && active !== 'ROOT' && (
        <div className="p-4">
          <h4 className="text-sm font-semibold mt-4 mb-2">Original Component:</h4>
          {variants.map((variant, index) => {
            const VariantComponent = renderComponents(variant.string)
            const node = query.node(active).get()
            const isCodeGenerator = node.data.displayName === 'AI Code Generator'

            return (
              <div
                key={`${editorKey}-${index}`}
                className="mb-4 border p-2 rounded"
              >
                {isCodeGenerator ? (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Generated Code:</h5>
                    <SandpackRenderer 
                      code={generatedCodes[node.data.props.id] || ''} 
                      isGenerating={false}
                    />
                  </div>
                ) : (
                  <div className="mb-2" style={{ height: '100px' }}>
                    <Editor
                      key={`${editorKey}-${index}`}
                      resolver={{
                        ...componentMap
                      }}
                    >
                      <VariantCanvas>
                        {VariantComponent}
                      </VariantCanvas>
                    </Editor>
                  </div>
                )}
              </div>
            )
          })}
          
          {active && query.node(active).get().data.displayName === 'AI Code Generator' && (
            <div>
              <h4 className="text-sm font-semibold mt-6 mb-2">Code Variants:</h4>
              {codeVariants.map((variant, index) => (
                <div   onClick={() => console.log('Outer div clicked')}
                key={index} className="mb-4 border p-2 rounded">
                  <SandpackRenderer 
                    code={variant.code} 
                    isGenerating={variant.isGenerating}
                  />
                  <Button
                    variant="default"
                    className="mt-2"
                    onClick={() => {
                      console.log('Button clicked');
                      handleFullReplace(variant.code);
                    }}
                    // disabled={variant.isGenerating || !variant.code}
                  >
                    Full Replace
                  </Button>
                </div>
              ))}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          )}

          <h4 className="text-sm font-semibold mt-6 mb-2">
            Unrelated Component:
          </h4>
          <div className="mb-4 border p-2 rounded">
            <div className="mb-2" style={{ height: '100px' }}>
              <Editor
                resolver={{
                  ...componentMap,
                  UnrelatedButton
                }}
              >
                <VariantCanvas>
                  <UnrelatedButton />
                </VariantCanvas>
              </Editor>
            </div>
            <Button
              variant="default"
              onClick={() => handleFullReplace(UnrelatedButton)}
            >
              Replace with Unrelated Button
            </Button>
          </div>
        </div>
      )}
      {active && related?.toolbar && React.createElement(related.toolbar)}
    </DialogContent>
  </Dialog>
);
}