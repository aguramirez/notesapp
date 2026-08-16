package com.ensolvers.notes.controller;

import com.ensolvers.notes.dto.NoteRequest;
import com.ensolvers.notes.model.Note;
import com.ensolvers.notes.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping("/active")
    public List<Note> getActiveNotes(@AuthenticationPrincipal UserDetails userDetails,
                                     @RequestParam(required = false) Long categoryId) {
        return noteService.getActiveNotes(userDetails.getUsername(), categoryId);
    }

    @GetMapping("/archived")
    public List<Note> getArchivedNotes(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestParam(required = false) Long categoryId) {
        return noteService.getArchivedNotes(userDetails.getUsername(), categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(noteService.getNoteById(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(noteService.createNote(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id,
                                           @Valid @RequestBody NoteRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(noteService.updateNote(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        noteService.deleteNote(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Note> archiveNote(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(noteService.archiveNote(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/unarchive")
    public ResponseEntity<Note> unarchiveNote(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(noteService.unarchiveNote(id, userDetails.getUsername()));
    }
}
