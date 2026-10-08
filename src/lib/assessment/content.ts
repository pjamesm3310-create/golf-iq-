import type { AreaId, Drill } from "./types";

// Coaching copy and the drill library. Drills carry tags so the engine can pick
// ones that match the golfer's specific problem and where they can practise.

export interface TaggedDrill extends Drill {
  /** Sub-problems this drill is best for. Empty means it suits any variant. */
  tags: string[];
}

export interface AreaContent {
  label: string;
  headline: string;
  explanation: string;
  courseTip: string;
  /** What the golfer tracks in week 4. */
  metric: string;
  drills: TaggedDrill[];
}

export const AREA_CONTENT: Record<AreaId, AreaContent> = {
  driving: {
    label: "Tee shots",
    headline: "Keep the ball in play off the tee",
    explanation:
      "At your level, tee shots rarely cost strokes through lack of distance — they cost strokes through penalties and recovery shots. A drive that finds short grass, even 20 yards shorter, sets up a hole you can actually score on. The quickest gains come from one reliable “stock” tee shot and a club you trust when the hole is tight.",
    courseTip:
      "On tight holes, tee off with the club you hit straightest — even if that's a hybrid. Aim at the widest part of the landing area, not the middle of the fairway.",
    metric: "tee shots in play and penalty strokes",
    drills: [
      {
        id: "fairway-gates",
        name: "Fairway gates",
        venue: "range",
        tags: ["accuracy", "penalties"],
        summary: "Turn range balls into a real fairway so every drive has a consequence.",
        steps: [
          "Pick two targets about 30 yards apart — that's your fairway.",
          "Hit 10 drivers, each with your full pre-shot routine. No raking a second ball over.",
          "Count how many finish between the targets.",
        ],
        success: "7 of 10 in the fairway. Then narrow the gates.",
      },
      {
        id: "eighty-percent-driver",
        name: "80% tee shot",
        venue: "range",
        tags: ["penalties"],
        summary: "Find the swing speed where your driver stops going sideways.",
        steps: [
          "Hit 5 drivers at full effort and note where they finish.",
          "Hit 5 more at what feels like 80% — smooth tempo, full finish held for 3 seconds.",
          "Compare the spread. Most golfers lose very little distance and gain a lot of control.",
        ],
        success: "Your 80% group lands noticeably tighter than your full-effort group.",
      },
      {
        id: "club-off-test",
        name: "Driver vs. safety club",
        venue: "range",
        tags: ["accuracy", "penalties"],
        summary: "Learn which club to hit when a hole punishes a miss.",
        steps: [
          "Using the same fairway gates, alternate driver and a 3-wood or hybrid for 12 balls.",
          "Score each club: in the gates = 1 point.",
          "Whichever scores higher is your club for tight holes this month.",
        ],
        success: "You know your safety club before you reach the first tee.",
      },
      {
        id: "feet-together-swings",
        name: "Feet-together swings",
        venue: "home",
        tags: ["accuracy", "penalties"],
        summary: "Build balance and centred strike without a ball.",
        steps: [
          "Stand with your feet touching, holding a mid-iron or driver.",
          "Make 20 slow three-quarter swings, holding your finish each time.",
          "If you wobble, slow down until you don't.",
        ],
        success: "20 swings in a row holding a balanced finish.",
      },
      {
        id: "alignment-check",
        name: "Alignment check",
        venue: "home",
        tags: ["accuracy"],
        summary: "Most sideways misses start before the swing does.",
        steps: [
          "Lay a club on the floor pointing at a target across the room.",
          "Set up to an imaginary ball with your feet, hips and shoulders parallel to it.",
          "Repeat 10 times, checking with a phone photo from behind.",
        ],
        success: "Your setup matches the club line in 8 of 10 photos.",
      },
    ],
  },
  approach: {
    label: "Approach shots",
    headline: "Hit more greens — or miss in the right place",
    explanation:
      "Approach play is where scoring levels separate most. Most amateurs choose a club based on their best shot rather than their average one, so most misses finish short of the target. Solid contact plus honest club selection turns those misses into chips from the fringe instead of recovery shots.",
    courseTip:
      "Aim for the middle of the green on every approach, whatever the flag does. When torn between two clubs, take the longer one.",
    metric: "greens hit, or approaches finishing within 10 yards of the green",
    drills: [
      {
        id: "real-carry",
        name: "Know your real carry",
        venue: "range",
        tags: ["clubbing"],
        summary: "Replace your best-ever yardages with your average ones.",
        steps: [
          "Pick three clubs: a wedge, a 7-iron and your longest iron or hybrid.",
          "Hit 10 balls with each at a flag. Ignore the best 2 and worst 2.",
          "Write down where the middle 6 landed — that's your real carry. Use it on the course.",
        ],
        success: "A written yardage card with your average carry for three clubs.",
      },
      {
        id: "low-point-line",
        name: "Low-point line",
        venue: "range",
        tags: ["contact"],
        summary: "Ball first, then turf — the strike pattern behind solid irons.",
        steps: [
          "Draw a line on the mat with chalk or lay a tee across it. Place the ball just ahead of the line.",
          "Hit half-swing 7-irons trying to strike the ball, then brush the mat after it.",
          "Count the strikes that feel solid with no contact behind the ball.",
        ],
        success: "8 of 10 crisp strikes, then move to three-quarter swings.",
      },
      {
        id: "green-sized-target",
        name: "Green-sized target",
        venue: "range",
        tags: ["direction", "clubbing", "contact"],
        summary: "Practise the way approaches are actually scored: on or off the green.",
        steps: [
          "Pick a range target and imagine a green about 25 yards wide around it.",
          "Hit 5 balls each with three different clubs, full routine every shot.",
          "Any ball that would finish on that green scores a point.",
        ],
        success: "8 points out of 15. Track it weekly.",
      },
      {
        id: "start-line-gate",
        name: "Start-line gate",
        venue: "range",
        tags: ["direction"],
        summary: "Control where the ball starts and the curve takes care of itself.",
        steps: [
          "Place two tees or headcovers a club-length apart, about 3 feet in front of the ball.",
          "Hit 10 half-swing 8-irons through the gap.",
          "Widen the gate if you miss more than half; narrow it when you succeed.",
        ],
        success: "7 of 10 through the gate at half speed.",
      },
      {
        id: "towel-strike",
        name: "Towel strike drill",
        venue: "home",
        tags: ["contact", "direction", "clubbing"],
        summary: "Train ball-first contact without a range.",
        steps: [
          "Lay a towel on the floor or mat a hand-width behind where the ball would sit.",
          "Make slow half swings with a wedge or 9-iron without touching the towel.",
          "Use a foam ball if you have one; otherwise rehearse without a ball.",
        ],
        success: "15 swings in a row without touching the towel.",
      },
    ],
  },
  shortGame: {
    label: "Short game",
    headline: "Turn missed greens into easy putts",
    explanation:
      "You'll miss most greens — every golfer at your level does. What matters is what happens next. Getting chips and pitches inside 6 feet turns a bogey or worse into a real chance at par, and a reliable chip is simpler than most golfers think: one setup, one stroke, and choose the club for how much the ball should roll.",
    courseTip:
      "When the grass between you and the green is short, putt it. A putter from off the green beats a duffed chip.",
    metric: "chips and pitches finishing inside 6 feet",
    drills: [
      {
        id: "landing-towel",
        name: "Landing-spot towel",
        venue: "shortGame",
        tags: [],
        summary: "Pick where the ball lands, not where it finishes.",
        steps: [
          "Lay a towel on the green about 3 paces from the edge.",
          "Chip 10 balls with your pitching wedge, trying to land each on the towel.",
          "Watch how far each one rolls out. Repeat with a 9-iron and notice the difference.",
        ],
        success: "6 of 10 landing on the towel, and you know how far each club rolls.",
      },
      {
        id: "up-and-down-nine",
        name: "Up-and-down nine",
        venue: "shortGame",
        tags: [],
        summary: "A scored game that copies the pressure of the course.",
        steps: [
          "Drop 9 balls around the green: good lies, bad lies, short and long.",
          "Chip each one, then putt it out. Par for each ball is 2.",
          "Write down your total. Par for the game is 18.",
        ],
        success: "Beat your first score by 3 shots by week 4.",
      },
      {
        id: "one-setup-chips",
        name: "One-setup chip routine",
        venue: "shortGame",
        tags: [],
        summary: "A single, repeatable setup that removes chunks and skulls.",
        steps: [
          "Narrow stance, ball back of centre, weight on your front foot, hands just ahead of the ball.",
          "Rock your shoulders like a putting stroke — no wrist flick.",
          "Hit 20 chips to the same hole, resetting the full setup each time.",
        ],
        success: "20 chips without a fat or thin strike.",
      },
      {
        id: "wedge-ladder",
        name: "Wedge ladder",
        venue: "range",
        tags: [],
        summary: "Distance control for pitches when there's no chipping green.",
        steps: [
          "Pick three range targets roughly 20, 30 and 40 yards away.",
          "Hit 3 pitches to each with the same wedge, changing only the length of your backswing.",
          "Go up the ladder, then back down. A ball that lands within 5 paces of the target counts.",
        ],
        success: "12 of 18 landing within 5 paces.",
      },
      {
        id: "brush-the-line",
        name: "Brush the line",
        venue: "home",
        tags: [],
        summary: "Groove a chipping stroke that brushes the ground in the right place.",
        steps: [
          "Lay a pencil or a strip of tape on the carpet as your ball position.",
          "Set up to chip: weight forward, hands just ahead, then rock your shoulders with quiet wrists.",
          "Make 20 strokes that brush the carpet just after the line, never before it.",
        ],
        success: "18 of 20 brushing after the line.",
      },
      {
        id: "carpet-chips",
        name: "Carpet chips to a basket",
        venue: "home",
        tags: [],
        summary: "Rehearse the stroke and distance control indoors.",
        steps: [
          "Using foam or plastic balls, set a laundry basket or towel 3–5 steps away.",
          "Chip with a putting-style motion — shoulders rock, wrists stay quiet.",
          "Land 10 in a row on or in the target.",
        ],
        success: "10 in a row landing on target.",
      },
    ],
  },
  putting: {
    label: "Putting",
    headline: "Stop giving away putts",
    explanation:
      "Putting strokes add up quietly. Most three-putts start with the first putt finishing too far away, so speed control matters more than reading breaks. From short range, every miss is a full stroke, and a consistent start line and routine are what hole them.",
    courseTip:
      "On long putts, your only job is to finish within a 3-foot circle around the hole. Look at the hole, not the ball, on your last practice stroke.",
    metric: "total putts and three-putts",
    drills: [
      {
        id: "ladder-lag",
        name: "Ladder lag",
        venue: "puttingGreen",
        tags: ["lag"],
        summary: "Train speed so long putts finish close.",
        steps: [
          "Put tees at 20, 30 and 40 feet from a hole.",
          "Hit 3 balls from each, trying to finish past the hole but within 3 feet.",
          "Count how many finish in that zone.",
        ],
        success: "6 of 9 inside the zone.",
      },
      {
        id: "fringe-stop",
        name: "Fringe stop",
        venue: "puttingGreen",
        tags: ["lag"],
        summary: "Pure speed control with no hole to distract you.",
        steps: [
          "From the middle of the green, putt toward the far fringe.",
          "Try to stop each ball just short of the fringe edge without touching it.",
          "Change direction after every ball to change the distance.",
        ],
        success: "7 of 10 stopping within a putter length of the fringe.",
      },
      {
        id: "circle-of-eight",
        name: "Circle of eight",
        venue: "puttingGreen",
        tags: ["short"],
        summary: "Make the short ones automatic.",
        steps: [
          "Place 8 balls in a circle 3 feet from the hole.",
          "Hole all 8 in a row. Miss one and start again.",
          "When you clear 3 feet, move the circle out to 4 feet.",
        ],
        success: "All 8 holed from 4 feet.",
      },
      {
        id: "tee-gate",
        name: "Tee gate",
        venue: "puttingGreen",
        tags: ["short"],
        summary: "Start the ball on your line every time.",
        steps: [
          "Push two tees into the green just wider than a ball, one foot in front of it.",
          "From 5 feet, roll 10 putts through the gate toward the hole.",
          "Count putts that pass through cleanly.",
        ],
        success: "9 of 10 through the gate.",
      },
      {
        id: "hallway-speed",
        name: "Hallway speed",
        venue: "home",
        tags: ["lag"],
        summary: "Speed control on any carpet.",
        steps: [
          "Putt down a hallway toward a wall about 20 feet away.",
          "Try to stop each ball within a putter length of the wall without touching it.",
          "Alternate between 3 different distances.",
        ],
        success: "7 of 10 stopping inside the zone.",
      },
      {
        id: "coin-start-line",
        name: "Coin start line",
        venue: "home",
        tags: ["short"],
        summary: "Groove a square face at impact.",
        steps: [
          "Place a coin 1 foot in front of a ball on the carpet.",
          "Putt so the ball rolls directly over the coin.",
          "Do 20 putts with your full routine.",
        ],
        success: "16 of 20 rolling over the coin.",
      },
    ],
  },
  strategy: {
    label: "Decision-making",
    headline: "Take the big numbers off your card",
    explanation:
      "Double bogeys and worse cost you more than any single swing flaw, and they usually start with one decision: the carry over water, the long iron from the trees, the flag you couldn't really reach. A few simple rules — pick the safe target, take your medicine from trouble, accept bogey on hard holes — remove strokes without changing your swing.",
    courseTip:
      "In trouble, your first job is to get back in play. One shot to escape beats three trying to be a hero.",
    metric: "double bogeys or worse",
    drills: [
      {
        id: "personal-par",
        name: "Personal par",
        venue: "course",
        tags: [],
        summary: "Play to a par that fits your game this round.",
        steps: [
          "Before your round, mark the 4 hardest holes on the scorecard as one shot higher than par.",
          "Play those holes to make your personal par — no heroics.",
          "After the round, count how many doubles you avoided.",
        ],
        success: "A full round with no more than your goal of doubles.",
      },
      {
        id: "eight-of-ten",
        name: "The 8-out-of-10 rule",
        venue: "course",
        tags: [],
        summary: "Only hit shots you'd pull off 8 times out of 10.",
        steps: [
          "Before each risky shot, ask: would I pull this off 8 times out of 10?",
          "If not, choose the shot you would — usually back to the fairway.",
          "Tally how often you made the safe choice.",
        ],
        success: "You follow the rule on every trouble shot for a full round.",
      },
      {
        id: "range-round",
        name: "Play the course on the range",
        venue: "range",
        tags: [],
        summary: "Practise choosing targets, not just hitting balls.",
        steps: [
          "Play 9 imaginary holes from your home course: tee shot, then approach.",
          "For each shot, pick a safe target and club first, then go through your routine.",
          "Score yourself as if on the course: in play, on the green, or trouble.",
        ],
        success: "No 'trouble' result on more than 2 of the 9 holes.",
      },
      {
        id: "game-plan",
        name: "Ten-minute game plan",
        venue: "home",
        tags: [],
        summary: "Decide the risky holes before you get there.",
        steps: [
          "Using your course's scorecard or map, go through each hole.",
          "Pick your tee club and the safe side to miss on.",
          "Note the 2–3 holes where you will play for bogey.",
        ],
        success: "A written plan you take to your next round.",
      },
    ],
  },
};
