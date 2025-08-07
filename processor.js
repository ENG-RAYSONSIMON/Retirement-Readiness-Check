import User from './Classes/user.js';

export function processRetirement(input) {
  return new Promise(async (resolve) => {
    // Basic validation
    const requiredFields = [
      'name', 'age', 'occupation', 'phone', 'email',
      'ageToRetire', 'mounthlyExpenditure', 'saving', 'investment', 'asserts',
      'healthInsurance', 'loan',
      'willPlan', 'projects', 'mounthlyInvestmentPlan',
      'mounthlyExpenditureAfterRetire', 'incomeEarnedFree', 'tenYearsPlan'
    ];

    const missingFields = requiredFields.filter(field => input[field] === undefined || input[field] === '');

    if (missingFields.length > 0) {
      return resolve({
        status: 0,
        msg: `Missing required field(s): ${missingFields.join(', ')}`
      });
    }

    // Continue with calculation
    const yearsLeftBeforeRetire = input.ageToRetire - input.age;
    const financialFreedom = input.mounthlyExpenditure * 100;
    const percentFinancialFreedom = ((input.investment + input.asserts - input.loanAmount) / financialFreedom) * 100;

    let score1 = 0;
    score1 += yearsLeftBeforeRetire > 15 ? 5 : yearsLeftBeforeRetire >= 5 ? 3 : 1;
    score1 += input.mounthlyExpenditure < 1000000 ? 5 : input.mounthlyExpenditure <= 3000000 ? 3 : 1;
    const investRatio = ((input.investment + input.asserts) / financialFreedom) * 100;
    score1 += investRatio > 50 ? 5 : investRatio >= 20 ? 3 : 1;

    let score2 = 0;
    if (percentFinancialFreedom >= 80) score2 = 15;
    else if (percentFinancialFreedom >= 50) score2 = 10;
    else if (percentFinancialFreedom >= 20) score2 = 5;
    else score2 = 3;

    let score3 = 0;
    if (input.healthInsurance) score3 += 3;
    if (!input.loan) score3 += 3;
    if (input.projects) score3 += 4;

    let score4 = 0;
    if (input.willPlan) score4 += 5;
    if (input.mounthlyInvestmentPlan) score4 += 5;

    const score = score1 + score2 + score3 + score4;
    const totalPercentage = (score / 50) * 100;

    let feedback = '';
    if (totalPercentage <= 30) feedback = 'Hatari kubwa! Hujajiandaa kifedha.';
    else if (totalPercentage <= 60) feedback = 'Kuna mapengo makubwa, unahitaji marekebisho.';
    else if (totalPercentage <= 90) feedback = 'Unaelekea salama, bado unahitaji kuboresha.';
    else feedback = 'Uko salama kifedha kwa kustaafu.';

    const userData = {
      ...input,
      yearsLeftBeforeRetire,
      financialFreedom,
      percentFinancialFreedom,
      score,
      totalPercentage,
      feedback
    };

    const user = new User(userData);
    try {
      const id = await user.save();
      resolve({
        status: 1,
        msg: 'Success',
        data: {
          id,
          ...userData
        }
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
      resolve({
        status: 0,
        msg: 'Failed to save user data',
        error: err?.message || err
      });
    }

  });
}

export function getAllUsersData() {
  return new Promise(async (resolve) => {
    try {
      const data = await User.getData();

      if (!data || data.length === 0) {
        return resolve({
          status: 0,
          msg: 'No user data found'
        });
      }

      resolve({
        status: 1,
        msg: 'User data retrieved successfully',
        data
      });

    } catch (err) {
      console.error("GET DATA ERROR:", err);
      resolve({
        status: 0,
        msg: 'Failed to retrieve user data',
        error: err?.message || err
      });
    }
  });
}
