import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { loadPage } from "./router.js";

const ALLOWED_EMAIL = "officialtechlab83@gmail.com";

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const userPhoto = document.getElementById("userPhoto");
const logoutBtn = document.getElementById("logoutBtn");

const subtitles = {
    dashboard: "Welcome to TechLab CMS",
    videos: "Manage all your YouTube videos",
    guides: "Manage your step-by-step guides",
    categories: "Manage your website categories",
    settings: "CMS Settings"
};

async function openPage(page){

    document.querySelectorAll(".nav-btn").forEach(btn=>{
        btn.classList.remove("active");
    });

    document
        .querySelector(`[data-page="${page}"]`)
        ?.classList.add("active");

    pageTitle.textContent =
        page.charAt(0).toUpperCase()+page.slice(1);

    pageSubtitle.textContent =
        subtitles[page] || "";

    await loadPage(page);

}

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="./login.html";

        return;

    }

    if(user.email!==ALLOWED_EMAIL){

        showToast("Access denied.");

        await signOut(auth);

        window.location.href="./login.html";

        return;

    }

    if(user.photoURL){

        userPhoto.src=user.photoURL;

    }

    await openPage("dashboard");

});

document.querySelectorAll(".nav-btn").forEach(btn=>{

    btn.onclick=()=>{

        openPage(btn.dataset.page);

    };

});

logoutBtn.onclick=async()=>{

    await signOut(auth);

    wwindow.location.href="./login.html";

};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

window.showToast = function(message, type = "success") {

    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    let icon = "✓";

    if (type === "error") {
        icon = "✕";
    }

    if (type === "warning") {
        icon = "!";
    }

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("toast-hide");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);

}

// ==========================================
// CONFIRMATION MODAL
// ==========================================

let confirmAction = null;

window.showConfirm = function (
    title,
    message,
    action,
    actionText = "Delete",
    actionType = "danger"
) {

    const modal =
        document.getElementById("confirmModal");

    const titleElement =
        document.getElementById("confirmTitle");

    const messageElement =
        document.getElementById("confirmMessage");

    const proceedButton =
        document.getElementById("confirmProceed");

    const cancelButton =
        document.getElementById("confirmCancel");

    if (!modal) return;

    titleElement.textContent = title;

    messageElement.textContent = message;

    proceedButton.textContent = actionText;

    proceedButton.className =
        actionType === "danger"
            ? "confirm-delete"
            : "confirm-proceed";

    confirmAction = action;

    modal.classList.remove("hidden");

    proceedButton.onclick = async () => {

        if (!confirmAction) return;

        const currentAction = confirmAction;

        modal.classList.add("hidden");

        confirmAction = null;

        try {

            await currentAction();

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Something went wrong.",
                "error"
            );

        }

    };

    cancelButton.onclick = () => {

        modal.classList.add("hidden");

        confirmAction = null;

    };

};

// ==========================================
// GLOBAL SEARCH
// ==========================================

const globalSearch =
    document.getElementById("globalSearch");

if (globalSearch) {

    globalSearch.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter")
                return;

            const searchTerm =
                globalSearch.value.trim();

            if (!searchTerm)
                return;

            // Open Videos page
            document
                .querySelector('[data-page="videos"]')
                ?.click();

            // Wait for Videos page to load
            setTimeout(() => {

                const videoSearch =
                    document.getElementById("videoSearch");

                if (videoSearch) {

                    videoSearch.value =
                        searchTerm;

                    videoSearch.dispatchEvent(
                        new Event("input", {
                            bubbles: true
                        })
                    );

                }

            }, 300);

        }
    );

}