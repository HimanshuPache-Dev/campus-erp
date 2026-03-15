const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const { unread } = req.query;

    let query = supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${req.userId},is_global.eq.true`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unread === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create notification (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, message, type, user_id, is_global, target_role } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message required' });
    }

    // If target_role, send to all users with that role
    if (target_role) {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('role', target_role)
        .eq('is_active', true);

      if (users && users.length > 0) {
        const notifications = users.map(u => ({
          user_id: u.id,
          title,
          message,
          type: type || 'info',
          is_global: false,
          is_read: false
        }));
        const { data, error } = await supabase.from('notifications').insert(notifications).select();
        if (error) throw error;
        return res.status(201).json({ message: `Sent to ${users.length} users`, data });
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: user_id || null,
        title,
        message,
        type: type || 'info',
        is_global: is_global || false,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read for current user
router.put('/read-all', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
