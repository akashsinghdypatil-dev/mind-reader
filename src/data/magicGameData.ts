/* ============================================================================
   MIND READER — EDITABLE GAME DATA
   Beginners: You can freely edit the colours, foods, roasts, predictions,
   love verdicts, and emoji riddles below. Every game reads directly from these!
   ============================================================================ */

/* ----------------------------------------------------------------------------
   0. COLOUR MIND READER (Exactly 16 colours, indices 0–15 for 4-bit binary)
   Each YES adds 1, 2, 4, or 8 to uniquely pinpoint the colour.
   ---------------------------------------------------------------------------- */
export interface MindReaderColour {
  id: number; // 0 to 15 (fixed 4-bit binary index)
  name: string;
  hex: string;
  roast: string;
}

export const MIND_READER_COLOURS: MindReaderColour[] = [
  { id: 0, name: 'Red', hex: '#DC2626', roast: 'Red? Bold choice. Danger, love and WiFi password anger.' },
  { id: 1, name: 'Blue', hex: '#2563EB', roast: 'Blue! Calm, trustworthy, and definitely has 47 unread browser tabs open.' },
  { id: 2, name: 'Green', hex: '#16A34A', roast: 'Green? Fresh, nature-loving, and secretly wishes their houseplants would stop dying.' },
  { id: 3, name: 'Yellow', hex: '#EAB308', roast: 'Yellow! Pure sunshine energy—basically a human highlighter.' },
  { id: 4, name: 'Orange', hex: '#EA580C', roast: 'Orange? Chaotic good, fun at parties, and impossible to ignore in traffic.' },
  { id: 5, name: 'Purple', hex: '#9333EA', roast: 'Purple! Royal taste—you clearly belong in a neon wizard tower.' },
  { id: 6, name: 'Pink', hex: '#EC4899', roast: 'Pink! Confident and not afraid of attention.' },
  { id: 7, name: 'Black', hex: '#0F172A', roast: 'Black? Mysterious. Or you just wear it because it hides stains.' },
  { id: 8, name: 'White', hex: '#F1F5F9', roast: 'White! Minimalist, aesthetic, and lives in constant fear of spilling curry.' },
  { id: 9, name: 'Brown', hex: '#78350F', roast: 'Brown? Grounded, cozy, and probably powered by coffee and chocolate.' },
  { id: 10, name: 'Grey', hex: '#64748B', roast: 'Grey! Effortlessly cool, diplomatic, and refuses to pick sides in group drama.' },
  { id: 11, name: 'Cyan', hex: '#06B6D4', roast: 'Cyan? Futuristic hacker vibes—you definitely own at least one RGB gadget.' },
  { id: 12, name: 'Maroon', hex: '#881337', roast: 'Maroon! Fancy, dramatic, and says "it is burgundy, actually" at least once a week.' },
  { id: 13, name: 'Navy', hex: '#1E3A8A', roast: 'Navy? Sharp, classic, and looks like you have your life 10% more together than everyone else.' },
  { id: 14, name: 'Lime', hex: '#65A30D', roast: 'Lime! Electric, zesty, and refuses to blend into the background.' },
  { id: 15, name: 'Gold', hex: '#CA8A04', roast: 'Gold? Main-character syndrome—and honestly, you pull it off.' },
];

/**
 * Verifies that all 16 colours appear in a unique combination of the 4 binary
 * groups (bits 1, 2, 4, 8) and that every single colour resolves accurately.
 */
export function runColourMindReaderTests() {
  const signatures = new Set<string>();
  const results = MIND_READER_COLOURS.map((colour, expectedIdx) => {
    let total = 0;
    let sig = '';
    for (let bit = 0; bit < 4; bit++) {
      const bitValue = 1 << bit; // 1, 2, 4, 8
      const group = MIND_READER_COLOURS.filter((c) => (c.id & bitValue) !== 0);
      const inGroup = group.some((c) => c.id === colour.id);
      sig += inGroup ? '1' : '0';
      if (inGroup) total += bitValue;
    }
    const uniqueSig = !signatures.has(sig);
    signatures.add(sig);
    const revealed = MIND_READER_COLOURS[total];
    const passed =
      uniqueSig &&
      total === expectedIdx &&
      revealed?.id === colour.id &&
      revealed?.name === colour.name &&
      Boolean(revealed?.roast);
    return {
      colour,
      binarySignature: sig.split('').reverse().join(''),
      computedIndex: total,
      passed,
    };
  });

  return {
    allPassed: results.length === 16 && results.every((r) => r.passed),
    results,
  };
}

