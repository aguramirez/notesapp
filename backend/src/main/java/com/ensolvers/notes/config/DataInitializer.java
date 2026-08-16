package com.ensolvers.notes.config;

import com.ensolvers.notes.model.Category;
import com.ensolvers.notes.model.Note;
import com.ensolvers.notes.model.User;
import com.ensolvers.notes.repository.CategoryRepository;
import com.ensolvers.notes.repository.NoteRepository;
import com.ensolvers.notes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Only seed if user doesn't exist yet
        if (userRepository.existsByUsername("agustin")) {
            return;
        }

        // Create user
        User agustin = new User("agustin", passwordEncoder.encode("ensolvers"));
        userRepository.save(agustin);

        // Create categories (persist first so they have IDs)
        Category work     = categoryRepository.save(new Category("Work"));
        Category personal = categoryRepository.save(new Category("Personal"));
        Category ideas    = categoryRepository.save(new Category("Ideas"));
        Category learning = categoryRepository.save(new Category("Learning"));

        // Create 7 notes with categories
        createNote("Sprint Planning",
                "Define user stories for the upcoming sprint. Focus on backend auth features.",
                agustin, List.of(work));
        createNote("Book List",
                "Books to read this year:\n- The Pragmatic Programmer\n- Clean Code\n- Designing Data-Intensive Applications",
                agustin, List.of(personal, learning));
        createNote("API Design Ideas",
                "Consider switching to GraphQL for the next project. Research Apollo Server and Federation patterns.",
                agustin, List.of(ideas, work));
        createNote("Workout Routine",
                "Mon/Wed/Fri: Gym (push/pull/legs split)\nTue/Thu: Running 5km\nSat: Rest or yoga",
                agustin, List.of(personal));
        createNote("Spring Security JWT Flow",
                "1. Client sends credentials\n2. Server validates and issues JWT\n3. Client stores token in localStorage\n4. Each request includes Bearer token in header",
                agustin, List.of(learning, work));
        createNote("Side Project Ideas",
                "- Recipe manager app with AI suggestions\n- Real-time collaborative notes editor\n- Personal finance tracker with charts",
                agustin, List.of(ideas));
        createNote("PostgreSQL Performance Tips",
                "Use EXPLAIN ANALYZE to identify slow queries. Add indexes on foreign keys and frequently filtered columns.",
                agustin, List.of(learning, work));
    }

    private void createNote(String title, String content, User user, List<Category> categories) {
        Note note = new Note(title, content, user);
        note.setCategories(new HashSet<>(categories));
        noteRepository.save(note);
    }
}
