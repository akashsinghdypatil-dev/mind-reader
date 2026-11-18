import { Difficulty, FriendChallenge } from '../types/app';

/* ============================================================================
   1. NUMBER MIND READING ENGINE (100% Deterministic Adaptive Narrowing)
   ============================================================================ */

export interface NumberQuestionOption {
  label: string;
  sublabel?: string;
  filter: (n: number) => boolean;
}

export interface NumberQuestion {
  id: string;
  prompt: string;
  hint: string;
  options: NumberQuestionOption[];
}

export function getNumberRange(difficulty: Difficulty): { min: number; max: number } {
  if (difficulty === 'easy') return { min: 1, max: 20 };
  if (difficulty === 'expert') return { min: 1, max: 100 };
  return { min: 1, max: 50 };
}

export function createInitialCandidates(min: number, max: number): number[] {
  const arr: number[] = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
}

/**
 * Generates the mathematically optimal next question given the remaining
 * candidate numbers and step index so ANY secret number is isolated in 4–5 steps
 * (up to 6 on Expert 1–100) with zero random guessing.
 */
export function getNextNumberQuestion(
  candidates: number[],
  stepIndex: number,
  maxNumber: number
): NumberQuestion | null {
  if (candidates.length <= 1) return null;

  // Step 0: Odd or Even
  if (stepIndex === 0) {
    return {
      id: 'parity',
      prompt: 'Is your secret number Even or Odd?',
      hint: 'Even numbers end in 0, 2, 4, 6, or 8.',
      options: [
        { label: 'Even', sublabel: '2, 4, 6, 8...', filter: (n) => n % 2 === 0 },
        { label: 'Odd', sublabel: '1, 3, 5, 7...', filter: (n) => n % 2 !== 0 },
      ],
    };
  }

  // Step 1: 3-way range split (cuts 25 -> ~8 candidates for 1-50)
  if (stepIndex === 1 && candidates.length >= 9) {
    const third1 = Math.floor(maxNumber / 3);
    const third2 = Math.floor((maxNumber * 2) / 3);
    return {
      id: 'range-thirds',
      prompt: 'Which zone does your number live in?',
      hint: 'Choose the range that contains your secret number.',
      options: [
        { label: `1 to ${third1}`, sublabel: 'Lower zone', filter: (n) => n <= third1 },
        {
          label: `${third1 + 1} to ${third2}`,
          sublabel: 'Middle zone',
          filter: (n) => n > third1 && n <= third2,
        },
        {
          label: `${third2 + 1} to ${maxNumber}`,
          sublabel: 'Upper zone',
          filter: (n) => n > third2,
        },
      ],
    };
  }

  // Step 2: Modulo 3 split (cuts ~8-9 -> 2-3 candidates!)
  if (stepIndex === 2 && candidates.length >= 4) {
    const g0 = candidates.filter((n) => n % 3 === 0);
    const g1 = candidates.filter((n) => n % 3 === 1);
    const g2 = candidates.filter((n) => n % 3 === 2);
    const options: NumberQuestionOption[] = [];
    if (g0.length > 0) {
      options.push({
        label: 'Divisible by 3',
        sublabel: `Like ${g0.slice(0, 3).join(', ')}${g0.length > 3 ? '...' : ''}`,
        filter: (n) => n % 3 === 0,
      });
    }
    if (g1.length > 0) {
      options.push({
        label: '1 more than a multiple of 3',
        sublabel: `Like ${g1.slice(0, 3).join(', ')}${g1.length > 3 ? '...' : ''}`,
        filter: (n) => n % 3 === 1,
      });
    }
    if (g2.length > 0) {
      options.push({
        label: '2 more than a multiple of 3',
        sublabel: `Like ${g2.slice(0, 3).join(', ')}${g2.length > 3 ? '...' : ''}`,
        filter: (n) => n % 3 === 2,
      });
    }
    if (options.length >= 2) {
      return {
        id: 'mod3',
        prompt: 'How does your number relate to multiples of 3?',
        hint: 'Check the example numbers under each option if you want a quick hint.',
        options,
      };
    }
  }

  // Remaining steps: Adaptive median split or digit-property split
  const sorted = [...candidates].sort((a, b) => a - b);

  // If exactly 2 or 3 candidates remain, use a super crisp threshold question
  const midIdx = Math.floor((sorted.length - 1) / 2);
  const pivot = sorted[midIdx];

  if (sorted.length === 2) {
    const [low, high] = sorted;
    // Check if single-digit vs double-digit distinguishes them
    if (low < 10 && high >= 10) {
      return {
        id: `single-digit-${stepIndex}`,
        prompt: 'Is your number a single-digit number (1–9)?',
        hint: 'Final neural lock-in.',
        options: [
          { label: 'Yes, single-digit', filter: (n) => n < 10 },
          { label: 'No, two or more digits', filter: (n) => n >= 10 },
        ],
      };
    }
    return {
      id: `final-split-${stepIndex}`,
      prompt: `Is your number greater than ${low}?`,
      hint: 'One last signal to lock onto your exact number.',
      options: [
        { label: `Yes, greater than ${low}`, filter: (n) => n > low },
        { label: `No, ${low} or less`, filter: (n) => n <= low },
      ],
    };
  }

  return {
    id: `median-split-${stepIndex}`,
    prompt: `Is your number greater than ${pivot}?`,
    hint: 'Think carefully—this sharply narrows the possibilities.',
    options: [
      { label: `Yes, greater than ${pivot}`, filter: (n) => n > pivot },
      { label: `No, ${pivot} or less`, filter: (n) => n <= pivot },
    ],
  };
}

