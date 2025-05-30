const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',  // Default password for development
    database: process.env.DB_NAME || 'sims',
    port: process.env.DB_PORT || 33066,
});

console.log('Attempting database connection with:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'sims',
    port: process.env.DB_PORT || 33066,
});

// Function to initialize database
const initializeDatabase = async () => {
    try {
        // First, create the database if it doesn't exist
        await db.promise().query('CREATE DATABASE IF NOT EXISTS sims');
        console.log('Database created or already exists');

        // Use the database
        await db.promise().query('USE sims');
        console.log('Using sims database');

        // Create users table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists');

        // Create spare_parts table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS spare_parts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                quantity INT NOT NULL DEFAULT 0,
                unit_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Spare parts table created or already exists');

        // Create stock_in table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS stock_in (
                id INT PRIMARY KEY AUTO_INCREMENT,
                spare_part_id INT NOT NULL,
                stock_in_quantity INT NOT NULL,
                stock_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
            )
        `);
        console.log('Stock in table created or already exists');

        // Create stock_out table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS stock_out (
                id INT PRIMARY KEY AUTO_INCREMENT,
                spare_part_id INT NOT NULL,
                stock_out_quantity INT NOT NULL,
                stock_out_unit_price DECIMAL(10, 2) NOT NULL,
                stock_out_total_price DECIMAL(10, 2) NOT NULL,
                stock_out_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
            )
        `);
        console.log('Stock out table created or already exists');

        // Check if admin user exists
        const [users] = await db.promise().query('SELECT * FROM users WHERE username = ?', ['admin']);
        
        if (users.length === 0) {
            // Create default admin user if it doesn't exist
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await db.promise().query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                ['admin', hashedPassword]
            );
            console.log('Default admin user created');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
};

db.connect(async (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to database successfully');
    
    // Initialize database
    await initializeDatabase();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'smartpark_secret_key_2024', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        // Check if username and password are provided
        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Query for user
        const [users] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        console.log('Query completed, found users:', users.length);

        if (users.length === 0) {
            console.log('No user found with username:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        console.log('Found user with ID:', user.id);

        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', validPassword);

        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'smartpark_secret_key_2024',
            { expiresIn: '24h' }
        );
        console.log('Login successful for user:', username);

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// User Registration route
app.post('/api/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    console.log('Registration attempt for username:', username);

    try {
        // Validate input
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate username format (alphanumeric, 3-20 characters)
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            return res.status(400).json({ 
                message: 'Username must be 3-20 characters long and contain only letters and numbers' 
            });
        }
  

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if username already exists
        const [existingUsers] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.promise().query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        console.log('User registered successfully:', { id: result.insertId, username });

        // Generate token for automatic login
        const token = jwt.sign(
            { id: result.insertId, username },
            process.env.JWT_SECRET || 'smartpark_secret_key_2024',
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'Registration successful',
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Spare Parts routes
app.get('/api/spare-parts', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM spare_parts ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

app.post('/api/spare-parts', authenticateToken, (req, res) => {
    const { name, category, quantity, unit_price } = req.body;
    const query = 'INSERT INTO spare_parts (name, category, quantity, unit_price) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, category, quantity, unit_price], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ id: result.insertId, message: 'Spare part created successfully' });
    });
});

// Stock In routes
app.post('/api/stock-in', authenticateToken, (req, res) => {
    const { spare_part_id, stock_in_quantity } = req.body;
    const query = 'INSERT INTO stock_in (spare_part_id, stock_in_quantity) VALUES (?, ?)';
    
    db.query(query, [spare_part_id, stock_in_quantity], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ id: result.insertId, message: 'Stock in recorded successfully' });
    });
});

app.get('/api/stock-in', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            s.id,
            p.name,
            p.category,
            s.stock_in_quantity,
            s.stock_in_date
        FROM stock_in s
        JOIN spare_parts p ON s.spare_part_id = p.id
        ORDER BY s.stock_in_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stock in records:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

// Stock Out routes
app.post('/api/stock-out', authenticateToken, (req, res) => {
    const { spare_part_id, stock_out_quantity, stock_out_unit_price } = req.body;
    const query = 'INSERT INTO stock_out (spare_part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price) VALUES (?, ?, ?, ?)';
    const total_price = stock_out_quantity * stock_out_unit_price;
    
    db.query(query, [spare_part_id, stock_out_quantity, stock_out_unit_price, total_price], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ id: result.insertId, message: 'Stock out recorded successfully' });
    });
});

