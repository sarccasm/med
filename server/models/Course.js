import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    phases: { type: [phaseSchema], required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
