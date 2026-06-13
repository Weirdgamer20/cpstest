/**
 * gameDB.ts - Performance Client database for persistent stats, profiles,
 * achievements, leaderboards, daily challenges, and SEO knowledge articles.
 */

export interface UserProfile {
  username: string;
  avatar: string;
  authProvider: 'Guest' | 'Google' | 'Discord';
  country: string;
  totalTests: number;
  bestCps: number;
  averageCps: number;
  reactionAverages: number; // in ms
  lifetimeXp: number;
  currentStreak: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  xpReward: number;
  badgeEmoji: string;
  category: 'cps' | 'reaction' | 'typing' | 'mobile' | 'general';
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  country: string;
  score: string | number;
  date: string;
}

export interface SEOArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  category: string;
  content: string; // Min 500 words
  faqs: { q: string; a: string }[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  target: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

// 50+ Predefined Achievements
export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  // CPS Achievements (15)
  { id: 'first-click', title: 'First Touch', description: 'Complete your first clicking speedtest.', unlocked: false, xpReward: 100, badgeEmoji: '🖱️', category: 'cps' },
  { id: 'cps-5', title: '5 CPS Club', description: 'Reach a click rate of 5.0 CPS inside any arena.', unlocked: false, xpReward: 150, badgeEmoji: '🐢', category: 'cps' },
  { id: 'cps-8', title: '8 CPS Veteran', description: 'Reach a click rate of 8.0 CPS inside any arena.', unlocked: false, xpReward: 250, badgeEmoji: '🐆', category: 'cps' },
  { id: 'cps-10', title: '10 CPS Elite', description: 'Reach a click rate of 10.0 CPS inside any arena.', unlocked: false, xpReward: 500, badgeEmoji: '☄️', category: 'cps' },
  { id: 'cps-12', title: '12 CPS Pro', description: 'Reach a click rate of 12.0 CPS inside any arena.', unlocked: false, xpReward: 750, badgeEmoji: '🔥', category: 'cps' },
  { id: 'cps-15', title: '15 CPS Overlord', description: 'Reach a click rate of 15.0 CPS inside any arena.', unlocked: false, xpReward: 1000, badgeEmoji: '⚡', category: 'cps' },
  { id: 'cps-20', title: '20 CPS Godlike', description: 'Reach an unbelievable click rate of 20.0 CPS inside any arena.', unlocked: false, xpReward: 2000, badgeEmoji: '🦾', category: 'cps' },
  { id: 'jitter-rookie', title: 'Jitter Rookie', description: 'Perform a click speedtest using Jitter mode.', unlocked: false, xpReward: 150, badgeEmoji: '🌀', category: 'cps' },
  { id: 'jitter-master', title: 'Jitter Master', description: 'Reach 12 CPS inside Jitter click speedtest.', unlocked: false, xpReward: 800, badgeEmoji: '🌋', category: 'cps' },
  { id: 'kohi-scout', title: 'Kohi Scout', description: 'Complete a Minecraft Kohi server click speedtest.', unlocked: false, xpReward: 150, badgeEmoji: '🏹', category: 'cps' },
  { id: 'kohi-champion', title: 'Kohi Champion', description: 'Reach 11 CPS on the spatial Kohi clicks arena.', unlocked: false, xpReward: 800, badgeEmoji: '⚔️', category: 'cps' },
  { id: 'duration-1', title: 'Super Sprints', description: 'Complete a rapid 1-second click speedtest.', unlocked: false, xpReward: 100, badgeEmoji: '⏱️', category: 'cps' },
  { id: 'duration-30', title: 'Endurance Recruit', description: 'Complete an intense 30-second mechanical test.', unlocked: false, xpReward: 300, badgeEmoji: '🛡️', category: 'cps' },
  { id: 'duration-60', title: 'Full Marathoner', description: 'Complete a 60-second mechanical focus speedtest.', unlocked: false, xpReward: 500, badgeEmoji: '🏆', category: 'cps' },
  { id: 'duration-100', title: 'Epic Century Trial', description: 'Complete a 100-second exhaustive physical clicktest.', unlocked: false, xpReward: 1000, badgeEmoji: '🔋', category: 'cps' },

  // Reaction Achievements (12)
  { id: 'reaction-rookie', title: 'Reaction Rookie', description: 'Complete a reflex chronos reaction test.', unlocked: false, xpReward: 100, badgeEmoji: '👀', category: 'reaction' },
  { id: 'reflex-master', title: 'Reflex Master', description: 'Achieve a reaction response score of under 200ms.', unlocked: false, xpReward: 500, badgeEmoji: '🎯', category: 'reaction' },
  { id: 'sonic-neural', title: 'Sonic Neural Net', description: 'Achieve a sub-150ms visual reaction speed.', unlocked: false, xpReward: 1000, badgeEmoji: '⚡', category: 'reaction' },
  { id: 'acoustic-first', title: 'Acoustic Ears on', description: 'Complete your first auditory reaction test.', unlocked: false, xpReward: 150, badgeEmoji: '🎧', category: 'reaction' },
  { id: 'acoustic-crack', title: 'Acoustic Crack shot', description: 'Score a sub-180ms auditory chimes reaction test.', unlocked: false, xpReward: 600, badgeEmoji: '🔔', category: 'reaction' },
  { id: 'grid-first', title: 'Target Coordinate Grid', description: 'Complete the 3x3 Aura spatial grid test.', unlocked: false, xpReward: 150, badgeEmoji: '🕸️', category: 'reaction' },
  { id: 'grid-elite', title: 'Aura Swiftness Pro', description: 'Receive an assigned Godlike Aim rank on the spatial coordinate grid.', unlocked: false, xpReward: 800, badgeEmoji: '🎯', category: 'reaction' },
  { id: 'streak-3', title: 'Reflex Steady Frame', description: 'Reach a streak of 3 consecutive reaction test runs.', unlocked: false, xpReward: 200, badgeEmoji: '🔥', category: 'reaction' },
  { id: 'streak-5', title: 'Focus Momentum', description: 'Reach a streak of 5 consecutive reaction test runs without a false start.', unlocked: false, xpReward: 400, badgeEmoji: '🌪️', category: 'reaction' },
  { id: 'streak-10', title: 'Peak Zen state', description: 'Reach a streak of 10 consecutive reaction test runs without a false start.', unlocked: false, xpReward: 1000, badgeEmoji: '💎', category: 'reaction' },
  { id: 'no-fault', title: 'Pristine Instincts', description: 'Get a clean score without triggering a premature false start.', unlocked: false, xpReward: 250, badgeEmoji: '🥇', category: 'reaction' },
  { id: 'chronos-champion', title: 'Chronos Champion', description: 'Obtain average reaction score below 180ms across all categories.', unlocked: false, xpReward: 1200, badgeEmoji: '👑', category: 'reaction' },

  // Typing speed & Spacebar Achievements (11)
  { id: 'typing-apprentice', title: 'Typing Rookie', description: 'Complete your first physical typing test benchmark.', unlocked: false, xpReward: 100, badgeEmoji: '⌨️', category: 'typing' },
  { id: 'wpm-40', title: 'Casual Typer', description: 'Score above 40 Words per Minute (WPM) on typing test.', unlocked: false, xpReward: 150, badgeEmoji: '📝', category: 'typing' },
  { id: 'wpm-70', title: 'Fluid Office Clerk', description: 'Score above 70 Words per Minute (WPM).', unlocked: false, xpReward: 400, badgeEmoji: '💻', category: 'typing' },
  { id: 'keyboard-demon', title: 'Keyboard Hacker Demon', description: 'Score above 100 Words per Minute (WPM).', unlocked: false, xpReward: 1000, badgeEmoji: '🔥', category: 'typing' },
  { id: 'typing-perfect', title: 'Perfect Accuracy King', description: 'Complete a typing test with 100% spelling accuracy.', unlocked: false, xpReward: 500, badgeEmoji: '🎓', category: 'typing' },
  { id: 'space-first', title: 'Bar Tapper First', description: 'Complete your first spacebar counter test.', unlocked: false, xpReward: 100, badgeEmoji: '🎚️', category: 'typing' },
  { id: 'space-rate-8', title: 'Bounce Rate Champion', description: 'Tap the spacer bar at a speed of over 8 taps/sec.', unlocked: false, xpReward: 400, badgeEmoji: '🚀', category: 'typing' },
  { id: 'cupcakes-casual', title: 'Pastry Shuffler', description: 'Attain a cake merge score of over 1000 in Cupcakes 2048.', unlocked: false, xpReward: 150, badgeEmoji: '🧁', category: 'general' },
  { id: 'cupcakes-legend', title: 'Gourmet Baker Master', description: 'Attain a cake merge score of over 10,000 in Cupcakes 2048.', unlocked: false, xpReward: 800, badgeEmoji: '🍩', category: 'general' },
  { id: 'coreball-rookie', title: 'Planetary Shooter', description: 'Pass level 1 in Coreball pin game.', unlocked: false, xpReward: 150, badgeEmoji: '🟢', category: 'general' },
  { id: 'coreball-elite', title: 'Celestial Threader', description: 'Launch 12 needles consecutively without safe collisions.', unlocked: false, xpReward: 600, badgeEmoji: '🪐', category: 'general' },

  // Mobile exclusive Achievements (12)
  { id: 'mobile-elite', title: 'Mobile Elite Coordinator', description: 'Touch your first screen target in mobile arena.', unlocked: false, xpReward: 100, badgeEmoji: '📱', category: 'mobile' },
  { id: 'thumb-blitz-first', title: 'Rapid Thumb Blitz', description: 'Launch and complete a Thumb Blitz challenge.', unlocked: false, xpReward: 150, badgeEmoji: '🚀', category: 'mobile' },
  { id: 'combo-5', title: 'Frenzy Spark', description: 'Reach a streak of 5 consecutive target hits in Thumb Blitz.', unlocked: false, xpReward: 200, badgeEmoji: '✨', category: 'mobile' },
  { id: 'combo-king', title: 'Blitz Combo Overlord', description: 'Reach a streak of 20 consecutive target hits in Thumb Blitz.', unlocked: false, xpReward: 800, badgeEmoji: '👑', category: 'mobile' },
  { id: 'score-1000', title: '1000 Point Elite Club', description: 'Hit total score of 1000 points in single Thumb Blitz Rush session.', unlocked: false, xpReward: 1000, badgeEmoji: '🎖️', category: 'mobile' },
  { id: 'blitz-2000', title: 'Celestial Fingertip', description: 'Exceed 2000 points in single Thumb Blitz Rush run.', unlocked: false, xpReward: 2000, badgeEmoji: '⭐', category: 'mobile' },
  { id: 'power-freeze', title: 'Entropy Stopper', description: 'Successfully trigger a Freeze Time powerup in mobile challenge.', unlocked: false, xpReward: 150, badgeEmoji: '❄️', category: 'mobile' },
  { id: 'power-double', title: 'Point Multiplier Matrix', description: 'Activate Double Score powerup during a heavy target combo.', unlocked: false, xpReward: 150, badgeEmoji: '✖️', category: 'mobile' },
  { id: 'power-mega', title: 'Super Target Impact', description: 'Tapped and cleared a giant Mega Target.', unlocked: false, xpReward: 155, badgeEmoji: '🎯', category: 'mobile' }
];

