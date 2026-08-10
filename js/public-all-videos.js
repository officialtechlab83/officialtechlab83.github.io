import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const container = document.getElementById("allVideos");
const searchBox = document.getElementById("searchBox");

let videos = [];

let currentPage = 1;

const videosPerPage = 12;


// -----------------------------
// YouTube Video ID
// -----------------------------

function getVideoId(url) {

    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/
    );

    return match ? match[1] : "";
}


// -----------------------------
// Render Videos
// -----------------------------

function renderVideos(list) {

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = "<p>No videos found.</p>";

        renderPagination(0);

        return;
    }


    const totalPages = Math.ceil(
        list.length / videosPerPage
    );


    if (currentPage > totalPages) {

        currentPage = totalPages;

    }


    const startIndex =
        (currentPage - 1) * videosPerPage;


    const endIndex =
        startIndex + videosPerPage;


    const pageVideos =
        list.slice(startIndex, endIndex);


    pageVideos.forEach(video => {

        container.innerHTML += `

            <div class="card">

                <div class="card-content">

                    <div class="section-title">
                        ${video.title}
                    </div>

                    <div class="video-container">

                        <iframe
                            src="https://www.youtube.com/embed/${getVideoId(video.url)}"
                            allowfullscreen>
                        </iframe>

                    </div>

                </div>

            </div>

        `;

    });


    renderPagination(totalPages);

}


// -----------------------------
// Pagination
// -----------------------------

function renderPagination(totalPages) {

    let pagination =
        document.getElementById("pagination");


    if (!pagination) {

        pagination =
            document.createElement("div");

        pagination.id = "pagination";

        pagination.style.textAlign = "center";

        pagination.style.margin = "30px 0";

        container.parentNode.appendChild(pagination);

    }


    pagination.innerHTML = "";


    if (totalPages <= 1) {

        return;

    }


    // Previous button

    const previousButton =
        document.createElement("button");

    previousButton.textContent =
        "← Previous";


    previousButton.disabled =
        currentPage === 1;


    previousButton.onclick = function () {

        if (currentPage > 1) {

            currentPage--;

            renderVideos(getFilteredVideos());

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    pagination.appendChild(previousButton);


    // Page numbers

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");


        pageButton.textContent =
            page;


        pageButton.disabled =
            page === currentPage;


        pageButton.onclick = function () {

            currentPage = page;

            renderVideos(getFilteredVideos());

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };


        pagination.appendChild(pageButton);

    }


    // Next button

    const nextButton =
        document.createElement("button");


    nextButton.textContent =
        "Next →";


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.onclick = function () {

        if (currentPage < totalPages) {

            currentPage++;

            renderVideos(getFilteredVideos());

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    pagination.appendChild(nextButton);

}


// -----------------------------
// Search
// -----------------------------

function getFilteredVideos() {

    const text =
        searchBox.value
            .toLowerCase()
            .trim();


    return videos.filter(video =>

        (video.title || "")
            .toLowerCase()
            .includes(text)

    );

}


searchBox.addEventListener(
    "input",
    function () {

        currentPage = 1;

        renderVideos(
            getFilteredVideos()
        );

    }
);


// -----------------------------
// Load Videos
// -----------------------------

async function loadVideos() {

    container.innerHTML =
        "<p>Loading videos...</p>";


    const q = query(

        collection(db, "videos"),

        orderBy("created", "desc")

    );


    const snapshot =
        await getDocs(q);


    videos = [];


    snapshot.forEach(doc => {

        videos.push(
            doc.data()
        );

    });


    currentPage = 1;


    renderVideos(videos);

}


loadVideos();