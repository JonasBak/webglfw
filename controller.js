class Controller {
  constructor(canvas, camera) {
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);

    this.moving = false;

    this.camera = camera;

    this.movement = {
      up: false,
      down: false,
      left: false,
      right: false,
      forward: false,
      backward: false
    };

    this.keys = {
      32: "up",
      16: "down",
      65: "left",
      68: "right",
      87: "forward",
      83: "backward"
    };

    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("keyup", this.handleKeyup);
    canvas.addEventListener("mousedown", this.handleMousedown);
    window.addEventListener("mouseup", this.handleMouseup);
    window.addEventListener("mousemove", this.handleMousemove);
  }

  updateMousePosition(e) {
    const pos = [e.clientX, e.clientY];

    if (!this.mousePosition) this.mousePosition = pos;

    this.lastMousePosition = this.mousePosition;
    this.mousePosition = pos;
  }

  handleKeydown(e) {
    if (this.moving) e.preventDefault();
    if (this.keys.hasOwnProperty(e.keyCode))
      this.movement[this.keys[e.keyCode]] = true;
  }

  handleKeyup(e) {
    if (this.keys.hasOwnProperty(e.keyCode))
      this.movement[this.keys[e.keyCode]] = false;
  }

  handleMousedown(e) {
    this.updateMousePosition(e);

    this.moving = true;
  }

  handleMouseup(e) {
    this.updateMousePosition(e);

    this.moving = false;
  }

  handleMousemove(e) {
    this.updateMousePosition(e);

    if (this.moving) {
      const diff = vec2.sub(
        vec2.create(),
        this.mousePosition,
        this.lastMousePosition
      );

      const up = [0, 1, 0];
      const right = vec3.cross(vec3.create(), up, this.camera.direction);

      vec3.add(this.camera.direction, this.camera.direction, [
        0,
        diff[1] / 200,
        0
      ]);
      vec3.normalize(this.camera.direction, this.camera.direction);
      vec3.add(
        this.camera.direction,
        this.camera.direction,
        vec3.scale(right, right, diff[0] / 200)
      );
      vec3.normalize(this.camera.direction, this.camera.direction);
    }
  }

  update() {
    if (this.moving) {
      if (this.movement.up) this.camera.cameraTranslation[1] += -0.01;
      if (this.movement.down) this.camera.cameraTranslation[1] += 0.01;

      const up = [0, 1, 0];
      const right = vec3.scale(
        vec3.create(),
        vec3.normalize(
          vec3.create(),
          vec3.cross(vec3.create(), this.camera.direction, up)
        ),
        0.01
      );

      const forward = vec3.scale(
        vec3.create(),
        vec3.normalize(vec3.create(), this.camera.direction),
        0.01
      );

      if (this.movement.left)
        vec3.add(
          this.camera.cameraTranslation,
          this.camera.cameraTranslation,
          right
        );
      if (this.movement.right)
        vec3.sub(
          this.camera.cameraTranslation,
          this.camera.cameraTranslation,
          right
        );
      if (this.movement.forward)
        vec3.sub(
          this.camera.cameraTranslation,
          this.camera.cameraTranslation,
          forward
        );
      if (this.movement.backward)
        vec3.add(
          this.camera.cameraTranslation,
          this.camera.cameraTranslation,
          forward
        );
    }
  }
}
