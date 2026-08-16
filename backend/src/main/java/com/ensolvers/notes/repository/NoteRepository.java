package com.ensolvers.notes.repository;

import com.ensolvers.notes.model.Note;
import com.ensolvers.notes.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserAndArchivedFalse(User user);
    List<Note> findByUserAndArchivedTrue(User user);
    List<Note> findByUserAndArchivedFalseAndCategoriesId(User user, Long categoryId);
    List<Note> findByUserAndArchivedTrueAndCategoriesId(User user, Long categoryId);
    Optional<Note> findByIdAndUser(Long id, User user);
}
