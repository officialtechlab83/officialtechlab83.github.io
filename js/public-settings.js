import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadSettings() {

    const snap = await getDoc(doc(db, "settings", "website"));

    if (!snap.exists()) return;

    const data = snap.data();

    // Website Title
    const title = document.getElementById("siteTitle");
    if (title) title.textContent = data.siteName;

    // Welcome Message
    const welcome = document.getElementById("welcomeText");
    if (welcome) welcome.textContent = data.welcomeMessage;

    // Footer Links
    const yt = document.getElementById("youtubeLink");
    if (yt) yt.href = data.youtube;

    const insta = document.getElementById("instagramLink");
    if (insta) insta.href = data.instagram;

    const telegram = document.getElementById("telegramLink");
    if (telegram) telegram.href = data.telegram;

    const email = document.getElementById("emailLink");
    if (email) email.href = "mailto:" + data.email;

}

loadSettings();