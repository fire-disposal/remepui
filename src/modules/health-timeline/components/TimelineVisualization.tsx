import { useRef, useEffect } from 'react';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import type { DataRecord } from '../../../shared/api/types';

interface TimelineVisualizationProps {
  data: DataRecord[];
  width: number;
  height: number;
  startTime: Date;
  endTime: Date;
  onEventClick: (event: DataRecord) => void;
  onEventHover: (event: DataRecord | null) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  info: '#2196F3',
  warning: '#FF9800',
  alert: '#F44336',
};

const DATA_TYPE_COLORS: Record<string, string> = {
  heart_rate: '#E91E63',
  blood_pressure: '#3F51B5',
  temperature: '#FF5722',
  spo2: '#9C27B0',
  respiratory_rate: '#00BCD4',
  blood_glucose: '#795548',
  fall_detection: '#E91E63',
  pressure_alert: '#9C27B0',
  default: '#607D8B',
};

export function TimelineVisualization({
  data,
  width,
  height,
  startTime,
  endTime,
  onEventClick,
  onEventHover,
}: TimelineVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    if (data.length === 0) return;
    if (width <= 0 || height <= 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = scaleTime()
      .domain([startTime, endTime])
      .range([0, innerWidth]);

    const yScale = scaleLinear()
      .domain([0, data.length + 1])
      .range([innerHeight, 0]);

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(10))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .ticks(10)
          .tickFormat((d) => {
            const date = d as Date;
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          })
      )
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#666');

    data.forEach((record, index) => {
      const cx = xScale(new Date(record.time));
      const cy = yScale(index + 1);
      const isEvent = record.data_category === 'event';
      const baseColor = DATA_TYPE_COLORS[record.data_type] || DATA_TYPE_COLORS.default;
      const severityColor = SEVERITY_COLORS[record.severity || ''] || baseColor;
      const fillColor = isEvent ? severityColor : baseColor;
      const size = isEvent ? 10 : 8;

      const point = g.append('g')
        .attr('class', 'data-point')
        .style('cursor', 'pointer');

      if (isEvent) {
        point
          .append('rect')
          .attr('x', cx - size)
          .attr('y', cy - size)
          .attr('width', size * 2)
          .attr('height', size * 2)
          .attr('transform', `rotate(45, ${cx}, ${cy})`)
          .attr('fill', fillColor)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('opacity', record.status === 'active' ? 1 : record.status === 'acknowledged' ? 0.8 : 0.6);
      } else {
        point
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', size)
          .attr('fill', fillColor)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
      }

      point
        .on('mouseenter', function() {
          select(this).raise();
          if (isEvent) {
            select(this).select('rect').attr('stroke-width', 3);
          } else {
            select(this).select('circle').attr('stroke-width', 3);
          }
          onEventHover(record);
        })
        .on('mouseleave', function() {
          if (isEvent) {
            select(this).select('rect').attr('stroke-width', 2);
          } else {
            select(this).select('circle').attr('stroke-width', 2);
          }
          onEventHover(null);
        })
        .on('click', function() {
          onEventClick(record);
        });
    });

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`);

    const legendItems = [
      { shape: 'diamond', color: '#F44336', label: '警报事件' },
      { shape: 'diamond', color: '#FF9800', label: '警告事件' },
      { shape: 'diamond', color: '#2196F3', label: '信息事件' },
      { shape: 'circle', color: '#E91E63', label: '指标数据' },
    ];

    legendItems.forEach((item, i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      if (item.shape === 'diamond') {
        lg.append('rect')
          .attr('x', 0)
          .attr('y', -6)
          .attr('width', 12)
          .attr('height', 12)
          .attr('transform', 'rotate(45, 6, 0)')
          .attr('fill', item.color);
      } else {
        lg.append('circle')
          .attr('cx', 6)
          .attr('cy', 0)
          .attr('r', 6)
          .attr('fill', item.color);
      }

      lg.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .style('font-size', '11px')
        .text(item.label);
    });

  }, [data, width, height, startTime, endTime, onEventClick, onEventHover]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ backgroundColor: '#fafafa' }}
    />
  );
}