const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getContentSections,
  createContentSection,
  updateContentSection,
  deleteContentSection,
  getContentFeatures,
  createContentFeature,
  updateContentFeature,
  deleteContentFeature,
  getContentTestimonials,
  createContentTestimonial,
  updateContentTestimonial,
  deleteContentTestimonial,
  getContentStats,
  createContentStat,
  updateContentStat,
  deleteContentStat,
  getAppSettings,
  updateAppSetting
} = require('../database/db');

// Public route to get all content sections for landing page
router.get('/sections', (req, res) => {
  getContentSections((err, sections) => {
    if (err) {
      console.error('Error fetching content sections:', err);
      return res.status(500).json({ error: 'Failed to fetch content sections' });
    }

    // Get related data for each section
    const sectionPromises = sections.map(section => {
      return new Promise((resolve, reject) => {
        const sectionData = { ...section };

        if (section.type === 'features') {
          getContentFeatures(section.id, (err, features) => {
            if (err) return reject(err);
            sectionData.features = features;
            resolve(sectionData);
          });
        } else if (section.type === 'testimonials') {
          getContentTestimonials(section.id, (err, testimonials) => {
            if (err) return reject(err);
            sectionData.testimonials = testimonials;
            resolve(sectionData);
          });
        } else if (section.type === 'stats') {
          getContentStats(section.id, (err, stats) => {
            if (err) return reject(err);
            sectionData.stats = stats;
            resolve(sectionData);
          });
        } else {
          resolve(sectionData);
        }
      });
    });

    Promise.all(sectionPromises)
      .then(completeSections => {
        res.json(completeSections);
      })
      .catch(err => {
        console.error('Error fetching section data:', err);
        res.status(500).json({ error: 'Failed to fetch complete section data' });
      });
  });
});

// Admin routes for content management
router.use(authenticateToken);

// Content Sections Management
router.post('/sections', (req, res) => {
  createContentSection(req.body, (err, section) => {
    if (err) {
      console.error('Error creating content section:', err);
      return res.status(500).json({ error: 'Failed to create content section' });
    }
    res.status(201).json(section);
  });
});

router.put('/sections/:id', (req, res) => {
  const sectionId = req.params.id;
  updateContentSection(sectionId, req.body, (err) => {
    if (err) {
      console.error('Error updating content section:', err);
      return res.status(500).json({ error: 'Failed to update content section' });
    }
    res.json({ success: true });
  });
});

router.delete('/sections/:id', (req, res) => {
  const sectionId = req.params.id;
  deleteContentSection(sectionId, (err) => {
    if (err) {
      console.error('Error deleting content section:', err);
      return res.status(500).json({ error: 'Failed to delete content section' });
    }
    res.json({ success: true });
  });
});

// Features Management
router.get('/sections/:sectionId/features', (req, res) => {
  const sectionId = req.params.sectionId;
  getContentFeatures(sectionId, (err, features) => {
    if (err) {
      console.error('Error fetching features:', err);
      return res.status(500).json({ error: 'Failed to fetch features' });
    }
    res.json(features);
  });
});

router.post('/sections/:sectionId/features', (req, res) => {
  const featureData = { ...req.body, section_id: req.params.sectionId };
  createContentFeature(featureData, (err, feature) => {
    if (err) {
      console.error('Error creating feature:', err);
      return res.status(500).json({ error: 'Failed to create feature' });
    }
    res.status(201).json(feature);
  });
});

router.put('/features/:id', (req, res) => {
  const featureId = req.params.id;
  updateContentFeature(featureId, req.body, (err) => {
    if (err) {
      console.error('Error updating feature:', err);
      return res.status(500).json({ error: 'Failed to update feature' });
    }
    res.json({ success: true });
  });
});

router.delete('/features/:id', (req, res) => {
  const featureId = req.params.id;
  deleteContentFeature(featureId, (err) => {
    if (err) {
      console.error('Error deleting feature:', err);
      return res.status(500).json({ error: 'Failed to delete feature' });
    }
    res.json({ success: true });
  });
});

// Testimonials Management
router.get('/sections/:sectionId/testimonials', (req, res) => {
  const sectionId = req.params.sectionId;
  getContentTestimonials(sectionId, (err, testimonials) => {
    if (err) {
      console.error('Error fetching testimonials:', err);
      return res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
    res.json(testimonials);
  });
});

router.post('/sections/:sectionId/testimonials', (req, res) => {
  const testimonialData = { ...req.body, section_id: req.params.sectionId };
  createContentTestimonial(testimonialData, (err, testimonial) => {
    if (err) {
      console.error('Error creating testimonial:', err);
      return res.status(500).json({ error: 'Failed to create testimonial' });
    }
    res.status(201).json(testimonial);
  });
});

router.put('/testimonials/:id', (req, res) => {
  const testimonialId = req.params.id;
  updateContentTestimonial(testimonialId, req.body, (err) => {
    if (err) {
      console.error('Error updating testimonial:', err);
      return res.status(500).json({ error: 'Failed to update testimonial' });
    }
    res.json({ success: true });
  });
});

router.delete('/testimonials/:id', (req, res) => {
  const testimonialId = req.params.id;
  deleteContentTestimonial(testimonialId, (err) => {
    if (err) {
      console.error('Error deleting testimonial:', err);
      return res.status(500).json({ error: 'Failed to delete testimonial' });
    }
    res.json({ success: true });
  });
});

// Stats Management
router.get('/sections/:sectionId/stats', (req, res) => {
  const sectionId = req.params.sectionId;
  getContentStats(sectionId, (err, stats) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json(stats);
  });
});

router.post('/sections/:sectionId/stats', (req, res) => {
  const statData = { ...req.body, section_id: req.params.sectionId };
  createContentStat(statData, (err, stat) => {
    if (err) {
      console.error('Error creating stat:', err);
      return res.status(500).json({ error: 'Failed to create stat' });
    }
    res.status(201).json(stat);
  });
});

router.put('/stats/:id', (req, res) => {
  const statId = req.params.id;
  updateContentStat(statId, req.body, (err) => {
    if (err) {
      console.error('Error updating stat:', err);
      return res.status(500).json({ error: 'Failed to update stat' });
    }
    res.json({ success: true });
  });
});

router.delete('/stats/:id', (req, res) => {
  const statId = req.params.id;
  deleteContentStat(statId, (err) => {
    if (err) {
      console.error('Error deleting stat:', err);
      return res.status(500).json({ error: 'Failed to delete stat' });
    }
    res.json({ success: true });
  });
});

// App Settings Management
router.get('/settings', (req, res) => {
  const category = req.query.category;
  getAppSettings(category, (err, settings) => {
    if (err) {
      console.error('Error fetching app settings:', err);
      return res.status(500).json({ error: 'Failed to fetch app settings' });
    }
    res.json(settings);
  });
});

router.put('/settings/:key', (req, res) => {
  const { key } = req.params;
  const { value, description, category } = req.body;
  
  updateAppSetting(key, value, description, category, (err) => {
    if (err) {
      console.error('Error updating app setting:', err);
      return res.status(500).json({ error: 'Failed to update app setting' });
    }
    res.json({ success: true });
  });
});

module.exports = router;