module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External product/package reference ID'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    planTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'ETB',
      allowNull: false
    },
    txRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    totalPasses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of passes included in this payment'
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentstatus: {
      type: DataTypes.ENUM('pending', "approvalPending",'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentimage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qrCodeData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qrCodeUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isTemporary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFrozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    freezeStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    freezeEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    originalExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Original expiry date before freezing'
    }
  }, {
    timestamps: true
  });

  Payment.associate = function(models) {
    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Payment;
};
