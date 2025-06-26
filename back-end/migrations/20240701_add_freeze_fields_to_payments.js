'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns exist before adding them
    const tableDescription = await queryInterface.describeTable('Payments');
    
    if (!tableDescription.isFrozen) {
      await queryInterface.addColumn('Payments', 'isFrozen', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!tableDescription.freezeStartDate) {
      await queryInterface.addColumn('Payments', 'freezeStartDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!tableDescription.freezeEndDate) {
      await queryInterface.addColumn('Payments', 'freezeEndDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!tableDescription.originalExpiryDate) {
      await queryInterface.addColumn('Payments', 'originalExpiryDate', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Original expiry date before freezing'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Payments', 'isFrozen');
    await queryInterface.removeColumn('Payments', 'freezeStartDate');
    await queryInterface.removeColumn('Payments', 'freezeEndDate');
    await queryInterface.removeColumn('Payments', 'originalExpiryDate');
  }
};
