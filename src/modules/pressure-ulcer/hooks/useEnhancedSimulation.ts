/**
 * 增强版压疮仿真 Hook
 * 支持实时参数调整、预测分析和更灵活的状态管理
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  calculateRiskScore,
  formatTime,
  generateId,
  loadRecords,
  saveRecords,
  limitArrayLength,
} from '../core';
import {
  calculateAdvancedDamageRate,
  calculateDynamicCriticalTime,
  updateBodyPartsAdvanced,
  createInitialBodyParts,
  calculateRepositionInterval,
  generateDamagePrediction,
  predictPressureUlcerTime,
} from '../core/advancedDamageModel';
import { SIMULATION_CONFIG } from '../config/simulation.config';
import { DEFAULT_PARAMS } from '../config/presets.config';
import type {
  SimulationParams,
  SimulationState,
  AlertState,
  PressureUlcerEvent,
  SimulationRecord,
  RiskFactors,
  BodyPosture,
} from '../types';

/**
 * 仿真模式
 */
export type SimulationMode = 'realtime' | 'prediction' | 'comparison';

/**
 * 增强仿真状态
 */
export interface EnhancedSimulationState extends SimulationState {
  /** 仿真模式 */
  mode: SimulationMode;
  /** 是否处于恢复期（翻身后的恢复） */
  isRecovering: boolean;
  /** 恢复开始时间 */
  recoveryStartTime: number;
  /** 翻身次数 */
  repositionCount: number;
  /** 累积缺血时间 */
  totalIschemiaTime: number;
  /** 预测数据 */
  predictionData: Array<{ time: number; damage: number }>;
  /** 建议翻身时间 */
  recommendedRepositionTime: number;
  /** 预计压疮形成时间 */
  predictedUlcerTime: number | null;
  /** 当前体位 */
  posture: BodyPosture;
}

/**
 * 创建初始状态
 */
const createInitialState = (): EnhancedSimulationState => {
  const riskScore = calculateRiskScore(DEFAULT_PARAMS);
  const criticalTime = 7200; // 2小时

  return {
    isRunning: false,
    isPaused: false,
    isFinished: false,
    isRecovering: false,
    mode: 'realtime',
    elapsedTime: 0,
    criticalTime,
    riskScore,
    damagePercent: 0,
    bodyParts: createInitialBodyParts(),
    history: [],
    recoveryStartTime: 0,
    repositionCount: 0,
    totalIschemiaTime: 0,
    predictionData: [],
    recommendedRepositionTime: criticalTime * 0.3,
    predictedUlcerTime: null,
    posture: 'supine',
  };
};

const REPOSITION_POSTURE_SEQUENCE: BodyPosture[] = [
  'supine',
  'lateral_left',
  'lateral_right',
  'prone',
];

