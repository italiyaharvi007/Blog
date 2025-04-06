class ApiFeatureAggregate {
  constructor(pipeline, pipelineString) {
    this.pipeline = pipeline;
    this.pipelineString = pipelineString;
  }

  aggregate() {
    const sortBy =
      this.pipelineString?.sort?.split(",")?.join(" ") ?? "createdAt";
    const page = this.pipelineString?.page * 1 || 1;
    const limit = this.pipelineString?.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.pipeline = [
      ...this.pipeline,
      {
        $sort: {
          [sortBy]: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    return this.pipeline;
  }

  totalAggregate() {
    return this.pipeline;
  }
  //  limitField the results
  // limitField() {
  //     // 4) field Limiting
  //     if (this.pipelineString.fields) {
  //         const field = this.pipelineString.fields.split(',').join(' ');
  //         this.pipeline = this.pipeline.select(field)
  //     } else {
  //         this.pipeline = this.pipeline.select('__v')
  //     }

  //     return this;
  // }
  //  paginate the results
  // paginate() {
  // 5) Pagination
  // const page = req.pipeline.page * 1 || 1;
  // const limit = req.pipeline.limit * 1 || 1;
  // const skip = (page - 1) * limit;
  // pipeline = pipeline.skip(skip).limit(limit);
  // if (req.pipeline.page) {
  //     const newTours = await Tour.countDocuments();
  //
  //     if (skip > newTours) throw new Error('This page does not exit');
  // }
  // return this;
  // }
}
module.exports = ApiFeatureAggregate;
