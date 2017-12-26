function tmpFromModel(va, model) {
  const v = [];
  const vn = [];
  const f = [];
  const tmpColor = vec3.fromValues(1, 0.8, 0.8);

  model = model.split("\n");
  for (let i in model) {
    const line = model[i].split(" ");
    switch (line[0]) {
      case "v":
        v.push(
          vec3.fromValues(
            parseFloat(line[1]),
            parseFloat(line[2]),
            parseFloat(line[3])
          )
        );
        break;
      case "vn":
        vn.push(
          vec3.fromValues(
            parseFloat(line[1]),
            parseFloat(line[2]),
            parseFloat(line[3])
          )
        );
        break;
      case "f":
        const tmp = line.slice(1).map(a => a.split("/").map(a => parseInt(a)));
        f.push(tmp);
        break;
      default:
    }
  }
  for (let i in f) {
    console.log(f[i]);
    const p = f[i].map(a => v[a[0] - 1]);
    console.log(p);
    if (p.length == 3) va.addTriangle(...p);
    if (p.length == 4) va.addQuadrilateral(...p);
  }
}
