const User = require('./User');
const Lead = require('./Lead');
const Activity = require('./Activity');
const Notification = require('./Notification');

// Define associations
User.hasMany(Lead, { foreignKey: 'assignedToId', as: 'assignedLeads' });
User.hasMany(Lead, { foreignKey: 'createdById', as: 'createdLeads' });
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

Lead.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
Lead.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
Lead.hasMany(Activity, { foreignKey: 'leadId', as: 'activities', onDelete: 'CASCADE' });
Lead.hasMany(Notification, { foreignKey: 'leadId', as: 'notifications' });

Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

module.exports = {
  User,
  Lead,
  Activity,
  Notification
};

