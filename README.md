# 🎣 Pond Flop

A local 2-player messy physics toy. Cast your line, catch fish, yank too hard and flop into the pond. Short chaotic rounds, friends yelling on one couch.

**[Play it here: https://evan-thedev.github.io/pond-flop/](https://evan-thedev.github.io/pond-flop/)**

## What It Is

Pond Flop is a simple physics-based toy where two people share one device and try to catch fish without falling in. It's inspired by the "cheap, messy, 8-second physics fail" feeling - not a full game, just a fun distraction.

- **2 players on one device** (not online)
- **3 rounds** of frantic casting and yanking
- **Simple controls**: cast, yank, try not to flop
- **No accounts, no servers, no ads** - just physics chaos

Built with vanilla HTML/CSS/JS + Matter.js physics engine. Works on desktop and mobile.

## How to Play (2 People, 1 Device)

### Controls

**Player 1 (Left side):**
- `W` - Cast your fishing line
- `S` - Yank the line (careful!)

**Player 2 (Right side):**
- `↑` (Up arrow) - Cast your fishing line
- `↓` (Down arrow) - Yank the line (careful!)

**Touch controls:**
- Tap your half of the screen to cast
- Drag down on your half to yank

### Rules

1. Press your cast button to throw a line in the pond
2. A random item appears (fish = good, junk = bad)
3. Press yank to pull it in and score points
   - 🐟 Fish: +10 points
   - 👢 Boot: -5 points
   - 🛞 Tire: -3 points
   - 🥫 Can: +1 point
4. **But be careful**: yank too hard and you'll fall in the pond!
5. Play 3 rounds. Highest score wins.

## Running Locally

1. Clone this repo:
   ```bash
   git clone https://github.com/evan-thedev/pond-flop.git
   cd pond-flop
   ```

2. Open `index.html` in any modern browser. That's it!
   - Or run a local server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

## Running Tests

Open `tests.html` in your browser to run the logic tests. All tests should pass.

The tests cover:
- Score calculation for different items
- Round completion logic
- Winner determination
- Game state management

## Technical Details

- **Stack**: Vanilla HTML/CSS/JavaScript + [Matter.js](https://brm.io/matter-js/) physics engine
- **Deployment**: GitHub Pages (static hosting)
- **No build step**: Just open index.html
- **Testing**: Simple browser-based test runner

### File Structure

```
pond-flop/
├── index.html      # Main game page
├── game.js         # Physics simulation and game loop
├── logic.js        # Pure game logic (testable)
├── style.css       # Styling
├── tests.html      # Test runner
├── README.md       # This file
└── LICENSE         # MIT license
```

## Credits

Built by [Evan Parrott](https://github.com/evan-thedev) as a portfolio piece.

Inspired by the feeling of local multiplayer physics toys where something goes hilariously wrong every round.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Note**: This is a toy, not a commercial game. No accounts, no online play, no monetization. Just two people, one device, and some messy pond physics.
