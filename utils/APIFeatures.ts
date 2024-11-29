import { Query } from 'mongoose';

class APIFeatures {
  query: Query<any, any>;
  reqQuery: Record<string, any>;

  constructor(query: Query<any, any>, reqQuery: Record<string, any>) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  // 1. Filtering
  filter() {
    const objQuery = { ...this.reqQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete objQuery[field]);

    let queryStr = JSON.stringify(objQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2. Sorting
  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }

    return this;
  }

  // 3. Limiting Fields
  limitFields() {
    if (this.reqQuery.fields) {
      const selectBy = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(selectBy);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // 4. Pagination
  paginate() {
    const page = parseInt(this.reqQuery.page, 10) || 1;
    const limit = parseInt(this.reqQuery.limit, 10) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  // 5. Searching
  search(fields: string[]) {
    if (this.reqQuery.search) {
      const searchRegex = new RegExp(this.reqQuery.search, 'i'); // Case-insensitive regex
      const searchConditions = fields.map((field) => ({
        [field]: searchRegex,
      }));

      this.query = this.query.find({ $or: searchConditions });
    }

    return this;
  }

  // 6. Aggregation
  // aggregate(pipeline: any[] = []) {
  //   if (pipeline.length) {
  //     this.query = this.query.aggregate(pipeline);
  //   }

  //   return this;
  // }

  // 7. Apply Defaults
  applyDefaults(defaults: Record<string, any>) {
    Object.keys(defaults).forEach((key) => {
      if (!this.reqQuery[key]) {
        this.reqQuery[key] = defaults[key];
      }
    });

    return this;
  }

  // 8. Count
  async count() {
    const count = await this.query.clone().countDocuments();
    return count;
  }

  // 9. Debugging (Optional)
  log() {
    console.log(this.query);
    return this;
  }
}

export default APIFeatures;
