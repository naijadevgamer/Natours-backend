import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

interface User extends Document {
  name: string;
  email: string;
  photoUrl: string;
  password: string;
  confirmPassword: string | undefined;
}

const userSchema: Schema<User> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: function (val: string) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
      },
      message: 'Enter a valid email address',
    },
  },
  photoUrl: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must not be less than 8 charcters'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm password is required'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password is not the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  // checks if the password field in the current document has not been changed since it was last saved
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined; // remove confirm password field from the document before saving
  // (this as any).start = Date.now();

  next();
});

// userSchema.post('save', function (_doc, next) {
//   console.log(
//     `Query took ${(Date.now() - (this as any).start) / 1000} seconds`
//   );

//   next();
// });

const User: Model<User> = mongoose.model<User>('User', userSchema);

export default User;
