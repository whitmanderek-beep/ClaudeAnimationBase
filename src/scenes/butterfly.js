// butterfly.js: "The butterfly", 6 s, one shot. Clawd lunges for a butterfly, misses, gives up — and the butterfly
// lands on its head anyway. Flat washes only (no watercolour fills) so it renders quickly without a GPU.
(() => {
  const SKY = mixCol(PAL.sky, PAL.cream, .35), FAR = mixCol(PAL.teal, PAL.cream, .35), NEAR = PAL.sap;
  const WING = [PAL.violet, PAL.rose];
  const HILL = [960, 1400, 1500, 560];                    // front hill ellipse (cx, cy, rx, ry)
  const hillY = (x, cx, cy, rx, ry) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const X = 900, U = 30, G = hillY(X, ...HILL) + 4;

  // story beats (seconds)
  const tEnter = .6, tNotice = .75, tArrive = 1.6, tExcite = 1.6, tCrouch = 1.95, tJump = 2.2, tLand = 2.85,
        tConf = 2.95, tDrift = 3.7, tPerch = 4.45, tLove = 4.6, tIris = 5.35;

  // ---------- set pieces ----------
  function background(t) {
    boilSeed('sky');
    paint(rectPts(-400, -400, W + 800, H + 800), { wash: SKY, ink: null });
    boilSeed('sun');
    glow(1640, 170, 260, '#FFE9A8', .55);
    paint(ellPts(1640, 170, 68, 68, 24, 1.5), { wash: mixCol(PAL.ochre, PAL.cream, .45), ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 3; i++) {                          // clouds drifting slowly right
      boilSeed('cloud' + i);
      const cx = 250 + i * 620 + t * (14 + 6 * i), cy = 150 + 70 * hash(i + 7);
      paint(ellPts(cx, cy, 120 + 30 * hash(i), 38, 22, 2), { wash: PAL.cream, washOp: 235, ink: PAL.ink, sw: .5 });
      paint(ellPts(cx - 40, cy - 26, 60, 34, 18, 2), { wash: PAL.cream, washOp: 235, ink: null });
    }
    boilSeed('farhill');
    paint(ellPts(1450, 1080, 1100, 420, 40, 2), { wash: FAR, ink: PAL.ink, sw: .8 });
    boilSeed('hill');
    paint(ellPts(...HILL, 48, 2), { wash: NEAR, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 18; i++) {                         // grass tufts, swaying
      boilSeed('tuft' + i);
      const x = 80 + i * 105 + 30 * hash(i + 40), y = hillY(x, ...HILL) + 6 + 40 * hash(i + 60);
      if (Math.abs(x - X) < 150) continue;                 // keep Clawd's feet clear
      const sw = wob(t, .5, hash(i) * 3) * 6;
      for (const k of [-1, 0, 1]) inkLine([[x + k * 7, y], [x + k * 11 + sw, y - 20 - 10 * hash(i + k + 5)]], .7, mixCol(NEAR, PAL.ink, .35), 'inkfine', .4);
    }
    for (let i = 0; i < 7; i++) {                          // flowers
      boilSeed('flower' + i);
      const x = [260, 480, 1300, 1460, 1640, 140, 1780][i], y = hillY(x, ...HILL) + 30 + 60 * hash(i + 90);
      const sway = 6 * wob(t, .6, i), col = i % 2 ? PAL.rose : PAL.ochre;
      inkLine([[x, y], [x + sway * .6, y - 30], [x + sway, y - 52]], .8, mixCol(NEAR, PAL.ink, .4), 'ink', .5);
      paint(starPts(x + sway, y - 56, 16, .55, 5, i), { wash: col, ink: PAL.ink, sw: .5 });
      paint(ellPts(x + sway, y - 56, 5, 5, 10), { wash: PAL.cream, ink: null });
    }
  }

  // The butterfly: drawn face-on, wings flap by narrowing (a drawn flap, not a 3D rotation). s = size, open 0..1.
  function butterfly(x, y, s, open, rot = 0) {
    boilSeed('butterfly');
    push(); translate(x, y); rotate(rot);
    const w = .2 + .8 * open;
    for (const d of [-1, 1]) {
      paint(ellPts(d * s * .55 * w, -s * .22, s * .55 * w, s * .42, 16, 0, d * -.35), { wash: WING[0], ink: PAL.ink, sw: .6 });
      paint(ellPts(d * s * .4 * w, s * .3, s * .36 * w, s * .3, 14, 0, d * .4), { wash: WING[1], ink: PAL.ink, sw: .6 });
      paint(ellPts(d * s * .6 * w, -s * .25, s * .14 * w, s * .12, 10), { wash: PAL.cream, ink: null });
      inkLine([[0, -s * .45], [d * s * .18, -s * .8], [d * s * .28, -s * .9]], .6, PAL.ink, 'inkfine', .5);
    }
    paint(ellPts(0, 0, s * .1, s * .5, 12), { wash: PAL.ink, ink: null });
    pop();
  }
  const flapFast = t => .5 + .5 * Math.cos(t * 26);
  const flapSlow = t => .55 + .45 * Math.cos(t * 5);

  // where the top of Clawd's head is for a given pose
  const headTop = cl => [X + 1.6 * U, G + (cl.dy || 0) * U - 8 * U * (1 - (cl.sq || 0)) - 34];

  // butterfly flight path (before it perches)
  function flight(lt) {
    const bob = [22 * Math.cos(lt * 7), 30 * Math.sin(lt * 9)];
    let p;
    if (lt < tArrive) { const k = ease(seg(lt, tEnter, tArrive)); p = [lerp(-120, 1090, k), lerp(380, 500, k) - 90 * Math.sin(k * Math.PI)]; }
    else if (lt < tJump) p = [1090, 500];
    else if (lt < tJump + .5) { const k = easeOut(seg(lt, tJump, tJump + .5)); p = [lerp(1090, 1190, k), lerp(500, 180, k)]; }
    else if (lt < tDrift) { const k = ease(seg(lt, tJump + .5, tDrift)); p = [lerp(1190, 1260, k), lerp(180, 210, k)]; }
    else return null;
    return [p[0] + bob[0], p[1] + bob[1]];
  }

  // ---------- the shot ----------
  function shot(t, lt, dur) {
    camBegin(960 + 14 * Math.sin(lt * .7), 540, lerp(1, 1.07, ease(lt / dur)));
    background(t);

    // Clawd's pose
    const mood = emotions(lt, [[0, 'neutral'], [tNotice, 'thinking'], [tExcite, 'excited'], [tCrouch, 'determined'],
                               [tConf, 'confused'], [tLove, 'love']]);
    const hop = jump(lt, tJump, tLand, 3.4);
    const crouch = lt > tCrouch - .1 && lt < tJump ? .14 * ease(seg(lt, tCrouch, tJump - .12)) : 0;
    const cl = { ...mood, sq: (mood.sq || 0) + hop.sq + crouch, dy: (mood.dy || 0) * (lt > tJump && lt < tLand ? 0 : 1) + hop.dy };
    // arms reach up through the jump; the left leads, the right follows a beat behind
    const reachL = ease(seg(lt, tJump - .08, tJump + .12)) * (1 - ease(seg(lt, tLand, tLand + .35)));
    const reachR = ease(seg(lt, tJump, tJump + .2)) * (1 - ease(seg(lt, tLand + .05, tLand + .45)));
    if (reachL > 0) cl.aL = lerp(cl.aL ?? .2, 1.45, reachL);
    if (reachR > 0) cl.aR = lerp(cl.aR ?? .2, 1.2, reachR);

    // the butterfly's position, and where Clawd's eyes point
    const head = headTop(cl);
    let b = flight(lt), open = flapFast(lt), brot = .15 * Math.sin(lt * 5);
    if (!b) {
      const from = flight(tDrift - .001), k = ease(seg(lt, tDrift, tPerch));
      if (k < 1) {
        b = [lerp(from[0], head[0], k) + 60 * Math.sin(k * Math.PI * 2) * (1 - k), lerp(from[1], head[1], k)];
        open = lerp(flapFast(lt), flapSlow(lt), k);
      } else { b = head; open = flapSlow(lt); brot = .08 * Math.sin(lt * 2); }
    }
    const eye = [X, G + (cl.dy || 0) * U - 6 * U];
    if (lt > tNotice && (lt < tConf || lt > tDrift)) {
      cl.lookX = clamp((b[0] - eye[0]) / 420, -1, 1);
      cl.lookY = clamp((b[1] - eye[1]) / 320, -1, 1);
    } else if (lt >= tConf) {                              // looks left, then right: where did it go?
      cl.lookX = kf(lt, [[tConf, 0], [tConf + .2, -1], [tConf + .4, -1], [tConf + .55, 1], [tDrift - .05, 1]], ease);
      cl.lookY = .1;
    }
    if (lt > tPerch) { cl.lookY = -1; cl.lookX = .3; }

    clawd(X, G, U, cl);
    if (b[0] > -100) butterfly(b[0], b[1], 72, open, brot);

    const at = toScreen(X, G - 4 * U);
    camEnd();
    boilSeed('transition');
    if (lt < .6) iris(...at, lerp(0, 1500, easeIn(lt / .6)));
    if (lt > tIris) {
      const r = lt < tIris + .35 ? lerp(1500, 300, ease(seg(lt, tIris, tIris + .35)))
              : lt < dur - .25 ? lerp(300, 280, seg(lt, tIris + .35, dur - .25))
              : lerp(280, 0, easeIn(seg(lt, dur - .25, dur - .03)));
      iris(...at, r);
    }
  }

  shots([[0, shot]]);
})();
