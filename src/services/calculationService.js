/**
 * Service to calculate project values, scores, or estimations.
 * This abstracts complex calculation logic away from the controllers.
 */

/**
 * Menghitung Return on Investment (ROI)
 * Rumus: ((Total Benefit - Total Cost) / Total Cost) * 100
 */
const calculateROI = (initialCost, yearlyBenefits, yearlyCosts) => {
  const totalBenefit = yearlyBenefits.reduce((acc, val) => acc + val, 0);
  const totalYearlyCost = yearlyCosts.reduce((acc, val) => acc + val, 0);
  const totalCost = initialCost + totalYearlyCost;
  
  if (totalCost === 0) return 0;
  
  const roi = ((totalBenefit - totalCost) / totalCost) * 100;
  return Number(roi.toFixed(2));
};

/**
 * Menghitung Net Present Value (NPV)
 * Rumus: (Net Cash Flow / (1 + r)^t) - Initial Investment
 */
const calculateNPV = (initialCost, yearlyBenefits, yearlyCosts, discountRate) => {
  let npv = -initialCost;
  
  for (let i = 0; i < yearlyBenefits.length; i++) {
    const netCashFlow = yearlyBenefits[i] - (yearlyCosts[i] || 0);
    const presentValue = netCashFlow / Math.pow((1 + discountRate), i + 1);
    npv += presentValue;
  }
  
  return Number(npv.toFixed(2));
};

/**
 * Menghitung Payback Period (dalam tahun)
 */
const calculatePaybackPeriod = (initialCost, yearlyBenefits, yearlyCosts) => {
  let cumulativeCashFlow = -initialCost;
  
  for (let i = 0; i < yearlyBenefits.length; i++) {
    const netCashFlow = yearlyBenefits[i] - (yearlyCosts[i] || 0);
    const previousCumulative = cumulativeCashFlow;
    
    cumulativeCashFlow += netCashFlow;
    
    if (cumulativeCashFlow >= 0) {
      // Menghitung pecahan tahun agar lebih akurat
      const fraction = Math.abs(previousCumulative) / netCashFlow;
      return Number((i + fraction).toFixed(2));
    }
  }
  
  return null; // Jika tidak balik modal dalam periode yang diberikan
};

/**
 * Melakukan Break-Even Analysis (BEA)
 * Melacak cumulative cost dan benefit setiap tahun.
 */
const calculateBreakEvenPoint = (initialCost, yearlyBenefits, yearlyCosts) => {
  let data = [];
  let cumulativeCost = initialCost;
  let cumulativeBenefit = 0;
  let isBreakEven = false;
  let breakEvenYear = null;

  for (let i = 0; i < yearlyBenefits.length; i++) {
    const currentCost = (yearlyCosts[i] || 0);
    const currentBenefit = yearlyBenefits[i];

    cumulativeCost += currentCost;
    cumulativeBenefit += currentBenefit;
    
    if (!isBreakEven && cumulativeBenefit >= cumulativeCost) {
      isBreakEven = true;
      breakEvenYear = i + 1; // Tahun di mana BEP tercapai (1-indexed)
    }
    
    data.push({
      year: i + 1,
      cost: currentCost,
      benefit: currentBenefit,
      cumulativeCost: cumulativeCost,
      cumulativeBenefit: cumulativeBenefit,
      net: cumulativeBenefit - cumulativeCost
    });
  }

  return { isBreakEven, breakEvenYear, data };
};

/**
 * Main function untuk merangkum semua perhitungan
 * @param {Object} financialData 
 * @param {number} financialData.initialCost - Biaya investasi awal (CAPEX)
 * @param {number[]} financialData.yearlyBenefits - Array benefit tiap tahun (misal selama 5 tahun)
 * @param {number[]} financialData.yearlyCosts - Array biaya operasional (OPEX) tiap tahun
 * @param {number} financialData.discountRate - Suku bunga / Discount rate untuk NPV (default: 0.1 atau 10%)
 */
const calculateProjectValue = (financialData) => {
  // Fallback jika tidak ada data yang masuk
  if (!financialData) {
    return { success: false, message: 'No financial data provided' };
  }

  const { 
    initialCost = 0, 
    yearlyBenefits = [], 
    yearlyCosts = [], 
    discountRate = 0.1 // Default 10%
  } = financialData;

  const roi = calculateROI(initialCost, yearlyBenefits, yearlyCosts);
  const npv = calculateNPV(initialCost, yearlyBenefits, yearlyCosts, discountRate);
  const paybackPeriod = calculatePaybackPeriod(initialCost, yearlyBenefits, yearlyCosts);
  const bea = calculateBreakEvenPoint(initialCost, yearlyBenefits, yearlyCosts);

  return {
    success: true,
    metrics: {
      roi: roi, // Dalam Persen
      npv: npv, // Dalam Nominal Uang
      paybackPeriod: paybackPeriod, // Dalam Tahun (bisa bernilai null jika tidak balik modal)
      breakEvenYear: bea.breakEvenYear // Tahun keberapa BEP tercapai
    },
    breakEvenAnalysisDetail: bea.data // Detail laporan kumulatif per tahun
  };
};

export {
  calculateProjectValue,
  calculateROI,
  calculateNPV,
  calculatePaybackPeriod,
  calculateBreakEvenPoint
};

