// Generated ambient space drone. Sound is on by default; browsers only allow
// audio to start after a user gesture, so the first interaction starts it.
export function createSound() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let on = true;

  function build() {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.connect(master);
    master.connect(ctx.destination);
    [55, 82.6, 110.4, 164.2].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      osc.type = i % 2 ? "triangle" : "sine";
      osc.frequency.value = freq;
      const gain = ctx!.createGain();
      gain.gain.value = 0.05 / (i + 1);
      const lfo = ctx!.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const depth = ctx!.createGain();
      depth.gain.value = 0.02 / (i + 1);
      lfo.connect(depth).connect(gain.gain);
      osc.connect(gain).connect(filter);
      osc.start();
      lfo.start();
    });
  }

  function apply() {
    if (on && !ctx) build();
    if (!ctx || !master) return;
    ctx.resume();
    master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.6);
  }

  return {
    isOn: () => on,
    set(next: boolean) {
      on = next;
      apply();
    },
    unlock: apply,
    dispose() {
      ctx?.close();
      ctx = null;
    },
  };
}
