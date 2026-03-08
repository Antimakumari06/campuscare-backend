const nodemailer = require("nodemailer");

// ================= TRANSPORTER =================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "campuscare53@gmail.com",
        pass: "vskfjijieitqayzb"   // Gmail App Password
    }
});


// ================= SEND EMAIL FUNCTION =================

const sendComplaintEmail = async (name, issue, description) => {

    // ✅ Login alert email (admin ke login pe)
    if (issue === "Login Alert") {

        await transporter.sendMail({
            from: "CampusCare <campuscare53@gmail.com>",
            to: "campuscare53@gmail.com",   // admin ko jaayega
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

    // ✅ New complaint email (student submit kare tab)
    await transporter.sendMail({
        from: "CampusCare <campuscare53@gmail.com>",
        to: "lloydcare12@gmail.com",     // admin ka email
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
                <a href="http://localhost:5500/admin.html"
                   style="background:#0d6efd;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                   Open Admin Panel →
                </a>
                <p style="font-size:12px;color:#aaa;margin-top:20px;">CampusCare System</p>
            </div>
        `
    });

};

module.exports = sendComplaintEmail;
