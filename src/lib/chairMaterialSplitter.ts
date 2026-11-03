import * as THREE from "three";

/**
 * Splits the single monolithic chair mesh geometry into two separate material groups:
 * Group 0: Upholstery (seat cushion, backrest, shell, armrests)
 * Group 1: Wooden Legs & undercarriage frame
 *
 * This allows tinting or recoloring the upholstery while preserving the wooden legs'
 * natural grain and texture 100% unaltered.
 */
export function splitChairGeometryMaterials(mesh: THREE.Mesh): {
  upholsteryMaterial: THREE.MeshStandardMaterial;
  legsMaterial: THREE.MeshStandardMaterial;
} {
  const geometry = mesh.geometry;
  const indicesAttr = geometry.index;
  if (!indicesAttr) {
    throw new Error("[Furnix] Chair mesh has no index attribute");
  }

  const posAttr = geometry.attributes.position;
  const numVertices = posAttr.count;
  const indices = indicesAttr.array;
  const numTriangles = indices.length / 3;

  // Disjoint-set data structure to find connected mesh components
  const parent = new Int32Array(numVertices);
  for (let i = 0; i < numVertices; i++) parent[i] = i;

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }

  function union(i: number, j: number) {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  }

  for (let t = 0; t < numTriangles; t++) {
    union(indices[t * 3], indices[t * 3 + 1]);
    union(indices[t * 3 + 1], indices[t * 3 + 2]);
  }

  // Detect leg components based on model geometry:
  // Leg tips touch the ground at y ~ -0.946
  const legRoots = new Set<number>();
  for (let v = 0; v < numVertices; v++) {
    if (posAttr.getY(v) < -0.60) {
      legRoots.add(find(v));
    }
  }

  // Include wooden crossrails connecting the legs beneath the seat (y < -0.25)
  for (let v = 0; v < numVertices; v++) {
    const root = find(v);
    if (root >= 28488 && posAttr.getY(v) < -0.25) {
      legRoots.add(root);
    }
  }

  const uphIndices: number[] = [];
  const legIndices: number[] = [];

  for (let t = 0; t < numTriangles; t++) {
    const i0 = indices[t * 3];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];

    if (legRoots.has(find(i0))) {
      legIndices.push(i0, i1, i2);
    } else {
      uphIndices.push(i0, i1, i2);
    }
  }

  // Reorder index buffer into two continuous groups
  const IndexConstructor = indices.constructor as new (length: number) =>
    | Uint16Array
    | Uint32Array;
  const newIndices = new IndexConstructor(indices.length);
  newIndices.set(uphIndices, 0);
  newIndices.set(legIndices, uphIndices.length);

  geometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
  geometry.clearGroups();
  geometry.addGroup(0, uphIndices.length, 0); // Material Index 0: Upholstery
  geometry.addGroup(uphIndices.length, legIndices.length, 1); // Material Index 1: Wooden Legs

  const originalMat = (
    Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  ) as THREE.MeshStandardMaterial;

  const upholsteryMaterial = originalMat.clone();
  const legsMaterial = originalMat.clone();

  // Natural wood appearance preserved 100% on legs with original scan texture
  legsMaterial.color = new THREE.Color("#FFFFFF");

  // Dielectric fabric material configuration:
  // Wool / upholstery cloth is a non-metallic dielectric (metalness: 0.0).
  // The raw photogrammetry scan GLB defaulted to metalness: 1.0, which absorbed diffuse light
  // and turned yellows into dark brownish mustard. Setting metalness to 0.0 and roughness to 0.75
  // enables soft, radiant, true-to-life light scattering matching the user's reference.
  upholsteryMaterial.metalness = 0.0;
  upholsteryMaterial.roughness = 0.75;

  // Create grayscale texture for upholstery to preserve 100% fabric weave, UVs, normal maps,
  // and micro-shadows while allowing pure, unpolluted tinting for Yellow, Sage Green, and Neutral Grey.
  if (originalMat.map) {
    upholsteryMaterial.map = createGrayscaleTexture(originalMat.map);
  }
  upholsteryMaterial.color = new THREE.Color("#FFB800");
  upholsteryMaterial.needsUpdate = true;
  upholsteryMaterial.customProgramCacheKey = () => "furnix-upholstery-v5";

  mesh.material = [upholsteryMaterial, legsMaterial];

  return { upholsteryMaterial, legsMaterial };
}

/**
 * Creates a desaturated, gamma-lifted grayscale clone of the fabric texture map.
 * This removes dark undertones from the raw photogrammetry scan while preserving every microscopic
 * fabric thread, weave, wrinkling, and ambient shading.
 */
function createGrayscaleTexture(sourceTexture: THREE.Texture): THREE.Texture {
  if (typeof document === "undefined" || !sourceTexture.image) {
    return sourceTexture.clone();
  }
  try {
    const img = sourceTexture.image as CanvasImageSource & {
      width?: number;
      height?: number;
    };
    const canvas = document.createElement("canvas");
    canvas.width = (img.width as number) || 2048;
    canvas.height = (img.height as number) || 2048;
    const ctx = canvas.getContext("2d");
    if (!ctx) return sourceTexture.clone();

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      // Rec. 709 luminance
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      // Gamma lift curves midtones from ~0.42 up to ~0.78 while preserving weave micro-contrast
      const boosted = Math.min(255, Math.pow(lum / 255, 0.6) * 255 * 1.35);
      d[i] = boosted;
      d[i + 1] = boosted;
      d[i + 2] = boosted;
    }
    ctx.putImageData(imgData, 0, 0);

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.flipY = sourceTexture.flipY;
    canvasTexture.generateMipmaps = true;
    canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;
    canvasTexture.wrapS = sourceTexture.wrapS;
    canvasTexture.wrapT = sourceTexture.wrapT;
    canvasTexture.repeat.copy(sourceTexture.repeat);
    canvasTexture.offset.copy(sourceTexture.offset);
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  } catch (err) {
    console.warn("[Furnix] Failed to create grayscale upholstery texture:", err);
    return sourceTexture.clone();
  }
}
