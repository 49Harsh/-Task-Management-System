const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all notifications for the logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id
// @desc    Mark a notification as read
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient of the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this notification' });
    }

    // Update notification
    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/read/all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read/all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient of the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();
    
    res.json({ message: 'Notification removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notifications
// @desc    Delete all read notifications
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id, read: true });
    
    res.json({ message: 'All read notifications removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 