import { Router } from "express";
import { createUser, deleteUserById, getAllUsers, getUserById, updateUserById } from "./user.controller";
import { authMiddleware } from "../../middleware/auth";
import { User_Roles } from "../../types";

// send connection for connect to app.ts
const router = Router()
 
router.post('/', createUser);

router.get('/', authMiddleware(User_Roles.admin, User_Roles.agent, User_Roles.user), getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUserById);

router.delete('/:id', deleteUserById);

export const userRoute = router