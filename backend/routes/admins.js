const express = require('express');
const fs = require('fs');
const path = require('path');
const { authorize } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const router = express.Router();

const adminsPath = path.join(__dirname, '../data/admins.json');
const readAdmins = () => JSON.parse(fs.readFileSync(adminsPath, 'utf8'));

router.get('/profile', requireHybridAuth, authorize('admin'), (req, res) => {
  try {
    const { password, ...adminData } = req.user;
    res.json(adminData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;