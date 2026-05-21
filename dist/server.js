
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/module/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  secret: process.env.JWT_SECRET_KEY,
  refresh_secret: process.env.JWT_REFRESH_SECRET_KEY
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            age INT,
            role VARCHAR(20) DEFAULT 'user',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles(
            id SERIAL PRIMARY KEY,
            user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

            bio TEXT,
            address TEXT,
            phone VARCHAR(20),
            gender VARCHAR(10),
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             )
        `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// src/module/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, age, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users(name, email, age, password, role) VALUES($1, $2, $3, $4, COALESCE($5, 'user')) RETURNING *`,
    [name, email, age, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};
var getUserByIdFromDB = async (userId) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
  return result;
};
var updateUserByIdInDB = async (userId, payload) => {
  const { name, age, password, is_active, role } = payload;
  const result = await pool.query(
    `UPDATE users SET 
        name = COALESCE($1, name), 
        age = COALESCE($2, age), 
        password = COALESCE($3, password), 
        is_active = COALESCE($4, is_active), 
        role = COALESCE($5, role), 
        updated_at = CURRENT_TIMESTAMP WHERE 
        id = $6 RETURNING *`,
    [name, age, password, is_active, role, userId]
  );
  return result;
};
var deleteUserByIdFromDB = async (userId) => {
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [userId]);
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserByIdInDB,
  deleteUserByIdFromDB
};

// src/module/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  console.log("From controller", req.user);
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error
    });
  }
};
var getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await userService.getUserByIdFromDB(userId);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error retrieving user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error
    });
  }
};
var updateUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await userService.updateUserByIdInDB(userId, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error
    });
  }
};
var deleteUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await userService.deleteUserByIdFromDB(userId);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error
    });
  }
};

// src/middleware/auth.ts
import "express";
import jwt from "jsonwebtoken";
var authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access !!"
        });
      }
      ;
      const decoded = jwt.verify(token, config_default.secret);
      const userData = await pool.query("SELECT * FROM users WHERE email = $1", [decoded.email]);
      if (userData.rowCount === 0) {
        res.status(404).json({
          success: false,
          message: "User not found !!"
        });
      }
      const user = userData.rows[0];
      if (user.is_active === false) {
        res.status(403).json({
          success: false,
          message: "Forbidden !!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden !!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/types/index.ts
var User_Roles = {
  "admin": "admin",
  "agent": "agent",
  "user": "user"
};

// src/module/user/user.route.ts
var router = Router();
router.post("/", createUser);
router.get("/", authMiddleware(User_Roles.admin, User_Roles.agent, User_Roles.user), getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);
var userRoute = router;

// src/module/profile/profile.route.ts
import { Router as Router2 } from "express";

// src/module/profile/profile.service.ts
var createProfileInDB = async (payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
  if (user.rowCount === 0) {
    throw new Error("User not found");
  }
  const result = await pool.query(
    `INSERT INTO profiles(user_id, bio, address, phone, gender) VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, bio, address, phone, gender]
  );
  return result;
};
var getAllProfilesFromDB = async () => {
  const result = await pool.query(`SELECT * FROM profiles`);
  return result;
};
var getProfileByIdFromDB = async (id) => {
  const result = await pool.query(`SELECT * FROM profiles WHERE id = $1`, [id]);
  return result;
};
var updateProfileInDB = async (id, payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
  if (user.rowCount === 0) {
    throw new Error("User not found");
  }
  const result = await pool.query(
    `UPDATE profiles SET user_id = $1, bio = $2, address = $3, phone = $4, gender = $5 WHERE id = $6 RETURNING *`,
    [user_id, bio, address, phone, gender, id]
  );
  return result;
};
var deleteProfileFromDB = async (id) => {
  const result = await pool.query(`DELETE FROM profiles WHERE id = $1 RETURNING *`, [id]);
  return result;
};
var profileService = {
  createProfileInDB,
  getAllProfilesFromDB,
  getProfileByIdFromDB,
  updateProfileInDB,
  deleteProfileFromDB
};

// src/module/profile/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileInDB(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating profile",
      error
    });
  }
};
var getAllProfiles = async (req, res) => {
  try {
    const result = await profileService.getAllProfilesFromDB();
    res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    console.error("Error retrieving profiles:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving profiles",
      error
    });
  }
};
var getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await profileService.getProfileByIdFromDB(id);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error retrieving profile:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await profileService.updateProfileInDB(id, req.body);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await profileService.deleteProfileFromDB(id);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting profile:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var profileController = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
};

// src/module/profile/profile.route.ts
var router2 = Router2();
router2.post("/", profileController.createProfile);
router2.get("/", profileController.getAllProfiles);
router2.get("/:id", profileController.getProfileById);
router2.put("/:id", profileController.updateProfile);
router2.delete("/:id", profileController.deleteProfile);
var profileRoute = router2;

// src/module/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/module/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid email or password");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  const refreshToken2 = jwt2.sign(jwtPayload, config_default.refresh_secret, { expiresIn: "7d" });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access !!");
  }
  ;
  const decoded = jwt2.verify(token, config_default.refresh_secret);
  const userData = await pool.query("SELECT * FROM users WHERE email = $1", [decoded.email]);
  if (userData.rowCount === 0) {
    throw new Error("User not found !!");
  }
  const user = userData.rows[0];
  if (user.is_active === false) {
    throw new Error("Forbidden !!");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return { accessToken };
};
var authService = {
  loginUserIntoDB,
  generateRefreshToken
};

// src/module/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      httpOnly: true,
      secure: false,
      // set to true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/module/auth/auth.route.ts
var route = Router3();
route.post("/login", authController.loginUser);
route.post("/refresh-token", authController.refreshToken);
var authRoute = route;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} Time -> ${(/* @__PURE__ */ new Date()).toLocaleTimeString()} URL -> ${req.url} 
`;
  fs.appendFile("server.log", log, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globerErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
    error: err.message
  });
};
var globerErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cors({
  origin: "http://localhost:3000"
}));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Express server is running",
    author: "Redoan"
  });
});
app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);
app.use("/api/auth", authRoute);
app.use(globerErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(3e3, () => {
    console.log("Server is running on port 3000");
  });
};
main();
//# sourceMappingURL=server.js.map