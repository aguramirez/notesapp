package com.ensolvers.notes.service;

import com.ensolvers.notes.exception.ResourceNotFoundException;
import com.ensolvers.notes.model.Category;
import com.ensolvers.notes.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Category createCategory(Category category) {
        String cleanName = category.getName().trim();
        return categoryRepository.findByName(cleanName)
                .orElseGet(() -> {
                    Category newCat = new Category(cleanName);
                    return categoryRepository.save(newCat);
                });
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.getNotes().forEach(note -> note.getCategories().remove(category));
        categoryRepository.delete(category);
    }
}
