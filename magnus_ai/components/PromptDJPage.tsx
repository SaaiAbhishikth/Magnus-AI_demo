import React from 'react';

export const PromptDJPage: React.FC = () => {
    return (
        <iframe
            src="/promptdj.html"
            title="PromptDJ"
            style={{
                width: '100vw',
                height: '100vh',
                border: 'none',
                display: 'block',
            }}
        />
    );
};
