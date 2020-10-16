const cacheCanvas = document.getElementById('cache-canvas');
const canvas = document.getElementById('main-canvas');
const cacheCtx = cacheCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

const __bounds = {};
const __dpr = window.devicePixelRatio || 1;
let __nodePaths = [];
let __shouldDraw = true;
let __isDrawing = false;
const EPSILON = 0.0001;


const pathFunctions = {
  spider: function (startX, startY, endX, endY, distance) {
    return [
    startX,
    startY,
    startX + (Math.random() * 2 - 1) * distance,
    startY + (Math.random() * 2 - 1) * distance,
    endX + (Math.random() * 2 - 1) * distance,
    endY + (Math.random() * 2 - 1) * distance,
    endX,
    endY];

  },

  techy: function (startX, startY, endX, endY, distance) {
    const diffX = endX - startX;
    const diffY = endY - startY;
    const angle = Math.atan2(diffY, -diffX) + Math.PI * 1.25;

    const ret = [startX, startY,,, endX, endY];

    //if above or below point
    if (angle % Math.PI < Math.PI / 2) {
      if (Math.random() > 0.5) {
        ret[2] = endX - Math.abs(diffY) * Math.sign(diffX);
        ret[3] = startY;
      } else
      {
        ret[2] = startX + Math.abs(diffY) * Math.sign(diffX);
        ret[3] = endY;
      }
    }

    //if left or right of point
    else {
        if (Math.random() > 0.5) {
          ret[2] = startX;
          ret[3] = endY - Math.abs(diffX) * Math.sign(diffY);
        } else
        {
          ret[2] = endX;
          ret[3] = startY + Math.abs(diffX) * Math.sign(diffY);
        }
      }

    return ret;
  } };


const spring = {
  k: -8.5,
  b: -61 };


const settings = {
  grid: 100,
  pathFunction: pathFunctions['techy'] };


const tm = 200;
let tv = 0;
let tt = 0;
let ta = 0;
let t = 0.5;

function draw() {
  ctx.clearRect(__bounds.left, __bounds.top, __bounds.width, __bounds.height);
  let pt0, pt1;

  ctx.beginPath();
  const len = __nodePaths.length;
  for (let i = 0; i < len; i++) {
    plotPolyline(
    __nodePaths[i],
    clamp(t - 0.1, 0, 0.9999999),
    clamp(t + 0.1, 0, 0.9999999));

  }
  ctx.stroke();

  for (let i = 0; i < len; i++) {
    const p = __nodePaths[i];
    const ptsLen = p.length;
    ctx.beginPath();
    ctx.arc(
    p[0],
    p[1],
    Math.max(0, t * 10),
    0,
    Math.PI * 2);

    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
    p[ptsLen - 2],
    p[ptsLen - 1],
    Math.max(0, t * 10),
    0,
    Math.PI * 2);

    ctx.closePath();
    ctx.fill();
  }
}

function loop() {
  requestAnimationFrame(loop);
  tv = tv + (spring.k * (t - tt) + spring.b * tv) / tm;
  if (Math.abs(tv) > EPSILON) {
    // if (t > 0.999999) tv *= -1;
    t = clamp(t + tv, 0, 0.999999);
    draw();
  }
}

function drawLines() {
  cacheCtx.clearRect(__bounds.left, __bounds.top, __bounds.width, __bounds.height);
  cacheCtx.beginPath();
  Array.prototype.forEach.call(__nodePaths, function (np) {
    cacheCtx.moveTo(np[0], np[1]);
    for (let i = 2, ii = np.length; i < ii; i += 2) {
      cacheCtx.lineTo(np[i], np[i + 1]);
    }
  });
  cacheCtx.stroke();
}

function plotPolyline(polyline, t1 = 0, t2 = 0.9999999) {
  const p0 = lerpPolyline(polyline, t1);
  ctx.moveTo(p0[0], p0[1]);

  let pt, elbow;
  for (let i = 0, ii = polyline.length; i < ii; i += 2) {
    for (let n = 1, nn = ii / 2; n < nn; n++) {
      let nt = n / (nn - 1);
      if (nt > t1 && nt < t2) {
        elbow = lerpPolyline(polyline, nt);
        ctx.lineTo(elbow[0], elbow[1]);
      } else {
        break;
      }
    }

    pt = lerpPolyline(polyline, t2);;
    ctx.lineTo(pt[0], pt[1]);
  }
}

