const db = require('../config/InitDatabase');
const { Payment, Package } = require('../models');
const { Op } = require('sequelize');
const cosineSimilarity = require('string-cosine-similarity');

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
    // Find best matching package by cosine similarity
    let bestScore = 0;
    let bestPkg = null;
    for (const pkg of packages) {
      const score = cosineSimilarity(payment.planTitle.toLowerCase(), pkg.name.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestPkg = pkg;
      }
    }
    if (bestPkg && bestScore > 0.5) { // Only update if reasonably similar
      const daysLeft = daysBetween(now, payment.expiryDate);
      payment.productId = bestPkg.id;
      payment.totalPasses = daysLeft;
      await payment.save();
      console.log(`Updated payment ${payment.id}: productId=${bestPkg.id}, totalPasses=${daysLeft}`);
      updated++;
    } else {
      console.log(`No good package match for payment ${payment.id} (${payment.planTitle})`);
    }
  }
  console.log(`Done. Updated ${updated} payments.`);
  process.exit(0);
})(); 