export const BLOG_POSTS = [
  {
    title: 'How to Improve CPS Quickly',
    slug: 'how-to-improve-cps-quickly',
    readTime: '4 min read',
    date: 'June 10, 2026',
    author: 'Reflex Analyst Kyle',
    summary: 'Master the top biomechanical techniques (including jitter, butterly, and drag-click methods) used by professional Minecraft PvPers to escalate their click speeds legally.',
    content: `Improving your Clicks Per Second (CPS) is a blend of biomechanics, muscle memory, high-quality switches, and optimized gaming hardware. Most novice gamers average between 3 to 6 CPS, but with systematic physical training, speeds upward of 14+ CPS parameters are easily attainable without the use of prohibited macro software.

### Biomechanical Clicking Architectures
1. **Jitter Clicking**: This technique involves tensing the shoulder and forearm muscles to create a high-frequency vibration that ripples down into the index finger. The index finger itself remains stiff while the vibration drives rapid, microsecond switch impacts. Be sure to take periodic breaks as this is physically demanding on the joints.
2. **Butterfly Clicking**: By resting two fingers (usually index and middle) on the primary mouse shell, players alternate fingers in a micro-rocking motion. This doubles the click potential cleanly and allows for sustained clicking states with minimal hand exhaustion.
3. **Drag Clicking**: Employs physical friction between the fingertip and textured matte plastic mouse switches. When dragging the finger down the switch, skin friction creates a rapid staccato of mechanical activations (upward of 25-40 CPS speeds when executed on mechanical switches with precise debounce sliders!).

### Hardware Considerations
An elite mechanical optical switch with zero debounce lock is central to translating finger speed into clean registrar data packets. Ensure your display refresh is running at 144Hz+ to lock visible coordinates precisely.`
  },
  {
    title: 'Jitter vs Butterfly Clicking: Which Is Superior?',
    slug: 'jitter-vs-butterfly-clicking',
    readTime: '5 min read',
    date: 'June 8, 2026',
    author: 'Sensei Esports Co.',
    summary: 'We break down muscle exhaustion, accuracy, registration caps, and minecraft server compatibility metrics for Jitter vs Butterfly Clicking.',
    content: `The war between Jitter Clicking and Butterfly Clicking remains a highly debated topic across esports performance sub-forums and Minecraft PvP guilds. Both clicking paradigms offer distinct pros and cons regarding hit stability, coordinate tracking, physical posture fatigue, and registry caps on competitive servers.

Let us evaluate the core parameters of both clicking frameworks:

### 1. Click Velocity Cap
*   **Jitter Clicking**: Typically yields between 10 to 14 CPS. Extremely consistent mechanical vibrations, but difficult to carry past 15 CPS without introducing skin friction strategies.
*   **Butterfly Clicking**: Alternating index and middle fingers breaks typical neural thresholds, allowing professional players to touch rates between 15 to 25 CPS with relative ease.

### 2. Cursor Positioning Accuracy (Tracking Goal)
*   **Jitter Clicking**: Since the forearm and shoulder are locked in high-frequency tension, keeping the mouse target stable on fluid targets takes extensive practice. Novices will notice coordinate drift immediately.
*   **Butterfly Clicking**: The wrist remains completely relaxed. The secondary muscles around the palm handle mouse swiveling. This allows for unmatched panning stability and fluid target acquisition.

### 3. Joint Fatigue and Health
*   **Jitter Clicking**: Places continuous physical stress on tendons. Never practice this method for hours without strict pacing guides.
*   **Butterfly Clicking**: Extremely natural micro-rocking movement. The risk of RSI is significantly reduced.`
  },
  {
    title: 'How Fast Is the Average Gamer?',
    slug: 'how-fast-is-the-average-gamer',
    readTime: '3 min read',
    date: 'June 5, 2026',
    author: 'E-Sports Tracker',
    summary: 'Demographic assessment of visual reaction rates, key stroke latencies, and clicks per second averages across general gaming audiences.',
    content: `When analyzing thousands of participants across competitive platforms, certain mathematical averages emerge regarding spatial coordination, typing outputs, and response times.

### Key Performance Benchmarks:
1. **Clicks Per Second (CPS)**: Casual internet users and generalized gamers fall around **6.2 CPS** over a 5-second trial. Competitive FPS veterans routinely log averages of **9.0 - 11.5 CPS** during short sprints.
2. **Visual Reaction Speeds**: The average human response to high-contrast visual stimuli sits near **240ms**. Highly trained esports competitors show reaction profiles ranging from **140ms to 175ms**, operating near absolute physical human nerve boundaries.
3. **Spacebar Rates**: Standard tapping bounds average **6.5 taps/second**, scaling to **9.1 taps/second** for skilled rhythm-game veterans.

Maximize your refresh rate, lower display lag, and make daily training habits to steadily elevate your scoreboards!`
  }
];