/* ============================================================================
   2. COLOUR PREDICTION ENGINE (6 Colours, Valid Decision-Tree Narrowing)
   ============================================================================ */

export interface ColourItem {
  id: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  name: string;
  hex: string;
  glow: string;
  warm: boolean;
  primaryRYB: boolean;
  natureGroup: 'sky-water' | 'forest' | 'sun-fire' | 'twilight';
  vibe: string;
  trait: string;
}

export const COLOURS: ColourItem[] = [
  {
    id: 'red',
    name: 'Red',
    hex: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.5)',
    warm: true,
    primaryRYB: true,
    natureGroup: 'sun-fire',
    vibe: 'Bold, passionate, and high-energy',
    trait: 'Often associated with stop signs, roses, and fire.',
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.5)',
    warm: false,
    primaryRYB: true,
    natureGroup: 'sky-water',
    vibe: 'Calm, deep, and trustworthy',
    trait: 'Found across oceans and clear daytime skies.',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#10B981',
    glow: 'rgba(16, 185, 129, 0.5)',
    warm: false,
    primaryRYB: false,
    natureGroup: 'forest',
    vibe: 'Fresh, balanced, and alive',
    trait: 'The signature hue of forests, leaves, and spring.',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#FACC15',
    glow: 'rgba(250, 204, 21, 0.5)',
    warm: true,
    primaryRYB: true,
    natureGroup: 'sun-fire',
    vibe: 'Bright, radiant, and optimistic',
    trait: 'Lightest of the six, like sunlight and lemons.',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.5)',
    warm: false,
    primaryRYB: false,
    natureGroup: 'twilight',
    vibe: 'Mysterious, regal, and imaginative',
    trait: 'Seen in lavender fields, amethyst, and dusk skies.',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#F97316',
    glow: 'rgba(249, 115, 22, 0.5)',
    warm: true,
    primaryRYB: false,
    natureGroup: 'sun-fire',
    vibe: 'Vibrant, playful, and adventurous',
    trait: 'Named directly after a citrus fruit and seen in sunsets.',
  },
];

export interface ColourQuestion {
  id: string;
  prompt: string;
  options: {
    label: string;
    description: string;
    matches: (c: ColourItem) => boolean;
  }[];
}