/* ----------------------------------------------------------------------------
   1. GUESS MY FAVOURITE FOOD (Must have exactly 16 items for 4-question binary)
   ---------------------------------------------------------------------------- */
export interface FoodItem {
  id: number; // 0 to 15 (used for 4-bit binary elimination)
  name: string;
  emoji: string;
  roast: string;
}

export const FOODS: FoodItem[] = [
  { id: 0, name: 'Pizza', emoji: '🍕', roast: 'Pizza? You definitely say "just one slice" and then mysteriously finish the whole box.' },
  { id: 1, name: 'Biryani', emoji: '🍛', roast: 'Biryani? Your taste is royal and your wallet is crying.' },
  { id: 2, name: 'Momos', emoji: '🥟', roast: 'Momos? You judge friendships by whether they share the extra red chutney.' },
  { id: 3, name: 'Pani Puri', emoji: '🫧', roast: 'Pani Puri? You always ask for "ek sukha puri" at the end like it is your birthright.' },
  { id: 4, name: 'Burger', emoji: '🍔', roast: 'Burger? You love layers, drama, and pretending the lettuce counts as a salad.' },
  { id: 5, name: 'Dosa', emoji: '🥞', roast: 'Dosa? Crispy, iconic, and somehow bigger than your entire dining table.' },
  { id: 6, name: 'Samosa', emoji: '🥟', roast: 'Samosa? You hear rain outside and your brain immediately whispers "chai + samosa".' },
  { id: 7, name: 'Pav Bhaji', emoji: '🥘', roast: 'Pav Bhaji? You measure happiness strictly in cubes of melting butter.' },
  { id: 8, name: 'Pasta', emoji: '🍝', roast: 'Pasta? Fancy enough for Instagram, comforting enough for 2 AM.' },
  { id: 9, name: 'Noodles', emoji: '🍜', roast: 'Noodles? Slurping loudly is not bad manners, it is a lifestyle.' },
  { id: 10, name: 'Ice Cream', emoji: '🍨', roast: 'Ice Cream? Even in freezing winter, your answer is still "double scoop, please".' },
  { id: 11, name: 'Chocolate', emoji: '🍫', roast: 'Chocolate? Your mood swings have one universal software patch.' },
  { id: 12, name: 'Chole Bhature', emoji: '🫓', roast: 'Chole Bhature? Bold choice—hope you already scheduled your 3-hour post-lunch nap.' },
  { id: 13, name: 'Maggi', emoji: '🍲', roast: 'Maggi? Two minutes is the biggest myth in human history and you still believe it.' },
  { id: 14, name: 'Vada Pav', emoji: '🥖', roast: 'Vada Pav? Fast, fiery, and powered by pure unstoppable Mumbai energy.' },
  { id: 15, name: 'Sandwich', emoji: '🥪', roast: 'Sandwich? Practical, toasted, and always tastes twice as good when cut diagonally.' },
];

/* ----------------------------------------------------------------------------
   2. COLOUR TRAP DATA & RANKS
   ---------------------------------------------------------------------------- */
export interface TrapColour {
  id: string;
  name: string;
  hex: string;
  buttonBg: string;
}

export const COLOUR_TRAP_COLOURS: TrapColour[] = [
  { id: 'red', name: 'RED', hex: '#FF4D6D', buttonBg: '#E11D48' },
  { id: 'blue', name: 'BLUE', hex: '#38BDF8', buttonBg: '#0284C7' },
  { id: 'green', name: 'GREEN', hex: '#4ADE80', buttonBg: '#16A34A' },
  { id: 'yellow', name: 'YELLOW', hex: '#FACC15', buttonBg: '#CA8A04' },
  { id: 'purple', name: 'PURPLE', hex: '#C084FC', buttonBg: '#9333EA' },
  { id: 'orange', name: 'ORANGE', hex: '#FB923C', buttonBg: '#EA580C' },
];

