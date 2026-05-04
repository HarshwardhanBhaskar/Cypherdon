package com.cypherdon.core.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) return "{}";
        // Convert to PostgreSQL array literal format: {item1, item2}
        return "{" + String.join(",", list) + "}";
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().length() == 0 || dbData.equals("{}")) {
            return Collections.emptyList();
        }
        // Remove curly braces {}
        String cleanString = dbData.substring(1, dbData.length() - 1);
        // Split by comma handling quotes if necessary
        return Arrays.asList(cleanString.split(","));
    }
}