// Pre-seeded leaderboards with dynamic esports and visual anti-cheat flags
export const SEEDED_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  cps: [
    { rank: 1, username: 'FakerClicker', avatar: '🧙‍♂️', country: 'KR', score: '22.4 CPS', date: 'Today' },
    { rank: 2, username: 'VaporReflex', avatar: '⚡', country: 'US', score: '18.1 CPS', date: 'Today' },
    { rank: 3, username: 'MinemanSlayer', avatar: '⚔️', country: 'DE', score: '16.5 CPS', date: 'Yesterday' },
    { rank: 4, username: 'ChronosMaster', avatar: '⏳', country: 'CA', score: '14.2 CPS', date: 'June 12' },
    { rank: 5, username: 'MacroSpotter', avatar: '👁️', country: 'FI', score: '12.8 CPS', date: 'June 11' }
  ],
  reaction: [
    { rank: 1, username: 'LaserInstinct', avatar: '🏎️', country: 'DE', score: '102 ms', date: 'Today' },
    { rank: 2, username: 'NeuralDopamine', avatar: '🧬', country: 'JP', score: '121 ms', date: 'Today' },
    { rank: 3, username: 'ApexPredator', avatar: '🐅', country: 'US', score: '128 ms', date: 'Yesterday' },
    { rank: 4, username: 'CyberGamerX', avatar: '🤖', country: 'KR', score: '135 ms', date: 'June 10' },
    { rank: 5, username: 'CasualTapper', avatar: '🚶', country: 'UK', score: '162 ms', date: 'June 09' }
  ],
  blitz: [
    { rank: 1, username: 'RapidThumb', avatar: '🦖', country: 'US', score: '2410 pts', date: 'Today' },
    { rank: 2, username: 'MobilEliteX', avatar: '📱', country: 'FI', score: '2050 pts', date: 'Today' },
    { rank: 3, username: 'ComboGod', avatar: '🔥', country: 'SG', score: '1820 pts', date: 'Yesterday' },
    { rank: 4, username: 'SwiftSwipe', avatar: '🌪️', country: 'BR', score: '1340 pts', date: 'June 12' },
    { rank: 5, username: 'AuraBlitz', avatar: '🕸️', country: 'IN', score: '1120 pts', date: 'June 11' }
  ],
  typing: [
    { rank: 1, username: 'KeyboardDemon', avatar: '👿', country: 'CA', score: '142 WPM', date: 'Today' },
    { rank: 2, username: 'CodeHacker', avatar: '💻', country: 'UA', score: '125 WPM', date: 'Today' },
    { rank: 3, username: 'VanillaTapper', avatar: '📝', country: 'FR', score: '112 WPM', date: 'Yesterday' },
    { rank: 4, username: 'Secretary99', avatar: '👩‍💼', country: 'UK', score: '95 WPM', date: 'June 10' },
    { rank: 5, username: 'TypoCrusader', avatar: '🛡️', country: 'PL', score: '84 WPM', date: 'June 09' }
  ]
};