export function getColourTrapRank(score: number): { title: string; line: string } {
  if (score <= 5) {
    return {
      title: 'Sleepy Panda',
      line: 'Your eyes saw red, your brain saw snacks, and your thumb went on vacation.',
    };
  }
  if (score <= 12) {
    return {
      title: 'Average Human',
      line: 'Solid reflexes! You only got tricked by basic kindergarten colours a few times.',
    };
  }
  if (score <= 20) {
    return {
      title: 'Sharp Brain',
      line: 'Your prefrontal cortex is flexing hard right now. Stroop effect defeated!',
    };
  }
  return {
    title: 'Colour Wizard',
    line: 'Superhuman focus! Even the crystal ball is taking notes on your speed.',
  };
}

/* ----------------------------------------------------------------------------
   3. LOVE COMPATIBILITY METER (Deterministic Formula + Verdicts)
   ---------------------------------------------------------------------------- */
export const LOVE_VERDICTS: { min: number; max: number; title: string; line: string }[] = [
  {
    min: 0,
    max: 20,
    title: 'Cosmic Glitch',
    line: 'Even autocorrect refuses to put these two names in the same sentence.',
  },
  {
    min: 21,
    max: 40,
    title: 'Chaos Energy',
    line: 'Great for debating what to order for dinner. Terrible for actually ordering it.',
  },
  {
    min: 41,
    max: 60,
    title: 'Slow-Burn Plot Twist',
    line: 'Not love at first sight, more like "wait, why do we share the exact same memes?"',
  },
  {
    min: 61,
    max: 80,
    title: 'Certified Vibe Match',
    line: 'You two finish each other’s sentences—and each other’s fries.',
  },
  {
    min: 81,
    max: 100,
    title: 'Legendary Soulmates',
    line: 'Written in the stars. Also in the same WhatsApp group.',
  },
];

/**
 * Fixed, order-independent deterministic love formula:
 * Lowercases & trims both names, sorts them alphabetically so (A, B) === (B, A),
 * sums letter positions (a=1..z=26, digits/other chars weighted cleanly),
 * and maps deterministically mod 101 -> 0..100.
 */
export function calculateLoveScore(nameA: string, nameB: string): number {
  const cleanA = nameA.trim().toLowerCase();
  const cleanB = nameB.trim().toLowerCase();
  const [first, second] = [cleanA, cleanB].sort();
  const combined = `${first}+${second}`;

  let total = 0;
  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i);
    if (code >= 97 && code <= 122) {
      total += (code - 96) * 7; // a=1..z=26
    } else if (code >= 48 && code <= 57) {
      total += (code - 47) * 5;
    } else if (code !== 43 && code !== 32) {
      total += (code % 26) + 1;
    }
  }
  return total % 101;
}

export function getLoveVerdict(score: number) {
  return (
    LOVE_VERDICTS.find((v) => score >= v.min && score <= v.max) ?? LOVE_VERDICTS[LOVE_VERDICTS.length - 1]
  );
}

/* ----------------------------------------------------------------------------
   4. FUTURE PREDICTOR (3 questions × 3 options = 27 Fixed Predictions)
   ---------------------------------------------------------------------------- */
export interface FutureQuestion {
  id: string;
  prompt: string;
  options: { label: string; emoji: string }[];
}

export const FUTURE_QUESTIONS: FutureQuestion[] = [
  {
    id: 'snack',
    prompt: '1. Pick your emergency midnight snack:',
    options: [
      { label: 'Spicy Maggi / Noodles', emoji: '🍜' },
      { label: 'Cold Pizza / Chips', emoji: '🍕' },
      { label: 'Chocolate / Ice Cream', emoji: '🍫' },
    ],
  },
  {
    id: 'sleep',
    prompt: '2. When do you ACTUALLY go to sleep?',
    options: [
      { label: 'Before 11 PM (Rare Unicorn)', emoji: '🌙' },
      { label: 'Midnight to 2 AM (Classic)', emoji: '🦉' },
      { label: '3 AM+ ("One more reel...")', emoji: '⚡' },
    ],
  },
  {
    id: 'battery',
    prompt: '3. What is your phone battery habit?',
    options: [
      { label: 'Always 80%–100% charged', emoji: '🔋' },
      { label: 'Lives dangerously at 12%', emoji: '🪫' },
      { label: '2% and still watching videos', emoji: '🔥' },
    ],
  },
];

