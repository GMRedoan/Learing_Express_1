import type { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body)
        // set refresh token in cookie
        const { refreshToken } = result
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // set to true in production
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const result = await authService.generateRefreshToken(req.cookies.refreshToken)

         res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

export const authController = {
    loginUser,
    refreshToken
}