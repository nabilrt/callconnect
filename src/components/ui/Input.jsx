import React from 'react';

const Input = ({ 
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          placeholder-gray-400 transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;