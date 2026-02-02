// MongoDB Initialization Script
db = db.getSiblingDB('zawj');

// Create application user
db.createUser({
  user: 'zawj',
  pwd: 'SecurePassword123!',
  roles: [
    {
      role: 'readWrite',
      db: 'zawj'
    }
  ]
});

print('✅ MongoDB user created successfully');
