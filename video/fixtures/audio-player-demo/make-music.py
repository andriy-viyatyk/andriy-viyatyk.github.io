# Synthesizes the demo music for the Audio Player clip: eight short instrumental tracks with
# drums, bass, chords and a lead line, so every visualizer effect (Bars, Circular, Instruments)
# has kicks, hats, bass and melody to react to. No samples, no third-party music.
#
#   python make-music.py <out-folder>     -> <out-folder>/<file>.wav (then encode to mp3)
import sys, os, wave
import numpy as np

SR = 44100
LENGTH = 100.0                     # seconds per track

# file, bpm, key (MIDI root), minor?, progression (scale degrees), drum style, lead seed
TRACKS = [
    ("night-drive",      104, 45, True,  [0, 5, 2, 6], "four",   1),
    ("first-light",       92, 50, False, [0, 4, 5, 3], "back",   2),
    ("harbor-lights",    118, 48, True,  [0, 3, 5, 4], "four",   3),
    ("paper-planes",      86, 53, False, [0, 5, 3, 4], "back",   4),
    ("glass-city",       124, 47, True,  [0, 6, 5, 6], "four",   5),
    ("slow-tide",         78, 52, False, [0, 3, 4, 3], "half",   6),
    ("copper-sky",       110, 44, True,  [0, 2, 5, 4], "back",   7),
    ("northern-wires",   128, 49, True,  [0, 5, 6, 4], "four",   8),
]
MAJOR = [0, 2, 4, 5, 7, 9, 11]
MINOR = [0, 2, 3, 5, 7, 8, 10]

def hz(midi): return 440.0 * 2 ** ((midi - 69) / 12)

def env(n, attack, release):
    e = np.ones(n)
    a = min(n, int(attack * SR)); r = min(n - a, int(release * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[n - r:] = np.linspace(1, 0, r)
    return e

def saw(f, t, detune=0.0):
    out = np.zeros_like(t)
    for d in (-detune, 0, detune):
        p = (t * f * (1 + d)) % 1.0
        out += 2 * p - 1
    return out / 3

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    # vectorized one-pole via lfilter-like recursion in chunks would be faster; numpy loop is fine at this length
    from itertools import accumulate
    y = np.fromiter(accumulate(x, lambda s, v: a * s + (1 - a) * v, initial=0.0), float, len(x) + 1)[1:]
    return y

def add(buf, start, sig):
    s = int(start * SR)
    if s >= len(buf): return
    sig = sig[: len(buf) - s]
    buf[s : s + len(sig)] += sig

def kick(rng):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9

def snare(rng):
    n = int(0.22 * SR); t = np.arange(n) / SR
    noise = np.diff(rng.standard_normal(n + 1))
    return (noise * 0.35 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 18) * 0.6

def hat(rng, open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    noise = np.diff(np.diff(rng.standard_normal(n + 2)))
    return noise * np.exp(-t * (14 if open_ else 70)) * 0.12

def make(bpm, root, minor, prog, style, seed):
    rng = np.random.default_rng(seed)
    scale = MINOR if minor else MAJOR
    beat = 60.0 / bpm; bar = beat * 4
    n = int(LENGTH * SR)
    drums, bass, pad, lead = (np.zeros(n) for _ in range(4))
    K, S = kick(rng), snare(rng)
    bars = int(LENGTH / bar) + 1
    for b in range(bars):
        t0 = b * bar
        degree = prog[b % len(prog)]
        chord_root = root + scale[degree % 7] + 12 * (degree // 7)
        triad = [chord_root + scale[(degree + k) % 7] - scale[degree % 7] + (12 if (degree + k) >= 7 else 0) for k in (0, 2, 4)]
        # drums
        for i in range(4):
            if style == "four" or (style == "back" and i in (0, 2)) or (style == "half" and i == 0):
                add(drums, t0 + i * beat, K)
            if (style != "half" and i in (1, 3)) or (style == "half" and i == 2):
                add(drums, t0 + i * beat, S)
        for i in range(8 if bpm < 100 else 16):
            step = bar / (8 if bpm < 100 else 16)
            add(drums, t0 + i * step, hat(rng, open_=(i % 8 == 6)) * (1.0 if i % 2 == 0 else 0.6))
        # bass: eighth notes on the chord root, an octave jump on the last
        for i in range(8):
            f = hz(chord_root - 12 + (12 if i == 7 else 0))
            m = int(beat / 2 * SR * 0.9); t = np.arange(m) / SR
            add(bass, t0 + i * beat / 2, saw(f, t, 0.003) * env(m, 0.005, 0.05) * 0.5)
        # pad: the chord, held for the bar
        m = int(bar * SR); t = np.arange(m) / SR
        chord = sum(saw(hz(note + 12), t, 0.006) for note in triad) / 3
        add(pad, t0, chord * env(m, 0.25, 0.4) * 0.35)
        # lead: from bar 2, notes from the chord and scale, rhythm from the seed
        if b >= 2:
            pos = 0.0
            while pos < 4 - 1e-6:
                length = rng.choice([0.5, 0.5, 1.0, 1.5, 0.25]) if pos + 0.25 < 4 else 0.25
                length = min(length, 4 - pos)
                if rng.random() > 0.2:
                    choices = triad + [chord_root + scale[(degree + 1) % 7] - scale[degree % 7], chord_root + scale[(degree + 5) % 7] - scale[degree % 7]]
                    note = int(rng.choice(choices)) + 24
                    m = int(length * beat * SR); t = np.arange(m) / SR
                    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)
                    ph = 2 * np.pi * np.cumsum(hz(note) * vib) / SR
                    tone = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
                    add(lead, t0 + pos * beat, tone * env(m, 0.02, 0.08) * 0.22)
                pos += length
    bass = lowpass(bass, 420)
    pad = lowpass(pad, 1800)
    mix = drums + bass * 0.9 + pad * 0.8 + lead
    # fade in/out
    fade = int(1.5 * SR); mix[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR)); mix[-fade:] *= np.linspace(1, 0, fade)
    mix /= np.max(np.abs(mix)) * 1.05
    left = mix + 0.03 * np.roll(lead, 400)
    right = mix + 0.03 * np.roll(pad, 600)
    stereo = np.stack([left, right], axis=1)
    stereo /= np.max(np.abs(stereo)) * 1.02
    return (stereo * 32767).astype(np.int16)

def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, bpm, root, minor, prog, style, seed in TRACKS:
        data = make(bpm, root, minor, prog, style, seed)
        with wave.open(os.path.join(out, f"{name}.wav"), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
        print(name)

if __name__ == "__main__":
    main()
