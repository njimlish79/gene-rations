const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const usersFile =
    path.join(__dirname, "users.json");

const postsFile =
    path.join(__dirname, "posts.json");


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
            "[]",
            "utf8"
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
        ),
        "utf8"
    );
}


/* =====================================================
   POSTS DATABASE
===================================================== */

function loadPosts() {

    if (!fs.existsSync(postsFile)) {

        fs.writeFileSync(
            postsFile,
            "[]",
            "utf8"
        );
    }

    try {

        return JSON.parse(
            fs.readFileSync(
                postsFile,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Unable to read posts.json:",
            error
        );

        return [];
    }
}


function savePosts(posts) {

    fs.writeFileSync(
        postsFile,
        JSON.stringify(
            posts,
            null,
            2
        ),
        "utf8"
    );
}


/* =====================================================
   AGE
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


/* =====================================================
   GENERATION
===================================================== */

function determineGeneration(age) {

    if (
        age === null ||
        age === undefined ||
        age < 0
    ) {
        return "";
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


function getGenerationBadge(
    generation
) {

    const badges = {

        "Silent Generation":
            "🏅 Silent Generation",

        "Generation X":
            "❌ Generation X",

        "Millennial":
            "🌟 Millennial",

        "Generation Z":
            "⚡ Generation Z",

        "Generation Alpha":
            "🚀 Generation Alpha"
    };

    return (
        badges[generation] ||
        "🏷️ Gene-rations"
    );
}


function getGenerationDescription(
    generation
) {

    const descriptions = {

        "Silent Generation":
            "A generation known for resilience, experience and wisdom.",

        "Generation X":
            "A generation known for independence, adaptability and practical thinking.",

        "Millennial":
            "A generation shaped by technology, creativity and social change.",

        "Generation Z":
            "A digitally connected generation focused on creativity, identity and new possibilities.",

        "Generation Alpha":
            "A generation growing up in a highly connected and technology-driven world."
    };

    return (
        descriptions[generation] ||
        "Your generation is calculated automatically from your date of birth."
    );
}


function refreshGenerationData(user) {

    const age =
        calculateAge(
            user.dob
        );

    const generation =
        determineGeneration(
            age
        );

    user.age =
        age;

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


/* =====================================================
   NAME CHANGE
===================================================== */

function cleanNameHistory(user) {

    if (
        !Array.isArray(
            user.nameChangeHistory
        )
    ) {
        user.nameChangeHistory = [];
    }

    const sixMonths =
        183 *
        24 *
        60 *
        60 *
        1000;

    const cutoff =
        Date.now() -
        sixMonths;

    user.nameChangeHistory =
        user.nameChangeHistory.filter(
            timestamp =>
                timestamp >= cutoff
        );
}


function canRequestNameChange(user) {

    cleanNameHistory(user);

    return (
        user.nameChangeHistory.length < 2
    );
}


function applyPendingNameChange(user) {

    if (
        !user.pendingNameChange
    ) {
        return false;
    }

    if (
        Date.now() <
        user.pendingNameChange.effectiveAt
    ) {
        return false;
    }

    cleanNameHistory(user);

    user.fullName =
        user.pendingNameChange.name;

    user.nameChangeHistory.push(
        Date.now()
    );

    user.pendingNameChange =
        null;

    return true;
}


/* =====================================================
   DORMANT ACCOUNT
===================================================== */

function checkDormantStatus(user) {

    if (
        !user.verified
    ) {
        return false;
    }

    if (
        !user.lastActive
    ) {
        return false;
    }

    const sixMonths =
        183 *
        24 *
        60 *
        60 *
        1000;

    const inactive =
        Date.now() -
        new Date(
            user.lastActive
        ).getTime();

    if (
        inactive >
        sixMonths
    ) {

        user.dormant =
            true;

        return true;
    }

    return !!user.dormant;
}


/* =====================================================
   PUBLIC USER
===================================================== */

function publicUser(user) {

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

        country:
            user.country || "",

        gender:
            user.gender || "",

        generation:
            user.generation,

        generationBadge:
            user.generationBadge,

        generationDescription:
            user.generationDescription,

        profilePhoto:
            user.profilePhoto || "",

        bio:
            user.bio || "",

        interests:
            Array.isArray(
                user.interests
            )
                ? user.interests
                : [],

        hobbies:
            Array.isArray(
                user.hobbies
            )
                ? user.hobbies
                : [],

        skills:
            Array.isArray(
                user.skills
            )
                ? user.skills
                : [],

        followers:
            Array.isArray(
                user.followers
            )
                ? user.followers.length
                : 0,

        following:
            Array.isArray(
                user.following
            )
                ? user.following.length
                : 0,

        posts:
            Array.isArray(
                user.posts
            )
                ? user.posts
                : [],

        communities:
            Array.isArray(
                user.communities
            )
                ? user.communities
                : [],

        events:
            Array.isArray(
                user.events
            )
                ? user.events
                : [],

        familyMembers:
            Array.isArray(
                user.familyMembers
            )
                ? user.familyMembers
                : [],

        profileViews:
            user.profileViews || 0,

        verified:
            !!user.verified,

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
            "public",

        nameChangeHistory:
            user.nameChangeHistory || [],

        pendingNameChange:
            user.pendingNameChange || null
    };
}


/* =====================================================
   HOME / SERVER TEST
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
   SIGN UP
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
                country,
                generation,
                generationBadge,
                generationDescription,
                verificationMethod,
                password
            } = req.body;

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

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const emailExists =
                users.some(
                    user =>
                        user.email ===
                        normalizedEmail
                );

            if (emailExists) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists."
                });
            }

            if (phone) {

                const phoneExists =
                    users.some(
                        user =>
                            user.phone ===
                            phone
                    );

                if (phoneExists) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "An account with this phone number already exists."
                    });
                }
            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            const calculatedAge =
                calculateAge(dob);

            const calculatedGeneration =
                determineGeneration(
                    calculatedAge
                );


            const finalGeneration =
                calculatedGeneration ||
                generation ||
                "";


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


            const newUser = {

                id:
                    Date.now().toString(),

                fullName:
                    fullName.trim(),

                email:
                    normalizedEmail,

                phone:
                    phone || "",

                country:
                    country || "",

                dob:
                    dob || "",

                age:
                    calculatedAge ??
                    age ??
                    null,

                gender:
                    gender || "",

                generation:
                    finalGeneration,

                generationBadge:
                    getGenerationBadge(
                        finalGeneration
                    ),

                generationDescription:
                    getGenerationDescription(
                        finalGeneration
                    ),

                passwordHash,

                verificationMethod:
                    verificationMethod ||
                    "email",

                verificationCode,

                verificationExpires,

                verified:
                    false,

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

                personalInfoVisibility:
                    "public",

                accountVisibility:
                    "public",

                nameChangeHistory:
                    [],

                pendingNameChange:
                    null,

                dormant:
                    false,

                memberSince:
                    new Date().toISOString(),

                lastActive:
                    new Date().toISOString()
            };


            users.push(
                newUser
            );

            saveUsers(
                users
            );


            console.log(
                "Gene-rations verification code:",
                verificationCode
            );


            res.status(201).json({

                success: true,

                message:
                    "Account created successfully.",

                userId:
                    newUser.id,

                verificationRequired:
                    true,

                verificationMethod:
                    newUser.verificationMethod
            });

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to create account."
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
                userId,
                code
            } = req.body;

            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
                );

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found."
                });
            }


            if (
                user.verificationCode !==
                code
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid verification code."
                });
            }


            if (
                Date.now() >
                user.verificationExpires
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification code has expired."
                });
            }


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
                    "Account verified successfully."
            });

        } catch (error) {

            console.error(
                "Verification error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to verify account."
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

            const users =
                loadUsers();

            const normalizedEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();

            const user =
                users.find(
                    u =>
                        u.email ===
                        normalizedEmail
                );

            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."
                });
            }


            const passwordMatches =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );

            if (!passwordMatches) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."
                });
            }


            if (!user.verified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your account before logging in.",

                    verificationRequired:
                        true,

                    userId:
                        user.id
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
                        "Your account is dormant. Verification is required for reactivation."
                });
            }


            applyPendingNameChange(
                user
            );

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

                user:
                    publicUser(user)
            });

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to log in."
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
                    u =>
                        u.id ===
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
                        "Your account is dormant. Verification is required."
                });
            }


            const changed =
                applyPendingNameChange(
                    user
                );

            refreshGenerationData(
                user
            );

            if (changed) {
                saveUsers(users);
            }


            res.json({

                success: true,

                user:
                    publicUser(user)
            });

        } catch (error) {

            console.error(
                "Get user error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load user."
            });
        }
    }
);


/* =====================================================
   UPDATE USER SETTINGS / PROFILE
===================================================== */

app.patch(
    "/api/user/:userId/settings",
    (req, res) => {

        try {

            const {
                fullName,
                gender,
                country,
                bio,
                interests,
                hobbies,
                skills,
                personalInfoVisibility,

                email,
                phone,
                dob,
                age,
                generation,
                generationBadge
            } = req.body;


            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
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
                        "Your account is dormant. Verification is required."
                });
            }


            /*
             * These values are controlled
             * permanently by the backend.
             */

            if (
                email !== undefined ||
                phone !== undefined ||
                dob !== undefined ||
                age !== undefined ||
                generation !== undefined ||
                generationBadge !== undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, phone, date of birth, age and generation information cannot be changed from settings."
                });
            }


            /* =========================
               NAME CHANGE
            ========================= */

            if (
                fullName !== undefined
            ) {

                const newName =
                    String(
                        fullName
                    ).trim();

                if (!newName) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Full name cannot be empty."
                    });
                }


                if (
                    newName !==
                    user.fullName
                ) {

                    if (
                        !canRequestNameChange(
                            user
                        )
                    ) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "You can only change your name twice within the allowed period."
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
            }


            /* =========================
               OTHER PROFILE DATA
            ========================= */

            if (
                gender !== undefined
            ) {
                user.gender =
                    gender;
            }


            if (
                country !== undefined
            ) {
                user.country =
                    country;
            }


            if (
                bio !== undefined
            ) {

                const cleanBio =
                    String(
                        bio
                    ).trim();

                if (
                    cleanBio.length >
                    500
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Bio cannot exceed 500 characters."
                    });
                }

                user.bio =
                    cleanBio;
            }


            if (
                interests !== undefined
            ) {

                user.interests =
                    Array.isArray(
                        interests
                    )
                        ? interests
                        : [];
            }


            if (
                hobbies !== undefined
            ) {

                user.hobbies =
                    Array.isArray(
                        hobbies
                    )
                        ? hobbies
                        : [];
            }


            if (
                skills !== undefined
            ) {

                user.skills =
                    Array.isArray(
                        skills
                    )
                        ? skills
                        : [];
            }


            if (
                personalInfoVisibility !==
                undefined
            ) {

                user.personalInfoVisibility =
                    personalInfoVisibility;
            }


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
                    "Profile updated successfully.",

                user:
                    publicUser(user)
            });

        } catch (error) {

            console.error(
                "Settings update error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to update profile."
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
                    u =>
                        u.id ===
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

                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Your account is dormant. Verification is required."
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
                    publicUser(user)
            });

        } catch (error) {

            console.error(
                "Profile photo error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to save profile photo."
            });
        }
    }
);


