// Speed readout and speed run, as every House Party toy has them (lib/hp-perf.js).
// Readout: the Speed readout switch, F, or #fps on the address. Speed run: the Record a speed run button, or
// #perfrun on the address. The run plays the game hands off for 40 seconds (veggies, slices, combos, Frenzy
// mode), logs one row a second, then puts the game back and shows a report to copy or save. Nothing is sent.
import { createPerf } from "../lib/hp-perf.js";

function wire(game) {
  var stage = game.stage;
  var gameLoop = game.gameLoop;
  var perf = createPerf({
    toy: "veggie-knight",
    info: function () {
      return { loop: "setInterval every 20 ms, so 50 pictures a second at most" };
    },
  });

  // The game draws on a timer, not on animation frames, so time each draw here.
  var draw = stage.draw;
  var last = null;
  stage.draw = function () {
    var t0 = performance.now();
    draw.apply(this, arguments);
    if (last != null) perf.frame(t0 - last, performance.now() - t0);
    last = t0;
  };
  gameLoop.on("stop", function () {
    last = null;
  });

  function sliceAll() {
    stage.veggies
      .filter(function (v) {
        return v.whole;
      })
      .forEach(function (v) {
        stage.splitVeggie(v);
      });
  }
  function combo() {
    var whole = stage.veggies.filter(function (v) {
      return v.whole;
    });
    sliceAll();
    stage.notices.push(new ComboNotice(Math.max(3, whole.length), stage.getWidth() / 2, stage.getHeight() / 2));
  }

  function spec() {
    var wasRunning = gameLoop.isRunning();
    var wasMode = game.getMode();
    if (!wasRunning) gameLoop.start();
    return {
      seconds: 40,
      steps: [
        { at: 2, mark: "normal mode", run: function () { game.toMode(game.normalMode); } },
        { at: 6, mark: "slice everything", run: sliceAll },
        { at: 9, mark: "slice everything", run: sliceAll },
        { at: 12, mark: "frenzy mode", run: function () { game.toMode(game.frenzyMode); } },
        { at: 16, mark: "combo", run: combo },
        { at: 19, mark: "slice everything", run: sliceAll },
        { at: 22, mark: "frenzy again", run: function () { game.toMode(game.frenzyMode); } },
        { at: 25, mark: "combo", run: combo },
        { at: 28, mark: "normal mode", run: function () { game.toMode(game.normalMode); } },
        { at: 33, mark: "slice everything", run: sliceAll },
        { at: 37, mark: "combo", run: combo },
      ],
      done: function () {
        game.toMode(wasMode);
        if (!wasRunning) gameLoop.stop();
      },
    };
  }

  perf.mountControls(document.getElementById("speedControls"), { spec: spec });
  if (/#perfrun\b/.test(location.hash)) perf.autorun(spec());
}

if (window.veggieKnight) wire(window.veggieKnight);
else
  document.addEventListener("veggieknight:ready", function (e) {
    wire(e.detail);
  });
