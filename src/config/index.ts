import dotenv from "dotenv"
import { access } from "fs"
import path from "path"

dotenv.config({
    path : path.join(process.cwd(), '.env')
})

const config = {
    connection_string: process.env.CONNECTION_STRING as string,
    port: process.env.PORT,
    secret : process.env.JWT_SECRET_KEY as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET_KEY as string,
    access_token_expire_time: process.env.ACCESS_TOKEN_EXPIRE_TIME as string,
    refresh_token_expire_time: process.env.REFRESH_TOKEN_EXPIRE_TIME as string
}

export default config