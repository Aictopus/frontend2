// @/app/page.tsx
'use client'
import React, { useEffect, useState, createContext } from 'react'
import { Editor, Frame, Element, useEditor, useNode } from '@craftjs/core'
import { renderComponents } from '@/lib/componentRenderer'
import { Wrapper } from '@/components/wrapper'
import { SideMenu } from '@/components/side-menu'
// import { ControlPanel } from  '@/components/control-panel'
import { Viewport } from '@/components/viewport'
import { componentsMap } from '@/components/node/components-map'
import { DynamicContent } from '@/components/dynamicContent'
import { componentMap } from '@/lib/component-map'
import { CodeGenerator } from '@/components/codeGenerator'
import { TextGenerator } from '@/components/textGenerator'
import { ResizableComponent } from '@/components/resizableComponent'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { CodeGenerationContext } from '@/contexts/CodeGenerationContext'

interface PageData {
	id: string
	componentStrings: string[]
}

const createCraftElement = (component) => {
	if (typeof component !== 'object' || component === null) {
		return component
	}

	const { type, props } = component
	const Component = componentMap[type] || type

	if (!Component) {
		console.error(`Component type "${type}" not found in componentMap`)
		return null
	}

	const craftProps = { ...props }

	if (props && props.children) {
		craftProps.children = Array.isArray(props.children)
			? props.children.map(createCraftElement)
			: createCraftElement(props.children)
	}

	return (
		<Element canvas is={Component} {...craftProps}>
			{craftProps.children}
		</Element>
	)
}
// Updated ContentUpdater component
const ContentUpdater = ({ currentPage }) => {
	const { actions, query } = useEditor()
	const [stage, setStage] = useState(0)

	// Move clearCurrentContent outside of useEffect
	const clearCurrentContent = () => {
		const nodes = query.getNodes()
		Object.keys(nodes).forEach((nodeId) => {
			if (nodeId !== 'ROOT' && nodes[nodeId].data.parent === 'ROOT') {
				actions.delete(nodeId)
			}
		})
	}

	// Add useEffect to reset stage and clear content when currentPage changes
	useEffect(() => {
		setStage(0)
		clearCurrentContent()
	}, [currentPage])

	useEffect(() => {
		const addComponent = () => {
			if (stage === currentPage.componentStrings.length) {
				console.log('All stages have been added.')
				return
			}

			console.log('Adding stage:', stage)

			try {
				const currentComponentString = currentPage.componentStrings[stage]
				const parsedComponents = renderComponents(currentComponentString)
				parsedComponents.forEach((parsedComponent) => {
					const craftElement = createCraftElement(parsedComponent)
					if (craftElement) {
						const nodeTree = query.parseReactElement(craftElement).toNodeTree()
						actions.addNodeTree(nodeTree, 'ROOT')
					}
				})

				setStage((prevStage) => prevStage + 1)

				if (stage === currentPage.componentStrings.length - 1) {
					console.log('All stages have been added!')
					return
				}
			} catch (error) {
				console.error('Error updating content:', error)
			}
		}

		if (stage < currentPage.componentStrings.length) {
			const timer = setTimeout(addComponent, 100)
			return () => clearTimeout(timer)
		}
	}, [actions, query, stage, currentPage.componentStrings])

	return null
}

const CodeGenerationHandler = () => {
	const { actions, query } = useEditor()
	const { newGeneratedCode, setGeneratedCodes } = React.useContext(
		CodeGenerationContext
	)

	useEffect(() => {
		const convertTextGeneratorsToCodeGenerators = async () => {
			const nodes = query.getNodes()

			for (const [nodeId, node] of Object.entries(nodes)) {
				if (node.data.type === TextGenerator) {
					const parentId = node.data.parent
					const currentIndex = query
						.node(parentId)
						.get()
						.data.nodes.indexOf(nodeId)

					try {
						const parsedComponents = renderComponents(newGeneratedCode)

						const processComponent = (component) => {
							const craftElement = createCraftElement({
								type: CodeGenerator,
								props: {
									id: nodeId,
									defaultCode: newGeneratedCode
								}
							})

							if (craftElement) {
								const nodeTree = query
									.parseReactElement(craftElement)
									.toNodeTree()
								actions.addNodeTree(nodeTree, parentId, currentIndex)
							}
						}

						if (Array.isArray(parsedComponents)) {
							parsedComponents.forEach(processComponent)
						} else {
							processComponent(parsedComponents)
						}

						actions.delete(nodeId)

						setGeneratedCodes((prevCodes) => ({
							...prevCodes,
							[nodeId]: newGeneratedCode
						}))
					} catch (error) {
						console.error('Error updating content:', error)
					}
				}
			}
		}

		if (newGeneratedCode) {
			console.log('newGeneratedCode', newGeneratedCode)
			convertTextGeneratorsToCodeGenerators()
		}
	}, [newGeneratedCode, actions, query, setGeneratedCodes])

	return null
}

