import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

process.env.NODE_ENV !== 'development' &&
  process.on('uncaughtException', (err: Error) => {
    console.log('uncaughtException', err.message);
  });

import app from './app';

main();

async function main() {
  await mongoose.connect(
    process.env.DB!.replace('<DB_PASSWORD>', process.env.DB_PASSWORD!)
  );

  console.log('Database connected sucessfully');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// const testTour = new Tour({
//   name: 'The Park camper',
//   price: 450,
// });

// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err: Error) => console.log(err.message));

const port: number = +process.env.PORT! || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('unhandledRejection', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// throw new Error('This is an uncaught exception');
