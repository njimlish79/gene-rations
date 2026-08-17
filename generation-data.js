/* =====================================================
   GENE-RATIONS
   GENERATION DATA & THEMES
   ===================================================== */

const generationData = {

    /* =================================================
       GENERATION ALPHA
       ================================================= */

    "Generation Alpha": {

        name: "Generation Alpha",

        shortName: "Gen Alpha",

        badge: "🧬 Alpha",

        theme: "alpha",

        welcome:
            "Welcome to Generation Alpha!",

        description:
            "A generation growing up in a highly connected digital world, surrounded by rapidly changing technology and new ways of learning, creating and communicating.",

        colorPrimary: "#6C5CE7",

        colorSecondary: "#A29BFE",

        icon: "🧬"

    },


    /* =================================================
       GENERATION Z
       ================================================= */

    "Generation Z": {

        name: "Generation Z",

        shortName: "Gen Z",

        badge: "⚡ Gen Z",

        theme: "gen-z",

        welcome:
            "Welcome to Generation Z!",

        description:
            "A digitally connected generation shaped by rapid technological, cultural and social change.",

        colorPrimary: "#0984E3",

        colorSecondary: "#00CEC9",

        icon: "⚡"

    },


    /* =================================================
       MILLENNIALS
       ================================================= */

    "Millennial": {

        name: "Millennial",

        shortName: "Millennial",

        badge: "🌍 Millennial",

        theme: "millennial",

        welcome:
            "Welcome to the Millennial generation!",

        description:
            "A generation that experienced the transition from an offline world into a highly connected digital world.",

        colorPrimary: "#E17055",

        colorSecondary: "#FDCB6E",

        icon: "🌍"

    },


    /* =================================================
       GENERATION X
       ================================================= */

    "Generation X": {

        name: "Generation X",

        shortName: "Gen X",

        badge: "🔥 Gen X",

        theme: "gen-x",

        welcome:
            "Welcome to Generation X!",

        description:
            "A generation known for independence, adaptability and experiencing major cultural and technological transformation.",

        colorPrimary: "#D63031",

        colorSecondary: "#E84393",

        icon: "🔥"

    },


    /* =================================================
       BABY BOOMERS
       ================================================= */

    "Baby Boomer": {

        name: "Baby Boomer",

        shortName: "Boomer",

        badge: "🏆 Boomer",

        theme: "boomer",

        welcome:
            "Welcome to the Baby Boomer generation!",

        description:
            "A generation carrying decades of experience, history, knowledge and perspectives shaped by major social change.",

        colorPrimary: "#B8860B",

        colorSecondary: "#DAA520",

        icon: "🏆"

    },


    /* =================================================
       SILENT GENERATION
       ================================================= */

    "Silent Generation": {

        name: "Silent Generation",

        shortName: "Silent",

        badge: "⭐ Silent",

        theme: "silent",

        welcome:
            "Welcome to the Silent Generation!",

        description:
            "A generation carrying generations of experience, history, wisdom and valuable life perspectives.",

        colorPrimary: "#636E72",

        colorSecondary: "#B2BEC3",

        icon: "⭐"

    }

};


/* =====================================================
   DEFAULT GENERATION
   ===================================================== */

const defaultGeneration =
    "Generation Z";


/* =====================================================
   GET GENERATION DATA
   ===================================================== */

function getGenerationData(generation) {

    return (
        generationData[generation] ||
        generationData[defaultGeneration]
    );

}