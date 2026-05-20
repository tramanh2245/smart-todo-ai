package com.example.todoai.repository;

import com.example.todoai.model.DayNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DayNoteRepository extends JpaRepository<DayNote, Long> {
    Optional<DayNote> findByNoteDate(String noteDate);
    List<DayNote> findAllByOrderByNoteDateDesc();
}
