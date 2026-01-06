import api from './api';

const EmailTemplateService = {
    getAllTemplates: async () => {
        const response = await api.get('/admin/email-templates');
        return response.data;
    },

    updateTemplate: async (id, data) => {
        const response = await api.put(`/admin/email-templates/${id}`, data);
        return response.data;
    }
};

export default EmailTemplateService;
