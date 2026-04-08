import { DataRecord } from '../../../shared/api/types';

interface EventDetailPanelProps {
  event: DataRecord | null;
  onClose: () => void;
  onAcknowledge: (event: DataRecord) => void;
  onResolve: (event: DataRecord) => void;
  isAcknowledging: boolean;
  isResolving: boolean;
}

export function EventDetailPanel({
  event,
  onClose,
  onAcknowledge,
  onResolve,
  isAcknowledging,
  isResolving,
}: EventDetailPanelProps) {
  if (!event) return null;

  const isEvent = event.data_category === 'event';
  const isActive = event.status === 'active';
  const isAcknowledged = event.status === 'acknowledged';
  const isResolved = event.status === 'resolved';

  const severityConfig = {
    info: { color: 'blue', label: '信息' },
    warning: { color: 'orange', label: '警告' },
    alert: { color: 'red', label: '警报' },
  };

  const statusConfig = {
    active: { color: 'red', label: '活跃' },
    acknowledged: { color: 'orange', label: '已确认' },
    resolved: { color: 'green', label: '已解决' },
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: 80,
        width: 320,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>
          {isEvent ? '事件详情' : '数据详情'}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <span style={{ color: '#666', fontSize: 12 }}>类型：</span>
          <span style={{ marginLeft: 8 }}>{event.data_type}</span>
        </div>

        <div>
          <span style={{ color: '#666', fontSize: 12 }}>时间：</span>
          <span style={{ marginLeft: 8 }}>
            {new Date(event.time).toLocaleString('zh-CN')}
          </span>
        </div>

        {isEvent && event.severity && (
          <div>
            <span style={{ color: '#666', fontSize: 12 }}>严重程度：</span>
            <span
              style={{
                marginLeft: 8,
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: severityConfig[event.severity]?.color || 'gray',
                color: 'white',
                fontSize: 12,
              }}
            >
              {severityConfig[event.severity]?.label || event.severity}
            </span>
          </div>
        )}

        {isEvent && event.status && (
          <div>
            <span style={{ color: '#666', fontSize: 12 }}>状态：</span>
            <span
              style={{
                marginLeft: 8,
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: statusConfig[event.status]?.color || 'gray',
                color: 'white',
                fontSize: 12,
              }}
            >
              {statusConfig[event.status]?.label || event.status}
            </span>
          </div>
        )}

        {event.value_numeric !== null && event.value_numeric !== undefined && (
          <div>
            <span style={{ color: '#666', fontSize: 12 }}>数值：</span>
            <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
              {event.value_numeric.toFixed(2)}
            </span>
          </div>
        )}

        {event.value_text && (
          <div>
            <span style={{ color: '#666', fontSize: 12 }}>文本：</span>
            <span style={{ marginLeft: 8 }}>{event.value_text}</span>
          </div>
        )}

        {event.payload && Object.keys(event.payload).length > 0 && (
          <div>
            <span style={{ color: '#666', fontSize: 12 }}>详细信息：</span>
            <pre
              style={{
                marginTop: 4,
                padding: 8,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
                fontSize: 11,
                overflow: 'auto',
                maxHeight: 150,
              }}
            >
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        )}

        {isEvent && isActive && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => onAcknowledge(event)}
              disabled={isAcknowledging}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: isAcknowledging ? 'wait' : 'pointer',
                fontSize: 14,
              }}
            >
              {isAcknowledging ? '确认中...' : '确认事件'}
            </button>
            <button
              onClick={() => onResolve(event)}
              disabled={isResolving}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: isResolving ? 'wait' : 'pointer',
                fontSize: 14,
              }}
            >
              {isResolving ? '解决中...' : '解决事件'}
            </button>
          </div>
        )}

        {isEvent && isAcknowledged && (
          <button
            onClick={() => onResolve(event)}
            disabled={isResolving}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: isResolving ? 'wait' : 'pointer',
              fontSize: 14,
            }}
          >
            {isResolving ? '解决中...' : '解决事件'}
          </button>
        )}
      </div>
    </div>
  );
}