require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET Route to view messages (Admin Dashboard)
app.get('/admin', async (req, res) => {
    try {
        const { rows: messages } = await pool.query('SELECT * FROM messages ORDER BY submitted_at DESC');
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Messages Admin Dashboard</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; margin: 0; }
                    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                    .header h1 { color: #60a5fa; margin: 0; }
                    .refresh-btn { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; text-decoration: none; font-weight: 600; }
                    .refresh-btn:hover { background: #1d4ed8; }
                    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                    th, td { padding: 15px; text-align: left; border-bottom: 1px solid #334155; }
                    th { background: #1e3a8a; color: #bfdbfe; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
                    tr:hover { background: #334155; }
                    td { font-size: 0.95rem; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📬 Admin Dashboard</h1>
                    <a href="/admin" class="refresh-btn">Refresh Data</a>
                </div>
                <table>
                    <tr><th>Date</th><th>Name</th><th>Email</th><th>Message</th></tr>
                    ${messages.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 30px;">No messages yet!</td></tr>' : ''}
                    ${messages.map(m => `<tr>
                        <td>${new Date(m.submitted_at).toLocaleString()}</td>
                        <td style="font-weight: 600;">${m.name}</td>
                        <td><a href="mailto:${m.email}" style="color: #60a5fa; text-decoration: none;">${m.email}</a></td>
                        <td>${m.message}</td>
                    </tr>`).join('')}
                </table>
            </body>
            </html>
        `;
        res.send(html);
    } catch (err) {
        res.status(500).send('Error loading dashboard.');
    }
});

// POST Route to handle contact form submission
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Insert into PostgreSQL database
        const query = `
            INSERT INTO messages (name, email, message)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const values = [name, email, message];
        const result = await pool.query(query, values);
        
        console.log(`Saved new contact message with ID: ${result.rows[0].id}`);
        
        return res.status(200).json({ success: true, id: result.rows[0].id });
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