/**
 * All 27 deterministic predictions.
 * Index formula: q0 * 9 + q1 * 3 + q2  (where each q is 0, 1, or 2)
 */
export const FUTURE_PREDICTIONS: string[] = [
  // q0 = 0 (Maggi), q1 = 0 (Before 11 PM)
  'You will wake up early tomorrow, feel unstoppable, and then accidentally take a 2-hour victory nap by noon.',
  'You will crack your placement interview, celebrate with Maggi, and realize you forgot to unmute yourself only once.',
  'Your phone will survive on 1% for 45 heroic minutes while you give someone the best life advice of their year.',
  // q0 = 0 (Maggi), q1 = 1 (Midnight-2 AM)
  'You will crack your placement interview but your WiFi will disconnect during the final question—and you will still get the offer.',
  'A random 1 AM idea you type into your notes app will unexpectedly become your favourite weekend project.',
  'You will say "I am sleeping in 5 minutes" tonight, boil noodles instead, and somehow still ace tomorrow morning.',
  // q0 = 0 (Maggi), q1 = 2 (3 AM+)
  'You will become the official nocturnal CEO of your friend group and solve a tough bug right as the birds start chirping.',
  'You will discover a legendary street-food stall at 11 PM that makes you forget every stress from the entire month.',
  'Your charger cable will finally require the exact 47-degree sacred angle to work, right before you get a huge lucky break.',

  // q0 = 1 (Pizza/Chips), q1 = 0 (Before 11 PM)
  'You will be the only person on time to a group hangout and get rewarded with the best seat and free fries.',
  'Someone will ask you for a quick favour this week and accidentally introduce you to an awesome new opportunity.',
  'You will finish your entire to-do list before sunset and feel suspicious that you forgot something—you did not.',
  // q0 = 1 (Pizza/Chips), q1 = 1 (Midnight-2 AM)
  'You will open a bag of chips during a quiet movie scene and sound like a rocket launch, sparking a 10-minute laugh attack.',
  'An old friend will text "you up?" with a chaotic plan that turns into your best memory of the month.',
  'Your food delivery driver will arrive 12 minutes early right when you were about to lose hope—pure cosmic favour.',
  // q0 = 1 (Pizza/Chips), q1 = 2 (3 AM+)
  'You will fall into a 2 AM Wikipedia rabbit hole about penguins and casually drop a genius fact in a meeting next week.',
  'You will win an unexpected argument purely because you saved a screenshot from six months ago.',
  'Your phone will hit 1% right as you type the punchline of your funniest joke, leaving the group chat in legendary suspense.',

  // q0 = 2 (Chocolate/Ice Cream), q1 = 0 (Before 11 PM)
  'You will treat yourself to dessert "for surviving Monday" and accidentally manifest an amazingly smooth week.',
  'A tiny act of kindness you almost forgot about will boomerang back to you as a surprise win this Friday.',
  'You will find forgotten cash inside an old jacket pocket and immediately convert it into premium snacks.',
  // q0 = 2 (Chocolate/Ice Cream), q1 = 1 (Midnight-2 AM)
  'You will swear you are starting a strict diet on Monday, and by Tuesday afternoon someone will bring free cake to your desk.',
  'A creative risk you have been overthinking will pay off faster than you expected—just press send.',
  'You will accidentally send a funny meme to the wrong chat and somehow become the most popular person in that group.',
  // q0 = 2 (Chocolate/Ice Cream), q1 = 2 (3 AM+)
  'At 3:14 AM you will reorganize your entire life plan, eat ice cream straight from the tub, and actually stick to 70% of it.',
  'You will pull off a last-minute clutch presentation so smoothly that everyone assumes you prepared for two weeks.',
  'Your charger will vanish right when you need it most, forcing a 20-minute break where you have your smartest idea all week.',
];

