const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET api/tasks
// @desc    Get all tasks for the logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    // Create new task
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy: req.user.id,
      assignedTo
    });

    const task = await newTask.save();

    // Create notification if task is assigned to someone
    if (assignedTo && assignedTo !== req.user.id) {
      const newNotification = new Notification({
        recipient: assignedTo,
        sender: req.user.id,
        task: task._id,
        message: `You have been assigned a new task: ${title}`,
        type: 'task_assigned'
      });

      await newNotification.save();
    }

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the task
    if (task.createdBy._id.toString() !== req.user.id && 
        (!task.assignedTo || task.assignedTo._id.toString() !== req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to access this task' });
    }

    res.json(task);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is authorized to update task
    if (task.createdBy.toString() !== req.user.id && 
        (!task.assignedTo || task.assignedTo.toString() !== req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    // Create notification if assignee is changed
    if (assignedTo && 
        (!task.assignedTo || task.assignedTo.toString() !== assignedTo) && 
        assignedTo !== req.user.id) {
      const newNotification = new Notification({
        recipient: assignedTo,
        sender: req.user.id,
        task: task._id,
        message: `You have been assigned a task: ${title || task.title}`,
        type: 'task_assigned'
      });

      await newNotification.save();
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('createdBy', 'name').populate('assignedTo', 'name');

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is the creator of the task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    
    // Delete all notifications related to this task
    await Notification.deleteMany({ task: req.params.id });

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/filter
// @desc    Filter tasks
// @access  Private
router.get('/filter/search', auth, async (req, res) => {
  try {
    const { status, priority, dueDate, search } = req.query;
    
    // Build filter query
    const filterQuery = {
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    };

    // Add status filter
    if (status) {
      filterQuery.status = status;
    }

    // Add priority filter
    if (priority) {
      filterQuery.priority = priority;
    }

    // Add dueDate filter (tasks due before provided date)
    if (dueDate) {
      filterQuery.dueDate = { $lte: new Date(dueDate) };
    }

    // Add search filter (title or description contains search term)
    if (search) {
      filterQuery.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const tasks = await Task.find(filterQuery)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 