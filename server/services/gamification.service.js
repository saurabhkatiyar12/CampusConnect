const User = require('../models/User');

const BADGES = [
  { name: 'First Attendance', icon: '🎯', condition: (points) => points >= 10 },
  { name: 'Regular', icon: '⭐', condition: (points) => points >= 50 },
  { name: 'Scholar', icon: '📚', condition: (points) => points >= 100 },
  { name: 'Champion', icon: '🏆', condition: (points) => points >= 200 },
  { name: 'Legend', icon: '👑', condition: (points) => points >= 500 },
];

const awardPoints = async (userId, points, reason = '') => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const oldPoints = user.gamification.points;
    user.gamification.points += points;
    user.gamification.lastActive = new Date();

    // Check for new badges
    const newBadges = [];
    for (const badge of BADGES) {
      const alreadyHas = user.gamification.badges.some(b => b.name === badge.name);
      if (!alreadyHas && badge.condition(user.gamification.points) && !badge.condition(oldPoints)) {
        user.gamification.badges.push({ name: badge.name, icon: badge.icon, earnedAt: new Date() });
        newBadges.push(badge);
      }
    }

    await user.save();
    return { points: user.gamification.points, newBadges };
  } catch (error) {
    console.error('Gamification error:', error.message);
  }
};

module.exports = { awardPoints, BADGES };
