import mongoose from "mongoose";

const consultantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    spesialisasi: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim()),
        message: "Field 'spesialisasi' wajib berupa array string dan minimal berisi 1 item.",
      },
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^https:\/\/wa\.me\/\d+$/.test(value),
        message: "Field 'whatsapp' wajib berupa link wa.me yang valid.",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Field 'email' wajib berupa link mailto yang valid.",
      },
    },
    photo: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Consultant", consultantSchema);
