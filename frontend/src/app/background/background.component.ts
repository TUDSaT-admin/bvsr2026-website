import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, PointsMaterial, Points } from 'three';

@Component({
  selector: 'app-background',
  standalone: true,
  template: `<canvas #bgCanvas class="bg-canvas"></canvas>`,
  styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: InstanceType<typeof WebGLRenderer>;
  private scene!: InstanceType<typeof Scene>;
  private camera!: InstanceType<typeof PerspectiveCamera>;
  private stars!: InstanceType<typeof Points>;
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 1;

    this.renderer = new WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const starGeometry = new BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 1000;
    }

    starGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    const starMaterial = new PointsMaterial({ color: 0xffffff, size: 1, sizeAttenuation: true });

    this.stars = new Points(starGeometry, starMaterial);
    this.scene.add(this.stars);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.stars.rotation.y += 0.0005;
    this.stars.rotation.x += 0.0002;

    this.renderer.render(this.scene, this.camera);
  };
}
