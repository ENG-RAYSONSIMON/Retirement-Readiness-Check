import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { processRetirement, getAllUsersData } from './processor.js';

dotenv.config();
const port = process.env.PORT;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.json({ message: "Retirement Checkup API is running" });
});

app.post('/api/evaluate', async (req, res) => {
  let input = req.body;

  await processRetirement(input).then((result) => {
    res.json(result);
  })

});

app.get('/api/all-users', async (req, res) => {
  await getAllUsersData().then((result) => {
    res.json(result);
  })
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
