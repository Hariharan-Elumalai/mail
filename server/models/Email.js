const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Email body is required'],
    },
    recipients: {
      type: [String],
      required: [true, 'At least one recipient is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Recipients array cannot be empty',
      },
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'partial', 'failed'],
      default: 'pending',
    },
    successCount: { type: Number, default: 0 },
    failCount:    { type: Number, default: 0 },
    failedEmails: { type: [String], default: [] },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Email', emailSchema);
