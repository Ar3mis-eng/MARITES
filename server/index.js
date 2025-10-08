const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'maritesdb',
})

app.post('/register', (req, res) => {
    const sentEmail = req.body.Email;
    const sentUserName = req.body.UserName;
    const sentPassword = req.body.Password;

    const SQL = "INSERT INTO marites_tbl (Email, UserName, Password) VALUES (?, ?, ?)";
    const values = [sentEmail, sentUserName, sentPassword];
    db.query(SQL, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error occurred while registering user');
        } else {
            console.log('User has been created');
            res.status(200).send('User has been created');
        }
    });
})
app.post('/login', (req, res) => {
    const sentLoginUserName = req.body.LoginUserName;
    const sentLoginPassword = req.body.LoginPassword;

    const SQL = "SELECT * FROM marites_tbl WHERE UserName = ? AND Password = ?";
    const values = [sentLoginUserName, sentLoginPassword];
    db.query(SQL, values, (err, result) => {
        if (err) {
            res.send(err);
            return;
        }
        if (result.length > 0) {
            res.send(result);
        }
        else {
                res.send({ message: "Credentials Don't Match!" });
        }
    });
});

const getNodeSensorRange = (node) => {
    switch (node) {
        case 1: return ['sensor_1', 'sensor_2', 'sensor_3', 'sensor_4'];
        case 2: return ['sensor_5', 'sensor_6', 'sensor_7', 'sensor_8'];
        case 3: return ['sensor_9', 'sensor_10', 'sensor_11', 'sensor_12'];
        default: return [];
    }
};

app.get('/api/sensorData/node1', (req, res) => {
    const sensorIds = ['sensor_1', 'sensor_2', 'sensor_3', 'sensor_4'];

    const query = `
        SELECT sensor_id, timestamp, magnitude, pitch, roll 
        FROM accelerometerdata 
        WHERE sensor_id IN (?) 
        ORDER BY timestamp ASC
    `;

    db.query(query, [sensorIds], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).send("Server error");
        }

        // Group by sensor_id
        const grouped = {};
        results.forEach(row => {
            if (!grouped[row.sensor_id]) grouped[row.sensor_id] = [];
            grouped[row.sensor_id].push({
                label: row.timestamp,
                timestamp: row.timestamp,
                magnitude: parseFloat(row.magnitude),
                pitch: parseFloat(row.pitch),
                roll: parseFloat(row.roll)
            });
        });

        res.json(grouped);
    });
});

// NODE 2 (sensors 5-8)
app.get('/api/sensorData/node2', (req, res) => {
    const sensorIds = ['sensor_5', 'sensor_6', 'sensor_7', 'sensor_8'];

    const query = `
        SELECT sensor_id, timestamp, magnitude, pitch, roll 
        FROM accelerometerdata 
        WHERE sensor_id IN (?) 
        ORDER BY timestamp ASC
    `;

    db.query(query, [sensorIds], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).send("Server error");
        }

        const grouped = {};
        results.forEach(row => {
            if (!grouped[row.sensor_id]) grouped[row.sensor_id] = [];
            grouped[row.sensor_id].push({
                label: row.timestamp,
                timestamp: row.timestamp,
                magnitude: parseFloat(row.magnitude),
                pitch: parseFloat(row.pitch),
                roll: parseFloat(row.roll)
            });
        });

        res.json(grouped);
    });
});

// NODE 3 (sensors 9-12)
app.get('/api/sensorData/node3', (req, res) => {
    const sensorIds = ['sensor_9', 'sensor_10', 'sensor_11', 'sensor_12'];

    const query = `
        SELECT sensor_id, timestamp, magnitude, pitch, roll 
        FROM accelerometerdata 
        WHERE sensor_id IN (?) 
        ORDER BY timestamp ASC
    `;

    db.query(query, [sensorIds], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).send("Server error");
        }

        const grouped = {};
        results.forEach(row => {
            if (!grouped[row.sensor_id]) grouped[row.sensor_id] = [];
            grouped[row.sensor_id].push({
                label: row.timestamp,
                timestamp: row.timestamp,
                magnitude: parseFloat(row.magnitude),
                pitch: parseFloat(row.pitch),
                roll: parseFloat(row.roll)
            });
        });

        res.json(grouped);
    });
});



app.get('/api/nodestatus', (req, res) => {
    const nodeMap = {
        1: ['sensor_1', 'sensor_2', 'sensor_3', 'sensor_4'],
        2: ['sensor_5', 'sensor_6', 'sensor_7', 'sensor_8'],
        3: ['sensor_9', 'sensor_10', 'sensor_11', 'sensor_12']
    };

    const query = `SELECT sensor_id FROM accelerometerdata`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        const presentSensors = results.map(r => r.sensor_id);
        const output = [];

        Object.entries(nodeMap).forEach(([nodeId, sensors]) => {
            const missing = sensors.filter(s => !presentSensors.includes(s));
            const status = missing.length === 0
                ? "Normal Status"
                : `Missing ${missing.length} sensor${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`;

            output.push({
                nodeId: `Node ${nodeId}`,
                status,
                location: "Unavailable",
                slopeStatus: "Unavailable" // for now
            });
        });

        res.json(output);
    });
});