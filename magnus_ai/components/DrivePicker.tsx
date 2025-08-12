
import { useEffect } from 'react';
import { type ChatFile } from '../types';

declare const gapi: any;
declare const google: any;

interface DrivePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onFilesReady: (files: ChatFile[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    apiKey: string;
    accessToken: string | null;
}

export const DrivePicker: React.FC<DrivePickerProps> = ({ isOpen, onClose, onFilesReady, setIsLoading, apiKey, accessToken }) => {

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const createAndShowPicker = () => {
            if (!accessToken) {
                alert("Cannot open Google Drive: Authentication token is missing. Please try logging in again.");
                onClose();
                return;
            }

            if (!google?.picker) {
                alert("Google Picker API is not available. This might be a temporary network issue. Please try again.");
                console.error("`google.picker` is undefined even after gapi.load callback.");
                onClose();
                return;
            }

            const pickerCallback = async (data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                    setIsLoading(true);
                    const filesToProcess = data[google.picker.Response.DOCUMENTS];
                    const chatFiles: ChatFile[] = [];

                    for (const file of filesToProcess) {
                        try {
                            const res = await fetch(
                                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                                { headers: { 'Authorization': `Bearer ${accessToken}` } }
                            );
                            if (!res.ok) {
                                const errorBody = await res.text();
                                console.error(`Failed to download ${file.name}: ${res.statusText}`, errorBody);
                                throw new Error(`Failed to download ${file.name}`);
                            }

                            const blob = await res.blob();
                            const url = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsDataURL(blob);
                            });

                            chatFiles.push({
                                name: file.name,
                                type: file.mimeType || blob.type,
                                size: file.sizeBytes || blob.size,
                                url: url,
                            });
                        } catch (err: any) {
                            console.error(`Error processing file ${file.name}:`, err);
                            alert(`Could not process file: ${file.name}. You may not have permission to download it. Error: ${err.message}`);
                        }
                    }
                    
                    if (chatFiles.length > 0) {
                        onFilesReady(chatFiles);
                    }
                    setIsLoading(false);
                }
                onClose();
            };
            
            try {
                // Build the picker
                const picker = new google.picker.PickerBuilder()
                    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                    .setOAuthToken(accessToken)
                    .setOrigin(window.location.origin)
                    .setDeveloperKey(apiKey)
                    .setCallback(pickerCallback)
                    // The .setIncludeFolders(true) method is a recurring source of errors.
                    // The picker allows folder navigation by default, so we remove this specific
                    // method to ensure stability while retaining core functionality.
                    .addView(new google.picker.View(google.picker.ViewId.DOCS))
                    .addView(new google.picker.View(google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS))
                    .addView(new google.picker.View(google.picker.ViewId.PRESENTATIONS))
                    .addView(new google.picker.View(google.picker.ViewId.SPREADSHEETS))
                    .addView(new google.picker.View(google.picker.ViewId.DOCUMENTS))
                    .addView(new google.picker.View(google.picker.ViewId.PDFS))
                    .addView(new google.picker.DocsUploadView())
                    .build();
                
                picker.setVisible(true);
            } catch (e: any) {
                console.error("Error building or showing the picker:", e);
                alert(`An error occurred while building the Google Drive picker: ${e.message}. This could be due to an invalid API key or a configuration issue.`);
                onClose();
            }
        };

        if (typeof gapi !== 'undefined' && gapi.load) {
            gapi.load('picker', { 'callback': createAndShowPicker });
        } else {
            alert("Google's core API scripts failed to load. Please check your network connection or ad-blocker and refresh the page.");
            onClose();
        }

    }, [isOpen, accessToken, apiKey, onClose, onFilesReady, setIsLoading]);

    // This is a controller component and doesn't render anything itself.
    return null; 
};
