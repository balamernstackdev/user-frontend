import api from './api';

/**
 * File Service
 */

export const getMyFiles = async (params = {}) => {
    const response = await api.get('/files/my-files', { params });
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

// Admin Methods
export const getAllFiles = async (params = {}) => {
    const response = await api.get('/files/admin/all', { params });
    return response.data;
};

export const uploadFile = async (formData) => {
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteFile = async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
};

export const getPlanFiles = async (planId) => {
    const response = await api.get(`/files/plan/${planId}`);
    return response.data;
};

export const assignFileToPlan = async (planId, fileId, isLocked = true) => {
    const response = await api.post('/files/assign-to-plan', { planId, fileId, isLocked });
    return response.data;
};

export const removeFileFromPlan = async (planId, fileId) => {
    const response = await api.delete(`/files/plan/${planId}/${fileId}`);
    return response.data;
};

export const updateFile = async (id, data) => {
    const response = await api.put(`/files/${id}`, data);
    return response.data;
};

export default {
    getMyFiles,
    downloadFile,
    getDownloadHistory,
    getAllFiles,
    uploadFile,
    deleteFile,
    getPlanFiles,
    assignFileToPlan,
    removeFileFromPlan,
    updateFile
};
