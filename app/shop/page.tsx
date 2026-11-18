'use client';

import ItemPreview from '@/components/ItemPreview';
import PixelBunny from '@/components/PixelBunny';
import { SHOP_ITEMS, SLOT_JA, itemById, type ShopSlot } from '@/lib/content/shop';
import { buyItem, currentStage, equipItem } from '@/lib/storage';
import { useAppState } from '@/lib/useAppState';

const SLOTS: ShopSlot[] = ['hat', 'ribbon', 'glasses', 'room'];

export default function ShopPage() {
  const { state, refresh } = useAppState();

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const { pet } = state;
  const stage = currentStage(state);
  const accessories = [pet.equipped.hat, pet.equipped.ribbon, pet.equipped.glasses]
    .map((id) => itemById(id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => ({ id: i.id, color: i.color }));

  const owned = new Set([...pet.owned, 'room-day']);

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="pixel text-xl">ショップ</h1>
        <span className="pixel flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm">
          💎 <span className="tabular-nums">{pet.gems}</span>
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">会話するともらえるジェムで、きせかえできるよ</p>

      <div className="mt-4 grid place-items-center rounded-3xl border border-line bg-lavender/40 py-5">
        <PixelBunny stage={stage} accessories={accessories} size={132} />
        <p className="pixel mt-1 text-[11px] text-ink-soft">いまのすがた</p>
      </div>

      {SLOTS.map((slot) => {
        const items = SHOP_ITEMS.filter((i) => i.slot === slot);
        const equippedId = pet.equipped[slot];
        return (
          <section key={slot} className="mt-6">
            <h2 className="pixel text-sm">{SLOT_JA[slot]}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-3">
              {items.map((item) => {
                const have = owned.has(item.id);
                const on = equippedId === item.id;
                const canBuy = !have && pet.gems >= item.price;
                return (
                  <li key={item.id} className="rounded-3xl border border-line bg-card p-3">
                    <div
                      className="grid h-20 place-items-center rounded-2xl"
                      style={{ background: `${item.color}33` }}
                    >
                      <ItemPreview itemId={item.id} color={item.color} stage={stage} size={66} />
                    </div>
                    <p className="mt-2 truncate text-xs">{item.name}</p>
                    {have ? (
                      <button
                        type="button"
                        onClick={() => {
                          equipItem(slot, on && slot !== 'room' ? null : item.id);
                          refresh();
                        }}
                        className={`pixel mt-2 w-full rounded-full py-2 text-[11px] ${on ? 'bg-pink-deep text-white' : 'bg-line text-ink'}`}
                      >
                        {on ? (slot === 'room' ? 'つかってる' : 'つけてる') : 'つける'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => {
                          buyItem(item.id, item.price);
                          refresh();
                        }}
                        className="pixel mt-2 w-full rounded-full bg-cream py-2 text-[11px] disabled:opacity-45"
                      >
                        💎 {item.price}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="pixel mt-6 text-center text-[10px] leading-relaxed text-ink-soft">
        ぼうし・リボン・メガネはドット絵で重ねて表示。
        <br />
        おへやは背景が変わるよ
      </p>
      <div className="h-8" />
    </main>
  );
}