export function getNextColourQuestion(
  candidates: ColourItem[],
  askedIds: string[]
): ColourQuestion | null {
  if (candidates.length <= 1) return null;

  const pool: ColourQuestion[] = [
    {
      id: 'temperature',
      prompt: 'Does your secret colour feel Warm or Cool?',
      options: [
        {
          label: 'Warm',
          description: 'Feels like sunlight, heat, fire, or spice',
          matches: (c) => c.warm,
        },
        {
          label: 'Cool',
          description: 'Feels like water, shade, forest, or twilight',
          matches: (c) => !c.warm,
        },
      ],
    },
    {
      id: 'primary',
      prompt: 'Is it one of the three traditional primary paint colours (Red, Blue, Yellow)?',
      options: [
        {
          label: 'Yes, it is a primary colour',
          description: 'Cannot be mixed from other paints',
          matches: (c) => c.primaryRYB,
        },
        {
          label: 'No, it is a secondary colour',
          description: 'Created by blending two primary colours',
          matches: (c) => !c.primaryRYB,
        },
      ],
    },
    {
      id: 'brightness',
      prompt: 'Between the remaining tones, is your colour the brightest and lightest to the eye?',
      options: [
        {
          label: 'Yes, very bright and sunlit',
          description: 'Instantly grabs light like a highlighter or sunbeam',
          matches: (c) => c.id === 'yellow' || c.id === 'orange',
        },
        {
          label: 'No, deeper or richer in tone',
          description: 'Carries more weight, intensity, or depth',
          matches: (c) => c.id !== 'yellow' && c.id !== 'orange',
        },
      ],
    },
    {
      id: 'nature',
      prompt: 'Where would you most vividly spot your colour in the natural world?',
      options: [
        {
          label: 'Forests, grass, and emeralds',
          description: 'Living botanical nature',
          matches: (c) => c.id === 'green',
        },
        {
          label: 'Twilight skies, grapes, and amethyst',
          description: 'Rare and mysterious hues',
          matches: (c) => c.id === 'purple',
        },
        {
          label: 'Oceans and daytime sky',
          description: 'Vast and tranquil',
          matches: (c) => c.id === 'blue',
        },
        {
          label: 'Flames, sunsets, roses, or citrus',
          description: 'Warm natural energy',
          matches: (c) => c.warm,
        },
      ],
    },
    {
      id: 'fruit-name',
      prompt: 'Does your colour share its exact name with a common fruit?',
      options: [
        {
          label: 'Yes',
          description: 'Both a colour and a citrus fruit',
          matches: (c) => c.id === 'orange',
        },
        {
          label: 'No',
          description: 'Not named directly after a fruit',
          matches: (c) => c.id !== 'orange',
        },
      ],
    },
  ];

  // Pick the first unasked question that actually splits the remaining candidates
  for (const q of pool) {
    if (askedIds.includes(q.id)) continue;
    const usefulOptions = q.options.filter((opt) => {
      const count = candidates.filter(opt.matches).length;
      return count > 0 && count < candidates.length;
    });
    if (usefulOptions.length >= 2) {
      return {
        ...q,
        options: q.options.filter((opt) => candidates.some(opt.matches)),
      };
    }
  }

  return null;
}

/* ============================================================================
   3. OBJECT, ANIMAL, FOOD, VEHICLE & CHARACTER DECISION TREE ENGINE
   ============================================================================ */

export type DeductionDomain = 'animals' | 'objects' | 'food' | 'vehicles' | 'characters';

export interface KnowledgeItem {
  id: string;
  name: string;
  domain: DeductionDomain;
  tagline: string;
  traits: Record<string, boolean>;
}

export interface TraitQuestion {
  trait: string;
  question: string;
}

export const DOMAIN_META: Record<
  DeductionDomain,
  { label: string; examples: string; items: KnowledgeItem[]; questions: TraitQuestion[] }
