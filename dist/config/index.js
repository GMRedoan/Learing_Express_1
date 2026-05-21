import dotenv from "dotenv";
import { access } from "fs";
import path from "path";
dotenv.config({
    path: path.join(process.cwd(), '.env')
});
const config = {
    connection_string: process.env.CONNECTION_STRING,
    secret: process.env.JWT_SECRET_KEY,
    refresh_secret: process.env.JWT_REFRESH_SECRET_KEY,
};
export default config;
//# sourceMappingURL=index.js.map