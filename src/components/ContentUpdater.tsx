// import { useEditor } from '@craftjs/core';
// import { useState, useEffect } from 'react';
// import { renderComponents } from '@/lib/renderComponents';


// export const ContentUpdater = () => {
//   const { actions, query } = useEditor();
//   const [stage, setStage] = useState(0);

//   useEffect(() => {
//     const addComponent = () => {
//       if (stage >= componentStrings.length) {
//         console.log('All stages have been added.');
//         return;
//       }

//       console.log('Adding stage:', stage);

//       try {
//         const currentComponentString = componentStrings[stage];
//         console.log("mycomp", currentComponentString)
//         const parsedComponents = renderComponents(currentComponentString);
//         parsedComponents.forEach((parsedComponent) => {
//           console.log("myparse", parsedComponent)
//           const craftElement = createCraftElement(parsedComponent);
//           console.log("mycraft", craftElement)
//           if (craftElement) {
//             const nodeTree = query.parseReactElement(craftElement).toNodeTree();
//             console.log("mynode", nodeTree)
//             actions.addNodeTree(nodeTree, 'ROOT');
//           }
//         });

//         setStage(prevStage => prevStage + 1);
//       } catch (error) {
//         console.error('Error updating content:', error);
//       }
//     };

//     // Only add the component if we haven't reached the end
//     if (stage < componentStrings.length) {
//       const timer = setTimeout(addComponent, 1000); // Increased delay to 1 second
//       return () => clearTimeout(timer);
//     }
//   }, [actions, query, stage, componentStrings]);

//   return null;
// };