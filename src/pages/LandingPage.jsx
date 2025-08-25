import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Real-time Messaging",
      description: "Chat instantly with your friends with real-time message delivery and read receipts."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      ),
      title: "File Sharing",
      description: "Share photos, videos, and documents seamlessly with drag-and-drop support."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: "Friend Network",
      description: "Connect with friends, send requests, and build your social network effortlessly."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Smart Notifications",
      description: "Stay updated with intelligent notifications that keep you connected without overwhelming."
    }
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => setShowAuth(false)}
            className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </button>

          {/* Auth Form */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 sm:p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-manrope">ChatSphere</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {isLogin ? 'Welcome back! Sign in to continue chatting' : 'Join thousands of users chatting daily'}
              </p>
            </div>

            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 font-manrope">ChatSphere</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setShowAuth(true);
                }}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 text-sm sm:text-base"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setShowAuth(true);
                }}
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-manrope leading-tight animate-fade-in-up">
              Connect & Chat with
              <span className="text-indigo-600 block animate-fade-in-up" style={{animationDelay: '0.2s'}}>Your Friends</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Experience seamless communication with real-time messaging, file sharing, and smart notifications. 
              Build meaningful connections in a modern, intuitive chat platform.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setShowAuth(true);
                }}
                className="bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Start Chatting Free
              </button>
              <button
                onClick={() => {
                  setIsLogin(true);
                  setShowAuth(true);
                }}
                className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold border border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-manrope">
              Everything you need to stay connected
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Powerful features designed for modern communication
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 transform animate-fade-in-up group"
                style={{animationDelay: `${0.2 * index}s`}}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 font-manrope">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 font-manrope hover:scale-110 transition-transform duration-300">10K+</div>
              <div className="text-base sm:text-xl text-gray-600 mt-2">Active Users</div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 font-manrope hover:scale-110 transition-transform duration-300">1M+</div>
              <div className="text-base sm:text-xl text-gray-600 mt-2">Messages Sent</div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 font-manrope hover:scale-110 transition-transform duration-300">99.9%</div>
              <div className="text-base sm:text-xl text-gray-600 mt-2">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-manrope">
              How ChatSphere Works
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-6 hover:scale-110 hover:bg-indigo-200 transition-all duration-300">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-manrope">Sign Up</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your account in seconds with just your email and username. No complex setup required.
              </p>
            </div>
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-6 hover:scale-110 hover:bg-indigo-200 transition-all duration-300">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-manrope">Connect Friends</h3>
              <p className="text-gray-600 leading-relaxed">
                Find and add friends using their username or email. Build your network effortlessly.
              </p>
            </div>
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-6 hover:scale-110 hover:bg-indigo-200 transition-all duration-300">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-manrope">Start Chatting</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy instant messaging, file sharing, and real-time notifications with your friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-manrope">
              What Our Users Say
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Join thousands of satisfied users worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "ChatSphere has completely transformed how I communicate with my team. The real-time features and clean interface make it a joy to use every day."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">SJ</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The file sharing feature is incredible! I can easily share documents, images, and videos with my friends without any hassle. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">MC</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Michael Chen</p>
                  <p className="text-sm text-gray-500">Designer</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "I love the smart notifications! They keep me updated without being overwhelming. The interface is beautiful and intuitive to use."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">ER</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                  <p className="text-sm text-gray-500">Marketing Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-6">
                Your Privacy & Security Matter
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                At ChatSphere, we prioritize your privacy and security above all else. Our platform uses industry-leading 
                encryption and security measures to protect your conversations and data.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-left" style={{animationDelay: '0.2s'}}>
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-600">All messages are encrypted and only you and your recipient can read them.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-left" style={{animationDelay: '0.4s'}}>
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Secure File Sharing</h3>
                    <p className="text-gray-600">Share files safely with advanced security protocols and virus scanning.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-left" style={{animationDelay: '0.6s'}}>
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">GDPR Compliant</h3>
                    <p className="text-gray-600">We follow strict privacy regulations to protect your personal information.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6 mx-auto hover:scale-110 hover:bg-indigo-200 transition-all duration-300 animate-pulse">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-4 font-manrope">
                  Bank-Level Security
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Your conversations are protected with the same level of security used by major financial institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-manrope">
            Ready to join the conversation?
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            Create your account today and start connecting with friends instantly.
          </p>
          <button
            onClick={() => {
              setIsLogin(false);
              setShowAuth(true);
            }}
            className="mt-6 sm:mt-8 bg-indigo-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold font-manrope">ChatSphere</span>
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-md">
                Experience seamless communication with real-time messaging, file sharing, and smart notifications. 
                Connect with friends in a modern, intuitive platform designed for meaningful conversations.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.489-1.378l-.661 2.498c-.24.921-.889 2.077-1.324 2.795C8.598 23.508 10.25 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 font-manrope">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 font-manrope">Support</h3>
              <ul className="space-y-3">
                <li><a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#status" className="text-gray-400 hover:text-white transition-colors">System Status</a></li>
                <li><a href="#feedback" className="text-gray-400 hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © 2024 ChatSphere. All rights reserved. Made with ❤️ for better communication.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;