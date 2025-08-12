import React from 'react';

type IconProps = {
    className?: string;
};

export const MagnusIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#3662E3', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#818CF8', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#4F46E5', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#A5B4FC', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="url(#grad1)" />
        <path opacity="0.7" d="M12 2V12L20 18V6L12 2Z" fill="url(#grad2)" />
        <path opacity="0.5" d="M4 6V18L12 12L4 6Z" fill="#FFFFFF" />
    </svg>
);


export const AgentIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.0001 8.00012C12.5524 8.00012 13.0001 8.44784 13.0001 9.00012L13.0001 11.0001C14.1047 11.0001 15.0001 11.8955 15.0001 13.0001L17.0001 13.0001C17.5524 13.0001 18.0001 13.4478 18.0001 14.0001C18.0001 15.8213 17.0531 17.4363 15.6015 18.3567L14.0001 15.5908C14.4446 14.9332 14.2833 14.0398 13.6257 13.5953C12.9681 13.1508 12.0746 13.3121 11.6301 13.9697L10.0381 11.2201C10.6304 10.9702 11.2783 10.8334 11.9612 10.8334C11.9741 10.8334 11.987 10.8335 12.0001 10.8335L12.0001 8.00012ZM11.0001 13.0001C11.0001 12.4478 10.5524 12.0001 10.0001 12.0001L8.00012 12.0001C8.00012 10.8955 7.10468 10.0001 6.00012 10.0001L6.00012 8.00012C6.00012 7.44784 6.44784 7.00012 7.00012 7.00012C8.82126 7.00012 10.4363 7.94709 11.3567 9.39864L13.1226 11.0001C12.4649 11.4446 12.0204 12.1858 12.0305 13.0001L11.0001 13.0001ZM12.0001 2.00012C17.523 2.00012 22.0001 6.47727 22.0001 12.0001C22.0001 17.523 17.523 22.0001 12.0001 22.0001C6.47727 22.0001 2.00012 17.523 2.00012 12.0001C2.00012 6.47727 6.47727 2.00012 12.0001 2.00012Z" />
    </svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.654H5.292a.75.75 0 01-.749-.654L3.495 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452z" clipRule="evenodd" />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l-3 3m3-3V12" />
    </svg>
);

export const GlobeAltIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918" />
    </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const SpeakerWaveIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM17.581 14.854a.75.75 0 001.06-1.06l-1.06 1.06zM16.5 12a4.5 4.5 0 01-1.401 3.192.75.75 0 001.06 1.06A6 6 0 0018 12a6 6 0 00-1.94-4.252.75.75 0 00-1.06 1.06A4.5 4.5 0 0116.5 12z" />
        <path d="M19.807 16.622a.75.75 0 001.06-1.06l-1.06 1.06zM19.5 12c0-1.93-1.013-3.613-2.5-4.595a.75.75 0 00-.914 1.19A6.995 6.995 0 0118 12c0 1.554-.51 2.97-1.407 4.122a.75.75 0 00.914 1.19C18.487 15.613 19.5 13.93 19.5 12z" />
    </svg>
);

export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06z" />
    </svg>
);

export const DocumentDuplicateIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.748 1.295 2.535 0 3.284L7.279 20.99c-1.25.722-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const ThoughtIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.505 20.995 2.25 18.257 2.25 15c0-1.372.486-2.645 1.303-3.646l1.01-1.011c.42-.42.885-.785 1.38-.1121l.493.493a1.125 1.125 0 001.589 0l.493-.493a1.125 1.125 0 011.59 0l.493.493a1.125 1.125 0 001.59 0l.493-.493a1.125 1.125 0 011.59 0l.493.493a1.125 1.125 0 001.59 0l1.01 1.011c.817 1.001 1.304 2.274 1.304 3.646 0 3.257-2.255 5.995-5.25 6.322z" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const ToolsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.66-4.66c-.384-.317-.626-.74-.766-1.208M11.42 15.17l-6.25 6.25a2.652 2.652 0 01-3.75 0l-.065-.065a2.652 2.652 0 010-3.75l6.25-6.25M3.75 8.25l4.66-4.66c.384-.317.626-.74.766-1.208M3.75 8.25l6.25-6.25a2.652 2.652 0 013.75 0l.065.065a2.652 2.652 0 010 3.75l-6.25 6.25m-6.25-6.25L9 3.75" />
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v.75a4.5 4.5 0 009 0v-.75a.75.75 0 011.5 0v.75a6 6 0 11-12 0v-.75a.75.75 0 01.75-.75z" />
    </svg>
);