export const LUCKY_COLOURS: { name: string; hex: string }[] = [
  { name: 'Electric Violet', hex: '#A855F7' },
  { name: 'Cosmic Cyan', hex: '#22D3EE' },
  { name: 'Neon Magenta', hex: '#E879F9' },
  { name: 'Starlight Gold', hex: '#FACC15' },
  { name: 'Emerald Spark', hex: '#34D399' },
  { name: 'Solar Coral', hex: '#FB7185' },
  { name: 'Royal Indigo', hex: '#818CF8' },
  { name: 'Aurora Mint', hex: '#2DD4BF' },
  { name: 'Nebula Amber', hex: '#F59E0B' },
];

export function computeFutureResult(q0: number, q1: number, q2: number) {
  const index = q0 * 9 + q1 * 3 + q2;
  const prediction = FUTURE_PREDICTIONS[index];
  const luckyNumber = ((q0 + 1) * 17 + (q1 + 1) * 11 + (q2 + 1) * 7) % 99 + 1;
  const luckyColour = LUCKY_COLOURS[(q0 * 3 + q1 * 2 + q2) % LUCKY_COLOURS.length];
  return { index, prediction, luckyNumber, luckyColour };
}

/* ----------------------------------------------------------------------------
   5. EMOJI RIDDLE (20 Verified Riddles — Exactly ONE Correct Option Each)
   ---------------------------------------------------------------------------- */
export interface EmojiRiddle {
  id: number;
  emojis: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  hint: string;
}

