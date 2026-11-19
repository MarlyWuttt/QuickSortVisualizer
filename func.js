var N = 10,
  data = [],
  steps = [],
  pos = 0,
  timer = null;
var barsEl = document.getElementById("bars"),
  marksEl = document.getElementById("marks"),
  msgEl = document.getElementById("msg");
var nextBtn = document.getElementById("next"),
  autoBtn = document.getElementById("auto");

function newArray() {
  stopAuto();
  data = [];
  var pool = [];
  for (var v = 1; v <= N; v++) pool.push(v);
  while (pool.length)
    data.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  build();
  pos = 0;
  render(steps[0]);
  nextBtn.disabled = false;
  autoBtn.disabled = false;
}

function build() {
  var a = data.slice(),
    sorted = [],
    cmp = 0,
    swp = 0;
  steps = [];
  function snap(o) {
    steps.push({
      a: a.slice(),
      lo: o.lo,
      hi: o.hi,
      p: o.p,
      i: o.i,
      j: o.j,
      done: sorted.slice(),
      msg: o.msg,
      cmp: cmp,
      swp: swp,
    });
  }
  snap({
    lo: 0,
    hi: N - 1,
    p: -1,
    i: -1,
    j: -1,
    msg: "Press “Next step” to begin.",
  });
  function swap(x, y) {
    var t = a[x];
    a[x] = a[y];
    a[y] = t;
  }
  function qs(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      sorted.push(lo);
      snap({
        lo: lo,
        hi: hi,
        p: lo,
        i: lo - 1,
        j: -1,
        msg:
          "Only one bar is left here (" +
          a[lo] +
          "), so it is already in place.",
      });
      return;
    }
    var pv = a[hi],
      i = lo - 1;
    snap({
      lo: lo,
      hi: hi,
      p: hi,
      i: i,
      j: -1,
      msg: "Pick the last bar, " + pv + ", as the pivot.",
    });
    for (var j = lo; j < hi; j++) {
      cmp++;
      if (a[j] < pv) {
        i++;
        var moved = i !== j;
        if (moved) {
          swap(i, j);
          swp++;
        }
        snap({
          lo: lo,
          hi: hi,
          p: hi,
          i: i,
          j: j,
          msg:
            a[i] +
            " is smaller than " +
            pv +
            (moved
              ? ", so it swaps into the smaller side."
              : ", and it is already on the smaller side."),
        });
      } else {
        snap({
          lo: lo,
          hi: hi,
          p: hi,
          i: i,
          j: j,
          msg:
            a[j] +
            " is not smaller than " +
            pv +
            ", so it stays on the bigger side.",
        });
      }
    }
    swap(i + 1, hi);
    swp++;
    var p = i + 1;
    sorted.push(p);
    snap({
      lo: lo,
      hi: hi,
      p: p,
      i: i,
      j: -1,
      msg:
        "Place the pivot " +
        pv +
        " between the two sides. It is now in its final spot.",
    });
    qs(lo, p - 1);
    qs(p + 1, hi);
  }
  qs(0, N - 1);
  snap({
    lo: 0,
    hi: -1,
    p: -1,
    i: -1,
    j: -1,
    msg: "Sorted! Every bar is in its final place.",
  });
}

function render(s) {
  barsEl.innerHTML = "";
  marksEl.innerHTML = "";
  for (var k = 0; k < N; k++) {
    var b = document.createElement("div");
    var cls = "bar";
    if (s.done.indexOf(k) > -1) cls += " done";
    else if (k === s.p && s.hi >= s.lo) cls += " pivot";
    else if (k < s.lo || k > s.hi) cls += " dim";
    else if (k === s.j) cls += " scan";
    else if (k <= s.i) cls += " small";
    else if (s.j > -1 && k < s.j) cls += " big";
    b.className = cls;
    b.style.height = (s.a[k] / N) * 100 + "%";
    b.textContent = s.a[k];
    barsEl.appendChild(b);
    var m = document.createElement("span");
    m.textContent =
      k === s.p &&
      s.hi >= s.lo &&
      !(
        s.done.indexOf(k) > -1 &&
        s.j === -1 &&
        s.i >= s.lo - 1 &&
        s.msg.indexOf("Place") !== 0 &&
        s.msg.indexOf("Only") !== 0
      )
        ? "pivot"
        : k === s.j
          ? "j"
          : "";
    marksEl.appendChild(m);
  }
  msgEl.textContent = s.msg;
  document.getElementById("sSteps").textContent = pos;
  document.getElementById("sCmp").textContent = s.cmp;
  document.getElementById("sSwap").textContent = s.swp;
}

function step() {
  if (pos < steps.length - 1) {
    pos++;
    render(steps[pos]);
  }
  if (pos >= steps.length - 1) {
    stopAuto();
    nextBtn.disabled = true;
    autoBtn.disabled = true;
  }
}

function stopAuto() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  autoBtn.textContent = "Auto play";
}

function delay() {
  return 1100 - parseInt(document.getElementById("speed").value, 10) * 100;
}

function startAuto() {
  timer = setInterval(step, delay());
  autoBtn.textContent = "Pause";
}

nextBtn.onclick = function () {
  stopAuto();
  step();
};
autoBtn.onclick = function () {
  if (timer) stopAuto();
  else startAuto();
};
document.getElementById("reset").onclick = newArray;
document.getElementById("speed").oninput = function () {
  if (timer) {
    stopAuto();
    startAuto();
  }
};

newArray();
