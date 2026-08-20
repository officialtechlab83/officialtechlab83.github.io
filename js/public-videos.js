import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const latestContainer = document.getElementById("latestVideos");

const featuredContainer = document.getElementById("featuredVideo");

const featuredSection = document.getElementById("featuredSection");

function getVideoId(url) {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/
    );
    return match ? match[1] : "";
}

// ---------------- Featured ----------------

async function loadFeatured() {

    const q = query(

        collection(db,"videos"),

        where("featured","==",true),

        limit(1)

    );

    const snap = await getDocs(q);

    if(snap.empty){

        featuredSection.style.display="none";

        return;

    }

    featuredSection.style.display="block";

    const video=snap.docs[0].data();

    featuredContainer.innerHTML=`

<div class="section-title">

${video.title}

</div>

<div class="video-container">

<iframe

src="https://www.youtube.com/embed/${getVideoId(video.url)}"

allowfullscreen>

</iframe>

</div>

<p style="margin-top:15px;opacity:.8;">

${video.description || ""}

</p>

`;

}

// ---------------- Latest ----------------

async function loadLatestVideos() {

    latestContainer.innerHTML="<p>Loading...</p>";

    const q=query(

        collection(db,"videos"),

        orderBy("created","desc"),

        limit(5)

    );

    const snapshot=await getDocs(q);

    latestContainer.innerHTML="";

    snapshot.forEach(doc=>{

        const video=doc.data();

        latestContainer.innerHTML+=`

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

await loadFeatured();

await loadLatestVideos();
