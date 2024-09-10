// // "use client";
// //
// // import React, { useState, useEffect } from 'react';
// // import './chatBox.css';
// // import { useSearchParams } from 'next/navigation';
// // import { PlaceholdersAndVanishInput } from './placeholders-and-vanish-input';
// //
// // const ChatBox = () => {
// //     const [messages, setMessages] = useState([
// //         { text: "Welcome! How can I assist you today?", sender: "bot", avatar: "/bot-avatar.png" },
// //         // { text: "Please provide details about your project.", sender: "bot", avatar: "/bot-avatar.png" }
// //     ]);
// //
// //     const [messageDisplayed, setMessageDisplayed] = useState(false);
// //     const searchParams = useSearchParams();
// //     const initialMessage = searchParams.get('message');
// //
// //     const placeholders = ["Describe your project...", "Any special features?", "What are your goals?"];
// //
// //     useEffect(() => {
// //         if (initialMessage && !messageDisplayed) {
// //             setMessages(prevMessages => [
// //                 ...prevMessages,
// //                 { text: initialMessage, sender: "user", avatar: "/user-avatar.png" }
// //             ]);
// //             // 调用服务器响应
// //             setMessageDisplayed(true);
// //             simulateServerResponse();
// //         }
// //     }, [initialMessage, messageDisplayed]);
// //
// //     const handleSend = (message) => {
// //         if (message.trim() !== "") {
// //             // setMessages(prevMessages => [...prevMessages, { text: message, sender: "user", avatar: "/user-avatar.png" }]);
// //             simulateServerResponse();
// //         }
// //     };
// //
// //     const simulateServerResponse = (callback) => {
// //         setTimeout(() => {
// //             setMessages(prevMessages => [
// //                 ...prevMessages,
// //                 { text: "Thank you for your input! We'll get back to you shortly.", sender: "bot", avatar: "/bot-avatar.png" }
// //             ]);
// //
// //             if (callback) callback();
// //         }, 1000);
// //     };
// //
// //     return (
// //         <div className="chat-container">
// //             <div className="chat-header">Help Us Clarify the Web/App</div>
// //             <div className="chat-body">
// //                 {messages.map((msg, index) => (
// //                     <div key={index} className={`chat-message ${msg.sender}`}>
// //                         <img src={msg.avatar} alt={`${msg.sender} avatar`} className="chat-avatar" />
// //                         <div className="chat-bubble">
// //                             {msg.text}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //             <div className="chat-footer">
// //                 <PlaceholdersAndVanishInput
// //                     placeholders={placeholders}
// //                     onSubmit={handleSend}
// //                 />
// //             </div>
// //         </div>
// //     );
// // };
// //
// // export default ChatBox;
// "use client";

// import React, { useState, useEffect } from 'react';
// import './chatBox.css';
// import { useRouter } from 'next/navigation';
// import { PlaceholdersAndVanishInput } from './placeholders-and-vanish-input';

// const ChatBox = () => {
//     const [messages, setMessages] = useState([
//         { text: "Welcome! How can I assist you today?", sender: "bot", avatar: "/bot-avatar.png" },
//         { text: "Please provide details about your project.", sender: "bot", avatar: "/bot-avatar.png" }
//     ]);

//     const router = useRouter();

//     useEffect(() => {
//         const storedMessage = localStorage.getItem('userMessage');
//         if (storedMessage) {
//             setMessages(prevMessages => [
//                 ...prevMessages,
//                 { text: storedMessage, sender: "user", avatar: "/user-avatar.png" }
//             ]);
//             simulateServerResponse();
//             localStorage.removeItem('userMessage');
//         }
//     }, []);

//     const handleConfirm = () => {
//         router.push('/architecture');
//     };

//     const handleSend = (message) => {
//         if (message.trim() !== "") {
//             setMessages(prevMessages => [...prevMessages, { text: message, sender: "user", avatar: "/user-avatar.png" }]);
//             simulateServerResponse();
//         }
//     };

//     const simulateServerResponse = () => {
//         setTimeout(() => {
//             setMessages(prevMessages => [
//                 ...prevMessages,
//                 { text: "Thank you for your input! We'll get back to you shortly.", sender: "bot", avatar: "/bot-avatar.png" }
//             ]);
//         }, 1000); // 模拟服务器响应延迟
//     };

//     return (
//         <div className="chat-container">
//             <div className="chat-header">Help Us Clarify the Web/App</div>
//             <div className="chat-body">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`chat-message ${msg.sender}`}>
//                         <img src={msg.avatar} alt={`${msg.sender} avatar`} className="chat-avatar" />
//                         <div className="chat-bubble">
//                             {msg.text}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div className="chat-footer">
//                 <PlaceholdersAndVanishInput
//                     placeholders={["Describe your project...", "Any special features?", "What are your goals?"]}
//                     onSubmit={handleSend}
//                 />
//                 <button className="confirm-button" onClick={handleConfirm}>
//                     Confirm
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChatBox;

