package com.slate.repository;

import com.slate.entity.Board;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, UUID> {
  List<Board> findAllByUser_IdOrderByUpdatedAtDesc(UUID userId);

  Optional<Board> findByIdAndUser_Id(UUID id, UUID userId);
}
