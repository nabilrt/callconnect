const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAppSettings, updateAppSetting } = require('../database/db');

// All settings routes require authentication
router.use((req, res, next) => {
  console.log('⚙️ Settings route accessed:', req.path);
  
  // Disable caching for all settings endpoints
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  authenticateToken(req, res, next);
});

// Get all settings organized by category
router.get('/', (req, res) => {
  getAppSettings(null, (err, settings) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    
    // Organize settings by category
    const organizedSettings = {
      general: {},
      security: {},
      notifications: {},
      storage: {}
    };
    
    // Set default values
    const defaultSettings = {
      general: {
        siteName: 'CallConnect',
        siteDescription: 'Professional video calling platform',
        maintenanceMode: false,
        registrationEnabled: true,
        maxUsersPerCall: 8,
        defaultCallDuration: 60
      },
      security: {
        passwordMinLength: 8,
        requireTwoFactor: false,
        sessionTimeout: 1440,
        maxLoginAttempts: 5,
        enableRateLimiting: true
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        adminAlerts: true,
        userWelcomeEmail: true
      },
      storage: {
        maxFileSize: 100,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        recordingsRetention: 30,
        cleanupSchedule: 'weekly'
      }
    };
    
    // Apply defaults first
    Object.keys(defaultSettings).forEach(category => {
      organizedSettings[category] = { ...defaultSettings[category] };
    });
    
    // Override with database values
    settings.forEach(setting => {
      const category = setting.category || 'general';
      if (organizedSettings[category] !== undefined) {
        let value = setting.value;
        
        // Parse specific value types
        try {
          if (setting.key.includes('Enabled') || setting.key.includes('Mode') || setting.key.includes('require')) {
            value = value === 'true' || value === true;
          } else if (setting.key.includes('Length') || setting.key.includes('Timeout') || setting.key.includes('Size') || setting.key.includes('Retention') || setting.key.includes('Attempts') || setting.key.includes('Users')) {
            value = parseInt(value) || defaultSettings[category][setting.key];
          } else if (setting.key === 'allowedFileTypes') {
            value = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s => s.trim()) : defaultSettings[category][setting.key]);
          }
        } catch (e) {
          console.log('Error parsing setting:', setting.key, setting.value);
        }
        
        organizedSettings[category][setting.key] = value;
      }
    });
    
    res.json(organizedSettings);
  });
});

// Get public settings (for frontend use)
router.get('/public', (req, res) => {
  console.log('🌐 Public settings requested');
  
  getAppSettings(null, (err, settings) => {
    if (err) {
      console.error('Error fetching public settings:', err);
      return res.json({
        siteName: 'CallConnect',
        siteDescription: 'Professional video calling platform',
        registrationEnabled: true,
        maintenanceMode: false
      });
    }
    
    // Extract only public settings
    const publicSettings = {
      siteName: 'CallConnect',
      siteDescription: 'Professional video calling platform',
      registrationEnabled: true,
      maintenanceMode: false
    };
    
    // Override with database values
    settings.forEach(setting => {
      if (['siteName', 'siteDescription', 'registrationEnabled', 'maintenanceMode'].includes(setting.key)) {
        let value = setting.value;
        
        // Parse boolean values
        if (setting.key === 'registrationEnabled' || setting.key === 'maintenanceMode') {
          value = value === 'true' || value === true;
        }
        
        publicSettings[setting.key] = value;
      }
    });
    
    console.log('✅ Sending public settings:', publicSettings);
    res.json(publicSettings);
  });
});

// Update multiple settings
router.put('/', (req, res) => {
  const { settings } = req.body;
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings data' });
  }
  
  const promises = [];
  
  // Iterate through categories and settings
  Object.keys(settings).forEach(category => {
    Object.keys(settings[category]).forEach(key => {
      let value = settings[category][key];
      
      // Convert complex types to strings for storage
      if (Array.isArray(value)) {
        value = value.join(',');
      } else if (typeof value === 'boolean') {
        value = value.toString();
      } else if (typeof value === 'number') {
        value = value.toString();
      }
      
      promises.push(
        new Promise((resolve, reject) => {
          updateAppSetting(key, value, `${category} setting`, category, (err) => {
            if (err) {
              console.error(`Error updating setting ${key}:`, err);
              reject(err);
            } else {
              resolve();
            }
          });
        })
      );
    });
  });
  
  Promise.all(promises)
    .then(() => {
      res.json({ success: true, message: 'Settings updated successfully' });
    })
    .catch(err => {
      console.error('Error updating settings:', err);
      res.status(500).json({ error: 'Failed to update some settings' });
    });
});

// Update individual setting
router.put('/:key', (req, res) => {
  const { key } = req.params;
  const { value, description, category } = req.body;
  
  let processedValue = value;
  if (Array.isArray(value)) {
    processedValue = value.join(',');
  } else if (typeof value === 'boolean') {
    processedValue = value.toString();
  } else if (typeof value === 'number') {
    processedValue = value.toString();
  }
  
  updateAppSetting(key, processedValue, description, category || 'general', (err) => {
    if (err) {
      console.error('Error updating setting:', err);
      return res.status(500).json({ error: 'Failed to update setting' });
    }
    
    res.json({ success: true, message: 'Setting updated successfully' });
  });
});

// Get system information
router.get('/system-info', (req, res) => {
  const systemInfo = {
    serverStatus: 'Online',
    database: '99.9%',
    security: 'Secure',
    logs: '1.2GB',
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    version: '1.0.0'
  };
  
  res.json(systemInfo);
});

module.exports = router;