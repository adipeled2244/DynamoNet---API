const { Schema, model } = require("mongoose");
// const mongoose = require('mongoose');

const timeRangeSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    network: { type: Schema.Types.ObjectId, ref: "Network", required: true },
  },
  { collection: "timeRanges" }
);

const TimeRange = model("TimeRange", timeRangeSchema);
module.exports = TimeRange;
