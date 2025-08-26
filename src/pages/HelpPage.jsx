import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const HelpPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '🔍' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'messaging', name: 'Messaging', icon: '💬' },
    { id: 'posts', name: 'Posts & Stories', icon: '📸' },
    { id: 'groups', name: 'Groups', icon: '👥' },
    { id: 'privacy', name: 'Privacy & Safety', icon: '🔒' },
    { id: 'account', name: 'Account Settings', icon: '⚙️' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' }
  ];

  const helpArticles = [
    {
      id: 1,
      title: 'How to Create Your First Post',
      category: 'getting-started',
      description: 'Learn how to share photos, videos, and thoughts with your friends.',
      content: `Creating your first post on SocialHub is easy! Here's how:

1. **Navigate to the Feed**: From your dashboard, click on the "Feed" tab in the navigation bar.

2. **Click "What's on your mind?"**: You'll see a post creation box at the top of your feed.

3. **Choose Your Content Type**:
   - **Text Post**: Simply type your message in the text area
   - **Photo Post**: Click the camera icon and select images from your device
   - **Video Post**: Click the video icon to upload or record a video

4. **Add Details**: Write a caption, tag friends, or add location if desired.

5. **Set Privacy**: Choose who can see your post (Public, Friends, or Custom).

6. **Post**: Click the "Share" button to publish your post.

**Pro Tips**:
- Use hashtags to make your posts discoverable
- Tag friends by typing @ followed by their username
- Preview your post before sharing
- Edit or delete posts anytime from the three-dot menu`,
      readTime: '3 min read'
    },
    {
      id: 2,
      title: 'Understanding Privacy Settings',
      category: 'privacy',
      description: 'Take control of who can see your content and personal information.',
      content: `Your privacy is important to us. Here's how to manage your privacy settings:

**Profile Privacy**:
1. Go to Settings > Privacy
2. Choose who can see your profile: Everyone, Friends, or Custom
3. Control who can send you friend requests
4. Manage who can see your friend list

**Post Privacy**:
- Set default privacy for all posts
- Change privacy for individual posts
- Use custom lists to share with specific groups

**Messaging Privacy**:
- Control who can message you directly
- Enable/disable message requests from non-friends
- Block unwanted contacts

**Data Privacy**:
- Download your data at any time
- Control what data is used for recommendations
- Manage cookie preferences
- Request account deletion

**Safety Features**:
- Report inappropriate content or users
- Block users who make you uncomfortable
- Control who can tag you in posts
- Manage story visibility

Remember: You can always change these settings later from your account preferences.`,
      readTime: '5 min read'
    },
    {
      id: 3,
      title: 'How to Join and Create Groups',
      category: 'groups',
      description: 'Connect with communities that share your interests.',
      content: `Groups are a great way to connect with people who share your interests. Here's everything you need to know:

**Finding Groups**:
1. Click on "Groups" in the navigation menu
2. Browse suggested groups based on your interests
3. Use the search bar to find specific topics
4. Check out groups your friends have joined

**Joining a Group**:
- Click on any group that interests you
- Read the group description and rules
- Click "Join Group" for public groups
- For private groups, click "Request to Join"

**Creating Your Own Group**:
1. Go to Groups page and click "Create Group"
2. Choose a name and description
3. Set group privacy (Public or Private)
4. Add a group image and cover photo
5. Invite your first members
6. Set group rules and guidelines

**Group Features**:
- **Group Feed**: Share posts visible only to group members
- **Group Chat**: Real-time messaging with all members
- **Member Management**: Admins can moderate content and members
- **Events**: Organize group meetups and activities

**Group Roles**:
- **Member**: Can post, comment, and participate in discussions
- **Moderator**: Can remove posts and manage members
- **Admin**: Full control over group settings and membership

**Best Practices**:
- Read and follow group rules
- Keep discussions relevant to the group topic
- Be respectful to all members
- Report inappropriate content to moderators`,
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Messaging Basics',
      category: 'messaging',
      description: 'Learn how to chat with friends and manage your conversations.',
      content: `Stay connected with friends through our messaging system:

**Starting a Conversation**:
1. Click the "Messages" icon in the top navigation
2. Click "New Message" or the + button
3. Search for friends or enter their username
4. Type your message and press Enter

**Message Features**:
- **Text Messages**: Send plain text messages
- **Media Sharing**: Share photos, videos, and files
- **Emojis & Stickers**: Express yourself with fun visuals
- **Voice Messages**: Record and send audio messages
- **Message Reactions**: React to messages with emojis

**Conversation Management**:
- **Pin Important Chats**: Keep important conversations at the top
- **Mute Notifications**: Silence notifications for specific chats
- **Archive Conversations**: Hide old chats without deleting them
- **Delete Messages**: Remove messages from both sides
- **Block Users**: Prevent unwanted messages

**Online Status**:
- See when friends are online (green dot)
- Control your own online visibility in settings
- "Last seen" timestamps for offline friends

**Message Requests**:
- Messages from non-friends go to Message Requests
- Review and accept/decline requests
- Automatically decline requests from blocked users

**Privacy & Safety**:
- All messages are encrypted end-to-end
- Report inappropriate messages
- Block users who harass you
- Delete message history anytime

**Tips for Better Messaging**:
- Use @ mentions in group chats
- Pin important messages for later reference
- Use search to find old messages
- Set custom notification sounds for important contacts`,
      readTime: '4 min read'
    },
    {
      id: 5,
      title: 'Stories Feature Guide',
      category: 'posts',
      description: 'Share temporary moments that disappear after 24 hours.',
      content: `Stories let you share moments that disappear after 24 hours:

**Creating Stories**:
1. Click your profile picture in the stories section
2. Choose your story type:
   - **Photo Story**: Capture or upload a photo
   - **Video Story**: Record or upload a video (up to 30 seconds)
   - **Text Story**: Create text with colorful backgrounds

**Story Customization**:
- **Text Overlay**: Add text with custom fonts and colors
- **Background Colors**: Choose from preset gradient backgrounds
- **Text Positioning**: Place text anywhere on your story
- **Preview**: See how your story looks before posting

**Story Privacy**:
- **Public Stories**: Visible to all your friends
- **Custom Privacy**: Choose specific friends who can view
- **Hide from Specific Users**: Exclude certain people from seeing your stories

**Viewing Stories**:
- Stories appear at the top of your feed
- Tap to view, hold to pause
- Swipe left/right to navigate between stories
- Stories auto-advance after 5 seconds

**Story Interactions**:
- **Views**: See who viewed your story
- **Likes**: Friends can like your stories
- **Comments**: Receive private messages about your stories
- **Share**: Friends can share your story (if you allow it)

**Story Management**:
- **Save Stories**: Download your stories before they expire
- **Delete Early**: Remove stories before 24 hours
- **Story Archive**: Automatically save all your stories
- **Highlights**: Pin important stories to your profile

**Best Practices**:
- Post regularly to stay connected with friends
- Use stories for behind-the-scenes content
- Engage with friends' stories by viewing and reacting
- Respect others' privacy when sharing their content`,
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Managing Your Profile',
      category: 'account',
      description: 'Customize your profile and manage account settings.',
      content: `Your profile is how others see you on SocialHub. Here's how to make it shine:

**Profile Basics**:
1. Click on your name/avatar in the top right
2. Select "Your Profile" from the dropdown
3. Click "Edit Profile" to make changes

**Profile Elements**:
- **Profile Picture**: Upload a clear, recognizable photo of yourself
- **Cover Photo**: Add a banner image that represents your personality
- **Bio**: Write a short description about yourself (up to 150 characters)
- **Basic Info**: Add location, website, birthday, etc.

**Profile Customization**:
- **Username**: Choose a unique username (can be changed once per month)
- **Display Name**: Your full name as it appears to others
- **Contact Info**: Add email, phone, or social media links
- **Work/Education**: Share professional or academic information

**Profile Privacy**:
- **Profile Visibility**: Choose who can see your full profile
- **Contact Info**: Control who can see your personal details
- **Post History**: Manage who can see your past posts
- **Friend List**: Hide or show your friends list

**Profile Activity**:
- **Recent Posts**: Your latest posts appear on your profile
- **Photos**: All your photos in one place
- **Friends**: List of your connections
- **About**: Detailed information about you

**Account Security**:
- **Password**: Change your password regularly
- **Two-Factor Authentication**: Enable 2FA for extra security
- **Login Sessions**: See where you're logged in
- **App Permissions**: Manage connected apps

**Profile Tips**:
- Use a clear, friendly profile picture
- Keep your bio updated and interesting
- Regularly review and update your privacy settings
- Remove old posts that no longer represent you
- Use a professional email address

**Deactivating vs Deleting**:
- **Deactivate**: Temporarily hide your profile (reversible)
- **Delete**: Permanently remove your account (irreversible after 30 days)`,
      readTime: '6 min read'
    },
    {
      id: 7,
      title: 'Troubleshooting Common Issues',
      category: 'troubleshooting',
      description: 'Solutions to the most common problems users encounter.',
      content: `Having trouble? Here are solutions to common issues:

**Can't Log In**:
- Check your email and password are correct
- Try resetting your password
- Clear your browser cache and cookies
- Disable browser extensions temporarily
- Try a different browser or device

**Posts Not Loading**:
- Refresh the page (Ctrl+R or Cmd+R)
- Check your internet connection
- Clear browser cache
- Disable ad blockers temporarily
- Try accessing SocialHub in incognito/private mode

**Images/Videos Won't Upload**:
- Check file size (max 50MB for videos, 10MB for photos)
- Ensure file format is supported (JPEG, PNG, MP4, etc.)
- Check your internet connection
- Try compressing large files
- Disable browser extensions

**Messages Not Sending**:
- Check your internet connection
- Refresh the messages page
- Try logging out and back in
- Check if you've been blocked by the recipient
- Report the issue if it persists

**Notifications Not Working**:
- Check notification settings in your browser
- Enable notifications for SocialHub
- Check your account notification preferences
- Clear browser cache
- Try a different browser

**Can't Find Friends**:
- Check privacy settings (they might have limited searchability)
- Try searching by email or username
- Import contacts from your address book
- Ask friends to send you their profile link
- Check if you've accidentally blocked them

**App Running Slowly**:
- Close unnecessary browser tabs
- Clear browser cache and cookies
- Update your browser to the latest version
- Check available memory on your device
- Try using SocialHub during off-peak hours

**Can't Join Groups**:
- Check if the group is private (requires approval)
- Ensure you're not already a member
- Check if you've been blocked from the group
- Try refreshing the page
- Contact the group admin

**Stories Not Appearing**:
- Check your story privacy settings
- Ensure friends haven't hidden your stories
- Try refreshing the page
- Check if your story has expired (24 hours)

**When to Contact Support**:
- Account has been hacked or compromised
- Experiencing harassment or abuse
- Technical issues persist after trying solutions
- Need to recover deleted content
- Billing or subscription issues
- Report bugs or suggest improvements

**Before Contacting Support**:
1. Try the solutions above
2. Note your browser and device type
3. Take screenshots of error messages
4. Note when the issue started occurring
5. Check our system status page for known issues`,
      readTime: '8 min read'
    }
  ];

  const quickLinks = [
    { title: 'System Status', href: '#', icon: '🔄' },
    { title: 'Contact Support', href: '/contact', icon: '💌' },
    { title: 'Community Guidelines', href: '#', icon: '📋' },
    { title: 'Report a Problem', href: '#', icon: '⚠️' },
    { title: 'Feature Requests', href: '#', icon: '💡' },
    { title: 'Bug Reports', href: '#', icon: '🐛' }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Help Center
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Everything you need to know about using SocialHub
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-manrope mb-4">
              Quick Links
            </h2>
            <p className="text-lg text-gray-600">
              Fast access to common resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  if (link.href === '/contact') {
                    e.preventDefault();
                    navigate('/contact');
                  }
                }}
                className="flex items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group"
              >
                <span className="text-2xl mr-4">{link.icon}</span>
                <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {link.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-manrope mb-4">
              Browse by Category
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Help Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredArticles.map((article) => (
              <details key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 group hover:shadow-lg transition-shadow">
                <summary className="cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-manrope group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {article.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="bg-gray-100 px-3 py-1 rounded-full mr-3">
                          {categories.find(cat => cat.id === article.category)?.icon} {categories.find(cat => cat.id === article.category)?.name}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 ml-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="border-t border-gray-100 pt-6 mt-4">
                  <div className="prose prose-gray max-w-none">
                    {article.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;