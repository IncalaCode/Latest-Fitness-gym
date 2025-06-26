'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Payments', 'paymentId', 'productId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Payments', 'productId', 'paymentId');
  }
};
