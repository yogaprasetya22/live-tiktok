const form = document.querySelector("form");
const newName = document.querySelector("#m");
const messages = document.querySelector("#messages");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const Uname = newName.value;
    if (Uname == "" || Uname == null) {
        alert("Please enter a name");
        return;
    }
    socket.emit("setUniqueId", Uname);
});

let roleColors = {
    baseViewer: "#ffb88f",
    follower: "#94ff2f",
    subscriber: "#ff43c0",
    moderator: "#4a83ff",
};

const pushChat = (msg) => {
    const dataUser = JSON.parse(msg);
    let newMsg = document.createElement("li");
    let newPfp = document.createElement("img");
    let displayName = document.createElement("p");
    let nameColor = colorName(dataUser.roles);
    newPfp.src = dataUser.pfp;
    newPfp.style.width = "14px";
    newPfp.style.height = "14px";
    displayName.style.color = roleColors[nameColor];
    displayName.innerHTML = " " + dataUser.uName;
    displayName.style.display = "inline";
    displayName.prepend(newPfp);
    newMsg.append(displayName, document.createTextNode(": " + dataUser.value));
    messages.appendChild(newMsg);
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;

    window.scrollTo(0, document.body.scrollHeight);
};
socket.on("newChat", (data) => {
    pushChat(data);
});

function colorName(userRoles) {
    if (userRoles[0] == true) {
        return "moderator";
    } else if (userRoles[1] == true) {
        return "subscriber";
    } else if (userRoles[2] == 1) {
        return "follower";
    } else return "baseViewer";
}

// const viewCout = document.querySelector("#viewCount");
// socket.on("updateViewCount", (data) => {
//     pushViewCount(data.value);
// });
// const pushViewCount = (count) => {
//     viewCout.textContent = `Viewers: ${count}`;
// };