/* =====================================================
   POSTS - GET ALL
===================================================== */

app.get(
    "/api/posts",
    (req, res) => {

        try {

            const posts =
                loadPosts();

            const users =
                loadUsers();


            /*
             * Keep post author information
             * synchronized with the account.
             */

            posts.forEach(
                post => {

                    const user =
                        users.find(
                            u =>
                                u.id ===
                                post.authorId
                        );

                    if (!user) {
                        return;
                    }


                    post.author =
                        user.fullName;

                    post.authorEmail =
                        user.email;

                    post.generation =
                        user.generation;

                    post.generationBadge =
                        user.generationBadge;

                    post.profilePhoto =
                        user.profilePhoto ||
                        "";
                }
            );


            savePosts(
                posts
            );


            res.json({

                success: true,

                posts:
                    posts
            });

        } catch (error) {

            console.error(
                "GET /api/posts error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load posts."
            });
        }
    }
);


/* =====================================================
   POSTS - CREATE
===================================================== */

app.post(
    "/api/posts",
    (req, res) => {

        try {

            const {
                userId,
                content,
                image
            } = req.body;


            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."
                });
            }


            if (!user.verified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Your account must be verified before creating posts."
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
                        "Your account is dormant. Verification is required."
                });
            }


            const postContent =
                typeof content ===
                "string"
                    ? content.trim()
                    : "";


            const postImage =
                typeof image ===
                "string"
                    ? image
                    : "";


            if (
                !postContent &&
                !postImage
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A post must contain text or an image."
                });
            }


            if (
                postContent.length >
                3000
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Post cannot exceed 3000 characters."
                });
            }


            const posts =
                loadPosts();


            const newPost = {

                id:
                    Date.now().toString(),

                authorId:
                    user.id,

                authorEmail:
                    user.email,

                author:
                    user.fullName,

                generation:
                    user.generation,

                generationBadge:
                    user.generationBadge,

                profilePhoto:
                    user.profilePhoto ||
                    "",

                content:
                    postContent,

                image:
                    postImage,

                likes:
                    [],

                comments:
                    [],

                createdAt:
                    new Date().toISOString()
            };


            posts.unshift(
                newPost
            );


            savePosts(
                posts
            );


            if (
                !Array.isArray(
                    user.posts
                )
            ) {
                user.posts = [];
            }


            user.posts.unshift(
                newPost.id
            );


            user.lastActive =
                new Date().toISOString();


            saveUsers(
                users
            );


            res.status(201).json({

                success: true,

                message:
                    "Post created successfully.",

                post:
                    newPost
            });

        } catch (error) {

            console.error(
                "Create post error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to create post."
            });
        }
    }
);


