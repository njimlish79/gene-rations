// ===============================
// GENE-RATIONS PROFILE PAGE
// profile.js
// ===============================

// Load user information
const user = JSON.parse(localStorage.getItem("user"));

if (user) {

    document.getElementById("profileName").textContent =
        user.fullName || "Gene-rations User";

    document.getElementById("generationBadge").textContent =
        user.generation || "Generation Badge";

    document.getElementById("email").textContent =
        user.email || "Not Available";

    document.getElementById("phone").textContent =
        user.phone || "Not Available";

    document.getElementById("country").textContent =
        user.country || "Not Available";

    document.getElementById("bio").textContent =
        user.bio || "Welcome to Gene-rations.";

    document.getElementById("posts").textContent =
        user.posts || 0;

    document.getElementById("videos").textContent =
        user.videos || 0;

    document.getElementById("followers").textContent =
        user.followers || 0;

    document.getElementById("following").textContent =
        user.following || 0;

    document.getElementById("communities").textContent =
        user.communities || 0;

    // Load saved profile image
    if (user.profileImage) {
        document.getElementById("profileImage").src =
            user.profileImage;
    }

    // Load saved cover photo
    if (user.coverPhoto) {
        document.getElementById("coverPhoto").src =
            user.coverPhoto;
    }

}

// ===============================
// CHANGE PROFILE PICTURE
// ===============================

const imageUpload = document.getElementById("imageUpload");

imageUpload.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        document.getElementById("profileImage").src =
            e.target.result;

        let user =
            JSON.parse(localStorage.getItem("user")) || {};

        user.profileImage = e.target.result;

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

    };

    reader.readAsDataURL(file);

});

// ===============================
// EDIT PROFILE
// ===============================

document.getElementById("editProfile")
.addEventListener("click", function () {

    window.location.href = "edit-profile.html";

});

// ===============================
// LOGOUT
// ===============================

document.getElementById("logout")
.addEventListener("click", function () {

    if (confirm("Are you sure you want to logout?")) {

        localStorage.removeItem("user");

        window.location.href = "login.html";

    }

});