package com.ensolvers.notes.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class NoteRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    private List<Long> categoryIds;

    public NoteRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }
}
