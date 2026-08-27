// Pure game logic (testable, no DOM)

/**
 * Calculate score for catching an item
 * @param {string} itemType - 'fish', 'boot', 'tire', 'can'
 * @returns {number} points awarded
 */
function scoreItem(itemType) {
  const scores = {
    fish: 10,
    boot: -5,
    tire: -3,
    can: 1
  };
  return scores[itemType] || 0;
}

/**
 * Determine if a round should end
 * @param {number} elapsedSeconds - time since round start
 * @param {boolean} player1Flopped - has player 1 fallen in
 * @param {boolean} player2Flopped - has player 2 fallen in
 * @returns {boolean} true if round is over
 */
function isRoundOver(elapsedSeconds, player1Flopped, player2Flopped) {
  // Round ends if both players flop, or time runs out
  const MAX_ROUND_TIME = 30;
  return (player1Flopped && player2Flopped) || elapsedSeconds >= MAX_ROUND_TIME;
}

/**
 * Calculate final winner
 * @param {number} player1Score - total score for player 1
 * @param {number} player2Score - total score for player 2
 * @returns {number} 1, 2, or 0 for tie
 */
function determineWinner(player1Score, player2Score) {
  if (player1Score > player2Score) return 1;
  if (player2Score > player1Score) return 2;
  return 0;
}

/**
 * Check if game is complete
 * @param {number} currentRound - current round number (1-indexed)
 * @param {number} totalRounds - total rounds to play
 * @returns {boolean} true if all rounds complete
 */
function isGameComplete(currentRound, totalRounds) {
  return currentRound > totalRounds;
}

/**
 * Generate random pond item
 * @returns {string} item type
 */
function randomPondItem() {
  const items = ['fish', 'fish', 'fish', 'boot', 'tire', 'can'];
  return items[Math.floor(Math.random() * items.length)];
}

// Export for Node.js testing, ignore in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scoreItem,
    isRoundOver,
    determineWinner,
    isGameComplete,
    randomPondItem
  };
}
