class Shader {
  constructor() {
    this.vertexShader = `
      attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      varying lowp vec4 vColor;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1);
        vColor = aVertexColor + vec4((0.5 * aVertexNormal + vec3(0.5)), 1);
      }
    `;
    this.fragmentShader = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `;
    this.shaderProgram = null;
    this.programInfo = null;
  }

  init(gl) {
    const vertexShader = this.loadShader(
      gl,
      gl.VERTEX_SHADER,
      this.vertexShader
    );
    const fragmentShader = this.loadShader(
      gl,
      gl.FRAGMENT_SHADER,
      this.fragmentShader
    );

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    this.shaderProgram = shaderProgram;

    this.programInfo = {
      program: shaderProgram,
      attribLocations: {},
      uniformLocations: {}
    };

    const attribs = ["vertexPosition", "vertexColor", "vertexNormal"];
    const uniforms = ["projectionMatrix", "modelViewMatrix"];

    attribs.map(
      a =>
        (this.programInfo.attribLocations[a] = gl.getAttribLocation(
          this.shaderProgram,
          "a" + a[0].toUpperCase() + a.substr(1)
        ))
    );

    uniforms.map(
      a =>
        (this.programInfo.uniformLocations[a] = gl.getUniformLocation(
          this.shaderProgram,
          "u" + a[0].toUpperCase() + a.substr(1)
        ))
    );
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
}
