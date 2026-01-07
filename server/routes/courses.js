import express from "express";
import Course from "../models/Course.js";
import { authRequired } from "../middleware/auth.js";
import Intake from "../models/Intake.js";

const router = express.Router();

router.use(authRequired);

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const today = new Date().toISOString().slice(0, 10);

    const intakes = await Intake.find({
      userId: req.user.id,
      date: today,
    });

    const intakeMap = new Map();
    for (const i of intakes) {
      intakeMap.set(i.courseId.toString(), i);
    }

    const result = courses.map((c) => {
      const obj = c.toObject();
      const intake = intakeMap.get(c._id.toString());
      obj.todayTaken = intake ? !!intake.taken : false;
      obj.todayNote = intake?.note || "";
      return obj;
    });

    res.json(result);
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, startDate, phases } = req.body;

    if (!name || !startDate || !Array.isArray(phases) || phases.length === 0) {
      return res.status(400).json({ message: "Невірні дані курсу" });
    }

    const normalizedPhases = phases.map((p) => ({
      label: p.label,
      days: Number(p.days),
    }));

    const course = await Course.create({
      userId: req.user.id,
      name,
      startDate,
      phases: normalizedPhases,
    });

    const obj = course.toObject();
    obj.todayTaken = false;
    obj.todayNote = "";

    res.status(201).json(obj);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { name, startDate, phases } = req.body;

    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    if (name) course.name = name;
    if (startDate) course.startDate = startDate;
    if (Array.isArray(phases) && phases.length > 0) {
      course.phases = phases.map((p) => ({
        label: p.label,
        days: Number(p.days),
      }));
    }

    await course.save();

    const today = new Date().toISOString().slice(0, 10);
    const intake = await Intake.findOne({
      userId: req.user.id,
      courseId: course._id,
      date: today,
    });

    const obj = course.toObject();
    obj.todayTaken = intake ? !!intake.taken : false;
    obj.todayNote = intake?.note || "";

    res.json(obj);
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    await Intake.deleteMany({
      userId: req.user.id,
      courseId: req.params.id,
    });

    res.status(204).end();
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:id/toggle-today", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;
  const today = new Date().toISOString().slice(0, 10);

  try {
    let intake = await Intake.findOne({ userId, courseId, date: today });

    if (!intake) {
      intake = await Intake.create({
        userId,
        courseId,
        date: today,
        taken: true,
      });
    } else {
      intake.taken = !intake.taken;
      await intake.save();
    }

    res.json({ todayTaken: intake.taken });
  } catch (err) {
    console.error("Toggle today error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/note", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;
  const { date, note } = req.body;

  if (!date) {
    return res.status(400).json({ message: "date обов'язкове" });
  }

  try {
    let intake = await Intake.findOne({ userId, courseId, date });

    if (!intake) {
      intake = await Intake.create({
        userId,
        courseId,
        date,
        note,
        taken: false,
      });
    } else {
      intake.note = note;
      await intake.save();
    }

    res.json({ note: intake.note });
  } catch (err) {
    console.error("Save note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/archive", async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    course.archived = !course.archived;
    await course.save();

    res.json({ archived: course.archived });
  } catch (err) {
    console.error("Archive toggle error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
