import React from 'react';

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  username = '',
  onClick,
  className = '',
  showUpload = false,
  onUpload
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const avatarContent = src ? (
    <img
      src={`http://localhost:3001${src}`}
      alt={alt || username}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
      {getInitials(username || alt || '??')}
    </div>
  );

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div 
        className={`
          ${sizes[size]} rounded-full overflow-hidden border-2 border-white shadow-lg
          ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
        `}
        onClick={onClick}
      >
        {avatarContent}
      </div>
      
      {showUpload && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </label>
        </>
      )}
    </div>
  );
};

export default Avatar;