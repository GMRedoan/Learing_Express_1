import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from 'bcryptjs';

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, age, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users(name, email, age, password, role) VALUES($1, $2, $3, $4, COALESCE($5, 'user')) RETURNING *`,
        [name, email, age, hashPassword, role]
    );
    delete result.rows[0].password;
    
    return result;
}

const getAllUsersFromDB = async () => {
    const result = await pool.query(`SELECT * FROM users`);
    return result;
}

const getUserByIdFromDB = async (userId: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    return result;
}

const updateUserByIdInDB = async (userId: string, payload: Partial<IUser>) => {
    const { name, age, password, is_active, role } = payload;
    const result = await pool.query(
        `UPDATE users SET 
        name = COALESCE($1, name), 
        age = COALESCE($2, age), 
        password = COALESCE($3, password), 
        is_active = COALESCE($4, is_active), 
        role = COALESCE($5, role), 
        updated_at = CURRENT_TIMESTAMP WHERE 
        id = $6 RETURNING *`,
        [name, age, password, is_active, role, userId]
    );
    return result;
}

const deleteUserByIdFromDB = async (userId: string) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [userId]);
    return result;
}

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    updateUserByIdInDB,
    deleteUserByIdFromDB
}