/* =====================================================
   POSTS - LIKE / UNLIKE
===================================================== */

app.post(
    "/api/posts/:postId/like",
    (req, res) => {

        try {

            const {
                userId
            } = req.body;


            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
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

                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Your account is dormant."
                });
            }


            const posts =
                loadPosts();

            const post =
                posts.find(
                    p =>
                        p.id ===
                        req.params.postId
                );


            if (!post) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found."
                });
            }


            if (
                !Array.isArray(
                    post.likes
                )
            ) {
                post.likes = [];
            }


            const existingIndex =
                post.likes.indexOf(
                    userId
                );


            let liked;


            if (
                existingIndex ===
                -1
            ) {

                post.likes.push(
                    userId
                );

                liked =
                    true;

            } else {

                post.likes.splice(
                    existingIndex,
                    1
                );

                liked =
                    false;
            }


            user.lastActive =
                new Date().toISOString();


            savePosts(
                posts
            );

            saveUsers(
                users
            );


            res.json({

                success: true,

                liked:

                    liked,

                likes:
                    post.likes.length,

                post:
                    post
            });

        } catch (error) {

            console.error(
                "Like post error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to update like."
            });
        }
    }
);


/* =====================================================
   POSTS - COMMENTS
===================================================== */

app.post(
    "/api/posts/:postId/comments",
    (req, res) => {

        try {

            const {
                userId,
                content
            } = req.body;


            const cleanContent =
                typeof content ===
                "string"
                    ? content.trim()
                    : "";


            if (!cleanContent) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Comment cannot be empty."
                });
            }


            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
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

                return res.status(403).json({

                    success: false,

                    dormant: true,

                    message:
                        "Your account is dormant."
                });
            }


            const posts =
                loadPosts();

            const post =
                posts.find(
                    p =>
                        p.id ===
                        req.params.postId
                );


            if (!post) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found."
                });
            }


            if (
                !Array.isArray(
                    post.comments
                )
            ) {
                post.comments = [];
            }


            const comment = {

                id:
                    Date.now().toString(),

                userId:
                    user.id,

                author:
                    user.fullName,

                profilePhoto:
                    user.profilePhoto ||
                    "",

                content:
                    cleanContent,

                createdAt:
                    new Date().toISOString()
            };


            post.comments.push(
                comment
            );


            user.lastActive =
                new Date().toISOString();


            savePosts(
                posts
            );

            saveUsers(
                users
            );


            res.status(201).json({

                success: true,

                comment:
                    comment,

                post:
                    post
            });

        } catch (error) {

            console.error(
                "Comment error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to add comment."
            });
        }
    }
);


