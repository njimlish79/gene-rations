const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const usersFile = path.join(__dirname, "users.json");
const postsFile = path.join(__dirname, "posts.json");


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(express.json({
    limit: "10mb"
}));


/* =====================================================
   DATABASE HELPERS
===================================================== */

function loadUsers() {

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, "[]");
    }

    try {
        return JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );
    } catch (error) {
        console.error("Unable to read users.json:", error);
        return [];
    }
}


function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );
}


function loadPosts() {

    if (!fs.existsSync(postsFile)) {
        fs.writeFileSync(postsFile, "[]");
    }

    try {
        return JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );
    } catch (error) {
        console.error("Unable to read posts.json:", error);
        return [];
    }
}


function savePosts(posts) {

    fs.writeFileSync(
        postsFile,
        JSON.stringify(posts, null, 2)
    );
}


/* =====================================================
   AGE / GENERATION SYSTEM
===================================================== */

function calculateAge(dob) {

    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();

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
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age;
}


function determineGeneration(age) {

    if (age === null || age === undefined) {
        return "Generation Alpha";
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


function getGenerationBadge(generation) {

    const badges = {

        "Silent Generation": "🌿",

        "Generation X": "⚡",

        "Millennial": "🔥",

        "Generation Z": "💫",

        "Generation Alpha": "🚀"

    };

    return badges[generation] || "🌟";
}


function getGenerationDescription(generation) {

    const descriptions = {

        "Silent Generation":
            "The Silent Generation represents wisdom, experience and resilience.",

        "Generation X":
            "Generation X represents independence, adaptability and experience.",

        "Millennial":
            "Millennials represent innovation, connection and digital transformation.",

        "Generation Z":
            "Generation Z represents creativity, technology and a connected generation.",

        "Generation Alpha":
            "Generation Alpha represents the next generation of digital natives and innovators."

    };

    return descriptions[generation] || "";
}


function refreshGenerationData(user) {

    const age = calculateAge(user.dob);

    const generation =
        determineGeneration(age);

    user.age = age;
    user.generation = generation;
    user.generationBadge =
        getGenerationBadge(generation);

    user.generationDescription =
        getGenerationDescription(generation);
}


/* =====================================================
   NAME CHANGE SYSTEM
===================================================== */

function cleanNameHistory(user) {

    if (!Array.isArray(user.nameChangeHistory)) {
        user.nameChangeHistory = [];
    }

    const sixMonths =
        183 * 24 * 60 * 60 * 1000;

    const cutoff =
        Date.now() - sixMonths;

    user.nameChangeHistory =
        user.nameChangeHistory.filter(
            timestamp => timestamp >= cutoff
        );
}


function canRequestNameChange(user) {

    cleanNameHistory(user);

    return user.nameChangeHistory.length < 2;
}


function applyPendingNameChange(user) {

    if (!user.pendingNameChange) {
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

    user.pendingNameChange = null;

    return true;
}


/* =====================================================
   DORMANT ACCOUNT SYSTEM
===================================================== */

function checkDormantStatus(user) {

    if (!user.verified) {
        return false;
    }

    if (!user.lastActive) {
        return false;
    }

    const inactiveTime =
        Date.now() -
        new Date(user.lastActive).getTime();

    const dormantPeriod =
        183 * 24 * 60 * 60 * 1000;

    if (inactiveTime >= dormantPeriod) {

        user.dormant = true;

        return true;
    }

    return user.dormant === true;
}


/* =====================================================
   PUBLIC USER DATA
===================================================== */

function publicUser(user) {

    return {

        id: user.id,

        fullName: user.fullName,

        email: user.email,

        phone: user.phone,

        dob: user.dob,

        age: user.age,

        country: user.country,

        gender: user.gender,

        generation: user.generation,

        generationBadge:
            user.generationBadge,

        generationDescription:
            user.generationDescription,

        profilePhoto:
            user.profilePhoto || "",

        bio:
            user.bio || "",

        interests:
            user.interests || [],

        hobbies:
            user.hobbies || [],

        skills:
            user.skills || [],

        followers:
            user.followers || [],

        following:
            user.following || [],

        posts:
            user.posts || [],

        communities:
            user.communities || [],

        events:
            user.events || [],

        familyMembers:
            user.familyMembers || [],

        profileViews:
            user.profileViews || 0,

        verified:
            user.verified === true,

        memberSince:
            user.memberSince,

        lastActive:
            user.lastActive,

        dormant:
            user.dormant === true,

        accountVisibility:
            "public",

        personalInfoVisibility:
            user.personalInfoVisibility || "public",

        nameChangeHistory:
            user.nameChangeHistory || [],

        pendingNameChange:
            user.pendingNameChange || null
    };
}


/* =====================================================
   SERVER TEST
===================================================== */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Gene-rations backend is running."
    });

});


