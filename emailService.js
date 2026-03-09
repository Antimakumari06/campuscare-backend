const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER || "campuscare53@gmail.com",
        pass: process.env.GMAIL_PASS || "vskfjijieitqayzb"
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

const sendComplaintEmail = async (name, issue, description) => {

    if (issue === "Login Alert") {
        await transporter.sendMail({
            from: `CampusCare <${process.env.GMAIL_USER || "campuscare53@gmail.com"}>`,
            to: process.env.GMAIL_USER || "campuscare53@gmail.com",
            subject: "🔐 Admin Login Alert — CampusCare",
            html: `
                <div style="font-family:Arial;padding:20px;max-width:500px;border:1px solid #ddd;border-radius:10px;">
                    <h2 style="color:#d9534f;">🔐 Admin Login Detected</h2>
                    <p><b>Time:</b> ${description}</p>
                    <p style="color:#888;">If this was not you, please change your password immediately.</p>
                    <hr/>
                    <p style="font-size:12px;color:#aaa;">CampusCare Security System</p>
                </div>
            `
        });
        return;
    }

    await transporter.sendMail({
        from: `CampusCare <${process.env.GMAIL_USER || "campuscare53@gmail.com"}>`,
        to: "campuscare53@gmail.com",
        subject: "📢 New Complaint Submitted — CampusCare",
        html: `
            <div style="font-family:Arial;padding:20px;max-width:500px;border:1px solid #ddd;border-radius:10px;">
                <h2 style="color:#0d6efd;">📢 New Complaint Received</h2>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px;background:#f8f9fa;font-weight:bold;">Student Name</td>
                        <td style="padding:8px;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;background:#f8f9fa;font-weight:bold;">Issue Type</td>
                        <td style="padding:8px;">${issue}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;background:#f8f9fa;font-weight:bold;">Description</td>
                        <td style="padding:8px;">${description}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;background:#f8f9fa;font-weight:bold;">Submitted At</td>
                        <td style="padding:8px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                    </tr>
                </table>
                <br/>
                <a href="https://campuscare-backend-production.up.railway.app/admin.html"
                   style="background:#0d6efd;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                   Open Admin Panel →
                </a>
                <p style="font-size:12px;color:#aaa;margin-top:20px;">CampusCare System</p>
            </div>
        `
    });
};

module.exports = sendComplaintEmail;
