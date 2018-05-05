function tmpFromModel(va, model, material) {
  const v = [];
  //const vn = [];
  const f = [];

  const tmpScale = 4;

  let currentMaterial = "def";

  model = model.split("\n");
  for (let i in model) {
    const line = model[i].split(" ");
    switch (line[0]) {
      case "v":
        v.push(
          vec3.fromValues(
            parseFloat(line[1]) * tmpScale,
            parseFloat(line[2]) * tmpScale,
            parseFloat(line[3]) * tmpScale
          )
        );
        break;
      case "usemtl":
        currentMaterial = line[1];
        break;
      /*case "vn":
        vn.push(
          vec3.fromValues(
            parseFloat(line[1]),
            parseFloat(line[2]),
            parseFloat(line[3])
          )
        );
        break;*/
      case "f":
        const tmp = line.slice(1).map(a => a.split("/").map(a => parseInt(a)));
        f.push([currentMaterial, tmp]);
        break;
      default:
    }
  }

  const materials = tmpFromMaterial(material);

  for (let i in f) {
    console.log(f[i]);
    const p = f[i][1].map(a => v[a[0] - 1]);
    console.log(p);
    if (p.length == 3) va.addTriangle(...p, materials[f[i][0]]);
    if (p.length == 4) va.addQuadrilateral(...p, materials[f[i][0]]);
    //TODO obj kan bruke fler enn 4 vert i f
  }
}

function tmpFromMaterial(material) {
  const materials = { def: vec3.fromValues(1, 0, 0.5) };

  let currentMaterial = "def";

  material = material.split("\n");
  for (let i in material) {
    const line = material[i].split(" ").filter(a => a != "");
    switch (line[0]) {
      case "newmtl":
        currentMaterial = line[1];
        break;
      case "Kd":
        materials[currentMaterial] = vec3.fromValues(
          parseFloat(line[1]),
          parseFloat(line[2]),
          parseFloat(line[3])
        );
        break;
      default:
    }
  }
  return materials;
}
