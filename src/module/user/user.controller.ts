import type { Request, Response } from "express";
import { userService } from "./user.service";

// create user
export const createUser = async (req: Request, res: Response) => {

    try {
        const result = await userService.createUserIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error creating user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error
        })
    }
}

// get all users
export const getAllUsers =  async (req: Request, res: Response) => {
    console.log("From controller",req.user)
    try {
        const result = await userService.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.rows
        })
    } catch (error: any) {
        console.error('Error retrieving users:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error retrieving users',
            error: error
        })
    }
}

// get single user by id
export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const result = await userService.getUserByIdFromDB(userId as string);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error retrieving user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error
        })
    }
}

// update single user by id
export const updateUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const result = await userService.updateUserByIdInDB(userId as string, req.body);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error updating user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error
        })
    }
}

// delete single user by id
export const deleteUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const result = await userService.deleteUserByIdFromDB(userId as string);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error deleting user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error
        })
    }
}