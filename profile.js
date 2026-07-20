// ===============================
// Gene-rations Profile JavaScript
// ===============================

// Load user data
const user = JSON.parse(localStorage.getItem("user"));

// Check if user exists
if (!user) {
    alert("Please log in first.");
    window.location.href = "login.html";
}

// Load user details
document.getElementById("fullName").textContent =
    user.fullName || user.username || "Gene-rations User";

document.getElementById("email").textContent =
    user.email || "Not Available";

document.getElementById("phone").textContent =
    user.phone || "Not Available";

document.getElementById("gender").textContent =
    user.gender || "Not Specified";

document.getElementById("dob").textContent =
    user.dob || "Not Available";

document.getElementById("bio").textContent =
    user.bio || "Welcome to Gene-rations!";

document.getElementById("generation").textContent =
    user.generation || "Unknown";

// ===============================
// Statistics
// ===============================

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

// ===============================
// Generation Badge
// ===============================

const badge =
document.getElementById("generationBadge");

switch(user.generation){

case "Generation Alpha":

badge.textContent =
"🌟 Alpha Pioneer";

badge.classList.add("alpha");

break;

case "Generation Z":

badge.textContent =
"🚀 Digital Creator";

badge.classList.add("genz");

break;

case "Millennial":

badge.textContent =
"💎 Innovation Leader";

badge.classList.add("millennial");

break;

case "Generation X":

badge.textContent =
"🏅 Legacy Builder";

badge.classList.add("genx");

break;

case "Baby Boomer":

badge.textContent =
"👑 Wisdom Keeper";

badge.classList.add("boomer");

break;

default:

badge.textContent =
"📜 Heritage Guardian";

badge.classList.add("silent");

}

// ===============================
// Profile Picture
// ===============================

const profileImage =
document.getElementById("profileImage");

if(localStorage.getItem("profileImage")){

profileImage.src =
localStorage.getItem("profileImage");

}

document
.getElementById("uploadPhoto")
.addEventListener("click",()=>{

document
.getElementById("photoInput")
.click();

});

document
.getElementById("photoInput")
.addEventListener("change",function(){

const file =
this.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload=function(e){

profileImage.src =
e.target.result;

localStorage.setItem(
"profileImage",
e.target.result
);

}

reader.readAsDataURL(file);

});

// ===============================
// Edit Profile
// ===============================

document
.getElementById("editProfile")
.addEventListener("click",()=>{

const bio =
prompt(
"Update your bio:",
user.bio || ""
);

if(bio !== null){

user.bio = bio;

localStorage.setItem(
"user",
JSON.stringify(user)
);

document
.getElementById("bio")
.textContent = bio;

}

});

// ===============================
// Recent Activity
// ===============================

const activity =
document.getElementById("activityList");

activity.innerHTML = `
<p>✅ Joined Gene-rations</p>
<p>🏆 Earned the ${user.generation} badge</p>
<p>👤 Updated profile successfully</p>
`;

// ===============================
// Logout
// ===============================

document
.getElementById("logout")
.addEventListener("click",()=>{

if(confirm("Logout of Gene-rations?")){

localStorage.removeItem("user");

window.location.href =
"login.html";

}

});