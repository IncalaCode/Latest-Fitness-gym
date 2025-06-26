'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'paymentId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'External payment reference ID'
    });

    await queryInterface.addColumn('Payments', 'totalPasses', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of passes included in this payment'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Payments', 'paymentId');
    await queryInterface.removeColumn('Payments', 'totalPasses');
  }
};
