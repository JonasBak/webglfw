class Scene {
  constructor(canvas, gl, shaders) {
    this.camera = new Camera(gl.canvas.clientWidth / gl.canvas.clientHeight);
    this.clearColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);

    this.onUpdate = [];
    this.lastUpdate = -1;

    this.vas = [];

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.light = new DirectionalLight(
      vec3.fromValues(-0.5, -1, -1.0),
      vec3.fromValues(1, 1, 1),
      1,
      0.8,
      0.4
    );

    this.controller = new Controller(canvas, this.camera);
  }

  update() {
    const now = new Date();
    const dt = this.lastUpdate === -1 ? 0 : now - this.lastUpdate;

    this.controller.update();

    this.onUpdate.forEach(u => u(dt));

    this.lastUpdate = now;
  }

  draw(gl, shaders) {
    gl.clearColor(...this.clearColor);
    gl.clearDepth(1.0);

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

    this.light.set(gl, shaders);
    this.vas.forEach(va => {
      va.draw(gl, shaders, this.camera.viewMatrix);
    });
  }
}
