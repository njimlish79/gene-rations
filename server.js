const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const usersFile =
    path.join(__dirname, "users.json");


/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());

app.use(express.json());


/* ==========================================
   DATABASE
========================================== */

function loadUsers() {

    if (!fs.existsSync(usersFile)) {

        fs.writeFileSync(
            usersFile,
            "[]"
        );

    }

    try {

        return JSON.parse(
            fs.readFileSync(
                usersFile,
                "utf8"
            )
        );

    } catch (error) {

        return [];

    }

}


function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(
            users,
            null,
            2
        )
    );

}


/* ==========================================
   TEST
========================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Gene-rations backend is running."

    });

});


/* ==========================================
   SIGNUP
========================================== */

app.post(
    "/api/auth/signup",
    async (req, res) => {

        try {

            const {

                fullName,
                email,
                phone,
                dob,
                age,
                gender,
                generation,
                generationBadge,
                generationDescription,
                verificationMethod,
                password

            } = req.body;


            /* -------------------------------
               VALIDATION
            -------------------------------- */

            if (
                !fullName ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name, email and password are required."

                });

            }


            const users =
                loadUsers();


            /* -------------------------------
               CHECK EMAIL
            -------------------------------- */

            const existingUser =
                users.find(
                    user =>
                        user.email.toLowerCase() ===
                        email.toLowerCase()
                );


            if (existingUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists."

                });

            }


            /* -------------------------------
               HASH PASSWORD
            -------------------------------- */

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            /* -------------------------------
               VERIFICATION CODE
            -------------------------------- */

            const verificationCode =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            const verificationExpires =
                Date.now() +
                (10 * 60 * 1000);


            /* -------------------------------
               USER
            -------------------------------- */

            const newUser = {

                id:
                    Date.now().toString(),

                fullName,

                email:
                    email.toLowerCase(),

                phone:
                    phone || "",

                dob:
                    dob || "",

                age:
                    age || null,

                gender:
                    gender || "",

                generation:
                    generation || "",

                generationBadge:
                    generationBadge || "",

                generationDescription:
                    generationDescription || "",

                verificationMethod:
                    verificationMethod || "email",

                passwordHash,

                profilePhoto:
                    "",

                bio:
                    "",

                interests:
                    [],

                hobbies:
                    [],

                skills:
                    [],

                followers:
                    [],

                following:
                    [],

                posts:
                    [],

                communities:
                    [],

                events:
                    [],

                familyMembers:
                    [],

                profileViews:
                    0,

                verified:
                    false,

                verificationCode,

                verificationExpires,

                memberSince:
                    new Date().toISOString(),

                lastActive:
                    null

            };


            users.push(
                newUser
            );


            saveUsers(
                users
            );


            /* -------------------------------
               DEVELOPMENT TEST
            -------------------------------- */

            console.log("");
            console.log(
                "================================"
            );

            console.log(
                "GENE-RATIONS VERIFICATION"
            );

            console.log(
                "User:",
                newUser.fullName
            );

            console.log(
                "Email:",
                newUser.email
            );

            console.log(
                "Method:",
                newUser.verificationMethod
            );

            console.log(
                "CODE:",
                verificationCode
            );

            console.log(
                "================================"
            );

            console.log("");


            /* -------------------------------
               RESPONSE
            -------------------------------- */

            res.status(201).json({

                success: true,

                message:
                    "Account created successfully.",

                userId:
                    newUser.id,

                verificationRequired:
                    true

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* ==========================================
   VERIFY ACCOUNT
========================================== */

app.post(
    "/api/auth/verify",
    (req, res) => {

        try {

            const {
                email,
                code
            } = req.body;


            if (
                !email ||
                !code
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and verification code are required."

                });

            }


            const users =
                loadUsers();


            const user =
                users.find(
                    item =>
                        item.email.toLowerCase() ===
                        email.toLowerCase()
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Account not found."

                });

            }


            /* -------------------------------
               ALREADY VERIFIED
            -------------------------------- */

            if (user.verified) {

                return res.json({

                    success: true,

                    message:
                        "Account is already verified."

                });

            }


            /* -------------------------------
               EXPIRATION
            -------------------------------- */

            if (
                !user.verificationExpires ||
                Date.now() >
                user.verificationExpires
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification code has expired."

                });

            }


            /* -------------------------------
               CODE
            -------------------------------- */

            if (
                String(code).trim() !==
                String(
                    user.verificationCode
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid verification code."

                });

            }


            /* -------------------------------
               VERIFY
            -------------------------------- */

            user.verified =
                true;

            user.verificationCode =
                null;

            user.verificationExpires =
                null;


            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Account verified successfully."

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);

