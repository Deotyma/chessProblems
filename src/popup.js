import { Chessground } from 'chessground'
import { Chess } from 'chess.js'
import axios from 'axios'

let ground // référence à l'échiquier pour pouvoir le recharger

// Fonction pour obtenir un puzzle random de Lichess
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

  const chess = new Chess()
  const pgnMoves = pgn.trim().split(/\s+/)

  // Rejouer tous les coups jusqu'à la position du puzzle
  for (let i = 0; i < initialPly; i++) {
    chess.move(pgnMoves[i])
  }

  const expectedMove = solution[0]
  const boardElement = document.getElementById('board')
  const resultElement = document.getElementById('result')

  // Nettoyer le texte de résultat
  if (resultElement) resultElement.textContent = ''

  // Si un échiquier existait déjà, on le détruit (remplace le DOM)
  if (ground) {
    boardElement.innerHTML = ''
  }

  ground = Chessground(boardElement, {
    fen: chess.fen(),
    turnColor: chess.turn() === 'w' ? 'white' : 'black',
    movable: {
      color: chess.turn() === 'w' ? 'white' : 'black',
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
          if (userMove === expectedMove) {
            resultElement.textContent = "✅ Bonne réponse !"
          } else {
            resultElement.textContent = `❌ Mauvais coup (${userMove}). Réessaie !`
          }
        }
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  loadPuzzle()

  const newPuzzleBtn = document.getElementById('new-puzzle')
  if (newPuzzleBtn) {
    newPuzzleBtn.addEventListener('click', () => {
      loadPuzzle()
    })
  }
})

