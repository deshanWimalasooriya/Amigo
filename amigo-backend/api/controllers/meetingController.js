const db = require("../models");
const Meeting = db.meetings;

// @desc    Schedule a new meeting
// @route   POST /api/meetings
exports.createMeeting = async (req, res) => {
  try {
    // 1. Debugging: See exactly what data is hitting the server
    console.log("📥 Recieved Data:", req.body);
    
    // 2. Safety Check: Ensure User is attached (Auth Middleware worked)
    if (!req.user || !req.user.id) {
        console.error("❌ Error: No User ID found in request. Auth failed.");
        return res.status(401).json({ message: "Unauthorized: User not identified." });
    }

    const { topic, date, time, duration, passcode, hostVideo, participantVideo } = req.body;

    // 3. Generate Random ID
    const meetingCode = Math.floor(100000000 + Math.random() * 900000000).toString();

    // 4. Create in DB
    const meeting = await Meeting.create({
      topic,
      date,
      time,
      duration,
      passcode,
      hostVideo: hostVideo || true,           // Safety default
      participantVideo: participantVideo || false, // Safety default
      meetingCode,
      userId: req.user.id 
    });

    console.log("✅ Meeting Saved:", meeting.id);
    res.status(201).json(meeting);

  } catch (error) {
    // 5. THE REAL FIX: Log the exact database error to the terminal
    console.error("❌ DATABASE ERROR:", error.message);
    console.error("Stack:", error); // Shows if column is missing
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ... keep getMyMeetings as is
exports.getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};