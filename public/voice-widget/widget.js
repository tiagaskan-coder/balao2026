(function() {
    // Configuração
    const API_URL = 'http://localhost:8000/chat-audio'; // Ajuste para produção
    
    // Injetar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/voice-widget/style.css'; // Caminho relativo ao site
    document.head.appendChild(link);

    // Criar Container
    const container = document.createElement('div');
    container.className = 'voice-widget-container';
    
    container.innerHTML = `
        <div class="voice-tooltip visible" id="voice-tooltip">
            Posso ajudar? Fale comigo!
        </div>
        
        <div class="voice-modal" id="voice-modal">
            <div class="voice-status" id="voice-status">Olá! Como posso ajudar?</div>
            
            <div class="voice-visualizer idle" id="voice-visualizer">
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
                <div class="voice-bar"></div>
            </div>
            
            <div class="voice-controls">
                <button class="voice-action-btn btn-close" id="btn-close">Fechar</button>
                <button class="voice-action-btn btn-mic" id="btn-mic">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
            </div>
        </div>

        <button class="voice-widget-btn" id="voice-trigger-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        </button>
    `;

    document.body.appendChild(container);

    // Elementos
    const triggerBtn = document.getElementById('voice-trigger-btn');
    const modal = document.getElementById('voice-modal');
    const tooltip = document.getElementById('voice-tooltip');
    const closeBtn = document.getElementById('btn-close');
    const micBtn = document.getElementById('btn-mic');
    const statusText = document.getElementById('voice-status');
    const visualizer = document.getElementById('voice-visualizer');

    // Estado
    let isOpen = false;
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let stream = null;

    // Event Listeners
    triggerBtn.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', closeWidget);
    micBtn.addEventListener('click', toggleRecording);

    // Remover tooltip após 5s
    setTimeout(() => {
        tooltip.classList.remove('visible');
    }, 5000);

    function toggleWidget() {
        isOpen = !isOpen;
        if (isOpen) {
            modal.classList.add('active');
            triggerBtn.style.transform = 'scale(0)';
            initAudio();
        } else {
            closeWidget();
        }
    }

    function closeWidget() {
        isOpen = false;
        modal.classList.remove('active');
        triggerBtn.style.transform = 'scale(1)';
        stopRecording();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    async function initAudio() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];
                await sendAudio(audioBlob);
            };

        } catch (err) {
            console.error('Error accessing microphone:', err);
            statusText.textContent = "Erro no microfone :(";
        }
    }

    function toggleRecording() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }

    function startRecording() {
        if (!mediaRecorder) return;
        isRecording = true;
        mediaRecorder.start();
        micBtn.classList.add('recording');
        visualizer.className = 'voice-visualizer listening';
        statusText.textContent = "Ouvindo...";
    }

    function stopRecording() {
        if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
            isRecording = false;
            mediaRecorder.stop();
            micBtn.classList.remove('recording');
            visualizer.className = 'voice-visualizer idle';
            statusText.textContent = "Pensando...";
        }
    }

    async function sendAudio(blob) {
        const formData = new FormData();
        formData.append('file', blob);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network error');

            const data = await response.json();
            
            // Exibir texto do agente
            statusText.textContent = data.agent_text;
            
            // Tocar áudio se houver
            if (data.audio_base64) {
                playAudio(data.audio_base64);
            } else {
                // Fallback: usar SpeechSynthesis do navegador se backend não mandou áudio
                speakNative(data.agent_text);
            }

        } catch (error) {
            console.error('Error:', error);
            statusText.textContent = "Erro ao conectar com o agente.";
        }
    }

    function playAudio(base64Audio) {
        visualizer.className = 'voice-visualizer speaking';
        const audio = new Audio("data:audio/mp3;base64," + base64Audio);
        audio.play();
        audio.onended = () => {
            visualizer.className = 'voice-visualizer idle';
            statusText.textContent = "Sua vez...";
        };
    }

    function speakNative(text) {
        visualizer.className = 'voice-visualizer speaking';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.onend = () => {
            visualizer.className = 'voice-visualizer idle';
            statusText.textContent = "Sua vez...";
        };
        window.speechSynthesis.speak(utterance);
    }
})();
