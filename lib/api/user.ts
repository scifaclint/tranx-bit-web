import api from "./axios";

export interface FeedbackPayload {
    subject?: string;
    message: string;
}

export interface FeedbackResponse {
    status: boolean;
    message: string;
}

export const userApi = {
    sendFeedback: async (data: FeedbackPayload): Promise<FeedbackResponse> => {
        const response = await api.post("/feedback", data);
        return response.data;
    },
};