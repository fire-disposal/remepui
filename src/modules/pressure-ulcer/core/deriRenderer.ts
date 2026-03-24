/**
 * DERI (Digital Entity Rendering Interface)
 * 数字实体渲染接口 - 核心实现
 * 
 * 提供高级 3D 渲染功能，支持：
 * - 程序化几何体生成
 * - 材质系统
 * - 动画系统
 * - 后期处理效果
 */

import * as THREE from 'three';
import type {
  DERIConfig,
  DERIEntity,
  GeometryData,
  MaterialData,
  TransformMatrix,
  AnimationData,
  Scene3DConfig,
  BodyPartEntity3D,
  BodyPartType,
} from '../types';

/**
 * 默认 DERI 配置
 */
export const DEFAULT_DERI_CONFIG: DERIConfig = {
  quality: 'medium',
  textureResolution: 1024,
  shadowMapSize: 2048,
  postProcessing: {
    bloom: true,
    ao: true,
    toneMapping: true,
    antialias: true,
  },
};

/**
 * DERI 渲染器类
 */
export class DERIRenderer {
  private config: DERIConfig;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private entities: Map<string, DERIEntity>;
  private meshes: Map<string, THREE.Mesh>;
  private materials: Map<string, THREE.Material>;
  private geometries: Map<string, THREE.BufferGeometry>;
  private animationMixers: Map<string, THREE.AnimationMixer>;
  private clock: THREE.Clock;

  constructor(container: HTMLElement, config: Partial<DERIConfig> = {}) {
    this.config = { ...DEFAULT_DERI_CONFIG, ...config };
    this.entities = new Map();
    this.meshes = new Map();
    this.materials = new Map();
    this.geometries = new Map();
    this.animationMixers = new Map();
    this.clock = new THREE.Clock();

    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f8fafc');

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 0.5, 0);

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.postProcessing.antialias,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    container.appendChild(this.renderer.domElement);

    // 初始化光照
    this.setupLighting();

