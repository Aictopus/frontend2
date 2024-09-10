// // "use client"
// // import React, { useState } from 'react';
// //
// // const StreamingForm = () => {
// //     const [sessionId, setSessionId] = useState('');
// //     const [prompt, setPrompt] = useState('');
// //     const [mode, setMode] = useState('DETAIL');
// //     const [content, setContent] = useState('');
// //     const [isLoading, setIsLoading] = useState(false);
// //
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setContent('');
// //         setIsLoading(true);
// //
// //         try {
// //             const response = await fetch('https://api-dev.aictopusde.com/api/v1/ai/generate-pages', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA', // 将YOUR_TOKEN_HERE替换为实际的token
// //                 },
// //                 body: JSON.stringify({
// //                     sessionId,
// //                     prompt,
// //                     mode,
// //                 }),
// //             });
// //
// //             const reader = response.body.getReader();
// //             const decoder = new TextDecoder('utf-8');
// //             let done = false;
// //             let fullContent = "";
// //             while (!done) {
// //                 const { value, done: readerDone } = await reader.read();
// //                 done = readerDone;
// //                 if (value) {
// //                     let chunk = decoder.decode(value, { stream: true });
// //                     chunk = chunk.trim();
// //
// //                     let lines = chunk.toString()
// //                         .split("\n\n")
// //
// //                     for (let line of lines) {
// //                         line = line.replace(/data:\s*/g, '');
// //
// //                         console.log('Line:', JSON.stringify(line));  // 使用 JSON.stringify 以便清楚看到所有空格和换行符
// //
// //                         if (line == ''){
// //                             fullContent = fullContent.concat(' ');
// //                         }
// //                         fullContent = fullContent.concat(line);
// //                     }
// //                     console.log('Full Content after concat:', JSON.stringify(fullContent));
// //
// //                     // 实时更新内容
// //                     setContent(fullContent);
// //                 }
// //             }
// //
// //             // console.log(fullContent.split(''));
// //         } catch (error) {
// //             console.error('获取数据时出错:', error);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };
// //
// //     return (
// //         <div>
// //             <h1>流式数据生成器</h1>
// //             <form onSubmit={handleSubmit}>
// //                 <div>
// //                     <label>Session ID:</label>
// //                     <input
// //                         type="text"
// //                         value={sessionId}
// //                         onChange={(e) => setSessionId(e.target.value)}
// //                         required
// //                     />
// //                 </div>
// //                 <div>
// //                     <label>Prompt:</label>
// //                     <input
// //                         type="text"
// //                         value={prompt}
// //                         onChange={(e) => setPrompt(e.target.value)}
// //                         required
// //                     />
// //                 </div>
// //                 <div>
// //                     <label>Mode:</label>
// //                     <select value={mode} onChange={(e) => setMode(e.target.value)}>
// //                         <option value="DETAIL">DETAIL</option>
// //                         <option value="SUMMARY">SUMMARY</option>
// //                     </select>
// //                 </div>
// //                 <button type="submit">生成</button>
// //             </form>
// //
// //             {isLoading && <p>加载中...</p>}
// //             <div>{content}</div>
// //         </div>
// //     );
// // };
// //
// // export default StreamingForm;
// "use client";
// import React, { useState } from 'react';
// import { fetchEventSource } from '@microsoft/fetch-event-source';

// const StreamingForm = () => {
//     const [sessionId, setSessionId] = useState('');
//     const [prompt, setPrompt] = useState('');
//     const [mode, setMode] = useState('DETAIL');
//     const [content, setContent] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setContent('');
//         setIsLoading(true);

//         try {
//             await fetchEventSource('https://api-dev.aictopusde.com/api/v1/ai/generate-pages', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaWN0b3B1cyIsImlhdCI6MTcyNDAyOTYzNiwiZXhwIjoxODk2ODI5NjM2fQ.2B2fARX74hql9eeZyqbc9Wh2ibtMLTaH0W2Ri0XnEINcoKT41tcQBF0zn-shdx_s30CRtPpwzrCkFg7BZVKCkA',
//                 },
//                 body: JSON.stringify({
//                     sessionId,
//                     prompt,
//                     mode,
//                 }),
//                 onopen(response) {
//                     if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
//                         console.log('Connection established');
//                     } else {
//                         console.error('Failed to connect', response);
//                     }
//                 },
//                 onmessage(event) {
//                     let line = event.data;
//                     // if (line == ""){
//                     //     setContent(prevContent => prevContent + " ");
//                     // }else {
//                     //     setContent(prevContent => prevContent + line);
//                     // }
//                     setContent(prevContent => prevContent + line);
//                 },
//                 onerror(err) {
//                     console.error('EventSource failed:', err);
//                     setIsLoading(false);
//                 },
//                 openWhenHidden: true,
//             });
//         } catch (error) {
//             console.error('获取数据时出错:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h1>流式数据生成器</h1>
//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label>Session ID:</label>
//                     <input
//                         type="text"
//                         value={sessionId}
//                         onChange={(e) => setSessionId(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Prompt:</label>
//                     <input
//                         type="text"
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Mode:</label>
//                     <select value={mode} onChange={(e) => setMode(e.target.value)}>
//                         <option value="DETAIL">DETAIL</option>
//                         <option value="SUMMARY">SUMMARY</option>
//                     </select>
//                 </div>
//                 <button type="submit">生成</button>
//             </form>

//             {isLoading && <p>加载中...</p>}
//             <div>{content}</div>
//         </div>
//     );
// };

// export default StreamingForm;
