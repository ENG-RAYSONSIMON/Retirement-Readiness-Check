import database from '../database.js';
import { getCurrentTimestamp } from '../Utils.js';

export default class RetirementCheckup {
  id = null;

  constructor({ id }) {
    this.id = id;
  }

  /**
   * 🔹 Update a single column in the retirement_checkups table
   */
  updateColumn = ({ column, value }) => {
    return new Promise(async (resolve, reject) => {
      const query = `UPDATE retirement_checkups SET ${column} = ? WHERE id = ?`;
      const [result] = await database.execute(query, [value, this.id]).catch(reject);
      resolve(result);
    });
  };

  /**
   * 🔹 Get retirement checkup entry by ID
   */
  static getData = ({ id }) => {
    return new Promise(async (resolve, reject) => {
      const [rows] = await database
        .execute('SELECT * FROM retirement_checkups WHERE id = ?', [id])
        .catch(() => reject('Server error #2001'));

      if (rows.length > 0) {
        resolve(rows[0]);
      } else {
        resolve(null);
      }
    });
  };

  getData = () => {
    return RetirementCheckup.getData({ id: this.id });
  };

  /**
   * 🔹 Get all retirement checkup entries
   */
  static getAll = () => {
    return new Promise(async (resolve, reject) => {
      const [rows] = await database
        .execute('SELECT * FROM retirement_checkups ORDER BY dateCreated DESC')
        .catch(() => reject('Server error #2002'));
      resolve(rows);
    });
  };

  /**
   * 🔹 Get checkup by email (latest entry)
   */
  static getByEmail = ({ email }) => {
    return new Promise(async (resolve, reject) => {
      const [rows] = await database
        .execute(
          "SELECT * FROM retirement_checkups WHERE email = ? ORDER BY dateCreated DESC LIMIT 1",
          [email]
        )
        .catch(() => reject("Server error #2003"));

      if (rows.length > 0) {
        resolve(rows[0]);
      } else {
        resolve(null);
      }
    });
  };

  /**
   * 🔹 Create a new retirement checkup record
   */
  static create = (params) => {
    let {
      fullName,
      age,
      occupation,
      phone,
      email,
      retirementAge,
      yearsToRetire,
      monthlyExpenses,
      totalSavings,
      investments,
      nonIncomeAssets,
      healthInsurance,
      debts,
      totalDebtAmount,
      financialFreedomNumber,
      financialFreedomPercent,
      willPlan,
      sideProjects,
      passiveIncomeGoal,
      monthlyInvestmentPlan,
      retirementMonthlyExpenses,
      tenYearGoal
    } = params;

    return new Promise(async (resolve, reject) => {
      const dateCreated = getCurrentTimestamp();

      await database
        .execute(
          `INSERT INTO retirementcheckup
            (fullName, age, occupation, phone, email, retirementAge, yearsToRetire, 
             monthlyExpenses, totalSavings, investments, nonIncomeAssets, healthInsurance, debts, 
             totalDebtAmount, financialFreedomNumber, financialFreedomPercent, willPlan, sideProjects, 
             passiveIncomeGoal, monthlyInvestmentPlan, retirementMonthlyExpenses, tenYearGoal, dateCreated)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fullName,
            age,
            occupation,
            phone,
            email,
            retirementAge,
            yearsToRetire,
            monthlyExpenses,
            totalSavings,
            investments,
            nonIncomeAssets,
            healthInsurance,
            debts,
            totalDebtAmount,
            financialFreedomNumber,
            financialFreedomPercent,
            willPlan,
            sideProjects,
            passiveIncomeGoal,
            monthlyInvestmentPlan,
            retirementMonthlyExpenses,
            tenYearGoal,
            dateCreated
          ]
        )
        .then(([result]) => {
          resolve(result.insertId);
        })
        .catch((error) => {
          reject("Unable to process request: " + error.message);
        });
    });
  };

  /**
   * 🔢 Calculate readiness score & percentage for all sections
   */
  static calculateReadinessScore = (data) => {
    // ✅ Maximum score allocation for each section
    let maxScore = {
      section1: 15, // Hali ya kifedha ya sasa
      section2: 15, // Uhuru wa kifedha
      section3: 10, // Maandalizi muhimu
      section4: 10  // Urithi & Uwekezaji
    };

    // 🟢 SECTION 1: Hali ya kifedha ya sasa
    let section1 = 0;
    if (data.yearsToRetire >= 10) section1 += 5;
    else if (data.yearsToRetire >= 5) section1 += 3;
    else section1 += 1;

    if (data.monthlyExpenses <= 1000000) section1 += 5;
    else if (data.monthlyExpenses <= 2000000) section1 += 3;
    else section1 += 1;

    if (data.totalSavings + data.investments >= (data.financialFreedomNumber * 0.4)) section1 += 5;
    else if (data.totalSavings + data.investments >= (data.financialFreedomNumber * 0.2)) section1 += 3;
    else section1 += 1;

    // 🟢 SECTION 2: Uhuru wa kifedha
    let netWealth = (data.totalSavings + data.investments + data.nonIncomeAssets) - (data.totalDebtAmount || 0);
    let ffPercent = Math.round((netWealth / data.financialFreedomNumber) * 100);

    let section2 = 0;
    if (ffPercent >= 80) section2 += 15;
    else if (ffPercent >= 50) section2 += 10;
    else if (ffPercent >= 30) section2 += 7;
    else if (ffPercent >= 10) section2 += 5;
    else section2 += 2;

    // 🟢 SECTION 3: Maandalizi muhimu
    let section3 = 0;
    if (data.healthInsurance === 'yes') section3 += 3;
    if (data.debts === 'no') section3 += 4;
    if (data.sideProjects === 'yes') section3 += 3;

    // 🟢 SECTION 4: Urithi & Uwekezaji
    let section4 = 0;
    if (data.willPlan === 'yes') section4 += 5;
    if (data.monthlyInvestmentPlan === 'yes') section4 += 5;

    // ✅ Calculate percentage for each section
    let sectionPercentages = {
      section1: Math.round((section1 / maxScore.section1) * 100),
      section2: Math.round((section2 / maxScore.section2) * 100),
      section3: Math.round((section3 / maxScore.section3) * 100),
      section4: Math.round((section4 / maxScore.section4) * 100)
    };

    // ✅ Total score & percentage
    let totalScore = section1 + section2 + section3 + section4;
    let totalPercentage = Math.round(
      (totalScore / (maxScore.section1 + maxScore.section2 + maxScore.section3 + maxScore.section4)) * 100
    );

    return {
      totalScore,
      totalPercentage,
      netWealth,
      ffPercent,
      breakdown: {
        scores: { section1, section2, section3, section4 },
        percentages: sectionPercentages
      }
    };
  };
}
