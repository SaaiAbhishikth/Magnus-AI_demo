import React, { useState } from 'react';
import { type YouTubeSearchResult } from '../types';
import { AgentIcon } from './icons/Icons';
import { YouTubePlayer } from './YouTubePlayer';
import { PlayIcon } from './icons/Icons';

const YouTubeSearchResultItem: React.FC<{
  result: YouTubeSearchResult;
  onSelect: () => void;
}> = ({ result, onSelect }) => {
  const thumbnailUrl = result.videoId ? `https://i.ytimg.com/vi/${result.videoId}/mqdefault.jpg` : '';
  const description = result.description.length > 100 ? `${result.description.substring(0, 100)}...` : result.description;

  return (
    <button
      onClick={onSelect}
      className="flex items-start gap-3 w-full p-3 rounded-lg text-left transition-colors hover:bg-primary/50"
    >
      <div className="w-32 shrink-0">
        <div className="relative aspect-video bg-primary rounded-md overflow-hidden group">
          {thumbnailUrl && <img src={thumbnailUrl} alt={result.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-black/70 rounded-full">
                <PlayIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-text-primary leading-tight line-clamp-2">{result.title}</h4>
        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{description}</p>
      </div>
    </button>
  );
};


interface YouTubeSearchResultsProps {
  results: YouTubeSearchResult[];
  searchQuery: string;
}

export const YouTubeSearchResults: React.FC<YouTubeSearchResultsProps> = ({ results, searchQuery }) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const selectedVideo = selectedVideoId ? results.find(r => r.videoId === selectedVideoId) : null;

  return (
    <div className="flex items-start gap-3 w-full justify-start flex-row">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600 self-start mt-1">
            <AgentIcon className="w-6 h-6 text-white" />
        </div>
        <div className="bg-bubble-model text-text-primary p-4 rounded-2xl rounded-bl-none max-w-2xl w-full">
            {selectedVideoId && selectedVideo ? (
                <>
                    <div className="mb-2">
                        <p className="text-sm text-text-secondary">Now Playing:</p>
                        <h3 className="font-bold text-text-primary text-base truncate">{selectedVideo.title}</h3>
                    </div>
                    <YouTubePlayer videoId={selectedVideoId} />
                </>
            ) : (
                <>
                    <h3 className="text-base font-semibold text-text-primary mb-2">Video search results for: "{searchQuery}"</h3>
                    <div className="space-y-1 -m-3 mt-0">
                        <div className="max-h-[28rem] overflow-y-auto p-3">
                            {results.map((result, index) => (
                                <YouTubeSearchResultItem key={index} result={result} onSelect={() => setSelectedVideoId(result.videoId)} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