export const useEnhancedSimulation = () => {
  // 参数状态 - 支持实时调整
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  
  // 仿真状态
  const [state, setState] = useState<EnhancedSimulationState>(createInitialState);
  
  // 警报状态
  const [alertState, setAlertState] = useState<AlertState>({
    level: 'none',
    message: '',
  });

  // Refs
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const eventsRef = useRef<PressureUlcerEvent[]>([]);
  const currentRecordRef = useRef<SimulationRecord | null>(null);
  const alertTriggeredRef = useRef({ warning: false, danger: false });
  const paramChangePointsRef = useRef<Array<{ time: number; param: string; value: number }>>([]);
  const lastPredictionBucketRef = useRef<number>(-1);

  // 计算派生值
  const riskScore = useMemo(() => calculateRiskScore(params), [params]);
  
  const criticalTime = useMemo(() => 
    calculateDynamicCriticalTime(
      riskScore,
      params.pressure,
      state.damagePercent,
      state.repositionCount
    ),
    [riskScore, params.pressure, state.damagePercent, state.repositionCount]
  );

  const recommendedInterval = useMemo(() =>
    calculateRepositionInterval(riskScore, params.pressure, state.damagePercent),
    [riskScore, params.pressure, state.damagePercent]
  );

  // 更新预测数据
  const updatePrediction = useCallback((damageValue: number) => {
    const prediction = generateDamagePrediction(
      riskScore,
      params.pressure,
      damageValue,
      7200, // 预测2小时
      300   // 每5分钟一个点
    );
    
    const predictedTime = predictPressureUlcerTime(riskScore, params.pressure);
    
    setState(prev => ({
      ...prev,
      predictionData: prediction,
      predictedUlcerTime: predictedTime,
      recommendedRepositionTime: recommendedInterval,
    }));
  }, [riskScore, params.pressure, recommendedInterval]);

  // 参数更新（支持实时调整）
  const updateParams = useCallback((updates: Partial<SimulationParams>) => {
    const paramNames: Record<string, string> = {
      height: '身高',
      weight: '体重',
      temperature: '温度',
      humidity: '湿度',
      pressure: '压力',
      timeSpeed: '速度',
    };

    setParams(prev => {
      const newParams = { ...prev, ...updates };

      // 自动计算 BMI
      if (updates.height !== undefined || updates.weight !== undefined) {
        const heightInM = newParams.height / 100;
        newParams.bmi = parseFloat(
          (newParams.weight / (heightInM * heightInM)).toFixed(1)
        );
      }

      return newParams;
    });

    // 记录参数变化事件和点
    if (Object.keys(updates).length > 0) {
      const event: PressureUlcerEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        simulationTime: state.elapsedTime,
        type: 'param_change',
        message: `参数调整：${Object.keys(updates).join(', ')}`,
        damagePercent: state.damagePercent,
        paramChanges: updates,
      };
      eventsRef.current.push(event);

      // 记录参数变化点用于图表显示
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'number') {
          paramChangePointsRef.current.push({
            time: state.elapsedTime,
            param: paramNames[key] || key,
            value,
          });
        }
      });
    }
  }, [state.elapsedTime, state.damagePercent]);

  // 仿真循环
  const simulationLoop = useCallback(function simulationLoopFrame(timestamp: number) {
    if (!lastUpdateRef.current) {
      lastUpdateRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastUpdateRef.current) / 1000;
    if (deltaTime < 1 / 30) {
      animationRef.current = requestAnimationFrame(simulationLoopFrame);
      return;
    }
    lastUpdateRef.current = timestamp;

    setState(prev => {
      const adjustedDeltaTime = deltaTime * params.timeSpeed;
      
      let newElapsedTime = prev.elapsedTime;
      let newTotalIschemiaTime = prev.totalIschemiaTime;
      let newRecoveryStartTime = prev.recoveryStartTime;
      
      newElapsedTime += adjustedDeltaTime;

      if (prev.isRecovering) {
        // 恢复期
        newRecoveryStartTime += adjustedDeltaTime;
        if (newRecoveryStartTime > 120) { // 2分钟后结束恢复
          newRecoveryStartTime = 0;
        }
      } else {
        // 正常压力期
        newTotalIschemiaTime += adjustedDeltaTime;
      }

      // 计算伤害速率
      const damageRate = calculateAdvancedDamageRate(
        riskScore,
        params.pressure,
        newTotalIschemiaTime,
        criticalTime,
        prev.damagePercent,
        newTotalIschemiaTime
      );

      const damageIncrement = prev.isRecovering 
        ? -damageRate * adjustedDeltaTime * 0.5 // 恢复期伤害减少
        : damageRate * adjustedDeltaTime;

      // 更新身体部位
      const updatedBodyParts = updateBodyPartsAdvanced(
        prev.bodyParts,
        Math.abs(damageIncrement),
        params.pressure,
        prev.isRecovering,
        newRecoveryStartTime
      );

      // 计算总体伤害（以骶尾部为主）
      const totalDamage = updatedBodyParts.sacrum.damage;

      // 添加历史数据
      let newHistory = prev.history;
      const { HISTORY } = SIMULATION_CONFIG;
      if (
        Math.floor(newElapsedTime / HISTORY.SAMPLING_INTERVAL) >
        Math.floor(prev.elapsedTime / HISTORY.SAMPLING_INTERVAL)
      ) {
        newHistory = [
          ...prev.history,
          {
            time: Math.floor(newElapsedTime),
            riskScore,
            damagePercent: totalDamage,
            sacrumDamage: updatedBodyParts.sacrum.damage,
          },
        ];
        newHistory = limitArrayLength(newHistory, HISTORY.MAX_POINTS);
      }

      return {
        ...prev,
        elapsedTime: newElapsedTime,
        totalIschemiaTime: newTotalIschemiaTime,
        recoveryStartTime: newRecoveryStartTime,
        isRecovering: prev.isRecovering && newRecoveryStartTime > 0,
        damagePercent: totalDamage,
        bodyParts: updatedBodyParts,
        history: newHistory,
        criticalTime,
        riskScore,
        recommendedRepositionTime: recommendedInterval,
      };
    });

    animationRef.current = requestAnimationFrame(simulationLoopFrame);
  }, [params, riskScore, criticalTime, recommendedInterval]);

  // 开始仿真
  const startSimulation = useCallback(() => {
    const newRecord: SimulationRecord = {
      id: generateId(),
      startTime: new Date().toISOString(),
      duration: 0,
      finalDamage: 0,
      maxDamage: 0,
      finalRiskScore: riskScore,
      params: { ...params },
      events: [],
      history: [],
    };
    currentRecordRef.current = newRecord;
    eventsRef.current = [];
    alertTriggeredRef.current = { warning: false, danger: false };

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      isFinished: false,
      mode: 'realtime',
    }));

    lastUpdateRef.current = 0;
    animationRef.current = requestAnimationFrame(simulationLoop);
  }, [params, riskScore, simulationLoop]);

  // 暂停仿真
  const pauseSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  // 继续仿真
  const resumeSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    lastUpdateRef.current = 0;
    animationRef.current = requestAnimationFrame(simulationLoop);
  }, [simulationLoop]);

  // 结束仿真
  const finishSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (currentRecordRef.current) {
      const record = currentRecordRef.current;
      record.endTime = new Date().toISOString();
      record.duration = state.elapsedTime;
      record.finalDamage = state.damagePercent;
      record.finalRiskScore = riskScore;
      record.events = [...eventsRef.current];
      record.history = [...state.history];

      const records = loadRecords<SimulationRecord>();
      records.unshift(record);
      const limitedRecords = limitArrayLength(
        records,
        SIMULATION_CONFIG.STORAGE.MAX_RECORDS
      );
      saveRecords(limitedRecords);

      currentRecordRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      isFinished: true,
    }));
  }, [state.elapsedTime, state.damagePercent, state.history, riskScore]);

  // 重置仿真
  const resetSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    alertTriggeredRef.current = { warning: false, danger: false };
    currentRecordRef.current = null;
    eventsRef.current = [];
    paramChangePointsRef.current = [];

    setState(createInitialState());
    setAlertState({ level: 'none', message: '' });
  }, []);

  // 实施翻身
  const performReposition = useCallback(() => {
    setState(prev => {
      const event: PressureUlcerEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        simulationTime: prev.elapsedTime,
        type: 'reposition',
        message: `实施翻身操作（第${prev.repositionCount + 1}次）`,
        damagePercent: prev.damagePercent,
      };
      eventsRef.current.push(event);

      return {
        ...prev,
        isRecovering: true,
        recoveryStartTime: 0,
        repositionCount: prev.repositionCount + 1,
        totalIschemiaTime: Math.max(0, prev.totalIschemiaTime * 0.15),
        posture:
          REPOSITION_POSTURE_SEQUENCE[(prev.repositionCount + 1) % REPOSITION_POSTURE_SEQUENCE.length],
        bodyParts: updateBodyPartsAdvanced(
          prev.bodyParts,
          0,
          params.pressure,
          true,
          90
        ),
      };
    });

    alertTriggeredRef.current = { warning: false, danger: false };
    setAlertState({ level: 'none', message: '' });
  }, [params.pressure]);

  // 结束恢复期
  const endRecovery = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRecovering: false,
      recoveryStartTime: 0,
    }));
  }, []);

  // 删除记录
  const deleteRecord = useCallback((recordId: string) => {
    const records = loadRecords<SimulationRecord>();
    const filtered = records.filter(r => r.id !== recordId);
    saveRecords(filtered);
    return filtered;
  }, []);

  // 加载记录
  const loadRecordsCallback = useCallback(() => {
    return loadRecords<SimulationRecord>();
  }, []);

  // 获取事件列表
  const getEvents = useCallback(() => [...eventsRef.current], []);

  // 获取参数变化点
  const getParamChangePoints = useCallback(() => [...paramChangePointsRef.current], []);

  // 获取风险因素
  const getRiskFactors = useCallback((): RiskFactors => {
    return {
      bmi: params.bmi < 18.5 ? 3.0 : params.bmi < 25 ? 0.5 : params.bmi < 30 ? 1.5 : 2.5,
      temperature: params.temperature < 18 ? 1.0 : params.temperature <= 25 ? 0.5 : params.temperature < 30 ? 1.5 : 2.5,
      humidity: params.humidity < 30 ? 1.0 : params.humidity <= 70 ? 0.5 : params.humidity < 80 ? 1.5 : 2.0,
      pressure: params.pressure <= 32 ? 0.5 : params.pressure <= 70 ? 1.5 : params.pressure <= 100 ? 2.5 : params.pressure <= 150 ? 4.0 : 6.0,
    };
  }, [params]);

  // 警报检测
  useEffect(() => {
    const { DAMAGE_THRESHOLD } = SIMULATION_CONFIG;
    const damage = state.damagePercent;

    if (damage >= DAMAGE_THRESHOLD.DANGER && !alertTriggeredRef.current.danger) {
      alertTriggeredRef.current.danger = true;
      setAlertState({
        level: 'danger',
        message: `警告！压疮已形成，组织损伤可能不可逆！伤害累积值已达${damage.toFixed(1)}%`,
      });

      const event: PressureUlcerEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        simulationTime: state.elapsedTime,
        type: 'danger',
        message: '压疮已形成警告',
        damagePercent: damage,
      };
      eventsRef.current.push(event);
    } else if (damage >= DAMAGE_THRESHOLD.WARNING && damage < DAMAGE_THRESHOLD.DANGER && !alertTriggeredRef.current.warning) {
      alertTriggeredRef.current.warning = true;
      setAlertState({
        level: 'warning',
        message: `伤害累积值已达${damage.toFixed(1)}%，建议立即翻身！`,
      });

      const event: PressureUlcerEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        simulationTime: state.elapsedTime,
        type: 'warning',
        message: '伤害累积警告',
        damagePercent: damage,
      };
      eventsRef.current.push(event);
    } else if (damage < DAMAGE_THRESHOLD.WARNING) {
      alertTriggeredRef.current = { warning: false, danger: false };
      if (alertState.level !== 'none') {
        setAlertState({ level: 'none', message: '' });
      }
    }
  }, [state.damagePercent, state.elapsedTime, alertState.level]);

  // 更新预测
  useEffect(() => {
    const damageBucket = Math.round(state.damagePercent / 2);
    if (!state.isRunning || damageBucket !== lastPredictionBucketRef.current) {
      lastPredictionBucketRef.current = damageBucket;
      updatePrediction(state.damagePercent);
    }
  }, [state.isRunning, state.damagePercent, updatePrediction]);

  // 清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    // 状态
    params,
    state,
    alertState,
    
    // 计算值
    riskScore,
    criticalTime,
    recommendedInterval,
    
    // 操作
    updateParams,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    resetSimulation,
    performReposition,
    endRecovery,
    
    // 查询
    getRiskFactors,
    getEvents,
    getParamChangePoints,
    loadRecords: loadRecordsCallback,
    deleteRecord,
    formatTime,
    
    // 预测
    updatePrediction,
  };
};

export default useEnhancedSimulation;