/* ==========================================
   LOGIN
========================================== */

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            /* -------------------------------
               VALIDATION
            -------------------------------- */

            if (!email || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required."

                });

            }


            /* -------------------------------
               FIND USER
            -------------------------------- */

            const users =
                loadUsers();

            const user =
                users.find(
                    item =>
                        item.email.toLowerCase() ===
                        email.toLowerCase()
                );


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."

                });

            }


            /* -------------------------------
               CHECK PASSWORD
            -------------------------------- */

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."

                });

            }


            /* -------------------------------
               CHECK VERIFICATION
            -------------------------------- */

            if (!user.verified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your account first."

                });

            }


            /* -------------------------------
               UPDATE LAST ACTIVE
            -------------------------------- */

            user.lastActive =
                new Date().toISOString();

            saveUsers(users);


            /* -------------------------------
               RESPONSE
            -------------------------------- */

            res.json({

                success: true,

                message:
                    "Login successful.",

                user: {

                    id:
                        user.id,

                    fullName:
                        user.fullName,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    dob:
                        user.dob,

                    age:
                        user.age,

                    gender:
                        user.gender,

                    generation:
                        user.generation,

                    generationBadge:
                        user.generationBadge,

                    generationDescription:
                        user.generationDescription,

                    profilePhoto:
                        user.profilePhoto,

                    bio:
                        user.bio,

                    interests:
                        user.interests,

                    hobbies:
                        user.hobbies,

                    skills:
                        user.skills,

                    memberSince:
                        user.memberSince,

                    lastActive:
                        user.lastActive

                }

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);

/* =====================================================
   SETTINGS
===================================================== */


/* ==========================================
   GET SETTINGS
========================================== */

app.get(
    "/api/settings/:userId",
    (req, res) => {

        const userId =
            req.params.userId;

        const users =
            loadUsers();

        const user =
            users.find(
                u =>
                    String(u.id) ===
                    String(userId)
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User account not found."

            });

        }


        res.json({

            success: true,

            user: user

        });

    }
);


/* ==========================================
   UPDATE PERSONAL INFORMATION PRIVACY
========================================== */

app.put(
    "/api/settings/privacy",
    (req, res) => {

        const {
            userId,
            personalInformationPrivacy
        } = req.body;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }


        if (
            personalInformationPrivacy !==
                "public" &&
            personalInformationPrivacy !==
                "private"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid privacy setting."

            });

        }


        const users =
            loadUsers();


        const index =
            users.findIndex(
                u =>
                    String(u.id) ===
                    String(userId)
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "User account not found."

            });

        }


        users[index]
            .personalInformationPrivacy =
                personalInformationPrivacy;


        users[index]
            .privacyUpdatedAt =
                new Date()
                    .toISOString();


        saveUsers(users);


        res.json({

            success: true,

            message:
                "Privacy setting updated successfully.",

            user:
                users[index]

        });

    }
);


/* ==========================================
   DEACTIVATE ACCOUNT
========================================== */

app.put(
    "/api/settings/deactivate",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users =
            loadUsers();


        const index =
            users.findIndex(
                u =>
                    String(u.id) ===
                    String(userId)
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "User account not found."

            });

        }


        users[index]
            .accountStatus =
                "deactivated";


        users[index]
            .deactivatedAt =
                new Date()
                    .toISOString();


        saveUsers(users);


        res.json({

            success: true,

            message:
                "Account deactivated successfully."

        });

    }
);


/* ==========================================
   DELETE ACCOUNT
========================================== */

app.delete(
    "/api/settings/delete",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users =
            loadUsers();


        const index =
            users.findIndex(
                u =>
                    String(u.id) ===
                    String(userId)
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "User account not found."

            });

        }


        /*
           For now we mark the account
           as deleted instead of immediately
           destroying the record.

           This allows the future dormant/
           reactivation architecture to be
           implemented safely.
        */

        users[index]
            .accountStatus =
                "deleted";


        users[index]
            .deletedAt =
                new Date()
                    .toISOString();


        saveUsers(users);


        res.json({

            success: true,

            message:
                "Account deletion process started."

        });

    }
);


/* ==========================================
   LOGOUT
========================================== */

app.post(
    "/api/auth/logout",
    (req, res) => {

        /*
           Current frontend uses local
           loginSession for the browser session.

           This endpoint gives us a proper
           backend location for future
           server-side session/token handling.
        */

        res.json({

            success: true,

            message:
                "Logged out successfully."

        });

    }
);

/* ==========================================
   START SERVER
========================================== */

app.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            "Gene-rations Backend"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            "================================"
        );

    }
);