class DirectionalLight {
  constructor(direction, color, diffuse, specular, ambient) {
    this.direction = direction;
    this.color = color;
    this.strengths = vec3.fromValues(diffuse, specular, ambient);
  }
  set(gl, shaders) {
    gl.uniform3fv(shaders.programInfo.uniformLocations.lightColor, this.color);
    gl.uniform3fv(
      shaders.programInfo.uniformLocations.strengths,
      this.strengths
    );
    gl.uniform3fv(
      shaders.programInfo.uniformLocations.lightDir,
      this.direction
    );
  }
}
