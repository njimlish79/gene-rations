const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const usersFile =
    path.join(__dirname, "users.json");


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);


/* =====================================================
   DATABASE
===================================================== */

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

        console.error(
            "Unable to read users.json:",
            error
        );

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


/* =====================================================
   GENERATION CALCULATION
===================================================== */

function calculateAge(dob) {

    if (!dob) {

        return null;

    }

    const birthDate =
        new Date(dob);

    const today =
        new Date();


    if (
        isNaN(
            birthDate.getTime()
        )
    ) {

        return null;

    }


    let age =
        today.getFullYear() -
        birthDate.getFullYear();


    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();


    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {

        age--;

    }


    return age;

}


function determineGeneration(age) {

    if (
        age === null ||
        age < 0
    ) {

        return null;

    }


    if (age >= 65) {

        return "Silent Generation";

    }


    if (age >= 45) {

        return "Generation X";

    }


    if (age >= 29) {

        return "Millennial";

    }


    if (age >= 13) {

        return "Generation Z";

    }


    return "Generation Alpha";

}


/* =====================================================
   GENERATION BADGE
===================================================== */

function getGenerationBadge(generation) {

    const badges = {

        "Generation Alpha":
            "🧬 Alpha",

        "Generation Z":
            "⚡ Gen Z",

        "Millennial":
            "🌍 Millennial",

        "Generation X":
            "🔥 Gen X",

        "Baby Boomer":
            "🏆 Boomer",

        "Silent Generation":
            "⭐ Silent"

    };


    return (
        badges[generation] ||
        `🏷️ ${generation || "Gene-rations"}`
    );

}


/* =====================================================
   GENERATION DESCRIPTION
===================================================== */

function getGenerationDescription(
    generation
) {

    return (
        `Welcome to the ${generation} community.`
    );

}


/* =====================================================
   UPDATE CALCULATED USER DATA
===================================================== */

function refreshGenerationData(user) {

    if (!user.dob) {

        return;

    }


    const age =
        calculateAge(
            user.dob
        );


    const generation =
        determineGeneration(
            age
        );


    if (age !== null) {

        user.age =
            age;

    }


    if (generation) {

        user.generation =
            generation;

        user.generationBadge =
            getGenerationBadge(
                generation
            );

        user.generationDescription =
            getGenerationDescription(
                generation
            );

    }

}


/* =====================================================
   NAME CHANGE HELPERS
===================================================== */

function cleanNameHistory(user) {

    if (
        !Array.isArray(
            user.nameChangeHistory
        )
    ) {

        user.nameChangeHistory = [];

    }


    const sixMonthsAgo =
        Date.now() -
        (
            183 *
            24 *
            60 *
            60 *
            1000
        );


    user.nameChangeHistory =
        user.nameChangeHistory.filter(
            timestamp =>
                timestamp >=
                sixMonthsAgo
        );

}


function canRequestNameChange(user) {

    cleanNameHistory(user);


    return (
        user.nameChangeHistory.length <
        2
    );

}


/* =====================================================
   DORMANT ACCOUNT CHECK
===================================================== */

function checkDormantStatus(user) {

    if (!user.verified) {

        return false;

    }


    const lastActivity =
        user.lastActive
        ? new Date(
            user.lastActive
        ).getTime()
        : new Date(
            user.memberSince
        ).getTime();


    const sixMonths =
        183 *
        24 *
        60 *
        60 *
        1000;


    if (
        Date.now() -
        lastActivity >
        sixMonths
    ) {

        user.dormant = true;

        return true;

    }


    return !!user.dormant;

}


/* =====================================================
   PUBLIC USER DATA
   NEVER SEND PASSWORD HASH
===================================================== */

function publicUser(user) {

    refreshGenerationData(user);


    return {

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

        followers:
            user.followers,

        following:
            user.following,

        posts:
            user.posts,

        communities:
            user.communities,

        events:
            user.events,

        familyMembers:
            user.familyMembers,

        profileViews:
            user.profileViews,

        verified:
            user.verified,

        memberSince:
            user.memberSince,

        lastActive:
            user.lastActive,

        dormant:
            !!user.dormant,

        accountVisibility:
            "public",

        personalInfoVisibility:
            user.personalInfoVisibility ||
            "private",

        nameChangeHistory:
            user.nameChangeHistory || [],

        pendingNameChange:
            user.pendingNameChange || null

    };

}


