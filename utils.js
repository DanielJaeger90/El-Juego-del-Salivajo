// utils.js

/**
 * Elige un elemento aleatorio de un array
 * @param {Array} array 
 * @returns elemento aleatorio
 */
export function elegirAleatorio(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Ordena jugadores por puntos de mayor a menor
 * @param {Array} jugadores Array de objetos {name, points}
 * @returns Array ordenado
 */
export function ordenarRanking(jugadores) {
  return jugadores.sort((a, b) => b.points - a.points);
}

/**
 * Cuenta atrás en segundos, ejecuta callback al finalizar
 * @param {number} segundos 
 * @param {function} callback 
 * @param {function} updateCallback (opcional) para actualizar DOM cada segundo)
 */
export function cuentaAtras(segundos, callback, updateCallback) {
  let remaining = segundos;
  const interval = setInterval(() => {
    if (updateCallback) updateCallback(remaining);
    remaining--;
    if (remaining < 0) {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

/**
 * Selecciona un traidor por cada color
 * @param {Array} jugadores Array de objetos {id, name, color}
 * @returns Array de traidores [{id, name, color}]
 */
export function seleccionarTraidores(jugadores) {
  const colores = [...new Set(jugadores.map(j => j.color))];
  const traidores = colores.map(color => {
    const jugadoresColor = jugadores.filter(j => j.color === color);
    return elegirAleatorio(jugadoresColor);
  });
  return traidores;
}

/**
 * Suma puntos a un jugador en Firebase
 * @param {string} playerId 
 * @param {number} puntos 
 * @param {object} db - referencia a Firebase
 */
export function sumarPuntos(playerId, puntos, db) {
  const { ref, onValue, update } = require("firebase/database");
  const playerRef = ref(db, `players/${playerId}/points`);
  onValue(playerRef, snapshot => {
    const current = snapshot.val() || 0;
    update(ref(db, `players/${playerId}`), { points: current + puntos });
  }, { onlyOnce: true });
}

/**
 * Devuelve un array de nombres de jugadores
 * @param {Array} jugadores 
 * @returns Array de strings
 */
export function nombresJugadores(jugadores) {
  return jugadores.map(j => j.name);
}
