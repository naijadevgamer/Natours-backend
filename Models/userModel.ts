import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface User extends Document {
  name: string;
  email: string;
  photoUrl: string;
  password: string;
  confirmPassword: string | undefined;
  passwordChangedAt: Date;
}

interface UserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changePasswordAfter(JWTTimestamp: number): boolean;
}

type UserDocument = User & UserMethods;

const userSchema = new mongoose.Schema<
  UserDocument,
  mongoose.Model<UserDocument>,
  UserMethods
>({
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
    select: false,
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
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // checks if the password field in the current document has not been changed since it was last saved
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined; // remove confirm password field from the document before saving
  // (this as any).start = Date.now();

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp: number) {
  const changedTimestamp = parseInt(
    String(this.passwordChangedAt?.getTime() / 1000),
    10
  );

  if (this.passwordChangedAt) {
    console.log(changedTimestamp, JWTTimestamp);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// userSchema.post('save', function (_doc, next) {
//   console.log(
//     `Query took ${(Date.now() - (this as any).start) / 1000} seconds`
//   );
//   next();
// });

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
