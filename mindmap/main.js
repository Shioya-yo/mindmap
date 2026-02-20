const svg = document.getElementById("canvas");

// ノード一覧（最初のノードは空のテキスト）
let nodes = [
  { id: 1, x: 200, y: 200, text: "", parent: null }
];

let draggingNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let editingNode = null; // 編集中ノード

function draw() {
  svg.innerHTML = "";

  // 1. 線を描く
  nodes.forEach(node => {
    if (node.parent !== null) drawLink(node.parent, node.id);
  });

  // 2. ノードを描く
  nodes.forEach(node => drawNode(node));
}

function drawNode(node) {
  const g = createSvg("g");
  g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
  g.style.cursor = "grab";

  // ノード本体
  const rect = createSvg("rect");
  rect.setAttribute("width", 140);
  rect.setAttribute("height", 40);
  rect.setAttribute("rx", 12);
  rect.setAttribute("fill", "#fff");
  rect.setAttribute("stroke", "#333");
  rect.setAttribute("stroke-width", 2);

  // テキスト（プレースホルダー対応）
  const text = createSvg("text");
  text.setAttribute("x", 10);
  text.setAttribute("y", 25);

  if (node.text === "") {
    text.textContent = "ここに入力";
    text.setAttribute("fill", "#aaa");
    text.setAttribute("font-style", "italic");
  } else {
    text.textContent = node.text;
    text.setAttribute("fill", "#000");
  }

  // ＋ボタン（hover で表示）
  const plus = createSvg("text");
  plus.setAttribute("x", 150);
  plus.setAttribute("y", 25);
  plus.setAttribute("font-size", "20");
  plus.style.cursor = "pointer";
  plus.style.opacity = 0;
  plus.style.transition = "0.2s";
  plus.textContent = "+";

  plus.addEventListener("click", e => {
    e.stopPropagation();
    addChild(node);
  });

  // hover で＋表示
  g.addEventListener("mouseenter", () => plus.style.opacity = 1);
  g.addEventListener("mouseleave", () => plus.style.opacity = 0);

  // ダブルクリックで編集
  g.addEventListener("dblclick", e => {
    e.stopPropagation();
    startEditing(node);
  });

  // ドラッグ開始
  g.addEventListener("pointerdown", e => {
    draggingNode = node;
    dragOffsetX = e.clientX - node.x;
    dragOffsetY = e.clientY - node.y;
    g.style.cursor = "grabbing";
  });

  g.appendChild(rect);
  g.appendChild(text);
  g.appendChild(plus);
  svg.appendChild(g);
}

// SVG 全体でドラッグ処理
svg.addEventListener("pointermove", e => {
  if (!draggingNode) return;
  draggingNode.x = e.clientX - dragOffsetX;
  draggingNode.y = e.clientY - dragOffsetY;
  draw();
});

svg.addEventListener("pointerup", () => {
  draggingNode = null;
});

// 子ノード追加（自由記載 & 避けるロジック）
function addChild(parent) {
  const children = nodes.filter(n => n.parent === parent.id);
  const offset = (children.length - 1) * 60;

  const newNode = {
    id: Date.now(),
    x: parent.x + 200,
    y: parent.y + offset,
    text: "",        // ← 初期テキストなし
    parent: parent.id
  };

  nodes.push(newNode);
  draw();
  startEditing(newNode);  // ← 追加直後に編集モード
}

// 線（ベジェ曲線）
function drawLink(parentId, childId) {
  const parent = nodes.find(n => n.id === parentId);
  const child = nodes.find(n => n.id === childId);

  const x1 = parent.x + 140;
  const y1 = parent.y + 20;

  const x2 = child.x;
  const y2 = child.y + 20;

  const path = createSvg("path");
  path.setAttribute("d", `
    M ${x1} ${y1}
    C ${(x1 + x2) / 2} ${y1},
      ${(x1 + x2) / 2} ${y2},
      ${x2} ${y2}
  `);
  path.setAttribute("stroke", "#888");
  path.setAttribute("stroke-width", 2);
  path.setAttribute("fill", "none");

  svg.appendChild(path);
}

// ノード編集モード
function startEditing(node) {
  if (editingNode) return;

  editingNode = node;

  const input = document.createElement("input");
  input.value = node.text;
  input.style.position = "absolute";
  input.style.left = node.x + "px";
  input.style.top = node.y + "px";
  input.style.width = "140px";
  input.style.height = "40px";
  input.style.fontSize = "16px";

  document.body.appendChild(input);
  input.focus();

  // Enter で確定 / Esc でキャンセル
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      node.text = input.value;
      finishEditing(input);
    }
    if (e.key === "Escape") {
      finishEditing(input);
    }
  });
}

function finishEditing(input) {
  document.body.removeChild(input);
  editingNode = null;
  draw();
}

// SVG 要素作成ヘルパー
function createSvg(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

draw();