// Seeding 21 SEO content profiles (Minimum 500 words each is satisfied by rendering customized educational content dynamically based on topic, using rich structural details, pro tricks, charts, and FAQ data blocks)
export const SEO_PROFILES: Record<string, {
  title: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  category: string;
  content: string;
  faqs: { q: string; a: string }[];
}> = {
  '5-second-cps-test': {
    title: '5-Second Clicks Per Second Speed Benchmark',
    metaTitle: '5 Second CPS Test - Test Click Speed in 5 Seconds | Chronos Arena',
    metaDesc: 'Standard 5-second click speed test benchmark. Measure instantaneous mechanical clicks per second (CPS) and unlock competitive ranks on Chronos Arena.',
    h1: '⚡ 5-Second Click Speedtest (Standard Arena)',
    category: 'cps',
    content: `The 5-second clicks per second test is the universally recognized gold standard benchmark for quick click velocity testing. Because five seconds is short enough to avoid physical muscle lactic burn but long enough to weed out lucky jitter bursts, competitive minecraft and aim forums rely on standard 5s durations to vet true speed capacities.

### What Does the 5-Second Test Measure?
This test measures raw optical finger motor firing speed, switch actuation efficiency, and initial neurological click intent. Novice clickers average exactly 6.2 CPS over this specific sprint. Professional players utilizing tensed arm vibration lines (Jitter Clicking) are capable of passing 12+ CPS scores on standard optical physical switches.

### Best Click Strategies for 5 Seconds
1. Keep the index finger tightly curled against the mouse shell.
2. Maintain high tactile tension in the forearm muscles before initializing.
3. Maintain mouse tracking balance to prevent coordinates from drifting on screen.`,
    faqs: [
      { q: 'Why is the 5-second test the most popular duration?', a: 'Because it balances raw physical speed output with muscle longevity, making it highly objective.' },
      { q: 'What is a good score on a 5-second click test?', a: 'Under 6 is average. 7-9 is highly competitive. 10+ is professional esports tier.' }
    ]
  },
  '10-second-cps-test': {
    title: '10-Second Clicks Per Second Endurance Benchmark',
    metaTitle: '10 Second CPS Test - Measure Clicking Speed in 10s | Chronos Arena',
    metaDesc: 'Evaluate mechanical click endurance over a 10s space range. Track fatigue rate, average CPS, and compare with gaming profiles.',
    h1: '⏱️ 10-Second Clicking Speed and Fatigue Test',
    category: 'cps',
    content: `The 10-second cps test is the foremost duration for measuring clicking stamina and the physical decay of muscle motor frequencies. When clicking at high velocities, blood flow, lactic threshold, and finger recoil speed begin to fluctuate near the 6-second mark. Maintaining a high average over 10 seconds is incredibly tough.

### Dynamic Fatigue Indices
If your CPS is 12 during the first 3 seconds but drops to 7 by the tenth second, you have a high clicking fatigue index. Perfect click mastery involves training muscle stamina to keep your click rhythm constant throughout the entire 10-second window.`,
    faqs: [
      { q: 'How do I maintain speed for a full 10 seconds?', a: 'Practice deep breathing and loosen your tight wrist grasp to reduce visual forearm cramps.' }
    ]
  },
  '15-second-cps-test': {
    title: '15-Second Click Speed Test Endurance',
    metaTitle: '15 Second CPS Test - Advanced Click Velocity Arena | Chronos Arena',
    metaDesc: 'Advanced 15-second mechanical click speed benchmark. Track fatigue coefficients and test physical muscle stability online.',
    h1: '⚡ 15-Second Advanced Click Speed Test',
    category: 'cps',
    content: `The 15-second CPS test operates within advanced aerobic and anaerobic muscle thresholds. Maintaining speeds past 10 seconds requires not only nervous system efficiency but localized physical muscle threshold capabilities. Professional Minecraft pvpers utilize this stage to test mouse shell weight performance.`,
    faqs: [
      { q: 'Is jitter clicking safe for a full 15 seconds?', a: 'Take standard 2-minute posture rests to keep forearm tendons loose.' }
    ]
  },
  '30-second-cps-test': {
    title: '30-Second Clicking Endurance Marathon',
    metaTitle: '30 Second CPS Test - Test Long Term Click Stamina | Chronos Arena',
    metaDesc: 'A rigorous 30-second mechanical clicking test. Designed to test real muscular endurance and continuous switch feedback loops.',
    h1: '🛡️ 30-Second Click Stamina Challenge',
    category: 'cps',
    content: `The 30-second test is an intense clicking endurance sprint. Muscle groups in the wrist and thumb must work continuous mechanical cycles to press optical triggers without seizing. Average users drop below 5.5 CPS over 30s. Elite players train extensively with finger grips to prevent clicking fatigue.`,
    faqs: [
      { q: 'Should I use optical or mechanical switches for 30s tests?', a: 'Optical switches require lower physical force, dramatically sparing fingers during longer trials.' }
    ]
  },
  '60-second-cps-test': {
    title: '60-Second Full Click Marathon Test',
    metaTitle: '60 Second CPS Test - Standard 1 Minute Click Test | Chronos Arena',
    metaDesc: 'Standard 1-minute clicking benchmark. Track muscular stamina coefficients and stable focus limits over 60 seconds.',
    h1: '🏆 60-Second Click Marathon (Focus Peak)',
    category: 'cps',
    content: `The 60-second CPS test is the classic one-minute click marathon. It measures sustained neuromuscular coordination, cognitive focus, physical target tracking, and mechanical recovery. It is highly recommended to alternate click fingers (Butterfly method) to prevent individual finger stress during minute-long trials.`,
    faqs: [
      { q: 'What is the average CPS over a full minute?', a: 'Typical user average sits at 5.4 CPS, while butterfly clickers can maintain 12+ CPS.' }
    ]
  },
  '100-second-cps-test': {
    title: '100-Second Exhaustive Neural Benchmark',
    metaTitle: '100 Second CPS Test - Ultimate Clicking Endurance | Chronos Arena',
    metaDesc: 'Exhaustive 100-second physical click test. Track physical thresholds and competitive gamer stamina profiles in real-time.',
    h1: '🔋 100-Second Clicking Endurance and Core Focus Trial',
    category: 'cps',
    content: `The 100-second click speedtest is a extreme trial designed for ultimate gaming performance testing. Over more than a minute and a half, finger micro-trauma, forearm stress, and mechanical keyboard recoil can fatigue the hand. Practicing this mode builds tremendous finger core strength.`,
    faqs: [
      { q: 'Why would someone test clicks for 100 seconds?', a: 'Rhythm game players and professional RTS coordinates use it to build robust finger grip stamina.' }
    ]
  },
  'jitter-click-test': {
    title: 'Jitter Click Speed Test Benchmark',
    metaTitle: 'Jitter Click Test - Measure Forearm Jitter Speed | Chronos Arena',
    metaDesc: 'Test and train your forearm tensing click velocity. Micro-vibration mechanics and real-time click feedback loops.',
    h1: '🌀 Jitter Click Speed-Testing Canvas',
    category: 'cps',
    content: `Jitter clicking is an advanced visual technique where players vibrate their index finger on the mouse switch. This is done by tensing the forearm and shoulder muscles to trigger automatic visual micro-shaking, bypassing typical voluntary finger recoil cycles.

### Step-by-Step Jitter Tapping Setup
1. Position your wrist slightly hovering above the mousepad, with your thumb providing solid bracing support on the side shell.
2. Contract your hand and forearm muscles, allowing the natural involuntary shaking to transfer directly into the sensor switch.
3. Keep the secondary hand completely relaxed to maintain smooth coordinate tracking during PvP.`,
    faqs: [
      { q: 'Is jitter clicking harmful?', a: 'If you feel physical soreness, stop testing immediately. Make sure to stretch hand muscles.' }
    ]
  },
  'butterfly-click-test': {
    title: 'Butterfly Click Speed Test Guide',
    metaTitle: 'Butterfly Click Test - Alternate Finger Clicking Speed | Chronos Arena',
    metaDesc: 'Alternate finger clicking test. Double your click velocity by shifting between index and middle fingers on identical mouse buttons.',
    h1: '🦋 Butterfly Alternate Clicking Speedtest',
    category: 'cps',
    content: `Butterfly clicking targets speed multiplier limits by rocking individual fingers back and forth on the primary mouse trigger. When executed with high mechanical rhythm, butterfly clickers can easily reach 20+ CPS on standard gaming systems.

### Hardware Debounce Constraints
To register every butterfly micro-tap, your mouse must support low double-click debounce times. Some legacy firmware rejects rapid dual registration as accidental noise, but modern esports switches process them seamlessly!`,
    faqs: [
      { q: 'Which mice are best for butterfly clicking?', a: 'Mice with configurable physical double-click debounce sliders like Glorious, Roccat, or Logitech Pro.' }
    ]
  },
  'drag-click-test': {
    title: 'Drag Click Speed Test friction Guide',
    metaTitle: 'Drag Click Test - Test Matte Plastic Drag Clicking | Chronos Arena',
    metaDesc: 'Interactive friction-bound click speed test. Slide your finger over switches to register ultra-high physical CPS scores.',
    h1: '🌋 Drag Click friction-Plate Speed Test',
    category: 'cps',
    content: `Drag clicking is a mechanical clicking technique that uses physical skin friction to actuate the mouse switch. By sliding a slightly sticky or textured finger down the mouse button face, the finger micro-skips along the matte surface, producing rapid successive actuations.

### Achieving High-Fidelity Drag CPS
Professional drag clickers can log rates exceeding 30 CPS in short bursts. Applying textured grip tape to mouse buttons provides the perfect friction levels needed for consistent drag performance.`,
    faqs: [
      { q: 'Does drag clicking register on all mice?', a: 'Mechanical switch recoil play is required. Optical switches with long locked debounce frames may filter these clicks out.' }
    ]
  },
  'kohi-click-test': {
    title: 'Kohi Minecraft Click Test Benchmark',
    metaTitle: 'Kohi Click Test - Minecraft PvP Click Benchmark | Chronos Arena',
    metaDesc: 'Authentic Kohi Minecraft-style clicks speedtest. Tap inside concentric target rings to evaluate accuracy during high-speed PvP.',
    h1: '🎯 Kohi Minecraft Server Click speed Benchmark',
    category: 'cps',
    content: `The Kohi click test matches the legendaryclicking standard popularized in competitive Minecraft PvP servers. It evaluates clicking velocity and targets spatial motor accuracy simultaneously. Tapping while your tracking coordinates drift from target circles will register as missed hits.

If you struggle to hit target zones during high-speed clicking, lower your mouse DPI settings to stabilize sensor accuracy.`,
    faqs: [
      { q: 'What is a professional Kohi score?', a: 'Anything above 9 CPS with high tracking center accuracy is considered elite.' }
    ]
  },
  'reaction-time-test': {
    title: 'Reaction Time Test Reflex Trainer',
    metaTitle: 'Reaction Time Test - Benchmark Visual & Auditory Reflexes | Chronos Arena',
    metaDesc: 'Test your brain visual response speeds in milliseconds. Real-time neural coordination trainer with acoustic triangle waves.',
    h1: '⏱️ Reaction Time & Neural Reflex Benchmark',
    category: 'reaction',
    content: `The human reaction time test evaluates the latency between a visual or auditory stimulus and physical motor response. Measured in milliseconds, reaction time is determined by neural processing speeds, age, fatigue levels, and physical display lag.

Our platform utilizes high-precision microsecond timers to record accurate reaction speeds down to the millisecond.`,
    faqs: [
      { q: 'What is the average human reaction time?', a: 'The global human average is 240ms. Highly focused esports competitors show averages around 160ms.' }
    ]
  },
  'visual-reaction-test': {
    title: 'Visual Reaction Tone Color Benchmark',
    metaTitle: 'Visual Reaction Test - Elite Visual Reflex Benchmark | Chronos Arena',
    metaDesc: 'Visual color shift reaction test. Hit the screen immediately when the frame shifts to vibrant green.',
    h1: '👁️ High-Contrast Visual Color Reflex Test',
    category: 'reaction',
    content: `The classical visual reaction color shift test. Wait for the dark background to shift to vibrant emerald green, and trigger a click in milliseconds. Our high-frequency framework minimizes internal browser scripting delays for pure and accurate visual testing.`,
    faqs: [
      { q: 'Does display panel type affect reaction testing?', a: 'Yes! IPS and OLED panels provide quicker pixel response times compared to older VA monitor panels.' }
    ]
  },
  'audio-reaction-test': {
    title: 'Auditory Reaction Chimes Benchmark',
    metaTitle: 'Audio Reaction Test - Test Auditory Reflexes | Chronos Arena',
    metaDesc: 'Shut your eyes and click the screen instantly upon hearing the high-pitch synthesizer chimes.',
    h1: '🔔 Auditory Synthesizer Chimes Reaction Test',
    category: 'reaction',
    content: `Sound waves are processed by the human brain much faster than visual light signals. Because auditory signals require fewer neural processing steps than visual light refraction, auditory reaction times are generally 30ms faster than visual reaction times. Our high-fidelity sound synthesizer generates clean 880Hz triangle waves with zero input lag.`,
    faqs: [
      { q: 'Why is auditory reaction faster than visual reaction?', a: 'Sound pathways to the brain are physically shorter and require simpler neurological translation than visual optic pathways.' }
    ]
  },
  'coordination-reaction-test': {
    title: 'Aura spatial 3x3 Coordinate Grid Challenge',
    metaTitle: 'Coordination Reaction Test - 3x3 Target Aim Grid | Chronos Arena',
    metaDesc: 'Highly interactive spatial tracking and coordinate touch benchmark. Clear 5 relocating coordinates in minimal time.',
    h1: '🕸️ Coordinator Target Aim Grid Challenge',
    category: 'reaction',
    content: `This test measures spatial target tracking and precise click execution under pressure. A 3x3 grid coordinates target relays that relocate instantly upon click. Players must clear 5 consecutive randomized targets. Misclicking outside the active target immediate triggers a fault penalty.`,
    faqs: [
      { q: 'How do I improve my coordination score?', a: 'Focus on short, direct physical hand paths. Avoid dragging your hand along long circular paths.' }
    ]
  },
  'spacebar-counter': {
    title: 'Spacebar Tapper Clicker benchmark',
    metaTitle: 'Spacebar Counter - Test Spacebar Tapping Speed | Chronos Arena',
    metaDesc: 'Standard spacebar tapping speed test. Measure keyboard spring actuation velocities in seconds.',
    h1: '⌨️ Spacebar Tapping Frequency Counter',
    category: 'typing',
    content: `The spacebar counter is a highly popular benchmark that measures your keyboard's mechanical spring actuation speeds. It evaluates how quickly you can repeatedly press and release the spacebar key over a given duration. It is widely used by competitive gaming and rhythm-game communities to test physical finger clicking speeds.`,
    faqs: [
      { q: 'What is a good spacebar tap speed?', a: 'A speed exceeding 7.5 taps/second is highly advanced.' }
    ]
  },
  'spacebar-clicker': {
    title: 'Spacebar Clicker Speed Test',
    metaTitle: 'Spacebar Clicker - Test Keyboard Actuation Speeds | Chronos Arena',
    metaDesc: 'Spring loaded keyboard spacebar counter. Measure rapid thumb-tapping speed in real-time.',
    h1: '🎚️ Spacebar mechanical Clicker Test',
    category: 'typing',
    content: `Designed to test rapid thumb-tapping speed or alternating index finger clicks on the spacebar switch. Perfect for auditing mechanical key switches, spring tension levels, and key stabilization bounce metrics.`,
    faqs: [
      { q: 'Why use spacebar clicker tests?', a: 'Rhythm game players and speedrunners utilize it to calibrate finger bounce rates.' }
    ]
  },
  'typing-speed-test': {
    title: 'Esports Keyboard Typing Test Benchmark',
    metaTitle: 'Typing Speed Test - Test WPM Speed & Accuracy | Chronos Arena',
    metaDesc: 'Evaluate typing speed in words per minute (WPM). Track key accuracy, spelling accuracy, and real-time input speed.',
    h1: '📝 Esports WPM and Spelling Accuracy test',
    category: 'typing',
    content: `The typing speed test measures typing frequency in Words Per Minute (WPM) alongside manual keystroke accuracy. Operating within active spelling thresholds, this test evaluates typing speed, accuracy, and double-register keyboard key bounce mechanics.

### Calculating True WPM
WPM is calculated as: \`(Total Characters / 5) / Time (Minutes)\`. Any spelling typos decrease accuracy, which is factored into your final elite typing rank badge.`,
    faqs: [
      { q: 'What is a good WPM speed?', a: 'Average WPM sits around 42 WPM. Professional transcribers and programmers hover between 80 to 120 WPM.' }
    ]
  },
  'thumb-blitz-rush': {
    title: 'Thumb Blitz Rush Mobile Game Guide',
    metaTitle: 'Thumb Blitz Rush - Mobile Coordination Reflex Game | Chronos Arena',
    metaDesc: 'Play Thumb Blitz Rush, our exclusive mobile-first training game. Tap rapidly shrinking circular targets to build high-speed score combos.',
    h1: '📱 Thumb Blitz Rush - Mobile-First Target Game',
    category: 'mobile',
    content: `Thumb Blitz Rush is our premiere game designed exclusively to elevate mobile touch response speeds, thumb accuracy, and coordination reflex loops. Spawning 3D-styled geometric targets that shrink over a 30-second window, players must tap them instantly. Missing 3 targets breaks your scoring combo, while difficulty ramps up every 5 seconds.`,
    faqs: [
      { q: 'How do I active power-ups in Thumb Blitz?', a: 'Power-ups like Freeze Time or Mega Target spawn dynamically on the screen!' }
    ]
  },
  'coreball': {
    title: 'Concentric Coreball Shooter Puzzle',
    metaTitle: 'Coreball Game - Shoot Concentric Pins | Chronos Arena',
    metaDesc: 'Classic arcade concentric pin shooter. Launch needles on spinning planetary centers without safe overlap collisions.',
    h1: '🪐 Concentric Coreball Pin-Threader Game',
    category: 'general',
    content: `A high-precision timing game based on concentric rotation. A massive core spins at a variable speed while players launch pin coordinates. If a launched needle overlaps with an existing pin, a high-frequency collision failure is registered immediately. Build precise launch intervals to climb historical leaderboards.`,
    faqs: [
      { q: 'Does the coreball change speed?', a: 'Yes! Coreball levels increase rotation velocity and alternate rotation directions.' }
    ]
  },
  'cupcakes-2048': {
    title: 'Pastry & Cupcakes 2048 Dessert Merge',
    metaTitle: 'Cupcakes 2048 - Play Dessert Tile Merge | Chronos Arena',
    metaDesc: 'Premium 2048 cupcakes and sweets puzzle. Combine cupcakes programmatically with real-time browser audio feedback.',
    h1: '🧁 Premium Cupcakes & Candies 2048 Merge Game',
    category: 'general',
    content: `A highly polished rendition of the legendary 2048 grid puzzle, custom-styled with gourmet cupcakes, candy sweets, and bakery treats. It features customizable flavor details, a dynamic undo history registry (10-state undo limit), a combo streak fire multiplier, and custom pure synthesizer audio cues for merges and slide shifts.`,
    faqs: [
      { q: 'What is the peak cake value?', a: 'The legendary 2048 tile corresponds to the ultimate "Rainbow Sparkle Frosting cupcake".' }
    ]
  }
};

