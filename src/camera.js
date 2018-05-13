class Camera {
  constructor(aspect, fov = 60 * Math.PI / 180, zNear = 0.1, zFar = 100) {
    this.aspect = aspect;
    this.fov = fov;
    this.zNear = zNear;
    this.zFar = zFar;

    this.projectionMatrix = mat4.create();
    this.cameraTranslation = vec3.fromValues(-0.0, -1.0, -6.0);
    this.viewMatrix = mat4.create();

    this.direction = vec3.fromValues(0, -0.1, -1);
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

    const right = [1, 0, 0];
    const up = [0, 1, 0];
    const forward = [0, 0, 1];
    const relRight = vec3.cross(vec3.create(), this.direction, up);
    const relUp = vec3.cross(vec3.create(), relRight, this.direction);

    let tmp = -vec3.dot(this.direction, up);
    if (tmp == 0) tmp = 1;
    tmp = tmp / Math.abs(tmp);

    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.angle(up, relUp) * tmp,
      right
    );

    tmp = vec3.dot(this.direction, right);
    if (tmp == 0) tmp = 1;
    tmp = tmp / Math.abs(tmp);

    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.angle(right, relRight) * tmp,
      up
    );

    mat4.translate(this.viewMatrix, this.viewMatrix, this.cameraTranslation);
  }
}