/* =====================================================
   SIGN UP
===================================================== */

app.post("/api/auth/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            country,
            dob,
            age,
            gender,
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


        const users = loadUsers();


        const normalizedEmail =
            email.trim().toLowerCase();


        if (
            users.some(
                user =>
                    user.email.toLowerCase() ===
                    normalizedEmail
            )
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });

        }


        if (
            phone &&
            users.some(
                user =>
                    user.phone &&
                    user.phone === phone
            )
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this phone number already exists."
            });

        }


        const calculatedAge =
            calculateAge(dob);

        const calculatedGeneration =
            determineGeneration(calculatedAge);


        const passwordHash =
            await bcrypt.hash(password, 12);


        const verificationCode =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        const verificationExpires =
            Date.now() +
            10 * 60 * 1000;


        const user = {

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
                calculatedAge,

            gender:
                gender || "",

            generation:
                calculatedGeneration,

            generationBadge:
                getGenerationBadge(
                    calculatedGeneration
                ),

            generationDescription:
                getGenerationDescription(
                    calculatedGeneration
                ),

            passwordHash,

            verificationMethod:
                verificationMethod ||
                "email",

            verificationCode,

            verificationExpires,

            verified:
                false,

            dormant:
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

            memberSince:
                new Date().toISOString(),

            lastActive:
                new Date().toISOString()
        };


        users.push(user);

        saveUsers(users);


        console.log(
            `Verification code for ${normalizedEmail}: ${verificationCode}`
        );


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            userId:
                user.id,

            verificationRequired:
                true,

            verificationMethod:
                user.verificationMethod

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });

    }

});


/* =====================================================
   VERIFY ACCOUNT
===================================================== */

app.post("/api/auth/verify", (req, res) => {

    const {
        userId,
        code
    } = req.body;


    const users = loadUsers();


    const user =
        users.find(
            u => u.id === userId
        );


    if (!user) {

        return res.status(404).json({

            success: false,

            message:
                "User not found."

        });

    }


    if (
        !user.verificationCode ||
        user.verificationCode !==
        String(code)
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


    user.verified = true;

    user.verificationCode = null;

    user.verificationExpires = null;

    user.dormant = false;

    user.lastActive =
        new Date().toISOString();


    saveUsers(users);


    res.json({

        success: true,

        message:
            "Account verified successfully.",

        user:
            publicUser(user)

    });

});


/* =====================================================
   LOGIN
===================================================== */

app.post("/api/auth/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const users = loadUsers();


        const user =
            users.find(
                u =>
                    u.email.toLowerCase() ===
                    email.trim().toLowerCase()
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordCorrect) {

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
                    "Please verify your account first.",

                verificationRequired:
                    true,

                userId:
                    user.id

            });

        }


        if (checkDormantStatus(user)) {

            saveUsers(users);

            return res.status(403).json({

                success: false,

                dormant: true,

                message:
                    "Your account is dormant. Please reactivate your account."

            });

        }


        const nameChanged =
            applyPendingNameChange(user);


        refreshGenerationData(user);


        user.lastActive =
            new Date().toISOString();


        if (nameChanged) {
            cleanNameHistory(user);
        }


        saveUsers(users);


        res.json({

            success: true,

            message:
                "Login successful.",

            user:
                publicUser(user)

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });

    }

});


/* =====================================================
   GET USER
===================================================== */

app.get("/api/user/:userId", (req, res) => {

    const users = loadUsers();


    const user =
        users.find(
            u => u.id === req.params.userId
        );


    if (!user) {

        return res.status(404).json({

            success: false,

            message:
                "User not found."

        });

    }


    const nameChanged =
        applyPendingNameChange(user);


    refreshGenerationData(user);


    if (checkDormantStatus(user)) {

        saveUsers(users);

        return res.status(403).json({

            success: false,

            dormant: true,

            message:
                "Account is dormant."

        });

    }


    if (nameChanged) {
        user.lastActive =
            new Date().toISOString();
    }


    saveUsers(users);


    res.json({

        success: true,

        user:
            publicUser(user)

    });

});


/* =====================================================
   GET SETTINGS
   Compatibility with settings.html
===================================================== */

