package com.ensolvers.notes.service;

import com.ensolvers.notes.dto.NoteRequest;
import com.ensolvers.notes.model.Note;
import com.ensolvers.notes.model.User;
import com.ensolvers.notes.repository.CategoryRepository;
import com.ensolvers.notes.repository.NoteRepository;
import com.ensolvers.notes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NoteServiceTest {

    @Mock private NoteRepository noteRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private NoteService noteService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockUser = new User("testuser", "password");
        mockUser.setId(1L);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
    }

    @Test
    void testCreateNote() {
        NoteRequest req = new NoteRequest();
        req.setTitle("Title");
        req.setContent("Content");

        Note note = new Note("Title", "Content", mockUser);
        when(noteRepository.save(any(Note.class))).thenReturn(note);

        Note created = noteService.createNote(req, "testuser");
        assertNotNull(created);
        assertEquals("Title", created.getTitle());
        verify(noteRepository, times(1)).save(any(Note.class));
    }

    @Test
    void testArchiveNote() {
        Note note = new Note("Title", "Content", mockUser);
        note.setId(1L);
        assertFalse(note.isArchived());

        when(noteRepository.findByIdAndUser(1L, mockUser)).thenReturn(Optional.of(note));
        when(noteRepository.save(note)).thenReturn(note);

        Note archived = noteService.archiveNote(1L, "testuser");
        assertTrue(archived.isArchived());
        verify(noteRepository, times(1)).save(note);
    }

    @Test
    void testUnarchiveNote() {
        Note note = new Note("Title", "Content", mockUser);
        note.setId(1L);
        note.setArchived(true);

        when(noteRepository.findByIdAndUser(1L, mockUser)).thenReturn(Optional.of(note));
        when(noteRepository.save(note)).thenReturn(note);

        Note unarchived = noteService.unarchiveNote(1L, "testuser");
        assertFalse(unarchived.isArchived());
        verify(noteRepository, times(1)).save(note);
    }
}
