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
    this.vertexArray.push(...vertex.position, ...vertex.color);
  }

  makeVertex(position, color) {
    this.vertexArray.push(...position, ...color);
  }

  addTriangle(p0, p1, p2, color = [1.0, 0.0, 0.0, 1.0]) {
    this.makeVertex(p0, color);
    this.makeVertex(p1, color);
    this.makeVertex(p2, color);
  }

  addQuadrilateral(corner, width, height, color) {
    //TODO
    const p1 = this.addTriangle();
  }

  addSphere(radius, center = [0, 0, 0], cir = 10, hei = 10) {
    //TODO: legg til tilfelle hvor man er på toppen/bunner for å spare 2 * cir trekanter
    for (let c = 0; c < cir; c++) {
      for (let h = 0; h < hei; h++) {
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
        const p2 = [center[0] + x10, center[1] + y1, center[2] + z10];
        const p3 = [center[0] + x11, center[1] + y1, center[2] + z11];

        this.addTriangle(p0, p1, p2, [1, c / cir, 0, 1]);
        this.addTriangle(p2, p3, p1, [1, h / hei, 0, 1]);
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
