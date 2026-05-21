import dotenv from "dotenv";
import { access } from "fs";
import path from "path";
dotenv.config({
    path: path.join(process.cwd(), '.env')
});
const config = {
    connection_string: process.env.CONNECTION_STRING,
    port: process.env.PORT,
    secret: process.env.JWT_SECRET_KEY,
    refresh_secret: process.env.JWT_REFRESH_SECRET_KEY,
    access_token_expire_time: process.env.ACCESS_TOKEN_EXPIRE_TIME,
    refresh_token_expire_time: process.env.REFRESH_TOKEN_EXPIRE_TIME
};
export default config;
//# sourceMappingURL=index.js.map