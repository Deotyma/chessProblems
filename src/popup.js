import { Chessground } from 'chessground'
import { Chess } from 'chess.js'

const game = new Chess()
game.load('6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1')

const boardElement = document.getElementById('board')

const ground = Chessground(boardElement, {
  fen: game.fen(),
  movable: {
    free: false,
    color: 'white',
    dests: new Map(
      game.moves({ verbose: true }).map(m => [m.from, [m.to]])
    )
  }
})


