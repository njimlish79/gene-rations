/*==================================================
  GENE-RATIONS PROFILE
  profile.js - Part 1
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // Get Logged-in User
    // ==========================================

    let user = JSON.parse(localStorage.getItem("userData"));

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // ==========================================
    // Helper Function
    // ==========================================

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || "Not Available";
        }
    }

    // ==========================================
    // Populate Profile Information
    // ==========================================

    setText("fullName", user.fullName);
    setText("email", user.email);
    setText("phone", user.phone);
    setText("dob", user.dob);
    setText("gender", user.gender);

    // Country is optional
    setText("country", user.country || "Kenya");

    // ==========================================
    // Member Since
    // ==========================================

    if (!user.memberSince) {

        user.memberSince = new Date().toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long"
            }
        );

        localStorage.setItem(
            "userData",
            JSON.stringify(user)
        );

    }

    setText("memberSince", user.memberSince);
    setText("footerMemberSince", user.memberSince);

    // ==========================================
    // Generation Information
    // ==========================================

    const generation = user.generation || "Generation";

    setText("generationName", generation);
    setText("generationText", generation);
    setText("generationBadge", generation);

    // Optional custom badge
    setText(
        "badgeText",
        user.badge || "Explorer"
    );

    // ==========================================
    // Statistics Defaults
    // ==========================================

    user.flowers = user.flowers || 0;
    user.followers = user.followers || 0;
    user.following = user.following || 0;
    user.posts = user.posts || 0;
    user.videos = user.videos || 0;
    user.communities = user.communities || 0;
    user.reputation = user.reputation || 0;
    user.profileViews = user.profileViews || 0;
    user.generationXP = user.generationXP || 0;

    // ==========================================
    // Display Statistics
    // ==========================================

    setText("flowers", user.flowers);
    setText("followers", user.followers);
    setText("following", user.following);

    setText("posts", user.posts);
    setText("videos", user.videos);
    setText("communities", user.communities);

    setText("reputation", user.reputation);

    setText("profileViews", user.profileViews);
    setText("footerProfileViews", user.profileViews);

    setText("generationXP", user.generationXP + " XP");
    setText("footerGenerationScore", user.generationXP + " XP");

    // ==========================================
    // Level Calculation
    // ==========================================

    const level = Math.floor(user.generationXP / 100) + 1;

    setText("levelText", "Level " + level);

    const xpProgress = user.generationXP % 100;

    const progressFill =
        document.getElementById("progressFill");

    if (progressFill) {
        progressFill.style.width = xpProgress + "%";
    }

    setText(
        "xpText",
        xpProgress + " / 100 XP"
    );

    // ==========================================
    // Profile Completion
    // ==========================================

    let completed = 0;

    if (user.fullName) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.gender) completed++;
    if (user.dob) completed++;
    if (user.bio) completed++;
    if (user.profilePhoto) completed++;

    const completion =
        Math.round((completed / 7) * 100);

    const completionFill =
        document.getElementById("completionFill");

    if (completionFill) {
        completionFill.style.width =
            completion + "%";
    }

    setText(
        "completionPercent",
        completion + "%"
    );

    // ==========================================
    // Online Status
    // ==========================================

    setText("statusText", "Online");

    // ==========================================
    // Load Bio
    // ==========================================

    const bio =
        document.getElementById("bio");

    if (bio) {
        bio.value = user.bio || "";
    }

    // ==========================================
    // Load Profile Image
    // ==========================================

    const profileImage =
        document.getElementById("profileImage");

    const navProfileImage =
        document.getElementById("navProfileImage");

    const miniProfileImage =
        document.getElementById("miniProfileImage");

    const largeProfileImage =
        document.getElementById("largeProfileImage");

    if (user.profilePhoto) {

        if (profileImage)
            profileImage.src = user.profilePhoto;

        if (navProfileImage)
            navProfileImage.src = user.profilePhoto;

        if (miniProfileImage)
            miniProfileImage.src = user.profilePhoto;

        if (largeProfileImage)
            largeProfileImage.src = user.profilePhoto;

    }

    // Save updated defaults
    localStorage.setItem(
        "userData",
        JSON.stringify(user)
    );

});
/*==================================================
  PROFILE.JS - PART 2
  Photo Upload + Modals + Edit Profile
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    let user =
        JSON.parse(localStorage.getItem("userData")) || {};

    // ==========================================
    // PROFILE PHOTO UPLOAD
    // ==========================================

    const uploadBtn =
        document.getElementById("uploadBtn");

    const imageUpload =
        document.getElementById("imageUpload");

    if (uploadBtn && imageUpload) {

        uploadBtn.addEventListener("click", () => {

            imageUpload.click();

        });

        imageUpload.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {

                alert("Please select an image file.");
                return;

            }

            const reader = new FileReader();

            reader.onload = function (e) {

                const imageData = e.target.result;

                // Save image
                user.profilePhoto = imageData;

                localStorage.setItem(
                    "userData",
                    JSON.stringify(user)
                );

                // Update images
                updateAllProfileImages(imageData);

                alert("Profile photo updated!");

            };

            reader.readAsDataURL(file);

        });

    }

    // ==========================================
    // UPDATE ALL PROFILE IMAGES
    // ==========================================

    function updateAllProfileImages(image) {

        const imageIds = [

            "profileImage",
            "navProfileImage",
            "miniProfileImage",
            "largeProfileImage"

        ];

        imageIds.forEach(id => {

            const img = document.getElementById(id);

            if (img) {

                img.src = image;

            }

        });

    }

    // ==========================================
    // PHOTO PREVIEW MODAL
    // ==========================================

    const profileImage =
        document.getElementById("profileImage");

    const photoModal =
        document.getElementById("photoModal");

    const closePhotoModal =
        document.getElementById("closePhotoModal");

    if (profileImage && photoModal) {

        profileImage.addEventListener("click", () => {

            photoModal.style.display = "flex";

        });

    }

    if (closePhotoModal) {

        closePhotoModal.addEventListener("click", () => {

            photoModal.style.display = "none";

        });

    }

    // Close photo modal when clicking outside

    if (photoModal) {

        photoModal.addEventListener("click", (e) => {

            if (e.target === photoModal) {

                photoModal.style.display = "none";

            }

        });

    }

    // ==========================================
    // EDIT PROFILE MODAL
    // ==========================================

    const editBtn =
        document.getElementById("editProfileBtn");

    const editModal =
        document.getElementById("editProfileModal");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    if (editBtn && editModal) {

        editBtn.addEventListener("click", () => {

            // Fill form
            document.getElementById("editFullName").value =
                user.fullName || "";

            document.getElementById("editPhone").value =
                user.phone || "";

            document.getElementById("editCountry").value =
                user.country || "";

            document.getElementById("editBio").value =
                user.bio || "";

            editModal.style.display = "flex";

        });

    }

    if (closeModalBtn) {

        closeModalBtn.addEventListener("click", () => {

            editModal.style.display = "none";

        });

    }

    // Close modal outside click

    if (editModal) {

        editModal.addEventListener("click", (e) => {

            if (e.target === editModal) {

                editModal.style.display = "none";

            }

        });

    }

    // ==========================================
    // SAVE PROFILE CHANGES
    // ==========================================

    const editForm =
        document.getElementById("editProfileForm");

    if (editForm) {

        editForm.addEventListener("submit", (e) => {

            e.preventDefault();

            user.fullName =
                document.getElementById("editFullName").value;

            user.phone =
                document.getElementById("editPhone").value;

            user.country =
                document.getElementById("editCountry").value;

            user.bio =
                document.getElementById("editBio").value;

            localStorage.setItem(
                "userData",
                JSON.stringify(user)
            );

            // Update page instantly

            const fullName =
                document.getElementById("fullName");

            if (fullName) {

                fullName.textContent =
                    user.fullName;

            }

            const phone =
                document.getElementById("phone");

            if (phone) {

                phone.textContent =
                    user.phone;

            }

            const country =
                document.getElementById("country");

            if (country) {

                country.textContent =
                    user.country;

            }

            const bio =
                document.getElementById("bio");

            if (bio) {

                bio.value = user.bio;

            }

            editModal.style.display = "none";

            alert("Profile updated successfully!");

        });

    }

});
/*==================================================
  PROFILE.JS - PART 3
  Bio + Tabs + Posts + Timeline
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    let user = JSON.parse(localStorage.getItem("userData")) || {};

    // Initialize arrays
    user.postsList = user.postsList || [];
    user.timeline = user.timeline || [];

    // ==========================================
    // SAVE BIO
    // ==========================================

    const saveBioBtn = document.getElementById("saveBioBtn");

    if (saveBioBtn) {

        saveBioBtn.addEventListener("click", () => {

            const bio = document.getElementById("bio").value.trim();

            user.bio = bio;

            localStorage.setItem(
                "userData",
                JSON.stringify(user)
            );

            alert("Bio saved successfully.");

        });

    }

    // ==========================================
    // TAB SWITCHING
    // ==========================================

    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(btn =>
                btn.classList.remove("active")
            );

            contents.forEach(content =>
                content.classList.remove("active")
            );

            tab.classList.add("active");

            const target =
                document.getElementById(
                    tab.dataset.tab + "Tab"
                );

            if (target) {

                target.classList.add("active");

            }

        });

    });

    // ==========================================
    // CREATE POST
    // ==========================================

    const publishBtn =
        document.getElementById("publishPostBtn");

    const postInput =
        document.getElementById("postInput");

    const postsContainer =
        document.getElementById("postsContainer");

    if (publishBtn && postInput && postsContainer) {

        publishBtn.addEventListener("click", () => {

            const text = postInput.value.trim();

            if (text === "") {

                alert("Write something first.");

                return;

            }

            const post = {

                author: user.fullName,
                generation: user.generation,
                photo: user.profilePhoto || "images/default-profile.png",
                content: text,
                date: new Date().toLocaleString()

            };

            user.postsList.unshift(post);

            user.posts = user.postsList.length;

            addTimeline("📝 Published a new post");

            localStorage.setItem(
                "userData",
                JSON.stringify(user)
            );

            postInput.value = "";

            renderPosts();

            updatePostCount();

        });

    }

    // ==========================================
    // RENDER POSTS
    // ==========================================

    function renderPosts() {

        if (!postsContainer) return;

        postsContainer.innerHTML = "";

        user.postsList.forEach(post => {

            const card = document.createElement("article");

            card.className = "post-card";

            card.innerHTML = `
                <div class="post-header">

                    <img src="${post.photo}"
                         class="mini-profile">

                    <div>

                        <h3>${post.author}</h3>

                        <small>
                            ${post.date}
                        </small>

                        <br>

                        <small>
                            ${post.generation}
                        </small>

                    </div>

                </div>

                <div class="post-body">

                    <p>${post.content}</p>

                </div>

                <div class="post-footer">

                    <button>❤️ Like</button>

                    <button>🌸 Flower</button>

                    <button>💬 Comment</button>

                    <button>🔄 Share</button>

                </div>
            `;

            postsContainer.appendChild(card);

        });

    }

    // ==========================================
    // UPDATE POSTS COUNT
    // ==========================================

    function updatePostCount() {

        const postCounter =
            document.getElementById("posts");

        if (postCounter) {

            postCounter.textContent =
                user.posts;

        }

    }

    // ==========================================
    // TIMELINE
    // ==========================================

    function addTimeline(activity) {

        user.timeline.unshift({

            activity: activity,
            time: new Date().toLocaleString()

        });

        if (user.timeline.length > 20) {

            user.timeline.pop();

        }

        renderTimeline();

    }

    function renderTimeline() {

        const timeline =
            document.querySelector(".timeline");

        if (!timeline) return;

        timeline.innerHTML = "";

        user.timeline.forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "timeline-item";

            div.innerHTML = `
                <strong>${item.activity}</strong>
                <br>
                <small>${item.time}</small>
            `;

            timeline.appendChild(div);

        });

    }

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    renderPosts();

    renderTimeline();

    updatePostCount();

});
/*==================================================
  PROFILE.JS - PART 4
  Final Features
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    let user = JSON.parse(localStorage.getItem("userData")) || {};

    // ==========================================
    // LOADING OVERLAY
    // ==========================================

    const loadingOverlay =
        document.getElementById("loadingOverlay");

    if (loadingOverlay) {

        loadingOverlay.style.display = "flex";

        setTimeout(() => {

            loadingOverlay.style.display = "none";

        }, 1200);

    }

    // ==========================================
    // SCROLL TO TOP
    // ==========================================

    const scrollBtn =
        document.getElementById("scrollTopBtn");

    window.addEventListener("scroll", () => {

        if (!scrollBtn) return;

        if (window.scrollY > 300) {

            scrollBtn.style.display = "block";

        } else {

            scrollBtn.style.display = "none";

        }

    });

    if (scrollBtn) {

        scrollBtn.addEventListener("click", () => {

            window.scrollTo({

                top: 0,
                behavior: "smooth"

            });

        });

    }

    // ==========================================
    // DARK MODE
    // ==========================================

    const darkBtn =
        document.querySelector(".icon-btn");

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

    }

    if (darkBtn) {

        darkBtn.addEventListener("click", () => {

            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {

                localStorage.setItem("theme", "dark");

            } else {

                localStorage.setItem("theme", "light");

            }

        });

    }

    // ==========================================
    // PROFILE VIEWS
    // ==========================================

    user.profileViews = (user.profileViews || 0) + 1;

    localStorage.setItem(
        "userData",
        JSON.stringify(user)
    );

    const views1 =
        document.getElementById("profileViews");

    const views2 =
        document.getElementById("footerProfileViews");

    if (views1) {

        views1.textContent =
            user.profileViews;

    }

    if (views2) {

        views2.textContent =
            user.profileViews;

    }

    // ==========================================
    // REPUTATION
    // ==========================================

    user.reputation =
        (user.posts || 0) * 10 +
        (user.videos || 0) * 20 +
        (user.followers || 0);

    localStorage.setItem(
        "userData",
        JSON.stringify(user)
    );

    const reputation =
        document.getElementById("reputation");

    if (reputation) {

        reputation.textContent =
            user.reputation;

    }

    // ==========================================
    // XP SYSTEM
    // ==========================================

    const xp = user.generationXP || 0;

    const level = Math.floor(xp / 100) + 1;

    const levelText =
        document.getElementById("levelText");

    if (levelText) {

        levelText.textContent =
            "Level " + level;

    }

    const xpBar =
        document.getElementById("progressFill");

    if (xpBar) {

        xpBar.style.width =
            (xp % 100) + "%";

    }

    const xpText =
        document.getElementById("xpText");

    if (xpText) {

        xpText.textContent =
            (xp % 100) + " / 100 XP";

    }

    // ==========================================
    // SHARE PROFILE
    // ==========================================

    const shareBtn =
        document.getElementById("shareProfileBtn");

    if (shareBtn) {

        shareBtn.addEventListener("click", async () => {

            if (navigator.share) {

                try {

                    await navigator.share({

                        title: "Gene-rations Profile",

                        text:
                        user.fullName +
                        "'s Gene-rations Profile",

                        url: location.href

                    });

                } catch (e) {

                    console.log(e);

                }

            } else {

                navigator.clipboard.writeText(location.href);

                alert("Profile link copied.");

            }

        });

    }

    // ==========================================
    // SETTINGS BUTTON
    // ==========================================

    const settingsBtn =
        document.getElementById("settingsBtn");

    if (settingsBtn) {

        settingsBtn.addEventListener("click", () => {

            alert("Settings page coming soon.");

        });

    }

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const passwordBtn =
        document.getElementById("changePasswordBtn");

    if (passwordBtn) {

        passwordBtn.addEventListener("click", () => {

            window.location.href =
                "resetpassword.html";

        });

    }

    // ==========================================
    // PRIVACY SETTINGS
    // ==========================================

    const privacyBtn =
        document.getElementById("privacyBtn");

    if (privacyBtn) {

        privacyBtn.addEventListener("click", () => {

            alert("Privacy settings coming soon.");

        });

    }

    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            if (confirm("Logout of Gene-rations?")) {

                localStorage.removeItem("loggedInUser");

                window.location.href =
                    "login.html";

            }

        });

    }

    // ==========================================
    // LAST ACTIVE
    // ==========================================

    const lastActive =
        document.getElementById("lastActive");

    if (lastActive) {

        lastActive.textContent =
            new Date().toLocaleString();

    }

});