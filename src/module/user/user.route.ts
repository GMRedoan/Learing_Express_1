import { Router } from "express";
import { createUser, deleteUserById, getAllUsers, getUserById, updateUserById } from "./user.controller";

// send connection for connect to app.ts
const router = Router()

router.post('/', createUser);

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUserById);

router.delete('/:id', deleteUserById);

export const userRoute = router