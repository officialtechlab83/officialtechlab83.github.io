import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let editingId = null;

export async function initCategories() {

    const table = document.getElementById("categoryTable");

    const modal = document.getElementById("categoryModal");

    const addBtn = document.getElementById("addCategoryBtn");

    const cancelBtn = document.getElementById("cancelCategory");

    const saveBtn = document.getElementById("saveCategory");

    const nameInput = document.getElementById("categoryName");

    function resetForm() {

        editingId = null;

        nameInput.value = "";

        saveBtn.textContent = "Save";

    }

    addBtn.onclick = () => {

        resetForm();

        modal.classList.remove("hidden");

    };

    cancelBtn.onclick = () => {

        modal.classList.add("hidden");

    };

    saveBtn.onclick = async () => {

        const name = nameInput.value.trim();

        if (!name) {

            showToast("Enter a category name.", "warning");

            return;

        }

        // Prevent duplicate category names

        const existing = await getDocs(collection(db, "categories"));

        let duplicate = false;

        existing.forEach(docSnap => {

            const data = docSnap.data();

            if (
                data.name.toLowerCase() === name.toLowerCase() &&
                docSnap.id !== editingId
            ) {
                duplicate = true;
            }

        });

        if (duplicate) {

            showToast("Category already exists.");

            return;

        }

        if (editingId) {

            await updateDoc(
                doc(db, "categories", editingId),
                { name }
            );

        } else {

            await addDoc(
                collection(db, "categories"),
                { name }
            );

        }

        modal.classList.add("hidden");

        await loadCategories();

    };

    async function loadCategories() {

        table.innerHTML = "";

        const snapshot = await getDocs(collection(db, "categories"));

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;padding:40px;">
                        No categories found
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach(categoryDoc => {

            const category = categoryDoc.data();

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${category.name}</td>

                <td class="videoCount">
                    Loading...
                </td>

                <td>

<div class="action-buttons">

<button class="editBtn" title="Edit Category">
    <i class="fa-solid fa-pen"></i>
</button>

<button class="deleteBtn" title="Delete Category">
    <i class="fa-solid fa-trash"></i>
</button>

</div>

</td>
            `;

            // Count videos using this category

            loadVideoCount(
                row.querySelector(".videoCount"),
                category.name
            );

            row.querySelector(".editBtn").onclick = () => {

                editingId = categoryDoc.id;

                nameInput.value = category.name;

                saveBtn.textContent = "Update";

                modal.classList.remove("hidden");

            };

           row.querySelector(".deleteBtn").onclick = async () => {

    try {

        // Check whether videos use this category

        const videoQuery = query(
            collection(db, "videos"),
            where("category", "==", category.name)
        );

        const videoSnapshot = await getDocs(videoQuery);

        const videoCount = videoSnapshot.size;


        // Prevent deletion if videos exist

        if (videoCount > 0) {

            showToast(
                `Cannot delete "${category.name}". It is used by ${videoCount} video${videoCount === 1 ? "" : "s"}.`,
                "warning"
            );

            return;

        }


        // No videos → show confirmation

        showConfirm(

            "Delete category?",

            `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,

            async () => {

                await deleteDoc(
                    doc(
                        db,
                        "categories",
                        categoryDoc.id
                    )
                );

                await loadCategories();

                showToast(
                    "Category deleted successfully."
                );

            },

            "Delete",

            "danger"

        );

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to check category usage.",
            "error"
        );

    }

};

            table.appendChild(row);

        });

    }

    async function loadVideoCount(cell, categoryName) {

        const q = query(
            collection(db, "videos"),
            where("category", "==", categoryName)
        );

        const snapshot = await getDocs(q);

        cell.textContent = snapshot.size;

    }

    await loadCategories();

}