export const PromptDJIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V7.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5v9.75a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25M9 9l4.5 1.5" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.04.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.127c-.331.183-.581.495-.644.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.212-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.505 20.995 2.25 18.257 2.25 15c0-1.372.486-2.645 1.303-3.646l1.01-1.011c.42-.42.885-.785 1.38-.1121l.493.493a1.125 1.125 0 001.589 0l.493-.493a1.125 1.125 0 011.59 0l.493.493a1.125 1.125 0 001.59 0l.493-.493a1.125 1.125 0 011.59 0l.493.493a1.125 1.125 0 001.59 0l1.01 1.011c.817 1.001 1.304 2.274 1.304 3.646 0 3.257-2.255 5.995-5.25 6.322z" />
    </svg>
);

export const TelescopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
    </svg>
);

export const VideoCameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-2.845l3.248 2.32a.75.75 0 001.252-.634V7.659a.75.75 0 00-1.252-.634L15.75 9.345V7.5a3 3 0 00-3-3H4.5z" />
    </svg>
);

export const MusicNoteIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.5 11.25a.75.75 0 01-.75.75h-3.75v3.375c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-7.5a3.375 3.375 0 013.375-3.375h3.375a.75.75 0 01.75.75v3.75z" />
        <path d="M9.434 2.284a2.25 2.25 0 013.132 0l3 3a2.25 2.25 0 01-3.132 3.132L9 5.25V16.5a.75.75 0 01-1.5 0V5.25l-3.216 3.182a2.25 2.25 0 11-3.132-3.132l3-3z" />
    </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a21.755 21.755 0 005.443-5.262 21.756 21.756 0 00-5.443-15.013A1.5 1.5 0 0012 1.5a1.5 1.5 0 00-1.071.442A21.755 21.755 0 005.486 17.09a21.756 21.756 0 005.443 5.262l.071.041zM12 12a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);

export const PaperclipIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a4.5 4.5 0 106.364 6.364l10.94-10.94A3 3 0 1016.5 4.5l-10.94 10.94a1.5 1.5 0 102.121 2.121l10.94-10.94a.75.75 0 00-1.06-1.06l-10.94 10.94a3 3 0 11-4.243-4.243l10.94-10.94a2.25 2.25 0 013.182 0z" clipRule="evenodd" />
    </svg>
);

export const AppsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M1.5 3A1.5 1.5 0 013 1.5h18A1.5 1.5 0 0122.5 3v18a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 21V3zM3.75 20.25h16.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v16.5a.75.75 0 00.75.75z" clipRule="evenodd" />
        <path d="M8.25 7.5h1.5v1.5h-1.5V7.5zm3 0h1.5v1.5h-1.5V7.5zm3 0h1.5v1.5h-1.5V7.5zm-6 3h1.5v1.5h-1.5v-1.5zm3 0h1.5v1.5h-1.5v-1.5zm3 0h1.5v1.5h-1.5v-1.5zm-6 3h1.5v1.5h-1.5v-1.5zm3 0h1.5v1.5h-1.5v-1.5zm3 0h1.5v1.5h-1.5v-1.5z" />
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
    </svg>
);

export const GoogleDriveIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7.71,3.5,1.5,14,4.5,19.5,10.7,9Z" style={{ fill: "#00ac47" }} />
        <path d="M16.5,3.5,10.5,14l3,5.5,6-10.5Z" style={{ fill: "#ffc107" }} />
        <path d="M15,19,9.2,9H22.5L15,19Z" style={{ fill: "#2684fc" }} />
    </svg>
);

export const OneDriveIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.01 6.22c-2.03.09-3.95.83-5.38 2.06-.55.48-1.05 1-1.46 1.59-.87 1.25-1.39 2.76-1.4 4.31-.02 2.91 2.06 5.48 4.93 5.75h10.66c2.4 0 4.34-1.94 4.34-4.34s-1.94-4.34-4.34-4.34c-.18 0-.36.01-.53.04-1.22-2.45-3.8-4.04-6.63-3.98l-.49.01z" style={{ fill: "#0078d4" }} />
    </svg>
);

