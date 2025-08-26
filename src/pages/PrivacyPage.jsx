import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const PrivacyPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information to provide better services to our users. Here's what we collect:

**Information You Provide:**
- Account information (username, email, password)
- Profile information (name, bio, profile picture, cover photo)
- Content you create (posts, comments, messages, stories)
- Contact information when you reach out to us

**Information We Collect Automatically:**
- Device information (browser type, operating system, IP address)
- Usage data (pages visited, features used, time spent)
- Log information (error reports, system activity)
- Location data (if you enable location services)

**Information from Third Parties:**
- Information from connected social media accounts (with your permission)
- Public information from other sources to verify your identity
- Analytics data from our service providers`
    },
    {
      title: "How We Use Your Information",
      content: `We use your information to provide, maintain, and improve our services:

**To Provide Our Services:**
- Create and maintain your account
- Enable you to communicate with other users
- Display your content to appropriate audiences
- Provide customer support

**To Improve Our Services:**
- Analyze usage patterns to improve functionality
- Develop new features and services
- Conduct research and analytics
- Test new features with user groups

**To Protect Our Services:**
- Detect, prevent, and address fraud and abuse
- Protect against spam and malicious activity
- Enforce our terms of service and community guidelines
- Comply with legal obligations

**To Communicate with You:**
- Send service-related notifications
- Provide updates about new features
- Respond to your inquiries and feedback
- Send marketing communications (with your consent)`
    },
    {
      title: "Information Sharing and Disclosure",
      content: `We don't sell your personal information. Here's when we may share information:

**With Your Consent:**
- When you explicitly agree to share information
- When you use features that involve sharing with third parties
- When you connect third-party applications to your account

**For Legal Reasons:**
- To comply with applicable laws and regulations
- To respond to legal process and government requests
- To protect rights, property, and safety of our users and the public
- In connection with legal proceedings

**Business Transfers:**
- In the event of a merger, acquisition, or sale of assets
- Information may be transferred as part of the business
- We will notify users of any such transfer

**Service Providers:**
- We may share information with trusted service providers
- These providers are bound by confidentiality agreements
- They only process information on our behalf and for specified purposes

**Aggregated Information:**
- We may share aggregated, non-personally identifiable information
- This information cannot be used to identify individual users
- Used for research, analytics, and business purposes`
    },
    {
      title: "Your Privacy Controls",
      content: `You have control over your information and privacy settings:

**Account Controls:**
- View and update your personal information anytime
- Delete your account and associated data
- Export your data in a portable format
- Control who can see your profile and content

**Privacy Settings:**
- Choose who can send you friend requests
- Control who can see your posts and stories
- Manage who can message you directly
- Set visibility for your online status and activity

**Communication Preferences:**
- Control what email notifications you receive
- Choose push notification settings
- Opt out of marketing communications
- Set preferences for product updates

**Content Controls:**
- Delete posts, comments, and messages
- Control who can tag you in content
- Manage story visibility and expiration
- Report and block inappropriate content

**Data Requests:**
- Request a copy of your data
- Ask questions about how your data is used
- Request correction of inaccurate information
- Request deletion of specific information`
    },
    {
      title: "Data Security",
      content: `We take data security seriously and implement multiple layers of protection:

**Technical Safeguards:**
- End-to-end encryption for messages and sensitive data
- Secure data transmission using HTTPS/TLS protocols
- Regular security audits and penetration testing
- Automated monitoring for suspicious activity

**Access Controls:**
- Strict employee access controls with need-to-know basis
- Multi-factor authentication for all staff accounts
- Regular access reviews and permission updates
- Immediate access revocation for departing employees

**Data Protection:**
- Regular backups with secure, encrypted storage
- Geographically distributed data centers
- Disaster recovery and business continuity plans
- Compliance with industry security standards

**Incident Response:**
- 24/7 security monitoring and alerting
- Immediate response team for security incidents
- User notification procedures for data breaches
- Regular review and improvement of security measures

