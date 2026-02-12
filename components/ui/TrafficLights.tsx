import React from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

interface TrafficLightsProps {
    onAction?: (action: 'close' | 'minimize' | 'maximize') => void;
}

export const TrafficLights: React.FC<TrafficLightsProps> = ({ onAction }) => {
    const handleAction = (action: 'close' | 'minimize' | 'maximize') => {
        if (onAction) onAction(action);

        console.log(`Window action: ${action}`);
        if (action === 'maximize') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((e) => console.log(e));
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    };

    return (
        <div className="flex items-center gap-2 group">
            <button
                onClick={() => handleAction('close')}
                className="w-3 h-3 rounded-full bg-[#FF5F57] flex items-center justify-center relative overflow-hidden focus:outline-none"
            >
                <X className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100 absolute" strokeWidth={3} />
            </button>
            <button
                onClick={() => handleAction('minimize')}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] flex items-center justify-center relative overflow-hidden focus:outline-none"
            >
                <Minus className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100 absolute" strokeWidth={3} />
            </button>
            <button
                onClick={() => handleAction('maximize')}
                className="w-3 h-3 rounded-full bg-[#28C840] flex items-center justify-center relative overflow-hidden focus:outline-none"
            >
                <Maximize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100 absolute" strokeWidth={3} />
            </button>
        </div>
    );
};
