const { Trainer, User } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Get all trainers with their assigned members count
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'assignedMembers',
        attributes: [],
        where: { isActive: true },
        required: false // This makes it a LEFT JOIN, so trainers with no members are included
      }],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('assignedMembers.id')), 'memberCount']
        ]
      },
      group: ['Trainer.id'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: trainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get trainer by ID with assigned members
exports.getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id, {
      include: [{
        model: User,
        as: 'assignedMembers',
        attributes: ['id', 'fullName', 'email', 'phone', 'role', 'isActive'],
        where: { isActive: true }
      }]
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new trainer
exports.createTrainer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if trainer with email already exists
    const existingTrainer = await Trainer.findOne({ where: { email } });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this email already exists'
      });
    }

    const trainer = await Trainer.create({
      name,
      email,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update trainer
exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email !== trainer.email) {
      const existingTrainer = await Trainer.findOne({ where: { email } });
      if (existingTrainer) {
        return res.status(400).json({
          success: false,
          message: 'Trainer with this email already exists'
        });
      }
    }

    await trainer.update({
      name,
      email,
      phone
    });

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete trainer (soft delete)
exports.deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Check if trainer has assigned members
    const assignedMembers = await User.count({
      where: { trainerId: id, isActive: true }
    });

    if (assignedMembers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete trainer. ${assignedMembers} member(s) are currently assigned to this trainer. Please reassign members first.`
      });
    }

    await trainer.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Assign member to trainer
exports.assignMemberToTrainer = async (req, res) => {
  try {
    const { memberId, trainerId } = req.body;

    const member = await User.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const trainer = await Trainer.findByPk(trainerId);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    await member.update({ trainerId });

    res.status(200).json({
      success: true,
      message: 'Member assigned to trainer successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Remove member from trainer
exports.removeMemberFromTrainer = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await User.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await member.update({ trainerId: null });

    res.status(200).json({
      success: true,
      message: 'Member removed from trainer successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Search trainers
exports.searchTrainers = async (req, res) => {
  try {
    const { query } = req.query;

    const trainers = await Trainer.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: trainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all clients assigned to a trainer, grouped by membership type
exports.getTrainerClients = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Trainer ID is required' });
    }
    // Find all users assigned to this trainer
    const users = await User.findAll({
      where: { trainerId: id, isActive: true },
      attributes: ['id', 'fullName', 'email', 'phone']
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}; 