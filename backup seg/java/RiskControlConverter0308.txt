package com.gestaopt.sistemapt.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class RiskControlConverter implements AttributeConverter<RiskControlItem, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(RiskControlItem attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter RiskControlItem para JSON", e);
        }
    }

    @Override
    public RiskControlItem convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new RiskControlItem();
        }
        try {
            return objectMapper.readValue(dbData, RiskControlItem.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter JSON para RiskControlItem", e);
        }
    }
}
