import { apiClient } from "./client";

export async function loadTasks() {
  return await apiClient.get("/api/Task");
}

export async function loadMotorcycles() {
  return await apiClient.get("/api/Vehicle");
}

export async function loadTaskAssignments() {
  return await apiClient.get("/api/TaskAssignment");
}

export async function assignTask(taskId: number, motorcycleId: number) {
  return await apiClient.post("/api/TaskAssignment", {
    taskid: taskId,
    motorcycleid: motorcycleId,
    startdate: new Date(),
  });
}

export async function removeTask(taskId: number) {
  return await apiClient.delete(`/api/TaskAssignment/${taskId}`);
}

export async function removeAllTasksFromMotorcycle(motorcycleId: number) {
  return await apiClient.delete(`/api/TaskAssignment/vehicle/${motorcycleId}`);
}
