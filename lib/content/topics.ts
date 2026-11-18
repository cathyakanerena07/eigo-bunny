export type Topic = {
  id: string;
  title: string;
  ja: string;
  emoji: string;
  opener: string;
  goal: string;
  targetWords: string[];
};

export const TOPICS: Topic[] = [
  {
    id: 'weekend',
    title: "Let's talk about your weekend!",
    ja: '週末のこと',
    emoji: '🌤',
    opener: 'Hi! What did you do last weekend?',
    goal: 'Get them talking about what they did, in the past tense. Ask about who they were with and whether it was fun.',
    targetWords: ['weekend', 'relax', 'went', 'hang out'],
  },
  {
    id: 'food',
    title: 'What did you eat today?',
    ja: '今日たべたもの',
    emoji: '🍙',
    opener: 'Hello! What did you eat today? I had a carrot!',
    goal: 'Talk about food, taste and cooking. Ask whether they made it or bought it.',
    targetWords: ['delicious', 'spicy', 'cook', 'favourite'],
  },
  {
    id: 'work',
    title: 'How is work going?',
    ja: 'しごとの話',
    emoji: '💻',
    opener: 'Hey! How is work going these days?',
    goal: 'Talk about their job, what they are building, and what is hard right now.',
    targetWords: ['busy', 'deadline', 'project', 'meeting'],
  },
  {
    id: 'feeling',
    title: 'How are you feeling today?',
    ja: 'きょうの気分',
    emoji: '🌈',
    opener: 'Good to see you! How are you feeling today?',
    goal: 'Talk about mood and energy. Teach a few natural ways to say more than "I am fine".',
    targetWords: ['tired', 'excited', 'sleepy', 'calm'],
  },
  {
    id: 'plans',
    title: 'What are your plans?',
    ja: 'これからの予定',
    emoji: '📅',
    opener: 'Hi! Do you have any plans for this week?',
    goal: 'Practise future forms — going to, will, planning to.',
    targetWords: ['plan', 'maybe', 'probably', 'looking forward'],
  },
  {
    id: 'hobby',
    title: 'Tell me about your hobby!',
    ja: 'すきなこと',
    emoji: '🎧',
    opener: 'Hi there! What do you like doing when you are free?',
    goal: 'Talk about hobbies and why they like them.',
    targetWords: ['hobby', 'into', 'practice', 'relaxing'],
  },
  {
    id: 'travel',
    title: 'Where do you want to go?',
    ja: '行ってみたい場所',
    emoji: '✈️',
    opener: 'Hello! If you could go anywhere tomorrow, where would you go?',
    goal: 'Talk about places and travel. Keep the conditional simple.',
    targetWords: ['travel', 'abroad', 'someday', 'trip'],
  },
  {
    id: 'self',
    title: 'Introduce yourself to me!',
    ja: '自己紹介',
    emoji: '👋',
    opener: 'Nice to meet you! Can you tell me a little about yourself?',
    goal: 'Practise a natural self-introduction: name, work, where they live, one fun fact.',
    targetWords: ['originally', 'currently', 'actually', 'nice to meet you'],
  },
  {
    id: 'meeting',
    title: 'Practise a work meeting',
    ja: '会議のれんしゅう',
    emoji: '🗣',
    opener: 'Okay, let us pretend this is a short team meeting. Can you give me your update?',
    goal: 'Roleplay a short standup. Ask for an update, a blocker and a next step.',
    targetWords: ['update', 'blocker', 'follow up', 'on track'],
  },
  {
    id: 'smalltalk',
    title: 'Small talk practice',
    ja: 'ちょっと雑談',
    emoji: '☕️',
    opener: 'Hi! The weather is nice today, is it nice where you are?',
    goal: 'Keep a light small-talk thread going for a few turns.',
    targetWords: ['by the way', 'actually', 'same here', 'how about you'],
  },
];

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function topicOfTheDay(seed: number): Topic {
  return TOPICS[seed % TOPICS.length];
}
