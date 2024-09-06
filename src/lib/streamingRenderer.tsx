// import React, { useState, useEffect } from 'react';
// import { Editor, Frame, Element } from '@craftjs/core';
// import { renderComponents } from '@/lib/componentRenderer';

// import { ResizableComponent } from '@/components/resizableComponent'
// // import { ResizablePanelLayout } from '@/components/resizablePanelLayout'

// import { Canvas } from '@/components/canvas'
// import { NodeButton } from '@/components/node/button'
// import {
// 	NodeCardHeader,
// 	NodeCard,
// 	NodeCardContent,
// 	NodeCardDescription,
// 	NodeCardTitle,
// 	NodeCardFooter
// } from '@/components/node/card'
// import { NodeAlertDialog } from '@/components/node/alert-dialog'
// import { NodeCalendar } from '@/components/node/calendar'
// import { RenderNode } from '@/components/render-node'
// import { NodeOneBlock, NodeTwoBlocks } from '@/components/node/layout'
// import { NodeAccordion } from '@/components/node/accordion'
// import { NodeAvatar } from '@/components/node/avatar'
// import { NodeAlert } from '@/components/node/alert'
// import { NodeAspectRatio } from '@/components/node/aspect-ratio'
// import { NodeBadge } from '@/components/node/badge'
// import { NodeCheckbox } from '@/components/node/checkbox'
// import { NodeCollapsible } from '@/components/node/collapsible'
// import { NodeCommand } from '@/components/node/command'
// import { NodeContextMenu } from '@/components/node/context-menu'
// import { NodeDialog } from '@/components/node/dialog'



// // Define prop types for better type checking
// interface StreamingComponentRendererProps {
//   getStreamData: () => Promise<string | null>;
// }

// const StreamingComponentRenderer: React.FC<StreamingComponentRendererProps> = ({ getStreamData }) => {
//   const [components, setComponents] = useState<React.ReactNode[]>([]);
//   const [buffer, setBuffer] = useState('');

//   useEffect(() => {
//     let isMounted = true;

//     const processText = (text: string) => {
//       const updatedBuffer = buffer + text;
//       const completeComponents = updatedBuffer.split('</ResizableComponent>');
      
//       if (completeComponents.length > 1) {
//         const newComponents = completeComponents.slice(0, -1).map(comp => comp + '</ResizableComponent>');
//         setComponents(prevComponents => [...prevComponents, ...renderComponents(newComponents.join(''))]);
//         setBuffer(completeComponents[completeComponents.length - 1]);
//       } else {
//         setBuffer(updatedBuffer);
//       }
//     };

//     const simulateStream = async () => {
//       try {
//         while (isMounted) {
//           const chunk = await getStreamData();
//           if (chunk === null) break; // End of stream
//           processText(chunk);
//         }
//       } catch (error) {
//         console.error('Error in stream processing:', error);
//       }
//     };

//     simulateStream();

//     return () => {
//       isMounted = false;
//     };
//   }, [getStreamData, buffer]);

//   return (
//     <Editor
//       resolver={{
//         					NodeButton,
// 					Canvas,
// 					NodeCardHeader,
// 					NodeCard,
// 					NodeCardContent,
// 					NodeCardDescription,
// 					NodeCardTitle,
// 					NodeCardFooter,
// 					NodeOneBlock,
// 					NodeTwoBlocks,
// 					NodeCalendar,
// 					ResizableComponent,
// 					// ResizablePanelLayout,
// 					Element,
// 					div: 'div',
// 					span: 'span',
// 					NodeAccordion,
// 					NodeAvatar,
// 					NodeAlertDialog,
// 					NodeAlert,
// 					NodeAspectRatio,
// 					NodeBadge,
// 					NodeCheckbox,
// 					NodeCollapsible,
// 					NodeCommand,
// 					NodeContextMenu,
// 					NodeDialog
//       }}
//     >
//       <Frame>
//         <Element
//           is={Canvas}
//           canvas
//           style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             alignItems: 'flex-start'
//           }}
//         >
//           {components}
//         </Element>
//       </Frame>
//     </Editor>
//   );
// };

// export default StreamingComponentRenderer;