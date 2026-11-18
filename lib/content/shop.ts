export type ShopSlot = 'hat' | 'ribbon' | 'glasses' | 'room';

export type ShopItem = {
  id: string;
  slot: ShopSlot;
  name: string;
  price: number;
  color: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat-cap', slot: 'hat', name: 'きいろいキャップ', price: 60, color: '#f49ac8' },
  { id: 'hat-crown', slot: 'hat', name: 'ちいさな王冠', price: 140, color: '#ffd84d' },
  { id: 'ribbon-pink', slot: 'ribbon', name: 'ピンクのリボン', price: 50, color: '#f49ac8' },
  { id: 'glasses-round', slot: 'glasses', name: 'まるメガネ', price: 80, color: '#73cfe3' },
  { id: 'room-day', slot: 'room', name: 'ひるのへや', price: 0, color: '#bdebf5' },
  { id: 'room-sakura', slot: 'room', name: 'さくらのへや', price: 120, color: '#f6c6dd' },
  { id: 'room-night', slot: 'room', name: 'よるのへや', price: 150, color: '#5d5595' },
];

export const SLOT_JA: Record<ShopSlot, string> = {
  hat: 'ぼうし',
  ribbon: 'リボン',
  glasses: 'メガネ',
  room: 'おへや',
};

export function itemById(id: string | null): ShopItem | undefined {
  if (!id) return undefined;
  return SHOP_ITEMS.find((i) => i.id === id);
}
