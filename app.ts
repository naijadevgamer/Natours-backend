import { Application } from 'express';
import fs from 'fs';
import express from 'express';

const app: Application = express();

app.use(express.json());

type Tours = {
  id: number;
  name: string;
  difficulty: string;
  duration: number;
  description: string;
};

const tours: Tours[] = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// Get tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Post tours
app.post('/api/v1/tours', (req, res) => {
  const id = tours[tours.length - 1].id + 1;

  const obj = Object.assign({ id }, req.body);
  tours.push(obj);

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

// Get tour by id
app.get('/api/v1/tours/:id', (req, res): any => {
  const tour = tours.find((tour) => tour.id === +req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'Not found',
      data: {
        tour,
      },
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Patch tour
app.patch('/api/v1/tours/:id', (req, res): any => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Update tour here',
    },
  });
});

// Delete tour
app.patch('/api/v1/tours/:id', (req, res): any => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: {
      tour: null,
    },
  });
});

const port: number = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
