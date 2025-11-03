// utils.js

// Elegir un elemento aleatorio de un array
function elegirAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Ordenar ranking de mayor a menor puntos
function ordenarRanking(jugadores) {
  jugadores.sort((a, b) => b.points - a.points);
}

// Seleccionar traidores de cada color
function seleccionarTraidores(jugadores) {
  const colores = [...new Set(jugadores.map(j => j.color).filter(c => c))];
  const traidores = [];
  colores.forEach(color => {
    const jugadoresColor = jugadores.filter(j => j.color === color);
    if (jugadoresColor.length > 0) {
      const elegido = jugadoresColor[Math.floor(Math.random() * jugadoresColor.length)];
      traidores.push(elegido);
    }
  });
  return traidores;
}
