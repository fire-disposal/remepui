/**
 * 3D 人体模型组件
 * 使用 React Three Fiber 实现
 * 
 * 架构设计：
 * - HumanBodyPrimitive: 基础几何体构建的简化人体模型（当前实现）
 * - HumanBodyGLTF: 从GLTF文件加载的精细模型（未来扩展）
 * - Mattress: 床垫几何体
 * 
 * 未来替换精细模型时，只需：
 * 1. 准备GLTF/GLB模型文件放入 public/models/
 * 2. 修改 HUMAN_MODEL_CONFIG.currentModel 为 'gltf'
 * 3. 实现 HumanBodyGLTF 组件
 */

import { useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Html,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  BODY_PARTS_3D_CONFIG,
  DEFAULT_SCENE_CONFIG,
  getDamageColor3D,
  getDamageEmissiveIntensity,
  POSTURE_ROTATIONS,
  MATTRESS_CONFIG,
  HUMAN_MODEL_CONFIG,
} from '../config/view.config';
import type {
  BodyPart,
  BodyPartType,
  BodyPosture,
  BodyPartEntity3D,
} from '../types';

interface BodyModel3DProps {
  bodyParts: Record<BodyPartType, BodyPart>;
  posture?: BodyPosture;
  autoRotate?: boolean;
  onPartHover?: (part: BodyPartType | null) => void;
  onPartClick?: (part: BodyPartType) => void;
  isRunning?: boolean;
}

/**
 * 身体部位 3D 实体
 */
