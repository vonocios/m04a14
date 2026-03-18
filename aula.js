(function () {
    'use strict';

    // ---- CSS FIX: Stop Sliders from "Dancing" ----
    const style = document.createElement('style');
    style.textContent = `
        .tts-control-group label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 140px;
        }
        #rateVal, #pitchVal, #delayVal {
            display: inline-block;
            width: 45px;
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            color: var(--accent-color, #007bff);
        }
    `;
    document.head.appendChild(style);

    // ---- TTS Engine ----
    const synth = window.speechSynthesis;
    let isPlaying = false;
    let speechQueue = [];
    
    let availableVoices = [];
    function loadVoices() {
        if (synth) {
            availableVoices = synth.getVoices();
        }
    }
    if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
    loadVoices();

    const getSettings = () => ({
        lang: document.getElementById('ttsLang')?.value || 'es-ES',
        defaultGender: document.getElementById('ttsGender')?.value || 'male',
        rate: parseFloat(document.getElementById('ttsRate')?.value || 1),
        pitch: parseFloat(document.getElementById('ttsPitch')?.value || 1),
        delay: parseInt(document.getElementById('ttsDelay')?.value || 0),
    });

    /**
     * CLEAN TEXT: Removes items inside () and ignores Portuguese phrases
     */
    function cleanTextForSpeech(text) {
        if (!text) return "";
        // Remove anything inside parentheses (e.g. "(quintal)")
        let cleaned = text.replace(/\s*\([^)]*\)/g, "");
        return cleaned.trim();
    }

    function getBestVoice(lang, gender) {
        const targetLang = lang.toLowerCase().replace('_', '-'); 
        const isMaleRequested = (gender === 'male');

        const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'susan', 'karen', 'tessa', 'moira', 'catherine', 'linda', 'aria', 'hazel', 'google uk english female'];
        const maleKeywords = ['male', 'david', 'alex', 'daniel', 'Daniel', 'george', 'mark', 'fred', 'arthur', 'james', 'ryan', 'guy', 'thomas', 'oliver', 'peter', 'richard', 'liam', 'jonathan', 'ian', 'google uk english male'];

        let langVoices = availableVoices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang));

        if (langVoices.length === 0) {
            langVoices = availableVoices.filter(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0]));
        }

        let genderSpecificVoices = langVoices.filter(v => {
            const name = v.name.toLowerCase();
            if (isMaleRequested) {
                return !femaleKeywords.some(fk => name.includes(fk)) && (maleKeywords.some(mk => name.includes(mk)) || name.includes('male'));
            } else {
                return femaleKeywords.some(fk => name.includes(fk)) || name.includes('female');
            }
        });

        return genderSpecificVoices[0] || langVoices[0]; 
    }

    function speak(textOrArray, onEnd, sourceElement) {
        if (!synth) return;
        synth.cancel();
        isPlaying = false;
        speechQueue = [];

        if (sourceElement) {
             const blockContainer = sourceElement.closest('.audio-block') || sourceElement.closest('.lesson-section') || sourceElement;
             const elementRect = blockContainer.getBoundingClientRect();
             const absoluteElementTop = elementRect.top + window.pageYOffset;
             const middle = absoluteElementTop - (window.innerHeight / 2);
             window.scrollTo({ top: middle, behavior: 'smooth' });
        }

        if (Array.isArray(textOrArray)) {
            speechQueue = textOrArray.map(item => ({...item, text: cleanTextForSpeech(item.text)}));
        } else {
            speechQueue = [{ text: cleanTextForSpeech(textOrArray) }];
        }

        const s = getSettings();
        const startDelay = sourceElement ? Math.max(s.delay, 400) : s.delay;
        
        setTimeout(() => {
            processQueue(onEnd, s);
        }, startDelay);
    }

    function processQueue(onEnd, settings) {
        if (speechQueue.length === 0) {
            isPlaying = false;
            setStatus('Pronto');
            if (typeof onEnd === 'function') onEnd();
            return;
        }

        const item = speechQueue.shift();
        if (!item.text || item.text.trim() === '') {
            processQueue(onEnd, settings);
            return;
        }

        const utt = new SpeechSynthesisUtterance(item.text);
        utt.rate = settings.rate;
        utt.pitch = settings.pitch;

        const genderToUse = item.gender || settings.defaultGender;
        const voice = getBestVoice(settings.lang, genderToUse);
        
        if (voice) {
            utt.voice = voice;
            utt.lang = voice.lang;
        } else {
            utt.lang = settings.lang;
        }

        utt.onstart = () => {
            isPlaying = true;
            setStatus('Reproduzindo…');
        };

        utt.onend = () => {
            setTimeout(() => {
                processQueue(onEnd, settings);
            }, 300); 
        };

        utt.onerror = (e) => {
            isPlaying = false;
            processQueue(onEnd, settings);
        };

        synth.speak(utt);
    }

    function stopAll() {
        speechQueue = [];
        if (synth) synth.cancel();
        isPlaying = false;
        setStatus('Pronto');
        
        document.querySelectorAll('.btn-play-block.playing').forEach(b => {
            b.classList.remove('playing');
            const label = b.querySelector('span');
            if (label) label.textContent = 'Ouvir';
        });
        document.querySelectorAll('.kw-listen.playing').forEach(b => b.classList.remove('playing'));
        document.querySelectorAll('.hoverable.speaking').forEach(b => b.classList.remove('speaking'));
        document.querySelectorAll('.adj-card.speaking').forEach(b => b.classList.remove('speaking'));
    }

    function setStatus(msg) {
        const el = document.getElementById('ttsStatus');
        if (el) el.textContent = msg;
    }

    function getSequenceFromBlock(blockId) {
        const block = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!block) return [];
        const content = block.querySelector('.audio-block-content');
        if (!content) return [];

        const items = [];
        content.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList.contains('dialogue-block')) {
                    node.querySelectorAll('.dialogue-line').forEach(line => {
                        const speakerSpan = line.querySelector('.speaker');
                        let text = line.innerText;
                        let gender = null;
                        
                        if (speakerSpan) {
                            const speakerName = speakerSpan.innerText.toLowerCase().replace(/[^a-z]/g, '');
                            if (['lucas', 'leandro', 'thales', 'dave', 'john', 'paul'].includes(speakerName)) gender = 'male';
                            if (['carol', 'sarah', 'sofia', 'anna', 'linda'].includes(speakerName)) gender = 'female';
                            
                            const clone = line.cloneNode(true);
                            clone.querySelector('.speaker').remove();
                            text = clone.innerText.trim();
                        }
                        items.push({ text: text, gender: gender });
                    });
                } else {
                    const text = node.innerText.trim();
                    if (text) items.push({ text: text });
                }
            }
        });
        return items.length > 0 ? items : [{ text: content.innerText.trim() }];
    }

    function syncSlider(sliderId, labelId) {
        const slider = document.getElementById(sliderId);
        const label = document.getElementById(labelId);
        if (slider && label) {
            slider.addEventListener('input', () => {
                label.textContent = slider.value;
            });
        }
    }

    syncSlider('ttsRate', 'rateVal');
    syncSlider('ttsPitch', 'pitchVal');
    syncSlider('ttsDelay', 'delayVal');

    document.querySelectorAll('.btn-play-block').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.classList.contains('playing')) {
                stopAll();
                return;
            }
            stopAll();
            this.classList.add('playing');
            const label = this.querySelector('span');
            if (label) label.textContent = 'Parar';
            speak(getSequenceFromBlock(this.dataset.block), () => {
                this.classList.remove('playing');
                if (label) label.textContent = 'Ouvir';
            }, this);
        });
    });

    document.querySelectorAll('.kw-listen').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = this.closest('.keyword-card');
            const text = card?.querySelector('.kw-example')?.textContent || card?.dataset.word || '';
            stopAll();
            this.classList.add('playing');
            speak(text, () => this.classList.remove('playing'));
        });
    });

    document.querySelectorAll('.keyword-card, .hoverable, .adj-card').forEach(el => {
        el.addEventListener('click', function (e) {
            if (e.target.classList.contains('kw-listen')) return;
            const text = this.dataset.speak || this.dataset.word || this.innerText.trim();
            if (text) {
                this.classList.add('speaking');
                speak(text, () => this.classList.remove('speaking'));
            }
        });
    });

    const ttsToggleBtn = document.getElementById('ttsTogglePanel');
    const ttsPanel = document.getElementById('ttsPanel');
    if (ttsToggleBtn && ttsPanel) {
        ttsToggleBtn.addEventListener('click', () => ttsPanel.classList.toggle('open'));
    }

    document.getElementById('ttsStopAll')?.addEventListener('click', stopAll);
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;

})();