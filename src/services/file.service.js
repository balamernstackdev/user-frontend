import api from './api';

/**
 * File Service
 */

export const getMyFiles = async () => {
    const response = await api.get('/files/my-files');
    return response.data;
};

export const downloadFile = async (fileId) => {
    const response = await api.get(`/files/download/${fileId}`, {
        responseType: 'blob'
    });
    return response;
};

export const getDownloadHistory = async () => {
    const response = await api.get('/files/download-history');
    return response.data;
};

export default {
    getMyFiles,
    downloadFile,
    getDownloadHistory
};
