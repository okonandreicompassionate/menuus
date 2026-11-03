import React from 'react';

export const Menu360Mark: React.FC<{ size?: number; dark?: boolean; className?: string }> = ({
  size = 40,
  dark = false,
  className = '',
}) => (
  <svg
    data-brand-mark
    viewBox="0 0 160 160"
    width={size}
    height={size}
    role="img"
    aria-label="menu360°"
    className={className}
  >
    <circle
      cx="80" cy="80" r="70" fill="none"
      stroke={dark ? '#FBF6EA' : '#D9480F'}
      strokeWidth="8" strokeLinecap="round" strokeDasharray="400 40"
      transform="rotate(-60 80 80)"
    />
    <g transform="translate(76.3 10.1) rotate(-3)">
      <polygon points="-4,-14 -4,14 18,0" fill={dark ? '#FBF6EA' : '#D9480F'} />
    </g>
    <circle cx="80" cy="80" r="48" fill={dark ? '#F2A31B' : '#008751'} />
    <path
      d="M60 62V76Q60 83 66 83Q72 83 72 76V62M66 62V100M94 62V100"
      fill="none" stroke={dark ? '#0B2E1F' : '#FBF6EA'} strokeWidth="4.5"
      strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M94 62C103 66 103 82 94 86Z"
      fill={dark ? '#0B2E1F' : '#FBF6EA'}
      stroke={dark ? '#0B2E1F' : '#FBF6EA'} strokeWidth="3" strokeLinejoin="round"
    />
  </svg>
);

export const Menu360Wordmark: React.FC<{ dark?: boolean; compact?: boolean }> = ({ dark = false, compact = false }) => (
  <span className={`menu360-wordmark ${compact ? 'menu360-wordmark-compact' : ''} ${dark ? 'menu360-wordmark-dark' : ''}`}>
    <span>menu</span><span className="menu360-number">360</span><span className="menu360-degree">°</span>
  </span>
);

export const Menu360Logo: React.FC<{ dark?: boolean; markSize?: number; className?: string }> = ({
  dark = false,
  markSize = 42,
  className = '',
}) => (
  <span className={`menu360-lockup ${className}`}>
    <Menu360Mark size={markSize} dark={dark} />
    <Menu360Wordmark dark={dark} compact />
  </span>
);

export const Menu360Loader: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="menu360-loader" role="status" aria-label={label}>
    <svg viewBox="0 0 160 160" width="84" height="84" aria-hidden="true">
      <g className="menu360-loader-orbit">
        <circle cx="80" cy="80" r="70" fill="none" stroke="#D9480F" strokeWidth="8" strokeLinecap="round" strokeDasharray="400 40" transform="rotate(-60 80 80)" />
        <g transform="translate(76.3 10.1) rotate(-3)"><polygon points="-4,-14 -4,14 18,0" fill="#D9480F" /></g>
      </g>
      <circle cx="80" cy="80" r="48" fill="#008751" />
      <path d="M60 62V76Q60 83 66 83Q72 83 72 76V62M66 62V100M94 62V100" fill="none" stroke="#FBF6EA" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M94 62C103 66 103 82 94 86Z" fill="#FBF6EA" stroke="#FBF6EA" strokeWidth="3" strokeLinejoin="round" />
    </svg>
    <span>{label}</span>
  </div>
);

export const Menu360HopLoader: React.FC<{ label?: string }> = ({ label }) => (
  <span className="menu360-hop-loader" role="status" aria-label={label || 'Loading'}>
    <span /><span /><span />
    {label && <span className="menu360-hop-label">{label}</span>}
  </span>
);

export const Menu360Progress: React.FC<{ label?: string }> = ({ label = 'Loading menu' }) => (
  <div className="menu360-progress-wrap" role="status">
    <p>{label}</p>
    <div className="menu360-progress"><span /></div>
  </div>
);

export const Menu360AdireBand: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`menu360-adire-band ${className}`} viewBox="0 0 780 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id="menu360-adire" width="55" height="55" patternUnits="userSpaceOnUse">
        <rect width="55" height="55" fill="#008751" />
        <circle cx="27.5" cy="27.5" r="19" fill="none" stroke="#FBF6EA" strokeWidth="3" />
        <circle cx="27.5" cy="27.5" r="9" fill="#F2A31B" />
        <path d="M0 0l8 8M55 0l-8 8M0 55l8-8M55 55l-8-8" stroke="#FBF6EA" strokeWidth="3" strokeLinecap="round" />
      </pattern>
    </defs>
    <rect width="780" height="110" rx="16" fill="url(#menu360-adire)" />
  </svg>
);

export const Menu360FoodIcon: React.FC<{ kind: 'jollof' | 'suya' | 'plantain' | 'puffpuff' | 'soup' | 'zobo' | 'pie' | 'menu'; size?: number }> = ({
  kind,
  size = 38,
}) => {
  const paths: Record<typeof kind, React.ReactNode> = {
    jollof: <><path d="M10 22h28v10a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z" fill="#008751" /><path d="M8 22h32M10 27H5M38 27h5M24 22v-3M17 15c-2-3 2-4 0-7M26 15c-2-3 2-4 0-7" /></>,
    suya: <><path d="M7 41L41 7" /><rect x="-6" y="-4.5" width="12" height="9" rx="2.5" transform="translate(16 32) rotate(-45)" fill="#D9480F" /><rect x="-6" y="-4.5" width="12" height="9" rx="2.5" transform="translate(24 24) rotate(-45)" fill="#D9480F" /><rect x="-6" y="-4.5" width="12" height="9" rx="2.5" transform="translate(32 16) rotate(-45)" fill="#D9480F" /></>,
    plantain: <><path d="M8 30C12 14 30 8 40 12C36 20 32 34 14 38C10 38 8 34 8 30z" fill="#F2A31B" /><path d="M14 30C20 22 28 18 36 15" /></>,
    puffpuff: <><circle cx="16" cy="31" r="9" fill="#F2A31B" /><circle cx="32" cy="31" r="9" fill="#F2A31B" /><circle cx="24" cy="17" r="9" fill="#F2A31B" /></>,
    soup: <><path d="M6 24h36c0 9-8 16-18 16S6 33 6 24z" fill="#008751" /><path d="M16 17c-2-3 2-4 0-7M24 17c-2-3 2-4 0-7M32 17c-2-3 2-4 0-7M16 43h16" /></>,
    zobo: <><path d="M14 14h20l-3 27H17z" fill="#D9480F" /><path d="M26 22L32 6" /><circle cx="35" cy="14" r="5" fill="#F2A31B" /></>,
    pie: <><path d="M6 33a18 18 0 0 1 36 0z" fill="#F2A31B" /><path d="M11 38h26" strokeDasharray="2 3.5" /><path d="M17 27l2 3M24 23v4M31 27l-2 3" /></>,
    menu: <><rect x="12" y="6" width="24" height="36" rx="4" fill="#FBF6EA" /><path d="M18 16h12M18 23h12M18 30h7" /><circle cx="33" cy="34" r="7" fill="#008751" /><path d="M30 34l2.2 2.2L36.5 31.5" stroke="#FBF6EA" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="#0B2E1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
};