function getDoNTimesHandler(fn, n, delay) {
  return function handler() {
    fn(arguments);
    if (n-- > 1) {
      window.setTimeout(function () {
        handler(arguments);
      }, delay);
    }
  };
}

function quantize(n, resolution) {
  return Math.floor(n / resolution) * resolution;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function lerp(x0, y0, x1, y1, t) {
  return [
  x0 + (x1 - x0) * t,
  y0 + (y1 - y0) * t];

}

function lerpPolyline(polyline, t) {
  if (t % 1 === 0) return [polyline[t % 1], polyline[t % 1 + 1]];
  const n = polyline.length / 2 - 1;
  const firstPt = t * n | 0;
  return lerp(
  polyline[firstPt * 2],
  polyline[firstPt * 2 + 1],
  polyline[firstPt * 2 + 2],
  polyline[firstPt * 2 + 3],
  t * n - firstPt);

}

function createNodePaths(n, startX, startY, endX, endY, pathFn, gridSize) {
  const paths = new Array(n);

  const dist = Math.sqrt(Math.pow(endY - startY, 2) + Math.pow(endX - startX, 2)) / 2;
  for (let i = 0; i < n; i++) {
    paths[i] = pathFn(
    startX || quantize(Math.random() * __bounds.width, gridSize) + gridSize / 2,
    startY || quantize(Math.random() * __bounds.height, gridSize) + gridSize / 2,
    endX || quantize(Math.random() * __bounds.width, gridSize) + gridSize / 2,
    endY || quantize(Math.random() * __bounds.height, gridSize) + gridSize / 2,
    dist);

  }

  return paths;
}


let tempRect;
function handleResize() {
  tempRect = canvas.getBoundingClientRect();
  __bounds.left = tempRect.left;
  __bounds.top = tempRect.top;
  __bounds.right = tempRect.right;
  __bounds.bottom = tempRect.bottom;
  __bounds.width = tempRect.width;
  __bounds.height = tempRect.height;

  canvas.width = __bounds.width;
  canvas.height = __bounds.height;
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#32E4B0';
  ctx.fillStyle = '#32E4B0';

  cacheCanvas.width = __bounds.width;
  cacheCanvas.height = __bounds.height;
  cacheCtx.lineWidth = 2;
  cacheCtx.strokeStyle = 'rgba(0,0,0,0.2)';

  __nodePaths = createNodePaths(
  Math.floor(__bounds.width * __bounds.height / 50000 * __dpr),
  null, null, null, null,
  settings.pathFunction,
  settings.grid / __dpr);

  drawLines();

  __shouldDraw = true;
  t = 0;
  tt = 1;
}


let __lastX = Math.random() * __bounds.width;
let __lastY = Math.random() * __bounds.height;

function animateNodes(startX, startY, endX, endY) {
  __shouldDraw = true;
  __nodePaths = createNodePaths(
  Math.floor(__bounds.width * __bounds.height / 50000 * __dpr),
  startX,
  startY,
  null,
  null,
  settings.pathFunction,
  settings.grid / __dpr);


  // __nodePaths = createNodePaths(
  //   Math.floor(__bounds.width * __bounds.height / 50000),
  //   null, null, null, null,
  //   __pathFunctions['techy']
  // );

  drawLines();

  __lastX = startX;
  __lastY = startY;
  t = 0;
  tt = 1;
}

function handleClick(e) {
  animateNodes(e.pageX, e.pageY);
}

function handleTouch(e) {
  const touch = e.touches[0];
  animateNodes(touch.pageX, touch.pageY);
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  tt = touch.pageX / __bounds.width;
}

function handleFunctionChange() {
  handleResize();
}

function handlePageLoad() {
  handleResize();
  loop();
  const gui = new dat.GUI();
  gui.add(spring, 'k', -30, 0).name('springiness');
  gui.add(spring, 'b', -100, 0).name('stiffness');
  gui.add(settings, 'grid', 0, 200);
  const n = gui.add(settings, 'pathFunction', pathFunctions);
  n.__onChange = handleFunctionChange;

  var h = getDoNTimesHandler(function () {
    animateNodes();
  }, 5, 500);
  h();
}

function handleMouseMove(e) {
  tt = e.pageX / __bounds.width;
}

function init() {
  window.addEventListener('resize', handleResize);
  document.body.addEventListener('mousedown', handleClick);
  document.body.addEventListener('touchstart', handleClick);
  document.body.addEventListener('touchmove', handleTouchMove);
  document.body.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('keydown', handleClick);
  document.addEventListener('DOMContentLoaded', handlePageLoad);
}

init();
