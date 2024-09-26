const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ascii = document.getElementById('ascii');

const asciiChars = ['I', 'D', 'S', 'E', 'A', '*', '+', ';', ':', ',', '.'];

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

                    const brightness = (r + g + b) / 4;
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
