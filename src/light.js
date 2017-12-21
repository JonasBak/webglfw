class DirectionalLight {
  constructor(direction, color, diffuse, specular, ambient) {
    this.direction = direction;
    this.color = color;
    this.diffuse = diffuse;
    this.specular = specular;
    this.ambient = ambient;
  }
  set(gl, shaders) {
    vec3.normalize(this.direction, this.direction);
    gl.uniform3fv(shaders.programInfo.uniformLocations.lightColor, this.color);
    gl.uniform1f(
      shaders.programInfo.uniformLocations.diffuseStrength,
      this.diffuse
    );
    gl.uniform1f(
      shaders.programInfo.uniformLocations.specularStrength,
      this.specular
    );
    gl.uniform1f(
      shaders.programInfo.uniformLocations.ambientStrength,
      this.ambient
    );
    gl.uniform3fv(
      shaders.programInfo.uniformLocations.lightDir,
      this.direction
    );
  }
}
