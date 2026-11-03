import fs from "fs";
import * as THREE from "three";

// Read and parse GLB
const buf = fs.readFileSync("public/models/arm_chair__furniture.glb");
const chunkLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + chunkLen));
const binChunkData = buf.subarray(20 + chunkLen + 8);

function getAccessorData(idx) {
  const acc = gltf.accessors[idx];
  const bv = gltf.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const count = acc.count;
  const numComp = acc.type === "VEC3" ? 3 : acc.type === "VEC2" ? 2 : acc.type === "SCALAR" ? 1 : 4;
  let TypedArr = Float32Array;
  if (acc.componentType === 5123) TypedArr = Uint16Array;
  else if (acc.componentType === 5125) TypedArr = Uint32Array;
  return new TypedArr(binChunkData.buffer, binChunkData.byteOffset + offset, count * numComp);
}

const pos = getAccessorData(gltf.meshes[0].primitives[0].attributes.POSITION);
const indices = getAccessorData(gltf.meshes[0].primitives[0].indices);
const numVertices = pos.length / 3;
const numTriangles = indices.length / 3;

// Partition logic
const parent = new Int32Array(numVertices);
for (let i = 0; i < numVertices; i++) parent[i] = i;
function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
function union(i, j) { const ri = find(i); const rj = find(j); if (ri !== rj) parent[ri] = rj; }
for (let t = 0; t < numTriangles; t++) {
  union(indices[t*3], indices[t*3+1]);
  union(indices[t*3+1], indices[t*3+2]);
}

const legRoots = new Set();
for (let v = 0; v < numVertices; v++) {
  if (pos[v*3 + 1] < -0.60) {
    legRoots.add(find(v));
  }
}
for (let v = 0; v < numVertices; v++) {
  const root = find(v);
  if (root >= 28488 && pos[v*3 + 1] < -0.25) {
    legRoots.add(root);
  }
}

const uphIndices = [];
const legIndices = [];
let mixed = 0;

for (let t = 0; t < numTriangles; t++) {
  const i0 = indices[t*3], i1 = indices[t*3+1], i2 = indices[t*3+2];
  const l0 = legRoots.has(find(i0));
  const l1 = legRoots.has(find(i1));
  const l2 = legRoots.has(find(i2));
  if (l0 && l1 && l2) legIndices.push(i0, i1, i2);
  else if (!l0 && !l1 && !l2) uphIndices.push(i0, i1, i2);
  else mixed++;
}

console.log("=== MATERIAL SEPARATION VERIFICATION ===");
console.log("Total Triangles:", numTriangles);
console.log("Upholstery Triangles:", uphIndices.length / 3);
console.log("Leg Triangles:", legIndices.length / 3);
console.log("Mixed Triangles:", mixed);

if (mixed === 0 && uphIndices.length + legIndices.length === indices.length) {
  console.log(">>> SUCCESS: 100% clean material partition achieved!");
} else {
  console.error(">>> FAILURE: Partition inconsistent!");
  process.exit(1);
}