> = {
  animals: {
    label: 'Animals',
    examples: 'Lion, Dolphin, Eagle, Penguin, Elephant, Cat, Octopus, Butterfly...',
    questions: [
      { trait: 'mammal', question: 'Is it a mammal (warm-blooded with fur or hair)?' },
      { trait: 'water', question: 'Does it spend most of its life in water?' },
      { trait: 'flies', question: 'Can it fly through the air?' },
      { trait: 'pet', question: 'Do people commonly keep it as a household pet?' },
      { trait: 'predator', question: 'Is it a meat-eating hunter or predator?' },
      { trait: 'large', question: 'Is it larger than an adult human?' },
      { trait: 'fourLegs', question: 'Does it walk on four legs?' },
    ],
    items: [
      { id: 'lion', name: 'Lion', domain: 'animals', tagline: 'King of the savanna', traits: { mammal: true, water: false, flies: false, pet: false, predator: true, large: true, fourLegs: true } },
      { id: 'elephant', name: 'Elephant', domain: 'animals', tagline: 'Gentle giant with a trunk', traits: { mammal: true, water: false, flies: false, pet: false, predator: false, large: true, fourLegs: true } },
      { id: 'dolphin', name: 'Dolphin', domain: 'animals', tagline: 'Intelligent ocean acrobat', traits: { mammal: true, water: true, flies: false, pet: false, predator: true, large: true, fourLegs: false } },
      { id: 'cat', name: 'House Cat', domain: 'animals', tagline: 'Curious feline companion', traits: { mammal: true, water: false, flies: false, pet: true, predator: true, large: false, fourLegs: true } },
      { id: 'rabbit', name: 'Rabbit', domain: 'animals', tagline: 'Swift long-eared hopper', traits: { mammal: true, water: false, flies: false, pet: true, predator: false, large: false, fourLegs: true } },
      { id: 'bat', name: 'Bat', domain: 'animals', tagline: 'Nocturnal echolocating flyer', traits: { mammal: true, water: false, flies: true, pet: false, predator: true, large: false, fourLegs: false } },
      { id: 'eagle', name: 'Eagle', domain: 'animals', tagline: 'Sharp-eyed apex bird of prey', traits: { mammal: false, water: false, flies: true, pet: false, predator: true, large: false, fourLegs: false } },
      { id: 'butterfly', name: 'Butterfly', domain: 'animals', tagline: 'Delicate winged pollinator', traits: { mammal: false, water: false, flies: true, pet: false, predator: false, large: false, fourLegs: false } },
      { id: 'penguin', name: 'Penguin', domain: 'animals', tagline: 'Flightless tuxedo swimmer', traits: { mammal: false, water: true, flies: false, pet: false, predator: true, large: false, fourLegs: false } },
      { id: 'shark', name: 'Shark', domain: 'animals', tagline: 'Ancient ocean apex hunter', traits: { mammal: false, water: true, flies: false, pet: false, predator: true, large: true, fourLegs: false } },
      { id: 'turtle', name: 'Sea Turtle', domain: 'animals', tagline: 'Armoured ocean voyager', traits: { mammal: false, water: true, flies: false, pet: false, predator: false, large: false, fourLegs: false } },
      { id: 'parrot', name: 'Parrot', domain: 'animals', tagline: 'Colourful talking bird', traits: { mammal: false, water: false, flies: true, pet: true, predator: false, large: false, fourLegs: false } },
    ],
  },
  objects: {
    label: 'Everyday Objects',
    examples: 'Smartphone, Umbrella, Coffee Mug, Watch, Book, Glasses, Backpack...',
    questions: [
      { trait: 'electronic', question: 'Does it use electricity or a battery?' },
      { trait: 'pocket', question: 'Can it easily fit inside a jacket pocket?' },
      { trait: 'screen', question: 'Does it have a display screen?' },
      { trait: 'worn', question: 'Do you wear it on your body?' },
      { trait: 'liquid', question: 'Is it designed to hold or block liquid/rain?' },
      { trait: 'dailyCarry', question: 'Do most people carry it when leaving home?' },
    ],
    items: [
      { id: 'smartphone', name: 'Smartphone', domain: 'objects', tagline: 'Pocket supercomputer', traits: { electronic: true, pocket: true, screen: true, worn: false, liquid: false, dailyCarry: true } },
      { id: 'smartwatch', name: 'Smartwatch', domain: 'objects', tagline: 'Connected wrist timepiece', traits: { electronic: true, pocket: true, screen: true, worn: true, liquid: false, dailyCarry: true } },
      { id: 'laptop', name: 'Laptop', domain: 'objects', tagline: 'Portable workstation', traits: { electronic: true, pocket: false, screen: true, worn: false, liquid: false, dailyCarry: false } },
      { id: 'headphones', name: 'Headphones', domain: 'objects', tagline: 'Personal audio gear', traits: { electronic: true, pocket: false, screen: false, worn: true, liquid: false, dailyCarry: true } },
      { id: 'flashlight', name: 'Flashlight', domain: 'objects', tagline: 'Handheld beam of light', traits: { electronic: true, pocket: true, screen: false, worn: false, liquid: false, dailyCarry: false } },
      { id: 'umbrella', name: 'Umbrella', domain: 'objects', tagline: 'Portable rain shield', traits: { electronic: false, pocket: false, screen: false, worn: false, liquid: true, dailyCarry: false } },
      { id: 'mug', name: 'Coffee Mug', domain: 'objects', tagline: 'Morning ritual vessel', traits: { electronic: false, pocket: false, screen: false, worn: false, liquid: true, dailyCarry: false } },
      { id: 'glasses', name: 'Eyeglasses', domain: 'objects', tagline: 'Optical clarity frames', traits: { electronic: false, pocket: true, screen: false, worn: true, liquid: false, dailyCarry: true } },
      { id: 'keys', name: 'House Keys', domain: 'objects', tagline: 'Metallic pocket essential', traits: { electronic: false, pocket: true, screen: false, worn: false, liquid: false, dailyCarry: true } },
      { id: 'book', name: 'Book', domain: 'objects', tagline: 'Bound pages of knowledge', traits: { electronic: false, pocket: false, screen: false, worn: false, liquid: false, dailyCarry: false } },
      { id: 'backpack', name: 'Backpack', domain: 'objects', tagline: 'Everyday gear carrier', traits: { electronic: false, pocket: false, screen: false, worn: true, liquid: false, dailyCarry: true } },
    ],
  },
  food: {
    label: 'Food',
    examples: 'Pizza, Sushi, Ice Cream, Chocolate, Apple, Burger, Pasta, Coffee...',
    questions: [
      { trait: 'sweet', question: 'Is it primarily sweet rather than savoury?' },
      { trait: 'hot', question: 'Is it usually served hot or warm?' },
      { trait: 'plant', question: 'Is it naturally grown as a raw fruit or vegetable?' },
      { trait: 'hands', question: 'Do you normally eat it with your hands (no fork or spoon)?' },
      { trait: 'dairy', question: 'Does it typically contain cheese, milk, or cream?' },
      { trait: 'drink', question: 'Is it a beverage you drink?' },
    ],
    items: [
      { id: 'pizza', name: 'Pizza', domain: 'food', tagline: 'Cheesy baked slice classic', traits: { sweet: false, hot: true, plant: false, hands: true, dairy: true, drink: false } },
      { id: 'burger', name: 'Burger', domain: 'food', tagline: 'Stacked grilled favourite', traits: { sweet: false, hot: true, plant: false, hands: true, dairy: false, drink: false } },
      { id: 'pasta', name: 'Pasta', domain: 'food', tagline: 'Twirled Italian comfort', traits: { sweet: false, hot: true, plant: false, hands: false, dairy: true, drink: false } },
      { id: 'sushi', name: 'Sushi', domain: 'food', tagline: 'Precision Japanese bites', traits: { sweet: false, hot: false, plant: false, hands: true, dairy: false, drink: false } },
      { id: 'salad', name: 'Garden Salad', domain: 'food', tagline: 'Crisp fresh greens bowl', traits: { sweet: false, hot: false, plant: true, hands: false, dairy: false, drink: false } },
      { id: 'icecream', name: 'Ice Cream', domain: 'food', tagline: 'Chilled creamy scoop', traits: { sweet: true, hot: false, plant: false, hands: false, dairy: true, drink: false } },
      { id: 'chocolate', name: 'Chocolate Bar', domain: 'food', tagline: 'Rich cocoa indulgence', traits: { sweet: true, hot: false, plant: false, hands: true, dairy: true, drink: false } },
      { id: 'apple', name: 'Apple', domain: 'food', tagline: 'Crisp orchard classic', traits: { sweet: true, hot: false, plant: true, hands: true, dairy: false, drink: false } },
      { id: 'pancake', name: 'Pancakes', domain: 'food', tagline: 'Warm golden breakfast stack', traits: { sweet: true, hot: true, plant: false, hands: false, dairy: true, drink: false } },
      { id: 'coffee', name: 'Coffee', domain: 'food', tagline: 'Aromatic roasted brew', traits: { sweet: false, hot: true, plant: false, hands: false, dairy: false, drink: true } },
    ],
  },
  vehicles: {
    label: 'Vehicles',
    examples: 'Airplane, Bicycle, Submarine, Train, Rocket, Sports Car, Motorcycle...',
    questions: [
      { trait: 'air', question: 'Does it travel through the air or space?' },
      { trait: 'water', question: 'Does it travel on or under water?' },
      { trait: 'wheels', question: 'Does it roll on wheels?' },
      { trait: 'publicTransit', question: 'Is it built to carry dozens of passengers at once?' },
      { trait: 'humanPowered', question: 'Is it powered by human muscles rather than an engine?' },
      { trait: 'space', question: 'Can it leave Earth’s atmosphere?' },
    ],
    items: [
      { id: 'car', name: 'Car', domain: 'vehicles', tagline: 'Four-wheeled road staple', traits: { air: false, water: false, wheels: true, publicTransit: false, humanPowered: false, space: false } },
      { id: 'bicycle', name: 'Bicycle', domain: 'vehicles', tagline: 'Two-wheeled pedal machine', traits: { air: false, water: false, wheels: true, publicTransit: false, humanPowered: true, space: false } },
      { id: 'train', name: 'Train', domain: 'vehicles', tagline: 'High-capacity rail runner', traits: { air: false, water: false, wheels: true, publicTransit: true, humanPowered: false, space: false } },
      { id: 'airplane', name: 'Airplane', domain: 'vehicles', tagline: 'Fixed-wing sky voyager', traits: { air: true, water: false, wheels: true, publicTransit: true, humanPowered: false, space: false } },
      { id: 'helicopter', name: 'Helicopter', domain: 'vehicles', tagline: 'Vertical-lift rotorcraft', traits: { air: true, water: false, wheels: false, publicTransit: false, humanPowered: false, space: false } },
      { id: 'rocket', name: 'Space Rocket', domain: 'vehicles', tagline: 'Orbital launch vehicle', traits: { air: true, water: false, wheels: false, publicTransit: false, humanPowered: false, space: true } },
      { id: 'submarine', name: 'Submarine', domain: 'vehicles', tagline: 'Deep-sea stealth vessel', traits: { air: false, water: true, wheels: false, publicTransit: true, humanPowered: false, space: false } },
      { id: 'kayak', name: 'Kayak', domain: 'vehicles', tagline: 'Paddle-powered watercraft', traits: { air: false, water: true, wheels: false, publicTransit: false, humanPowered: true, space: false } },
      { id: 'yacht', name: 'Speedboat / Yacht', domain: 'vehicles', tagline: 'Motorized open-water craft', traits: { air: false, water: true, wheels: false, publicTransit: false, humanPowered: false, space: false } },
    ],
  },
  characters: {
    label: 'Famous Fictional Characters',
    examples: 'Sherlock Holmes, Spider-Man, Harry Potter, Batman, Yoda, Elsa, Mario...',
    questions: [
      { trait: 'superhero', question: 'Is this character a superhero or comic-book vigilante?' },
      { trait: 'magic', question: 'Do they use magic, spells, or mystical powers?' },
      { trait: 'human', question: 'Are they a regular human (not an alien, robot, or animal)?' },
      { trait: 'capeOrMask', question: 'Are they famous for wearing a mask, cape, or signature suit?' },
      { trait: 'videoGame', question: 'Did they originate in video games?' },
      { trait: 'sciFi', question: 'Are they from a science-fiction or space universe?' },
    ],
    items: [
      { id: 'spiderman', name: 'Spider-Man', domain: 'characters', tagline: 'Web-slinging New York hero', traits: { superhero: true, magic: false, human: true, capeOrMask: true, videoGame: false, sciFi: false } },
      { id: 'batman', name: 'Batman', domain: 'characters', tagline: 'Gotham’s detective vigilante', traits: { superhero: true, magic: false, human: true, capeOrMask: true, videoGame: false, sciFi: false } },
      { id: 'ironman', name: 'Iron Man', domain: 'characters', tagline: 'Armoured genius inventor', traits: { superhero: true, magic: false, human: true, capeOrMask: true, videoGame: false, sciFi: true } },
      { id: 'harrypotter', name: 'Harry Potter', domain: 'characters', tagline: 'The boy wizard with a scar', traits: { superhero: false, magic: true, human: true, capeOrMask: false, videoGame: false, sciFi: false } },
      { id: 'elsa', name: 'Elsa', domain: 'characters', tagline: 'Snow queen with ice powers', traits: { superhero: false, magic: true, human: true, capeOrMask: true, videoGame: false, sciFi: false } },
      { id: 'yoda', name: 'Yoda', domain: 'characters', tagline: 'Wise Jedi Master', traits: { superhero: false, magic: true, human: false, capeOrMask: false, videoGame: false, sciFi: true } },
      { id: 'sherlock', name: 'Sherlock Holmes', domain: 'characters', tagline: 'Master of deductive logic', traits: { superhero: false, magic: false, human: true, capeOrMask: false, videoGame: false, sciFi: false } },
      { id: 'mario', name: 'Super Mario', domain: 'characters', tagline: 'Iconic mushroom-kingdom hero', traits: { superhero: false, magic: false, human: true, capeOrMask: false, videoGame: true, sciFi: false } },
      { id: 'pikachu', name: 'Pikachu', domain: 'characters', tagline: 'Electric pocket companion', traits: { superhero: false, magic: false, human: false, capeOrMask: false, videoGame: true, sciFi: false } },
      { id: 'wall-e', name: 'WALL-E', domain: 'characters', tagline: 'Curious little future robot', traits: { superhero: false, magic: false, human: false, capeOrMask: false, videoGame: false, sciFi: true } },
    ],
  },
};

