import axiosInstance from './client';

interface TaskStatusCount {
  name: string;
  value: number;
}

interface ProjectMetrics {
  name: string;
  revenue: number;
  cost: number;
}

interface UtilizationData {
  month: string;
  utilization: number;
}

export const analyticsApi = {
  async getTaskStatusStats(): Promise<TaskStatusCount[]> {
    const { data } = await axiosInstance.get('/api/v1/analytics/task-status');
    return data;
  },

  async getProjectMetrics(): Promise<ProjectMetrics[]> {
    const { data } = await axiosInstance.get('/api/v1/analytics/project-metrics');
    return data;
  },

  async getUtilizationTrend(): Promise<UtilizationData[]> {
    const { data } = await axiosInstance.get('/api/v1/analytics/utilization');
    return data;
  },
};
