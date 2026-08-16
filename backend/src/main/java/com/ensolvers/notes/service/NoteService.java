package com.ensolvers.notes.service;

import com.ensolvers.notes.dto.NoteRequest;
import com.ensolvers.notes.exception.ResourceNotFoundException;
import com.ensolvers.notes.model.Category;
import com.ensolvers.notes.model.Note;
import com.ensolvers.notes.model.User;
import com.ensolvers.notes.repository.CategoryRepository;
import com.ensolvers.notes.repository.NoteRepository;
import com.ensolvers.notes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Set<Category> resolveCategoryIds(List<Long> categoryIds) {
        Set<Category> categories = new HashSet<>();
        if (categoryIds != null) {
            for (Long catId : categoryIds) {
                Category cat = categoryRepository.findById(catId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catId));
                categories.add(cat);
            }
        }
        return categories;
    }

    public Note createNote(NoteRequest request, String username) {
        User user = getUser(username);
        Note note = new Note(request.getTitle(), request.getContent(), user);
        note.setCategories(resolveCategoryIds(request.getCategoryIds()));
        return noteRepository.save(note);
    }

    public List<Note> getActiveNotes(String username, Long categoryId) {
        User user = getUser(username);
        if (categoryId != null) {
            return noteRepository.findByUserAndArchivedFalseAndCategoriesId(user, categoryId);
        }
        return noteRepository.findByUserAndArchivedFalse(user);
    }

    public List<Note> getArchivedNotes(String username, Long categoryId) {
        User user = getUser(username);
        if (categoryId != null) {
            return noteRepository.findByUserAndArchivedTrueAndCategoriesId(user, categoryId);
        }
        return noteRepository.findByUserAndArchivedTrue(user);
    }

    public Note getNoteById(Long id, String username) {
        User user = getUser(username);
        return noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
    }

    public Note updateNote(Long id, NoteRequest request, String username) {
        Note note = getNoteById(id, username);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setCategories(resolveCategoryIds(request.getCategoryIds()));
        return noteRepository.save(note);
    }

    public void deleteNote(Long id, String username) {
        Note note = getNoteById(id, username);
        noteRepository.delete(note);
    }

    public Note archiveNote(Long id, String username) {
        Note note = getNoteById(id, username);
        note.setArchived(true);
        return noteRepository.save(note);
    }

    public Note unarchiveNote(Long id, String username) {
        Note note = getNoteById(id, username);
        note.setArchived(false);
        return noteRepository.save(note);
    }
}
