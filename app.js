// app.js
import { initializeApp } from "firebase/app";
// ------------------ Inicializar Firebase ------------------
const firebaseConfig = {
  apiKey: "AIzaSyB1u_yTTEuc2oWM3tFcyx6V0BruL_ykTfY",
  authDomain: "el-juego-del-salivajo.firebaseapp.com",
  databaseURL: "https://el-juego-del-salivajo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "el-juego-del-salivajo",
  storageBucket: "el-juego-del-salivajo.firebasestorage.app",
  messagingSenderId: "725780665421",
  appId: "1:725780665421:web:5d78b77c5fccfc8951b804"
};

const app = initializeApp(firebaseConfig);
const db = firebase.database();

// ------------------ Variables y DOM ------------------
const screenSelection = document.getElementById('screen-selection');
const masterScreen = document.getElementById('master-screen');
const playerScreen = document.getElementById('player-screen');
const masterBtn = document.getElementById('master-btn');
const playerBtn = document.getElementById('player-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const startGameBtn = document.getElementById('start-game-btn');
const nextRoundBtn = document.getElementById('next-round-btn');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-list');
const contadorDiv = document.getElementById('contador');
const rankingUl = document.getElementById('ranking');

let playerId = null;
let isMaster = false;
const pruebas = ["QUIZ", "MIMIKA", "TRAIDOR", "AL_RITMO_DE_LA_NOCHE"];

// ------------------ Rol Master / Jugador ------------------
masterBtn.onclick = () => {
  screenSelection.classList.add('hidden');
  masterScreen.classList.remove('hidden');
  isMaster = true;
  listenPlayers();
};

playerBtn.onclick = () => {
  screenSelection.classList.add('hidden');
  playerScreen.classList.remove('hidden');
};

// ------------------ Unirse al juego ------------------
joinGameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) return alert("Ingresa tu nombre");
  playerId = db.ref('players').push().key;
  db.ref(`players/${playerId}`).set({ name, points: 0, color: null });
  playerScreen.querySelector('#waiting-text').textContent = 'Esperando al Master...';
};

// ------------------ Escuchar jugadores ------------------
function listenPlayers() {
  db.ref('players').on('value', snapshot => {
    playersList.innerHTML = '';
    snapshot.forEach(child => {
      const li = document.createElement('li');
      li.textContent = `${child.val().name} - ${child.val().points} pts`;
      playersList.appendChild(li);
    });
    if (isMaster) actualizarRanking();
  });
}

// ------------------ Inicio del juego ------------------
startGameBtn.onclick = () => {
  db.ref('game').update({ started: true, round: 1 });
  mostrarPrueba();
};

// ------------------ Siguiente ronda ------------------
nextRoundBtn.onclick = () => {
  db.ref('game/round').once('value', snapshot => {
    let ronda = snapshot.val() || 1;
    if (ronda < 10) {
      db.ref('game').update({ round: ronda + 1 });
      mostrarPrueba();
    } else {
      terminarJuego();
    }
  });
};

// ------------------ Ruleta de pruebas ------------------
function mostrarPrueba() {
  db.ref('game/round').once('value', snapshot => {
    const ronda = snapshot.val() || 1;
    if (ronda > 10) return terminarJuego();
    const prueba = elegirAleatorio(pruebas);
    alert(`Ronda ${ronda}: Prueba ${prueba}`);
    switch(prueba) {
      case "QUIZ": iniciarQuiz(); break;
      case "MIMIKA": iniciarMimika(); break;
      case "TRAIDOR": iniciarTraidor(); break;
      case "AL_RITMO_DE_LA_NOCHE": iniciarAlRitmo(); break;
    }
  });
}

// ------------------ Funciones de prueba ------------------

// QUIZ
function iniciarQuiz() {
  const pregunta = { texto: "¿Capital de Francia?", opciones: ["Londres","Madrid","París","Berlín"], correcta: 2 };
  if (isMaster) {
    alert(`Pregunta: ${pregunta.texto}\nOpciones: ${pregunta.opciones.join(', ')}`);
  } else {
    const respuesta = prompt(`${pregunta.texto}\n0:${pregunta.opciones[0]} 1:${pregunta.opciones[1]} 2:${pregunta.opciones[2]} 3:${pregunta.opciones[3]}`);
    const puntos = (parseInt(respuesta) === pregunta.correcta) ? 10 : -5;
    sumarPuntos(playerId, puntos);
  }
}

// Mimika
function iniciarMimika() {
  if (isMaster) alert("Elige qué jugador hará la Mimika y pulsa 'YA'");
  else mostrarContador(15, () => alert("¡Tiempo terminado!"));
}

// Traidor
function iniciarTraidor() {
  if (!isMaster) {
    const color = prompt("Elige un color: Rojo, Azul, Amarillo, Verde");
    db.ref(`players/${playerId}`).update({ color });
  } else {
    db.ref('players').once('value', snapshot => {
      const jugadores = [];
      snapshot.forEach(child => jugadores.push({ id: child.key, ...child.val() }));
      const traidores = seleccionarTraidores(jugadores);
      alert(`Traidores: ${traidores.map(t => t.name).join(', ')}`);
    });
  }
}

// Al Ritmo de la Noche
function iniciarAlRitmo() {
  if (!isMaster) mostrarContador(15, () => alert("¡Tiempo terminado!"));
  else alert("Mostrando letra incompleta a los jugadores...");
}

// ------------------ Funciones auxiliares ------------------

// Contador en pantalla
function mostrarContador(segundos, callback) {
  let tiempo = segundos;
  contadorDiv.textContent = tiempo;
  const interval = setInterval(() => {
    tiempo--;
    contadorDiv.textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(interval);
      contadorDiv.textContent = '';
      if (callback) callback();
    }
  }, 1000);
}

// Sumar puntos y actualizar ranking
function sumarPuntos(playerId, puntos) {
  db.ref(`players/${playerId}/points`).transaction(current => (current || 0) + puntos, () => {
    if (isMaster) actualizarRanking();
  });
}

// Actualizar ranking Master
function actualizarRanking() {
  db.ref('players').once('value', snapshot => {
    const jugadores = [];
    snapshot.forEach(child => jugadores.push({ name: child.val().name, points: child.val().points }));
    ordenarRanking(jugadores);
    rankingUl.innerHTML = '';
    jugadores.forEach(j => {
      const li = document.createElement('li');
      li.textContent = `${j.name} - ${j.points} pts`;
      rankingUl.appendChild(li);
    });
  });
}

// ------------------ Fuegos artificiales ------------------
function lanzarFuegosArtificiales() {
  for (let i = 0; i < 30; i++) {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    firework.style.left = Math.random() * window.innerWidth + 'px';
    firework.style.top = Math.random() * window.innerHeight + 'px';
    firework.style.background = `hsl(${Math.random()*360}, 100%, 50%)`;
    document.body.appendChild(firework);
    setTimeout(() => firework.remove(), 800);
  }
}

// Terminar juego
function terminarJuego() {
  alert("¡Fin del juego! Mostrando fuegos artificiales y el ganador...");
  lanzarFuegosArtificiales();
}


