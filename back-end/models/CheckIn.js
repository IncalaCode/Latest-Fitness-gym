module.exports = (sequelize, DataTypes) => {
  const CheckIn = sequelize.define('CheckIn', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Main Gym'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'Staff member who verified the check-in'
    },
    verificationMethod: {
      type: DataTypes.ENUM('qr_code', 'manual', 'card'),
      defaultValue: 'qr_code',
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        name: 'check_in_user_idx',
        fields: ['userId']
      },
      {
        name: 'check_in_time_idx',
        fields: ['checkInTime']
      }
    ]
  });

  CheckIn.associate = function(models) {
    CheckIn.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    CheckIn.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
  };

  return CheckIn;
};