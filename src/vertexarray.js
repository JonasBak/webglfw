const vertexStruct = {
  props: {
    vertexPosition: vec3.create(),
    vertexColor: vec3.create(),
    vertexNormal: vec3.create()
  },
  types: {},
  normalize: {},
  numComp: 0,
  size: 0
};

for (let key in vertexStruct.props) {
  vertexStruct.numComp += vertexStruct.props[key].length;
  vertexStruct.size += vertexStruct.props[key].byteLength;
}

let inited = false;

class VertexArray {
  constructor(gl, shaders) {
    this.vbo = gl.createBuffer();

    //console.log(this.vbo);

    this.vertexArray = [];
    this.needBuffer = true;

    this.rotation = 0;
    this.translation = vec3.fromValues(0, 0, 0);
    this.rotAxis = vec3.fromValues(0.5, 1, 0);
    this.modelViewMatrix = mat4.create();
    this.modelRotationMatrix = mat4.create();

    this.attrib(gl, shaders);

    this.drawMode = gl.TRIANGLES;
  }

  attrib(gl, shaders) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    let offset = 0;
    for (let key in vertexStruct.props) {
      //console.log(key, shaders.programInfo.attribLocations[key]);

      gl.vertexAttribPointer(
        shaders.programInfo.attribLocations[key],
        vertexStruct.props[key].length,
        vertexStruct.types[key] || gl.FLOAT,
        vertexStruct.normalize[key] || false,
        vertexStruct.size,
        offset
      );
      gl.enableVertexAttribArray(shaders.programInfo.attribLocations[key]);

      offset += vertexStruct.props[key].byteLength;
    }
  }

  updateMatrix() {
    this.modelViewMatrix = mat4.create();
    mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.rotation,
      this.rotAxis
    );
    mat4.translate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.translation
    );
    this.modelRotationMatrix = mat4.identity(mat4.create());
    mat4.rotate(
      this.modelRotationMatrix,
      this.modelRotationMatrix,
      this.rotation,
      this.rotAxis
    );
  }

  addVertex(vertex) {
    this.makeVertex(vertex.position, vertex.normal, vertex.color);
  }

  getVertex(index) {
    const i = index * vertexStruct.numComp;

    return this.vertexArray.slice(i, i + 3);
  }

  makeVertex(position, color, normal) {
    if (
      position.length != vertexStruct.props.vertexPosition.length ||
      color.length != vertexStruct.props.vertexColor.length ||
      normal.length != vertexStruct.props.vertexNormal.length
    )
      throw "illegal argument";
    this.needBuffer = true;
    vec3.normalize(normal, normal);
    this.vertexArray.push(...position, ...color, ...normal);
  }

  changePosition(index, position) {
    const i = index * vertexStruct.numComp;

    this.vertexArray[i] = position[i];
    this.vertexArray[i + 1] = position[i + 1];
    this.vertexArray[i + 2] = position[i + 2];

    this.needBuffer = true;
  }

  addTriangle(p0, p1, p2, color = vec3.fromValues(1, 0, 1), normal = null) {
    normal =
      normal ||
      vec3.cross(
        vec3.create(),
        vec3.sub(vec3.create(), p1, p0),
        vec3.sub(vec3.create(), p2, p0)
      );
    this.makeVertex(p0, color, normal);
    this.makeVertex(p1, color, normal);
    this.makeVertex(p2, color, normal);
  }

  addQuadrilateral(p0, p1, p2, p3, color = vec3.fromValues(1, 0, 1)) {
    this.addTriangle(p0, p1, p2, color);
    this.addTriangle(p2, p3, p0, color);
  }

  addBox(p000, span, color = vec3.fromValues(1, 0, 1)) {
    const x0 = p000[0];
    const x1 = p000[0] + span[0];
    const y0 = p000[1];
    const y1 = p000[1] + span[1];
    const z0 = p000[2];
    const z1 = p000[2] + span[2];

    const p001 = vec3.fromValues(x0, y0, z1);
    const p010 = vec3.fromValues(x0, y1, z0);
    const p011 = vec3.fromValues(x0, y1, z1);

    const p100 = vec3.fromValues(x1, y0, z0);
    const p101 = vec3.fromValues(x1, y0, z1);
    const p110 = vec3.fromValues(x1, y1, z0);
    const p111 = vec3.fromValues(x1, y1, z1);

    this.addQuadrilateral(p000, p001, p011, p010, color);
    this.addQuadrilateral(p110, p111, p101, p100, color);

    this.addQuadrilateral(p000, p010, p110, p100, color);
    this.addQuadrilateral(p101, p111, p011, p001, color);

    this.addQuadrilateral(p000, p100, p101, p001, color);
    this.addQuadrilateral(p011, p111, p110, p010, color);
  }

  addSphere(radius, center = vec3.create(), cir = 100, hei = 50) {
    //TODO: mer effektiv
    //TODO: legg til tilfelle hvor man er på toppen/bunner for å spare 2 * cir trekanter
    for (let h = 0; h < hei; h++) {
      for (let c = 0; c < cir; c++) {
        //Radius i x og z
        const y0 = radius * Math.cos(Math.PI * h / hei);
        const r0 = radius * Math.sin(Math.PI * h / hei);
        const [x00, z00] = [
          r0 * Math.cos(2 * Math.PI * c / cir),
          r0 * Math.sin(2 * Math.PI * c / cir)
        ];
        const [x01, z01] = [
          r0 * Math.cos(2 * Math.PI * (c + 1) / cir),
          r0 * Math.sin(2 * Math.PI * (c + 1) / cir)
        ];

        const y1 = radius * Math.cos(Math.PI * (h + 1) / hei);
        const r1 = radius * Math.sin(Math.PI * (h + 1) / hei);
        const [x10, z10] = [
          r1 * Math.cos(2 * Math.PI * c / cir),
          r1 * Math.sin(2 * Math.PI * c / cir)
        ];
        const [x11, z11] = [
          r1 * Math.cos(2 * Math.PI * (c + 1) / cir),
          r1 * Math.sin(2 * Math.PI * (c + 1) / cir)
        ];

        const p0 = vec3.fromValues(
          center[0] + x00,
          center[1] + y0,
          center[2] + z00
        );
        const p1 = vec3.fromValues(
          center[0] + x01,
          center[1] + y0,
          center[2] + z01
        );
        const p2 = vec3.fromValues(
          center[0] + x11,
          center[1] + y1,
          center[2] + z11
        );
        const p3 = vec3.fromValues(
          center[0] + x10,
          center[1] + y1,
          center[2] + z10
        );

        const color = vec3.fromValues(h / hei, 0.5, 0.8);

        this.makeVertex(p0, color, vec3.sub(vec3.create(), p0, center));
        this.makeVertex(p1, color, vec3.sub(vec3.create(), p1, center));
        this.makeVertex(p2, color, vec3.sub(vec3.create(), p2, center));

        this.makeVertex(p2, color, vec3.sub(vec3.create(), p2, center));
        this.makeVertex(p3, color, vec3.sub(vec3.create(), p3, center));
        this.makeVertex(p0, color, vec3.sub(vec3.create(), p0, center));
      }
    }
  }

  size() {
    return this.vertexArray.length / vertexStruct.numComp;
  }

  draw(gl, shaders, cameraViewMatrix) {
    if (this.needBuffer) this.bufferData(gl);
    this.attrib(gl, shaders); // Fix, vet ikke om det er noe bedre måte å gjøre det på

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    this.updateMatrix();

    mat4.multiply(this.modelViewMatrix, cameraViewMatrix, this.modelViewMatrix);

    gl.uniformMatrix4fv(
      shaders.programInfo.uniformLocations.modelViewMatrix,
      false,
      this.modelViewMatrix
    );

    gl.uniformMatrix4fv(
      shaders.programInfo.uniformLocations.modelRotationMatrix,
      false,
      this.modelRotationMatrix
    );

    const offset = 0;
    const vertexCount = this.vertexArray.length / vertexStruct.numComp;
    gl.drawArrays(this.drawMode, offset, vertexCount);
  }

  bufferData(gl) {
    //console.log(
    //  "Buffering vertex array of size: ",
    //  this.vertexArray.length / vertexStruct.numComp
    //);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertexArray),
      gl.STATIC_DRAW
    );
    this.needBuffer = false;
  }
}
