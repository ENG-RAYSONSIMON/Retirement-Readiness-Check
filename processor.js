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
const name = input.name;
const targetAmount = 200_000_000;
const dailyInvestment = 1000;
const monthlyInvestment = dailyInvestment * 30;
const retirementAge = input.ageToRetire;
const passiveIncomeGoal = 2_000_000;

function investmentPlan(years) {
  const totalDays = years * 365;
  const totalInvestment = dailyInvestment * totalDays;

  return `
Nguvu ya Buku Program:
- Mwaka kuanza uwekezaji: ${input.age} (${years} years to invest)
- Siku za uwekezaji: ${totalDays}
- Jumla ya uwekezaji kwa siku (TZS ${dailyInvestment.toLocaleString()})
-Kwa kufuata mpango huu, ${name} utakuwa na kipato kisichopungua TZS ${totalInvestment.toLocaleString()} baada ya kustaafu,Hii ni nje ya Faida utakayopata kulingana na Gawio la Mfuko husika`;
}

if (totalPercentage <= 30) {
  feedback = `
TAFSIRI YA UTAAYARI: ${name}, kiwango chako cha utayari wa kustaafu kipo chini. 
Una baadhi ya misingi ya kifedha lakini unahitaji mpango imara zaidi.

MAPENDEKEZO:
1. Anza mara moja mpango wa urithi (wosia) ili kulinda mali zako.
2. Kuongeza uwekezaji wa kila mwezi: ${investmentPlan(yearsLeftBeforeRetire)}
3. Badilisha mali zisizolipa ili kuleta kipato.
4. Ondoa madeni yote kabla ya kustaafu.
5. Jiunge na mpango wa ushauri wa kifedha.
`;
}
else if (totalPercentage <= 60) {
  feedback = `
TAFSIRI YA UTAAYARI: ${name}, uko kwenye hatua ya kati ya maandalizi ya kustaafu. 
Una misingi mizuri lakini bado kuna nafasi kubwa ya kuboresha.

MAPENDEKEZO:
1. Kuandaa mpango wa urithi haraka iwezekanavyo.
2. Kuimarisha uwekezaji: ${investmentPlan(yearsLeftBeforeRetire)}
3. Hakikisha mali zisizolipa zinakuwa na faida.
4. Punguza deni na ongeza akiba.
5. Endelea kushirikiana na mshauri wa kifedha.
`;
}
else if (totalPercentage <= 90) {
  feedback = `
TAFSIRI YA UTAAYARI: ${name}, uko karibu sana na uhuru wa kifedha. 
Mikakati yako iko vizuri lakini bado kuna hatua chache za mwisho.

MAPENDEKEZO:
1. Kamalisha mpango wa urithi.
2. Endelea na uwekezaji: ${investmentPlan(yearsLeftBeforeRetire)}
3. Hakikisha miradi yote inaleta faida endelevu.
4. Lipa deni lililobaki.
`;
}
else {
  feedback = `
TAFSIRI YA UTAAYARI: Hongera ${name}! Uko tayari kustaafu kifedha.
Endelea kulinda mali na miradi yako ili kudumisha uhuru wa kifedha.

MAPENDEKEZO:
1. Weka mipango ya urithi na uendeleze urithi wa kifedha kwa familia yako.
2. Endelea kufuatilia uwekezaji: ${investmentPlan(yearsLeftBeforeRetire)}
3. Kudumisha maisha bila madeni.
`;
}

    const userData = {
      ...input,
      personalDetails: {
        name: input.name,
        age: input.age,
        occupation: input.occupation,
        phone: input.phone,
        email: input.email,
        mounthlyExpenditure:input.mounthlyExpenditure,
        saving:input.saving,
        investment:input.investment,
        asserts:input.asserts,
        healthInsurance:input.healthInsurance,
        loan:input.loan,
        projects:input.projects,
        willPlan:input.willPlan,
        mounthlyInvestmentPlan:input.mounthlyInvestmentPlan,
        loanAmount:input.loanAmount
        
      },
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