const App = () => {
	const [prompt, setPrompt] = useState('')
	const [selectedId, setSelectedId] = useState('1')
	const [isGenerating, setIsGenerating] = useState(false)
	const [generatedCodes, setGeneratedCodes] = useState({})
	const [error, setError] = useState(null)
	const [chatHistory, setChatHistory] = useState([])
	const [generatedTexts, setGeneratedTexts] = useState({})
	const [newGeneratedCode, setNewGeneratedCode] = useState('')

	const [pagesData, setPagesData] = useState<PageData[]>([])
	const [currentPageIndex, setCurrentPageIndex] = useState(0)
	const [currentPageData, setCurrentPageData] = useState<PageData | null>(null)

	const [pageStages, setPageStages] = useState(pagesData.map(() => 0))
  
  const [functionList, setFunctionList] = useState<
		{ id: string; content: string }[]
	>([])

  const [pagesState, setPagesState] = useState<{
    [pageId: string]: {
      generatedCodes: { [id: string]: string };
      functionList: { id: string; content: string }[];
    };
  }>({});

	useEffect(() => {
		handlePageChange(currentPageIndex)
	}, [])

	// 在组件挂载时获取页面数据
	useEffect(() => {
		const fetchPagesData = async () => {
			try {
				const pageIds = ['page1', 'page2', 'page3']
				const pagesPromises = pageIds.map(async (pageId) => {
					const response = await fetch(`/api/pages/${pageId}`)
					if (response.ok) {
						const data = await response.json()
						return data.pageData
					} else {
						console.error(`Failed to fetch data for ${pageId}`)
						return null
					}
				})
				const pages = await Promise.all(pagesPromises)
				const filteredPages = pages.filter((page) => page !== null)
				setPagesData(filteredPages as PageData[])

				// 设置初始的 currentPageData
				if (filteredPages.length > 0) {
					setCurrentPageData(filteredPages[0])
				}
			} catch (error) {
				console.error('Error fetching pages data:', error)
			}
		}

		fetchPagesData()
	}, [])

  const updateFunctionList = (newFunctionList: { id: string; content: string }[], pageId: string) => {
    setFunctionList(newFunctionList);
    setPagesState(prevState => ({
      ...prevState,
      [pageId]: {
        ...prevState[pageId],
        functionList: newFunctionList
      }
    }));
  };

  const handlePageChange = async (index: number) => {
    setCurrentPageIndex(index);
    const pageId = `page${index + 1}`;
  
    // 如果这个页面之前没有保存过状态，则初始化
    if (!pagesState[pageId]) {
      setPagesState(prevState => ({
        ...prevState,
        [pageId]: {
          generatedCodes: {},
          functionList: []
        }
      }));
    }
  
    // 恢复该页面的状态
    setGeneratedCodes(pagesState[pageId]?.generatedCodes || {});
    setFunctionList(pagesState[pageId]?.functionList || []);
  
    // 如果functionList为空，则从API获取
    if (!pagesState[pageId]?.functionList.length) {
      try {
        const response = await fetch(`/api/functionlists/${pageId}`);
        if (response.ok) {
          const data = await response.json();
          setFunctionList(data.functionList);
          // 更新pagesState
          setPagesState(prevState => ({
            ...prevState,
            [pageId]: {
              ...prevState[pageId],
              functionList: data.functionList
            }
          }));
        } else {
          console.error('获取功能列表失败');
          setFunctionList([]);
        }
      } catch (error) {
        console.error('获取功能列表时出错:', error);
        setFunctionList([]);
      }
    }
  
    // 设置当前页面数据
    const selectedPageData = pagesData[index];
    if (selectedPageData) {
      setCurrentPageData(selectedPageData);
    } else {
      console.error('未找到所选页面数据');
      setCurrentPageData(null);
    }
  
    // 重置当前页面的阶段
    setPageStages(prevStages => {
      const newStages = [...prevStages];
      newStages[index] = 0;
      return newStages;
    });
  
    // 重置新生成的代码
    setNewGeneratedCode('');
  };
  
  const handleGenerate = async () => {
    if (prompt.trim() === '') {
      setError('请在生成代码之前输入提示。');
      return;
    }
  
    setIsGenerating(true);
    setError(null);
  
    // 将用户输入添加到聊天历史
    setChatHistory(prevHistory => [
      ...prevHistory,
      { id: Date.now().toString(), content: prompt, isUser: true }
    ]);
  
    let generatedCode = '';
  
    try {
      await fetchEventSource(
        'https://api-dev.aictopusde.com/api/v1/projects/ai/assets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA'
          },
          body: JSON.stringify({
            projectCode: '1122448',
            prompt,
            payload: ''
          }),
          async onopen(response) {
            if (!response.ok || response.headers.get('content-type') !== 'text/event-stream') {
              throw new Error('建立连接失败');
            }
          },
          onmessage(event) {
            const line = event.data.replace(/data:\s*/g, '');
            generatedCode += line || ' ';
  
            // 更新generatedCodes以实时显示
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
  
            // 将最终生成的代码添加到聊天历史
            setChatHistory(prevHistory => [
              ...prevHistory,
              {
                id: Date.now().toString(),
                content: generatedCode,
                isUser: false
              }
            ]);
  
            setNewGeneratedCode(generatedCode);
  
            // 更新generatedCodes和pagesState
            setGeneratedCodes(prevCodes => {
              const newCodes = {
                ...prevCodes,
                [selectedId]: generatedCode
              };
              
              // 更新pagesState
              const currentPageId = `page${currentPageIndex + 1}`;
              setPagesState(prevState => ({
                ...prevState,
                [currentPageId]: {
                  ...prevState[currentPageId],
                  generatedCodes: newCodes
                }
              }));
  
              return newCodes;
            });
          },
          openWhenHidden: true
        }
      );
    } catch (error) {
      console.error('生成代码时出错:', error);
      setError('生成代码时发生错误。请重试。');
      setIsGenerating(false);
  
      // 将错误消息添加到聊天历史
      setChatHistory(prevHistory => [
        ...prevHistory,
        {
          id: Date.now().toString(),
          content: '错误：生成代码失败。',
          isUser: false
        }
      ]);
    }
  };

	const updatePageStage = (pageIndex: number, newStage: number) => {
		setPageStages((prevStages) => {
			const newStages = [...prevStages]
			newStages[pageIndex] = newStage
			return newStages
		})
	}

	const sendCodeToBackend = async (id: string, code: string) => {
		console.log(`Sending code for id ${id} to backend:`, code)
		// Implementation for sending code to backend
	}

	const getAllGeneratedCodes = () => {
		return generatedCodes
	}

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
    functionList,
    setFunctionsList: updateFunctionList,
    currentPageId: `page${currentPageIndex + 1}`,
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPrompt(e.target.value)
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		handleGenerate()
	}

	const placeholders = [
		'Enter your prompt...',
		'Describe your component...',
		'What would you like to create?',
		'Type your idea here...'
	]

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
						Wrapper
					}}
				>
					<div className="flex flex-1 relative overflow-hidden">
						<SideMenu
							componentsMap={componentsMap}
							pages={pagesData}
							currentPageIndex={currentPageIndex}
							onPageChange={handlePageChange}
						/>
						<Viewport>
							<Frame>
								{/* <EditorContent /> */}
								<Element is={Wrapper} canvas id="root_wrapper">
									<Element is={DynamicContent} id="dynamic_content">
										{null}
									</Element>
								</Element>
							</Frame>
						</Viewport>
						{/* <ControlPanel /> */}
					</div>
					<CodeGenerationHandler />
					{currentPageData && (
						<ContentUpdater currentPage={currentPageData} />
					)}{' '}
				</Editor>
			</div>

			<div className="fixed bottom-0 left-0 right-0 bg-transparen dark:bg-zinc-900 shadow-lg p-4">
				<div className="max-w-4xl mx-auto">
        <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        chatHistory={chatHistory}
        functionList={functionList}
        setFunctionsList={updateFunctionList}
        currentPageId={`page${currentPageIndex + 1}`}
      />
				</div>
			</div>
		</CodeGenerationContext.Provider>
	)
}

export default App
