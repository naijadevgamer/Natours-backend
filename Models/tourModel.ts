import mongoose, { Schema, Document, Model, Query } from 'mongoose';
import slugify from 'slugify';

interface ITour extends Document {
  id: number;
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: string[]; // ISO date strings with optional time
  secretTour: boolean;
}

const tourSchema: Schema<ITour> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must not be more than 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters'],
      validate: {
        validator: function (val: string) {
          return /^[a-zA-Z\s'-]+$/.test(val);
        },
        message: 'A tour name must only contain alphabets',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'A tour difficulty must be either easy, hard, or medium',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must not be less than 1'],
      max: [5, 'Rating must not be more than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Price discount ({VALUE}) must be lower than the price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // for virtual properties
    toObject: { virtuals: true }, // for virtual properties
  }
);

// Virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware
tourSchema.pre('save', function (next) {
  const slug = slugify(this.name, { lower: true });
  this.slug = slug;
  console.log(this.slug);
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// Query middleware
tourSchema.pre<Query<any, ITour>>(/^find/, function (next) {
  // Ensure `this` is properly typed as a Mongoose Query
  this.find({ secretTour: { $ne: true } });

  // Attach a custom property (e.g., start time) for debugging or logging
  (this as any).start = Date.now();
  next();
});

tourSchema.post(/^find/, function (_doc, next) {
  console.log(
    `Query took ${(Date.now() - (this as any).start) / 1000} seconds`
  );
  // console.log(doc);
  next();
});

// Aggregate middleware
tourSchema.pre('aggregate', function (next) {
  // console.log(
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // );
  next();
});

const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);

export default Tour;
