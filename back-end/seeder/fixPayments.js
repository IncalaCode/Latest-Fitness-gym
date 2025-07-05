const db = require('../config/InitDatabase');
const { Payment, Package } = require('../models');
const { Op } = require('sequelize');

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
}

(async () => {
  await db.initialize();
  const now = new Date();
  const payments = await Payment.findAll({
    where: {
      paymentstatus: 'completed',
      expiryDate: { [Op.gt]: now },
      [Op.or]: [
        { productId: { [Op.is]: null } },
        { productId: '' },
        { totalPasses: { [Op.is]: null } }
      ]
    }
  });
  const packages = await Package.findAll();
  let updated = 0;
  for (const payment of payments) {
    // Find matching package by normalized name equality
    let matchedPkg = null;
    const normalizedTitle = payment.planTitle.trim().toLowerCase();
    for (const pkg of packages) {
      const normalizedPkgName = pkg.name.trim().toLowerCase();
      if (normalizedTitle === normalizedPkgName) {
        matchedPkg = pkg;
        break;
      }
    }
    if (matchedPkg) {
      const daysLeft = daysBetween(now, payment.expiryDate);
      payment.productId = matchedPkg.id;
      payment.totalPasses = daysLeft;
      await payment.save();
      console.log(`Updated payment ${payment.id}: productId=${matchedPkg.id}, totalPasses=${daysLeft}`);
      updated++;
    } else {
      console.log(`No exact package match for payment ${payment.id} (${payment.planTitle})`);
    }
  }
  console.log(`Done. Updated ${updated} payments.`);
  process.exit(0);
})(); 