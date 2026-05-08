// --- FELADATOK ADATBÁZISA ---
const tasks = [
    { title: "1. Állomás: Edificio del Reloj", desc: "Keressétek meg az óratorony főépületét!", lat: 39.4599, lng: -0.3320, type: "text_quiz", question: "Mit ábrázol a szélkakas?", answer: "VITORLÁS", finalAnswer: "VITORLÁS" },
    { title: "2A Lépés: Palacio de la Música", desc: "Irány a Turia park!", lat: 39.4663, lng: -0.3600, type: "info_step", infoText: "Van nálatok valami, ami nem a tiétek! Ha megtaláljátok, akkor ti is bebizonyíthatjátok, hogy értetek a zenéhez. Megvan?", buttonText: "MEGVAN", finalAnswer: "FR" },
    { title: "2. Állomás: Palacio de la Música", desc: "Irány a Turia park és a szökőkút!", lat: 39.4663, lng: -0.3600, type: "text_quiz", question: "Mi a kedvenc helyük?", answer: "CENTRAL PERK", finalAnswer: "CENTRAL PERK" },
    { title: "3. Állomás: Puerta del Mar", desc: "Keressétek meg a diadalívet!", lat: 39.4719, lng: -0.3679, type: "text_quiz", question: "Ki írt operát a diadalív tetején levő állatról?", answer: "JOHANN STRAUSS", finalAnswer: "JOHANN STRAUSS" },
    { title: "4. Állomás: Torres de Serranos", desc: "Másszatok fel a toronyba!", lat: 39.4791, lng: -0.3760, type: "altitude_challenge", targetDiff: 20, radius: 50, finalAnswer: "MAGASSÁG" },
    { title: "5. Állomás: Valencia Cathedral", desc: "Keressétek meg a katedrálist a Plaza de l'Almoina felől!", lat: 39.4753, lng: -0.3754, type: "text_quiz", question: "Ki volt a leghíresebb keresője a bent őrzött erekjének?", answer: "ARTHUR", finalAnswer: "ARTHUR" },
    { title: "6. Állomás: Selyembörze (La Lonja)", desc: "Látogassatok el a tőzsdepalotához a központi piaccal szemben!", lat: 39.4746, lng: -0.3783, type: "text_quiz", question: "Mik nőnek az udvaron?", answer: "NARANCSOK", finalAnswer: "NARANCSOK" },
    { title: "7. Állomás: Placa de Bous", desc: "Készítsetek fotót ott ahol a szegény bikákat megölik!", lat: 39.4670, lng: -0.3757, type: "photo", type: "text_quiz", question: "Mivel őlték őket?", answer: "PIKA" },
    { title: "8A Lépés: Mercat de Colon", desc: "Irány kóstolni!", lat: 39.4687, lng: -0.3688, type: "info_step", infoText: "Lehet találtok is valamit. Megvan?", buttonText: "MEGVAN", finalAnswer: "KÓSTOLÓ" },
    { title: "8. Állomás: Mercat de Colon", desc: "Játszátok le!", lat: 39.4687, lng: -0.3688, type: "text_quiz", question: "Ki volt a hangja a főgonosznak?", answer: "FORGÁCS PÉTER", finalAnswer: "FORGÁCS PÉTER" },
    { title: "9. Állomás: HEMISFÈRIC", type: "puzzle", lat: 39.4571, lng: -0.3533, infoText: "Ez a tudomány helye, lássuk mit tudtok?", img: "Gemini_Generated.jpg", finalAnswer: "STRENGTH" },
    { title: "10. Állomás: Oceanogràfic València", type: "quiz", lat: 39.4525, lng: -0.3481, infoText: "Ez az óceán világa, de hol voltatok eddig?", questions: [
        { imgQ: "Barcelona1.jpg", imgA: "BarcelonaM1.jpg", answer: "Barcelona" },
        { imgQ: "Isztambul1.jpg", imgA: "IsztambulM1.jpg", answer: "Isztambul" },
        { imgQ: "Marseille1.jpg", imgA: "MarseilleM1.jpg", answer: "Marseille" },
        { imgQ: "Szlovénia1.jpg", imgA: "SzlovéniaM1.jpg", answer: "Szlovénia" },
        { imgQ: "Porec1.jpg", imgA: "PorecM1.jpg", answer: "Porec" }
    ], finalAnswer: "TRAVEL" }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];
