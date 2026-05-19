package com.example.todoai.service;

import com.example.todoai.model.Task;
import com.example.todoai.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task không tồn tại: " + id));
        task.setTitle(updatedTask.getTitle());
        task.setCategory(updatedTask.getCategory());
        task.setCompleted(updatedTask.isCompleted());
        if (updatedTask.isCompleted() && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> getRecentTasks() {
        return taskRepository.findTop20ByOrderByCreatedAtDesc();
    }
}
