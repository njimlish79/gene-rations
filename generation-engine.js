/* =====================================================
   GENE-RATIONS
   GENERATION ENGINE
   ===================================================== */


/* =====================================================
   1. CALCULATE CURRENT AGE FROM DATE OF BIRTH
   ===================================================== */

function calculateAge(dob) {

    if (!dob) {
        return null;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
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
            today.getDate() < birthDate.getDate()
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

    if (age === null || age < 0) {
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

    const age = calculateAge(dob);

    const generation =
        determineGeneration(age);

    return {
        age: age,
        generation: generation
    };
}


/* =====================================================
   4. UPDATE USER GENERATION DATA
   ===================================================== */

function updateUserGeneration() {

    const storedUser =
        localStorage.getItem("userData");

    if (!storedUser) {
        return null;
    }

    let user;

    try {

        user = JSON.parse(storedUser);

    } catch (error) {

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
        getGenerationFromDOB(user.dob);


    if (result.age !== null) {

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