let isTaskActive = false;
let startAltitude = null;
let maxDiff = 0;
let puzzlePieces = [];
const gridSize = 5;
let totalMovedDistance = 0;
let lastLat = null;
let lastLng = null;

// GPS Figyelés kumulatív távolsággal
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
                totalMovedDistance = 0;
                lastLat = lat;
                lastLng = lng;
            }
            
            if (task.type === "altitude_challenge") {
                const moveStep = getDistance(lat, lng, lastLat, lastLng);
                if (moveStep > 1 && moveStep < 10) { 
                    totalMovedDistance += moveStep;
                    lastLat = lat;
                    lastLng = lng;
                }
                document.getElementById('alt-progress').innerText = `Megtett út: ${Math.round(totalMovedDistance)} / ${task.targetDiff} m`;
                if (totalMovedDistance >= task.targetDiff) {
                    solvedWords.push(task.finalAnswer);
                    finishTask();
                }
            }
        } else {
            document.getElementById('status').innerText = `📍 Távolság: ${Math.round(distFromTarget)}m`;
            document.getElementById('game-ui').classList.add('hidden');
            isTaskActive = false;
            lastLat = null;
        }
    }, null, { enableHighAccuracy: true, maximumAge: 1000 });
}

function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('task-title').innerText = task.title;
    
    // UI reset
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
        document.getElementById('task-desc').innerText = task.infoText || "";
        showQuizStep();
    } else if (task.type === "puzzle") {
        document.getElementById('task-desc').innerText = task.infoText || "";
        initPuzzle();
    } else if (task.type === "altitude_challenge") {
        document.getElementById('altitude-area').classList.remove('hidden');
    }
}

// ... (A többi függvény - checkTextAnswer, showQuizStep, checkQuizAnswer stb. - maradhat változatlanul)

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
    // Itt a currentIdx-et használjuk, mert az index.html-ben lévő képeid 1.jpg-től indulnak
    img.src = (currentIdx + 1) + ".jpg";
    document.getElementById('success-screen').classList.remove('hidden');
    document.getElementById('success-info').innerText = `Kód: ${solvedWords[solvedWords.length - 1]}`;
}

function proceedToNextLocation() {
    document.getElementById('success-screen').classList.add('hidden');
    currentIdx++; 
    currentQuizStep = 0; 
    isTaskActive = false;
    
    if (currentIdx < tasks.length) { 
        document.getElementById('status').innerText = "Keresd a következő helyszínt!"; 
    } else {
        // VÉGE A JÁTÉKNAK
        document.getElementById('status').innerText = "Célba értetek!";
        document.getElementById('finish-screen').classList.remove('hidden');
        // Elrejtjük a régi listát, ha benne maradt volna
        if(document.getElementById('final-results')) {
            document.getElementById('final-results').classList.add('hidden');
        }
    }
}

function checkFinalWeeks() {
    const val = document.getElementById('weeksInput').value;
    // A pontos érték 30 évre: 1565
    if (parseInt(val) === 1565) {
        document.getElementById('final-challenge-area').classList.add('hidden');
        document.getElementById('re-show-first').classList.remove('hidden');
        
        // Opcionális: Konfetti vagy extra üzenet
        alert("Pontosan! 1565 csodálatos hét!");
    } else {
        alert("Nem pontos... Számoljatok utána! (Segítség: 30 év)");
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

function confirmInfoStep() { 
    solvedWords.push(tasks[currentIdx].finalAnswer || "LÉPÉS"); 
    finishTask(); 
}

document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) document.getElementById('answer-area').classList.remove('hidden');
});
