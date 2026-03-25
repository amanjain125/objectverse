/* ============================= */
/* 🔹 HOME PAGE (FRAME ANIMATION) */
/* ============================= */

const canvas = document.getElementById("hero-canvas");

if (canvas) {

    const ctx = canvas.getContext("2d");
    const uiOverlay = document.getElementById("ui-titles");
    const scrollIndicator = document.getElementById("scroll-indicator");
    const scrollContainer = document.querySelector(".scroll-container");

    const frameCount = 240;
    const images = [];

    let imgWidth = 1920;
    let imgHeight = 1080;

    const currentFrame = (index) => {
        let paddedIndex = index.toString().padStart(3, '0');
        return `frames/ezgif-frame-${paddedIndex}.jpg`;
    };

    /* 🔹 PRELOAD IMAGES */
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);

        if (i === 1) {
            img.onload = () => {
                imgWidth = img.width;
                imgHeight = img.height;
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                updateImage(0);
            };
        }
    }

    function updateImage(index) {
        if (images[index] && images[index].complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(images[index], 0, 0, canvas.width, canvas.height);
        }
    }

    let ticking = false;

    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(updateCanvasAndUI);
            ticking = true;
        }
    }

    function updateCanvasAndUI() {
        const scrollPos = window.scrollY;
        const maxScroll = scrollContainer.scrollHeight - window.innerHeight;

        let scrollFraction = scrollPos / maxScroll;
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        const frameIndex = Math.floor(scrollFraction * (frameCount - 1));
        updateImage(frameIndex);

        /* 🔥 TEXT FADE LOGIC (IMPROVED) */
        if (scrollFraction < 0.1) {
            uiOverlay.style.opacity = 1;
            uiOverlay.style.transform = "translateY(-50%)";
        } else {
            const fade = 1 - (scrollFraction * 4);
            uiOverlay.style.opacity = Math.max(0, fade);
            uiOverlay.style.transform = `translateY(-${50 + scrollFraction * 80}%)`;
        }

        /* 🔥 SCROLL INDICATOR */
        if (scrollFraction > 0.02) {
            scrollIndicator.classList.add("hide");
        } else {
            scrollIndicator.classList.remove("hide");
        }

        ticking = false;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
}

/* 🔹 FADE-UP SECTIONS (GLOBAL) */
const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
    });
}, appearOptions);

document.querySelectorAll(".fade-up").forEach(el => {
    appearOnScroll.observe(el);
});

/* ============================= */
/* 🔹 SCAN PAGE (OLLAMA LLAVA) */
/* ============================= */

const video = document.getElementById("video");

