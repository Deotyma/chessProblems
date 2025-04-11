import { Chessground } from 'chessground'
import { Chess } from 'chess.js'
import axios from 'axios'

let ground
let initialFen
let revealedMoves = 0 // Nombre de coups déjà révélés via le bouton "Indice"

async function fetchRandomPuzzle() {
  try {
    const response = await axios.get('https://lichess.org/api/puzzle/next', {
      params: {
        difficulty: 'easier',
        angle: 'mateIn2'
      },
      headers: {
        'Accept': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Erreur API puzzle Lichess :', error)
    return null
  }
}

async function loadPuzzle() {
  const puzzleData = await fetchRandomPuzzle()
  if (!puzzleData) return

  const { pgn } = puzzleData.game
  const { initialPly, solution } = puzzleData.puzzle
  const nbCoups = solution.length

  console.log("💡 Solution complète du puzzle :", solution)
  console.log(`🧩 Le puzzle nécessite ${nbCoups} coup(s) pour être résolu.`)
  console.log("🔍 PGN complet :", pgn)

  const chess = new Chess()
  chess.loadPgn(pgn)

  const history = chess.history({ verbose: true })
  chess.reset()

  // On applique initialPly coups
  for (let i = 0; i < initialPly; i++) {
    chess.move(history[i])
  }

  const expectedMove = solution[0]  // coup attendu (format UCI, ex: "d8d1")
  let finalFen = chess.fen()
  let fenFields = finalFen.split(" ")
  let activeColor = fenFields[1]  // 'w' ou 'b'
  const expectedFrom = expectedMove.slice(0, 2)
  const piece = chess.get(expectedFrom)

  // Si la couleur de la pièce sur expectedFrom ne correspond pas au tour indiqué, 
  // on réapplique les coups en utilisant initialPly
  if (piece && piece.color !== activeColor) {
    console.warn(`Correction nécessaire : la pièce sur ${expectedFrom} (${piece.color}) ne correspond pas au tour indiqué (${activeColor}).`);
    chess.reset()
    for (let i = 0; i < initialPly; i++) {
      chess.move(history[i])
    }
    finalFen = chess.fen()
    fenFields = finalFen.split(" ")
    activeColor = fenFields[1]
    console.log("🔄 Nouvelle position FEN après correction :", finalFen)
  }

  initialFen = finalFen

  // Déduire le côté qui doit jouer directement depuis la FEN
  const turnColorText = activeColor === 'w' ? 'Blanc' : 'Noir'
  console.log("📍 Position FEN actuelle :", finalFen)
  console.log("♟ Coup attendu (UCI) :", expectedMove)
  console.log(`👤 Le joueur qui commence est : ${turnColorText}`)

  const boardElement = document.getElementById('board')
  const resultElement = document.getElementById('result')
  const solutionLenghtElement = document.getElementById('solutionLenght')
  const startElement = document.getElementById('start')

  if (resultElement) resultElement.textContent = ''
  if (solutionLenghtElement) solutionLenghtElement.textContent = `Solution : ${nbCoups} coup(s)`
  if (startElement) startElement.textContent = `Début du puzzle : ${turnColorText}`	

  if (ground) boardElement.innerHTML = ''

  // Instanciation de Chessground à partir de la position corrigée
  ground = Chessground(boardElement, {
    fen: finalFen,
    orientation: activeColor === 'b' ? 'black' : 'white', // Cette ligne assure que l'orientation change
    turnColor: activeColor === 'w' ? 'white' : 'black',
    movable: {
      color: activeColor === 'w' ? 'white' : 'black',
      free: false,
      dests: new Map(
        chess.moves({ verbose: true }).reduce((acc, move) => {
          if (!acc.has(move.from)) acc.set(move.from, [])
          acc.get(move.from).push(move.to)
          return acc
        }, new Map())
      ),
      events: {
        after: (from, to) => {
          const userMove = from + to
          if (userMove === window.solution[revealedMoves]) {
            resultElement.textContent = "✅ Bonne réponse !"
            console.log("✅ Coup correct joué :", userMove)
            revealedMoves++
          } else {
            resultElement.textContent = `❌ Mauvais coup (${userMove}). Réessaie !`
            console.warn("❌ Mauvais coup :", userMove)
            setTimeout(() => {
              ground.set({ fen: initialFen })
            }, 500)
          }
        }
      }
    }
  })  

  // Exposer chess et solution pour le bouton "Indice"
  window.chess = chess
  window.solution = solution
  revealedMoves = 0
}

document.addEventListener('DOMContentLoaded', () => {
  loadPuzzle()

  const newPuzzleBtn = document.getElementById('new-puzzle')
  const hintBtn = document.getElementById('hint')

  if (newPuzzleBtn) {
    newPuzzleBtn.addEventListener('click', () => {
      loadPuzzle()
    })
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      if (!ground || !window.chess || !window.solution) return

      if (revealedMoves < window.solution.length) {
        const moveUci = window.solution[revealedMoves]
        const from = moveUci.slice(0, 2)
        const to = moveUci.slice(2, 4)

        const move = window.chess.move({ from, to })
        if (move) {
          ground.set({ fen: window.chess.fen() })
          revealedMoves++
          console.log(`💡 Indice joué : ${moveUci}`)
        }
      } else {
        console.log("✅ Tous les coups de la solution ont été révélés.")
      }
    })
  }
})
