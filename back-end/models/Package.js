module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in days'
    },
    numberOfPasses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Max gym entries (null for unlimited)'
    },
    accessLevel: {
      type: DataTypes.ENUM('full', 'off-peak', 'class-only', 'special'),
      defaultValue: 'full'
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Required when accessLevel is special'
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Required when accessLevel is special'
    },
    requiresTrainer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of benefits like spa, towel service, nutrition consult etc.'
    },
    isRenewable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    autoRenewReminder: {
      type: DataTypes.ENUM('none', 'sms', 'email', 'both'),
      defaultValue: 'none'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of tags like "Beginner", "Popular" etc.'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  Package.associate = function(models) {
    Package.hasMany(models.Payment, {
      foreignKey: 'productId',
      as: 'payments'
    });
  };

  return Package;
};