const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "messages.json";

// Load existing messages or create an empty file if not present
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Read messages from file
function getMessages() {
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Write messages to file
function saveMessages(messages) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// 📌 Route: Store User Message and return only that message
app.post("/submit", (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ status: "error", message: "All fields are required!" });
    }

    const messages = getMessages();
    const newMessage = {
        id: messages.length + 1,
        name,
        email,
        message,
        response: null // Initially no response
    };

    messages.push(newMessage);
    saveMessages(messages);

    res.json({ status: "success", message: "Message received!", data: newMessage });
});

// 📌 Route: View Messages for a Specific User (Filtered by Email)
app.get("/messages/:email", (req, res) => {
    const userMessages = getMessages().filter(msg => msg.email === req.params.email);
    
    if (userMessages.length === 0) {
        return res.status(404).json({ status: "error", message: "No messages found for this email!" });
    }

    res.json(userMessages);
});

// 📌 Route: Respond to a Message
app.post("/respond", (req, res) => {
    const { id, response } = req.body;

    const messages = getMessages();
    const messageIndex = messages.findIndex((msg) => msg.id === id);

    if (messageIndex === -1) {
        return res.status(404).json({ status: "error", message: "Message not found!" });
    }

    messages[messageIndex].response = response;
    saveMessages(messages);

    res.json({ status: "success", message: "Response sent!" });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
