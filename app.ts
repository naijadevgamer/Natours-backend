import { Application, Request } from 'express';

const express = require('express');

const app: Application = express();

app.get('/', (req, res) => {});

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