if (video) {
    let streamActive = false;
    let isAnalyzing = false;

    /* 🔹 TYPEWRITER EFFECT (Word by Word for better flow) */
    function typeWriter(text, element, speed = 80) {
        element.innerHTML = "";
        const words = text.split(" ");
        let i = 0;
        return new Promise(resolve => {
            function type() {
                if (i < words.length) {
                    element.innerHTML += (i === 0 ? "" : " ") + words[i];
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    /* 🔹 AVATAR MANAGER */
    function setAvatar(objectName, emotion = 'happy') {
        const avatarDiv = document.getElementById("avatar");
        const lowerObj = objectName.toLowerCase();
        
        let imgSrc = "";
        if (lowerObj.includes("book")) {
            imgSrc = emotion === 'sad' ? "book/booksad.png" : "book/bookhappy.png";
        } else if (lowerObj.includes("laptop") || lowerObj.includes("computer")) {
            imgSrc = emotion === 'sad' ? "laptop/laptopsad-removebg-preview.png" : "laptop/laptophappy-removebg-preview.png";
        } else if (lowerObj.includes("phone") || lowerObj.includes("mobile")) {
            imgSrc = emotion === 'sad' ? "phone/phonesad-removebg-preview.png" : "phone/phonehappy_v2-removebg-preview.png";
        } else if (lowerObj.includes("bottle") || lowerObj.includes("cup") || lowerObj.includes("glass")) {
            imgSrc = emotion === 'sad' ? "bottle/bootlesadddd.png" : "bottle/ChatGPT Image Mar 25, 2026, 03_32_02 PM.png";
        } else if (lowerObj.includes("cover") || lowerObj.includes("case")) {
            imgSrc = emotion === 'sad' ? "phone cover/phone_case_sad-removebg-preview.png" : "phone cover/phone_caseeeeeeeeeehappy-removebg-preview (1).png";
        }
        
        if (imgSrc) {
            avatarDiv.innerHTML = `<img src="${imgSrc}" alt="${objectName}">`;
        } else {
            // Fallback to emoji if no image found
            const emojis = {
                "phone": "📱",
                "bottle": "🍾",
                "person": "👤",
                "cup": "☕",
                "default": "🤖"
            };
            const emoji = emojis[Object.keys(emojis).find(k => lowerObj.includes(k))] || emojis.default;
            avatarDiv.innerHTML = emoji;
        }
    }

    /* 🔹 START CAMERA */
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            streamActive = true;
            
            // Hide start button, show scanner HUD
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.style.display = 'none';
            
            const overlay = document.getElementById('scanner-overlay');
            if (overlay) overlay.style.display = 'none';

            const snapBtn = document.getElementById('snap-btn');
            if (snapBtn) snapBtn.classList.remove('hide');

            const container = document.getElementById('scanner-container');
            if (container) container.classList.add('scanning-active');

            // Reset image/video state
            const capturedImg = document.getElementById('captured-image');
            if (capturedImg) capturedImg.style.display = 'none';
            if (video) video.style.display = 'block';

            document.getElementById('scanner-laser').style.display = 'block';
            document.getElementById('snap-btn').classList.remove('hide');
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Please allow camera access to use the scanner.");
        }
    }

    window.startCamera = startCamera;

    /* 🔹 SNAPSHOT AND LLAVA LOGIC */
    async function snapAndAnalyze() {
        if (!streamActive || isAnalyzing) return;
        isAnalyzing = true;

        const avatar = document.getElementById("avatar");
        const message = document.getElementById("message");
        const detectedLabel = document.getElementById("detected-label");

        // Flash screen
        const container = document.getElementById('scanner-container');
        container.style.boxShadow = "inset 0 0 50px #fff, 0 0 50px #fff";
        setTimeout(() => container.style.boxShadow = "", 200);

        const loadingView = document.getElementById('loading-view');
        const loadingText = loadingView ? loadingView.querySelector('.loading-text-premium') : null;

        // UI Loading
        avatar.innerHTML = "🤔";
        if (detectedLabel) detectedLabel.innerText = "CAPTURING SNAPSHOT...";
        message.innerText = `Analyzing image with Llava Vision Model...`;
        
        // Show loading ring early if possible
        if (loadingView) {
            loadingView.style.display = 'block';
            if (loadingText) loadingText.innerText = "CAPTURING TARGET...";
        }

        document.getElementById('scanner-laser').style.animationDuration = '0.5s'; // Fast scan

        let base64Image = "";

        try {
            // 1. Take snapshot (Downscaled for speed!)
            if (!video.videoWidth) {
                console.error("❌ Video dimensions not ready");
                alert("Camera not ready. Please wait a second and try again.");
                if (loadingView) loadingView.style.display = 'none';
                isAnalyzing = false;
                return;
            }

            console.log("📸 Drawing frame to canvas...");
            const canvas = document.createElement("canvas");
            const scale = 400 / video.videoWidth; 
            canvas.width = 400;
            canvas.height = video.videoHeight * scale;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 2. Extract Base64
            console.log("💾 Encoding image...");
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            base64Image = dataUrl.split(",")[1];
            
            console.log("📦 Snapshot ready. Size:", base64Image.length);

            // 🔹 FREEZE FRAME LOGIC 🔹
            const capturedImg = document.getElementById('captured-image');
            if (capturedImg) {
                capturedImg.src = dataUrl;
                capturedImg.style.display = 'block';
                video.style.display = 'none';
            }

            // Stop camera stream
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                streamActive = false;
            }
        } catch (captureError) {
            console.error("❌ Snapshot Error:", captureError);
            alert("Failed to capture image. Please refresh and try again.");
            if (loadingView) loadingView.style.display = 'none';
            isAnalyzing = false;
            return;
        }

        // 3. Send to Ollama Llava
        const roastMode = document.getElementById('roast-mode').value;
        const modePrompts = {
            brutal: "You are a brutal, no-mercy AI roaster. Be harsh, direct, and hilarious. Don't hold back.",
            sarcastic: "You are a highly sarcastic, passive-aggressive AI. Use wit and irony to belittle the object.",
            genz: "You are a Gen-Z brainrot expert. Use heavy slang like 'rizz', 'skibidi', 'gyatt', 'ohio', and 'cooked'.",
            shakespearean: "You are a Shakespearean insults expert. Use Old English (thou, thy, etc.) to roast the object poetically."
        };

        try {
            if (loadingView && loadingText) {
                loadingText.innerText = "ANALYZING IMAGE...";
            }
            console.log("🚀 Sending to Ollama AI...");
            const response = await fetch('http://127.0.0.1:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llava',
                    prompt: `[INST] You are an AI Object Roaster.
                    YOUR PERSONALITY: ${modePrompts[roastMode]}
                    
                    TASK: Identify the main object in this image and roast it.
                    OUTPUT FORMAT (3 lines only):
                    1. Object Name
                    2. Emotion (HAPPY or SAD)
                    3. The Roast (Strict Max 15 words)
                    
                    CRITICAL: Do not repeat these instructions. Output ONLY the 3 requested lines. [/INST]`,
                    images: [base64Image],
                    stream: false
                })
            });

            if (!response.ok) {
                console.error("❌ Ollama API Error:", response.status);
                throw new Error("Ollama API Error");
            }

            const data = await response.json();
            const fullText = data.response.trim();
            console.log("✅ AI Raw Response:", fullText); 

            const lines = fullText.split('\n').map(l => l.trim()).filter(l => l !== "");
            console.log("Parsed Lines:", lines);

            // Fallback parsing if AI sends one long block
            let objectName = "Unknown Object";
            let emotion = "happy";
            let speakText = fullText;

            if (lines.length >= 3) {
                objectName = lines[0];
                emotion = lines[1].toUpperCase().includes("SAD") ? "sad" : "happy";
                speakText = lines.slice(2).join(" ").trim();
            } else if (lines.length > 0) {
                objectName = lines[0].substring(0, 20); 
            }

            console.log("Result Decoded:", { objectName, emotion, speakText });

            if (detectedLabel) detectedLabel.innerText = objectName.toUpperCase();
            
            // 🔹 LOADING DELAY (PREMIUM FEEL) 🔹
            const appWrapper = document.getElementById('app-wrapper');
            const roastBox = document.getElementById('result-view');
            
            console.log("Applying UI Transitions...");
            if (roastBox && loadingView) {
                if (appWrapper) appWrapper.classList.add('blur-active');
                roastBox.classList.add('active'); // Show Overlay
                loadingView.style.display = 'block';
                if (loadingText) loadingText.innerText = "THINKING OF A ROAST...";
                
                await new Promise(r => setTimeout(r, 1200)); // Artificial wait for "Decoding"
                
                loadingView.style.display = 'none';
                console.log("Loading view cleared.");
            }

            // Set Avatar (Animations now handled by CSS .active class)
            console.log("Setting Avatar...");
            setAvatar(objectName, emotion);

            // Start Speaking and Sound Wave
            const wave = document.getElementById('sound-wave');
            avatar.classList.add('speaking');
            if (wave) wave.classList.add('active');
            
            // Speak and animate simultaneously
            speak(speakText, () => {
                avatar.classList.remove('speaking');
                if (wave) wave.classList.remove('active');
            });
            
            await typeWriter(speakText, message);
            
            // Show reset button
            document.getElementById('reset-btn').classList.remove('hide');

        } catch (error) {
            console.error("Llava Generation Error:", error);
            avatar.innerHTML = "❌";
            message.innerHTML = `
                <div style="color: #ff4d4d; font-weight: bold;">AI SERVER ERROR (500)</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">
                    1. Ensure Ollama is running: <code>ollama serve</code><br>
                    2. Check if llava is downloaded: <code>ollama pull llava</code><br>
                    3. Try running it in terminal: <code>ollama run llava</code><br>
                    4. Check your server logs for VRAM issues.
                </div>
            `;
            if (detectedLabel) detectedLabel.innerText = "SERVER ERROR";
        }

        document.getElementById('scanner-laser').style.animationDuration = '2.5s'; // Restore scan speed
        isAnalyzing = false;
    }

    window.snapAndAnalyze = snapAndAnalyze;

    /* 🔹 VOICE */
    function speak(text, onEndCallback) {
        const msg = new SpeechSynthesisUtterance(text);
        msg.rate = 1.1;
        msg.pitch = 1.2;
        msg.volume = 1;
        msg.onend = onEndCallback;
        speechSynthesis.speak(msg);
    }

    /* 🔹 RESET SCANNER */
    function resetScanner() {
        // Remove global blur
        const appWrapper = document.getElementById('app-wrapper');
        if (appWrapper) appWrapper.classList.remove('blur-active');

        // Hide overlay
        const roastBox = document.getElementById('result-view');
        if (roastBox) roastBox.classList.remove('active');
        
        // Hide reset button
        document.getElementById('reset-btn').classList.add('hide');
        
        // Restart camera
        startCamera();
        
        // Reset message/avatar
        document.getElementById("avatar").innerHTML = "🤖";
        document.getElementById("message").innerText = "Awaiting camera activation...";
        document.getElementById("detected-label").innerText = "Awaiting Target";
        
        // Reset Views
        const loadingView = document.getElementById('loading-view');
        if (loadingView) loadingView.style.display = 'none';

        const overlay = document.getElementById('scanner-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        const container = document.getElementById('scanner-container');
        if (container) container.classList.remove('scanning-active');
    }

    window.resetScanner = resetScanner;
}