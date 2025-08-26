import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const TermsPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing and using SocialHub, you accept and agree to be bound by the terms and provision of this agreement.

**Agreement to Terms:**
- These terms constitute a legally binding agreement between you and SocialHub
- By creating an account, you confirm you have read and understood these terms
- If you do not agree to these terms, you may not use our services
- We may modify these terms at any time with notice to users

**Eligibility:**
- You must be at least 13 years old to use SocialHub
- Users between 13-17 must have parental consent
- You must provide accurate and truthful information
- You are responsible for maintaining the confidentiality of your account`
    },
    {
      title: "User Accounts and Registration",
      content: `To use certain features of SocialHub, you must register for an account.

**Account Creation:**
- You must provide accurate, current, and complete information
- You are responsible for safeguarding your password
- You must not create accounts using false information
- One person may not maintain more than one account

**Account Security:**
- You are responsible for all activities that occur under your account
- You must notify us immediately of any unauthorized access
- We reserve the right to suspend accounts that appear compromised
- You must not share your account credentials with others

**Account Termination:**
- You may terminate your account at any time
- We may terminate accounts that violate these terms
- Upon termination, your right to use the service ceases immediately
- Some provisions of these terms survive account termination`
    },
    {
      title: "User Content and Conduct",
      content: `You are responsible for all content you post on SocialHub.

**Content Guidelines:**
- You retain ownership of content you create and post
- You grant us a license to use, display, and distribute your content
- You must not post content that violates laws or these terms
- We reserve the right to remove content that violates our guidelines

**Prohibited Content:**
- Illegal, harmful, threatening, abusive, or defamatory content
- Content that infringes intellectual property rights
- Spam, misleading information, or fraudulent content
- Adult content, violence, or content harmful to minors
- Hate speech, harassment, or discriminatory content

**User Conduct:**
- You must treat other users with respect and civility
- You must not impersonate others or create fake accounts
- You must not engage in spam or bulk messaging
- You must not attempt to hack or disrupt our services
- You must not use automated tools to access our services

**Reporting and Enforcement:**
- Users can report violations through our reporting system
- We investigate all reports and take appropriate action
- Violations may result in content removal, warnings, or account suspension
- Repeat violations may result in permanent account termination`
    },
    {
      title: "Privacy and Data Protection",
      content: `Your privacy is important to us. Please review our Privacy Policy.

**Data Collection:**
- We collect information as described in our Privacy Policy
- You consent to our data practices by using our services
- We implement security measures to protect your data
- You have rights regarding your personal information

**Data Use:**
- We use your data to provide and improve our services
- We may use aggregated data for analytics and research
- We do not sell your personal information to third parties
- We may share data as required by law or to protect our rights

**Your Privacy Rights:**
- You can access, update, or delete your personal information
- You can control privacy settings for your content
- You can opt out of certain data uses
- You can request a copy of your data at any time`
    },
    {
      title: "Intellectual Property Rights",
      content: `We respect intellectual property rights and expect users to do the same.

**Our Intellectual Property:**
- SocialHub and all related materials are our property
- Our trademarks, logos, and brand elements are protected
- You may not use our intellectual property without permission
- You may not copy, modify, or create derivative works of our platform

**User Content Rights:**
- You retain ownership of original content you create
- You grant us necessary licenses to operate our services
- You represent that you have rights to all content you post
- You must not post content that infringes others' rights

**Copyright Policy:**
- We respond to valid DMCA takedown notices
- Repeat copyright infringers will have their accounts terminated
- We may remove allegedly infringing content without notice
- Users can submit counter-notices for wrongfully removed content

**Trademark Policy:**
- Using others' trademarks without permission is prohibited
- We will investigate trademark infringement claims
- Accounts may be suspended for trademark violations
- Business names and logos require proper authorization`
    },
    {
      title: "Platform Rules and Community Guidelines",
      content: `SocialHub is built on respect, safety, and authentic connections.

**Community Standards:**
- Be respectful and kind to other users
- Share authentic content and be yourself
- Respect others' privacy and personal boundaries
- Help create a positive and inclusive environment

**Prohibited Activities:**
- Creating fake accounts or impersonating others
- Buying, selling, or transferring accounts
- Using automated scripts or bots
- Attempting to access others' accounts without permission
- Circumventing our security measures or restrictions

**Content Moderation:**
- We use both automated systems and human reviewers
- Content may be removed if it violates our guidelines
- Users may appeal content moderation decisions
- We strive to be fair and consistent in our enforcement

