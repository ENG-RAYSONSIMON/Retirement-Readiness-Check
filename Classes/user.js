import database from '../database.js';

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    const sql = `
      INSERT INTO users (
        name, age, occupation, phone,
        email, ageToRetire, yearsLeftBeforeRetire, mounthlyExpenditure,
        saving, investment, asserts,
        healthInsurance, loan, loanAmount,
        financialFreedom, percentFinancialFreedom, willPlan, projects, mounthlyInvestmentPlan,
        mounthlyExpenditureAfterRetire, incomeEarnedFree, tenYearsPlan, score, totalPercentage, feedback, dateCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      this.name,
      this.age,
      this.occupation,
      this.phone,
      this.email,
      this.ageToRetire,
      this.yearsLeftBeforeRetire,
      this.mounthlyExpenditure,
      this.saving,
      this.investment,
      this.asserts,
      this.healthInsurance,
      this.loan,
      this.loanAmount,
      this.financialFreedom,
      this.percentFinancialFreedom,
      this.willPlan,
      this.projects,
      this.mounthlyInvestmentPlan,
      this.mounthlyExpenditureAfterRetire,
      this.incomeEarnedFree,
      this.tenYearsPlan,
      this.score,
      this.totalPercentage,
      this.feedback,
      new Date()
    ];

    const [result] = await database.execute(sql, values);
    return result.insertId;
  }
  
  static async getData() {
    const sql = `SELECT * FROM users ORDER BY dateCreated DESC`;
    const [rows] = await database.execute(sql);
    return rows;
  }

}

export default User;