**Physical Security:**
- Secure data centers with restricted access
- Surveillance and monitoring systems
- Environmental controls and fire protection
- Background checks for personnel with physical access`
    },
    {
      title: "Data Retention",
      content: `We retain your information only as long as necessary:

**Account Information:**
- Retained while your account is active
- Deleted within 30 days of account deletion
- Some information may be retained for legal compliance
- Aggregated data may be retained indefinitely

**Content Data:**
- Posts and comments: Until you delete them or close your account
- Messages: Until deleted by you or recipient
- Stories: Automatically deleted after 24 hours
- Backup copies: Retained for up to 90 days for recovery purposes

**Usage Data:**
- Log files: Typically retained for 12 months
- Analytics data: May be retained for up to 2 years
- Security logs: Retained for up to 7 years for fraud prevention
- Aggregated usage statistics: May be retained indefinitely

**Legal Retention:**
- Some data may be retained longer to comply with legal obligations
- Data subject to legal holds will be preserved as required
- Tax and business records retained as required by law
- Investigation data retained until matter is resolved`
    },
    {
      title: "Children's Privacy",
      content: `We are committed to protecting children's privacy online:

**Age Requirements:**
- SocialHub is intended for users 13 years of age and older
- Users under 13 are not permitted to create accounts
- We do not knowingly collect information from children under 13
- If we discover underage accounts, they will be terminated immediately

**Parental Controls:**
- Parents can request information about their child's account
- Parents can request deletion of their child's information
- We provide guidance on online safety for families
- Special protections for users under 18 where required by law

**Teen Privacy:**
- Enhanced privacy settings for users under 18
- Limited data collection for teenage users
- Restricted advertising targeting for minors
- Educational resources about digital privacy and safety

**Verification Process:**
- Age verification during account registration
- Additional verification if underage use is suspected
- Regular audits to ensure compliance with child privacy laws
- Cooperation with parents and legal authorities when necessary`
    },
    {
      title: "International Data Transfers",
      content: `As a global service, we may transfer your information internationally:

**Transfer Mechanisms:**
- We use appropriate safeguards for international transfers
- Compliance with applicable data protection laws
- Standard contractual clauses where required
- Adequacy decisions and certification programs

**Data Locations:**
- Primary data centers located in the United States
- Backup facilities in multiple geographic regions
- Service providers may be located in various countries
- Users can request information about where their data is stored

**Legal Protections:**
- All transfers comply with applicable privacy laws
- Appropriate safeguards in place for each transfer
- Regular review of transfer mechanisms and protections
- User rights remain protected regardless of data location`
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
              Privacy Policy
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              How we collect, use, and protect your personal information
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
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-4">
              Our Commitment to Your Privacy
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At SocialHub, we believe privacy is a fundamental human right. This Privacy Policy explains how we collect, 
              use, share, and protect your information when you use our social networking platform. We're committed to 
              transparency and giving you control over your personal data.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              By using SocialHub, you agree to the collection and use of information in accordance with this policy. 
              We will not use or share your information with anyone except as described in this Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Sections */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6">
                  {section.title}
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

      {/* Your Rights */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-8 text-center">
            Your Rights and Choices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Access & Control</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• View all data we have about you</li>
                <li>• Update your information anytime</li>
                <li>• Download your data in portable formats</li>
                <li>• Control privacy settings</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Deletion & Correction</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Delete your account completely</li>
                <li>• Remove specific content or data</li>
                <li>• Correct inaccurate information</li>
                <li>• Restrict certain data processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-6">
            Questions About Privacy?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your data, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Contact Privacy Team
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:shadow-md transition-all"
            >
              Back to Home
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>Email us directly at: <a href="mailto:privacy@socialhub.com" className="text-indigo-600 hover:text-indigo-700">privacy@socialhub.com</a></p>
            <p className="mt-2">SocialHub Privacy Team, 123 Tech Street, San Francisco, CA 94105</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;