// ===============================
// Gene-rations Profile
// profile.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // Get user data
    const user = JSON.parse(localStorage.getItem("userData"));

    // Redirect if not logged in
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Populate profile information
    document.getElementById("fullName").textContent =
        user.fullName || "No Name";

    document.getElementById("email").textContent =
        user.email || "Not Available";

    document.getElementById("phone").textContent =
        user.phone || "Not Available";

    document.getElementById("dob").textContent =
        user.dob || "Not Available";

    document.getElementById("gender").textContent =
        user.gender || "Not Available";

    document.getElementById("generationName").textContent =
        user.generation || "Unknown Generation";

    document.getElementById("generationBadge").textContent =
        user.generation || "Generation";

    // Load profile photo
    const profileImage = document.getElementById("profileImage");

    if (user.profilePhoto) {
        profileImage.src = user.profilePhoto;
    }

    // Load bio
    document.getElementById("bio").value =
        user.bio || "";

    // Load statistics
    document.getElementById("flowers").textContent =
        user.flowers || 0;

    document.getElementById("followers").textContent =
        user.followers || 0;

    document.getElementById("following").textContent =
        user.following || 0;

});

// ===============================
// Upload Profile Photo
// ===============================

const uploadBtn = document.getElementById("uploadBtn");
const imageUpload = document.getElementById("imageUpload");

uploadBtn.addEventListener("click", () => {
    imageUpload.click();
});

imageUpload.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const image = e.target.result;

        document.getElementById("profileImage").src = image;

        let user = JSON.parse(localStorage.getItem("userData"));

        user.profilePhoto = image;

        localStorage.setItem(
            "userData",
            JSON.stringify(user)
        );

        alert("Profile photo updated successfully!");

    };

    reader.readAsDataURL(file);

});

// ===============================
// Save Bio
// ===============================

document.getElementById("saveBioBtn")
.addEventListener("click", () => {

    const bio = document
        .getElementById("bio")
        .value
        .trim();

    let user = JSON.parse(localStorage.getItem("userData"));

    user.bio = bio;

    localStorage.setItem(
        "userData",
        JSON.stringify(user)
    );

    alert("Bio saved successfully!");

});

// ===============================
// Logout
// ===============================

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.removeItem("loggedInUser");

    window.location.href = "login.html";

});