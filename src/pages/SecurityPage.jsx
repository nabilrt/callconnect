import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const SecurityPage = () => {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "End-to-End Encryption",
      description: "All your messages are encrypted from your device to the recipient's device. Only you and the person you're messaging can read them.",
      details: [
        "256-bit AES encryption for all messages",
        "Keys generated on your device, never stored on our servers",
        "Forward secrecy ensures past messages stay secure",
        "Encrypted file transfers for photos and videos"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account with 2FA. Even if someone knows your password, they can't access your account.",
      details: [
        "SMS-based verification codes",
        "Authenticator app support (Google Authenticator, Authy)",
        "Backup codes for account recovery",
        "Required for sensitive account changes"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: "Privacy Controls",
      description: "Granular privacy settings give you complete control over who can see your content and contact you.",
      details: [
        "Public, friends, or custom visibility for all content",
        "Block and report unwanted contacts",
        "Control who can send you friend requests",
        "Hide your activity status and last seen"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
        </svg>
      ),
      title: "Secure Infrastructure",
      description: "Our servers and infrastructure are protected by enterprise-grade security measures used by major financial institutions.",
      details: [
        "ISO 27001 certified data centers",
        "24/7 security monitoring and threat detection",
        "Regular penetration testing and security audits",
        "Distributed denial-of-service (DDoS) protection"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      ),
      title: "Account Monitoring",
      description: "We continuously monitor for suspicious activity and will alert you if we detect anything unusual with your account.",
      details: [
        "Login alerts for new devices and locations",
        "Suspicious activity detection and alerts",
        "Account recovery tools if compromised",
        "Session management and remote logout"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H21l-1 7H4l-1-7h7.5z" />
        </svg>
      ),
      title: "Compliance & Certifications",
      description: "We maintain strict compliance with international security and privacy standards to protect your data.",
      details: [
        "GDPR compliant for European users",
        "SOC 2 Type II certified security controls",
        "CCPA compliant for California residents",
        "Regular third-party security assessments"
      ]
    }
  ];

  const securityTips = [
    {
      title: "Use a Strong Password",
      description: "Create a unique password with at least 12 characters, including uppercase, lowercase, numbers, and symbols.",
      icon: "🔑"
    },
    {
      title: "Enable Two-Factor Authentication",
      description: "Add an extra layer of security by requiring a second form of verification when logging in.",
      icon: "📱"
    },
    {
      title: "Keep Your Software Updated",
      description: "Always use the latest version of your browser and operating system to get the latest security patches.",
      icon: "🔄"
    },
    {
      title: "Be Cautious with Links",
      description: "Don't click on suspicious links in messages or emails, even if they appear to be from friends.",
      icon: "🔗"
    },
    {
      title: "Review Privacy Settings",
      description: "Regularly check and update your privacy settings to control who can see your information.",
      icon: "⚙️"
    },
    {
      title: "Log Out of Shared Devices",
      description: "Always log out of your account when using computers or devices that others have access to.",
      icon: "🚪"
    }
  ];

  const reportingSteps = [
    {
      step: 1,
      title: "Identify the Issue",
      description: "Determine what type of security concern you're experiencing (harassment, impersonation, hacked account, etc.)"
    },
    {
      step: 2,
      title: "Gather Evidence",
      description: "Take screenshots, note usernames, and collect any relevant information about the incident."
    },
    {
      step: 3,
      title: "Use Built-in Tools",
      description: "Use our reporting features directly on posts, profiles, or messages to flag the content."
    },
    {
      step: 4,
      title: "Contact Support",
      description: "For serious security issues, contact our security team directly with detailed information."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 font-manrope leading-tight">
              Security & Safety
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Your security and privacy are our top priorities. Learn how we protect your data and keep you safe.
            </p>
          </div>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We use the same security standards as major banks and financial institutions to protect your data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-manrope">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Stats */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Security by the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Our commitment to security in measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-4xl lg:text-5xl font-bold text-indigo-600 font-manrope mb-2">99.9%</div>
              <div className="text-gray-700 font-medium">Uptime Guarantee</div>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 font-manrope mb-2">24/7</div>
              <div className="text-gray-700 font-medium">Security Monitoring</div>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-4xl lg:text-5xl font-bold text-purple-600 font-manrope mb-2">&lt;1s</div>
              <div className="text-gray-700 font-medium">Threat Detection</div>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-4xl lg:text-5xl font-bold text-orange-600 font-manrope mb-2">0</div>
              <div className="text-gray-700 font-medium">Data Breaches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Stay Safe Online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps you can take to protect your account and personal information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{tip.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 font-manrope">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Report Security Issues
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you encounter any security concerns, here's how to report them
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-200 lg:left-1/2 lg:-translate-x-px"></div>
              
              <div className="space-y-12">
                {reportingSteps.map((step, index) => (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    {/* Step number */}
                    <div className="absolute left-6 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold lg:left-1/2 lg:-translate-x-1/2 z-10">
                      {step.step}
                    </div>
                    
                    {/* Content */}
                    <div className={`ml-16 lg:ml-0 lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 font-manrope">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-4">
              Emergency Security Contact
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              For urgent security issues like account compromise or immediate threats, contact us immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:security@socialhub.com"
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Email Security Team
              </a>
              <button
                onClick={() => navigate('/contact')}
                className="border border-red-300 text-red-700 px-6 py-3 rounded-xl font-semibold hover:border-red-400 hover:bg-red-50 transition-all"
              >
                Contact Form
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Ready to Join a Secure Platform?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
            Experience social networking with enterprise-grade security and privacy protection.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Safely
          </button>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;