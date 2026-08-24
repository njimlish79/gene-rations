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