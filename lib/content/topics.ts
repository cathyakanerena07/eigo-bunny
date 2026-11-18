import type { IconName } from '@/components/PixelIcon';

export type Chapter = { id: string; ja: string; note: string };

export const CHAPTERS: Chapter[] = [
  {
    id: 'start',
    ja: 'はじめのいっぽ',
    note: 'あいさつと自己紹介。まずは口を動かすところから',
  },
  {
    id: 'daily',
    ja: 'まいにちのこと',
    note: '毎日の生活を、そのまま英語で言えるように',
  },
  {
    id: 'more',
    ja: 'もうすこし話す',
    note: '昔のことや、これからのこと。理由もつけて長めに話す',
  },
  {
    id: 'work',
    ja: 'しごとと世界',
    note: '仕事の会話と、世界の人と話すための言い方',
  },
];

export type Topic = {
  id: string;
  title: string;
  ja: string;
  icon: IconName;
  chapter: string;
  step: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  opener: string;
  goal: string;
  targetWords: string[];
};

export const TOPICS: Topic[] = [
  {
    id: 'hello-goodbye',
    title: 'Hello and goodbye',
    ja: 'あいさつ',
    icon: 'hand',
    chapter: 'start',
    step: 1,
    level: 'beginner',
    opener: 'Hi there! Good to see you. Can you say hello to me?',
    goal: 'Practise the basic greetings only: hello, hi, good morning, nice to meet you, see you later. Greet them, let them greet you back, then add one new greeting. Keep every sentence under eight words.',
    targetWords: ['hello', 'good morning', 'see you later', 'take care'],
  },
  {
    id: 'introduce-yourself',
    title: 'Introduce yourself',
    ja: 'じこしょうかい',
    icon: 'card',
    chapter: 'start',
    step: 2,
    level: 'beginner',
    opener: 'Nice to meet you! I am your bunny. What should I call you?',
    goal: 'Build a three-sentence self-introduction: name, where they live, what they do. Ask for one part at a time and repeat each answer back as a full sentence.',
    targetWords: ['My name is', 'I live in', 'I work as', 'nice to meet you'],
  },
  {
    id: 'how-are-you',
    title: 'How are you today?',
    ja: 'きょうのちょうし',
    icon: 'face',
    chapter: 'start',
    step: 3,
    level: 'beginner',
    opener: 'Hi! How are you today? I am a little sleepy.',
    goal: 'Teach answers beyond "I am fine": good, tired, sleepy, busy, so-so. Ask how they are, react warmly, then ask why they feel that way.',
    targetWords: ['I am good', 'a little tired', 'so-so', 'how about you'],
  },
  {
    id: 'things-i-like',
    title: 'Things I like',
    ja: 'すきなもの',
    icon: 'heart',
    chapter: 'start',
    step: 4,
    level: 'beginner',
    opener: 'I love carrots! What food do you like?',
    goal: 'Practise "I like" and "I do not like" with food, animals and colours. Give your own answer first so they can copy the shape, then ask theirs.',
    targetWords: ['I like', 'I love', 'not really', 'favourite'],
  },
  {
    id: 'numbers-and-time',
    title: 'Numbers and time',
    ja: 'すうじと じかん',
    icon: 'clock',
    chapter: 'start',
    step: 5,
    level: 'beginner',
    opener: 'Hi! What time did you wake up today?',
    goal: 'Practise saying numbers, times and days out loud. Ask what time they wake up, eat lunch and go to bed, and say each time back in a full sentence.',
    targetWords: ["o'clock", 'half past', 'every day', 'around'],
  },
  {
    id: 'ask-me-back',
    title: 'Ask me a question',
    ja: 'しつもん してみる',
    icon: 'bubble',
    chapter: 'start',
    step: 6,
    level: 'beginner',
    opener: 'My turn is over! Now you ask me something. Anything you want!',
    goal: 'The learner asks the questions this time. Teach the question starters what, where, when, who, why and how. Answer briefly, then nudge them for the next question instead of taking over.',
    targetWords: ['What do you', 'Where do you', 'Do you like', 'Why'],
  },
  {
    id: 'my-daily-routine',
    title: 'My daily routine',
    ja: 'いちにちの ながれ',
    icon: 'sun',
    chapter: 'daily',
    step: 7,
    level: 'beginner',
    opener: 'I woke up, ate a carrot, and hopped around. How does your day start?',
    goal: 'Walk through their whole day in order using present simple verbs. Teach the linking words first, then, after that and finally.',
    targetWords: ['wake up', 'usually', 'after that', 'go to bed'],
  },
  {
    id: 'food-and-drink',
    title: 'Food and drink',
    ja: 'たべもの と のみもの',
    icon: 'bowl',
    chapter: 'daily',
    step: 8,
    level: 'beginner',
    opener: 'I had a carrot for lunch. What did you eat today?',
    goal: 'Talk about meals and taste, and introduce the past simple gently: ate, had, drank. Ask whether they cooked it or bought it.',
    targetWords: ['I had', 'delicious', 'sweet', 'I cooked'],
  },
  {
    id: 'my-weekend',
    title: 'How was your weekend?',
    ja: 'しゅうまつの こと',
    icon: 'ticket',
    chapter: 'daily',
    step: 9,
    level: 'beginner',
    opener: 'My weekend was quiet and sunny. How was yours?',
    goal: 'Past simple in full sentences: went, saw, met, stayed. Ask who they were with and whether it was fun, so every answer gets two or three sentences.',
    targetWords: ['I went to', 'I stayed home', 'with my', 'it was fun'],
  },
  {
    id: 'weather-and-seasons',
    title: 'Weather and seasons',
    ja: 'てんき と きせつ',
    icon: 'umbrella',
    chapter: 'daily',
    step: 10,
    level: 'beginner',
    opener: 'It is raining on my side today. What is the weather like where you are?',
    goal: 'Describe weather and seasons, then say which one they prefer and why. Teach "it is" plus weather words, and a simple comparison.',
    targetWords: ['It is sunny', 'humid', 'I prefer', 'season'],
  },
  {
    id: 'shopping',
    title: 'At the shop',
    ja: 'かいもの',
    icon: 'bag',
    chapter: 'daily',
    step: 11,
    level: 'intermediate',
    opener: 'Welcome to my little carrot shop! What are you looking for today?',
    goal: 'Roleplay a small shop with you as the shopkeeper. Teach asking for things, asking the price, and talking about size or colour. Swap roles at the end.',
    targetWords: ['How much is', 'Can I have', 'Do you have', 'I will take it'],
  },
  {
    id: 'good-and-bad-days',
    title: 'Good days and bad days',
    ja: 'きもちを つたえる',
    icon: 'cloud',
    chapter: 'daily',
    step: 12,
    level: 'intermediate',
    opener: 'Today feels a bit cloudy for me. How does today feel for you?',
    goal: 'Go past happy and sad: nervous, relieved, frustrated, excited. Ask what caused the feeling, and listen for a sentence or two before you reply.',
    targetWords: ['I feel', 'nervous', 'relieved', 'stressed out'],
  },
  {
    id: 'my-hobby',
    title: 'Tell me about your hobby',
    ja: 'すきなこと を くわしく',
    icon: 'headphone',
    chapter: 'more',
    step: 13,
    level: 'intermediate',
    opener: 'I collect pretty stones by the river. What do you do when you are free?',
    goal: 'Get three or four sentences in a row about one single hobby: what it is, when they started, why they like it. Ask follow-ups instead of changing topic.',
    targetWords: ['I am into', 'I started', 'what I like about it', 'once a week'],
  },
  {
    id: 'past-experiences',
    title: 'The best thing I ever did',
    ja: 'いままでの けいけん',
    icon: 'camera',
    chapter: 'more',
    step: 14,
    level: 'intermediate',
    opener: 'I once hopped all the way to the top of a hill. What is the best thing you have ever done?',
    goal: 'Practise the present perfect against the past simple: have you ever, I have never, last year I did. Keep them telling one story in order rather than jumping around.',
    targetWords: ['Have you ever', 'I have never', 'at that time', 'I will never forget'],
  },
  {
    id: 'future-plans',
    title: 'What comes next',
    ja: 'これからの よてい',
    icon: 'calendar',
    chapter: 'more',
    step: 15,
    level: 'intermediate',
    opener: 'I am going to nap at three. What are you going to do later?',
    goal: 'Compare going to, will and planning to. Ask about this week, this year and someday, and push for the reason behind each plan.',
    targetWords: ['I am going to', 'I am planning to', 'probably', 'I hope to'],
  },
  {
    id: 'give-your-opinion',
    title: 'What do you think?',
    ja: 'いけんを 言ってみる',
    icon: 'bulb',
    chapter: 'more',
    step: 16,
    level: 'intermediate',
    opener: 'I think mornings are better than nights. What do you think?',
    goal: 'Opinion, then reason, then example — every single time. Teach I think, in my opinion, because and for example. Ask "why?" whenever they stop at one sentence.',
    targetWords: ['I think', 'because', 'for example', 'in my opinion'],
  },
  {
    id: 'how-do-i-get-there',
    title: 'How do I get there?',
    ja: 'みちあんない',
    icon: 'pin',
    chapter: 'more',
    step: 17,
    level: 'intermediate',
    opener: 'I am lost! How do I get from the station to your house?',
    goal: 'Give directions step by step: turn left, go straight, it is next to. Then have them explain how to make or do something in the same step-by-step way.',
    targetWords: ['go straight', 'turn left', 'next to', 'it takes about'],
  },
  {
    id: 'order-at-a-cafe',
    title: 'Ordering at a cafe',
    ja: 'カフェで ちゅうもん',
    icon: 'cup',
    chapter: 'more',
    step: 18,
    level: 'intermediate',
    opener: 'Hi, welcome in! What can I get for you today?',
    goal: 'Roleplay a cafe from start to finish: order, size, for here or to go, paying, thanking. Stay in character as the staff, and add one small complication such as a sold-out item.',
    targetWords: ['Could I get', 'for here', 'to go', 'That is all, thanks'],
  },
  {
    id: 'work-update',
    title: 'How is work going?',
    ja: 'しごとの ほうこく',
    icon: 'laptop',
    chapter: 'work',
    step: 19,
    level: 'advanced',
    opener: 'Hey! How is work going this week? Busy?',
    goal: 'Describe their current work: what they are building, what is going well, what is stuck. Teach natural status language and keep each answer short and concrete.',
    targetWords: ['I am working on', 'on track', 'behind schedule', 'wrap up'],
  },
  {
    id: 'join-a-meeting',
    title: 'Speak up in a meeting',
    ja: 'かいぎで はなす',
    icon: 'chart',
    chapter: 'work',
    step: 20,
    level: 'advanced',
    opener: 'Alright, quick standup! Can you give me your update in three sentences?',
    goal: 'Roleplay a short standup: ask for an update, a blocker and a next step. Then teach how to jump in politely and how to ask someone to repeat themselves.',
    targetWords: ['Just to add', 'Could you repeat that', 'blocker', 'action item'],
  },
  {
    id: 'email-and-chat',
    title: 'Writing emails and chats',
    ja: 'メールと チャット',
    icon: 'envelope',
    chapter: 'work',
    step: 21,
    level: 'advanced',
    opener: 'I have to message my team but I sound so stiff. Can you help me?',
    goal: 'Compare stiff and natural phrasing for work messages. Have them say a request, a thank you and a polite chase out loud, then offer a smoother version of each.',
    targetWords: ['Just checking in', 'Could you please', 'I wanted to ask', 'Thanks in advance'],
  },
  {
    id: 'agree-and-disagree',
    title: 'Agreeing and disagreeing',
    ja: 'さんせい と はんたい',
    icon: 'talk',
    chapter: 'work',
    step: 22,
    level: 'advanced',
    opener: 'I think we should ship it today. Do you agree, or not?',
    goal: 'Practise soft disagreement: I see your point but, I am not sure about that, what if we. Take a clear position, let them push back, and push back politely yourself.',
    targetWords: ['I see your point', 'I am not sure', 'What if we', 'That makes sense'],
  },
  {
    id: 'present-an-idea',
    title: 'Present your idea',
    ja: 'アイデアを つたえる',
    icon: 'board',
    chapter: 'work',
    step: 23,
    level: 'advanced',
    opener: 'You have one minute and I am your audience. What idea do you want to pitch me?',
    goal: 'Structure a one-minute pitch: the problem, the idea, why it works, what they need. Then ask one hard question at the end and let them answer it.',
    targetWords: ['The problem is', 'My idea is', 'the main benefit', 'to sum up'],
  },
  {
    id: 'travel-and-culture',
    title: 'Travel and culture',
    ja: 'たびと ぶんか',
    icon: 'globe',
    chapter: 'work',
    step: 24,
    level: 'advanced',
    opener: 'If you could hop onto a plane tonight, where would you go?',
    goal: 'Talk about travel, cultural differences and what surprised them abroad. Use the conditional and comparisons naturally, and share one small cultural note back.',
    targetWords: ['I would love to', 'compared to', 'culture shock', 'back home'],
  },
];

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function topicsOfChapter(chapterId: string): Topic[] {
  return TOPICS.filter((t) => t.chapter === chapterId);
}

/** The next lesson to do: the first unfinished one in curriculum order, else cycle by seed. */
export function nextTopic(doneIds: Iterable<string>, seed = 0): Topic {
  const done = new Set(doneIds);
  return TOPICS.find((t) => !done.has(t.id)) ?? TOPICS[Math.abs(seed) % TOPICS.length];
}

export function topicOfTheDay(seed: number): Topic {
  return TOPICS[Math.abs(seed) % TOPICS.length];
}

/** Builds a throwaway Topic from the learner's own words. Used by /chat/custom. */
export function customTopic(text: string): Topic {
  const title = text.trim().slice(0, 80);
  return {
    id: 'custom',
    title,
    ja: 'じぶんでえらんだテーマ',
    icon: 'spark',
    chapter: 'custom',
    step: 0,
    level: 'intermediate',
    opener: '',
    goal: `The learner chose this theme themselves: "${title}". Open the conversation on that theme, ask one friendly question about it, and keep the conversation going from there.`,
    targetWords: [],
  };
}
