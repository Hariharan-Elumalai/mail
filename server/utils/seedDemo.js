const User = require('../models/User');

const seedDemoUser = async () => {
  try {
    const existing = await User.findOne({ email: 'demo@bulkmailer.test' });
    if (existing) {
      console.log('Demo user already exists');
      return existing;
    }

    const demo = await User.create({
      name: 'Demo User',
      email: 'demo@bulkmailer.test',
      password: 'demopassword',
      role: 'admin',
    });

    console.log('✅ Demo user created: demo@bulkmailer.test / demopassword');
    return demo;
  } catch (err) {
    console.error('Error creating demo user:', err.message || err);
    throw err;
  }
};

module.exports = { seedDemoUser };
