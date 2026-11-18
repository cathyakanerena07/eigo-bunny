export type ShopSlot = 'hat' | 'ribbon' | 'glasses' | 'scarf' | 'cheek' | 'room';

export type ShopItem = {
  id: string;
  slot: ShopSlot;
  name: string;
  price: number;
  color: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat-cap', slot: 'hat', name: 'きいろいキャップ', price: 60, color: '#ffd84d' },
  { id: 'hat-crown', slot: 'hat', name: 'ちいさな王冠', price: 140, color: '#f6b93b' },
  { id: 'hat-beanie', slot: 'hat', name: 'もこもこニットぼうし', price: 90, color: '#9b93f0' },
  { id: 'hat-straw', slot: 'hat', name: 'むぎわらぼうし', price: 110, color: '#d9a85f' },
  { id: 'hat-party', slot: 'hat', name: 'パーティぼうし', price: 130, color: '#ff7a5c' },
  { id: 'hat-headphones', slot: 'hat', name: 'ヘッドホン', price: 190, color: '#5b6ca8' },
  { id: 'ribbon-pink', slot: 'ribbon', name: 'ピンクのリボン', price: 50, color: '#f49ac8' },
  { id: 'ribbon-big', slot: 'ribbon', name: 'おおきなリボン', price: 120, color: '#e8556f' },
  { id: 'ribbon-flower', slot: 'ribbon', name: 'おはなのかざり', price: 100, color: '#b48ce8' },
  { id: 'glasses-round', slot: 'glasses', name: 'まるメガネ', price: 80, color: '#4c9fc4' },
  { id: 'glasses-sun', slot: 'glasses', name: 'サングラス', price: 110, color: '#3a3550' },
  { id: 'glasses-heart', slot: 'glasses', name: 'ハートメガネ', price: 150, color: '#d06ce8' },
  { id: 'glasses-mask', slot: 'glasses', name: 'おひるねマスク', price: 90, color: '#6fd8c0' },
  { id: 'scarf-knit', slot: 'scarf', name: 'あかいマフラー', price: 100, color: '#d94f3d' },
  { id: 'scarf-bandana', slot: 'scarf', name: 'みずたまバンダナ', price: 80, color: '#4fb286' },
  { id: 'cheek-blush', slot: 'cheek', name: 'ほっぺチーク', price: 40, color: '#ff9bb0' },
  { id: 'cheek-freckles', slot: 'cheek', name: 'そばかす', price: 40, color: '#c98a5e' },
  { id: 'cheek-star', slot: 'cheek', name: 'ほしのシール', price: 70, color: '#46d6e0' },
  { id: 'room-day', slot: 'room', name: 'ひるのへや', price: 0, color: '#bdebf5' },
  { id: 'room-sakura', slot: 'room', name: 'さくらのへや', price: 120, color: '#f6c6dd' },
  { id: 'room-night', slot: 'room', name: 'よるのへや', price: 150, color: '#5d5595' },
];

export const SLOT_JA: Record<ShopSlot, string> = {
  hat: 'ぼうし',
  ribbon: 'リボン',
  glasses: 'メガネ',
  scarf: 'マフラー',
  cheek: 'ほっぺ',
  room: 'おへや',
};

export function itemById(id: string | null): ShopItem | undefined {
  if (!id) return undefined;
  return SHOP_ITEMS.find((i) => i.id === id);
}
