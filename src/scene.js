class Scene {
  constructor(gl, shaders) {
    this.fov = 45 * Math.PI / 180;
    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.zNear = 0.1;
    this.zFar = 100.0;
    this.projectionMatrix = mat4.create();

    this.cameraRotation = 0;
    this.cameraTranslation = vec3.fromValues(-0.0, 0.0, -6.0);
    this.cameraRotAxis = vec4.fromValues(0, 0, 1);
    this.cameraViewMatrix = mat4.create();
    this.cameraRotationMatrix = mat4.create();

    this.clearColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.CULL_FACE);

    this.va = new VertexArray(gl, shaders);

    this.va.addSphere(1);
    //this.va.addBox([-0.5, -0.5, -0.5], [1, 1, 1]);

    /*this.va.addQuadrilateral(
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
      [0, 0, 1, 1]
    );*/

    /*
    this.va.addTriangle([0.0, 2.0, 0.0], [-1.0, 0.0, 1.0], [1.0, 0.0, 1.0], [1.0, 0.0, 0.0, 1.0]);
    this.va.addTriangle([0.0, 2.0, 0.0], [-1.0, 0.0, -1.0], [-1.0, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0]);
    this.va.addTriangle([0.0, 2.0, 0.0], [1.0, 0.0, -1.0], [-1.0, 0.0, -1.0], [0.0, 1.0, 0.0, 1.0]);
    this.va.addTriangle([0.0, 2.0, 0.0], [1.0, 0.0, 1.0], [1.0, 0.0, -1.0], [0.0, 0.0, 1.0, 1.0]);
    this.va.addVertex(new Vertex([1.0, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0]));
    this.va.addVertex(new Vertex([-1.0, 0.0, 1.0], [ 1.0, 0.0, 0.0, 1.0]));
    this.va.addVertex(new Vertex([-1.0, 0.0, -1.0], [ 0.0, 1.0, 0.0, 1.0]));
    this.va.addVertex(new Vertex([1.0, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0]));
    this.va.addVertex(new Vertex([1.0, 0.0, -1.0], [ 1.0, 0.0, 0.0, 1.0]));
    this.va.addVertex(new Vertex([-1.0, 0.0, -1.0], [ 0.0, 1.0, 0.0, 1.0]));
*/
  }

  updateMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.zNear,
      this.zFar
    );

    this.cameraViewMatrix = mat4.create();
    mat4.translate(
      this.cameraViewMatrix,
      this.cameraViewMatrix,
      this.cameraTranslation
    );
    mat4.rotate(
      this.cameraViewMatrix,
      this.cameraViewMatrix,
      this.cameraRotation,
      this.cameraRotAxis
    );
    this.cameraRotationMatrix = mat4.create();
    mat4.rotate(
      this.cameraRotationMatrix,
      this.cameraRotationMatrix,
      this.cameraRotation,
      this.cameraRotAxis
    );
  }

  draw(gl, shaders) {
    gl.clearColor(...this.clearColor);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.updateMatrix();

    gl.useProgram(shaders.programInfo.program);

    gl.uniformMatrix4fv(
      shaders.programInfo.uniformLocations.projectionMatrix,
      false,
      this.projectionMatrix
    );

    this.va.draw(gl, shaders, this.cameraViewMatrix, this.cameraRotationMatrix);
  }
}
