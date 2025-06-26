'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Trainers table
    await queryInterface.createTable('Trainers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Check if trainerId column exists before adding it
    const tableDescription = await queryInterface.describeTable('Users');
    if (!tableDescription.trainerId) {
      await queryInterface.addColumn('Users', 'trainerId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Trainers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove trainerId field from Users table
    await queryInterface.removeColumn('Users', 'trainerId');
    
    // Drop Trainers table
    await queryInterface.dropTable('Trainers');
  }
}; 