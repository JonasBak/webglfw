const FLOATSIZE = 4;
const NUMPOS = 3;
const NUMCOL = 4;

class Vertex {
  constructor(position, color) {
    this.position = position;
    this.color = color;
  }
}

class VertexArray {
  constructor(gl, shaders) {
    this.vbo = gl.createBuffer();
    this.vertexArray = [];

    this.rotation = 0;
    this.translation = [-0.0, -0.0, -0.0];
    this.rotAxis = [0.5, 1, 0];
    this.modelViewMatrix = mat4.create();

    this.attrib(gl, shaders);
  }
  attrib(gl, shaders) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    //Pos
    gl.vertexAttribPointer(
      shaders.programInfo.attribLocations.vertexPosition,
      NUMPOS,
      gl.FLOAT,
      false,
      (NUMPOS + NUMCOL) * FLOATSIZE,
      0
    );
    gl.enableVertexAttribArray(
      shaders.programInfo.attribLocations.vertexPosition
    );

    //Col
    gl.vertexAttribPointer(
      shaders.programInfo.attribLocations.vertexColor,
      NUMCOL,
      gl.FLOAT,
      false,
      (NUMPOS + NUMCOL) * FLOATSIZE,
      NUMPOS * FLOATSIZE
    );
    gl.enableVertexAttribArray(shaders.programInfo.attribLocations.vertexColor);
  }

  updateMatrix() {
    this.modelViewMatrix = mat4.create();
    mat4.translate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.translation
    );
    mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.rotation,
      this.rotAxis
    );
  }

  addVertex(vertex) {
    this.makeVertex(vertex.position, vertex.color);
  }

  makeVertex(position, color) {
    if (position.length != NUMPOS || color.length != NUMCOL)
      throw "illegal argument";
    this.vertexArray.push(...position, ...color);
  }

  addTriangle(p0, p1, p2, color = [1.0, 0.0, 1.0, 1.0]) {
    this.makeVertex(p0, color);
    this.makeVertex(p1, color);
    this.makeVertex(p2, color);
  }

  addQuadrilateral(p0, p1, p2, p3, color = [1.0, 0.0, 1.0, 1.0]) {
    this.addTriangle(p0, p1, p2, color);
    this.addTriangle(p2, p3, p0, color);
  }

  addBox(p000, span, color = [1.0, 0.0, 1.0, 1.0]) {
    const x0 = p000[0];
    const x1 = p000[0] + span[0];
    const y0 = p000[1];
    const y1 = p000[1] + span[1];
    const z0 = p000[2];
    const z1 = p000[2] + span[2];

    const p001 = [x0, y0, z1];
    const p010 = [x0, y1, z0];
    const p011 = [x0, y1, z1];

    const p100 = [x1, y0, z0];
    const p101 = [x1, y0, z1];
    const p110 = [x1, y1, z0];
    const p111 = [x1, y1, z1];

    this.addQuadrilateral(p000, p001, p011, p010, color);
    this.addQuadrilateral(p110, p111, p101, p100, color);

    this.addQuadrilateral(p000, p010, p110, p100, color);
    this.addQuadrilateral(p101, p111, p011, p001, color);

    this.addQuadrilateral(p000, p100, p101, p001, color);
    this.addQuadrilateral(p011, p111, p110, p010, color);
  }

  addSphere(radius, center = [0, 0, 0], cir = 10, hei = 10) {
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

        const p0 = [center[0] + x00, center[1] + y0, center[2] + z00];
        const p1 = [center[0] + x01, center[1] + y0, center[2] + z01];
        const p2 = [center[0] + x11, center[1] + y1, center[2] + z11];
        const p3 = [center[0] + x10, center[1] + y1, center[2] + z10];

        this.addQuadrilateral(p0, p1, p2, p3, [c / cir, h / hei, 0, 1]);
        //this.addTriangle(p0, p1, p2, [1, c / cir, 0, 1]);
        //this.addTriangle(p2, p3, p1, [1, h / hei, 0, 1]);
      }
    }
  }

  draw(gl, shaders, camera) {
    this.bufferData(gl);

    this.updateMatrix();

    mat4.multiply(this.modelViewMatrix, camera, this.modelViewMatrix);

    gl.uniformMatrix4fv(
      shaders.programInfo.uniformLocations.modelViewMatrix,
      false,
      this.modelViewMatrix
    );

    const offset = 0;
    const vertexCount = this.vertexArray.length / (NUMPOS + NUMCOL);
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);

    this.rotation += 0.01;
  }

  bufferData(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertexArray),
      gl.STATIC_DRAW
    );
  }
}
