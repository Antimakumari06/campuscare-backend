// ================================================================
//  CampusCare — server.js with JWT + Socket.IO Real-time
// ================================================================

require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const jwt        = require("jsonwebtoken");
const http       = require("http");
const { Server } = require("socket.io");
const sendComplaintEmail = require("./emailService");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= MONGODB =================

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/campuscare")
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => console.log(err));

// ================= SCHEMA =================

const complaintSchema = new mongoose.Schema({
    name:        String,
    issue:       String,
    description: String,
    status: {
        type:    String,
        enum:    ["Pending", "Resolved"],
        default: "Pending"
    },
    date: { type: Date, default: Date.now }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

// ================= JWT MIDDLEWARE =================

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token 🔒" });
    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ success: false, message: "Invalid/expired token ❌" });
    }
}

// ================= SOCKET.IO =================

io.on("connection", (socket) => {
    console.log("Admin connected via Socket.IO 🔌", socket.id);
    socket.on("disconnect", () => {
        console.log("Admin disconnected 🔌", socket.id);
    });
});

// ================= HOME =================

app.get("/", (req, res) => res.send("CampusCare Backend Running 🚀"));

// ================= ADMIN LOGIN =================

app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Invalid credentials ❌" });
    }

    const token = jwt.sign(
        { email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    try {
        await sendComplaintEmail("Admin", "Login Alert",
            `Admin login at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
        console.log("Login alert sent 📧");
    } catch (err) {
        console.log("Email error:", err.message);
    }

    res.json({ success: true, message: "Login successful ✅", token });
});

// ================= POST COMPLAINT (public) =================

app.post("/complaint", async (req, res) => {
    try {
        const { name, issue, description } = req.body;
        const newComplaint = new Complaint({ name, issue, description });
        await newComplaint.save();

        io.emit("newComplaint", {
            _id:         newComplaint._id,
            name,
            issue,
            description,
            status:      "Pending",
            date:        newComplaint.date
        });

        console.log("🔔 Real-time notification sent!");

        try {
            await sendComplaintEmail(name, issue, description);
            console.log("Complaint email sent 📧");
        } catch (emailErr) {
            console.log("Email error:", emailErr.message);
        }

        res.status(201).json({
            message: "Complaint Saved & Notified ✅",
            data: newComplaint
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Error saving complaint" });
    }
});

// ================= PROTECTED ROUTES =================

app.get("/complaints", verifyToken, async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ date: -1 });
        res.json(complaints);
    } catch {
        res.status(500).json({ message: "Error fetching complaints" });
    }
});

app.put("/complaint/:id", verifyToken, async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id, { status: req.body.status }, { new: true }
        );
        io.emit("statusUpdated", { id: req.params.id, status: req.body.status });
        res.json({ message: "Status Updated ✅", data: updated });
    } catch {
        res.status(500).json({ message: "Error updating status" });
    }
});

app.delete("/complaint/:id", verifyToken, async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        io.emit("complaintDeleted", { id: req.params.id });
        res.json({ message: "Complaint Deleted 🗑️" });
    } catch {
        res.status(500).json({ message: "Error deleting complaint" });
    }
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));