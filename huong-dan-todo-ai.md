# Hướng dẫn xây dựng ứng dụng To-Do thông minh với AI

> **Công nghệ:** Spring Boot + PostgreSQL + Docker + Gemini AI + Flutter  
> **Mục tiêu:** Ứng dụng quản lý task có AI phân tích thói quen và gợi ý task mới  
> **Đối tượng:** Cá nhân (học sinh, sinh viên, freelancer)

---

## Mục lục

1. [Kiến trúc hệ thống](#1-kiến-trúc-hệ-thống)
2. [Chuẩn bị môi trường](#2-chuẩn-bị-môi-trường)
3. [Tạo project Spring Boot](#3-tạo-project-spring-boot)
4. [Cài Docker + PostgreSQL](#4-cài-docker--postgresql)
5. [Tạo Entity và Repository](#5-tạo-entity-và-repository)
6. [Tạo Service xử lý Task](#6-tạo-service-xử-lý-task)
7. [Tích hợp Gemini AI](#7-tích-hợp-gemini-ai)
8. [Tạo REST API Controller](#8-tạo-rest-api-controller)
9. [Test API](#9-test-api)
10. [Xây dựng Flutter App](#10-xây-dựng-flutter-app)
11. [Deploy sản phẩm](#11-deploy-sản-phẩm)

---

## 1. Kiến trúc hệ thống

```
Flutter App  →  Spring Boot API  →  PostgreSQL (lưu task)
                     ↓
                Gemini AI (phân tích + gợi ý task)
                     ↓
                Docker (deploy lên server)
```

### API cần xây dựng

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | /api/tasks | Lấy toàn bộ danh sách task |
| POST | /api/tasks | Thêm task mới |
| PUT | /api/tasks/{id} | Cập nhật task (đánh dấu done) |
| DELETE | /api/tasks/{id} | Xoá task |
| POST | /api/tasks/suggest | Gửi task lên Gemini → nhận gợi ý |

---

## 2. Chuẩn bị môi trường

### Yêu cầu cài đặt

- **Java JDK 21** — [Tải tại adoptium.net](https://adoptium.net/temurin/releases/?version=21)
- **IntelliJ IDEA** hoặc **VS Code** + Extension Pack for Java
- **Docker Desktop** — [Tải tại docker.com](https://www.docker.com/products/docker-desktop)
- **Flutter SDK** — [Tải tại flutter.dev](https://flutter.dev)
- **Gemini API Key** — [Lấy tại aistudio.google.com](https://aistudio.google.com/app/apikey)

### Kiểm tra môi trường

```bash
java -version        # openjdk version "21.x.x"
docker --version     # Docker version 24.x.x
flutter --version    # Flutter 3.x.x
```

---

## 3. Tạo project Spring Boot

### Bước 1 — Vào Spring Initializr

Truy cập [start.spring.io](https://start.spring.io) và cấu hình:

```
Project     : Maven
Language    : Java
Spring Boot : 3.3.x
Group       : com.example
Artifact    : todo-ai
Packaging   : Jar
Java        : 21
```

### Bước 2 — Chọn Dependencies

```
✔ Spring Web
✔ Spring Data JPA
✔ PostgreSQL Driver
✔ Spring Boot DevTools
✔ Lombok
```

### Bước 3 — Thêm dependency OkHttp vào pom.xml

```xml
<!-- Gọi Gemini API -->
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>

<!-- Parse JSON từ Gemini -->
<dependency>
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
    <version>20240303</version>
</dependency>
```

### Cấu trúc thư mục sau khi tạo

```
todo-ai/
├── src/main/java/com/example/todoai/
│   ├── TodoAiApplication.java
│   ├── model/
│   │   └── Task.java
│   ├── repository/
│   │   └── TaskRepository.java
│   ├── service/
│   │   ├── TaskService.java
│   │   └── GeminiService.java
│   └── controller/
│       └── TaskController.java
├── src/main/resources/
│   └── application.properties
├── docker-compose.yml
└── pom.xml
```

---

## 4. Cài Docker + PostgreSQL

### Bước 1 — Tạo file docker-compose.yml

Tạo file `docker-compose.yml` ở thư mục gốc project:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: todo_db
    environment:
      POSTGRES_DB: todoai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Bước 2 — Chạy PostgreSQL

```bash
docker-compose up -d
```

Kiểm tra container đang chạy:

```bash
docker ps
# Thấy todo_db đang running là thành công
```

### Bước 3 — Cấu hình application.properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/todoai
spring.datasource.username=postgres
spring.datasource.password=postgres123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Gemini AI
gemini.api.key=AIzaSy_KEY_CUA_BAN_O_DAY
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Server
server.port=8080
```

> ⚠️ **Lưu ý:** Không commit file `application.properties` lên GitHub nếu có API key thật

---

## 5. Tạo Entity và Repository

### Task.java

```java
package com.example.todoai.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String category; // work, health, learn, personal

    private boolean completed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
```

### TaskRepository.java

```java
package com.example.todoai.repository;

import com.example.todoai.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompletedOrderByCreatedAtDesc(boolean completed);
    List<Task> findTop20ByOrderByCreatedAtDesc();
}
```

---

## 6. Tạo Service xử lý Task

### TaskService.java

```java
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

    // Lấy tất cả task
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Thêm task mới
    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // Cập nhật task (đánh dấu done)
    public Task updateTask(Long id, Task updatedTask) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task không tồn tại"));
        task.setTitle(updatedTask.getTitle());
        task.setCategory(updatedTask.getCategory());
        task.setCompleted(updatedTask.isCompleted());
        if (updatedTask.isCompleted()) {
            task.setCompletedAt(LocalDateTime.now());
        }
        return taskRepository.save(task);
    }

    // Xoá task
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // Lấy 20 task gần nhất để gửi cho AI phân tích
    public List<Task> getRecentTasks() {
        return taskRepository.findTop20ByOrderByCreatedAtDesc();
    }
}
```

---

## 7. Tích hợp Gemini AI

### GeminiService.java

```java
package com.example.todoai.service;

import com.example.todoai.model.Task;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final OkHttpClient client = new OkHttpClient();

    public List<String> suggestTasks(List<Task> recentTasks) throws Exception {
        // Tạo prompt từ danh sách task
        StringBuilder taskList = new StringBuilder();
        for (Task task : recentTasks) {
            taskList.append(String.format("- [%s] %s (danh mục: %s)\n",
                task.isCompleted() ? "done" : "pending",
                task.getTitle(),
                task.getCategory() != null ? task.getCategory() : "general"
            ));
        }

        String prompt = String.format("""
            Dựa vào danh sách task sau của người dùng:
            %s
            
            Hãy phân tích thói quen và gợi ý 5 task mới phù hợp.
            Trả về ONLY JSON array như sau, không có text khác:
            [
              {"title": "tên task", "category": "work|health|learn|personal"},
              ...
            ]
            """, taskList);

        String requestBody = String.format("""
            {
              "contents": [{
                "parts": [{"text": "%s"}]
              }]
            }
            """, prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        RequestBody body = RequestBody.create(
            requestBody, MediaType.get("application/json")
        );

        Request request = new Request.Builder()
            .url(apiUrl + "?key=" + apiKey)
            .post(body)
            .build();

        try (Response response = client.newCall(request).execute()) {
            String resBody = response.body().string();
            JSONObject obj = new JSONObject(resBody);
            String text = obj
                .getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text");

            // Parse JSON array từ response
            text = text.replaceAll("```json|```", "").trim();
            JSONArray suggestions = new JSONArray(text);
            List<String> result = new ArrayList<>();
            for (int i = 0; i < suggestions.length(); i++) {
                JSONObject suggestion = suggestions.getJSONObject(i);
                result.add(suggestion.getString("title") +
                    "|" + suggestion.optString("category", "general"));
            }
            return result;
        }
    }
}
```

---

## 8. Tạo REST API Controller

### TaskController.java

```java
package com.example.todoai.controller;

import com.example.todoai.model.Task;
import com.example.todoai.service.GeminiService;
import com.example.todoai.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private GeminiService geminiService;

    // GET /api/tasks — lấy tất cả task
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // POST /api/tasks — thêm task mới
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    // PUT /api/tasks/{id} — cập nhật task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
        @PathVariable Long id,
        @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    // DELETE /api/tasks/{id} — xoá task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    // POST /api/tasks/suggest — AI gợi ý task
    @PostMapping("/suggest")
    public ResponseEntity<List<String>> suggestTasks() {
        try {
            List<Task> recentTasks = taskService.getRecentTasks();
            List<String> suggestions = geminiService.suggestTasks(recentTasks);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

---

## 9. Test API

Tạo file `test.http` ở thư mục gốc project:

```http
### Lấy tất cả task
GET http://localhost:8080/api/tasks

###

### Thêm task mới
POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "title": "Chạy bộ 5km",
  "category": "health"
}

###

### Đánh dấu task hoàn thành
PUT http://localhost:8080/api/tasks/1
Content-Type: application/json

{
  "title": "Chạy bộ 5km",
  "category": "health",
  "completed": true
}

###

### Xoá task
DELETE http://localhost:8080/api/tasks/1

###

### AI gợi ý task mới
POST http://localhost:8080/api/tasks/suggest

###
```

### Chạy project

```bash
# Bước 1: Chạy Docker PostgreSQL
docker-compose up -d

# Bước 2: Chạy Spring Boot
./mvnw spring-boot:run

# Thấy dòng này là thành công:
# Started TodoAiApplication in 2.3 seconds
```

---

## 10. Xây dựng Flutter App

### Tạo project Flutter

```bash
flutter create todo_ai_app
cd todo_ai_app
flutter pub get
```

### Thêm package vào pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.1
  provider: ^6.1.1
```

### lib/services/task_service.dart

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class TaskService {
  static const String baseUrl = 'http://localhost:8080/api/tasks';

  // Lấy tất cả task
  Future<List<Map<String, dynamic>>> getAllTasks() async {
    final response = await http.get(Uri.parse(baseUrl));
    if (response.statusCode == 200) {
      final List data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // Thêm task mới
  Future<bool> createTask(String title, String category) async {
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'title': title, 'category': category}),
    );
    return response.statusCode == 200;
  }

  // Đánh dấu hoàn thành
  Future<bool> completeTask(int id, Map<String, dynamic> task) async {
    task['completed'] = true;
    final response = await http.put(
      Uri.parse('$baseUrl/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(task),
    );
    return response.statusCode == 200;
  }

  // Xoá task
  Future<bool> deleteTask(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/$id'));
    return response.statusCode == 200;
  }

  // AI gợi ý task
  Future<List<String>> getSuggestions() async {
    final response = await http.post(
      Uri.parse('$baseUrl/suggest'),
    );
    if (response.statusCode == 200) {
      final List data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.cast<String>();
    }
    return [];
  }
}
```

### lib/main.dart

```dart
import 'package:flutter/material.dart';
import 'services/task_service.dart';

void main() => runApp(const TodoAiApp());

class TodoAiApp extends StatelessWidget {
  const TodoAiApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart To-Do',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const TodoScreen(),
    );
  }
}

class TodoScreen extends StatefulWidget {
  const TodoScreen({super.key});
  @override
  State<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends State<TodoScreen> {
  final TaskService _service = TaskService();
  final TextEditingController _controller = TextEditingController();
  List<Map<String, dynamic>> _tasks = [];
  List<String> _suggestions = [];
  bool _loadingSuggest = false;
  String _selectedCategory = 'work';

  final List<String> _categories = ['work', 'health', 'learn', 'personal'];

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    final tasks = await _service.getAllTasks();
    setState(() => _tasks = tasks);
  }

  Future<void> _addTask() async {
    final title = _controller.text.trim();
    if (title.isEmpty) return;
    await _service.createTask(title, _selectedCategory);
    _controller.clear();
    _loadTasks();
  }

  Future<void> _completeTask(Map<String, dynamic> task) async {
    await _service.completeTask(task['id'], Map.from(task));
    _loadTasks();
  }

  Future<void> _deleteTask(int id) async {
    await _service.deleteTask(id);
    _loadTasks();
  }

  Future<void> _getSuggestions() async {
    setState(() => _loadingSuggest = true);
    final suggestions = await _service.getSuggestions();
    setState(() {
      _suggestions = suggestions;
      _loadingSuggest = false;
    });
  }

  Future<void> _addSuggestion(String suggestion) async {
    final parts = suggestion.split('|');
    final title = parts[0];
    final category = parts.length > 1 ? parts[1] : 'general';
    await _service.createTask(title, category);
    setState(() => _suggestions.remove(suggestion));
    _loadTasks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart To-Do AI'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: _loadingSuggest
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.auto_awesome),
            onPressed: _getSuggestions,
            tooltip: 'AI gợi ý task',
          )
        ],
      ),
      body: Column(
        children: [
          // Ô nhập task
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                DropdownButton<String>(
                  value: _selectedCategory,
                  items: _categories.map((c) =>
                    DropdownMenuItem(value: c, child: Text(c))
                  ).toList(),
                  onChanged: (v) => setState(() => _selectedCategory = v!),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Thêm task mới...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                    ),
                    onSubmitted: (_) => _addTask(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addTask,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Thêm'),
                ),
              ],
            ),
          ),

          // AI gợi ý chips
          if (_suggestions.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              width: double.infinity,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('AI gợi ý:',
                    style: TextStyle(fontSize: 12,
                        fontWeight: FontWeight.w500, color: Colors.grey)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _suggestions.map((s) {
                      final title = s.split('|')[0];
                      return ActionChip(
                        label: Text('+ $title', style: const TextStyle(fontSize: 12)),
                        backgroundColor: Colors.teal.shade50,
                        side: BorderSide(color: Colors.teal.shade200),
                        onPressed: () => _addSuggestion(s),
                      );
                    }).toList(),
                  ),
                  const Divider(height: 16),
                ],
              ),
            ),

          // Danh sách task
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _tasks.length,
              itemBuilder: (context, index) {
                final task = _tasks[index];
                final done = task['completed'] == true;
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: GestureDetector(
                      onTap: done ? null : () => _completeTask(task),
                      child: Container(
                        width: 24, height: 24,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: done ? Colors.teal : Colors.transparent,
                          border: Border.all(
                            color: done ? Colors.teal : Colors.grey,
                            width: 1.5,
                          ),
                        ),
                        child: done
                            ? const Icon(Icons.check,
                                size: 14, color: Colors.white)
                            : null,
                      ),
                    ),
                    title: Text(
                      task['title'] ?? '',
                      style: TextStyle(
                        decoration: done ? TextDecoration.lineThrough : null,
                        color: done ? Colors.grey : null,
                        fontSize: 14,
                      ),
                    ),
                    subtitle: Text(
                      task['category'] ?? 'general',
                      style: const TextStyle(fontSize: 11),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline,
                          size: 18, color: Colors.grey),
                      onPressed: () => _deleteTask(task['id']),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 11. Deploy sản phẩm

### Dockerfile cho Spring Boot

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose.yml hoàn chỉnh (production)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: todo_db
    environment:
      POSTGRES_DB: todoai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: .
    container_name: todo_backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/todoai
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres123
      GEMINI_API_KEY: your_api_key_here
    depends_on:
      - postgres
    restart: always

volumes:
  postgres_data:
```

### Build và chạy toàn bộ hệ thống

```bash
# Build Spring Boot jar
./mvnw clean package -DskipTests

# Build và chạy Docker
docker-compose up -d --build

# Kiểm tra logs
docker-compose logs -f backend
```

---

## Thứ tự làm từng bước

```
Bước 1  →  Cài môi trường (Java, Docker, Flutter)
Bước 2  →  Tạo project Spring Boot tại start.spring.io
Bước 3  →  Chạy PostgreSQL bằng docker-compose up -d
Bước 4  →  Tạo Task.java + TaskRepository.java
Bước 5  →  Tạo TaskService.java (CRUD)
Bước 6  →  Tạo GeminiService.java (AI gợi ý)
Bước 7  →  Tạo TaskController.java (REST API)
Bước 8  →  Test bằng file test.http
Bước 9  →  Tạo Flutter app + kết nối API
Bước 10 →  Deploy bằng Docker lên server
```

---

> Có vấn đề gì trong quá trình làm, paste lỗi vào chat để được hỗ trợ!