    // 开始渲染循环
    this.animate();
  }

  /**
   * 设置光照
   */
  private setupLighting(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = this.config.shadowMapSize;
    mainLight.shadow.mapSize.height = this.config.shadowMapSize;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    this.scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.4);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  /**
   * 渲染循环
   */
  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // 更新动画混合器
    this.animationMixers.forEach(mixer => mixer.update(delta));

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 创建几何体
   */
  private createGeometry(data: GeometryData): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(data.vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(data.uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));

    geometry.computeVertexNormals();

    return geometry;
  }

  /**
   * 创建材质
   */
  private createMaterial(data: MaterialData): THREE.Material {
    switch (data.type) {
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          color: data.params.color || 0xffffff,
          roughness: data.params.roughness || 0.5,
          metalness: data.params.metalness || 0.0,
          clearcoat: data.params.clearcoat || 0.0,
          clearcoatRoughness: data.params.clearcoatRoughness || 0.0,
          transparent: data.params.opacity !== undefined && data.params.opacity < 1,
          opacity: data.params.opacity ?? 1,
        });

      case 'toon':
        return new THREE.MeshToonMaterial({
          color: data.params.color || 0xffffff,
          transparent: data.params.opacity !== undefined && data.params.opacity < 1,
          opacity: data.params.opacity ?? 1,
        });

      case 'custom':
        // 自定义材质逻辑
        return new THREE.MeshStandardMaterial({
          color: data.params.color || 0xffffff,
          roughness: data.params.roughness || 0.5,
          metalness: data.params.metalness || 0.0,
        });

      default:
        return new THREE.MeshStandardMaterial({
          color: data.params.color || 0xffffff,
          roughness: data.params.roughness || 0.5,
          metalness: data.params.metalness || 0.0,
          transparent: data.params.opacity !== undefined && data.params.opacity < 1,
          opacity: data.params.opacity ?? 1,
        });
    }
  }

  /**
   * 应用变换
   */
  private applyTransform(object: THREE.Object3D, transform: TransformMatrix): void {
    object.position.set(...transform.position);
    object.quaternion.set(...transform.rotation);
    object.scale.set(...transform.scale);
  }

  /**
   * 添加实体
   */
  addEntity(entity: DERIEntity): THREE.Mesh {
    // 创建几何体
    let geometry = this.geometries.get(entity.id);
    if (!geometry) {
      geometry = this.createGeometry(entity.geometry);
      this.geometries.set(entity.id, geometry);
    }

    // 创建材质
    let material = this.materials.get(entity.id);
    if (!material) {
      material = this.createMaterial(entity.material);
      this.materials.set(entity.id, material);
    }

    // 创建网格
    const mesh = new THREE.Mesh(geometry, material);
    this.applyTransform(mesh, entity.transform);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = true;

    // 添加到场景
    this.scene.add(mesh);
    this.meshes.set(entity.id, mesh);
    this.entities.set(entity.id, entity);

    // 设置动画
    if (entity.animation) {
      this.setupAnimation(entity.id, entity.animation, mesh);
    }

    return mesh;
  }

  /**
   * 设置动画
   */
  private setupAnimation(entityId: string, animationData: AnimationData, mesh: THREE.Mesh): void {
    const mixer = new THREE.AnimationMixer(mesh);
    this.animationMixers.set(entityId, mixer);

    // 创建关键帧轨道
    const tracks: THREE.KeyframeTrack[] = [];

    // 位置轨道
    const positionTrack = new THREE.VectorKeyframeTrack(
      '.position',
      animationData.keyframes.map(k => k.time),
      animationData.keyframes.flatMap(k => k.position || [0, 0, 0])
    );
    tracks.push(positionTrack);

    // 旋转轨道
    const rotationTrack = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      animationData.keyframes.map(k => k.time),
      animationData.keyframes.flatMap(k => k.rotation || [0, 0, 0, 1])
    );
    tracks.push(rotationTrack);

    // 缩放轨道
    const scaleTrack = new THREE.VectorKeyframeTrack(
      '.scale',
      animationData.keyframes.map(k => k.time),
      animationData.keyframes.flatMap(k => k.scale || [1, 1, 1])
    );
    tracks.push(scaleTrack);

    // 创建动画剪辑
    const clip = new THREE.AnimationClip(animationData.name, animationData.duration, tracks);
    const action = mixer.clipAction(clip);

    if (animationData.loop) {
      action.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      action.setLoop(THREE.LoopOnce, 1);
    }

    action.play();
  }

  /**
   * 移除实体
   */
  removeEntity(entityId: string): void {
    const mesh = this.meshes.get(entityId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      this.meshes.delete(entityId);
    }

    const material = this.materials.get(entityId);
    if (material) {
      material.dispose();
      this.materials.delete(entityId);
    }

    const geometry = this.geometries.get(entityId);
    if (geometry) {
      geometry.dispose();
      this.geometries.delete(entityId);
    }

    this.animationMixers.delete(entityId);
    this.entities.delete(entityId);
  }

  /**
   * 更新实体
   */
  updateEntity(entityId: string, updates: Partial<DERIEntity>): void {
    const entity = this.entities.get(entityId);
    const mesh = this.meshes.get(entityId);

    if (!entity || !mesh) return;

    // 更新变换
    if (updates.transform) {
      this.applyTransform(mesh, updates.transform);
    }

    // 更新可见性
    if (updates.visible !== undefined) {
      mesh.visible = updates.visible;
    }

    // 更新材质
    if (updates.material && mesh.material) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (updates.material.params.color !== undefined) {
        material.color.setHex(updates.material.params.color);
      }
      if (updates.material.params.opacity !== undefined) {
        material.opacity = updates.material.params.opacity;
        material.transparent = updates.material.params.opacity < 1;
      }
      if (updates.material.params.emissive !== undefined) {
        material.emissive.setHex(updates.material.params.emissive);
      }
      if (updates.material.params.emissiveIntensity !== undefined) {
        material.emissiveIntensity = updates.material.params.emissiveIntensity;
      }
    }
  }

  /**
   * 获取实体
   */
  getEntity(entityId: string): DERIEntity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * 获取所有实体
   */
  getAllEntities(): DERIEntity[] {
    return Array.from(this.entities.values());
  }

  /**
   * 设置相机位置
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * 设置相机目标
   */
  setCameraTarget(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    // 清理所有资源
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    });
    this.meshes.clear();

    this.materials.forEach(material => material.dispose());
    this.materials.clear();

    this.geometries.forEach(geometry => geometry.dispose());
    this.geometries.clear();

    this.animationMixers.clear();
    this.entities.clear();

    this.renderer.dispose();
  }
}

/**
 * 创建 DERI 身体部位实体
 */
export const createDERIBodyPartEntity = (
  partType: BodyPartType,
  damage: number,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1]
): DERIEntity => {
  // 根据伤害值计算颜色
  const getDamageColor = (d: number): number => {
    if (d < 10) return 0x22c55e;
    if (d < 30) return 0x84cc16;
    if (d < 50) return 0xeab308;
    if (d < 70) return 0xf97316;
    if (d < 90) return 0xef4444;
    return 0xdc2626;
  };

  const color = getDamageColor(damage);
  const emissiveIntensity = damage > 30 ? Math.min(damage / 100, 0.8) : 0;

  // 创建球体几何体
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const radius = 1;
  const widthSegments = 32;
  const heightSegments = 32;

  for (let i = 0; i <= heightSegments; i++) {
    const theta = (i / heightSegments) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let j = 0; j <= widthSegments; j++) {
      const phi = (j / widthSegments) * 2 * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      vertices.push(x * radius, y * radius, z * radius);
      normals.push(x, y, z);
      uvs.push(j / widthSegments, i / heightSegments);
    }
  }

  for (let i = 0; i < heightSegments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const first = i * (widthSegments + 1) + j;
      const second = first + widthSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    id: `body_part_${partType}`,
    geometry: {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
    },
    material: {
      type: 'standard',
      params: {
        color,
        roughness: 0.4,
        metalness: 0.1,
        emissive: damage > 30 ? color : 0x000000,
        emissiveIntensity,
        opacity: 1,
      },
    },
    transform: {
      position,
      rotation: [0, 0, 0, 1],
      scale,
    },
  };
};

/**
 * 创建 DERI 渲染器实例
 */
export const createDERIRenderer = (
  container: HTMLElement,
  config?: Partial<DERIConfig>
): DERIRenderer => {
  return new DERIRenderer(container, config);
};
