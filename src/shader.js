class Shader {
  constructor() {
    //TODO bestemme hva som skal være i vertex og fragment, anbefaler specular i fragment
    //TODO fler lyskilder
    this.vertexShader = `
      attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uModelRotationMatrix;

      uniform vec3 uCameraPosition;

      uniform vec3 uLightColor;
      uniform vec3 uLightDir;
      uniform vec3 uStrengths;

      varying lowp vec4 vColor;
      varying mediump vec3 vNormal;
      varying mediump vec3 vLightDir;

      void diffuse(in vec3 normal, inout vec3 difLight) {
        float dif = max(dot(-normal, uLightDir), 0.0);
        difLight += uStrengths.x * dif * uLightColor;
      }

      void specular(in vec3 normal, inout vec3 light){
        vec3 viewDir = normalize(aVertexPosition - uCameraPosition);
	      vec3 reflectDir = reflect(uLightDir, normal);
      	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        light += uStrengths.y * spec * uLightColor;
      }

      void ambient(inout vec3 light){
        light += uStrengths.z * uLightColor;
      }

      void main(void) {
        vNormal = (uModelRotationMatrix * vec4(aVertexNormal, 1)).xyz;

        vec3 light = vec3(0,0,0);
        diffuse(vNormal, light);
        specular(vNormal, light);
        ambient(light);

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
      "cameraPosition"
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
