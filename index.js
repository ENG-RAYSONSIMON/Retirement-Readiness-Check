import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { processRetirementCalculations } from './processor.js';   // new import

dotenv.config();
const port = process.env.PORT;

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route (just to test API is running)
app.get('/', (req, res) => {
  res.json({ message: "Retirement Checkup API is running" });
});


/**
 * POST: Submit Retirement Checkup form
 * URL: /api/retirement-checkup/submit
 */
app.post('/api/retirement-calculations/', async (req, res) => {

  try {
    const input = req.body;
    console.log("debug input",input)
    if (!input.fullName || !input.email || !input.age || !input.monthlyExpenses) {
      return res.status(400).json({
        status: 0,
        msg: "Missing required fields (fullName, email, age, monthlyExpenses)"
      });
    }

    const result = await processRetirementCalculations(input);
    res.json(result);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: 0,
      msg: "Server error: " + error.message
    });
  }
});

/**
 * GET: Retrieve latest retirement checkup by email
 * URL: /api/retirement-checkup/:email
 */
import RetirementCalculations from './Classes/RetirementCalculations.js'; // still needed for data retrieval

app.get('/api/retirement-calculations/:email', async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch from DB
    const data = await RetirementCalculations.getByEmail({ email });

    if (!data) {
      return res.status(404).json({ status: 0, msg: "No record found for this email" });
    }

    res.json({
      status: 1,
      msg: "✅ Success",
      data
    });
  } catch (error) {
    res.status(500).json({ status: 0, msg: "Server error: " + error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
