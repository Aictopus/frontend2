// import React, { useEffect, useState } from 'react';
// import { useEditor, Element } from '@craftjs/core';
// import { Wrapper } from '@/components/wrapper';
// import { DynamicContent } from '@/components/dynamicContent';
// import { CodeGenerator } from '@/components/codeGenerator';
// import { TextGenerator } from '@/components/textGenerator';
// import { renderComponents } from '@/lib/componentRenderer';
// import { componentStrings } from '@/lib/test-string';
// import { useCodeGenerationContext } from '@/hooks/useCodeGenerationContext';
// import { componentMap } from '@/lib/component-map';

// export const EditorContent = () => {
//   const { actions, query } = useEditor();
//   const [stage, setStage] = useState(0);
//   const { generatedCodes } = useCodeGenerationContext();

//   useEffect(() => {
//     const addComponent = () => {
//       if (stage >= componentStrings.length) {
//         console.log('All stages have been added.');
//         return;
//       }

//       console.log('Adding stage:', stage);

//       try {
//         const currentComponentString = componentStrings[stage];
//         console.log("mycomp", currentComponentString);
//         const parsedComponents = renderComponents(currentComponentString);
//         parsedComponents.forEach((parsedComponent) => {
//           console.log("myparse", parsedComponent);
//           const craftElement = createCraftElement(parsedComponent);
//           console.log("mycraft", craftElement);
//           if (craftElement) {
//             const nodeTree = query.parseReactElement(craftElement).toNodeTree();
//             console.log("mynode", nodeTree);
//             actions.addNodeTree(nodeTree, 'ROOT');
//           }
//         });

//         setStage(prevStage => prevStage + 1);

//         // 检查是否需要转换为 CodeGenerator
//         const rootNode = query.node('ROOT').get();
//         const textGeneratorNode = rootNode.data.nodes.find(nodeId => {
//           const node = query.node(nodeId).get();
//           return node.data.type === TextGenerator;
//         });

//         if (textGeneratorNode) {
//           convertToCodeGenerator(textGeneratorNode);
//         }
//       } catch (error) {
//         console.error('Error updating content:', error);
//       }
//     };

//     // Only add the component if we haven't reached the end
//     if (stage < componentStrings.length) {
//       const timer = setTimeout(addComponent, 1000); // Increased delay to 1 second
//       return () => clearTimeout(timer);
//     }
//   }, [actions, query, stage, generatedCodes]);

//   const convertToCodeGenerator = (textGeneratorNodeId) => {
//     const node = query.node(textGeneratorNodeId).get();
//     const parentId = node.data.parent;
//     const currentIndex = query.node(parentId).get().data.nodes.indexOf(textGeneratorNodeId);

//     try {
//       const codeGeneratorElement = React.createElement(CodeGenerator, { 
//         id: textGeneratorNodeId, 
//         defaultCode: generatedCodes[textGeneratorNodeId] || ''
//       });
//       const nodeTree = query.parseReactElement(codeGeneratorElement).toNodeTree();
//       actions.addNodeTree(nodeTree, parentId, currentIndex);

//       // Delete the old TextGenerator node
//       actions.delete(textGeneratorNodeId);
//     } catch (error) {
//       console.error('Error converting to CodeGenerator:', error);
//     }
//   };

//   return (
//     <Element is={Wrapper} canvas id="root_wrapper">
//       <Element is={DynamicContent} id="dynamic_content">        <p>Stage: {stage}</p>
// </Element>
//     </Element>
//   );
// };

// const createCraftElement = (component) => {
//   if (typeof component !== 'object' || component === null) {
//     return component;
//   }

//   const { type, props } = component;
//   const Component = componentMap[type] || type;

//   if (!Component) {
//     console.error(`Component type "${type}" not found in componentMap`);
//     return null;
//   }

//   const craftProps = { ...props };

//   if (props && props.children) {
//     craftProps.children = Array.isArray(props.children)
//       ? props.children.map(createCraftElement)
//       : createCraftElement(props.children);
//   }

//   return (
//     <Element canvas is={Component} {...craftProps}>
//       {craftProps.children}
//     </Element>
//   );
// };