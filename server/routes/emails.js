const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Email = require('../models/Email');
const { protect } = require('../middleware/auth');

// Create transporter. If SMTP creds are not provided, create an Ethereal test account
// and return a transporter that allows previewing messages instead of sending real mail.
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return { transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }), isTest: false };
  }

  // Create test account
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, isTest: true };
};

// @route POST /api/emails/send  (protected)
router.post('/send', protect, async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0)
      return res.status(400).json({ message: 'Subject, body and recipients are required' });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((e) => !emailRegex.test(e.trim()));
    if (invalidEmails.length > 0)
      return res.status(400).json({ message: `Invalid emails: ${invalidEmails.join(', ')}` });

    // Save record with pending status
    const emailRecord = await Email.create({
      subject,
      body,
      recipients,
      sentBy: req.user._id,
      status: 'pending',
    });

    const { transporter, isTest } = await createTransporter();
    const successList = [];
    const failList = [];
    const previews = [];

    // Send to each recipient
    for (const recipient of recipients) {
      try {
        const info = await transporter.sendMail({
          from: `"BulkMailer" <${process.env.EMAIL_USER || 'no-reply@bulkmailer.test'}>`,
          to: recipient.trim(),
          subject,
          html: body,
        });

        // If using Ethereal, collect preview URL
        if (isTest) {
          const url = nodemailer.getTestMessageUrl(info);
          if (url) previews.push({ recipient: recipient.trim(), preview: url });
        }

        successList.push(recipient);
      } catch (err) {
        console.error(`Failed to send to ${recipient}: ${err.message}`);
        failList.push(recipient);
      }
    }

    // Determine status
    let status = 'sent';
    if (successList.length === 0) status = 'failed';
    else if (failList.length > 0) status = 'partial';

    // Update the record
    emailRecord.status = status;
    emailRecord.successCount = successList.length;
    emailRecord.failCount = failList.length;
    emailRecord.failedEmails = failList;
    emailRecord.sentAt = new Date();
    await emailRecord.save();

    const resp = {
      message: `Emails processed. ${successList.length} sent, ${failList.length} failed.`,
      status,
      successCount: successList.length,
      failCount: failList.length,
      failedEmails: failList,
      emailId: emailRecord._id,
    };

    if (previews.length > 0) resp.previews = previews;

    res.json(resp);
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/emails/history  (protected)
router.get('/history', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const emails = await Email.find({ sentBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sentBy', 'name email');

    const total = await Email.countDocuments({ sentBy: req.user._id });

    res.json({
      emails,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/emails/:id  (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      sentBy: req.user._id,
    });
    if (!email) return res.status(404).json({ message: 'Email record not found' });
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/emails/:id  (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const email = await Email.findOneAndDelete({
      _id: req.params.id,
      sentBy: req.user._id,
    });
    if (!email) return res.status(404).json({ message: 'Email record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
