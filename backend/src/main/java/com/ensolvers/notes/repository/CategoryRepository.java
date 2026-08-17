package com.ensolvers.notes.repository;

import com.ensolvers.notes.model.Category;
import com.ensolvers.notes.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    Optional<Category> findByNameAndUser(String name, User user);
    List<Category> findAllByUser(User user);
}
