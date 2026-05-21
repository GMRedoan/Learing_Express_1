import dotenv from "dotenv"
import { access } from "fs"
import path from "path"

dotenv.config({
    path : path.join(process.cwd(), '.env')
})

const config = {
    connection_string: process.env.CONNECTION_STRING as string,
    secret : process.env.JWT_SECRET_KEY as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET_KEY as string,
}

export default config