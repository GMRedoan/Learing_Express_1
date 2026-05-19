import type { Request, Response } from "express";
import { profileService } from "./profile.service";
 
const createProfile = async (req: Request, res: Response) => {
 
    try {
        const result = await profileService.createProfileInDB(req.body);
        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error creating profile:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error creating profile',
            error: error
        })
    }
}

const getAllProfiles = async (req: Request, res: Response) => {
    try {
        const result = await profileService.getAllProfilesFromDB();
        res.status(200).json({
            success: true,
            message: 'Profiles retrieved successfully',
            data: result.rows
        })
    } catch (error: any) {
        console.error('Error retrieving profiles:', error.message)
        res.status(500).json({
            success: false,
            message: 'Error retrieving profiles',
            error: error
        })
    }
}

const getProfileById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await profileService.getProfileByIdFromDB(id as string);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error retrieving profile:', error.message)
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const updateProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {        
        const result = await profileService.updateProfileInDB(id as string, req.body);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error updating profile:', error.message)
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const deleteProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await profileService.deleteProfileFromDB(id as string);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Error deleting profile:', error.message)
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}


export const profileController = {
    createProfile,
    getAllProfiles,
    getProfileById,
    updateProfile,
    deleteProfile
}