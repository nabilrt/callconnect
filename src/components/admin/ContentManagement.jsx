import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  UserGroupIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Welcome to CallConnect',
      content: 'This is our first post on the platform...',
      author: 'john_doe',
      created_at: '2024-01-15T10:30:00Z',
      likes: 24,
      comments: 8,
      status: 'published',
      reported: false
    },
    {
      id: 2,
      title: 'Platform Updates',
      content: 'We have some exciting new features coming...',
      author: 'sarah_j',
      created_at: '2024-01-14T15:45:00Z',
      likes: 18,
      comments: 3,
      status: 'published',
      reported: true
    },
    {
      id: 3,
      title: 'Community Guidelines',
      content: 'Please follow these guidelines when posting...',
      author: 'admin',
      created_at: '2024-01-13T09:20:00Z',
      likes: 45,
      comments: 12,
      status: 'pinned',
      reported: false
    }
  ]);

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Photography Enthusiasts',
      description: 'Share and discuss photography',
      members: 156,
      creator: 'lisa_brown',
      created_at: '2024-01-10T12:00:00Z',
      privacy: 'public',
      reported: false
    },
    {
      id: 2,
      name: 'Tech Discussions',
      description: 'All things technology',
      members: 234,
      creator: 'mike_wilson',
      created_at: '2024-01-08T16:30:00Z',
      privacy: 'public',
      reported: true
    },
    {
      id: 3,
      name: 'Book Club',
      description: 'Monthly book discussions',
      members: 89,
      creator: 'emma_davis',
      created_at: '2024-01-05T14:15:00Z',
      privacy: 'private',
      reported: false
    }
  ]);

  const [stories, setStories] = useState([
    {
      id: 1,
      author: 'sarah_j',
      type: 'image',
      views: 45,
      created_at: '2024-01-15T18:30:00Z',
      expires_at: '2024-01-16T18:30:00Z',
      reported: false
    },
    {
      id: 2,
      author: 'mike_wilson',
      type: 'video',
      views: 78,
      created_at: '2024-01-15T14:20:00Z',
      expires_at: '2024-01-16T14:20:00Z',
      reported: true
    },
    {
      id: 3,
      author: 'lisa_brown',
      type: 'image',
      views: 32,
      created_at: '2024-01-15T11:45:00Z',
      expires_at: '2024-01-16T11:45:00Z',
      reported: false
    }
  ]);

  const tabs = [
    { id: 'posts', name: 'Posts', icon: DocumentTextIcon, count: posts.length },
    { id: 'groups', name: 'Groups', icon: UserGroupIcon, count: groups.length },
    { id: 'stories', name: 'Stories', icon: PhotoIcon, count: stories.length }
  ];

  const handleDelete = (type, id) => {
    if (type === 'posts') {
      setPosts(posts.filter(post => post.id !== id));
    } else if (type === 'groups') {
      setGroups(groups.filter(group => group.id !== id));
    } else if (type === 'stories') {
      setStories(stories.filter(story => story.id !== id));
    }
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PostsContent = () => (
    <div className="space-y-4">
      {posts
        .filter(post => 
          (filterType === 'all' || post.status === filterType || (filterType === 'reported' && post.reported)) &&
          (searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.author.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map((post) => (
        <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                {post.reported && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                  post.status === 'pinned' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.status}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{post.content}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>By @{post.author}</span>
                <span>{formatDate(post.created_at)}</span>
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EyeIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setSelectedItem({ type: 'posts', id: post.id, name: post.title });
                  setShowDeleteModal(true);
                }}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const GroupsContent = () => (
    <div className="space-y-4">
      {groups
        .filter(group => 
          (filterType === 'all' || group.privacy === filterType || (filterType === 'reported' && group.reported)) &&
          (searchTerm === '' || group.name.toLowerCase().includes(searchTerm.toLowerCase()) || group.creator.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map((group) => (
        <div key={group.id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                {group.reported && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.privacy === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {group.privacy}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{group.description}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>Created by @{group.creator}</span>
                <span>{formatDate(group.created_at)}</span>
                <span>{group.members} members</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EyeIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setSelectedItem({ type: 'groups', id: group.id, name: group.name });
                  setShowDeleteModal(true);
                }}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const StoriesContent = () => (
    <div className="space-y-4">
      {stories
        .filter(story => 
          (filterType === 'all' || story.type === filterType || (filterType === 'reported' && story.reported)) &&
          (searchTerm === '' || story.author.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map((story) => (
        <div key={story.id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Story by @{story.author}</h3>
                {story.reported && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  story.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {story.type}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>Posted {formatDate(story.created_at)}</span>
                <span>Expires {formatDate(story.expires_at)}</span>
                <span>{story.views} views</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EyeIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setSelectedItem({ type: 'stories', id: story.id, name: `Story by @${story.author}` });
                  setShowDeleteModal(true);
                }}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'posts':
        return [
          { value: 'all', label: 'All Posts' },
          { value: 'published', label: 'Published' },
          { value: 'pinned', label: 'Pinned' },
          { value: 'reported', label: 'Reported' }
        ];
      case 'groups':
        return [
          { value: 'all', label: 'All Groups' },
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Private' },
          { value: 'reported', label: 'Reported' }
        ];
      case 'stories':
        return [
          { value: 'all', label: 'All Stories' },
          { value: 'image', label: 'Images' },
          { value: 'video', label: 'Videos' },
          { value: 'reported', label: 'Reported' }
        ];
      default:
        return [{ value: 'all', label: 'All' }];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">Manage posts, groups, and stories</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
              <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {getFilterOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'posts' && <PostsContent />}
      {activeTab === 'groups' && <GroupsContent />}
      {activeTab === 'stories' && <StoriesContent />}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedItem.type, selectedItem.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;