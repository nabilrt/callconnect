import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Logo from '../ui/Logo';

const AdminSidebar = ({ activeSection, setActiveSection, collapsed, onToggle }) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      description: 'Overview & Analytics'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: UsersIcon,
      description: 'Manage users & accounts'
    },
    {
      id: 'content',
      name: 'Content Management',
      icon: DocumentTextIcon,
      description: 'Posts, groups & stories'
    },
    {
      id: 'calls',
      name: 'Call Management',
      icon: PhoneIcon,
      description: 'Call history & analytics'
    },
    {
      id: 'landing',
      name: 'Landing Page',
      icon: GlobeAltIcon,
      description: 'Edit homepage content'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: CogIcon,
      description: 'Platform configuration'
    }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <Logo size="sm" />
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              activeSection === item.id 
                ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' 
                : 'text-gray-700'
            }`}
            title={collapsed ? item.name : ''}
          >
            <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Stats */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Server Status</span>
              <span className="text-green-600">●</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;