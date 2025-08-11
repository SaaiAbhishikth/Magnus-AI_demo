import { useEffect, useCallback } from 'react';
import { type ChatFile } from '../types';
import { MICROSOFT_CLIENT_ID } from '../config';

declare const OneDrive: any;

interface OneDrivePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onFilesReady: (files: ChatFile[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    accessToken: string | null;
    source: 'onedrive' | 'sharepoint';
}

export const OneDrivePicker: React.FC<OneDrivePickerProps> = ({ isOpen, onClose, onFilesReady, setIsLoading, accessToken, source }) => {
    
    const handlePickerCallback = useCallback(async (response: any) => {
        if (response.value.length > 0) {
            setIsLoading(true);
            const filesToProcess = response.value;
            const chatFiles: ChatFile[] = [];

            for (const file of filesToProcess) {
                try {
                    const downloadUrl = file['@microsoft.graph.downloadUrl'];
                    if (!downloadUrl) {
                        throw new Error(`No download URL available for ${file.name}. It might be a folder.`);
                    }
                    
                    const res = await fetch(downloadUrl); // MS Graph download URLs are pre-authenticated for a short time
                    if (!res.ok) throw new Error(`Failed to download ${file.name}`);
                    
                    const blob = await res.blob();
                    const url = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    chatFiles.push({
                        name: file.name,
                        type: file.file.mimeType,
                        size: file.size,
                        url: url,
                    });
                } catch (err) {
                    console.error(`Error processing file ${file.name}:`, err);
                    alert(`Could not process file: ${file.name}. It might be a folder or a file type that cannot be downloaded.`);
                }
            }
            
            onFilesReady(chatFiles);
            setIsLoading(false);
        }
        onClose();
    }, [onClose, onFilesReady, setIsLoading]);

    const createPicker = useCallback(() => {
        if (!accessToken) {
            console.error("Cannot create OneDrive picker without an access token.");
            onClose();
            return;
        }

        const endpointHint = source === 'sharepoint'
            ? "https://graph.microsoft.com/v1.0/sites/root" // Start at the tenant's root SharePoint site
            : "https://graph.microsoft.com/v1.0/me/drive/root"; // Default to user's OneDrive

        const odOptions = {
            clientId: MICROSOFT_CLIENT_ID,
            action: "query", // Use query to get download URLs
            multiSelect: true,
            advanced: {
                accessToken: accessToken,
                endpointHint: endpointHint, 
            },
            success: handlePickerCallback,
            cancel: onClose,
            error: (e: any) => {
                console.error("OneDrive Picker Error:", e);
                alert("Could not open the file picker. Please ensure you have granted permissions and check the console.");
                onClose();
            }
        };
        
        if (typeof OneDrive !== 'undefined' && OneDrive.open) {
             OneDrive.open(odOptions);
        } else {
            console.error("OneDrive SDK not loaded.");
            alert("OneDrive SDK is not available. Please try again later.");
            onClose();
        }

    }, [accessToken, handlePickerCallback, onClose, source]);

    useEffect(() => {
        if (isOpen) {
            createPicker();
        }
    }, [isOpen, createPicker]);
    
    // This component is a controller, it does not render any UI itself.
    return null; 
};