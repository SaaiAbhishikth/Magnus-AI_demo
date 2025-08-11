
import React from 'react';
import { type LocationInfo } from '../types';

interface MapDisplayProps {
  locationInfo: LocationInfo;
  mapsApiKey: string;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ locationInfo, mapsApiKey }) => {
    const { latitude, longitude, name, address } = locationInfo;
    const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${mapsApiKey}&center=${latitude},${longitude}&zoom=14`;
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;

    return (
        <div className="w-full mt-3 space-y-2">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-gray-700/50 bg-primary">
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={embedUrl}
                    title={`Map of ${name}`}
                >
                </iframe>
            </div>
            <div className="px-1">
                 <h4 className="font-semibold text-text-primary">{name}</h4>
                 {address && <p className="text-sm text-text-secondary">{address}</p>}
                 <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                    View on Google Maps
                 </a>
            </div>
        </div>
    );
};
