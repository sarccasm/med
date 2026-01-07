import mongoose from "mongoose";

const intakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    taken: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

intakeSchema.index({ userId: 1, courseId: 1, date: 1 }, { unique: true });

const Intake = mongoose.model("Intake", intakeSchema);

export default Intake;
