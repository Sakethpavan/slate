package com.slate.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.UUID;

public record BoardDto(
    UUID id,
    String title,
    JsonNode sceneJson,
    Instant createdAt,
    Instant updatedAt
) {}