export const EMOJI_RIDDLES: EmojiRiddle[] = [
  {
    id: 1,
    emojis: '🦁👑',
    options: ['The Jungle Book', 'The Lion King', 'Madagascar', 'Kung Fu Panda'],
    answerIndex: 1,
    hint: 'Simba’s royal Disney classic.',
  },
  {
    id: 2,
    emojis: '🕷️🧑',
    options: ['Ant-Man', 'Batman', 'Spider-Man', 'Iron Man'],
    answerIndex: 2,
    hint: 'Friendly neighbourhood web-slinger.',
  },
  {
    id: 3,
    emojis: '🚢🧊❤️',
    options: ['Pirates of the Caribbean', 'Life of Pi', 'Titanic', 'Moana'],
    answerIndex: 2,
    hint: 'Jack, Rose, and a very famous iceberg.',
  },
  {
    id: 4,
    emojis: '🧙‍♂️💍',
    options: ['Harry Potter', 'Doctor Strange', 'The Lord of the Rings', 'Aladdin'],
    answerIndex: 2,
    hint: 'One ring to rule them all.',
  },
  {
    id: 5,
    emojis: '3️⃣🤪🎓',
    options: ['Student of the Year', '3 Idiots', 'Chhichhore', 'Zindagi Na Milegi Dobara'],
    answerIndex: 1,
    hint: '"All is well!" — Aamir Khan engineering classic.',
  },
  {
    id: 6,
    emojis: '🦖🏝️🚙',
    options: ['King Kong', 'Jurassic Park', 'Jumanji', 'Avatar'],
    answerIndex: 1,
    hint: 'Dinosaurs brought back to life on an island.',
  },
  {
    id: 7,
    emojis: '❄️👸⛄',
    options: ['Tangled', 'Brave', 'Frozen', 'Cinderella'],
    answerIndex: 2,
    hint: 'Let it go!',
  },
  {
    id: 8,
    emojis: '🚂💑🌾',
    options: ['Chennai Express', 'Dilwale Dulhania Le Jayenge', 'Jab We Met', 'Yeh Jawaani Hai Deewani'],
    answerIndex: 1,
    hint: '"Ja Simran, ja!" — iconic train & mustard fields.',
  },
  {
    id: 9,
    emojis: '🦇🃏🌃',
    options: ['The Dark Knight', 'Deadpool', 'Venom', 'Superman'],
    answerIndex: 0,
    hint: 'Gotham’s vigilante versus the Joker.',
  },
  {
    id: 10,
    emojis: '🐠🔍🌊',
    options: ['Shark Tale', 'Finding Nemo', 'The Little Mermaid', 'Aquaman'],
    answerIndex: 1,
    hint: 'A clownfish dad searches the ocean for his son.',
  },
  {
    id: 11,
    emojis: '👓⚡🪄',
    options: ['Percy Jackson', 'Harry Potter', 'Narnia', 'Matilda'],
    answerIndex: 1,
    hint: 'The boy who lived at Hogwarts.',
  },
  {
    id: 12,
    emojis: '🥊🇮🇳🏅',
    options: ['Lagaan', 'Dangal', 'Chak De! India', 'Bhaag Milkha Bhaag'],
    answerIndex: 1,
    hint: 'Wrestling sisters winning gold for India.',
  },
  {
    id: 13,
    emojis: '🚀🕳️⏳',
    options: ['Gravity', 'The Martian', 'Interstellar', 'Star Wars'],
    answerIndex: 2,
    hint: 'Black hole, time dilation, and a father’s promise.',
  },
  {
    id: 14,
    emojis: '👻🚫🔫',
    options: ['Ghostbusters', 'Conjuring', 'Bhool Bhulaiyaa', 'Scooby-Doo'],
    answerIndex: 0,
    hint: 'Who ya gonna call?',
  },
  {
    id: 15,
    emojis: '🏏🇮🇳🌧️',
    options: ['MS Dhoni', 'Lagaan', '83', 'Jersey'],
    answerIndex: 1,
    hint: 'Villagers play cricket against British officers to cancel taxes.',
  },
  {
    id: 16,
    emojis: '🧸🤠🚀',
    options: ['Monsters, Inc.', 'Toy Story', 'Cars', 'Wall-E'],
    answerIndex: 1,
    hint: 'Woody and Buzz Lightyear come alive when humans leave.',
  },
  {
    id: 17,
    emojis: '💰🎭🏦',
    options: ['Ocean’s Eleven', 'Money Heist', 'Dhoom', 'Now You See Me'],
    answerIndex: 1,
    hint: 'Red jumpsuits, Dalí masks, and Bella Ciao.',
  },
  {
    id: 18,
    emojis: '🍎👁️❤️',
    options: ['Piece of Cake', 'Apple of My Eye', 'Break a Leg', 'Spill the Beans'],
    answerIndex: 1,
    hint: 'A classic phrase for someone you cherish dearly.',
  },
  {
    id: 19,
    emojis: '🍰👌',
    options: ['Piece of Cake', 'Spill the Beans', 'Bite the Bullet', 'Hit the Sack'],
    answerIndex: 0,
    hint: 'A famous phrase meaning "something very easy".',
  },
  {
    id: 20,
    emojis: '🟢👹🐴',
    options: ['The Hulk', 'Shrek', 'Beauty and the Beast', 'Aladdin'],
    answerIndex: 1,
    hint: 'An ogre, a talking donkey, and a swamp.',
  },
];

export const RIDDLE_RIGHT_LINES = [
  'Nailed it! Your emoji fluency is 10/10.',
  'Spot on! You practically speak fluent hieroglyphics.',
  'Correct! The crystal ball is impressed.',
  'Boom! Cinema & meme encyclopedia unlocked.',
];

export const RIDDLE_WRONG_LINES = [
  'Oops! Even the wizard blinked twice at that guess.',
  'Close... in a parallel universe where that movie exists.',
  'Plot twist: that was a trap! Better luck on the next one.',
  'The crystal ball gently shakes its head.',
];

export function getRiddleRank(score: number): { title: string; line: string } {
  if (score <= 3) return { title: 'Emoji Tourist', line: 'You read emojis like ancient Sanskrit, and honestly we respect the effort.' };
  if (score <= 6) return { title: 'Casual Decoder', line: 'Decent pop-culture radar! A few more movie nights and you are unstoppable.' };
  if (score <= 8) return { title: 'Pop Culture Psychic', line: 'Sharp instincts! You decoded almost every single clue.' };
  return { title: 'Grand Emoji Sorcerer', line: 'Flawless mastery! You can translate an entire trilogy in three emojis.' };
}
