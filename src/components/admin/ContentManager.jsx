import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  EyeIcon, 
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ContentManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section', description: 'Main banner with call-to-action' },
    { value: 'features', label: 'Features', description: 'Highlight product features' },
    { value: 'stats', label: 'Statistics', description: 'Display key metrics' },
    { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
    { value: 'security', label: 'Security', description: 'Security and privacy info' },
    { value: 'how_it_works', label: 'How It Works', description: 'Step-by-step process' },
    { value: 'cta', label: 'Call to Action', description: 'Conversion section' }
  ];

  // Fetch content sections
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/content/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(data.sort((a, b) => a.section_order - b.section_order));
      } else {
        console.error('Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (type) => {
    const newSection = {
      type,
      title: `New ${type} section`,
      content: 'Edit this content...',
      enabled: true,
      section_order: sections.length + 1
    };

    if (type === 'hero' || type === 'cta') {
      newSection.button_text = 'Click Here';
      newSection.button_link = '/signup';
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/content/sections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSection)
      });

      if (response.ok) {
        const createdSection = await response.json();
        setSections([...sections, createdSection]);
      } else {
        console.error('Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/content/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setSections(prev => prev.map(section => 
          section.id === sectionId ? { ...section, ...updates } : section
        ));
      } else {
        console.error('Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/content/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSections(prev => prev.filter(section => section.id !== sectionId));
      } else {
        console.error('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleMoveSection = async (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    // Update order values
    newSections.forEach((section, index) => {
      section.section_order = index + 1;
    });

    setSections(newSections);

    // Update in database
    try {
      const token = localStorage.getItem('token');
      await Promise.all(newSections.map(section => 
        fetch(`/api/content/sections/${section.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ section_order: section.section_order })
        })
      ));
    } catch (error) {
      console.error('Error updating section order:', error);
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
      const newFeatures = [...(formData.features || [])];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
      setFormData({
        ...formData,
        features: [...(formData.features || []), { icon: '✨', title: 'New Feature', description: 'Description' }]
      });
    };

    const removeFeature = (index) => {
      setFormData({
        ...formData,
        features: (formData.features || []).filter((_, i) => i !== index)
      });
    };

    const handleTestimonialUpdate = (index, field, value) => {
      const newTestimonials = [...(formData.testimonials || [])];
      newTestimonials[index] = { ...newTestimonials[index], [field]: value };
      setFormData({ ...formData, testimonials: newTestimonials });
    };

    const addTestimonial = () => {
      setFormData({
        ...formData,
        testimonials: [...(formData.testimonials || []), { name: 'Customer Name', role: 'Job Title', content: 'Testimonial content here', rating: 5 }]
      });
    };

    const removeTestimonial = (index) => {
      setFormData({
        ...formData,
        testimonials: (formData.testimonials || []).filter((_, i) => i !== index)
      });
    };

    const handleStatUpdate = (index, field, value) => {
      const newStats = [...(formData.stats || [])];
      newStats[index] = { ...newStats[index], [field]: value };
      setFormData({ ...formData, stats: newStats });
    };

    const addStat = () => {
      setFormData({
        ...formData,
        stats: [...(formData.stats || []), { label: 'New Stat', value: '100+', icon: '📈' }]
      });
    };

    const removeStat = (index) => {
      setFormData({
        ...formData,
        stats: (formData.stats || []).filter((_, i) => i !== index)
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
                      value={formData.button_text || ''}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={formData.button_link || ''}
                      onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
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

            {/* Features Editor */}
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
                  {(formData.features || []).map((feature, index) => (
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

            {/* Testimonials Editor */}
            {section.type === 'testimonials' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Testimonials</label>
                  <button
                    type="button"
                    onClick={addTestimonial}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Add Testimonial
                  </button>
                </div>
                <div className="space-y-4">
                  {(formData.testimonials || []).map((testimonial, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => handleTestimonialUpdate(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={testimonial.role}
                            onChange={(e) => handleTestimonialUpdate(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                          <textarea
                            value={testimonial.content}
                            onChange={(e) => handleTestimonialUpdate(index, 'content', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={testimonial.rating}
                            onChange={(e) => handleTestimonialUpdate(index, 'rating', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeTestimonial(index)}
                            className="p-2 text-red-600 hover:text-red-800"
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

            {/* Stats Editor */}
            {section.type === 'stats' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Statistics</label>
                  <button
                    type="button"
                    onClick={addStat}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Add Stat
                  </button>
                </div>
                <div className="space-y-4">
                  {(formData.stats || []).map((stat, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => handleStatUpdate(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => handleStatUpdate(index, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                            <input
                              type="text"
                              value={stat.icon}
                              onChange={(e) => handleStatUpdate(index, 'icon', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStat(index)}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview Live Site
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
            {sections.map(section => (
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
                        disabled={section.section_order === 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(section.id, 'down')}
                        disabled={section.section_order === sections.length}
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
                        onChange={(e) => handleUpdateSection(section.id, { enabled: e.target.checked })}
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
          onUpdate={handleUpdateSection}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};

export default ContentManager;