app.get("/api/user/settings", (req, res) => {

    const {
        userId
    } = req.query;


    const users = loadUsers();


    const user =
        users.find(
            u => u.id === userId
        );


    if (!user) {

        return res.status(404).json({

            success: false,

            message:
                "User not found."

        });

    }


    if (checkDormantStatus(user)) {

        saveUsers(users);

        return res.status(403).json({

            success: false,

            dormant: true,

            message:
                "Account is dormant."

        });

    }


    const settings = {

        personalInfoPrivate:
            user.personalInfoVisibility ===
            "private",

        accountVisibility:
            "public",

        email:
            user.email,

        phone:
            user.phone,

        country:
            user.country,

        gender:
            user.gender,

        generation:
            user.generation,

        generationBadge:
            user.generationBadge,

        memberSince:
            user.memberSince
    };


    res.json({

        success: true,

        settings,

        user:
            publicUser(user)

    });

});


/* =====================================================
   UPDATE GENERAL SETTINGS
===================================================== */

app.patch("/api/user/:userId/settings", (req, res) => {

    const {
        fullName,
        gender,
        country,
        bio,
        interests,
        hobbies,
        skills,
        personalInfoVisibility
    } = req.body;


    const users = loadUsers();


    const user =
        users.find(
            u => u.id === req.params.userId
        );


    if (!user) {

        return res.status(404).json({

            success: false,

            message:
                "User not found."

        });

    }


    if (checkDormantStatus(user)) {

        saveUsers(users);

        return res.status(403).json({

            success: false,

            dormant: true,

            message:
                "Account is dormant."

        });

    }


    /* ---------------------------------------------
       PERMANENT ACCOUNT INFORMATION
    --------------------------------------------- */

    if (
        req.body.email !== undefined ||
        req.body.phone !== undefined ||
        req.body.dob !== undefined ||
        req.body.age !== undefined ||
        req.body.generation !== undefined ||
        req.body.generationBadge !== undefined
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email, phone, date of birth, age and generation information cannot be changed."

        });

    }


    /* ---------------------------------------------
       NAME CHANGE
       Maximum 2 changes within 183 days
       Effective after 24 hours
    --------------------------------------------- */

    if (
        fullName !== undefined &&
        fullName.trim() !== user.fullName
    ) {

        if (!fullName.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name cannot be empty."

            });

        }


        if (!canRequestNameChange(user)) {

            return res.status(400).json({

                success: false,

                message:
                    "You can only change your name twice within a 183-day period."

            });

        }


        user.pendingNameChange = {

            name:
                fullName.trim(),

            requestedAt:
                Date.now(),

            effectiveAt:
                Date.now() +
                24 * 60 * 60 * 1000

        };

    }


    /* ---------------------------------------------
       EDITABLE PROFILE INFORMATION
    --------------------------------------------- */

    if (gender !== undefined) {
        user.gender = gender;
    }


    if (country !== undefined) {
        user.country = country;
    }


    if (bio !== undefined) {
        user.bio = bio;
    }


    if (Array.isArray(interests)) {
        user.interests = interests;
    }


    if (Array.isArray(hobbies)) {
        user.hobbies = hobbies;
    }


    if (Array.isArray(skills)) {
        user.skills = skills;
    }


    if (
        personalInfoVisibility ===
        "public" ||
        personalInfoVisibility ===
        "private"
    ) {

        user.personalInfoVisibility =
            personalInfoVisibility;

    }


    user.accountVisibility =
        "public";


    user.lastActive =
        new Date().toISOString();


    refreshGenerationData(user);

    saveUsers(users);


    res.json({

        success: true,

        message:
            "Settings updated successfully.",

        user:
            publicUser(user)

    });

});


/* =====================================================
   UPDATE PRIVACY
   Compatibility with settings.html
===================================================== */

app.put("/api/user/settings/privacy", (req, res) => {

    const {
        userId,
        personalInfoPrivate
    } = req.body;


    const users = loadUsers();


    const user =
        users.find(
            u => u.id === userId
        );


    if (!user) {

        return res.status(404).json({

            success: false,

            message:
                "User not found."

        });

    }


    if (checkDormantStatus(user)) {

        saveUsers(users);

        return res.status(403).json({

            success: false,

            dormant: true,

            message:
                "Account is dormant."

        });

    }


    user.personalInfoVisibility =
        personalInfoPrivate === true
            ? "private"
            : "public";


    user.lastActive =
        new Date().toISOString();


    saveUsers(users);


    res.json({

        success: true,

        message:
            "Privacy settings updated.",

        settings: {

            personalInfoPrivate:
                user.personalInfoVisibility ===
                "private",

            accountVisibility:
                "public"

        },

        user:
            publicUser(user)

    });

});


