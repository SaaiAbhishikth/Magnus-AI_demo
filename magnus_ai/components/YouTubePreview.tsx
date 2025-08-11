import React, { useState } from 'react';
import { YouTubePlayer } from './YouTubePlayer';
import { PlayIcon } from './icons/Icons';

interface YouTubePreviewProps {
    videoId: string;
    songTitle: string;
    artistName: string;
}

export const YouTubePreview: React.FC<YouTubePreviewProps> = ({ videoId, songTitle, artistName }) => {
    const [hasBeenClicked, setHasBeenClicked] = useState(false);
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const handlePlayClick = () => {
        setHasBeenClicked(true);
    };

    if (hasBeenClicked) {
        return <YouTubePlayer videoId={videoId} />;
    }

    return (
        <div 
            className="relative group aspect-video w-full overflow-hidden rounded-lg mt-3 border border-gray-700/50 cursor-pointer"
            onClick={handlePlayClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayClick() }}
            aria-label={`Play video: ${songTitle} by ${artistName}`}
        >
            <img 
                src={thumbnailUrl} 
                alt={`Thumbnail for ${songTitle}`} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                <div className="p-4 bg-black/70 rounded-full transition-transform group-hover:scale-110">
                    <PlayIcon className="w-8 h-8 text-white" />
                </div>
            </div>
             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <h3 className="font-bold text-white text-base truncate drop-shadow-md">{songTitle}</h3>
                <p className="text-sm text-gray-200 truncate drop-shadow-md">{artistName}</p>
            </div>
        </div>
    );
};