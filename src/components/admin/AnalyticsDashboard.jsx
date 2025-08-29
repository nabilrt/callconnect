import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    users: { total: 25842, growth: 12.5, trend: 'up' },
    posts: { total: 156743, growth: 8.2, trend: 'up' },
    messages: { total: 892341, growth: 15.7, trend: 'up' },
    calls: { total: 43251, growth: -3.2, trend: 'down' },
    groups: { total: 1247, growth: 22.1, trend: 'up' },
    stories: { total: 8934, growth: 5.8, trend: 'up' }
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'user_signup', user: 'john_doe', message: 'New user registered', time: '2 minutes ago', icon: UsersIcon },
    { type: 'post_created', user: 'sarah_j', message: 'Created a new post', time: '5 minutes ago', icon: DocumentTextIcon },
    { type: 'call_completed', user: 'mike_wilson', message: 'Completed a video call', time: '8 minutes ago', icon: PhoneIcon },
    { type: 'group_created', user: 'lisa_brown', message: 'Created new group "Photography"', time: '12 minutes ago', icon: UserGroupIcon },
    { type: 'message_sent', user: 'alex_smith', message: 'Sent 15 messages', time: '15 minutes ago', icon: ChatBubbleLeftRightIcon }
  ]);

  const [topUsers, setTopUsers] = useState([
    { id: 1, name: 'Sarah Johnson', username: 'sarah_j', posts: 145, followers: 1247, activity: 95 },
    { id: 2, name: 'Mike Wilson', username: 'mike_w', posts: 132, followers: 1156, activity: 92 },
    { id: 3, name: 'Lisa Brown', username: 'lisa_b', posts: 128, followers: 1098, activity: 88 },
    { id: 4, name: 'Alex Smith', username: 'alex_s', posts: 115, followers: 987, activity: 85 },
    { id: 5, name: 'Emma Davis', username: 'emma_d', posts: 108, followers: 923, activity: 82 }
  ]);

  const StatCard = ({ title, value, growth, trend, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
        )}
        <span className={`ml-2 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(growth)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs last period</span>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, action, icon: Icon, color }) => (
    <button
      onClick={action}
      className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Platform overview and key metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          growth={stats.users.growth}
          trend={stats.users.trend}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Posts Created"
          value={stats.posts.total}
          growth={stats.posts.growth}
          trend={stats.posts.trend}
          icon={DocumentTextIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Messages Sent"
          value={stats.messages.total}
          growth={stats.messages.growth}
          trend={stats.messages.trend}
          icon={ChatBubbleLeftRightIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Calls Made"
          value={stats.calls.total}
          growth={stats.calls.growth}
          trend={stats.calls.trend}
          icon={PhoneIcon}
          color="bg-indigo-500"
        />
        <StatCard
          title="Active Groups"
          value={stats.groups.total}
          growth={stats.groups.growth}
          trend={stats.groups.trend}
          icon={UserGroupIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Stories Shared"
          value={stats.stories.total}
          growth={stats.stories.growth}
          trend={stats.stories.trend}
          icon={ChartBarIcon}
          color="bg-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Broadcast Message"
            description="Send message to all users"
            action={() => console.log('Broadcast')}
            icon={ChatBubbleLeftRightIcon}
            color="bg-blue-500"
          />
          <QuickAction
            title="System Maintenance"
            description="Enable maintenance mode"
            action={() => console.log('Maintenance')}
            icon={ChartBarIcon}
            color="bg-yellow-500"
          />
          <QuickAction
            title="Export Data"
            description="Download analytics report"
            action={() => console.log('Export')}
            icon={DocumentTextIcon}
            color="bg-green-500"
          />
          <QuickAction
            title="Backup Database"
            description="Create system backup"
            action={() => console.log('Backup')}
            icon={UsersIcon}
            color="bg-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-900">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  <activity.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">@{activity.user}</span> {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Active Users</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-900">View All</button>
          </div>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-sm font-medium text-indigo-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.posts} posts</p>
                  <p className="text-xs text-gray-500">{user.activity}% active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">99.9%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">23ms</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-600">1,247</div>
            <div className="text-sm text-gray-500">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-purple-600">89.2%</div>
            <div className="text-sm text-gray-500">Call Quality</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;