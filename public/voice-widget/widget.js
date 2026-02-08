(function() {
    const API_URL = 'http://localhost:8000/process-audio';

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/voice-widget/style.css';
    document.head.appendChild(link);

    // Hide default floating button (we use header button now)
    const style = document.createElement('style');
    style.innerHTML = `
        #voice-trigger-btn { display: none !important; }
        .voice-modal { 
            bottom: 20px; 
            right: 20px; 
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            width: 320px;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
            z-index: 10000;
            position: fixed;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        .voice-modal.active {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }
        .voice-header {
            background: #E60012;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .voice-title {
            font-weight: 600;
            font-size: 16px;
        }
        .voice-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .voice-status {
            padding: 20px;
            text-align: center;
            color: #333;
            font-size: 15px;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);

    // Container
    const container = document.createElement('div');
    container.className = 'voice-widget-container';
    container.innerHTML = `
        <div class="voice-modal" id="voice-modal">
            <div class="voice-header">
                <span class="voice-title">Vendedor Virtual</span>
                <button class="voice-close-btn" id="btn-close">&times;</button>
            </div>
            <div class="voice-status" id="voice-status">Conectando...</div>
            
            <div class="voice-visualizer idle" id="voice-visualizer">
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Elements
    const modal = document.getElementById('voice-modal');
    const closeBtn = document.getElementById('btn-close');
    const statusText = document.getElementById('voice-status');
    const visualizer = document.getElementById('voice-visualizer');

    // State
    let isOpen = false;
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let stream = null;
    let audioContext = null;
    let analyser = null;
    let silenceTimer = null;
    let speechDetected = false;
    let isAIPlaying = false;
    let scriptProcessor = null;

    // Constants
    const SILENCE_THRESHOLD = 1000; // 1.0s silence to stop (faster response)
    const SPEECH_THRESHOLD = 20; // Volume threshold (0-255)

    // Event Listeners
    window.addEventListener('open-voice-widget', openWidget);
    closeBtn.addEventListener('click', closeWidget);

    function openWidget() {
        if (isOpen) return;
        isOpen = true;
        modal.classList.add('active');
        statusText.textContent = "Conectando...";
        initAudio();
    }

    function closeWidget() {
        isOpen = false;
        modal.classList.remove('active');
        stopRecording();
        stopAudioContext();
        if (isAIPlaying) {
            window.speechSynthesis.cancel();
        }
        // Force reload to clear audio context issues if any
        // window.location.reload(); 
    }

    function stopAudioContext() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (scriptProcessor) {
            scriptProcessor.disconnect();
            scriptProcessor = null;
        }
        if (analyser) {
            analyser.disconnect();
            analyser = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    async function initAudio() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // VAD Setup
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.fftSize = 512;
            microphone.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            scriptProcessor.onaudioprocess = () => {
                if (!isRecording || isAIPlaying) return;

                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;
                for (let i = 0; i < array.length; i++) values += array[i];
                const average = values / array.length;

                if (average > SPEECH_THRESHOLD) {
                    // Speech detected
                    if (!speechDetected) {
                        speechDetected = true;
                        console.log("Speech detected");
                        statusText.textContent = "Ouvindo...";
                        visualizer.className = 'voice-visualizer listening';
                    }
                    // Reset silence timer
                    clearTimeout(silenceTimer);
                    silenceTimer = setTimeout(() => {
                        if (speechDetected) {
                            console.log("Silence detected, stopping...");
                            stopRecording();
                        }
                    }, SILENCE_THRESHOLD);
                }
            };

            // Start first recording
            startRecording();

        } catch (err) {
            console.error('Mic Error:', err);
            statusText.textContent = "Erro no microfone. Permita o acesso.";
        }
    }

    function startRecording() {
        if (!isOpen || isAIPlaying) return;
        
        audioChunks = [];
        speechDetected = false;
        
        try {
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                if (speechDetected && audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await sendAudio(audioBlob);
                } else {
                    // If no speech was detected (e.g. false alarm or just noise), restart?
                    // Only restart if we are still open and not playing
                    if (isOpen && !isAIPlaying) {
                        startRecording(); 
                    }
                }
            };

            mediaRecorder.start();
            isRecording = true;
            statusText.textContent = "Pode falar...";
            visualizer.className = 'voice-visualizer idle'; // Idle until speech detected

        } catch (e) {
            console.error(e);
            statusText.textContent = "Erro ao gravar.";
        }
    }

    function stopRecording() {
        if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
            isRecording = false;
            mediaRecorder.stop();
            visualizer.className = 'voice-visualizer processing';
            statusText.textContent = "Processando...";
            clearTimeout(silenceTimer);
        }
    }

    async function sendAudio(blob) {
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            statusText.textContent = data.agent_text;
            
            // Handle Actions
            if (data.action) {
                console.log("Action received:", data.action);
                
                if (data.action.type === 'view_product') {
                    // Navigate to product page
                    // We assume the frontend route is /product/:slug
                    if (data.action.payload) {
                        window.location.href = `/product/${data.action.payload}`;
                    }
                } 
                else if (data.action.type === 'add_to_cart') {
                    // Add to cart
                    // We use the exposed global function from CartContext
                    if (window.balao_addToCart && data.action.payload) {
                        window.balao_addToCart(data.action.payload);
                    } else {
                        console.warn("balao_addToCart not found or invalid payload");
                    }
                }
            }

            if (data.audio_base64) {
                playAudio(data.audio_base64);
            } else {
                if(isOpen) startRecording(); // No audio, just restart
            }

        } catch (error) {
            console.error(error);
            statusText.textContent = "Erro de conexão.";
            setTimeout(() => {
                if(isOpen) startRecording();
            }, 2000); 
        }
    }

    function playAudio(base64Audio) {
        isAIPlaying = true;
        visualizer.className = 'voice-visualizer speaking';
        
        const audio = new Audio("data:audio/mp3;base64," + base64Audio);
        audio.play().catch(e => console.error("Playback error", e));
        
        audio.onended = () => {
            isAIPlaying = false;
            if (isOpen) {
                startRecording(); // Auto turn-taking
            }
        };
    }

})();