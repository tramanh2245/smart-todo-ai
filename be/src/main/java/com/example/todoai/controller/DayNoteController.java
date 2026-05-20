package com.example.todoai.controller;

import com.example.todoai.model.DayNote;
import com.example.todoai.repository.DayNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/day-notes")
@CrossOrigin(origins = "*")
public class DayNoteController {

    @Autowired
    private DayNoteRepository repo;

    @GetMapping
    public ResponseEntity<List<DayNote>> getAll() {
        return ResponseEntity.ok(repo.findAllByOrderByNoteDateDesc());
    }

    @PutMapping("/{date}")
    public ResponseEntity<DayNote> upsert(@PathVariable String date, @RequestBody DayNote body) {
        DayNote note = repo.findByNoteDate(date).orElse(new DayNote());
        note.setNoteDate(date);
        note.setContent(body.getContent());
        return ResponseEntity.ok(repo.save(note));
    }
}
