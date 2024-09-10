// "use client"
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import '../../styles/login.css';
// import HomePage from "@/app/home/page";


// const LoginPage = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const router = useRouter();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');
//         try {
//             const response = await fetch('/api/v1/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ username, password }),
//             });
//             const data = await response.json();
//             if (data.success) {
//                 localStorage.setItem('token', data.data.token);
//                 router.push('/home');
//             } else {
//                 setError(data.resoDesc || 'Login failed');
//             }
//         } catch (err) {
//             setError('An error occurred. Please try again.');
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-left-side">
//                 <div className="image-stack">
//                     <img src="/login/img1.png" alt="Stacked Image 1" className="stacked-image" />
//                     <img src="/login/img2.png" alt="Stacked Image 2" className="stacked-image" />
//                     <img src="/login/img.png" alt="Stacked Image 3" className="stacked-image" />
//                 </div>
//             </div>
//             <div className="login-right-side">
//                 <div className="login-form-container">
//                     <h2 className="login-title">Login to your Account</h2>
//                     <form onSubmit={handleSubmit} className="login-form">
//                         <div className="form-group">
//                             <label className="form-label" htmlFor="username">Username</label>
//                             <input
//                                 className="form-input"
//                                 id="username"
//                                 type="text"
//                                 placeholder="Enter your Username here"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label className="form-label" htmlFor="password">Password</label>
//                             <input
//                                 className="form-input"
//                                 id="password"
//                                 type="password"
//                                 placeholder="Enter your Password here"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button type="submit" className="login-button">Login</button>
//                     </form>
//                     <div className="additional-links">
//                         <a href="#" className="forgot-password">Forgot Password?</a>
//                         <p className="signup-link">Dont have an account? <a href="#">Sign Up</a></p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;