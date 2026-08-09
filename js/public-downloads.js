import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const container = document.getElementById("downloadsContainer");
const searchBox = document.getElementById("searchBox");

let downloads = [];

function render(list) {

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No downloads available.</p>";
        return;
    }

    list.forEach(item => {

        container.innerHTML += `
            <div class="card">

                <div class="card-content">

                    <div class="section-title">
                        ${item.title}
                    </div>

                    <p>${item.description || ""}</p>

                    <a href="${item.url}"
                       target="_blank"
                       class="download-btn">

                        Download

                    </a>

                </div>

            </div>
        `;

    });

}

async function loadDownloads() {

    container.innerHTML = "<p>Loading...</p>";

    const q = query(
        collection(db, "downloads"),
        orderBy("created", "desc")
    );

    const snapshot = await getDocs(q);

    downloads = [];

    snapshot.forEach(doc => {
        downloads.push(doc.data());
    });

    render(downloads);

}

searchBox.addEventListener("input", () => {

    const text = searchBox.value.toLowerCase();

    render(
        downloads.filter(d =>
            d.title.toLowerCase().includes(text)
        )
    );

});

loadDownloads();