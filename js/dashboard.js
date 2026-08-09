import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function initDashboard() {

    // ---------- Load Videos ----------

    const videoSnapshot = await getDocs(collection(db, "videos"));

    const videos = [];

    videoSnapshot.forEach(doc => {

        videos.push({
            id: doc.id,
            ...doc.data()
        });

    });

    // ---------- Total Videos ----------

    animateCounter("videoCount", videos.length);

    // ---------- Categories ----------

    const categories = new Set();

    videos.forEach(video => {

        if (video.category) {

            categories.add(video.category);

        }

    });

    animateCounter("categoryCount", categories.size);
    // ---------- Featured Videos ----------

    const featured = videos.filter(v => v.featured === true);

    animateCounter("featuredCount", featured.length);

    // ---------- Logged In User ----------

    const adminEmail = document.getElementById("adminEmail");

    if (auth.currentUser) {

    const email = auth.currentUser.email;

    adminEmail.textContent = email.split("@")[0];

} else {

    adminEmail.textContent = "Administrator";

}

    // ---------- Latest Upload ----------

    try {

        const latestQuery = query(
            collection(db, "videos"),
            orderBy("created", "desc"),
            limit(1)
        );

        const latestSnapshot = await getDocs(latestQuery);

        if (!latestSnapshot.empty) {

            const latest = latestSnapshot.docs[0].data();

            document.getElementById("latestVideo").innerHTML = `

<img
src="${latest.thumbnail}"
style="
width:100%;
border-radius:12px;
margin-bottom:15px;
">

<h3>${latest.title}</h3>

<p style="opacity:.7;margin-top:8px;">
${latest.category}
</p>

`;
        }
        
    } catch {

    const latestVideo =
        document.getElementById("latestVideo");

    if (latestVideo) {

        latestVideo.textContent =
            "Unable to load latest video.";

    }

}


    // ---------- Upload Chart ----------

const categoryStats = {};

videos.forEach(video => {

    const category = video.category || "Uncategorized";

    categoryStats[category] =
        (categoryStats[category] || 0) + 1;

});

const ctx = document
    .getElementById("uploadChart")
    .getContext("2d");

new Chart(ctx, {

    type: "bar",

    data: {

        labels: Object.keys(categoryStats),

        datasets: [{

            label: "Videos",

            data: Object.values(categoryStats),

            borderWidth: 1

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                display: false

            }

        },

        scales: {

            y: {

                beginAtZero: true,

                ticks: {

                    precision: 0

                }

            }

        }

    }

});

    // ---------- Quick Buttons ----------

const quickAddVideo =
    document.getElementById("quickAddVideo");

const quickSettings =
    document.getElementById("quickSettings");


if (quickAddVideo) {

    quickAddVideo.onclick = () => {

        document
            .querySelector('[data-page="videos"]')
            ?.click();

    };

}


if (quickSettings) {

    quickSettings.onclick = () => {

        document
            .querySelector('[data-page="settings"]')
            ?.click();

    };

}

function animateCounter(id, target){

    const el =
        document.getElementById(id);

    if (!el)
        return;

    let current = 0;

    const speed = Math.max(1, Math.ceil(target / 40));

    const timer = setInterval(()=>{

        current += speed;

        if(current >= target){

            current = target;

            clearInterval(timer);

        }

        el.textContent = current;

    },20);

}
}