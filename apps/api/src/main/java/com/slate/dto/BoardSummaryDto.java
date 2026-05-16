package com.slate.dto;

import java.time.Instant;
import java.util.UUID;

public record BoardSummaryDto(UUID id, String title, Instant createdAt, Instant updatedAt) {}
