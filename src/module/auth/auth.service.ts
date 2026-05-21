import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { ILoginUser } from "./auth.interface"
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userData.rows.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = userData.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        throw new Error('Invalid email or password');
    }

    // generate token
    const jwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        is_active: user.is_active
    }

    const accessToken = jwt.sign(jwtPayload, config.secret, { expiresIn: '1d' });

    const refreshToken = jwt.sign(jwtPayload, config.refresh_secret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
 }

    const generateRefreshToken = async (token: string) => {

        if (!token) {
            throw new Error('Unauthorized access !!')
         };
        const decoded = jwt.verify(token as string, config.refresh_secret as string) as JwtPayload

        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [decoded.email])

        if (userData.rowCount === 0) {
            throw new Error('User not found !!')
         }
        const user = userData.rows[0]

        if (user.is_active === false) {
            throw new Error('Forbidden !!')
         }
        const jwtPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            is_active: user.is_active
        }

        const accessToken = jwt.sign(jwtPayload, config.secret, { expiresIn: '1d' });

        return { accessToken };
     }
 export const authService = {
    loginUserIntoDB,
    generateRefreshToken
}