export const User_Roles = { 
    "admin": "admin", 
    "agent": "agent", 
    "user": "user"
 } as const;

 export type Roles = "admin" | "agent" | "user";