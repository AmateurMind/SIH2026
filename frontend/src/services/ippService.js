import axios from 'axios';

const API_URL = '/ipp'; // Use relative URL since axios.defaults.baseURL is already set

// Get auth token helper
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const ippService = {
    // Create new IPP
    createIPP: async (data) => {
        const response = await axios.post(`${API_URL}/create`, data, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get IPP details
    getIPP: async (ippId) => {
        const response = await axios.get(`${API_URL}/${ippId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get student's IPPs
    getStudentIPPs: async (studentId) => {
        const response = await axios.get(`${API_URL}/student/${studentId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Send evaluation request (Admin/Faculty)
    sendEvaluationRequest: async (ippId, mentorData) => {
        const response = await axios.post(`${API_URL}/${ippId}/send-evaluation-request`, mentorData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Submit company evaluation (Magic Link - No Auth Header needed)
    submitCompanyEvaluation: async (ippId, token, evaluation) => {
        const response = await axios.put(`${API_URL}/${ippId}/company-evaluation`, {
            token,
            evaluation
        });
        return response.data;
    },

    // Submit student documentation
    submitStudentDocumentation: async (ippId, submission) => {
        const response = await axios.put(`${API_URL}/${ippId}/student-submission`, {
            submission
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Upload supporting document (PDF/image)
    uploadDocument: async (ippId, file) => {
        const formData = new FormData();
        formData.append('document', file);

        const response = await axios.post(`${API_URL}/${ippId}/upload-document`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Submit faculty assessment
    submitFacultyAssessment: async (ippId, assessment) => {
        const response = await axios.put(`${API_URL}/${ippId}/faculty-assessment`, {
            assessment
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Verify and Publish
    verifyIPP: async (ippId) => {
        const response = await axios.post(`${API_URL}/${ippId}/verify`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get Public IPP (No Auth)
    getPublicIPP: async (ippId) => {
        const response = await axios.get(`${API_URL}/public/${ippId}`);
        return response.data;
    }
};

export default ippService;
