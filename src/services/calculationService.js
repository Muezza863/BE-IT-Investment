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
 * Menghitung nilai skor Information Economics (IE) berdasarkan input domain dan data kuadran.
 */
const calculateInformationEconomics = (roiPercentage, surveyScores, quadrantFactors) => {
  if (!surveyScores || !quadrantFactors) return { ieScore: 0, feasibilityStatus: "Data Tidak Lengkap" };

  // 1. Convert ROI Percentage to ROI Score (0 to 5)
  // ROI percentage from parameter is e.g. 15.5 for 15.5%
  let roiScore = 0;
  if (roiPercentage < 1) roiScore = 0;
  else if (roiPercentage <= 299) roiScore = 1;
  else if (roiPercentage <= 499) roiScore = 2;
  else if (roiPercentage <= 699) roiScore = 3;
  else if (roiPercentage <= 899) roiScore = 4;
  else roiScore = 5;

  const bDomainScores = surveyScores.businessDomain || {};
  const tDomainScores = surveyScores.technologyDomain || {};

  const bDomainFactors = quadrantFactors.businessDomain || {};
  const tDomainFactors = quadrantFactors.technologyDomain || {};
  const roiFactor = quadrantFactors.ROI || 0;

  // Calculate Weighted Valued
  const roiWeighted = roiScore * roiFactor;
  
  const smWeighted = (bDomainScores.SM || 0) * (bDomainFactors.SM || 0);
  const caWeighted = (bDomainScores.CA || 0) * (bDomainFactors.CA || 0);
  const miWeighted = (bDomainScores.MI || 0) * (bDomainFactors.MI || 0);
  const crWeighted = (bDomainScores.CR || 0) * (bDomainFactors.CR || 0);
  const orWeighted = (bDomainScores.OR || 0) * (bDomainFactors.OR || 0);

  const saWeighted = (tDomainScores.SA || 0) * (tDomainFactors.SA || 0);
  const duWeighted = (tDomainScores.DU || 0) * (tDomainFactors.DU || 0);
  const tuWeighted = (tDomainScores.TU || 0) * (tDomainFactors.TU || 0);
  const irWeighted = (tDomainScores.IR || 0) * (tDomainFactors.IR || 0);

  const ieScore = roiWeighted + 
                  smWeighted + caWeighted + miWeighted + crWeighted + orWeighted + 
                  saWeighted + duWeighted + tuWeighted + irWeighted;

  const finalScore = Number(ieScore.toFixed(2));

  let feasibilityStatus = "";
  if (finalScore <= -20) feasibilityStatus = "Sangat Tidak Layak";
  else if (finalScore <= 10) feasibilityStatus = "Tidak Layak";
  else if (finalScore <= 40) feasibilityStatus = "Cukup";
  else if (finalScore <= 70) feasibilityStatus = "Layak";
  else feasibilityStatus = "Sangat Layak";

  return { ieScore: finalScore, feasibilityStatus };
};

/**
 * Main function untuk merangkum semua perhitungan
 * @param {Object} financialData 
 * @param {Object} surveyScores - Scores from survey (businessDomain, technologyDomain)
 * @param {Object} quadrantFactors - Factors weights from McFarlan quadrant 
 */
const calculateProjectValue = (financialData, surveyScores, quadrantFactors) => {
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

  let ieResult = { ieScore: null, feasibilityStatus: null };
  if (surveyScores && quadrantFactors) {
    ieResult = calculateInformationEconomics(roi, surveyScores, quadrantFactors);
  }

  return {
    success: true,
    metrics: {
      roi: roi, // Dalam Persen
      npv: npv, // Dalam Nominal Uang
      paybackPeriod: paybackPeriod, // Dalam Tahun (bisa bernilai null jika tidak balik modal)
      breakEvenYear: bea.breakEvenYear, // Tahun keberapa BEP tercapai
      ieScore: ieResult.ieScore,
      feasibilityStatus: ieResult.feasibilityStatus
    },
    breakEvenAnalysisDetail: bea.data // Detail laporan kumulatif per tahun
  };
};

export {
  calculateProjectValue,
  calculateInformationEconomics,
  calculateROI,
  calculateNPV,
  calculatePaybackPeriod,
  calculateBreakEvenPoint
};

