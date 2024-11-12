import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
import app from './app';

const port: number = process.env.PORT || 3000;

// console.log(process.env);

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