export interface ScoredCandidate {
  item: KnowledgeItem;
  score: number; // higher is better
}

/**
 * Entropy-maximizing question picker: chooses the unasked trait that splits the
 * top active candidates closest to 50/50.
 */
export function selectBestTraitQuestion(
  domain: DeductionDomain,
  activeItems: KnowledgeItem[],
  askedTraits: string[]
): TraitQuestion | null {
  const questions = DOMAIN_META[domain].questions.filter((q) => !askedTraits.includes(q.trait));
  if (questions.length === 0 || activeItems.length <= 1) return null;

  let bestQ: TraitQuestion | null = null;
  let bestBalance = Infinity;

  for (const q of questions) {
    const yesCount = activeItems.filter((item) => item.traits[q.trait]).length;
    const noCount = activeItems.length - yesCount;
    if (yesCount === 0 || noCount === 0) continue;
    const imbalance = Math.abs(yesCount - noCount);
    if (imbalance < bestBalance) {
      bestBalance = imbalance;
      bestQ = q;
    }
  }

  return bestQ;
}

export function scoreCandidates(
  items: KnowledgeItem[],
  answers: Record<string, 'yes' | 'no' | 'unsure'>
): { ranked: ScoredCandidate[]; confidence: number } {
  const entries = Object.entries(answers).filter(([, v]) => v !== 'unsure');
  const ranked = items
    .map((item) => {
      let matches = 0;
      let mismatches = 0;
      for (const [trait, ans] of entries) {
        const expected = ans === 'yes';
        if (Boolean(item.traits[trait]) === expected) {
          matches += 1;
        } else {
          mismatches += 1;
        }
      }
      const score = matches * 2 - mismatches * 3;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return { ranked: [], confidence: 0 };

  const topScore = ranked[0].score;
  const tiedCount = ranked.filter((r) => r.score === topScore).length;
  const runnerUpGap = ranked.length > 1 ? topScore - ranked[1].score : 4;

  let confidence = 0;
  if (tiedCount === 1 && entries.length >= 3) {
    confidence = Math.min(97, 74 + runnerUpGap * 6 + entries.length * 2);
  } else if (tiedCount === 2) {
    confidence = 54;
  } else {
    confidence = Math.max(25, Math.round(100 / Math.max(tiedCount, 1)));
  }

  return { ranked, confidence };
}

/* ============================================================================
   4. DAILY MYSTERY & QUICK THINK CHALLENGES
   ============================================================================ */

export interface DailyMysteryPuzzle {
  id: string;
  title: string;
  riddle: string;
  clues: string[];
  options: string[];
  answer: string;
  explanation: string;
}

const DAILY_PUZZLES: DailyMysteryPuzzle[] = [
  {
    id: 'dm-1',
    title: 'The Silent Echo',
    riddle: 'I speak without a mouth and hear without ears. I have nobody, yet I come alive with wind. What am I?',
    clues: ['You hear me in canyons and empty halls.', 'I repeat your own thoughts back to you.'],
    options: ['An Echo', 'A Shadow', 'A Dream', 'A Whisper'],
    answer: 'An Echo',
    explanation: 'An echo bounces sound waves back without a physical body, awakening when sound travels through air.',
  },
  {
    id: 'dm-2',
    title: 'The Vanishing Digit',
    riddle: 'Think of a two-digit number whose digits add up to 9. When you reverse its digits, the new number is 27 larger than the original. Which number is it?',
    clues: ['The tens digit is smaller than the ones digit.', '3 + 6 = 9, and 63 - 36 = 27.'],
    options: ['27', '36', '45', '18'],
    answer: '36',
    explanation: '3 + 6 = 9, and reversing 36 gives 63. Since 63 - 36 = 27, 36 is the exact hidden number.',
  },
  {
    id: 'dm-3',
    title: 'The Invisible Map',
    riddle: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
    clues: ['Explorers carry me in their pockets or phones.', 'I show the world in miniature.'],
    options: ['A Mirror', 'A Map', 'A Compass', 'A Mirage'],
    answer: 'A Map',
    explanation: 'A map depicts cities, mountains, and oceans symbolically without containing the physical objects.',
  },
  {
    id: 'dm-4',
    title: 'The Paradox Clock',
    riddle: 'What belongs to you, yet everyone else uses it far more often than you do?',
    clues: ['You hear it whenever someone calls across a room.', 'It was given to you before you could speak.'],
    options: ['Your Shadow', 'Your Time', 'Your Name', 'Your Voice'],
    answer: 'Your Name',
    explanation: 'Your name belongs to you, yet other people speak it constantly when addressing you.',
  },
  {
    id: 'dm-5',
    title: 'The Mirror Sequence',
    riddle: 'Look at the pattern: 2, 6, 12, 20, 30, __. What number is hiding in the blank?',
    clues: ['Notice the gaps: +4, +6, +8, +10...', 'Each step adds the next even number.'],
    options: ['38', '40', '42', '44'],
    answer: '42',
    explanation: 'The differences increase by 2 each time (+4, +6, +8, +10, +12), so 30 + 12 = 42.',
  },
];

export function getDailyMystery(): DailyMysteryPuzzle {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return DAILY_PUZZLES[seed % DAILY_PUZZLES.length];
}

export interface QuickThinkItem {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const QUICK_THINK_BANK: QuickThinkItem[] = [
  {
    id: 'qt-1',
    prompt: 'If 3 neural nodes take 3 seconds to sync 3 signals, how long does 1 node take to sync 1 signal?',
    options: ['1 second', '3 seconds', '9 seconds', '0.5 seconds'],
    answer: '3 seconds',
    explanation: 'Each node works in parallel and needs 3 full seconds for 1 signal.',
  },
  {
    id: 'qt-2',
    prompt: 'Which number comes next: 1, 1, 2, 3, 5, 8, 13, __?',
    options: ['18', '20', '21', '26'],
    answer: '21',
    explanation: 'Fibonacci sequence: 8 + 13 = 21.',
  },
  {
    id: 'qt-3',
    prompt: 'You overtake the person in 2nd place during a race. What place are you in now?',
    options: ['1st place', '2nd place', '3rd place', 'Tied for 1st'],
    answer: '2nd place',
    explanation: 'Passing the person in 2nd puts you into 2nd place, not 1st.',
  },
  {
    id: 'qt-4',
    prompt: 'A bat and a ball cost $1.10 total. The bat costs $1.00 more than the ball. How much is the ball?',
    options: ['$0.10', '$0.05', '$0.15', '$0.01'],
    answer: '$0.05',
    explanation: 'Ball = $0.05, Bat = $1.05, Total = $1.10.',
  },
  {
    id: 'qt-5',
    prompt: 'How many months of the year have 28 days?',
    options: ['1', '4', '6', 'All 12'],
    answer: 'All 12',
    explanation: 'Every single month has at least 28 days.',
  },
  {
    id: 'qt-6',
    prompt: 'What is the odd one out: 4, 9, 16, 24, 36?',
    options: ['9', '16', '24', '36'],
    answer: '24',
    explanation: 'All the others (4, 9, 16, 36) are perfect squares.',
  },
  {
    id: 'qt-7',
    prompt: 'If you rearrange the letters of "CIFAIPC", you get the name of a(n):',
    options: ['City', 'Ocean', 'Animal', 'Country'],
    answer: 'Ocean',
    explanation: 'CIFAIPC rearranges to PACIFIC.',
  },
  {
    id: 'qt-8',
    prompt: 'Double 14, subtract 8, divide by 4. What number is left?',
    options: ['4', '5', '6', '7'],
    answer: '5',
    explanation: '(14 × 2 = 28) → (28 - 8 = 20) → (20 ÷ 4 = 5).',
  },
];

/* ============================================================================
   5. FRIEND CHALLENGE CODEC
   ============================================================================ */

export function encodeChallenge(challenge: FriendChallenge): string {
  const payload = JSON.stringify(challenge);
  return btoa(unescape(encodeURIComponent(payload)));
}

export function decodeChallenge(code: string): FriendChallenge | null {
  try {
    const clean = code.trim();
    const json = decodeURIComponent(escape(atob(clean)));
    const parsed = JSON.parse(json) as Partial<FriendChallenge>;
    if (!parsed.id || !parsed.creatorName || !parsed.game || typeof parsed.creatorScore !== 'number') {
      return null;
    }
    return parsed as FriendChallenge;
  } catch {
    return null;
  }
}
