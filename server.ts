import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import app from './app';

main().catch((err) => console.log(err));

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

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
