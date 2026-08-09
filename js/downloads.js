import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let editingId = null;

export async function initDownloads() {

    const table = document.getElementById("downloadTable");

    const modal = document.getElementById("downloadModal");

    const addBtn = document.getElementById("addDownloadBtn");

    const cancelBtn = document.getElementById("cancelDownload");

    const saveBtn = document.getElementById("saveDownload");

    const title = document.getElementById("downloadTitle");

    const url = document.getElementById("downloadUrl");

    const category = document.getElementById("downloadCategory");

    const description = document.getElementById("downloadDescription");

    function clearForm() {

        editingId = null;

        title.value = "";
        url.value = "";
        category.value = "";
        description.value = "";

        saveBtn.textContent = "Publish";
    }

    addBtn.onclick = () => {

        clearForm();

        modal.classList.remove("hidden");

    };

    cancelBtn.onclick = () => {

        modal.classList.add("hidden");

    };

    saveBtn.onclick = async () => {

        if (!title.value.trim() || !url.value.trim()) {

            showToast("Please fill all required fields.", "warning");

            return;

        }

        const data = {

            title: title.value.trim(),

            url: url.value.trim(),

            category: category.value.trim(),

            description: description.value.trim(),

            created: serverTimestamp()

        };

        try {

            if (editingId) {

                await updateDoc(
                    doc(db, "downloads", editingId),
                    data
                );

            } else {

                await addDoc(
                    collection(db, "downloads"),
                    data
                );

            }

            modal.classList.add("hidden");

            clearForm();

            await loadDownloads();

            showToast("Download saved successfully.");

        } catch (err) {

            console.error(err);

            showToast(err.message, "error");

        }

    };

    async function loadDownloads() {

        const snapshot = await getDocs(collection(db, "downloads"));

        table.innerHTML = "";

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:40px;">
                        No downloads found
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach(documentData => {

            const item = documentData.data();

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>📄 File</td>

                <td>${item.title}</td>

                <td>${item.category || "-"}</td>

                <td>

                    <button class="editBtn">
                        Edit
                    </button>

                    <button class="deleteBtn">
                        Delete
                    </button>

                </td>

            `;

            row.querySelector(".editBtn").onclick = () => {

                editingId = documentData.id;

                title.value = item.title;
                url.value = item.url;
                category.value = item.category || "";
                description.value = item.description || "";

                saveBtn.textContent = "Update";

                modal.classList.remove("hidden");

            };

            row.querySelector(".deleteBtn").onclick = async () => {

                if (!confirm("Delete this download?")) return;

                await deleteDoc(
                    doc(db, "downloads", documentData.id)
                );

                loadDownloads();

            };

            table.appendChild(row);

        });

    }

    await loadDownloads();

}