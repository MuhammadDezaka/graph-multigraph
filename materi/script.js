function openVideo(videoSrc, videoTitle, videoDescription) {
    const modal = document.getElementById("videoModal");
    const videoPlayer = document.getElementById("videoPlayer");
    const videoTitleElement = document.getElementById("videoTitle");
    const videoDescriptionElement = document.getElementById("videoDescription");

    videoPlayer.src = videoSrc;
    videoTitleElement.textContent = videoTitle;
    videoDescriptionElement.textContent = videoDescription;

    modal.style.display = "flex";
}

function closeVideo() {
    const modal = document.getElementById("videoModal");
    const videoPlayer = document.getElementById("videoPlayer");

    videoPlayer.pause();
    videoPlayer.src = ""; // Hentikan video saat modal ditutup
    modal.style.display = "none";
}