**Consequences for Violations:**
- First offense: Warning and content removal
- Repeat offenses: Temporary account restrictions
- Serious violations: Permanent account suspension
- Legal violations: Cooperation with law enforcement`
    },
    {
      title: "Third-Party Services and Links",
      content: `SocialHub may contain links to third-party websites and services.

**External Links:**
- We do not control or endorse third-party websites
- Clicking external links is at your own risk
- Third-party sites have their own terms and privacy policies
- We are not responsible for third-party content or practices

**Integrations:**
- You may connect third-party services to your account
- You are responsible for managing these connections
- We are not liable for issues with third-party services
- You should review third-party terms before connecting services

**Advertising:**
- We may display advertisements on our platform
- Advertisers are responsible for their ad content
- We do not endorse advertised products or services
- Click on ads at your own discretion and risk`
    },
    {
      title: "Service Availability and Modifications",
      content: `We strive to provide reliable service but cannot guarantee 100% uptime.

**Service Availability:**
- We provide our service on an "as is" and "as available" basis
- We may experience downtime for maintenance or technical issues
- We are not liable for service interruptions or outages
- We will make reasonable efforts to minimize service disruptions

**Service Modifications:**
- We may modify, update, or discontinue features at any time
- We will provide notice of significant changes when possible
- Continued use after changes constitutes acceptance
- We may add new features or services without notice

**Beta Features:**
- Some features may be in beta or testing phases
- Beta features may not work perfectly or may be discontinued
- Your use of beta features helps us improve our services
- Beta features are provided without warranties`
    },
    {
      title: "Liability and Disclaimers",
      content: `Important limitations on our liability and your rights.

**Disclaimer of Warranties:**
- Our services are provided "as is" without warranties
- We disclaim all warranties, express or implied
- We do not warrant that our service will meet your needs
- We do not guarantee error-free or uninterrupted service

**Limitation of Liability:**
- Our liability is limited to the maximum extent permitted by law
- We are not liable for indirect, incidental, or consequential damages
- Our total liability will not exceed the amount you paid us in the last 12 months
- Some jurisdictions do not allow liability limitations

**User Responsibility:**
- You are responsible for your use of our services
- You are responsible for your content and interactions
- You are responsible for protecting your account and data
- You assume all risks associated with using our platform

**Indemnification:**
- You agree to indemnify and hold us harmless from claims arising from your use
- This includes claims related to your content or violations of these terms
- We will notify you of any claims and allow you to defend
- We reserve the right to assume defense of any claim`
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
              Terms of Service
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              The rules and guidelines for using SocialHub
            </p>
            <p className="mt-4 text-lg text-gray-500">
              Last updated: December 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-4">
              Welcome to SocialHub
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of SocialHub and all related services. 
              By using our platform, you agree to these terms. Please read them carefully as they contain 
              important information about your rights and obligations.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              SocialHub is a social networking platform that connects people through shared interests, 
              meaningful conversations, and authentic relationships. These terms help ensure our platform 
              remains safe, respectful, and enjoyable for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6">
                  {index + 1}. {section.title}
                </h2>
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-4">
                      {paragraph.startsWith('**') ? (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {paragraph.replace(/\*\*/g, '').replace(':', '')}
                          </h3>
                        </div>
                      ) : paragraph.startsWith('- ') ? (
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          {paragraph.split('\n').filter(item => item.startsWith('- ')).map((item, iIndex) => (
                            <li key={iIndex} className="text-gray-700">
                              {item.replace('- ', '')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-8 text-center">
            Additional Important Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Governing Law</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                These terms are governed by the laws of California, United States. 
                Any disputes will be resolved in the courts of California.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                We may update these terms from time to time. We'll notify you of 
                significant changes and your continued use constitutes acceptance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Severability</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                If any part of these terms is found invalid, the remaining provisions 
                will continue in full force and effect.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Entire Agreement</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                These terms, along with our Privacy Policy, constitute the entire 
                agreement between you and SocialHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-6">
            Questions About These Terms?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            If you have any questions about these Terms of Service or need clarification 
            on any provisions, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Contact Legal Team
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:shadow-md transition-all"
            >
              Back to Home
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>Email us directly at: <a href="mailto:legal@socialhub.com" className="text-indigo-600 hover:text-indigo-700">legal@socialhub.com</a></p>
            <p className="mt-2">SocialHub Legal Team, 123 Tech Street, San Francisco, CA 94105</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;