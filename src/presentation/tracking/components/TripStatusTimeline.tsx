import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { TripTimelineStep } from '../utils/tripStatusCopy';

interface Props {
  steps: TripTimelineStep[];
}

const timeFormatter = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' });

export const TripStatusTimeline: React.FC<Props> = ({ steps }) => {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isReached = step.isDone || step.isActive;

        return (
          <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={clsx(
                  'absolute left-[11px] top-6 w-0.5 h-full -translate-x-1/2',
                  step.isDone ? 'bg-champagne-gold' : 'bg-gray-200'
                )}
              />
            )}

            <span
              className={clsx(
                'relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0',
                step.isDone && 'bg-champagne-gold border-champagne-gold',
                step.isActive && !step.isDone && 'border-champagne-gold bg-white',
                !isReached && 'border-gray-300 bg-white'
              )}
            >
              {step.isDone ? (
                <Check className="w-3.5 h-3.5 text-obsidian" />
              ) : (
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    step.isActive ? 'bg-champagne-gold animate-pulse' : 'bg-gray-300'
                  )}
                />
              )}
            </span>

            <div className="pt-0.5">
              <p className={clsx('text-sm font-semibold', isReached ? 'text-gray-900' : 'text-gray-400')}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-gray-400">{timeFormatter.format(new Date(step.timestamp))}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
