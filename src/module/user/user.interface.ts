export interface IUser {
    id: number,
    name: string,
    email: string,
    password: string,
    is_active?: boolean,
    age: number,
    created_at: Date,
    updated_at: Date
}