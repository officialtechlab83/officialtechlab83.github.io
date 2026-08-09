import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function initSettings() {



    const siteName = document.getElementById("siteName");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const youtubeLink = document.getElementById("youtubeLink");
    const instagramLink = document.getElementById("instagramLink");
    const telegramLink = document.getElementById("telegramLink");
    const emailLink = document.getElementById("emailLink");
    const saveBtn = document.getElementById("saveSettings");
    const backupBtn = document.getElementById("backupBtn");
    const settingsRef = doc(db, "settings", "website");

const restoreBtn = document.getElementById("restoreBtn");

const restoreFile = document.getElementById("restoreFile");

restoreBtn.onclick = () => {

    restoreFile.click();

};

    

    async function loadSettings() {

        const snap = await getDoc(settingsRef);

        if (!snap.exists()) return;

        const data = snap.data();

        siteName.value = data.siteName || "";
        welcomeMessage.value = data.welcomeMessage || "";
        youtubeLink.value = data.youtube || "";
        instagramLink.value = data.instagram || "";
        telegramLink.value = data.telegram || "";
        emailLink.value = data.email || "";

    }

    saveBtn.onclick = async () => {

        await setDoc(settingsRef, {

            siteName: siteName.value,

            welcomeMessage: welcomeMessage.value,

            youtube: youtubeLink.value,

            instagram: instagramLink.value,

            telegram: telegramLink.value,

            email: emailLink.value

        });

        showToast("✅ Website Settings Saved");

    };

    await loadSettings();



    // ==========================================
    // BACKUP DATABASE
    // ==========================================

    backupBtn.onclick = async () => {

        try {

            backupBtn.disabled = true;

            backupBtn.textContent =
                "Creating Backup...";


            const backup = {};


            // ---------- Website Settings ----------

            const websiteDoc =
                await getDoc(
                    doc(db, "settings", "website")
                );


            backup.website =
                websiteDoc.exists()
                    ? websiteDoc.data()
                    : {};


            // ---------- Videos ----------

            const videosSnapshot =
                await getDocs(
                    collection(db, "videos")
                );


            backup.videos = [];


            videosSnapshot.forEach(
                docSnap => {

                    backup.videos.push({

                        id: docSnap.id,

                        ...docSnap.data()

                    });

                }
            );


            // ---------- Categories ----------

            const categoriesSnapshot =
                await getDocs(
                    collection(db, "categories")
                );


            backup.categories = [];


            categoriesSnapshot.forEach(
                docSnap => {

                    backup.categories.push({

                        id: docSnap.id,

                        ...docSnap.data()

                    });

                }
            );


            // ---------- Create JSON ----------

            const json =
                JSON.stringify(
                    backup,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const a =
                document.createElement("a");


            const date =
                new Date()
                    .toISOString()
                    .split("T")[0];


            a.href = url;

            a.download =
                `techlab-backup-${date}.json`;


            document.body.appendChild(a);

            a.click();

            a.remove();


            URL.revokeObjectURL(url);


            showToast(
                "Backup created successfully."
            );


        } catch (err) {

            console.error(
                "Backup error:",
                err
            );


            showToast(
                err.message,
                "error"
            );


        } finally {

            backupBtn.disabled = false;

            backupBtn.textContent =
                "💾 Backup Database";

        }

    };


    // ==========================================
    // RESTORE DATABASE
    // ==========================================

    restoreBtn.onclick = () => {

        restoreFile.value = "";

        restoreFile.click();

    };


    restoreFile.onchange =
        async (e) => {

        try {

            const file =
                e.target.files[0];


            if (!file)
                return;


            // ---------- Read backup ----------

            const text =
                await file.text();


            const backup =
                JSON.parse(text);


            // ---------- Validate backup ----------

            if (
                !backup ||
                !Array.isArray(backup.videos) ||
                !Array.isArray(backup.categories)
            ) {

                showToast(
                    "Invalid TechLab backup file.",
                    "error"
                );

                return;

            }


            // ---------- Confirmation ----------

            const confirmed =
                confirm(

`Restore this backup?

This will overwrite your current:

• Website Settings
• Videos
• Categories

Continue?`

                );


            if (!confirmed)
                return;


            // ======================================
            // RESTORE WEBSITE SETTINGS
            // ======================================

            await setDoc(

                doc(
                    db,
                    "settings",
                    "website"
                ),

                backup.website || {}

            );


            // ======================================
            // DELETE EXISTING VIDEOS
            // ======================================

            const currentVideos =
                await getDocs(
                    collection(db, "videos")
                );


            let batch =
                writeBatch(db);


            let operationCount = 0;


            for (
                const videoDoc
                of currentVideos.docs
            ) {

                batch.delete(
                    videoDoc.ref
                );

                operationCount++;


                if (
                    operationCount >= 450
                ) {

                    await batch.commit();

                    batch =
                        writeBatch(db);

                    operationCount = 0;

                }

            }


            // ======================================
            // DELETE EXISTING CATEGORIES
            // ======================================

            const currentCategories =
                await getDocs(
                    collection(db, "categories")
                );


            for (
                const categoryDoc
                of currentCategories.docs
            ) {

                batch.delete(
                    categoryDoc.ref
                );

                operationCount++;


                if (
                    operationCount >= 450
                ) {

                    await batch.commit();

                    batch =
                        writeBatch(db);

                    operationCount = 0;

                }

            }


            // ======================================
            // ADD BACKUP VIDEOS
            // ======================================

            for (
                const video
                of backup.videos
            ) {

                if (!video.id)
                    continue;


                const videoData = {
                    ...video
                };


                delete videoData.id;


                batch.set(

                    doc(
                        db,
                        "videos",
                        video.id
                    ),

                    videoData

                );


                operationCount++;


                if (
                    operationCount >= 450
                ) {

                    await batch.commit();

                    batch =
                        writeBatch(db);

                    operationCount = 0;

                }

            }


            // ======================================
            // ADD BACKUP CATEGORIES
            // ======================================

            for (
                const category
                of backup.categories
            ) {

                if (!category.id)
                    continue;


                const categoryData = {
                    ...category
                };


                delete categoryData.id;


                batch.set(

                    doc(
                        db,
                        "categories",
                        category.id
                    ),

                    categoryData

                );


                operationCount++;


                if (
                    operationCount >= 450
                ) {

                    await batch.commit();

                    batch =
                        writeBatch(db);

                    operationCount = 0;

                }

            }


            // ======================================
            // COMMIT REMAINING OPERATIONS
            // ======================================

            if (
                operationCount > 0
            ) {

                await batch.commit();

            }


            showToast(
                "Database restored successfully."
            );


        } catch (err) {

            console.error(
                "Restore error:",
                err
            );


            showToast(
                "Restore failed: " +
                err.message,
                "error"
            );


        } finally {

            restoreFile.value = "";

        }

    };
}