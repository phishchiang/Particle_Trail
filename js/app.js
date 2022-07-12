import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import vertex from "./shader/vertex.glsl";
import particles_fs from "./shader/particles_fs.glsl";
import particles_vs from "./shader/particles_vs.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.gltf_loader = new GLTFLoader();
    this.draco_loader = new DRACOLoader();
    this.draco_loader.setDecoderConfig({ type: 'js' });
    this.draco_loader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
    this.gltf_loader.setDRACOLoader(this.draco_loader);

    this.count = 0;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );


    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0.6,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 5, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.mat_particle.uniforms.resolution.value.x = this.width;
    this.mat_particle.uniforms.resolution.value.y = this.height;
    this.mat_particle.uniforms.resolution.value.z = a1;
    this.mat_particle.uniforms.resolution.value.w = a2;


    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.mat_particle = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0.6 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      vertexShader: particles_vs,
      fragmentShader: particles_fs,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    
    this.geo_particle = new THREE.BufferGeometry();
    const parameters = {particle_count: 100};

    // Create the Buffer Array
    const positions = new Float32Array(parameters.particle_count * 3);
    const a_angle = new Float32Array(parameters.particle_count * 1);
    const a_life = new Float32Array(parameters.particle_count * 1);
    const a_offset = new Float32Array(parameters.particle_count * 1);

    // Create the data in the for loop
    for (let i = 0; i < parameters.particle_count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3 + 0] = Math.random() - 0.5;
      positions[i3 + 1] = Math.random() - 0.5;
      positions[i3 + 2] = Math.random() - 0.5;
      // positions.set([Math.random(), Math.random(), Math.random()], 3*i);
      
      // Angle for 0 ~ 360
      a_angle[i] = Math.random() * Math.PI * 2;
      
      // Life for 5 ~ 10
      a_life[i] = 5 + Math.random() * 5;

      // Offset for 0 ~ 1000
      a_offset[i] = Math.random() * 1000;

    }

    this.geo_particle.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geo_particle.setAttribute('a_angle', new THREE.BufferAttribute(a_angle, 1));
    this.geo_particle.setAttribute('a_life', new THREE.BufferAttribute(a_life, 1));
    this.geo_particle.setAttribute('a_offset', new THREE.BufferAttribute(a_offset, 1));

    this.msh_particle = new THREE.Points(this.geo_particle,this.mat_particle)
    this.scene.add(this.msh_particle)
    console.log(this.msh_particle);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.mat_particle.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);

  }
}

new Sketch({
  dom: document.getElementById("container")
});
