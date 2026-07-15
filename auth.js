const user =
JSON.parse(
    localStorage.getItem("user")
);

console.log(user);

localStorage.setItem(
    "user",
    JSON.stringify(userData)
);