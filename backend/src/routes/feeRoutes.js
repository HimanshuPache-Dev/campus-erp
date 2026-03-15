const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get pending fees
router.get('/pending', async (req, res) => {
  try {
    console.log('💰 Fetching pending fees');
    
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        users:student_id (first_name, last_name, email, department)
      `)
      .in('status', ['pending', 'overdue']);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    const totalPending = data.reduce((sum, f) => sum + (f.amount || 0), 0);
    
    res.json({
      fees: data || [],
      totalPending,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Get pending fees error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pending fees',
      details: error.message 
    });
  }
});

// Add fee
router.post('/', async (req, res) => {
  try {
    const feeData = req.body;
    
    const { data, error } = await supabase
      .from('fees')
      .insert([{
        ...feeData,
        status: 'pending',
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Add fee error:', error);
    res.status(500).json({ error: 'Failed to add fee' });
  }
});

// Get fees by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    const total = data.reduce((sum, f) => sum + f.amount, 0);
    const paid = data.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pending = data.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

    res.json({
      fees: data,
      summary: { total, paid, pending }
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
});

// Update fee status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;
    
    const { data, error } = await supabase
      .from('fees')
      .update({ 
        status, 
        paid_date: new Date().toISOString().split('T')[0],
        payment_method,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ error: 'Failed to update fee' });
  }
});

// Get fee collection report
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    let query = supabase
      .from('fees')
      .select(`
        *,
        users:student_id (department)
      `)
      .eq('status', 'paid');
    
    if (startDate) {
      query = query.gte('paid_date', startDate);
    }
    if (endDate) {
      query = query.lte('paid_date', endDate);
    }
    if (department) {
      query = query.eq('users.department', department);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const totalCollected = data.reduce((sum, f) => sum + (f.amount || 0), 0);
    
    // Group by date
    const byDate = {};
    data.forEach(fee => {
      const date = fee.paid_date;
      if (!byDate[date]) {
        byDate[date] = {
          date,
          count: 0,
          total: 0
        };
      }
      byDate[date].count++;
      byDate[date].total += fee.amount;
    });

    res.json({
      totalCollected,
      totalTransactions: data.length,
      byDate: Object.values(byDate),
      details: data
    });
  } catch (error) {
    console.error('Get fee report error:', error);
    res.status(500).json({ error: 'Failed to generate fee report' });
  }
});

module.exports = router;