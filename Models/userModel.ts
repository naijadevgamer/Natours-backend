import mongoose, { Document, Query } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface User extends Document {
  name: string;
  email: string;
  role: string;
  photoUrl: string;
  password: string | undefined;
  confirmPassword: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
}

interface UserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changePasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
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
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'lead-guide', 'guide'],
      message: 'Role must be either user, admin, lead-guide, or guide',
    },
    default: 'user',
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
      // This only works on CREATE and SAVE!!
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// This only works on CREATE and SAVE!!
userSchema.pre('save', async function (next) {
  // checks if the password field in the current document has not been changed since it was last saved
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password as string, 12);

  this.confirmPassword = undefined; // remove confirm password field from the document before saving

  next();
});

// This only works on CREATE and SAVE!!
userSchema.pre('save', function (next) {
  // sets the passwordChangedAt property for the user to the current date before saving the new password field to the current document
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});

userSchema.pre<Query<any, UserDocument>>(/^find/, function (next) {
  // Ensure `this` is properly typed as a Mongoose Query
  this.find({ active: { $ne: false } });
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
