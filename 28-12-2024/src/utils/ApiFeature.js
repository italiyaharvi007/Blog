const { startOfDay, endOfDay } = require("date-fns");

class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //  filter the results
  filter() {
    // 1) Filtering
    const queryObj = {
      ...this.queryString,
    };
    const excludeFields = ["page", "limit", "sort", "fields", "findRecurring"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // 2) Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lt|lte|gt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    // if (this.queryString.search) {
    //     this.query = this.query.find({name: { $regex: this.queryString.search, $options: 'i' }});
    // }
    return this;
  }

  //  sort the results
  sort() {
    // 3) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // Sort the pricing
  sortByPrice() {
    if (this.queryString.sort === "price_ascending") {
      this.query = this.query.sort({ starting_price_inr: 1 });
    } else if (this.queryString.sort === "price_descending") {
      this.query = this.query.sort({ starting_price_inr: -1 });
    } else if (this.queryString.sort === "default") {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  namesort() {
    // 3) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("name");
    }
    return this;
  }

  //  limitField the results
  limitField() {
    // 4) field Limiting
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select("__v");
    }

    return this;
  }

  //  paginate the results
  paginate() {
    // 5) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 1;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //     const newTours = await Tour.countDocuments();
    //
    //     if (skip > newTours) throw new Error('This page does not exit');
    // }
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  searchUser() {
    if (this.queryString.search) {
      this.query = this.query.find({
        $or: [
          {
            first_name: {
              $regex: this.queryString.search,
              $options: "i",
            },
          },
          {
            last_name: {
              $regex: this.queryString.search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: this.queryString.search,
              $options: "i",
            },
          },
        ],
      })

    }
    return this;
  }
}
module.exports = ApiFeature;
