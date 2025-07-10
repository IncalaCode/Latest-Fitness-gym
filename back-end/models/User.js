module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergencyContactName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergencyContactPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergencyContactRelationship: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fitnessGoals: {
      type: DataTypes.JSON,
      allowNull: true
    },
    medicalConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    forgetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    forgetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trainerDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Member"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    agreeToTerms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    trainerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Trainers',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  User.associate = function(models) {
    // User belongs to a trainer (optional)
    User.belongsTo(models.Trainer, {
      foreignKey: 'trainerId',
      as: 'trainer'
    });
    // User has many payments
    User.hasMany(models.Payment, {
      foreignKey: 'userId',
      as: 'payments'
    });
  };

  return User;
};
