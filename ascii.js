const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ascii = document.getElementById('ascii');
const snapshotButton = document.getElementById('snapshotButton');
const qrcodeDiv = document.getElementById('qrcode');

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

// Take a snapshot of the ASCII art, save it as a PNG, and generate a QR code
snapshotButton.addEventListener('click', () => {
    const asciiContent = ascii.textContent;
    const lines = asciiContent.split('\n');

    // Create a new canvas to draw the ASCII art as an image
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    const fontSize = 10; // Adjust font size to match the ASCII art size
    outputCanvas.width = lines[0].length * fontSize;
    outputCanvas.height = lines.length * fontSize;

    outputCtx.fillStyle = 'black';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    outputCtx.font = `${fontSize}px monospace`;
    outputCtx.fillStyle = 'white';
    lines.forEach((line, i) => {
        outputCtx.fillText(line, 0, (i + 1) * fontSize);
    });

    // Convert the canvas to a PNG and trigger download
    outputCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii_snapshot.png';
        a.click();

        // Generate QR code for the image download link
        qrcodeDiv.innerHTML = ''; // Clear previous QR code
        new QRCode(qrcodeDiv, {
            text: url,
            width: 128,
            height: 128,
            colorDark: "#ffffff",
            colorLight: "#000000",
            correctLevel: QRCode.CorrectLevel.H
        });

        URL.revokeObjectURL(url); // Clean up the URL object
    });
});
