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
        mounthlyExpenditureAfterRetire, incomeEarnedFree, tenYearsPlan, score, totalPercentage, feedback, dateCreated, state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      new Date(),
      "waiting"
    ];

    const [result] = await database.execute(sql, values);
    return result.insertId;
  }
  
  static async getData() {
    const sql = `SELECT * FROM users ORDER BY dateCreated DESC`;
    const [rows] = await database.execute(sql);
    return rows;
  }

  static async toggleState(userId) {
    const sqlGet = `SELECT state FROM users WHERE id = ?`;
    const [rows] = await database.execute(sqlGet, [userId]);

    if (!rows.length) {
      throw new Error("User not found");
    }

    const currentState = rows[0].state;
    const newState = currentState === "waiting" ? "consulted" : "waiting";

    const sqlUpdate = `UPDATE users SET state = ? WHERE id = ?`;
    await database.execute(sqlUpdate, [newState, userId]);

    return { id: userId, previousState: currentState, newState };
  }

}

export default User;
