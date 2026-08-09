import { db } from "./firebase.js";
import { getVideoId } from "./video-utils.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let editingId = null;

let allVideos = [];

let filteredVideos = [];

let currentPage = 1;

let selectedVideos = new Set();

const videosPerPage = 10;

let table;
let pagination;

let modal;

let addBtn;
let cancelBtn;
let saveBtn;

let titleInput;
let urlInput;
let categoryInput;
let descriptionInput;

let searchInput;
let categoryFilter;
let featuredFilter;

export async function initVideos() {

    table = document.getElementById("videoTable");

    pagination = document.getElementById("pagination");

    modal = document.getElementById("videoModal");

    addBtn = document.getElementById("addVideoBtn");

    cancelBtn = document.getElementById("cancelVideo");

    saveBtn = document.getElementById("saveVideo");

    titleInput = document.getElementById("videoTitle");

    urlInput = document.getElementById("videoUrl");

    categoryInput = document.getElementById("videoCategory");

    descriptionInput =
        document.getElementById("videoDescription");

    searchInput =
        document.getElementById("searchVideo");

    categoryFilter =
        document.getElementById("filterCategory");

    featuredFilter =
        document.getElementById("filterFeatured");

       addBtn.onclick = () => {

    editingId = null;

    titleInput.value = "";

    urlInput.value = "";

    categoryInput.value = "";

    descriptionInput.value = "";

    saveBtn.textContent = "Publish";

    modal.classList.remove("hidden");

};

cancelBtn.onclick = () => {

    modal.classList.add("hidden");

};

saveBtn.onclick = async () => {

    if (!titleInput.value.trim()) {

        showToast("Please enter video title.", "warning");

        return;

    }

    if (!urlInput.value.trim()) {

        showToast("Please enter YouTube URL.", "warning");

        return;

    }

    const ytId = getVideoId(urlInput.value);

    if (!ytId) {

        showToast("Invalid YouTube URL.", "error");

        return;

    }

    const data = {

        title: titleInput.value.trim(),

        url: urlInput.value.trim(),

        category: categoryInput.value,

        description: descriptionInput.value.trim(),

        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`

    };

    try {

        if (editingId) {

            await updateDoc(

                doc(db, "videos", editingId),

                data

            );

        }

        else {

            data.featured = false;

            data.created = serverTimestamp();

            await addDoc(

                collection(db, "videos"),

                data

            );

        }

        modal.classList.add("hidden");


        showToast(
    editingId
        ? "Video updated successfully."
        : "Video added successfully."
);

editingId = null;

        await loadVideos();

        renderVideos();

    }

    catch (err) {

        console.error(err);

        showToast(err.message, "error");

    }

};

searchInput.oninput = applyFilters;

categoryFilter.onchange = applyFilters;

featuredFilter.onchange = applyFilters;

await loadCategories();

await loadVideos();

renderVideos();

setupVideoSelection();

}

async function loadCategories() {

    const snapshot = await getDocs(

        query(

            collection(db, "categories"),

            orderBy("name")

        )

    );

    categoryInput.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    categoryFilter.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;

    snapshot.forEach(doc => {

        const category = doc.data();

        categoryInput.innerHTML += `
            <option value="${category.name}">
                ${category.name}
            </option>
        `;

        categoryFilter.innerHTML += `
            <option value="${category.name}">
                ${category.name}
            </option>
        `;

    });

}

async function loadVideos() {

    const snapshot = await getDocs(

        query(

            collection(db, "videos"),

            orderBy("created", "desc")

        )

    );

    allVideos = [];

    snapshot.forEach(documentData => {

        allVideos.push({

            id: documentData.id,

            ...documentData.data()

        });

    });

    filteredVideos = [...allVideos];

}

function applyFilters() {

    const search =
        searchInput.value.toLowerCase().trim();

    const category =
        categoryFilter.value;

    const featured =
        featuredFilter.value;

    filteredVideos = allVideos.filter(video => {

        const matchSearch =

            video.title
            .toLowerCase()
            .includes(search);

        const matchCategory =

            !category ||

            video.category === category;

        const matchFeatured =

            !featured ||

            String(!!video.featured) === featured;

        return (

            matchSearch &&

            matchCategory &&

            matchFeatured

        );

    });

    currentPage = 1;

    renderVideos();

}

function renderVideos() {

    table.innerHTML = "";

    if (filteredVideos.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:40px;">
                No videos found
            </td>
        </tr>
        `;

        pagination.innerHTML = "";

        return;

    }

    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

    if (currentPage > totalPages)
        currentPage = totalPages;

    const start = (currentPage - 1) * videosPerPage;

    const end = start + videosPerPage;

    const videos = filteredVideos.slice(start, end);

    videos.forEach((video, index) => {

        const row = document.createElement("tr");

const number =
(start + index + 1);

        row.innerHTML = `

        <td class="col-select">
    <input
        type="checkbox"
        class="video-select"
        data-id="${video.id}">
</td>

<td class="col-number">
    <strong>${number}</strong>
</td>

<td class="col-thumbnail">
    <a href="${video.url}" target="_blank">
        <img src="${video.thumbnail}">
    </a>
</td>

<td class="col-title">

<div class="video-info">

<div class="video-name">
${video.title}
</div>

<div class="video-desc">
${video.description || "No description"}
</div>

</div>

</td>

<td class="col-category">

<span class="badge category-badge">

${video.category || "None"}

</span>

</td>

<td class="col-feature">

<div class="feature-area">

<span class="${
video.featured
? "badge badge-featured"
: "badge badge-normal"
}">
${video.featured ? "Featured" : "Normal"}
</span>

<button class="featureBtn">

${video.featured ? "★" : "☆"}

</button>

</div>

</td>

<td class="col-date">
${
video.created?.seconds
? new Date(video.created.seconds * 1000).toLocaleString()
: "-"
}
</td>

<td class="col-actions">

<div class="action-buttons">

<button class="editBtn">
<i class="fa-solid fa-pen"></i>
</button>

<button class="copyBtn">
<i class="fa-regular fa-copy"></i>
</button>

<button class="deleteBtn">
<i class="fa-solid fa-trash"></i>
</button>

</div>

</td>

`;

const checkbox =
    row.querySelector(".video-select");

checkbox.onchange = () => {

    const id = checkbox.dataset.id;

    if (checkbox.checked) {

        selectedVideos.add(id);

    } else {

        selectedVideos.delete(id);

    }

    updateSelectionUI();

};

// ---------- Feature Button ----------

row.querySelector(".featureBtn").onclick = async () => {

    await updateDoc(
        doc(db, "videos", video.id),
        {
            featured: !video.featured
        }
    );

    await loadVideos();

    renderVideos();

};




// ---------- Edit Button ----------

row.querySelector(".editBtn").onclick = () => {

    editingId = video.id;

    titleInput.value = video.title;

    urlInput.value = video.url;

    categoryInput.value = video.category || "";

    descriptionInput.value = video.description || "";

    saveBtn.textContent = "Update";

    modal.classList.remove("hidden");

};

row.querySelector(".copyBtn").onclick = () => {

    navigator.clipboard.writeText(video.url);

    showToast("Video link copied.");

};


// ---------- Delete Button ----------

row.querySelector(".deleteBtn").onclick = () => {

    showConfirm(
        "Delete video?",
        `Are you sure you want to delete "${video.title}"? This action cannot be undone.`,

        async () => {

            await deleteDoc(
                doc(db, "videos", video.id)
            );

            await loadVideos();

            renderVideos();

            showToast(
                "Video deleted successfully."
            );

        },

        "Delete",
        "danger"
    );

};

        table.appendChild(row);

    });

    renderPagination(totalPages);

}

function renderPagination(totalPages) {

    pagination.innerHTML = "";

    if (totalPages <= 1)
        return;

    for (let i = 1; i <= totalPages; i++) {

        const btn = document.createElement("button");

        btn.textContent = i;

        if (i === currentPage)
            btn.classList.add("active");

        btn.onclick = () => {

            currentPage = i;

            renderVideos();

        };

        pagination.appendChild(btn);

    }

}

// ==========================================
// VIDEO SELECTION
// ==========================================

function setupVideoSelection() {

    const selectAll =
        document.getElementById("selectAllVideos");

    const bulkFeatureBtn =
        document.getElementById("bulkFeatureBtn");

    const bulkDeleteBtn =
        document.getElementById("bulkDeleteBtn");


    // ---------- Select All ----------

    if (selectAll) {

        selectAll.onchange = () => {

            const checkboxes =
                document.querySelectorAll(".video-select");

            checkboxes.forEach(checkbox => {

                checkbox.checked =
                    selectAll.checked;

                const id =
                    checkbox.dataset.id;

                if (selectAll.checked) {

                    selectedVideos.add(id);

                } else {

                    selectedVideos.delete(id);

                }

            });

            updateSelectionUI();

        };

    }


    // ---------- Bulk Feature ----------

    if (bulkFeatureBtn) {

        bulkFeatureBtn.onclick = async () => {

            if (selectedVideos.size === 0) {

                showToast(
                    "Please select at least one video.",
                    "warning"
                );

                return;

            }

            const count =
                selectedVideos.size;

                const selectedVideoObjects =
    allVideos.filter(video =>
        selectedVideos.has(video.id)
    );

const allFeatured =
    selectedVideoObjects.length > 0 &&
    selectedVideoObjects.every(
        video => video.featured === true
    );

const newFeaturedState =
    !allFeatured;

            try {

                for (const videoId of selectedVideos) {

                    await updateDoc(

                        doc(
                            db,
                            "videos",
                            videoId
                        ),

                        {
                            featured: newFeaturedState
                        }

                    );

                }

                selectedVideos.clear();

                await loadVideos();

                renderVideos();

                updateSelectionUI();

                showToast(
                    `${count} video${count === 1 ? "" : "s"} ${newFeaturedState ? "featured" : "unfeatured"} successfully.`
                );

            }

            catch (error) {

                console.error(error);

                showToast(
                    error.message ||
                    "Unable to feature selected videos.",
                    "error"
                );

            }

        };

    }


    // ---------- Bulk Delete ----------

    if (bulkDeleteBtn) {

        bulkDeleteBtn.onclick = () => {

            if (selectedVideos.size === 0) {

                showToast(
                    "Please select at least one video.",
                    "warning"
                );

                return;

            }

            const count =
                selectedVideos.size;


            showConfirm(

                "Delete selected videos?",

                `Are you sure you want to permanently delete ${count} selected video${count === 1 ? "" : "s"}? This action cannot be undone.`,

                async () => {

                    try {

                        for (const videoId of selectedVideos) {

                            await deleteDoc(

                                doc(
                                    db,
                                    "videos",
                                    videoId
                                )

                            );

                        }

                        selectedVideos.clear();

                        await loadVideos();

                        renderVideos();

                        updateSelectionUI();

                        showToast(
                            `${count} video${count === 1 ? "" : "s"} deleted successfully.`
                        );

                    }

                    catch (error) {

                        console.error(error);

                        showToast(
                            error.message ||
                            "Unable to delete selected videos.",
                            "error"
                        );

                    }

                },

                "Delete",

                "danger"

            );

        };

    }

}


// ==========================================
// UPDATE SELECTION UI
// ==========================================

function updateSelectionUI() {

    const selectAll =
        document.getElementById("selectAllVideos");

    const checkboxes =
        document.querySelectorAll(".video-select");

    const bulkToolbar =
        document.getElementById("bulkToolbar");

    const selectedCount =
        document.getElementById("selectedCount");


    if (!selectAll)
        return;


    const checkedCount =
        document.querySelectorAll(
            ".video-select:checked"
        ).length;


    // ---------- Select All State ----------

    selectAll.checked =
        checkboxes.length > 0 &&
        checkedCount === checkboxes.length;

    selectAll.indeterminate =
        checkedCount > 0 &&
        checkedCount < checkboxes.length;


    // ---------- Selected Count ----------

    if (selectedCount) {

        selectedCount.textContent =
            `${selectedVideos.size} selected`;

    }

    // ---------- Bulk Feature Button ----------

const bulkFeatureBtn =
    document.getElementById("bulkFeatureBtn");

if (bulkFeatureBtn && selectedVideos.size > 0) {

    const selectedVideoObjects =
        allVideos.filter(video =>
            selectedVideos.has(video.id)
        );

    const allFeatured =
        selectedVideoObjects.length > 0 &&
        selectedVideoObjects.every(
            video => video.featured === true
        );

    if (allFeatured) {

        bulkFeatureBtn.innerHTML = `
            <i class="fa-solid fa-star-half-stroke"></i>
            Unfeature
        `;

    } else {

        bulkFeatureBtn.innerHTML = `
            <i class="fa-solid fa-star"></i>
            Feature
        `;

    }

}


    // ---------- Toolbar ----------

    if (bulkToolbar) {

        if (selectedVideos.size > 0) {

            bulkToolbar.classList.remove(
                "hidden"
            );

        } else {

            bulkToolbar.classList.add(
                "hidden"
            );

        }

    }

}