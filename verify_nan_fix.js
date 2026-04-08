import { calculateProjectValue } from './src/services/calculationService.js';

const financialData = {
    initialCost: 0,
    yearlyBenefits: [0, 100, 200],
    yearlyCosts: [0, 50, 50],
    discountRate: 0.1
};

const surveyScores = {
    businessDomain: { SM: 3, CA: 3, MI: 3, CR: 3, OR: 3 },
    technologyDomain: { SA: 3, DU: 3, TU: 3, IR: 3 }
};

const quadrantInfo = {
    ROI: 1,
    businessDomain: { SM: 1, CA: 1, MI: 1, CR: 1, OR: 1 },
    technologyDomain: { SA: 1, DU: 1, TU: 1, IR: 1 }
};

const result = calculateProjectValue(financialData, surveyScores, quadrantInfo);

console.log('Test Result with 0 Initial Cost:');
console.log('Payback Period:', result.metrics.paybackPeriod);
console.log('ROI:', result.metrics.roi);
console.log('NPV:', result.metrics.npv);

if (result.metrics.paybackPeriod === 0) {
    console.log('✅ Payback Period is 0 as expected.');
} else {
    console.log('❌ Payback Period is NOT 0. Result:', result.metrics.paybackPeriod);
    process.exit(1);
}

// Test case 2: netCashFlow is 0 and initialCost is 0
const financialData2 = {
    initialCost: 0,
    yearlyBenefits: [0, 0, 0],
    yearlyCosts: [0, 0, 0],
    discountRate: 0.1
};

const result2 = calculateProjectValue(financialData2, surveyScores, quadrantInfo);
console.log('\nTest Result with 0 Initial Cost and 0 Net Cash Flow:');
console.log('Payback Period:', result2.metrics.paybackPeriod);

if (result2.metrics.paybackPeriod === 0) {
    console.log('✅ Payback Period is 0 as expected even with 0 net cash flow.');
} else {
    console.log('❌ Payback Period is NOT 0. Result:', result2.metrics.paybackPeriod);
    process.exit(1);
}

console.log('\nAll tests passed successfully!');
