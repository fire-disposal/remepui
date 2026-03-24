/**
 * 3D 人体模型组件
 * 使用 React Three Fiber 实现
 */

import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  BODY_PARTS_3D_CONFIG,
  DEFAULT_SCENE_CONFIG,
  getDamageColor3D,
  getDamageEmissiveIntensity,
  POSTURE_ROTATIONS,
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
 * 简化人体模型
 */
const HumanBody = ({
  bodyParts,
  posture = 'supine',
  onPartHover,
  onPartClick,
  isRunning,
}: BodyModel3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<BodyPartType | null>(null);

  // 姿态旋转
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

  return (
    <group ref={groupRef} rotation={postureRotation}>
      {/* 躯干主体 - 简化表示 */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.35, 1.2, 4, 16]} />
        <meshStandardMaterial
          color="#f5d0c5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* 头部 */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>

      {/* 腿部 */}
      <mesh position={[-0.2, -0.3, 0]}>
        <capsuleGeometry args={[0.12, 0.8, 4, 16]} />
        <meshStandardMaterial color="#f5d0c5" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, -0.3, 0]}>
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
 * 场景组件
 */
const Scene = (props: BodyModel3DProps) => {
  const { camera } = useThree();

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

      {/* 网格 */}
      {DEFAULT_SCENE_CONFIG.grid && (
        <Grid
          position={[0, -0.8, 0]}
          args={[DEFAULT_SCENE_CONFIG.grid.size, DEFAULT_SCENE_CONFIG.grid.size]}
          cellSize={DEFAULT_SCENE_CONFIG.grid.size / DEFAULT_SCENE_CONFIG.grid.divisions}
          cellThickness={1}
          cellColor={DEFAULT_SCENE_CONFIG.grid.color}
          sectionSize={DEFAULT_SCENE_CONFIG.grid.size / 4}
          sectionThickness={1.5}
          sectionColor="#94a3b8"
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* 人体模型 */}
      <HumanBody {...props} />

      {/* 阴影 */}
      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.4}
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
        target={[0, 0.5, 0]}
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
        position: [0, 1.5, 4],
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
