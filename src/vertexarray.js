const FLOATSIZE = 4;
const NUMPOS = 3;
const NUMCOL = 4;

class Vertex {
  constructor(position, color){
    this.position = position;
    this.color = color;
  }
}

class VertexArray {
  constructor(gl, shaders) {
    this.vbo = gl.createBuffer();
    this.vertexArray = [];

    this.rotation = 0;
    this.translation = [-0.0, -1.0, -0.0];
    this.rotAxis = [0.5, 1, 0];
    this.modelViewMatrix = mat4.create();

    this.attrib(gl, shaders);
  }
  attrib(gl, shaders){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    //Pos
    gl.vertexAttribPointer(
        shaders.programInfo.attribLocations.vertexPosition,
        NUMPOS,
        gl.FLOAT,
        false,
        (NUMPOS + NUMCOL) * FLOATSIZE,
        0);
    gl.enableVertexAttribArray(
        shaders.programInfo.attribLocations.vertexPosition);


    //Col
    gl.vertexAttribPointer(
        shaders.programInfo.attribLocations.vertexColor,
        NUMCOL,
        gl.FLOAT,
        false,
        (NUMPOS + NUMCOL) * FLOATSIZE,
        NUMPOS * FLOATSIZE);
    gl.enableVertexAttribArray(
        shaders.programInfo.attribLocations.vertexColor);

  }

  updateMatrix() {
    this.modelViewMatrix = mat4.create();
    mat4.translate(this.modelViewMatrix,
                   this.modelViewMatrix,
                   this.translation);
    mat4.rotate(this.modelViewMatrix,
                this.modelViewMatrix,
                this.rotation,
                this.rotAxis);
  }

  addVertex(vertex) {
    this.vertexArray.push(...vertex.position, ...vertex.color);
  }

  draw(gl, shaders, camera) {
    this.bufferData(gl);

    this.updateMatrix();

    mat4.multiply(this.modelViewMatrix, camera, this.modelViewMatrix);

    gl.uniformMatrix4fv(
        shaders.programInfo.uniformLocations.modelViewMatrix,
        false,
        this.modelViewMatrix);

    const offset = 0;
    const vertexCount = this.vertexArray.length / (NUMPOS + NUMCOL);
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);

    this.rotation += 0.01;
  }

  bufferData(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray), gl.STATIC_DRAW);
  }

}
