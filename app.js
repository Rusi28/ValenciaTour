const tasks = [
    { title: "1. Állomás: Edificio del Reloj", desc: "Keressétek meg az óratorony főépületét!", lat: 47.8168, lng: 19.0770, type: "text_quiz", question: "Mit ábrázol a szélkakas?", answer: "VITORLÁS", finalAnswer: "VITORLÁS" },
    { title: "2A Lépés: Palacio de la Música", desc: "Irány a Turia park!", lat: 47.8168, lng: 19.0770, type: "info_step", infoText: "Van nálatok valami, ami nem a tiétek! Ha megtaláljátok, akkor ti is bebizonyíthatjátok, hogy értetek a zenéhez. Megvan?", buttonText: "MEGVAN", finalAnswer: "ZENÉSZEK" },
    { title: "2. Állomás: Palacio de la Música", desc: "Irány a Turia park és a szökőkút!", lat: 47.8168, lng: 19.0770, type: "text_quiz", question: "Mi a kedvenc helyük?", answer: "CENTRAL PERK", finalAnswer: "CENTRAL PERK" },
    { title: "3. Állomás: Puerta del Mar", desc: "Keressétek meg a diadalívet!", lat: 47.8168, lng: 19.0770, type: "text_quiz", question: "Ki írt operát a diadalív tetején levő állatról?", answer: "JOHANN STRAUSS", finalAnswer: "JOHANN STRAUSS" },
    { 
    title: "4. Állomás: Torres de Serranos", 
    desc: "Másszatok fel a toronyba!", 
    lat: 47.8168, lng: 19.0770, 
    type: "altitude_challenge", 
    targetDiff: 20, 
    radius: 50, // Speciális nagyobb sugár ennél a feladatnál
    finalAnswer: "MAGASSÁG" 
    },
    { 
    title: "5. Állomás: Valencia Cathedral", 
    desc: "Keressétek meg a lenyűgöző katedrálist a Plaza de l'Almoina felől!", 
    lat: 39.4753, lng: -0.3751, // Valencia Cathedral koordináták
    type: "text_quiz",
    question: "Ki volt a leghíresebb keresője a bent őrzött erekjének?",
    answer: "INDIANA JONES",
    finalAnswer: "INDIANA JONES"
    },
    { title: "5. Állomás: Fotó", desc: "Készíts egy fotót a helyszínen!", lat: 47.8168, lng: 19.0770, type: "photo", answer: "KULCS" },
    { title: "6. Állomás: Város-Kvíz", type: "quiz", lat: 47.8168, lng: 19.0770, questions: [
        { imgQ: "Barcelona1.jpg", imgA: "BarcelonaM1.jpg", answer: "Barcelona" },
        { imgQ: "Isztambul1.jpg", imgA: "IsztambulM1.jpg", answer: "Isztambul" },
        { imgQ: "Marseille1.jpg", imgA: "MarseilleM1.jpg", answer: "Marseille" },
        { imgQ: "Szlovénia1.jpg", imgA: "SzlovéniaM1.jpg", answer: "Szlovénia" },
        { imgQ: "Porec1.jpg", imgA: "PorecM1.jpg", answer: "Porec" }
    ], finalAnswer: "EURÓPA" },
    { title: "7. Állomás: Dódzsó Puzzle", type: "puzzle", lat: 47.8168, lng: 19.0770, img: "Gemini_Generated.jpg", finalAnswer: "FEGYELEM" }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];
let isTaskActive = false;
let startAltitude = null;
let maxDiff = 0;
let puzzlePieces = [];
const gridSize = 5;
let totalMovedDistance = 0; // Ebben gyűjtjük a megtett métereket
let lastLat = null;
let lastLng = null;

