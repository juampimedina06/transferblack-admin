import React from 'react';
import CountUp from 'react-countup';

// Interop para Vite / CJS donde CountUp puede importarse como un objeto con propiedad default
const CountUpComponent = ((CountUp as unknown as { default?: React.ComponentType<any> })?.default || CountUp) as React.ComponentType<any>;

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  decimal?: string;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 0.6,
  decimals = 0,
  decimal = ',',
  separator = '.',
  prefix = '',
  suffix = '',
  className,
}) => {
  return (
    <CountUpComponent
      end={value}
      duration={duration}
      decimals={decimals}
      decimal={decimal}
      separator={separator}
      prefix={prefix}
      suffix={suffix}
      preserveValue
      className={className}
    />
  );
};
