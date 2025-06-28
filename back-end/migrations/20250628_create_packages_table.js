'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      numberOfPasses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      accessLevel: {
        type: Sequelize.ENUM('full', 'off-peak', 'class-only', 'special'),
        defaultValue: 'full'
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      requiresTrainer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      benefits: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      isRenewable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      autoRenewReminder: {
        type: Sequelize.ENUM('none', 'sms', 'email', 'both'),
        defaultValue: 'none'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Packages', ['name'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Packages');
  }
};