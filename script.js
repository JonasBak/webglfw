function main() {
  const canvas = document.querySelector("#glcanvas");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 5;

  const gl = canvas.getContext("webgl");

  const shaders = new Shader();

  shaders.init(gl);

  const scene = new Scene(canvas, gl, shaders);

  const va = new VertexArray(gl, shaders);

  scene.vas.push(va);

  va.addBox([-0.5, -0.5, -0.5], [1, 1, 1], [0.1, 0.3, 1]);

  scene.onUpdate.push(dt => {
    va.rotation += 0.01;
  });

  function render(now) {
    scene.update();
    scene.draw(gl, shaders);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
