import { Application } from 'express';
import fs from 'fs';
import express from 'express';

const app: Application = express();

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  console.log(req.body);
  res.status(200).send('Done');
});

const port: number = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
