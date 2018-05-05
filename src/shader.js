class Shader {
  constructor() {
    //TODO bestemme hva som skal være i vertex og fragment, anbefaler specular i fragment, kanskje diffuse
    //TODO fler lyskilder
    this.vertexShader = `
      attribute vec3 aVertexPosition;
      attribute vec3 aVertexColor;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uModelRotationMatrix;
      uniform vec3 uCameraPosition;
      uniform vec3 uLightColor;
      uniform vec3 uLightDir;
      uniform float uDiffuseStrength;
      uniform float uSpecularStrength;
      uniform float uAmbientStrength;

      varying lowp vec3 vColor;
      varying mediump vec3 vNormal;
      varying mediump vec3 vLightDir;
      varying mediump vec3 vFragmentPosition;
      varying lowp vec3 vLight;

      varying mediump vec3 position;

      void diffuse(in vec3 normal, inout vec3 light) {
        float dif = max(dot(-normal, uLightDir), 0.0);
        light += uDiffuseStrength * dif * uLightColor;
      }

      void specular(in vec3 normal, inout vec3 light){
        vec3 viewDir = normalize(aVertexPosition - uCameraPosition);
	      vec3 reflectDir = reflect(uLightDir, normal);
      	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        light += uSpecularStrength * spec * uLightColor;
      }

      void ambient(inout vec3 light){
        light += uAmbientStrength * uLightColor;
      }

      void main(void) {
        vNormal = (uModelRotationMatrix * vec4(aVertexNormal, 1)).xyz;

        vec3 light = vec3(0,0,0);
        diffuse(vNormal, light);
        specular(vNormal, light);
        ambient(light);

        vColor = aVertexColor;
        vLightDir = uLightDir;
        vFragmentPosition = aVertexPosition;
        vLight = light;

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1);
      }
    `;
    this.fragmentShader = `
      varying lowp vec3 vColor;
      varying mediump vec3 vNormal;
      varying mediump vec3 vLightDir;
      varying mediump vec3 vFragmentPosition;
      varying lowp vec3 vLight;

      varying mediump vec3 position;

      void main(void) {
        gl_FragColor = vec4(vColor * vLight, 1);
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
      "strengths",
      "cameraPosition",
      "diffuseStrength",
      "specularStrength",
      "ambientStrength"
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
