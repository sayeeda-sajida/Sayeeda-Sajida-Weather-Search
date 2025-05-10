const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'weather'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Routes
// Store search history
app.post('/api/history', (req, res) => {
    const { city, timestamp } = req.body;

    // Convert to MySQL format
    const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

    const query = 'INSERT INTO history (city, timestamp) VALUES (?, ?)';
    db.query(query, [city, formattedTimestamp], (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: 'Search history saved.' });
    });
});


// Get search history
app.get('/api/history', (req, res) => {
    const query = 'SELECT * FROM history ORDER BY timestamp DESC LIMIT 5';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
});

// Get weather details (OpenWeatherMap)
app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = '64b845e34476ad3a050d3a99464130fe';
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather details' });
    }
});

// Clear all search history
app.delete('/api/history', (req, res) => {
    const query = 'DELETE FROM history';
    db.query(query, (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: 'All search history cleared.' });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
