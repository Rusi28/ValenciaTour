// --- FELADATOK ADATBÁZISA ---
const tasks = [
    { 
        title: "Kezdés: A lakásod", 
        desc: "Készíts egy fotót a bejárati ajtóról!", 
        lat: 47.8168, lng: 19.0770, // <--- Írd át a saját koordinátáidra teszthez!
        type: "photo",
        answer: "KULCS" 
    },
    { 
        title: "Város-Kvíz", 
        type: "quiz",
        lat: 47.8168, lng: 19.0770, // A kvíz helyszíne
        questions: [
            { img: "parizs.jpg", answer: "Párizs" },
            { img: "roma.jpg", answer: "Róma" },
            { img: "london.jpg", answer: "London" },
            { img: "praga.jpg", answer: "Prága" },
            { img: "berlin.jpg", answer: "Berlin" }
        ],
        finalAnswer: "EURÓPA"
    }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];

// GPS Követés
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, tasks[currentIdx].lat, tasks[currentIdx].lng);
        if (dist < 20) {
            document.getElementById('status').innerText = "📍 Megérkeztél!";
            initTask();
        } else {
            document.getElementById('status').innerText = `📍 Menj közelebb! (${Math.round(dist)}m)`;
            document.getElementById('game-ui').classList.add('hidden');
        }
    }, null, { enableHighAccuracy: true });
}

function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('task-title').innerText = task.title;
    
    if (task.type === "photo") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('photo-area').classList.remove('hidden');
        document.getElementById('quiz-area').classList.add('hidden');
    } else if (task.type === "quiz") {
        showQuizStep();
    }
}

// Fotó kezelés
document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('answer-area').classList.remove('hidden');
    }
});

// Kvíz kezelés
function showQuizStep() {
    const task = tasks[currentIdx];
    const step = task.questions[currentQuizStep];
    document.getElementById('quiz-area').classList.remove('hidden');
    document.getElementById('quiz-progress').innerText = `Kép: ${currentQuizStep + 1}/5`;
    document.getElementById('quiz-image').src = step.img;
    document.getElementById('quiz-image').classList.add('blur');
    document.getElementById('quiz-input-group').classList.remove('hidden');
    document.getElementById('next-quiz-btn').classList.add('hidden');
    document.getElementById('quizInput').value = "";
}

function checkQuizAnswer() {
    const step = tasks[currentIdx].questions[currentQuizStep];
    const val = document.getElementById('quizInput').value.trim().toLowerCase();
    if (val === step.answer.toLowerCase()) {
        document.getElementById('quiz-image').classList.remove('blur');
        document.getElementById('quiz-input-group').classList.add('hidden');
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    } else {
        alert("Sajnos nem ez a város!");
    }
}

function nextQuizStep() {
    currentQuizStep++;
    if (currentQuizStep < 5) {
        showQuizStep();
    } else {
        alert("Ügyes vagy! A kódod: " + tasks[currentIdx].finalAnswer);
        solvedWords.push(tasks[currentIdx].finalAnswer);
        finishTask();
    }
}

function checkWord() {
    const val = document.getElementById('wordInput').value.toUpperCase().trim();
    if (val === tasks[currentIdx].answer) {
        solvedWords.push(val);
        finishTask();
    } else { alert("Rossz szó!"); }
}

function finishTask() {
    currentIdx++;
    if (currentIdx < tasks.length) {
        alert("Jöhet a következő pont!");
        document.getElementById('answer-area').classList.add('hidden');
        document.getElementById('photo-area').classList.add('hidden');
    } else {
        showFinalScreen();
    }
}

function showFinalScreen() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('finish-screen').classList.remove('hidden');
    document.getElementById('final-results').innerHTML = solvedWords.join("<br>");
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
