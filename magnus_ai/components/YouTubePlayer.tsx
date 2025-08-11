import React from 'react';

interface YouTubePlayerProps {
    videoId: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return (
        <div className="w-full mt-3 space-y-2">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-700/50 bg-primary">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>
            <div className="px-2 py-1.5 text-xs text-text-secondary text-center bg-primary/40 rounded-md">
                <span>Video unavailable? It may be private or require a specific account. </span>
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                >
                    Watch on YouTube
                </a>
            </div>
        </div>
    );
};
