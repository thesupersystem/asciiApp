const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ascii = document.getElementById('ascii');
const snapshotButton = document.getElementById('snapshotButton');

const asciiChars = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.'];

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the webcam:", err);
    });

video.addEventListener('play', () => {
    function drawFrame() {
        if (!video.paused && !video.ended) {
            // Draw video frame onto canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let asciiImage = '';
            for (let y = 0; y < canvas.height; y += 10) { // Adjust the step for more or less detail
                for (let x = 0; x < canvas.width; x += 5) { // Adjust the step for more or less detail
                    const offset = (y * canvas.width + x) * 4;
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];

                    const brightness = (r + g + b) / 3;
                    const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
                    asciiImage += asciiChars[charIndex];
                }
                asciiImage += '\n';
            }
            ascii.textContent = asciiImage;

            requestAnimationFrame(drawFrame);
        }
    }
    drawFrame();
});

// Take a snapshot of the ASCII art
snapshotButton.addEventListener('click', () => {
    const asciiContent = ascii.textContent;
    const blob = new Blob([asciiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii_snapshot.txt';
    a.click();

    URL.revokeObjectURL(url); // Clean up the URL object
});