/* =====================================================
   POSTS - DELETE
===================================================== */

app.delete(
    "/api/posts/:postId",
    (req, res) => {

        try {

            const {
                userId
            } = req.body;


            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."
                });
            }


            const posts =
                loadPosts();

            const postIndex =
                posts.findIndex(
                    p =>
                        p.id ===
                        req.params.postId
                );


            if (
                postIndex ===
                -1
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found."
                });
            }


            const post =
                posts[postIndex];


            if (
                post.authorId !==
                userId
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete your own posts."
                });
            }


            posts.splice(
                postIndex,
                1
            );


            if (
                Array.isArray(
                    user.posts
                )
            ) {

                user.posts =
                    user.posts.filter(
                        id =>
                            id !==
                            post.id
                    );
            }


            user.lastActive =
                new Date().toISOString();


            savePosts(
                posts
            );

            saveUsers(
                users
            );


            res.json({

                success: true,

                message:
                    "Post deleted successfully."
            });

        } catch (error) {

            console.error(
                "Delete post error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to delete post."
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

            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
                );


            if (user) {

                user.lastActive =
                    new Date().toISOString();

                saveUsers(
                    users
                );
            }


            res.json({

                success: true,

                message:
                    "Logged out successfully."
            });

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to log out."
            });
        }
    }
);


/* =====================================================
   REACTIVATE ACCOUNT
===================================================== */

app.post(
    "/api/auth/reactivate",
    (req, res) => {

        try {

            const {
                userId,
                code
            } = req.body;

            const users =
                loadUsers();

            const user =
                users.find(
                    u =>
                        u.id ===
                        userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."
                });
            }


            if (
                user.verificationCode !==
                code
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid verification code."
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
                    publicUser(user)
            });

        } catch (error) {

            console.error(
                "Reactivation error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to reactivate account."
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
            `Gene-rations backend running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            `Posts API: http://localhost:${PORT}/api/posts`
        );
    }
);