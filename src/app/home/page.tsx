// "use client";
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import '../../styles/home.css';

// const HomePage = () => {
//     const [tab, setTab] = useState('UI');
//     const [inputValue, setInputValue] = useState('');
//     const router = useRouter();

//     const handleTabClick = (tabName) => {
//         setTab(tabName);
//     };

//     const handleInputChange = (e) => {
//         setInputValue(e.target.value);
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter' && inputValue.trim()) {
//             localStorage.setItem('userMessage', inputValue);
//             router.push('/chat');
//         }
//     };

//     return (
//         <div className="container">
//             <header className="header">
//                 <div className="logo">Alctopus</div>
//                 <nav className="nav">
//                     <a href="#">Explore</a>
//                     <a href="#">Feedback</a>
//                     <div className="profile-avatar">
//                         <img src="/path/to/avatar.jpg" alt="User Avatar" />
//                     </div>
//                 </nav>
//             </header>

//             <main className="main-content">
//                 <h1>Idea, Explore, Choose</h1>
//                 <p>Less operations, more creative, Let's make UI design easier!</p>

//                 <div className="search-bar">
//                     <div className="tabs">
//                         <button
//                             className={`tab ${tab === 'UI' ? 'active' : ''}`}
//                             onClick={() => handleTabClick('UI')}
//                         >
//                             Full UI
//                         </button>
//                         <button
//                             className={`tab ${tab === 'Asset' ? 'active' : ''}`}
//                             onClick={() => handleTabClick('Asset')}
//                         >
//                             Asset
//                         </button>
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Tell me what you want to build..."
//                         className="search-input"
//                         value={inputValue}
//                         onChange={handleInputChange}
//                         onKeyDown={handleKeyDown}
//                     />
//                 </div>

//                 <div className="card-list">
//                     {[1, 2, 3, 4].map((item) => (
//                         <div className="card" key={item}>
//                             <div className="card-header">
//                                 <div className="profile-avatar">
//                                     <img src={`/path/to/avatar${item}.jpg`} alt="User Avatar" />
//                                 </div>
//                             </div>
//                             <div className="card-body">
//                                 <p className="card-prompt">
//                                     Prompt: This is a component that allows user hover and click
//                                     in to change the colors.
//                                 </p>
//                                 <div className="card-buttons">
//                                     <button className="figma-button">Figma</button>
//                                     <button className="code-button">Code</button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default HomePage;
