document.addEventListener("DOMContentLoaded", () =>
{
    fetch("/api/videos")
        .then(response => response.json())
        .then(data => 
        {
            const videoGrid = document.getElementById("video-grid");

            data.forEach(video =>
            {
                const videoItem = document.createElement("div");
                videoItem.classList.add("video-item");

                const videoLink = document.createElement("a");
                videoLink.href = `/videos/${video.id}`;
                videoLink.classList.add('video-link');

                const videoThumbnail = document.createElement("img");
                videoThumbnail.src = `/api/thumbnails/${video.id}`;
                videoThumbnail.alt = video.title;

                const videoTitle = document.createElement("a");
                videoTitle.href = `/videos/${video.id}`;
                videoTitle.textContent = video.title;
                videoTitle.classList.add('video-title');

                videoLink.appendChild(videoThumbnail);
                videoLink.appendChild(videoTitle);

                videoItem.appendChild(videoLink);

                videoGrid.appendChild(videoItem);
            });
        })
        .catch(error => console.error("Error fetching video data: ", error));
});