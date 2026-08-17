package com.ensolvers.notes.service;

import com.ensolvers.notes.exception.ResourceNotFoundException;
import com.ensolvers.notes.model.Category;
import com.ensolvers.notes.repository.CategoryRepository;
import com.ensolvers.notes.model.User;
import com.ensolvers.notes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public Category createCategory(Category category) {
        String cleanName = category.getName().trim();
        User user = getCurrentUser();
        return categoryRepository.findByNameAndUser(cleanName, user)
                .orElseGet(() -> {
                    Category newCat = new Category(cleanName, user);
                    return categoryRepository.save(newCat);
                });
    }

    public List<Category> getAllCategories() {
        User user = getCurrentUser();
        return categoryRepository.findAllByUser(user);
    }

    public void deleteCategory(Long id) {
        User user = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .filter(c -> c.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.getNotes().forEach(note -> note.getCategories().remove(category));
        categoryRepository.delete(category);
    }
}
