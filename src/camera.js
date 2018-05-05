class Camera {
  constructor(aspect, fov = 60 * Math.PI / 180, zNear = 0.1, zFar = 100) {
    this.aspect = aspect;
    this.fov = fov;
    this.zNear = zNear;
    this.zFar = zFar;

    this.projectionMatrix = mat4.create();
    this.cameraTranslation = vec3.fromValues(-0.0, -1.0, -6.0);
    this.viewMatrix = mat4.create();

    this.defaultDirection = vec3.fromValues(0, 0, -1);
    this.direction = vec3.fromValues(0, -0.1, -1); //vec3.clone(this.defaultDirection);
  }
  updateMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.zNear,
      this.zFar
    );

    this.viewMatrix = mat4.create();
    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.angle(this.defaultDirection, this.direction),
      vec3.cross(vec3.create(), this.direction, this.defaultDirection)
    );
    mat4.translate(this.viewMatrix, this.viewMatrix, this.cameraTranslation);
  }
}
