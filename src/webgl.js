function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

  const shaders = new Shader();

  shaders.init(gl);

  const scene = new Scene(gl, shaders);

  function render(now) {
    scene.draw(gl, shaders);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
