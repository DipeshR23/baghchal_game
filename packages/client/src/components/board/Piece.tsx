import React from 'react';
import { motion } from 'framer-motion';
import { PieceType } from '@baghchal/shared';

interface PieceProps {
  type: PieceType;
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const Piece: React.FC<PieceProps> = ({
  type,
  selected,
  onClick,
  disabled = false,
}) => {
  const isTiger = type === PieceType.Tiger;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: 0,
        boxShadow: selected 
          ? (isTiger ? '0 0 16px 4px rgba(249, 115, 22, 0.6)' : '0 0 16px 4px rgba(226, 232, 240, 0.5)')
          : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={disabled ? {} : { scale: 1.1, cursor: 'pointer' }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={(e) => {
        if (!disabled && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`
        w-full h-full rounded-full flex items-center justify-center relative select-none transition-transform duration-100
        ${selected ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-105' : ''}
        ${isTiger ? 'ring-orange-500' : 'ring-slate-300'}
      `}
    >
      {isTiger ? (
        // Tiger Piece Design
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center p-[10%]">
          {/* Inner details / stylized tiger head */}
          <svg viewBox="0 0 32 32" className="w-full h-full text-slate-950" fill="currentColor">
            {/* Stylized Tiger Mask */}
            <path d="M16 2L6 8v6c0 6.6 4.4 12.2 10 14 5.6-1.8 10-7.4 10-14V8L16 2z" opacity="0.15" />
            {/* Eyes */}
            <polygon points="9,14 13,14 11,17" />
            <polygon points="23,14 19,14 21,17" />
            {/* Stripes */}
            <path d="M5,10 L11,11 M27,10 L21,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4,13 L10,13 M28,13 L22,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6,16 L12,15 M26,16 L20,15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Nose & Snout */}
            <polygon points="16,19 13,16 19,16" />
            <path d="M16,19 L16,23 M14,24 L16,23 L18,24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Forehead stripes */}
            <path d="M14,6 L18,6 M13,9 L19,9 M15,12 L17,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        // Goat Piece Design
        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-50 via-slate-200 to-slate-400 flex items-center justify-center p-[10%] shadow-inner">
          {/* Inner details / stylized goat head */}
          <svg viewBox="0 0 32 32" className="w-full h-full text-slate-800" fill="currentColor">
            {/* Horns */}
            <path d="M11,10 C10,6 14,4 15,9 C15.5,10 15,11 15,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M21,10 C22,6 18,4 17,9 C16.5,10 17,11 17,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Ears */}
            <path d="M6,12 C4,13 6,15 10,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M26,12 C28,13 26,15 22,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Face/Muzzle */}
            <path d="M12,12 L20,12 L18,24 L14,24 Z" />
            {/* Eyes */}
            <circle cx="13.5" cy="15" r="1.5" fill="currentColor" className="text-slate-100" />
            <circle cx="18.5" cy="15" r="1.5" fill="currentColor" className="text-slate-100" />
            {/* Nose */}
            <polygon points="16,21 14,19 18,19" fill="currentColor" className="text-slate-900" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
export { Piece as default };
