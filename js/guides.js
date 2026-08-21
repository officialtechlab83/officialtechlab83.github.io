import { db } from "./firebase.js";

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

let allGuides = [];

let filteredGuides = [];

let currentPage = 1;

const guidesPerPage = 10;


export async function initGuides() {

    const table =
        document.getElementById("guideTable");

    const pagination =
        document.getElementById("guidePagination");

    const addBtn =
        document.getElementById("addGuideBtn");


    const modal =
        document.getElementById("guideModal");

    const cancelBtn =
        document.getElementById("cancelGuide");

    const saveBtn =
        document.getElementById("saveGuide");

    const titleInput =
        document.getElementById("guideTitle");

    const descriptionInput =
        document.getElementById("guideDescription");

    const readTimeInput =
        document.getElementById("guideReadTime");

    const statusInput =
        document.getElementById("guideStatus");

    const modalTitle =
        document.getElementById("guideModalTitle");

    const searchInput =
        document.getElementById("searchGuide");

        const addStepBtn =
    document.getElementById("addStepBtn");

const guideStepsContainer =
    document.getElementById("guideSteps");

let guideSteps = [];


    // ==========================================
    // ADD GUIDE
    // ==========================================

    addBtn.onclick = () => {

    editingId = null;

    titleInput.value = "";
    descriptionInput.value = "";
    readTimeInput.value = "";
    statusInput.value = "draft";

    guideSteps = [];

    renderGuideSteps();

    modalTitle.textContent =
        "Add Guide";

    saveBtn.textContent =
        "Save Guide";

    modal.classList.remove("hidden");

};

    // ==========================================
// ADD GUIDE STEP
// ==========================================

addStepBtn.onclick = () => {

    guideSteps.push({

        title: "",

        text: "",

        image: "",

        link: ""

    });

    renderGuideSteps();

};


    // ==========================================
    // CANCEL
    // ==========================================

    cancelBtn.onclick = () => {

        modal.classList.add("hidden");

    };

    // ==========================================
// RENDER GUIDE STEPS
// ==========================================

function renderGuideSteps() {

    guideStepsContainer.innerHTML = "";


    if (guideSteps.length === 0) {

        guideStepsContainer.innerHTML = `

            <div
                style="
                text-align:center;
                padding:20px;
                color:#7f91aa;
                border:1px dashed #30425d;
                border-radius:8px;
                "
            >

                No steps added yet.
                Click "Add Step" to begin.

            </div>

        `;

        return;

    }


    guideSteps.forEach(
        (step, index) => {

            const stepBox =
                document.createElement("div");


            stepBox.style.cssText = `
                background:#121c2d;
                border:1px solid #30425d;
                border-radius:8px;
                padding:14px;
                margin-bottom:10px;
            `;


            stepBox.innerHTML = `

                <div
                    style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px;
                    "
                >

                    <strong
                        style="
                        color:#e0c25a;
                        font-size:13px;
                        "
                    >
                        Step ${index + 1}
                    </strong>


                    <button
                        type="button"
                        class="delete-step-btn"
                        style="
                        border:0;
                        background:#ef4444;
                        color:white;
                        border-radius:6px;
                        padding:5px 9px;
                        cursor:pointer;
                        "
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>


                <input
                    type="text"
                    class="step-title"
                    placeholder="Step heading"
                    value="${step.title}"
                >


                <textarea
                    class="step-text"
                    placeholder="Explain what the user needs to do in this step..."
                >${step.text}</textarea>


                <div style="margin-top:10px;">

    <label
        style="
        display:block;
        color:#ccc;
        margin-bottom:6px;
        font-size:13px;
        "
    >
        Step Screenshot
    </label>

    <input
        type="file"
        class="step-image-file"
        accept="image/*"
    >

    <div
        class="step-image-status"
        style="
        margin-top:6px;
        color:#7f91aa;
        font-size:12px;
        "
    >
        ${step.image ? "Image already uploaded." : "No image selected."}
    </div>

</div>


                <input
                    type="text"
                    class="step-link"
                    placeholder="Useful link (optional)"
                    value="${step.link}"
                >

            `;


            // ----------------------------------
            // INPUT EVENTS
            // ----------------------------------

            stepBox
                .querySelector(".step-title")
                .oninput = event => {

                    guideSteps[index].title =
                        event.target.value;

                };


            stepBox
                .querySelector(".step-text")
                .oninput = event => {

                    guideSteps[index].text =
                        event.target.value;

                };


            stepBox
                .querySelector(".step-link")
                .oninput = event => {

                    guideSteps[index].link =
                        event.target.value;

                };

               const imageFileInput =
    stepBox.querySelector(".step-image-file");

const imageStatus =
    stepBox.querySelector(".step-image-status");

imageFileInput.onchange = async event => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    imageStatus.textContent = "Uploading image...";
    imageStatus.style.color = "#e0c25a";

    try {

        const formData = new FormData();

        formData.append("file", file);

        formData.append(
            "upload_preset",
            "techlab_guides"
        );

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/kzkrnnhe/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(
                "Cloudinary upload failed."
            );
        }

        const data = await response.json();

        guideSteps[index].image =
            data.secure_url;

        imageStatus.textContent =
            "Image uploaded successfully.";

        imageStatus.style.color =
            "#4ade80";

        console.log(
            "Cloudinary image URL:",
            data.secure_url
        );

    }

    catch (error) {

        console.error(
            "Image upload failed:",
            error
        );

        imageStatus.textContent =
            "Image upload failed.";

        imageStatus.style.color =
            "#ff6b6b";

    }

};


            // ----------------------------------
            // DELETE STEP
            // ----------------------------------

            stepBox
                .querySelector(".delete-step-btn")
                .onclick = () => {

                    guideSteps.splice(
                        index,
                        1
                    );

                    renderGuideSteps();

                };


            guideStepsContainer.appendChild(
                stepBox
            );

        }
    );

}


    // ==========================================
    // SAVE GUIDE
    // ==========================================

    saveBtn.onclick = async () => {

        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const readTime =
            readTimeInput.value.trim();

        const status =
            statusInput.value;


        if (!title) {

            showToast(
                "Please enter guide title.",
                "warning"
            );

            return;

        }


        if (!description) {

            showToast(
                "Please enter guide description.",
                "warning"
            );

            return;

        }


        const data = {

    title: title,

    description: description,

    readTime:
        readTime || "5 min read",

    status: status,

    steps: guideSteps

};


        try {

            // EDIT

            if (editingId) {

                await updateDoc(

                    doc(
                        db,
                        "guides",
                        editingId
                    ),

                    data

                );

                showToast(
                    "Guide updated successfully."
                );

            }

            // ADD

            else {

               data.created =
    serverTimestamp();

await addDoc(

                    collection(
                        db,
                        "guides"
                    ),

                    data

                );

                showToast(
                    "Guide added successfully."
                );

            }


            editingId = null;

            modal.classList.add("hidden");

            await loadGuides();

            renderGuides();

        }

        catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Unable to save guide.",
                "error"
            );

        }

    };


    // ==========================================
    // SEARCH
    // ==========================================

    searchInput.oninput = () => {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        filteredGuides =
            allGuides.filter(guide =>

                guide.title
                    .toLowerCase()
                    .includes(search)

                ||

                guide.description
                    .toLowerCase()
                    .includes(search)

            );


        currentPage = 1;

        renderGuides();

    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    await loadGuides();

    renderGuides();


    // ==========================================
    // LOAD GUIDES
    // ==========================================

    async function loadGuides() {

        const snapshot =
            await getDocs(

                query(

                    collection(
                        db,
                        "guides"
                    ),

                    orderBy(
                        "created",
                        "desc"
                    )

                )

            );


        allGuides = [];


        snapshot.forEach(
            documentData => {

                allGuides.push({

                    id:
                        documentData.id,

                    ...documentData.data()

                });

            }
        );


        filteredGuides =
            [...allGuides];

    }


    // ==========================================
    // RENDER GUIDES
    // ==========================================

    function renderGuides() {

        table.innerHTML = "";


        if (
            filteredGuides.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="
                        text-align:center;
                        padding:40px;
                        "
                    >

                        No guides found

                    </td>

                </tr>

            `;

            pagination.innerHTML = "";

            return;

        }


        const totalPages =
            Math.ceil(
                filteredGuides.length /
                guidesPerPage
            );


        if (
            currentPage >
            totalPages
        ) {

            currentPage =
                totalPages;

        }


        const start =
            (currentPage - 1) *
            guidesPerPage;


        const end =
            start +
            guidesPerPage;


        const guides =
            filteredGuides.slice(
                start,
                end
            );


        guides.forEach(
            (guide, index) => {

                const row =
                    document.createElement("tr");


                const number =
                    start + index + 1;


                row.innerHTML = `

                    <td>
                        <strong>
                            ${number}
                        </strong>
                    </td>


                    <td>

                        <div class="video-name">
                            ${guide.title}
                        </div>

                    </td>


                    <td>

                        <div class="video-desc">
                            ${
                                guide.description ||
                                "No description"
                            }
                        </div>

                    </td>


                    <td>

                        <span class="${
                            guide.status === "published"
                                ? "badge badge-featured"
                                : "badge badge-normal"
                        }">

                            ${
                                guide.status === "published"
                                    ? "Published"
                                    : "Draft"
                            }

                        </span>

                    </td>


                    <td>

                        ${
                            guide.created?.seconds
                                ? new Date(
                                    guide.created.seconds *
                                    1000
                                ).toLocaleString()
                                : "-"
                        }

                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="editGuideBtn editBtn"
                                title="Edit"
                            >

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                class="deleteGuideBtn deleteBtn"
                                title="Delete"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                `;


                // ==================================
                // EDIT
                // ==================================

               row
    .querySelector(".editGuideBtn")
    .onclick = () => {

        editingId = guide.id;

        modalTitle.textContent = "Edit Guide";

        titleInput.value =
            guide.title || "";

        descriptionInput.value =
            guide.description || "";

        readTimeInput.value =
            guide.readTime || "";

        statusInput.value =
            guide.status || "draft";

        // Load existing guide steps
        guideSteps =
            Array.isArray(guide.steps)
                ? [...guide.steps]
                : [];

        // Display existing steps
        renderGuideSteps();

        saveBtn.textContent =
            "Update Guide";

        modal.classList.remove("hidden");

    };

                // ==================================
                // DELETE
                // ==================================

                row
                    .querySelector(
                        ".deleteGuideBtn"
                    )
                    .onclick = () => {

                        showConfirm(

                            "Delete guide?",

                            `Are you sure you want to permanently delete "${guide.title}"? This action cannot be undone.`,

                            async () => {

                                await deleteDoc(

                                    doc(
                                        db,
                                        "guides",
                                        guide.id
                                    )

                                );


                                await loadGuides();

                                renderGuides();


                                showToast(
                                    "Guide deleted successfully."
                                );

                            },

                            "Delete",

                            "danger"

                        );

                    };


                table.appendChild(row);

            }
        );


        renderPagination(
            totalPages
        );

    }


    // ==========================================
    // PAGINATION
    // ==========================================

    function renderPagination(
        totalPages
    ) {

        pagination.innerHTML = "";


        if (totalPages <= 1)
            return;


        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                i;


            if (
                i === currentPage
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.onclick = () => {

                currentPage = i;

                renderGuides();

            };


            pagination.appendChild(
                button
            );

        }

    }

}