class Scene {
  constructor(gl, shaders) {
    this.camera = new Camera(gl.canvas.clientWidth / gl.canvas.clientHeight);
    this.clearColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);
    gl.enable(gl.CULL_FACE);
    this.va = new VertexArray(gl, shaders);

    //testing
    this.va.addSphere(1);
    //this.va.addBox([-0.5, -0.5, -0.5], [1, 1, 1], [0.1, 0.3, 1]);
  }

  draw(gl, shaders) {
    gl.clearColor(...this.clearColor);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.updateMatrix();

    gl.useProgram(shaders.programInfo.program);

    gl.uniformMatrix4fv(
      shaders.programInfo.uniformLocations.projectionMatrix,
      false,
      this.camera.projectionMatrix
    );

    gl.uniform3fv(
      shaders.programInfo.uniformLocations.cameraPosition,
      this.camera.cameraTranslation
    );

    this.va.draw(gl, shaders, this.camera.viewMatrix);
  }
}