/* =====================================================
   TEST BACKEND
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Gene-rations backend is running."

        });

    }
);


/* =====================================================
   SIGNUP
===================================================== */

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


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

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


            /* -----------------------------------------
               EMAIL MUST BE UNIQUE
            ----------------------------------------- */

            const existingEmail =
                users.find(
                    user =>
                        user.email &&
                        user.email.toLowerCase() ===
                        email.toLowerCase()
                );


            if (existingEmail) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists."

                });

            }


            /* -----------------------------------------
               PHONE MUST ALSO BE UNIQUE
            ----------------------------------------- */

            if (phone) {

                const existingPhone =
                    users.find(
                        user =>
                            user.phone &&
                            user.phone === phone
                    );


                if (existingPhone) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "An account with this phone number already exists."

                    });

                }

            }


            /* -----------------------------------------
               CALCULATE GENERATION FROM DOB
            ----------------------------------------- */

            const calculatedAge =
                calculateAge(
                    dob
                );


            const calculatedGeneration =
                determineGeneration(
                    calculatedAge
                );


            const finalGeneration =
                calculatedGeneration ||
                generation ||
                "";


            const finalBadge =
                getGenerationBadge(
                    finalGeneration
                );


            /* -----------------------------------------
               PASSWORD HASH
            ----------------------------------------- */

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            /* -----------------------------------------
               VERIFICATION
            ----------------------------------------- */

            const verificationCode =
                Math.floor(
                    100000 +
                    Math.random() *
                    900000
                ).toString();


            const verificationExpires =
                Date.now() +
                (
                    10 *
                    60 *
                    1000
                );


            /* -----------------------------------------
               USER
            ----------------------------------------- */

            const newUser = {

                id:
                    Date.now().toString(),

                fullName:
                    fullName.trim(),

                email:
                    email.trim().toLowerCase(),

                phone:
                    phone || "",

                dob:
                    dob || "",

                age:
                    calculatedAge,

                gender:
                    gender || "",

                generation:
                    finalGeneration,

                generationBadge:
                    finalBadge,

                generationDescription:
                    getGenerationDescription(
                        finalGeneration
                    ),

                verificationMethod:
                    verificationMethod ||
                    "email",

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
                    null,

                dormant:
                    false,

                accountVisibility:
                    "public",

                personalInfoVisibility:
                    "private",

                nameChangeHistory:
                    [],

                pendingNameChange:
                    null

            };


            users.push(
                newUser
            );


            saveUsers(
                users
            );


            /* -----------------------------------------
               DEVELOPMENT VERIFICATION CODE
            ----------------------------------------- */

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

            console.error(
                "Signup error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   VERIFY ACCOUNT
===================================================== */

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
                        item.email &&
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


            /* -----------------------------------------
               ALREADY VERIFIED
            ----------------------------------------- */

            if (user.verified) {

                return res.json({

                    success: true,

                    message:
                        "Account is already verified."

                });

            }


            /* -----------------------------------------
               CODE EXPIRATION
            ----------------------------------------- */

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


            /* -----------------------------------------
               CODE CHECK
            ----------------------------------------- */

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


            /* -----------------------------------------
               VERIFY
            ----------------------------------------- */

            user.verified =
                true;

            user.dormant =
                false;

            user.verificationCode =
                null;

            user.verificationExpires =
                null;

            user.lastActive =
                new Date().toISOString();


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

            console.error(
                "Verification error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required."

                });

            }


            const users =
                loadUsers();


            const user =
                users.find(
                    item =>
                        item.email &&
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


            /* -----------------------------------------
               PASSWORD
            ----------------------------------------- */

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


            /* -----------------------------------------
               VERIFICATION
            ----------------------------------------- */

            if (!user.verified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your account first."

                });

            }


            /* -----------------------------------------
               DORMANT CHECK
            ----------------------------------------- */

            if (
                checkDormantStatus(
                    user
                )
            ) {

                saveUsers(
                    users
                );


                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Your account is dormant because it has been inactive for more than 6 months. Verification is required to reactivate your account."

                });

            }


            /* -----------------------------------------
               APPLY PENDING NAME IF READY
            ----------------------------------------- */

            if (
                user.pendingNameChange &&
                Date.now() >=
                user.pendingNameChange.effectiveAt
            ) {

                cleanNameHistory(
                    user
                );


                user.fullName =
                    user.pendingNameChange.name;


                user.nameChangeHistory.push(
                    Date.now()
                );


                user.pendingNameChange =
                    null;

            }


            /* -----------------------------------------
               REFRESH GENERATION
            ----------------------------------------- */

            refreshGenerationData(
                user
            );


            /* -----------------------------------------
               ACTIVE
            ----------------------------------------- */

            user.lastActive =
                new Date().toISOString();

            user.dormant =
                false;


            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Login successful.",

                user:
                    publicUser(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   GET CURRENT USER
===================================================== */

app.get(
    "/api/user/:userId",
    (req, res) => {

        try {

            const users =
                loadUsers();


            const user =
                users.find(
                    item =>
                        item.id ===
                        req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            if (
                checkDormantStatus(
                    user
                )
            ) {

                saveUsers(
                    users
                );


                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Account is dormant."

                });

            }


            refreshGenerationData(
                user
            );


            saveUsers(
                users
            );


            res.json({

                success: true,

                user:
                    publicUser(
                        user
                    )

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
   UPDATE PROFILE SETTINGS
===================================================== */

app.patch(
    "/api/user/:userId/settings",
    (req, res) => {

        try {

            const users =
                loadUsers();


            const user =
                users.find(
                    item =>
                        item.id ===
                        req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            /* -----------------------------------------
               DORMANT
            ----------------------------------------- */

            if (
                checkDormantStatus(
                    user
                )
            ) {

                saveUsers(
                    users
                );


                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Dormant accounts must be reactivated through verification."

                });

            }


            /* -----------------------------------------
               EMAIL IS PERMANENT
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "email"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address is permanent and cannot be changed."

                });

            }


            /* -----------------------------------------
               PHONE IS PERMANENT
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "phone"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone number is permanent and cannot be changed."

                });

            }


            /* -----------------------------------------
               DOB IS PERMANENT
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "dob"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Date of birth is permanent and cannot be changed."

                });

            }


            /* -----------------------------------------
               AGE CANNOT BE EDITED
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "age"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Age is calculated automatically from your date of birth."

                });

            }


            /* -----------------------------------------
               GENERATION CANNOT BE EDITED
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "generation"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Generation is calculated automatically from your date of birth."

                });

            }


            /* -----------------------------------------
               GENERATION BADGE CANNOT BE EDITED
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "generationBadge"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Generation badge is calculated automatically."

                });

            }


            /* -----------------------------------------
               FULL NAME
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "fullName"
                )
            ) {

                const newName =
                    String(
                        req.body.fullName
                    ).trim();


                if (
                    newName.length < 2
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Please enter a valid full name."

                    });

                }


                if (
                    newName ===
                    user.fullName
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This is already your current name."

                    });

                }


                if (
                    user.pendingNameChange
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "You already have a name change waiting to take effect."

                    });

                }


                if (
                    !canRequestNameChange(
                        user
                    )
                ) {

                    return res.status(429).json({

                        success: false,

                        message:
                            "You have reached the maximum of 2 name changes within 6 months."

                    });

                }


                user.pendingNameChange = {

                    name:
                        newName,

                    requestedAt:
                        new Date().toISOString(),

                    effectiveAt:
                        Date.now() +
                        (
                            24 *
                            60 *
                            60 *
                            1000
                        )

                };

            }


            /* -----------------------------------------
               BIO
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "bio"
                )
            ) {

                user.bio =
                    String(
                        req.body.bio
                    ).trim();

            }


            /* -----------------------------------------
               HOBBIES
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "hobbies"
                )
            ) {

                if (
                    !Array.isArray(
                        req.body.hobbies
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Hobbies must be an array."

                    });

                }


                user.hobbies =
                    req.body.hobbies;

            }


            /* -----------------------------------------
               SKILLS
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "skills"
                )
            ) {

                if (
                    !Array.isArray(
                        req.body.skills
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Skills must be an array."

                    });

                }


                user.skills =
                    req.body.skills;

            }


            /* -----------------------------------------
               PERSONAL INFORMATION VISIBILITY
            ----------------------------------------- */

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "personalInfoVisibility"
                )
            ) {

                const visibility =
                    req.body.personalInfoVisibility;


                if (
                    visibility !== "public" &&
                    visibility !== "private"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Personal information visibility must be public or private."

                    });

                }


                user.personalInfoVisibility =
                    visibility;

            }


            /* -----------------------------------------
               ACCOUNT ALWAYS PUBLIC
            ----------------------------------------- */

            user.accountVisibility =
                "public";


            /* -----------------------------------------
               GENERATION ALWAYS RECALCULATED
            ----------------------------------------- */

            refreshGenerationData(
                user
            );


            user.lastActive =
                new Date().toISOString();


            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Settings updated successfully.",

                user:
                    publicUser(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "Settings update error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   PROFILE PHOTO
===================================================== */

app.patch(
    "/api/user/:userId/profile-photo",
    (req, res) => {

        try {

            const {
                profilePhoto
            } = req.body;


            const users =
                loadUsers();


            const user =
                users.find(
                    item =>
                        item.id ===
                        req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            if (
                checkDormantStatus(
                    user
                )
            ) {

                saveUsers(
                    users
                );


                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Dormant accounts must be reactivated first."

                });

            }


            if (
                typeof profilePhoto !==
                "string"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid profile photo."

                });

            }


            user.profilePhoto =
                profilePhoto;


            user.lastActive =
                new Date().toISOString();


            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Profile photo updated successfully.",

                user:
                    publicUser(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "Profile photo error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   REACTIVATE DORMANT ACCOUNT
===================================================== */

app.post(
    "/api/auth/reactivate",
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
                        item.email &&
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


            if (
                user.verificationExpires &&
                Date.now() >
                user.verificationExpires
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification code has expired."

                });

            }


            user.dormant =
                false;

            user.verified =
                true;

            user.verificationCode =
                null;

            user.verificationExpires =
                null;

            user.lastActive =
                new Date().toISOString();


            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Account reactivated successfully.",

                user:
                    publicUser(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "Reactivation error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

app.post(
    "/api/auth/logout",
    (req, res) => {

        try {

            const {
                userId
            } = req.body;


            if (userId) {

                const users =
                    loadUsers();


                const user =
                    users.find(
                        item =>
                            item.id ===
                            userId
                    );


                if (user) {

                    user.lastActive =
                        new Date().toISOString();


                    saveUsers(
                        users
                    );

                }

            }


            res.json({

                success: true,

                message:
                    "Logged out successfully."

            });

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);


/* =====================================================
   START SERVER
===================================================== */

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
            "Milestone 4 Account Rules Active"
        );

        console.log(
            "================================"
        );

    }
);