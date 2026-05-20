package com.example.todoai.service;

import com.example.todoai.model.Task;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final OkHttpClient client = new OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build();

    public List<String> suggestTasks(List<Task> recentTasks) throws Exception {
        StringBuilder taskList = new StringBuilder();
        for (Task task : recentTasks) {
            taskList.append(String.format("- [%s] %s (danh mục: %s)\n",
                task.isCompleted() ? "done" : "pending",
                task.getTitle(),
                task.getCategory() != null ? task.getCategory() : "general"
            ));
        }

        String prompt = String.format(
            "Dựa vào danh sách task sau của người dùng:\\n%s\\n" +
            "Hãy phân tích thói quen và gợi ý 5 task mới phù hợp.\\n" +
            "Trả về ONLY JSON array như sau, không có text khác:\\n" +
            "[{\\\"title\\\": \\\"tên task\\\", \\\"category\\\": \\\"work|health|learn|personal\\\"}]",
            taskList.toString().replace("\"", "\\\"").replace("\n", "\\n")
        );

        String requestBody = new JSONObject()
            .put("contents", new JSONArray()
                .put(new JSONObject()
                    .put("parts", new JSONArray()
                        .put(new JSONObject().put("text", prompt)))))
            .toString();

        RequestBody body = RequestBody.create(requestBody, MediaType.get("application/json"));
        Request request = new Request.Builder()
            .url(apiUrl + "?key=" + apiKey)
            .post(body)
            .build();

        try (Response response = client.newCall(request).execute()) {
            String resBody = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful()) {
                log.error("Gemini API error: {} - {}", response.code(), resBody);
                throw new RuntimeException("Gemini API error: " + response.code());
            }
            log.info("Gemini response received, length={}", resBody.length());
            JSONObject obj = new JSONObject(resBody);
            String text = obj
                .getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text");

            text = text.replaceAll("```json|```", "").trim();
            JSONArray suggestions = new JSONArray(text);
            List<String> result = new ArrayList<>();
            for (int i = 0; i < suggestions.length(); i++) {
                JSONObject s = suggestions.getJSONObject(i);
                result.add(s.getString("title") + "|" + s.optString("category", "general"));
            }
            return result;
        }
    }
}
