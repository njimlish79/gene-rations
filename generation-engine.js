/* =====================================================
   GENE-RATIONS
   GENERATION ENGINE
   ===================================================== */


/* =====================================================
   1. CALCULATE AGE FROM DATE OF BIRTH
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
   2. DETERMINE GENERATION FROM AGE
   ===================================================== */

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
   3. GET GENERATION DIRECTLY FROM DOB
   ===================================================== */

function getGenerationFromDOB(dob) {

    const age =
        calculateAge(dob);


    const generation =
        determineGeneration(age);


    return {

        age:
            age,

        generation:
            generation

    };

}


/* =====================================================
   4. UPDATE USER GENERATION DATA
   ===================================================== */

function updateUserGeneration() {

    const storedUser =
        localStorage.getItem(
            "userData"
        );


    if (!storedUser) {

        return null;

    }


    let user;


    try {

        user =
            JSON.parse(
                storedUser
            );

    }

    catch (error) {

        console.error(
            "Unable to read userData:",
            error
        );

        return null;

    }


    if (!user.dob) {

        return user;

    }


    const result =
        getGenerationFromDOB(
            user.dob
        );


    if (
        result.age !== null
    ) {

        user.age =
            result.age;

        user.generation =
            result.generation;

    }


    localStorage.setItem(
        "userData",
        JSON.stringify(user)
    );


    return user;

}


/* =====================================================
   5. APPLY GENERATION THEME
   ===================================================== */

function applyGenerationTheme(
    generation
) {

    /*
       Make sure generation-data.js
       has loaded.
    */

    if (
        typeof generationData ===
        "undefined"
    ) {

        console.warn(
            "generationData is not available."
        );

        return;

    }


    const data =
        generationData[generation];


    if (!data) {

        console.warn(
            "No theme found for:",
            generation
        );

        return;

    }


    /* =================================================
       ROOT CSS VARIABLES
    ================================================= */

    document.documentElement.style
        .setProperty(
            "--generation-primary",
            data.colorPrimary
        );


    document.documentElement.style
        .setProperty(
            "--generation-secondary",
            data.colorSecondary
        );


    /* =================================================
       SAVE THEME
    ================================================= */

    localStorage.setItem(
        "generationTheme",
        data.theme
    );


    /* =================================================
       ADD THEME CLASS TO BODY
    ================================================= */

    document.body.classList.remove(

        "theme-alpha",

        "theme-gen-z",

        "theme-millennial",

        "theme-gen-x",

        "theme-boomer",

        "theme-silent"

    );


    document.body.classList.add(
        "theme-" + data.theme
    );


    /* =================================================
       UPDATE META THEME COLOR
    ================================================= */

    let themeColor =
        document.querySelector(
            'meta[name="theme-color"]'
        );


    if (!themeColor) {

        themeColor =
            document.createElement(
                "meta"
            );

        themeColor.name =
            "theme-color";

        document.head.appendChild(
            themeColor
        );

    }


    themeColor.content =
        data.colorPrimary;


    /* =================================================
       LOG
    ================================================= */

    console.log(
        "Generation theme applied:",
        generation
    );

    console.log(
        "Theme:",
        data.theme
    );

    console.log(
        "Primary:",
        data.colorPrimary
    );

    console.log(
        "Secondary:",
        data.colorSecondary
    );

}


/* =====================================================
   6. GET CURRENT USER GENERATION
   ===================================================== */

function getCurrentGeneration() {

    const storedUser =
        localStorage.getItem(
            "userData"
        );


    if (!storedUser) {

        return null;

    }


    try {

        const user =
            JSON.parse(
                storedUser
            );


        return user.generation ||
               null;

    }

    catch (error) {

        console.error(
            "Unable to read current generation:",
            error
        );

        return null;

    }

}


/* =====================================================
   7. INITIALIZE GENERATION THEME
   ===================================================== */

function initializeGenerationTheme() {

    const generation =
        getCurrentGeneration();


    if (!generation) {

        console.warn(
            "No current generation found."
        );

        return;

    }


    applyGenerationTheme(
        generation
    );

}


/* =====================================================
   END OF GENERATION ENGINE
   ===================================================== */