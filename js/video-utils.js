export function getVideoId(url) {

    const regExp =
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^?&/]+)/;

    const match = url.match(regExp);

    return match ? match[1] : "";

}