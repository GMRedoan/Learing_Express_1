import { pool } from "../../db";
import type { IProfile } from "./profile.interface";

const createProfileInDB = async (payload: IProfile) => {
    const { user_id, bio, address, phone, gender } = payload;

    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    if (user.rowCount === 0) {
        throw new Error('User not found');
    }

    const result = await pool.query(
        `INSERT INTO profiles(user_id, bio, address, phone, gender) VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, bio, address, phone, gender]
    );
    return result;
}

const getAllProfilesFromDB = async () => {
    const result = await pool.query(`SELECT * FROM profiles`);
    return result;
}

const getProfileByIdFromDB = async (id: string) => {
    const result = await pool.query(`SELECT * FROM profiles WHERE id = $1`, [id]);
    return result;
}

const updateProfileInDB = async (id: string, payload: IProfile) => {
    const { user_id,  bio, address, phone, gender } = payload;

    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    if (user.rowCount === 0) {
        throw new Error('User not found');
    }

    const result = await pool.query(
        `UPDATE profiles SET user_id = $1, bio = $2, address = $3, phone = $4, gender = $5 WHERE id = $6 RETURNING *`,
        [user_id, bio, address, phone, gender, id]
    );
    return result;
}

const deleteProfileFromDB = async (id: string) => {
    const result = await pool.query(`DELETE FROM profiles WHERE id = $1 RETURNING *`, [id]);
    return result;
}

export const profileService = {
    createProfileInDB,
    getAllProfilesFromDB,
    getProfileByIdFromDB,
    updateProfileInDB,
    deleteProfileFromDB,
}   