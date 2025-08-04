import dotenv from 'dotenv';
import RetirementCalculations from './Classes/RetirementCalculations.js';

export function processRetirementCalculations(input) {
  return new Promise(async (resolve) => {
    try {
      //Fanya hesabu zote
      const report = RetirementCalculations.calculateReadinessScore(input);

      // Hifadhi data kwenye DB
      await RetirementCalculations.create({
        ...input,
        financialFreedomPercent: report.ffPercent + '%'
      });

      // Tafsiri kulingana na totalPercentage
      let tafsiri = "";
      if (report.totalPercentage >= 80) {
        tafsiri = "Uko karibu sana kufikia uhuru wa kifedha! Endelea na mpango wa sasa na boresha uwekezaji kidogo kidogo.";
      } else if (report.totalPercentage >= 50) {
        tafsiri = "Njia ipo, lakini kuna mapungufu makubwa. Unahitaji kuongeza uwekezaji, kulipa madeni, na kupanga miradi ya kipato endelevu.";
      } else {
        tafsiri = "Safari ni ndefu. Hakikisha una mpango madhubuti wa kifedha na ongeza nidhamu ya uwekezaji ili kufikia malengo yako.";
      }

      // Rudisha majibu yote
      resolve({
        status: 1,
        msg: "success",
        totalPercentage: report.totalPercentage,
        sectionPercentages: report.breakdown.percentages,
        rawScores: report.breakdown.scores,
        netWealth: report.netWealth,
        ffPercent: report.ffPercent,
        tafsiri
      });

    } catch (error) {
      resolve({
        status: 0,
        msg: "Server error: " + error.message
      });
    }
  });
}
