/**
 * Photobooth group layout.
 *
 * The guest stands beside their own — a man next to the groom, a woman next
 * to the bride — and never between the two of them. Standing in the middle
 * separates the couple in their own wedding photo, which is not what anyone
 * does at a resepsi. Same etiquette the salaman follows.
 */
import './_register-ts.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Dynamic: the resolver hook above has to be registered before photobooth.ts
// pulls in its own extensionless imports.
const { groupLayout, renderScene, POSES, ACCESSORIES, GUEST_SHEET } = await import('../src/game/photobooth.ts');

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

for (const body of ['pria', 'wanita']) {
  const { guest, groom, bride } = groupLayout(body);
  const between = (guest > Math.min(groom, bride)) && (guest < Math.max(groom, bride));
  ok(!between, `${body}: the guest never stands between the bride and the groom`);

  // The couple stay next to each other: nothing sits between them.
  const lo = Math.min(groom, bride), hi = Math.max(groom, bride);
  ok(!(guest > lo && guest < hi), `${body}: the couple are not separated`);

  if (body === 'pria') {
    ok(Math.abs(guest - groom) < Math.abs(guest - bride), 'a man stands nearer the groom');
    ok(guest < groom && groom < bride, 'order is guest, groom, bride');
  } else {
    ok(Math.abs(guest - bride) < Math.abs(guest - groom), 'a woman stands nearer the bride');
    ok(groom < bride && bride < guest, 'order is groom, bride, guest');
  }

  // Three distinct spots, evenly spaced, centred on the scene.
  const xs = [guest, groom, bride].sort((a, b) => a - b);
  ok(new Set(xs).size === 3, `${body}: nobody is standing on top of anyone`);
  ok(Math.abs((xs[1] - xs[0]) - (xs[2] - xs[1])) < 0.001, `${body}: evenly spaced`);
  ok(Math.abs(xs[0] + xs[2]) < 0.001, `${body}: the trio is centred on the scene`);
}

// Check that the same selection reaches the same piece of art in both layouts.
const atlas = readFileSync(new URL('../public' + GUEST_SHEET, import.meta.url));
assert.equal(atlas.toString('ascii', 8, 12), 'WEBP');
assert.equal(atlas.toString('ascii', 12, 16), 'VP8X');
const guests = { naturalWidth: atlas.readUIntLE(24, 3) + 1, naturalHeight: atlas.readUIntLE(27, 3) + 1 };
const background = { naturalWidth: 960, naturalHeight: 1040 };
const pair = { width: 300, height: 896 };
const cells = new Set();
for (const [row, accessory] of ACCESSORIES.entries()) {
  for (const [poseIndex, pose] of POSES.entries()) {
    for (const [index, body] of ['pria', 'wanita'].entries()) {
      const source = [(poseIndex * 2 + index) * 240, row * 360, 240, 360];
      for (const couple of [null, pair]) {
        const calls = [];
        const ctx = { drawImage: (...args) => calls.push(args), beginPath() {}, ellipse() {}, fill() {} };
        renderScene(ctx, { background, guests, couple, body, pose: pose.id, accessory: accessory.id });
        const guest = calls.filter(([image]) => image === guests);
        assert.equal(guest.length, 1);
        assert.deepEqual(guest[0].slice(1, 5), source);
        assert.equal(calls.filter(([image]) => image === pair).length, couple ? 2 : 0);
        const [, , , , , left, top, width, height] = guest[0];
        const offset = couple ? groupLayout(body).guest : 0;
        assert.equal(left + width / 2, 480 + offset);
        assert.ok(Math.abs(top + height * 464 / 480 - 1000) < 0.01);
      }
      cells.add(source.join(','));
    }
  }
}
assert.equal(cells.size, 56);

console.log(`✓ photobooth: ${n} layout checks and ${cells.size} guest variants passed`);
