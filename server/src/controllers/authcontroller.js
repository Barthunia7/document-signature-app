const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ✅ Added for generating secure tokens
const nodemailer = require('nodemailer'); // ✅ Added for dispatching password links

// =========================================================
// 📧 LIVE PRODUCTION SMTP TRANSPORTER (INSTANTIATED ONCE)
// =========================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || '://resend.com', // ✅ Fallback to Resend if not defined
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your verified SMTP username (e.g., 'resend')
    pass: process.env.EMAIL_APP_PASS // Your live production API secret key
  }
});

// =========================================================
// 🚀 REGISTER CONTROLLER
// =========================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 🚀 LOGIN CONTROLLER
// =========================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 🚀 DAY 14: FORGOT PASSWORD CONTROLLER IMPLEMENTATION
// =========================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    // 1. Verify if user exists in MongoDB
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Security Practice: Return a vague success message even if the user isn't found
    if (!user) {
      return res.status(200).json({ message: "If that account exists, a password reset link has been dispatched." });
    }

    // 2. Generate a unique random token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 3. Save the token and 1-hour expiration timestamp onto the User document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
    await user.save();

    // 4. Formulate absolute link targeting Vite frontend app domain dynamically
    const frontendDomain = process.env.FRONTEND_URL || 'http://localhost:5173'; // ✅ DYNAMIC URL
    const resetUrl = `${frontendDomain}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"DocuSign Clone Security" <${process.env.EMAIL_FROM || 'security@docusignclone.com'}>`, // ✅ Uses fallback safely
      to: user.email,
      subject: 'Account Security: Password Reset Link Request',
      html: `
        <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 450px; margin: 0 auto; background-color: #ffffff;">
          <h3 style="color: #0f172a; margin-top: 0;">Password Reset Request</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">A request was initiated to change your account login credentials.</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Click the button below to update your security parameters:</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Reset Account Password</a>
          </div>
          <p style="margin-top: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;">This link will expire in 1 hour.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "If that account exists, a password reset link has been dispatched." });

  } catch (error) {
    console.error("Forgot Password Controller Error:", error.message);
    return res.status(500).json({ error: "Internal server error processing security tokens." });
  }
};

// =========================================================
// 🚀 DAY 14: RESET PASSWORD VERIFICATION & UPDATE CONTROLLER
// =========================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "New password parameter is required" });
    }

    // 1. Find user with matching token and verify token expiration timestamp is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // $gt means "greater than current time"
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    // 2. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Apply updates and completely wipe out the reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully! Redirecting to login..." });

  } catch (error) {
    console.error("Reset Password Controller Error:", error.message);
    return res.status(500).json({ error: "Internal server error updating account password parameters." });
  }
};