app.put('/api/stock-out/:id', authenticateToken, (req, res) => {
    const { spare_part_id, stock_out_quantity, stock_out_unit_price } = req.body;
    const total_price = stock_out_quantity * stock_out_unit_price;

    // First get the current stock out record
    const getStockOutQuery = 'SELECT spare_part_id, stock_out_quantity FROM stock_out WHERE id = ?';
    
    db.query(getStockOutQuery, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching stock out record:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Stock out record not found' });
        }

        const oldStockOut = results[0];
        
        // Calculate the stock adjustment
        // If old quantity was 5 and new is 3, we need to return 2 to stock
        // If old quantity was 3 and new is 5, we need to remove 2 from stock
        const stockAdjustment = oldStockOut.stock_out_quantity - stock_out_quantity;
        
        // Start a transaction
        db.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            // If the spare part is different, we need to update both spare parts' quantities
            if (oldStockOut.spare_part_id !== spare_part_id) {
                // Return the full quantity to the old spare part
                const updateOldPartQuery = 'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?';
                db.query(updateOldPartQuery, [oldStockOut.stock_out_quantity, oldStockOut.spare_part_id], (err) => {
                    if (err) {
                        console.error('Error updating old spare part quantity:', err);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Server error' });
                        });
                    }

                    // Remove the full quantity from the new spare part
                    const updateNewPartQuery = 'UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?';
                    db.query(updateNewPartQuery, [stock_out_quantity, spare_part_id], (err) => {
                        if (err) {
                            console.error('Error updating new spare part quantity:', err);
                            return db.rollback(() => {
                                res.status(500).json({ message: 'Server error' });
                            });
                        }
                        updateStockOutRecord();
                    });
                });
            } else {
                // Same spare part, just update its quantity based on the difference
                const updateStockQuery = 'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?';
                db.query(updateStockQuery, [stockAdjustment, spare_part_id], (err) => {
                    if (err) {
                        console.error('Error updating spare part quantity:', err);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Server error' });
                        });
                    }
                    updateStockOutRecord();
                });
            }

            // Function to update the stock out record
            function updateStockOutRecord() {
                const updateStockOutQuery = `
                    UPDATE stock_out 
                    SET spare_part_id = ?, 
                        stock_out_quantity = ?, 
                        stock_out_unit_price = ?,
                        stock_out_total_price = ?
                    WHERE id = ?
                `;
                
                db.query(updateStockOutQuery, 
                    [spare_part_id, stock_out_quantity, stock_out_unit_price, total_price, req.params.id], 
                    (err) => {
                        if (err) {
                            console.error('Error updating stock out record:', err);
                            return db.rollback(() => {
                                res.status(500).json({ message: 'Server error' });
                            });
                        }

                        // Commit the transaction
                        db.commit(err => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Server error' });
                                });
                            }
                            res.json({ 
                                message: 'Stock out record updated successfully',
                                stockAdjustment,
                                oldSparePartId: oldStockOut.spare_part_id,
                                newSparePartId: spare_part_id
                            });
                        });
                    }
                );
            }
        });
    });
});

app.delete('/api/stock-out/:id', authenticateToken, (req, res) => {
    // First get the stock out record to know the quantity to restore
    const getStockOutQuery = 'SELECT spare_part_id, stock_out_quantity FROM stock_out WHERE id = ?';
    
    db.query(getStockOutQuery, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching stock out record:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Stock out record not found' });
        }

        const stockOut = results[0];

        // Start a transaction to ensure both operations succeed or fail together
        db.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            // Update the spare part quantity
            const updateStockQuery = 'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?';
            db.query(updateStockQuery, [stockOut.stock_out_quantity, stockOut.spare_part_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating spare part quantity:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Server error' });
                    });
                }

                // Delete the stock out record
                const deleteQuery = 'DELETE FROM stock_out WHERE id = ?';
                db.query(deleteQuery, [req.params.id], (err, deleteResult) => {
                    if (err) {
                        console.error('Error deleting stock out record:', err);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Server error' });
                        });
                    }

                    // Commit the transaction
                    db.commit(err => {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            return db.rollback(() => {
                                res.status(500).json({ message: 'Server error' });
                            });
                        }
                        res.json({ 
                            message: 'Stock out record deleted and stock quantity updated successfully',
                            updatedQuantity: stockOut.stock_out_quantity
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/stock-out', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            s.id,
            s.spare_part_id,
            p.name,
            p.category,
            s.stock_out_quantity,
            s.stock_out_unit_price,
            s.stock_out_total_price,
            s.stock_out_date
        FROM stock_out s
        JOIN spare_parts p ON s.spare_part_id = p.id
        ORDER BY s.stock_out_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stock out records:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

// Reports routes
app.get('/api/reports/daily-stock-out', authenticateToken, (req, res) => {
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
    const query = `
        SELECT 
            s.id,
            p.name,
            p.category,
            s.stock_out_quantity,
            s.stock_out_unit_price,
            s.stock_out_total_price,
            s.stock_out_date
        FROM stock_out s
        JOIN spare_parts p ON s.spare_part_id = p.id
        WHERE DATE(s.stock_out_date) = ?
        ORDER BY s.stock_out_date DESC
    `;
    
    db.query(query, [selectedDate], (err, results) => {
        if (err) {
            console.error('Error fetching daily stock out:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

app.get('/api/reports/stock-status', authenticateToken, (req, res) => {
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
    const query = `
        SELECT 
            p.id,
            p.name,
            p.category,
            p.quantity as current_quantity,
            COALESCE(si.total_in, 0) as total_stock_in,
            COALESCE(so.total_out, 0) as total_stock_out
        FROM spare_parts p
        LEFT JOIN (
            SELECT spare_part_id, SUM(stock_in_quantity) as total_in
            FROM stock_in
            WHERE DATE(stock_in_date) = ?
            GROUP BY spare_part_id
        ) si ON p.id = si.spare_part_id
        LEFT JOIN (
            SELECT spare_part_id, SUM(stock_out_quantity) as total_out
            FROM stock_out
            WHERE DATE(stock_out_date) = ?
            GROUP BY spare_part_id
        ) so ON p.id = so.spare_part_id
        ORDER BY p.name
    `;
    
    db.query(query, [selectedDate, selectedDate], (err, results) => {
        if (err) {
            console.error('Error fetching stock status:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 