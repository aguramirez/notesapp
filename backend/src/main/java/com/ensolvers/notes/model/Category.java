package com.ensolvers.notes.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Column(nullable = false)
    private String name;

    // Each category belongs to a single user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true, foreignKey = @jakarta.persistence.ForeignKey(jakarta.persistence.ConstraintMode.NO_CONSTRAINT))
    @JsonIgnore
    private User user;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<Note> notes = new HashSet<>();

    public Category() {}

    // Existing constructor for creating a category with a user
    public Category(String name, User user) {
        this.name = name;
        this.user = user;
    }

    // New constructor for convenience when the user will be set later
    public Category(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Set<Note> getNotes() { return notes; }
    public void setNotes(Set<Note> notes) { this.notes = notes; }
}
