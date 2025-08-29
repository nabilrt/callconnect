import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  EyeIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const LandingPageManager = () => {
  const [sections, setSections] = useState([
    {
      id: 1,
      type: 'hero',
      title: 'Connect Globally with CallConnect',
      content: 'Professional video calling made simple and secure.',
      buttonText: 'Get Started Free',
      buttonLink: '/signup',
      image: '/api/placeholder/600/400',
      enabled: true,
      order: 1
    },
    {
      id: 2,
      type: 'features',
      title: 'Why Choose CallConnect?',
      content: 'Experience the future of video communication',
      features: [
        { icon: '🔒', title: 'Secure', description: 'End-to-end encryption' },
        { icon: '⚡', title: 'Fast', description: 'Lightning-fast connections' },
        { icon: '📱', title: 'Mobile', description: 'Works on any device' },
        { icon: '🎥', title: 'HD Quality', description: 'Crystal clear video' }
      ],
      enabled: true,
      order: 2
    },
    {
      id: 3,
      type: 'testimonials',
      title: 'What Our Users Say',
      content: 'Trusted by thousands of professionals worldwide',
      testimonials: [
        { name: 'Sarah Johnson', role: 'CEO, TechStart', content: 'CallConnect has revolutionized our remote meetings.' },
        { name: 'Mike Chen', role: 'Designer', content: 'The best video calling platform I\'ve used.' }
      ],
      enabled: true,
      order: 3
    },
    {
      id: 4,
      type: 'cta',
      title: 'Ready to Get Started?',
      content: 'Join thousands of users who trust CallConnect for their video calls.',
      buttonText: 'Start Your Free Trial',
      buttonLink: '/signup',
      enabled: true,
      order: 4
    }
  ]);

  const [editingSection, setEditingSection] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section', description: 'Main banner with call-to-action' },
    { value: 'features', label: 'Features', description: 'Highlight product features' },
    { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
    { value: 'cta', label: 'Call to Action', description: 'Conversion section' },
    { value: 'about', label: 'About', description: 'Company information' },
    { value: 'pricing', label: 'Pricing', description: 'Pricing plans' }
  ];

  const handleSectionUpdate = (sectionId, updates) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const handleAddSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      title: `New ${type} section`,
      content: 'Edit this content...',
      enabled: true,
      order: sections.length + 1
    };

    if (type === 'hero' || type === 'cta') {
      newSection.buttonText = 'Click Here';
      newSection.buttonLink = '#';
    }

    if (type === 'features') {
      newSection.features = [
        { icon: '✨', title: 'Feature 1', description: 'Description here' }
      ];
    }

    if (type === 'testimonials') {
      newSection.testimonials = [
        { name: 'Customer Name', role: 'Job Title', content: 'Testimonial content here' }
      ];
    }

    setSections(prev => [...prev, newSection]);
  };

  const handleDeleteSection = (sectionId) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const handleMoveSection = (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    newSections.forEach((section, index) => {
      section.order = index + 1;
    });

    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving landing page sections:', sections);
    } catch (error) {
      console.error('Failed to save sections:', error);
    } finally {
      setSaving(false);
    }
  };

  const SectionEditor = ({ section, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState(section);

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(section.id, formData);
      onCancel();
    };

    const handleFeatureUpdate = (index, field, value) => {
      const newFeatures = [...formData.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
      setFormData({
        ...formData,
        features: [...formData.features, { icon: '✨', title: 'New Feature', description: 'Description' }]
      });
    };

    const removeFeature = (index) => {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit {section.type} Section</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {(section.type === 'hero' || section.type === 'cta') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={formData.buttonLink || ''}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {section.type === 'features' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Add Feature
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <input
                            type="text"
                            value={feature.icon}
                            onChange={(e) => handleFeatureUpdate(index, 'icon', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => handleFeatureUpdate(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={feature.description}
                              onChange={(e) => handleFeatureUpdate(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-2 p-2 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SectionPreview = ({ section }) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{section.title}</h1>
              <p className="text-xl mb-8">{section.content}</p>
              {section.buttonText && (
                <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100">
                  {section.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-xl text-gray-600">{section.content}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.features?.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="bg-indigo-600 py-16">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-3xl font-bold text-white mb-4">{section.title}</h2>
              <p className="text-xl text-indigo-100 mb-8">{section.content}</p>
              {section.buttonText && (
                <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100">
                  {section.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-600">{section.content}</p>
            </div>
          </div>
        );
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Preview</h1>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Exit Preview
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {sections
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <SectionPreview key={section.id} section={section} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Landing Page Manager</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectionTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleAddSection(type.value)}
                className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-left"
              >
                <div className="flex items-center mb-2">
                  <PlusIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Sections</h2>
          <div className="space-y-4">
            {sections
              .sort((a, b) => a.order - b.order)
              .map(section => (
                <div
                  key={section.id}
                  className={`border border-gray-200 rounded-lg p-4 ${
                    !section.enabled ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveSection(section.id, 'up')}
                          disabled={section.order === 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(section.id, 'down')}
                          disabled={section.order === sections.length}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{section.type} Section</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={(e) => handleSectionUpdate(section.id, { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-gray-400 hover:text-indigo-600"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {editingSection && (
        <SectionEditor
          section={editingSection}
          onUpdate={handleSectionUpdate}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};

export default LandingPageManager;