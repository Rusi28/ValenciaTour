// --- FELADATOK ADATBÁZISA ---
const tasks = [
    { 
        title: "1. Állomás: Edificio del Reloj", 
        desc: "Keressétek meg az óratorony főépületét!", 
        lat: 47.8168, lng: 19.0770, 
        type: "text_quiz",
        question: "Mit ábrázol a szélkakas?",
        answer: "VITORLÁS",
        finalAnswer: "VITORLÁS"
    },
    { 
        title: "2A Lépés: Palacio de la Música", 
        desc: "Irány a Turia park és az üvegpalota!", 
        lat: 47.8168, lng: 19.0770, 
        type: "info_step", // Új típus
        infoText: "Van nálatok valami, ami nem a tiétek! Ha megtaláljátok, akkor ti is bebizonyíthatjátok, hogy értetek a zenéhez. Megvan?",
        buttonText: "MEGVAN",
        finalAnswer: "ZENÉSZEK" // Ez csak egy belső azonosító a jutalomképhez
    },
    { 
        title: "2. Állomás: Palacio de la Música", 
        desc: "Irány a Turia park és a szökőkút!", 
        lat: 47.8168, lng: 19.0770, 
        type: "text_quiz",
        question: "Mi a kedvenc helyük?",
        answer: "CENTRAL PERK",
        finalAnswer: "CENTRAL PERK"
    },
    { 
        title: "3. Állomás: Puerta del Mar", 
        desc: "Keressétek meg a diadalívet!", 
        lat: 47.8168, lng: 19.0770, 
        type: "text_quiz",
        question: "Ki írt operát a diadalív tetején levő állatról?",
        answer: "JOHANN STRAUSS",
        finalAnswer: "JOHANN STRAUSS"
    },
    { 
        title: "4. Állomás: Fotó", 
        desc: "Készíts egy fotót a helyszínen!", 
        lat: 47.8168, lng: 19.0770, 
        type: "photo",
        answer: "KULCS" 
    },
    { 
        title: "5. Állomás: Város-Kvíz", 
        type: "quiz",
        lat: 47.8168, lng: 19.0770, 
        questions: [
            { imgQ: "Barcelona1.jpg", imgA: "BarcelonaM1.jpg", answer: "Barcelona" },
            { imgQ: "Isztambul1.jpg", imgA: "IsztambulM1.jpg", answer: "Isztambul" },
            { imgQ: "Marseille1.jpg", imgA: "MarseilleM1.jpg", answer: "Marseille" },
            { imgQ: "Szlovénia1.jpg", imgA: "SzlovéniaM1.jpg", answer: "Szlovénia" },
            { imgQ: "Porec1.jpg", imgA: "PorecM1.jpg", answer: "Porec" }
        ],
        finalAnswer: "EURÓPA"
    },
    { 
        title: "6. Állomás: Dódzsó Puzzle", 
        type: "puzzle",
        lat: 47.8168, lng: 19.0770, 
        img: "Gemini_Generated.jpg", 
        finalAnswer: "FEGYELEM"
    }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];
let isTaskActive = false;
let puzzlePieces = [];
const gridSize = 5;

// GPS Figyelés
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, tasks[currentIdx].lat, tasks[currentIdx].lng);
        if (dist < 20) {
            document.getElementById('status').innerText = "📍 Megérkeztél!";
            if (!isTaskActive) { initTask(); isTaskActive = true; }
        } else {
            document.getElementById('status').innerText = `📍 Távolság: ${Math.round(dist)}m`;
            document.getElementById('game-ui').classList.add('hidden');
            isTaskActive = false;
        }
    }, null, { enableHighAccuracy: true });
}

function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('task-title').innerText = task.title;
    
    ['photo-area', 'quiz-area', 'puzzle-area', 'answer-area', 'text-quiz-area', 'info-area'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    if (task.type === "info_step") {
        document.getElementById('info-area').classList.remove('hidden');
        document.getElementById('info-text').innerText = task.infoText;
        document.getElementById('info-btn').innerText = task.buttonText;
    } else if (task.type === "text_quiz") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('text-quiz-area').classList.remove('hidden');
        document.getElementById('text-question').innerText = task.question;
        document.getElementById('textInput').value = "";
    } else if (task.type === "photo") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('photo-area').classList.remove('hidden');
    } else if (task.type === "quiz") {
        showQuizStep();
    } else if (task.type === "puzzle") {
        initPuzzle();
    }
}

// Válasz ellenőrzések
function checkTextAnswer() {
    const task = tasks[currentIdx];
    const val = document.getElementById('textInput').value.trim().toUpperCase();
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (norm(val) === norm(task.answer)) {
        solvedWords.push(task.finalAnswer);
        finishTask();
    } else { alert("Nem jó!"); }
}

