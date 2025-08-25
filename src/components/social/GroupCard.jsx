import React from 'react';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const formatMemberCount = (count) => {
    if (count === 1) return '1 member';
    if (count < 1000) return `${count} members`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k members`;
    return `${(count / 1000000).toFixed(1)}m members`;
  };

  const handleGroupClick = () => {
    navigate(`/groups/${group.id}`);
  };

  return (
    <div 
      onClick={handleGroupClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Group Image */}
      <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl overflow-hidden">
        {group.image ? (
          <img
            src={`http://localhost:3001/uploads/${group.image}`}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )}
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            group.privacy === 'public' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {group.privacy === 'public' ? '🌍 Public' : '🔒 Private'}
          </span>
        </div>
      </div>

      {/* Group Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{group.name}</h3>
        
        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatMemberCount(group.members_count)}</span>
          <span className="capitalize font-medium">{group.role}</span>
        </div>

        {/* Admin Badge */}
        {group.role === 'admin' && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              👑 Admin
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;