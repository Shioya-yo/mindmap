const svg = document.getElementById("canvas");

// ノード一覧
let nodes = [
  { id: 1, x: 200, y: 200, text: "メイン", parent: null }
];

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

  const rect = createSvg("rect");
  rect.setAttribute("width", 120);
  rect.setAttribute("height", 40);
  rect.setAttribute("rx", 12);
  rect.setAttribute("fill", "#fff");
  rect.setAttribute("stroke", "#333");
  rect.setAttribute("stroke-width", 2);

  const text = createSvg("text");
  text.setAttribute("x", 10);
  text.setAttribute("y", 25);
  text.textContent = node.text;

  // ＋ボタン
  const plus = createSvg("text");
  plus.setAttribute("x", 130);
  plus.setAttribute("y", 25);
  plus.setAttribute("font-size", "20");
  plus.style.cursor = "pointer";
  plus.textContent = "+";

  plus.addEventListener("click", () => addChild(node));

  g.appendChild(rect);
  g.appendChild(text);
  g.appendChild(plus);
  svg.appendChild(g);
}

// 子ノード追加（避けるロジック）
function addChild(parent) {
  const children = nodes.filter(n => n.parent === parent.id);

  // 子ノードの数に応じて縦にずらす
  const offset = (children.length - 1) * 60;

  const newNode = {
    id: Date.now(),
    x: parent.x + 180,
    y: parent.y + offset,
    text: "子ノード",
    parent: parent.id
  };

  nodes.push(newNode);
  draw();
}

// 線（ベジェ曲線）
function drawLink(parentId, childId) {
  const parent = nodes.find(n => n.id === parentId);
  const child = nodes.find(n => n.id === childId);

  const x1 = parent.x + 120;
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

// SVG 要素作成ヘルパー
function createSvg(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

draw();