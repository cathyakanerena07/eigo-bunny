'use client';

import { useState } from 'react';
import ItemPreview from '@/components/ItemPreview';
import PixelIcon from '@/components/PixelIcon';
import PixelBunny from '@/components/PixelBunny';
import { SHOP_ITEMS, SLOT_JA, type ShopSlot } from '@/lib/content/shop';
import { buyItem, currentStage, equipItem, wornAccessories } from '@/lib/storage';
import { useAppState } from '@/lib/useAppState';

const SLOTS = Object.keys(SLOT_JA) as ShopSlot[];

type Tab = 'mine' | 'shop';

export default function ShopPage() {
  const { state, refresh } = useAppState();
  const [tab, setTab] = useState<Tab | null>(null);

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const { pet } = state;
  const stage = currentStage(state);
  const accessories = wornAccessories(pet);

  const owned = new Set([...pet.owned, 'room-day']);
  const myItems = SHOP_ITEMS.filter((i) => owned.has(i.id));
  const hasWearable = myItems.some((i) => i.slot !== 'room');
  const active: Tab = tab ?? (hasWearable ? 'mine' : 'shop');

  const wearing = SLOTS.some((s) => s !== 'room' && pet.equipped[s]);

  const equip = (slot: ShopSlot, id: string | null) => {
    equipItem(slot, id);
    refresh();
  };

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="pixel text-xl">きせかえ</h1>
        <span className="pixel flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm">
          <PixelIcon name="gem" size={15} className="text-sky-deep" />
          <span className="tabular-nums">{pet.gems}</span>
        </span>
      </div>

      <div className="mt-4 grid place-items-center rounded-3xl border border-line bg-lavender/40 py-5">
        <PixelBunny stage={stage} accessories={accessories} size={132} />
        <p className="pixel mt-1 text-[11px] text-ink-soft">いまのすがた</p>
      </div>

      <div className="mt-4 flex gap-2 rounded-full bg-line/60 p-1">
        {(
          [
            ['mine', `マイきせかえ ${myItems.length}`],
            ['shop', 'ショップ'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`pixel flex-1 rounded-full py-2 text-[11px] transition ${
              active === id ? 'bg-card text-ink shadow-sm' : 'text-ink-soft'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active === 'mine' ? (
        !hasWearable ? (
          <p className="mt-6 rounded-3xl border border-line bg-card p-6 text-center text-xs leading-relaxed text-ink-soft">
            まだ持ってるものがないよ。
            <br />
            ショップでジェムとこうかんしてね
          </p>
        ) : (
          <>
            {wearing && (
              <button
                type="button"
                onClick={() => {
                  SLOTS.filter((s) => s !== 'room').forEach((s) => equipItem(s, null));
                  refresh();
                }}
                className="pixel mt-3 w-full rounded-full border border-line bg-card py-2.5 text-[11px] text-ink-soft"
              >
                ぜんぶはずす
              </button>
            )}

            {SLOTS.map((slot) => {
              const items = myItems.filter((i) => i.slot === slot);
              if (items.length === 0) return null;
              const equippedId = pet.equipped[slot];
              return (
                <section key={slot} className="mt-5">
                  <h2 className="pixel text-sm">{SLOT_JA[slot]}</h2>
                  <ul className="mt-2 grid grid-cols-3 gap-2">
                    {slot !== 'room' && (
                      <li>
                        <button
                          type="button"
                          onClick={() => equip(slot, null)}
                          className={`w-full rounded-2xl border p-2 transition ${
                            equippedId ? 'border-line bg-card' : 'border-pink-deep bg-pink/40'
                          }`}
                        >
                          <span className="grid h-14 place-items-center rounded-xl bg-lavender/30">
                            <PixelBunny stage={stage} size={52} />
                          </span>
                          <span className="pixel mt-1.5 block truncate text-[10px]">なし</span>
                        </button>
                      </li>
                    )}
                    {items.map((item) => {
                      const on = equippedId === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => equip(slot, on && slot !== 'room' ? null : item.id)}
                            className={`w-full rounded-2xl border p-2 transition ${
                              on ? 'border-pink-deep bg-pink/40' : 'border-line bg-card'
                            }`}
                          >
                            <span
                              className="grid h-14 place-items-center rounded-xl"
                              style={{ background: `${item.color}33` }}
                            >
                              <ItemPreview itemId={item.id} color={item.color} stage={stage} size={52} />
                            </span>
                            <span className="pixel mt-1.5 block truncate text-[10px]">{item.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </>
        )
      ) : (
        <>
          <p className="mt-3 text-xs text-ink-soft">会話するともらえるジェムで、きせかえできるよ</p>
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
                            onClick={() => equip(slot, on && slot !== 'room' ? null : item.id)}
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
                            <span className="inline-flex items-center justify-center gap-1.5">
                              <PixelIcon name="gem" size={13} className="text-sky-deep" />
                              {item.price}
                            </span>
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      )}

      <div className="h-8" />
    </main>
  );
}