/* =====================================================
   PROFILE PHOTO
===================================================== */

app.patch(
    "/api/user/:userId/profile-photo",
    (req, res) => {

        const {
            profilePhoto
        } = req.body;


        const users = loadUsers();


        const user =
            users.find(
                u => u.id === req.params.userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        if (checkDormantStatus(user)) {

            saveUsers(users);

            return res.status(403).json({

                success: false,

                dormant: true,

                message:
                    "Account is dormant."

            });

        }


        if (
            typeof profilePhoto !== "string"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid profile photo."

            });

        }


        if (
            profilePhoto.length >
            10 * 1024 * 1024
        ) {

            return res.status(413).json({

                success: false,

                message:
                    "Profile photo is too large."

            });

        }


        user.profilePhoto =
            profilePhoto;


        user.lastActive =
            new Date().toISOString();


        saveUsers(users);


        res.json({

            success: true,

            message:
                "Profile photo updated.",

            user:
                publicUser(user)

        });

    }
);


/* =====================================================
   POSTS
===================================================== */


/* ---------------------------------------------
   GET ALL POSTS
--------------------------------------------- */

app.get("/api/posts", (req, res) => {

    const posts = loadPosts();

    const users = loadUsers();


    /*
       Always refresh author information
       from the current user account.
    */

    posts.forEach(post => {

        const author =
            users.find(
                user =>
                    user.id === post.authorId
            );


        if (author) {

            post.author =
                author.fullName;

            post.authorEmail =
                author.email;

            post.generation =
                author.generation;

            post.generationBadge =
                author.generationBadge;

            post.profilePhoto =
                author.profilePhoto || "";

        }

    });


    savePosts(posts);


    res.json({

        success: true,

        posts

    });

});


/* ---------------------------------------------
   CREATE POST
--------------------------------------------- */

app.post("/api/posts", (req, res) => {

    const {
        userId,
        content,
        image
    } = req.body;


    const users = loadUsers();


    const user =
        users.find(
            u => u.id === userId
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
                "Please verify your account first."

        });

    }


    if (checkDormantStatus(user)) {

        saveUsers(users);

        return res.status(403).json({

            success: false,

            dormant: true,

            message:
                "Your account is dormant."

        });

    }


    const postContent =
        typeof content === "string"
            ? content.trim()
            : "";


    const postImage =
        typeof image === "string"
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


    if (postContent.length > 3000) {

        return res.status(400).json({

            success: false,

            message:
                "Post cannot exceed 3000 characters."

        });

    }


    if (
        postImage &&
        postImage.length >
        10 * 1024 * 1024
    ) {

        return res.status(413).json({

            success: false,

            message:
                "Image is too large."

        });

    }


    const posts = loadPosts();


    const post = {

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
            user.profilePhoto || "",

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


    posts.unshift(post);


    if (!Array.isArray(user.posts)) {
        user.posts = [];
    }


    user.posts.unshift(post.id);


    user.lastActive =
        new Date().toISOString();


    savePosts(posts);

    saveUsers(users);


    res.status(201).json({

        success: true,

        message:
            "Post created successfully.",

        post

    });

});


/* ---------------------------------------------
   LIKE / UNLIKE POST
--------------------------------------------- */

app.post(
    "/api/posts/:postId/like",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users = loadUsers();

        const posts = loadPosts();


        const user =
            users.find(
                u => u.id === userId
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
                    "Please verify your account first."

            });

        }


        if (checkDormantStatus(user)) {

            saveUsers(users);

            return res.status(403).json({

                success: false,

                dormant: true,

                message:
                    "Your account is dormant."

            });

        }


        const post =
            posts.find(
                p => p.id === req.params.postId
            );


        if (!post) {

            return res.status(404).json({

                success: false,

                message:
                    "Post not found."

            });

        }


        if (!Array.isArray(post.likes)) {
            post.likes = [];
        }


        const existingIndex =
            post.likes.indexOf(userId);


        let liked;


        if (existingIndex === -1) {

            post.likes.push(userId);

            liked = true;

        } else {

            post.likes.splice(
                existingIndex,
                1
            );

            liked = false;

        }


        user.lastActive =
            new Date().toISOString();


        savePosts(posts);

        saveUsers(users);


        res.json({

            success: true,

            liked,

            count:
                post.likes.length,

            post

        });

    }
);


