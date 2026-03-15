const db = require('../services/db.service');
const { supabase } = require('../config/supabase');

// Add a new fee record
const addFee = async (req, res) => {
  try {
    const feeData = req.body;
    
    if (!feeData.student_id || !feeData.fee_type || !feeData.amount || !feeData.due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fee = await db.addFee({
      ...feeData,
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json(fee);
  } catch (error) {
    console.error('Add fee error:', error);
    res.status(500).json({ error: 'Failed to add fee' });
  }
};

// Get fees by student ID
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const fees = await db.getFeesByStudent(studentId);
    
    const total = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pending = fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

    res.json({
      fees,
      summary: { total, paid, pending }
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
};

// Get all pending fees
const getPendingFees = async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = supabase
      .from('fees')
      .select(`
        *,
        users:student_id (first_name, last_name, email, department)
      `)
      .in('status', ['pending', 'overdue']);
    
    if (department) {
      query = query.eq('users.department', department);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const totalPending = data.reduce((sum, f) => sum + f.amount, 0);
    
    res.json({
      fees: data,
      totalPending,
      count: data.length
    });
  } catch (error) {
    console.error('Get pending fees error:', error);
    res.status(500).json({ error: 'Failed to fetch pending fees' });
  }
};

// Update fee status
const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;
    
    const fee = await db.updateFeeStatus(
      id, 
      status, 
      new Date().toISOString().split('T')[0],
      payment_method
    );

    // Create notification for student
    await supabase.from('notifications').insert([{
      user_id: fee.student_id,
      title: 'Fee Payment Received',
      message: `Your payment of ₹${fee.amount} has been received`,
      type: 'success',
      is_global: false
    }]);

    res.json(fee);
  } catch (error) {
    console.error('Update fee status error:', error);
    res.status(500).json({ error: 'Failed to update fee status' });
  }
};

// Get fee collection report
const getFeeCollectionReport = async (req, res) => {
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
    
    const totalCollected = data.reduce((sum, f) => sum + f.amount, 0);
    
    // Group by date
    const byDate = data.reduce((acc, fee) => {
      const date = fee.paid_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          total: 0
        };
      }
      acc[date].count++;
      acc[date].total += fee.amount;
      return acc;
    }, {});

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
};

// Make sure ALL functions are exported
module.exports = {
  addFee,
  getStudentFees,
  getPendingFees,
  updateFeeStatus,
  getFeeCollectionReport
};