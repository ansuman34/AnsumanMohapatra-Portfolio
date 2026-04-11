import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, maxlength: 8000 },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