/* ---------------------------------------------
   COMMENTS
--------------------------------------------- */

app.post(
    "/api/posts/:postId/comments",
    (req, res) => {

        const {
            userId,
            content
        } = req.body;


        const users = loadUsers();

        const posts = loadPosts();


        const user =
            users.find(
                u => u.id === userId
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
                    "Please verify your account first."

            });

        }


        if (checkDormantStatus(user)) {

            saveUsers(users);

            return res.status(403).json({

                success: false,

                dormant: true,

                message:
                    "Your account is dormant."

            });

        }


        const post =
            posts.find(
                p => p.id === req.params.postId
            );


        if (!post) {

            return res.status(404).json({

                success: false,

                message:
                    "Post not found."

            });

        }


        const commentContent =
            typeof content === "string"
                ? content.trim()
                : "";


        if (!commentContent) {

            return res.status(400).json({

                success: false,

                message:
                    "Comment cannot be empty."

            });

        }


        if (commentContent.length > 1000) {

            return res.status(400).json({

                success: false,

                message:
                    "Comment cannot exceed 1000 characters."

            });

        }


        if (!Array.isArray(post.comments)) {
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
                user.profilePhoto || "",

            content:
                commentContent,

            createdAt:
                new Date().toISOString()

        };


        post.comments.push(comment);


        user.lastActive =
            new Date().toISOString();


        savePosts(posts);

        saveUsers(users);


        res.status(201).json({

            success: true,

            message:
                "Comment added successfully.",

            comment,

            post

        });

    }
);


/* ---------------------------------------------
   DELETE POST
--------------------------------------------- */

app.delete(
    "/api/posts/:postId",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users = loadUsers();

        const posts = loadPosts();


        const user =
            users.find(
                u => u.id === userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        const postIndex =
            posts.findIndex(
                p =>
                    p.id ===
                    req.params.postId
            );


        if (postIndex === -1) {

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
            user.id
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


        if (Array.isArray(user.posts)) {

            user.posts =
                user.posts.filter(
                    id =>
                        id !== post.id
                );

        }


        user.lastActive =
            new Date().toISOString();


        savePosts(posts);

        saveUsers(users);


        res.json({

            success: true,

            message:
                "Post deleted successfully."

        });

    }
);


/* =====================================================
   DEACTIVATE ACCOUNT
===================================================== */

app.post(
    "/api/account/deactivate",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users = loadUsers();


        const user =
            users.find(
                u => u.id === userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        user.dormant = true;

        user.lastActive =
            new Date().toISOString();


        /*
           Generate a fresh verification code
           for reactivation.
        */

        const verificationCode =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        user.verificationCode =
            verificationCode;


        user.verificationExpires =
            Date.now() +
            10 * 60 * 1000;


        saveUsers(users);


        console.log(
            `Reactivation code for ${user.email}: ${verificationCode}`
        );


        res.json({

            success: true,

            message:
                "Account deactivated successfully. A reactivation code has been generated.",

            reactivationRequired:
                true

        });

    }
);


/* =====================================================
   REACTIVATE ACCOUNT
===================================================== */

app.post(
    "/api/auth/reactivate",
    (req, res) => {

        const {
            userId,
            code
        } = req.body;


        const users = loadUsers();


        const user =
            users.find(
                u => u.id === userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        if (!user.dormant) {

            return res.json({

                success: true,

                message:
                    "Account is already active.",

                user:
                    publicUser(user)

            });

        }


        if (
            !user.verificationCode ||
            user.verificationCode !==
            String(code)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid reactivation code."

            });

        }


        if (
            Date.now() >
            user.verificationExpires
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Reactivation code has expired."

            });

        }


        user.dormant = false;

        user.verificationCode = null;

        user.verificationExpires = null;

        user.lastActive =
            new Date().toISOString();


        refreshGenerationData(user);

        saveUsers(users);


        res.json({

            success: true,

            message:
                "Account reactivated successfully.",

            user:
                publicUser(user)

        });

    }
);


/* =====================================================
   LOGOUT
===================================================== */

app.post(
    "/api/auth/logout",
    (req, res) => {

        const {
            userId
        } = req.body;


        const users = loadUsers();


        const user =
            users.find(
                u => u.id === userId
            );


        if (user) {

            user.lastActive =
                new Date().toISOString();

            saveUsers(users);

        }


        res.json({

            success: true,

            message:
                "Logged out successfully."

        });

    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {

    console.log(
        `Gene-rations backend running on http://localhost:${PORT}`
    );

});