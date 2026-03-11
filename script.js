const wordsList = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const wordsContainer = document.getElementById('words-container');
const hiddenInput = document.getElementById('hidden-input');
const caret = document.getElementById('caret');
const timerDisplay = document.getElementById('timer');
const resultsDisplay = document.getElementById('results');
const typingArea = document.getElementById('typing-area');
const resWPM = document.getElementById('res-wpm');
const resAcc = document.getElementById('res-acc');

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let timer = null;
let duration = 30;
let isFinished = false;

function initGame() {
    isFinished = false;
    currentWordIndex = 0;
    currentCharIndex = 0;
    startTime = null;
    clearInterval(timer);
    
    wordsContainer.innerHTML = '';
    resultsDisplay.classList.add('hidden');
    typingArea.classList.remove('hidden');
    timerDisplay.classList.remove('hidden');
    timerDisplay.innerText = duration;
    
    // Shuffle and pick 100 words
    words = [...wordsList].sort(() => Math.random() - 0.5).concat([...wordsList].sort(() => Math.random() - 0.5));
    
    words.forEach((wordText, i) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordText.split('').forEach(char => {
            const letter = document.createElement('letter');
            letter.innerText = char;
            wordDiv.appendChild(letter);
        });
        wordsContainer.appendChild(wordDiv);
    });

    updateCaret();
    hiddenInput.value = '';
    hiddenInput.focus();
}

function updateCaret() {
    const currentWord = wordsContainer.children[currentWordIndex];
    const currentLetter = currentWord.children[currentCharIndex] || null;
    
    let left, top;
    
    if (currentLetter) {
        left = currentLetter.offsetLeft;
        top = currentLetter.offsetTop;
    } else {
        // End of word - position after last character
        const lastLetter = currentWord.children[currentWord.children.length - 1];
        left = lastLetter.offsetLeft + lastLetter.offsetWidth;
        top = lastLetter.offsetTop;
    }
    
    caret.style.left = `${left}px`;
    caret.style.top = `${top + 5}px`;

    // Scroll container if needed
    const lineHeight = 35; // approximate
    const containerTop = wordsContainer.offsetTop;
    if (top > lineHeight * 1) {
        wordsContainer.style.transform = `translateY(-${top - 5}px)`;
    } else {
        wordsContainer.style.transform = `translateY(0)`;
    }
}

function startTimer() {
    startTime = Date.now();
    let timeLeft = duration;
    
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function finishGame() {
    isFinished = true;
    clearInterval(timer);
    typingArea.classList.add('hidden');
    timerDisplay.classList.add('hidden');
    resultsDisplay.classList.remove('hidden');
    
    calculateStats();
}

function calculateStats() {
    const allLetters = wordsContainer.querySelectorAll('letter');
    const correctLetters = wordsContainer.querySelectorAll('letter.correct').length;
    const incorrectLetters = wordsContainer.querySelectorAll('letter.incorrect').length + wordsContainer.querySelectorAll('letter.extra').length;
    
    const totalTyped = correctLetters + incorrectLetters;
    const accuracy = totalTyped === 0 ? 0 : Math.round((correctLetters / totalTyped) * 100);
    
    // WPM calculation: (characters / 5) / (time in minutes)
    const wpm = Math.round((correctLetters / 5) / (duration / 60));
    
    resWPM.innerText = wpm;
    resAcc.innerText = `${accuracy}%`;
}

hiddenInput.addEventListener('input', (e) => {
    if (isFinished) return;
    if (!startTime) startTimer();
    
    const input = e.target.value;
    const currentWord = words[currentWordIndex];
    const wordElement = wordsContainer.children[currentWordIndex];
    
    if (input.endsWith(' ')) {
        // Space pressed - move to next word
        if (currentCharIndex > 0) {
            // Check if word was correct
            let wordCorrect = true;
            for(let i=0; i < wordElement.children.length; i++) {
                if(!wordElement.children[i].classList.contains('correct')) {
                    wordCorrect = false;
                    break;
                }
            }
            if (!wordCorrect) wordElement.classList.add('error');
            
            currentWordIndex++;
            currentCharIndex = 0;
            e.target.value = '';
        }
    } else {
        const lastChar = input[input.length - 1];
        
        if (input.length < currentCharIndex) {
            // Backspace handled by mapping input length
        }
        
        // Visual feedback
        const letters = wordElement.children;
        
        // Reset letters beyond input length
        for (let i = input.length; i < letters.length; i++) {
            letters[i].className = '';
        }
        
        // Mark correct/incorrect
        for (let i = 0; i < input.length; i++) {
            if (i < currentWord.length) {
                if (input[i] === currentWord[i]) {
                    letters[i].className = 'correct';
                } else {
                    letters[i].className = 'incorrect';
                }
            } else {
                // Extra characters
                if (!letters[i]) {
                    const extraLetter = document.createElement('letter');
                    extraLetter.className = 'extra';
                    extraLetter.innerText = input[i];
                    wordElement.appendChild(extraLetter);
                }
            }
        }
        
        currentCharIndex = input.length;
    }
    
    updateCaret();
});

// Restart on Tab
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        initGame();
    }
});

// Click to focus
document.addEventListener('click', () => {
    hiddenInput.focus();
});

// Config buttons
document.querySelectorAll('.config button').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.configType;
        const val = btn.dataset.configValue;
        
        if (type === 'time') {
            duration = parseInt(val);
            document.querySelectorAll('[data-config-type="time"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            initGame();
        }
    });
});

initGame();