const BodyPartMesh = ({
  entity,
  isHovered,
  onHover,
  onClick,
  isRunning,
}: {
  entity: BodyPartEntity3D;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  isRunning?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulseScale, setPulseScale] = useState(1);

  // 脉冲动画
  useFrame(({ clock }) => {
    if (isRunning && entity.damage >= 30 && meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.05 * (entity.damage / 100);
      setPulseScale(pulse);
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const damageColor = getDamageColor3D(entity.damage);
  const emissiveIntensity = getDamageEmissiveIntensity(entity.damage);

  const geometry = useMemo(() => {
    switch (entity.geometry) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'capsule':
        return new THREE.CapsuleGeometry(1, 1.5, 4, 16);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [entity.geometry]);

  return (
    <group position={entity.position} rotation={entity.rotation}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        scale={entity.scale.map(s => s * (isHovered ? 1.1 : 1)) as [number, number, number]}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={entity.damage > 10 ? damageColor : entity.highlightColor || '#f5d0c5'}
          roughness={0.4}
          metalness={0.1}
          emissive={entity.damage > 30 ? damageColor : '#000000'}
          emissiveIntensity={isHovered ? emissiveIntensity + 0.2 : emissiveIntensity}
          transparent={entity.opacity < 1}
          opacity={entity.opacity}
        />
      </mesh>

      {/* 伤害指示器 */}
      {entity.damage >= 10 && (
        <Html distanceFactor={10} position={[0, entity.scale[1] * 0.8, 0]}>
          <div
            style={{
              background: damageColor,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {Math.round(entity.damage)}%
          </div>
        </Html>
      )}

      {/* 高亮环 */}
      {(isHovered || entity.damage >= 50) && (
        <mesh geometry={geometry} scale={entity.scale.map(s => s * 1.2) as [number, number, number]}>
          <meshBasicMaterial
            color={damageColor}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * 床垫组件
 */
const Mattress = () => {
  const { width, height, depth, position, color, borderColor, pillowColor, pillowPosition, pillowSize } = MATTRESS_CONFIG;

  return (
    <group position={position}>
      {/* 主床垫 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* 床垫边缘 */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[width + 0.02, 0.02, depth + 0.02]} />
        <meshStandardMaterial color={borderColor} roughness={0.6} />
      </mesh>

      {/* 枕头 */}
      <mesh position={pillowPosition} castShadow>
        <boxGeometry args={pillowSize} />
        <meshStandardMaterial
          color={pillowColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* 床单纹理效果 - 使用细线表示 */}
      <group position={[0, height / 2 + 0.001, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`line-h-${i}`} position={[0, 0, -depth / 2 + (i + 1) * (depth / 9)]}>
            <boxGeometry args={[width - 0.1, 0.002, 0.01]} />
            <meshStandardMaterial color="#d0e8f0" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/**
 * 基础几何体人体模型（当前实现）
 * 使用胶囊体和球体构建简化人体
 */
const HumanBodyPrimitive = ({
  bodyParts,
  posture = 'supine',
  onPartHover,
  onPartClick,
  isRunning,
}: BodyModel3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<BodyPartType | null>(null);

  // 姿态旋转 - 躺卧姿态
  const postureRotation = useMemo(() => {
    const rot = POSTURE_ROTATIONS[posture];
    return [rot.x, rot.y, rot.z] as [number, number, number];
  }, [posture]);

  // 创建身体部位实体
  const bodyPartEntities = useMemo(() => {
    const entities: Record<BodyPartType, BodyPartEntity3D> = {} as Record<BodyPartType, BodyPartEntity3D>;

    (Object.keys(bodyParts) as BodyPartType[]).forEach(partId => {
      const part = bodyParts[partId];
      const config = BODY_PARTS_3D_CONFIG[partId];

      entities[partId] = {
        id: partId,
        partType: partId,
        name: part.name,
        damage: part.damage,
        pressure: part.pressure,
        position: config.position,
        rotation: config.rotation,
        scale: config.scale,
        visible: true,
        opacity: 1,
        isHighlighted: part.damage >= 50,
        highlightColor: config.color,
        geometry: config.geometry as 'sphere' | 'capsule',
        pulseAnimation: isRunning && part.damage >= 30,
      };
    });

    return entities;
  }, [bodyParts, isRunning]);

  const handlePartHover = useCallback((partId: BodyPartType | null) => {
    setHoveredPart(partId);
    onPartHover?.(partId);
  }, [onPartHover]);

  const handlePartClick = useCallback((partId: BodyPartType) => {
    onPartClick?.(partId);
  }, [onPartClick]);

  // 躺卧姿态下的人体位置调整
  // 模型原点在中心，躺下后需要调整Y位置使其在床垫上方
  const lyingOffset = 0.1; // 躺在床垫上的高度偏移

  return (
    <group ref={groupRef} position={[0, lyingOffset, 0]} rotation={postureRotation}>
      {/* 躯干主体 - 简化表示 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.2, 4, 16]} />
        <meshStandardMaterial
          color="#f5d0c5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* 头部 */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>

      {/* 手臂 */}
      <mesh position={[-0.55, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 16]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>
      <mesh position={[0.55, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 16]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>

      {/* 腿部 */}
      <mesh position={[-0.15, -0.6, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 4, 16]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>
      <mesh position={[0.15, -0.6, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 4, 16]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>

      {/* 压疮高发部位 */}
      {(Object.keys(bodyPartEntities) as BodyPartType[]).map(partId => (
        <BodyPartMesh
          key={partId}
          entity={bodyPartEntities[partId]}
          isHovered={hoveredPart === partId}
          onHover={(hovered) => handlePartHover(hovered ? partId : null)}
          onClick={() => handlePartClick(partId)}
          isRunning={isRunning}
        />
      ))}
    </group>
  );
};

/**
 * GLTF精细人体模型（未来扩展）
 * 使用方法：
 * 1. 将精细模型文件放入 public/models/human_body.glb
 * 2. 模型需要包含骨骼动画和压疮部位的命名节点
 * 3. 取消下方注释并实现具体逻辑
 */
// const HumanBodyGLTF = (props: BodyModel3DProps) => {
//   const { scene, nodes } = useGLTF(HUMAN_MODEL_CONFIG.availableModels.gltf.path!);
//   
//   // 根据bodyParts更新模型材质
//   // 遍历nodes找到对应的身体部位节点
//   // 应用伤害颜色和发光效果
//   
//   return (
//     <group scale={HUMAN_MODEL_CONFIG.scale} position={HUMAN_MODEL_CONFIG.offset}>
//       <primitive object={scene} />
//     </group>
//   );
// };

/**
 * 人体模型容器 - 根据配置选择渲染方式
 */
const HumanBody = (props: BodyModel3DProps) => {
  // 根据配置选择模型类型
  const modelType = HUMAN_MODEL_CONFIG.currentModel;

  // 未来可根据 modelType 切换不同的模型组件
  // if (modelType === 'gltf') {
  //   return (
  //     <Suspense fallback={<Html center>加载模型中...</Html>}>
  //       <HumanBodyGLTF {...props} />
  //     </Suspense>
  //   );
  // }

  return <HumanBodyPrimitive {...props} />;
};

/**
 * 场景组件
 */
const Scene = (props: BodyModel3DProps) => {
  return (
    <>
      {/* 环境光 */}
      <ambientLight
        color={DEFAULT_SCENE_CONFIG.ambientLight.color}
        intensity={DEFAULT_SCENE_CONFIG.ambientLight.intensity}
      />

      {/* 主光源 */}
      <directionalLight
        color={DEFAULT_SCENE_CONFIG.mainLight.color}
        intensity={DEFAULT_SCENE_CONFIG.mainLight.intensity}
        position={DEFAULT_SCENE_CONFIG.mainLight.position}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 补光 */}
      {DEFAULT_SCENE_CONFIG.fillLight && (
        <directionalLight
          color={DEFAULT_SCENE_CONFIG.fillLight.color}
          intensity={DEFAULT_SCENE_CONFIG.fillLight.intensity}
          position={DEFAULT_SCENE_CONFIG.fillLight.position}
        />
      )}

      {/* 床垫 */}
      <Mattress />

      {/* 人体模型 */}
      <HumanBody {...props} />

      {/* 阴影 */}
      <ContactShadows
        position={[0, -0.25, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
        far={4}
      />

      {/* 环境贴图 */}
      <Environment preset="studio" background={false} />

      {/* 控制器 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={1}
      />
    </>
  );
};

/**
 * 3D 人体模型主组件
 */
export const BodyModel3D = (props: BodyModel3DProps) => {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
      camera={{
        // 调整相机位置以观察躺卧姿态
        position: [0, 2, 3],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <Scene {...props} />
    </Canvas>
  );
};

export default BodyModel3D;
