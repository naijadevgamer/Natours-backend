import { Application } from 'express';
import fs from 'fs';
import express from 'express';

const app: Application = express();

app.use(express.json());

type Tours = {
  id: number;
  name: string;
  difficulty: string;
  duration: 5;
  description: string;
};

const tours: Tours[] = JSON.parse(
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
  const id = tours.length - 1 + 1;

  const obj = Object.assign({ id }, req.body);
  tours.push(obj);

  console.log(obj);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );

  // res.status(200).send('Done');
});

const port: number = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
