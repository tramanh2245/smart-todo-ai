package com.example.todoai.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "day_notes")
@Data
public class DayNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_date", nullable = false, unique = true)
    private String noteDate;

    @Column(columnDefinition = "TEXT")
    private String content;
}
