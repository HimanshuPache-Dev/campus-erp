const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log('🔑 Auth Middleware - Token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Simple token decode (in production, use JWT verify)
    const userId = token.split(':')[0];
    
    // Attach userId to request for use in controllers
    req.userId = userId;
    req.token = token;
    
    console.log('✅ Auth Middleware - User ID:', userId);
    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // You would get user role from database here
    // For now, we'll skip role validation
    console.log('🔒 Authorize - Required roles:', roles);
    next();
  };
};

module.exports = { authenticate, authorize };