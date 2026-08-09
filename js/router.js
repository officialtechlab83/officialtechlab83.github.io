export async function loadPage(page) {

    const content = document.getElementById("content");

    content.innerHTML = "<h2>Loading...</h2>";

    try {

        const response = await fetch(`../components/${page}.html`);

        if (!response.ok) {
            throw new Error("Component not found.");
        }

        const html = await response.text();

        content.innerHTML = html;
        
        if (page === "dashboard") {

    const { initDashboard } = await import("./dashboard.js");
    await initDashboard();

}

if (page === "videos") {

    const { initVideos } = await import("./videos.js");
await initVideos();
}



if (page === "settings") {

    const { initSettings } = await import("./settings.js");

    await initSettings();

}

if (page === "categories") {

    const { initCategories } =
        await import("./categories.js");

    await initCategories();

}

    } catch (err) {

    console.error("Router Error:", err);

    throw err;

}

}