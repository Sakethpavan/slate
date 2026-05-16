package com.slate.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateBoardRequest(
    @NotBlank @Size(max = 255) String title,
    @NotNull JsonNode sceneJson
) {}
