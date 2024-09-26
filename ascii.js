const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ascii = document.getElementById('ascii');
const snapshotButton = document.getElementById('snapshotButton');
const qrcodeDiv = document.getElementById('qrcode');

const asciiChars = ['@', '#', 'S', '%', '?', '*', '+', 'A', 'E', 'D', 'I'];

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
            for (let y = 0; y < canvas.height; y += 2) { // Adjust the step for more or less detail
                for (let x = 0; x < canvas.width; x += 2) { // Adjust the step for more or less detail
                    const offset = (y * canvas.width + x) * 4;
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];

                    const brightness = (r + g + b) / 2;
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

// Take a snapshot of the ASCII art, save it as a PNG, and generate a QR code
snapshotButton.addEventListener('click', () => {
    const asciiContent = ascii.textContent;
    const lines = asciiContent.split('\n');

    // Calculate the width and height based on the ASCII art
    const fontSize = 20; // Adjust font size to match the ASCII art size
    const canvasWidth = lines[0].length * fontSize;
    const canvasHeight = lines.length * fontSize;

    // Create a new canvas with the correct dimensions
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = canvasWidth;
    outputCanvas.height = canvasHeight;

    // Fill the background with black and draw the ASCII art
    outputCtx.fillStyle = 'black';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    outputCtx.font = `${fontSize}px monospace`;
    outputCtx.fillStyle = 'white';
    lines.forEach((line, i) => {
        outputCtx.fillText(line, 0, (i + 1) * fontSize);
    });

    // Generate a unique filename using the current timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*$/, '');
    const filename = `ascii_snapshot_${timestamp}.png`;

    // Convert the canvas to a PNG and trigger download
    outputCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url); // Clean up the URL object
    });
});

