class Camera {
    constructor(){
        this.eye = new Vector3();
        this.at = new Vector3();
        this.up  = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4();
        this.projMatrix = new Matrix4();

        this.fov = 60;

        this.updateProj();
    }

    updateView(){
        this.eye.elements[0] = player.x;
        this.eye.elements[1] = 0;
        this.eye.elements[2] = player.z;

        this.at.elements[0] = player.x + Math.cos(player.angle);
        this.at.elements[1] = 0;
        this.at.elements[2] = player.z + Math.sin(player.angle);
        this.viewMatrix.setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
        this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    updateProj(){
        this.projMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    moveWithCollisions(dx, dz){
        let newX = player.x + dx;
        if (!collides(newX, player.z)) {
            player.x = newX;
        }

        let newZ = player.z + dz;
        if (!collides(player.x, newZ)) {
            player.z = newZ;
        }
    }

}