export const SharePointIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.01 6.22c-2.03.09-3.95.83-5.38 2.06-.55.48-1.05 1-1.46 1.59-.87 1.25-1.39 2.76-1.4 4.31-.02 2.91 2.06 5.48 4.93 5.75h10.66c2.4 0 4.34-1.94 4.34-4.34s-1.94-4.34-4.34-4.34c-.18 0-.36.01-.53.04-1.22-2.45-3.8-4.04-6.63-3.98l-.49.01z" style={{ fill: "#0078d4" }} />
        <circle cx="9" cy="15" r="4" style={{ fill: "#fff" }} />
        <path d="M9.5,15a.5.5 0 0,1-.5.5h-1a.5.5 0 0,1,0-1h1A.5.5 0 0,1 9.5,15Z" style={{ fill: "#0078d4" }} />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.002A9.03 9.03 0 0112 21a9.03 9.03 0 01-3.042-.998M21 12a9.03 9.03 0 01-2.998-3.042m.998-3.042A9.03 9.03 0 0112 3a9.03 9.03 0 01-3.042.998m18.004 9.004A9.03 9.03 0 0121 12a9.03 9.03 0 01-2.998 3.042M3 12a9.03 9.03 0 01.998 3.042M3.998 8.958A9.03 9.03 0 013 12a9.03 9.03 0 01.998-3.042m15.006 12.084A9.03 9.03 0 0112 21a9.03 9.03 0 01-3.042-.998M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const TheaterMasksIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.343c.966-.543 2.126-.543 3.092 0l3.05 1.725a2.25 2.25 0 011.108 1.949v5.438a2.25 2.25 0 01-1.108 1.95l-3.05 1.725c-.966.543-2.126.543-3.092 0l-3.05-1.725a2.25 2.25 0 01-1.108-1.95v-5.438a2.25 2.25 0 011.108-1.949l3.05-1.725z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-3.75-2.25a3 3 0 00-3 3" />
    </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-19.5 0c1.01-.203 2.01-.377 3-.52M4.5 19.5c-1.01.203-2.01.377-3 .52m19.5 0c-1.01-.143-2.01-.317-3-.52M12 4.5v15.75" />
    </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.289 2.72a9.094 9.094 0 013.741-.479 3 3 0 01-4.682-2.72m-7.289 2.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72M12 12.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9zM3.75 8.25a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm18 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
    </svg>
);

export const BoltIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a1.125 1.125 0 00-1.125 1.125v3.375m0 0h-6.75v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a1.125 1.125 0 00-1.125 1.125v3.375m9 0h1.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v6.75a2.25 2.25 0 002.25 2.25h1.5" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A9.75 9.75 0 0110.5 18.75a.75.75 0 001.5 0c0-1.91.828-3.682 2.175-4.943a.75.75 0 10-1.06-1.06c-1.028 1.028-1.665 2.368-1.665 3.825a.75.75 0 001.5 0c0-.821.336-1.58.878-2.121a.75.75 0 00-1.06-1.062a4.502 4.502 0 01-1.612 1.612.75.75 0 001.06 1.061a3.001 3.001 0 002.122-5.228.75.75 0 00-1.06-1.06 1.5 1.5 0 01-2.122 2.122.75.75 0 001.06 1.06 3 3 0 004.242-4.242.75.75 0 00-1.06-1.06 1.5 1.5 0 01-2.122 2.122.75.75 0 001.06 1.06a3 3 0 004.242-4.242.75.75 0 00-1.06-1.06c-.39.39-.754.81-1.082 1.259a.75.75 0 001.044 1.086 4.5 4.5 0 01-1.414-1.414.75.75 0 00-1.06-1.061 3 3 0 00-4.242 0 .75.75 0 001.06 1.06 1.5 1.5 0 012.122 0 .75.75 0 001.06-1.06 3 3 0 00-4.242 0 .75.75 0 001.06 1.06 1.5 1.5 0 012.122 0 .75.75 0 001.06-1.06 4.5 4.5 0 01-1.766-3.232.75.75 0 00-1.488-.068 3.001 3.001 0 00-1.854 5.394.75.75 0 001.052 1.072A1.5 1.5 0 019 18.75a.75.75 0 00-1.5 0 3 3 0 01-3-3 .75.75 0 00-1.5 0 4.5 4.5 0 004.5 4.5.75.75 0 00.75-.75c0-2.546 2.07-4.638 4.697-4.944a.75.75 0 00.266-1.493z" clipRule="evenodd" />
    </svg>
);