function showQuizStep() {
    const task = tasks[currentIdx];
    
    // Ellenőrizzük, van-e még kérdés a listában
    if (task.questions && task.questions[currentQuizStep]) {
        const step = task.questions[currentQuizStep];
        
        // Terület megjelenítése
        document.getElementById('quiz-area').classList.remove('hidden');
        
        // Haladás jelzése (pl. Kép: 1/5)
        const progressEl = document.getElementById('quiz-progress');
        if (progressEl) progressEl.innerText = `Kép: ${currentQuizStep + 1}/${task.questions.length}`;
        
        // Kérdés képének beállítása
        document.getElementById('quiz-image').src = step.imgQ;
        
        // UI reset: Input mutat, Következő gomb elrejt
        document.getElementById('quiz-input-group').classList.remove('hidden');
        document.getElementById('next-quiz-btn').classList.add('hidden');
        document.getElementById('quizInput').value = "";
    }
}

function checkQuizAnswer() {
    const task = tasks[currentIdx];
    const step = task.questions[currentQuizStep];
    const val = document.getElementById('quizInput').value.trim().toLowerCase();
    
    // Ékezetmentesítés (Normalizálás)
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (norm(val) === norm(step.answer)) {
        // HELYES VÁLASZ: Megoldó kép (M-es) betöltése
        document.getElementById('quiz-image').src = step.imgA;
        
        // UI váltás: Mező elrejt, Zöld gomb megjelenik
        document.getElementById('quiz-input-group').classList.add('hidden');
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    } else {
        alert("Sajnos nem ez a város! Próbáld újra.");
    }
}

function nextQuizStep() {
    const task = tasks[currentIdx];
    currentQuizStep++;

    // Ha van még hátra kép a feladatban
    if (currentQuizStep < task.questions.length) {
        showQuizStep();
    } else {
        // Ha elfogyott az összes kép (pl. mind az 5 kész)
        solvedWords.push(task.finalAnswer);
        finishTask();
    }
}

// Puzzle Logika
function initPuzzle() {
    document.getElementById('puzzle-area').classList.remove('hidden');
    puzzlePieces = [...Array(gridSize * gridSize).keys()].sort(() => Math.random() - 0.5);
    renderPuzzle();
}

function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    puzzlePieces.forEach((pieceIdx, currentPos) => {
        const div = document.createElement('div');
        const size = 300 / gridSize;
        div.style.width = `${size}px`; div.style.height = `${size}px`;
        div.style.border = '0.5px solid #fff';
        div.style.backgroundImage = `url(${tasks[currentIdx].img})`;
        div.style.backgroundSize = '300px 300px';
        const row = Math.floor(pieceIdx / gridSize), col = pieceIdx % gridSize;
        div.style.backgroundPosition = `-${col * size}px -${row * size}px`;
        div.onclick = () => swapPieces(currentPos);
        grid.appendChild(div);
    });
}

function swapPieces(pos) {
    if (window.selectedPiece === undefined) {
        window.selectedPiece = pos;
        document.getElementById('puzzle-grid').children[pos].style.outline = "2px solid red";
    } else {
        const p1 = window.selectedPiece;
        [puzzlePieces[p1], puzzlePieces[pos]] = [puzzlePieces[pos], puzzlePieces[p1]];
        window.selectedPiece = undefined;
        renderPuzzle();
        if (puzzlePieces.every((v, i) => v === i)) { 
            solvedWords.push(tasks[currentIdx].finalAnswer); finishTask(); 
        }
    }
}

// Befejezés és navigáció
function finishTask() {
    document.getElementById('game-ui').classList.add('hidden');
    const img = document.getElementById('reward-image');
    img.src = (currentIdx + 1) + ".jpg";
    document.getElementById('success-screen').classList.remove('hidden');
    document.getElementById('success-info').innerText = `Kód: ${solvedWords[solvedWords.length - 1]}`;
}

function proceedToNextLocation() {
    document.getElementById('success-screen').classList.add('hidden');
    currentIdx++; isTaskActive = false;
    if (currentIdx >= tasks.length) {
        document.getElementById('finish-screen').classList.remove('hidden');
        document.getElementById('final-results').innerHTML = solvedWords.join("<br>");
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2-lat1) * Math.PI/180, dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function checkWord() {
    const val = document.getElementById('wordInput').value.toUpperCase().trim();
    if (val === tasks[currentIdx].answer) { solvedWords.push(val); finishTask(); }
    else { alert("Rossz szó!"); }
}

function confirmInfoStep() {
    const task = tasks[currentIdx];
    solvedWords.push(task.finalAnswer);
    finishTask(); // Meghívja a Miniont és a TOVÁBB gombot
}

document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) document.getElementById('answer-area').classList.remove('hidden');
});
