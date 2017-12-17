class Shader {
  constructor() {
    this.vertexShaderDef = `
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
    this.fragmentShaderDef = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `;
    this.shaderProgram = null;
    this.programInfo = null;
  }

  init(gl, useDefault = true) {
    const vertexShader = this.loadShader(
      gl,
      gl.VERTEX_SHADER,
      useDefault ? this.vertexShaderDef : this.vertexShaderLight
    );
    const fragmentShader = this.loadShader(
      gl,
      gl.FRAGMENT_SHADER,
      useDefault ? this.fragmentShaderDef : this.fragmentShaderLight
    );

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    this.shaderProgram = shaderProgram;

    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(
          this.shaderProgram,
          "aVertexPosition"
        ),
        vertexColor: gl.getAttribLocation(this.shaderProgram, "aVertexColor"),
        vertexNormal: gl.getAttribLocation(this.shaderProgram, "aVertexNormal")
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          this.shaderProgram,
          "uProjectionMatrix"
        ),
        modelViewMatrix: gl.getUniformLocation(
          this.shaderProgram,
          "uModelViewMatrix"
        )
      }
    };
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
}