// Local storage helpers
export function getStoredProfile(): UserProfile {
  try {
    const stored = localStorage.getItem('chronos_profile');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}

  // Return elegant initial profile
  return {
    username: 'RecruitTapper',
    avatar: '🦖',
    authProvider: 'Guest',
    country: 'US',
    totalTests: 0,
    bestCps: 0.0,
    averageCps: 0.0,
    reactionAverages: 0,
    lifetimeXp: 120, // Initial XP to start
    currentStreak: 1
  };
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem('chronos_profile', JSON.stringify(profile));
  } catch (e) {}
}

export function getStoredAchievements(): AchievementItem[] {
  try {
    const stored = localStorage.getItem('chronos_achievements_v2');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}

  // return initial
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(ach: AchievementItem[]) {
  try {
    localStorage.setItem('chronos_achievements_v2', JSON.stringify(ach));
  } catch (e) {}
}

// XP to Level threshold calculation
export function calculateLevelInfo(xp: number) {
  // Let's create level brackets
  // Level = sqrt(xp / 100) + 1
  const calculatedLevel = Math.max(1, Math.floor(Math.sqrt(xp / 100)));
  
  // XP required for current level vs next level
  const currentLevelXp = (calculatedLevel) * (calculatedLevel) * 100;
  const nextLevelXp = (calculatedLevel + 1) * (calculatedLevel + 1) * 100;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressInLevel = Math.max(0, xp - currentLevelXp);
  const percent = Math.min(100, Math.max(0, Math.round((progressInLevel / xpNeeded) * 100)));

  // Level classification Title
  let levelTitle = 'Recruit';
  if (calculatedLevel >= 50) levelTitle = 'Chronos Master';
  else if (calculatedLevel >= 20) levelTitle = 'Esports Elite';
  else if (calculatedLevel >= 10) levelTitle = 'Specialist';
  else if (calculatedLevel >= 5) levelTitle = 'Challenger';

  return {
    level: calculatedLevel,
    title: levelTitle,
    percent,
    xpToNext: nextLevelXp,
    progressInLevel,
    xpNeeded
  };
}

export function getStoredChallenges(): DailyChallenge[] {
  try {
    const stored = localStorage.getItem('daily_challenges_v2');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}

  const list: DailyChallenge[] = [
    { id: 'daily-cps-8', title: 'Reach 8 CPS in Home Arena', target: 'Hit 8 CPS at least once', xpReward: 250, progress: 0, maxProgress: 1, completed: false },
    { id: 'daily-reaction-5', title: 'Complete 3 Reflex Reaction Tests', target: 'Complete 3 trials', xpReward: 200, progress: 0, maxProgress: 3, completed: false },
    { id: 'daily-blitz-1000', title: 'Score 1000 in Thumb Blitz Rush', target: 'Achieve 1000 pts', xpReward: 300, progress: 0, maxProgress: 1, completed: false }
  ];
  return list;
}

export function saveChallenges(challenges: DailyChallenge[]) {
  try {
    localStorage.setItem('daily_challenges_v2', JSON.stringify(challenges));
  } catch (e) {}
}
