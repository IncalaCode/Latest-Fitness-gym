'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update Users table to match the model
    await queryInterface.addColumn('Users', 'emergencyContactName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Emergency Contact'
    });

    await queryInterface.addColumn('Users', 'emergencyContactPhone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '0000000000'
    });

    await queryInterface.addColumn('Users', 'emergencyContactRelationship', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Family'
    });

    await queryInterface.addColumn('Users', 'trainerId', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Rename emergencyContact to emergencyContactPhone for existing data
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET emergencyContactPhone = emergencyContact 
      WHERE emergencyContactPhone = '0000000000' AND emergencyContact IS NOT NULL
    `);

    await queryInterface.removeColumn('Users', 'emergencyContact');

    // Update Payments table to match the model
    await queryInterface.addColumn('Payments', 'productId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'External product/package reference ID'
    });

    await queryInterface.addColumn('Payments', 'totalPasses', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of passes included in this payment'
    });

    // // Update Packages table to match the model
    // await queryInterface.addColumn('Packages', 'numberOfPasses', {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    //   comment: 'Max gym entries (null for unlimited)'
    // });

    // await queryInterface.addColumn('Packages', 'accessLevel', {
    //   type: Sequelize.ENUM('full', 'off-peak', 'class-only', 'special'),
    //   defaultValue: 'full',
    //   allowNull: false
    // });

    // await queryInterface.addColumn('Packages', 'startTime', {
    //   type: Sequelize.TIME,
    //   allowNull: true,
    //   comment: 'Required when accessLevel is special'
    // });

    // await queryInterface.addColumn('Packages', 'endTime', {
    //   type: Sequelize.TIME,
    //   allowNull: true,
    //   comment: 'Required when accessLevel is special'
    // });

    // await queryInterface.addColumn('Packages', 'requiresTrainer', {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    //   allowNull: false
    // });

    // await queryInterface.addColumn('Packages', 'benefits', {
    //   type: Sequelize.JSON,
    //   allowNull: true,
    //   defaultValue: [],
    //   comment: 'Array of benefits like spa, towel service, nutrition consult etc.'
    // });

    // await queryInterface.addColumn('Packages', 'isRenewable', {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: true,
    //   allowNull: false
    // });

    // await queryInterface.addColumn('Packages', 'autoRenewReminder', {
    //   type: Sequelize.ENUM('none', 'sms', 'email', 'both'),
    //   defaultValue: 'none',
    //   allowNull: false
    // });

    // await queryInterface.addColumn('Packages', 'tags', {
    //   type: Sequelize.JSON,
    //   allowNull: true,
    //   comment: 'Array of tags like "Beginner", "Popular" etc.'
    // });

    // // Add packageId to Payments table for association
    // await queryInterface.addColumn('Payments', 'packageId', {
    //   type: Sequelize.UUID,
    //   allowNull: true,
    //   references: {
    //     model: 'Packages',
    //     key: 'id'
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'SET NULL'
    // });

    // Create indexes for better performance with unique names
  //   try {
  //     await queryInterface.addIndex('Users', ['trainerId'], {
  //       name: 'users_trainer_idx_final'
  //     });
  //   } catch (error) {
  //     console.log('Index users_trainer_idx_final already exists, skipping...');
  //   }

  //   try {
  //     await queryInterface.addIndex('Payments', ['packageId'], {
  //       name: 'payments_package_idx_final'
  //     });
  //   } catch (error) {
  //     console.log('Index payments_package_idx_final already exists, skipping...');
  //   }

  //   try {
  //     await queryInterface.addIndex('Payments', ['userId'], {
  //       name: 'payments_user_idx_final'
  //     });
  //   } catch (error) {
  //     console.log('Index payments_user_idx_final already exists, skipping...');
  //   }

  //   try {
  //     await queryInterface.addIndex('CheckIns', ['verifiedBy'], {
  //       name: 'check_ins_verifier_idx_final'
  //     });
  //   } catch (error) {
  //     console.log('Index check_ins_verifier_idx_final already exists, skipping...');
  //   }
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes
    try {
      await queryInterface.removeIndex('Users', 'users_trainer_idx_final');
    } catch (error) {
      console.log('Index users_trainer_idx_final does not exist, skipping...');
    }

    try {
      await queryInterface.removeIndex('Payments', 'payments_package_idx_final');
    } catch (error) {
      console.log('Index payments_package_idx_final does not exist, skipping...');
    }

    try {
      await queryInterface.removeIndex('Payments', 'payments_user_idx_final');
    } catch (error) {
      console.log('Index payments_user_idx_final does not exist, skipping...');
    }

    try {
      await queryInterface.removeIndex('CheckIns', 'check_ins_verifier_idx_final');
    } catch (error) {
      console.log('Index check_ins_verifier_idx_final does not exist, skipping...');
    }

    // Remove columns from Payments
    await queryInterface.removeColumn('Payments', 'packageId');
    await queryInterface.removeColumn('Payments', 'totalPasses');
    await queryInterface.removeColumn('Payments', 'productId');

    // Remove columns from Users
    await queryInterface.removeColumn('Users', 'trainerId');
    await queryInterface.removeColumn('Users', 'emergencyContactRelationship');
    await queryInterface.removeColumn('Users', 'emergencyContactPhone');
    await queryInterface.removeColumn('Users', 'emergencyContactName');

    // Remove columns from Packages
    await queryInterface.removeColumn('Packages', 'tags');
    await queryInterface.removeColumn('Packages', 'autoRenewReminder');
    await queryInterface.removeColumn('Packages', 'isRenewable');
    await queryInterface.removeColumn('Packages', 'benefits');
    await queryInterface.removeColumn('Packages', 'requiresTrainer');
    await queryInterface.removeColumn('Packages', 'endTime');
    await queryInterface.removeColumn('Packages', 'startTime');
    await queryInterface.removeColumn('Packages', 'accessLevel');
    await queryInterface.removeColumn('Packages', 'numberOfPasses');
  }
};
