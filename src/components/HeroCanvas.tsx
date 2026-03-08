import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VOXEL_COLORS = [0x4a7c59, 0x1a7a80, 0x8b6914, 0xcc1111, 0x4dd9e0, 0x5aaf2a, 0xFFD700, 0x7a3f9d];

interface Voxel {
  mesh: THREE.Mesh;
  floatSpeed: number;
  floatOffset: number;
  rotSpeed: THREE.Vector3;
}

export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 28);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const pLight1 = new THREE.PointLight(0x4dd9e0, 2.5, 60);
    pLight1.position.set(10, 10, 15);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x5aaf2a, 1.8, 50);
    pLight2.position.set(-10, -8, 12);
    scene.add(pLight2);

    const pLight3 = new THREE.PointLight(0xFFD700, 1.5, 40);
    pLight3.position.set(0, 15, 5);
    scene.add(pLight3);

    // Voxels
    const voxels: Voxel[] = [];
    const geo = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < 55; i++) {
      const colorHex = VOXEL_COLORS[i % VOXEL_COLORS.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.55,
        metalness: 0.25,
        emissive: colorHex,
        emissiveIntensity: 0.06,
      });

      const s = 0.5 + Math.random() * 2.0;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(s);

      // Position spread in a wide frustum
      mesh.position.set(
        (Math.random() - 0.5) * 52,
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 20 - 5
      );

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      scene.add(mesh);
      voxels.push({
        mesh,
        floatSpeed: 0.0008 + Math.random() * 0.0015,
        floatOffset: Math.random() * Math.PI * 2,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.003
        ),
      });
    }

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 180;
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.55 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    // Resize
    const handleResize = () => {
      const nW = el.clientWidth;
      const nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener('resize', handleResize);

    // Animate
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      voxels.forEach(v => {
        v.mesh.position.y += Math.sin(t * v.floatSpeed * 400 + v.floatOffset) * 0.003;
        v.mesh.rotation.x += v.rotSpeed.x;
        v.mesh.rotation.y += v.rotSpeed.y;
        v.mesh.rotation.z += v.rotSpeed.z;
      });

      // Light pulse
      pLight1.intensity = 2 + Math.sin(t * 1.2) * 0.5;
      pLight2.intensity = 1.5 + Math.sin(t * 0.8 + 1) * 0.4;

      // Slow camera parallax toward mouse
      camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 1.8 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
