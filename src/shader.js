class Shader {
  constructor() {
    this.vertexShader = `
      attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      uniform mat4 uModelRotationMatrix;
      uniform vec3 uLightColor;
      uniform vec3 uLightDir;
      uniform vec3 uStrengths;


      varying lowp vec4 vColor;
      varying mediump vec3 vNormal;
      varying mediump vec3 vLightDir;

      void main(void) {
        vNormal = (uModelRotationMatrix * vec4(aVertexNormal, 1)).xyz;

        float dif = max(dot(-vNormal, normalize(uLightDir)) * uStrengths.x, uStrengths.z) ;
        vec3 light = dif * uLightColor;

        vColor = vec4(light * aVertexColor.xyz, 1);

        vLightDir = uLightDir;

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1);
      }
    `;
    this.fragmentShader = `
      varying lowp vec4 vColor;
      varying mediump vec3 vNormal;
      varying mediump vec3 vLightDir;


      void main(void) {
        gl_FragColor = vColor;
      }
    `;
    this.vertexShadertTmp = `
      attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      uniform mat4 uModelRotationMatrix;
      uniform vec3 uLightColor;
      uniform vec3 uLightDir;
      uniform vec3 uStrengths;


      varying lowp vec4 vColor;
      varying mediump vec3 vNormal;
      varying lowp float vDiffuseStrength;
      varying lowp vec3 vLightColor;
      verying mediump vec3 vLightDir;

      void main(void) {
        vColor = aVertexColor;
        vNormal = (uModelRotationMatrix * vec4(aVertexNormal, 1)).xyz;
        vDiffuseStrength = uStrengths.x;
        vLightColor = uLightColor;
        vLightDir = uLightDir;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1);
      }
    `;
    this.fragmentShaderTmp = `
      varying lowp vec4 vColor;
      varying mediump vec3 vNormal;
      varying lowp float vDiffuseStrength;
      varying lowp vec3 vLightColor;
      verying mediump vec3 vLightDir;

      vec3 diffuseLight() {
        float dif = max(dot(vNormal, vLightDir), 0.0f);
        return dif * vLightColor;
      }

      void main(void) {
        gl_FragColor = vColor + vec4((0.5 * vNormal + vec3(0.5)), 1);
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
    const uniforms = [
      "projectionMatrix",
      "modelViewMatrix",
      "modelRotationMatrix",
      "lightDir",
      "lightColor",
      "strengths"
    ];

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
