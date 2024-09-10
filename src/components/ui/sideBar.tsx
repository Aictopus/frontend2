// "use client";

// import React, { useState } from 'react';
// import { PlaceholdersAndVanishInput } from './placeholders-and-vanish-input';
// import '../../styles/sideBar.css';

// const Sidebar = () => {
//     const [messages, setMessages] = useState([
//         { text: "Welcome! How can I assist you today?", sender: "bot" },
//     ]);

//     const handleSend = (message) => {
//         if (message.trim() !== "") {
//             setMessages(prevMessages => [...prevMessages, { text: message, sender: "user" }]);
//         }
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
//             </div>
//         </div>
//     );
// };

// export default Sidebar;