// --- JAVÍTOTT GPS FIGYELÉS ---
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
        const task = tasks[currentIdx];
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        const distFromTarget = getDistance(lat, lng, task.lat, task.lng);
        const activeRadius = task.radius || 20;

        if (distFromTarget < activeRadius) {
            document.getElementById('status').innerText = "📍 Területen belül vagy!";
            
            if (!isTaskActive) { 
                initTask(); 
                isTaskActive = true; 
                totalMovedDistance = 0; // Resetelés az induláskor
                lastLat = lat;
                lastLng = lng;
            }
            
            // TÉNYLEGES MEGTETT ÚT SZÁMÍTÁSA (Kumulatív)
            if (task.type === "altitude_challenge") {
                // Kiszámoljuk az elmozdulást az előző mérés óta
                const moveStep = getDistance(lat, lng, lastLat, lastLng);
                
                // Csak akkor adjuk hozzá, ha a mérés nem "ugrálás" (pl. > 1 méter)
                if (moveStep > 1 && moveStep < 10) { 
                    totalMovedDistance += moveStep;
                    lastLat = lat; // Frissítjük az utolsó ismert pontot
                    lastLng = lng;
                }
                
                document.getElementById('alt-progress').innerText = `Megtett út: ${Math.round(totalMovedDistance)} / ${task.targetDiff} m`;
                
                if (totalMovedDistance >= task.targetDiff) {
                    solvedWords.push(task.finalAnswer);
                    finishTask();
                }
            }
        } else {
            document.getElementById('status').innerText = `📍 Menj a helyszínre! Távolság: ${Math.round(distFromTarget)}m`;
            document.getElementById('game-ui').classList.add('hidden');
            isTaskActive = false;
            lastLat = null; // Ha kimegy a körből, nullázzuk az előző pontot
        }
    }, null, { enableHighAccuracy: true, maximumAge: 1000 });
}
function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('task-title').innerText = task.title;
    startAltitude = null; maxDiff = 0; // Reset a kihíváshoz
    
    ['photo-area', 'quiz-area', 'puzzle-area', 'answer-area', 'text-quiz-area', 'info-area', 'altitude-area'].forEach(id => {
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
    } else if (task.type === "photo") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('photo-area').classList.remove('hidden');
    } else if (task.type === "quiz") {
        showQuizStep();
    } else if (task.type === "puzzle") {
        initPuzzle();
    } else if (task.type === "altitude_challenge") {
        document.getElementById('altitude-area').classList.remove('hidden');
    }
}

function checkTextAnswer() {
    const task = tasks[currentIdx];
    const val = document.getElementById('textInput').value.trim().toUpperCase();
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (norm(val) === norm(task.answer)) { solvedWords.push(task.finalAnswer); finishTask(); }
    else { alert("Nem jó!"); }
}

function showQuizStep() {
    const task = tasks[currentIdx];
    if (task.questions && task.questions[currentQuizStep]) {
        const step = task.questions[currentQuizStep];
        document.getElementById('quiz-area').classList.remove('hidden');
        document.getElementById('quiz-progress').innerText = `Kép: ${currentQuizStep + 1}/${task.questions.length}`;
        document.getElementById('quiz-image').src = step.imgQ;
        document.getElementById('quiz-input-group').classList.remove('hidden');
        document.getElementById('next-quiz-btn').classList.add('hidden');
        document.getElementById('quizInput').value = "";
    }
}

function checkQuizAnswer() {
    const step = tasks[currentIdx].questions[currentQuizStep];
    const val = document.getElementById('quizInput').value.trim().toLowerCase();
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (norm(val) === norm(step.answer)) {
        document.getElementById('quiz-image').src = step.imgA;
        document.getElementById('quiz-input-group').classList.add('hidden');
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    } else { alert("Sajnos nem ez a város!"); }
}

function nextQuizStep() {
    currentQuizStep++;
    if (currentQuizStep < tasks[currentIdx].questions.length) { showQuizStep(); }
    else { solvedWords.push(tasks[currentIdx].finalAnswer); finishTask(); }
}

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
        div.style.width = size + 'px'; div.style.height = size + 'px';
        div.style.backgroundImage = `url(${tasks[currentIdx].img})`;
        div.style.backgroundSize = '300px 300px';
        div.style.backgroundPosition = `-${(pieceIdx % gridSize) * size}px -${Math.floor(pieceIdx / gridSize) * size}px`;
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
        if (puzzlePieces.every((v, i) => v === i)) { solvedWords.push(tasks[currentIdx].finalAnswer); finishTask(); }
    }
}

function finishTask() {
    document.getElementById('game-ui').classList.add('hidden');
    const img = document.getElementById('reward-image');
    img.src = (currentIdx + 1) + ".jpg";
    document.getElementById('success-screen').classList.remove('hidden');
    document.getElementById('success-info').innerText = `Kód: ${solvedWords[solvedWords.length - 1]}`;
}

function proceedToNextLocation() {
    document.getElementById('success-screen').classList.add('hidden');
    currentIdx++; currentQuizStep = 0; isTaskActive = false;
    if (currentIdx < tasks.length) { document.getElementById('status').innerText = "Keresd a következő helyszínt!"; }
    else {
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
    else { alert("Rossz!"); }
}

function confirmInfoStep() { solvedWords.push(tasks[currentIdx].finalAnswer); finishTask(); }

document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) document.getElementById('answer-area').classList.remove('hidden');
});
