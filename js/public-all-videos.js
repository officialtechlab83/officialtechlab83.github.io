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

function getVideoId(url) {
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : "";
}

function renderVideos(list) {

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No videos found.</p>";
        return;
    }

    list.forEach(video => {

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

}

async function loadVideos() {

    container.innerHTML = "<p>Loading videos...</p>";

    const q = query(
        collection(db, "videos"),
        orderBy("created", "desc")
    );

    const snapshot = await getDocs(q);

    videos = [];

    snapshot.forEach(doc => {
        videos.push(doc.data());
    });

    renderVideos(videos);

}

searchBox.addEventListener("input", () => {

    const text = searchBox.value.toLowerCase();

    const filtered = videos.filter(v =>
        v.title.toLowerCase().includes(text)
    );

    renderVideos(filtered);

});

loadVideos();