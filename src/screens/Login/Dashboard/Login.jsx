import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert'; 
import loginImg from "./loginImg.mp4"; 
import Logo from "@/_assets/New_images/Login/LQ_LOGO_NEW.png";
import { authenticationService } from "@/_services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null); 
  const [loading, setLoading] = useState(false); 

  const showSuccessAlert = () => {
    setAlert(
      <SweetAlert
        success
        title="Login Successful!"
        onConfirm={() => {
          setAlert(null);
          navigate('/dashboard');
        }}
        confirmBtnCssClass="btn-confirm"
      >
        Welcome to LearnQoch! 🎉
      </SweetAlert>
    );
  };

  const showErrorAlert = (message) => {
    setAlert(
      <SweetAlert
        danger
        title="Login Failed!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        {message || "Invalid username or password!"}
      </SweetAlert>
    );
  };

  const showWarningAlert = (message) => {
    setAlert(
      <SweetAlert
        warning
        title="Warning!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        {message || "Please try again!"}
      </SweetAlert>
    );
  };

  // ✅ NEW: ACCESS DENIED ALERT (RED!)
  const showAccessDeniedAlert = () => {
    setAlert(
      <SweetAlert
        danger
        title="Access Denied!"
        onConfirm={() => setAlert(null)}
      >
        You don't have permission to access this system!<br/>
        <strong>Only ADMIN/SUPERADMIN allowed.</strong>
      </SweetAlert>
    );
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showWarningAlert("Please enter username and password!");
      return;
    }

    setLoading(true);
    try {
      const user = await authenticationService.login({ username: email, password });
      
      const decodedUser = authenticationService.currentUser();
      const isAuthorized = 
        (decodedUser.sub === "ADMIN" && decodedUser.iss === "ADMINISTRATOR") ||
        (decodedUser.sub === "SUPERADMIN" && decodedUser.iss === "ADMINISTRATOR");

      if (!isAuthorized) {
        showAccessDeniedAlert(); 
        setTimeout(() => {
         authenticationService.logout(); 
        }, 2000);
        return;
      }
      showSuccessAlert();
      
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error.status === 401) {
        showErrorAlert("Bad credentials!");
      } else if (error.status === 400) {
        showErrorAlert("Invalid username or password!");
      } else if (error.status >= 500) {
        showWarningAlert("Server error! Please try again later.");
      } else {
        showErrorAlert(error.message || "Login failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 rounded-l-4xl overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          className="w-full h-full object-cover"
        >
          <source src={loginImg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 md:py-0 bg-primary-1000  md:rounded-l-4xl">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-3 text-center md:text-left">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-2"><img src={Logo}></img></h1>
            <p className="text-primary-100 text-lg md:text-5xl">Hello,</p>
            <p className="text-primary-100  mt-5 mb-5 text-sm md:text-lg">Login to start your learning journey for the day !</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wide">Enter Your Username</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@learnqoch.com"
                  disabled={loading}
                  className="w-full bg-white bg-opacity-15 border-2 border-white border-opacity-30 text-white placeholder-primary-200 px-4 py-3 rounded-2xl focus:outline-none focus:border-white focus:border-opacity-100 focus:bg-opacity-20 transition-all backdrop-blur-sm"
                />
                <Mail className="absolute right-4 w-5 h-5 text-primary-100 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wide">Enter Your Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  disabled={loading}
                  className="w-full bg-white bg-opacity-15 border-2 border-white border-opacity-30 text-white placeholder-primary-200 px-4 py-3 rounded-2xl focus:outline-none focus:border-white focus:border-opacity-100 focus:bg-opacity-20 transition-all backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 text-primary-100 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="/admin-forgot-password" className="text-primary-100 hover:text-white text-sm font-medium transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-105 active:scale-95 duration-200 text-base ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed transform-none'
                  : 'bg-white text-primary-600 hover:bg-primary-50 hover:shadow-xl'
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Sign up link */}
          {/* <p className="text-center text-primary-100 text-sm mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-white font-semibold hover:text-primary-100 transition-colors">
              Sign Up
            </a>
          </p> */}
        </div>
      </div>

      {alert}
    </div>
  );
}