const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'messages.json');

// Initialize JSON database
const initDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
        console.log('Database initialized.');
    }
};

initDb();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST Route to handle contact form submission
app.post('/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Insert into database
        const messages = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const newContact = {
            id: Date.now(),
            name,
            email,
            message,
            submitted_at: new Date().toISOString()
        };
        messages.push(newContact);
        fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
        
        console.log(`Saved new contact message with ID: ${newContact.id}`);
        
        return res.status(200).json({ success: true, id: newContact.id });
    } catch (err) {
        console.error('Error saving to database:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
        process.exit(0);
    });
});
