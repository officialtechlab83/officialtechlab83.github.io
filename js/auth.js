import { auth } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

// Always ask which Google account to use
provider.setCustomParameters({
    prompt: "select_account"
});

const loginBtn = document.getElementById("loginBtn");

// If already logged in, go to dashboard
onAuthStateChanged(auth, (user) => {

    if (user) {
        window.location.href="/admin/";
    }

});

loginBtn.addEventListener("click", async () => {

    try {

        await signInWithPopup(auth, provider);

        window.location.href="/admin/";
    } catch (error) {

        console.error(error);
        showToast(err.message, "error");

    }

});