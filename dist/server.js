import express, {} from 'express';
import { Pool } from 'pg';
import config from './config';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const pool = new Pool({
    connectionString: config.connection_string
});
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(50) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            age INT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
};
initDB();
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Express server is running',
        author: 'Redoan'
    });
});
// create user
app.post('/api/users', async (req, res) => {
    const { name, email, age, password } = req.body;
    try {
        const result = await pool.query(`INSERT INTO users(name, email, age, password) VALUES($1, $2, $3, $4) RETURNING *`, [name, email, age, password]);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error
        });
    }
});
// get all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users`);
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users',
            error: error
        });
    }
});
// get single user by id
app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error retrieving user:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error
        });
    }
});
// update single user by id
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, age, password, is_active } = req.body;
    try {
        const result = await pool.query(`UPDATE users SET 
            name = COALESCE($1, name), 
            age = COALESCE($2, age), 
            password = COALESCE($3, password), 
            is_active = COALESCE($4, is_active), 
            updated_at = CURRENT_TIMESTAMP WHERE 
            id = $5 RETURNING *`, [name, age, password, is_active, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error
        });
    }
});
// delete single user by id
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error
        });
    }
});
app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
});
//# sourceMappingURL=server.js.map