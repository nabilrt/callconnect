import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const AboutPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former tech lead at major social platforms, passionate about building meaningful connections.",
      image: "SJ",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      name: "Michael Chen",
      role: "Lead Developer", 
      bio: "Full-stack engineer with expertise in real-time systems and scalable architectures.",
      image: "MC",
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      bio: "UX designer focused on creating intuitive and beautiful user experiences.",
      image: "ER", 
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "David Kim",
      role: "Security Engineer",
      bio: "Cybersecurity expert ensuring your data stays private and secure.",
      image: "DK",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const milestones = [
    {
      year: "2022",
      title: "The Beginning",
      description: "SocialHub was founded with a simple vision: create a social platform that prioritizes meaningful connections over engagement metrics."
    },
    {
      year: "2023", 
      title: "Product Launch",
      description: "Launched our MVP with core features: messaging, posts, and friend networks. Reached 1,000 beta users in the first month."
    },
    {
      year: "2024",
      title: "Feature Expansion",
      description: "Added groups, stories, and advanced privacy controls. Grew to over 25,000 active users worldwide."
    },
    {
      year: "2024",
      title: "Today",
      description: "Continuing to innovate with new features while maintaining our core values of privacy, security, and authentic connections."
    }
  ];

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Human-First Design",
      description: "We prioritize genuine human connections over addictive engagement patterns."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Privacy by Design",
      description: "Your data belongs to you. We build privacy protections into every feature from day one."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Innovation",
      description: "We constantly explore new ways to improve communication and social interaction."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Community",
      description: "We foster inclusive communities where everyone feels welcome and valued."
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
              About SocialHub
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              We're building the future of social networking - one authentic connection at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                In a world where social media often divides us, SocialHub exists to bring people together through 
                authentic connections. We believe that technology should enhance human relationships, not replace them.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform is designed to foster meaningful conversations, celebrate genuine moments, and 
                create communities where people feel heard, valued, and connected.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-indigo-600 font-manrope">25K+</div>
                    <div className="text-gray-700 font-medium">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-indigo-600 font-manrope">500K+</div>
                    <div className="text-gray-700 font-medium">Posts Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-indigo-600 font-manrope">50+</div>
                    <div className="text-gray-700 font-medium">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-indigo-600 font-manrope">99.9%</div>
                    <div className="text-gray-700 font-medium">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at SocialHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-manrope">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a simple idea to a thriving community
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 lg:left-1/2 lg:-translate-x-px"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-2 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-lg lg:left-1/2 lg:-translate-x-1/2 z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 lg:ml-0 lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="text-2xl font-bold text-indigo-600 font-manrope mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-manrope">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind SocialHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group">
                <div className={`w-20 h-20 ${member.color} rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:scale-110 transition-transform`}>
                  {member.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 font-manrope">
                  {member.name}
                </h3>
                <div className="text-indigo-600 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
            Be part of a social platform that values authentic connections and meaningful conversations.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;