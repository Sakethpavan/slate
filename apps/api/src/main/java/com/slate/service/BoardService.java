package com.slate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slate.dto.BoardDto;
import com.slate.dto.BoardSummaryDto;
import com.slate.dto.CreateBoardRequest;
import com.slate.dto.UpdateBoardRequest;
import com.slate.entity.Board;
import com.slate.entity.User;
import com.slate.repository.BoardRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BoardService {
  private final BoardRepository boardRepository;
  private final ObjectMapper objectMapper;

  public BoardService(BoardRepository boardRepository, ObjectMapper objectMapper) {
    this.boardRepository = boardRepository;
    this.objectMapper = objectMapper;
  }

  @Transactional(readOnly = true)
  public List<BoardSummaryDto> list(User user) {
    return boardRepository.findAllByUser_IdOrderByUpdatedAtDesc(user.getId())
        .stream()
        .map(this::toSummaryDto)
        .toList();
  }

  @Transactional
  public BoardDto create(User user, CreateBoardRequest request) {
    Board board = new Board();
    board.setUser(user);
    board.setTitle(request.title());
    board.setSceneJson(emptyScene());
    return toDto(boardRepository.save(board));
  }

  @Transactional(readOnly = true)
  public BoardDto get(User user, UUID id) {
    return toDto(findOwnedBoard(user, id));
  }

  @Transactional
  public BoardDto update(User user, UUID id, UpdateBoardRequest request) {
    Board board = findOwnedBoard(user, id);
    board.setTitle(request.title());
    board.setSceneJson(request.sceneJson());
    return toDto(board);
  }

  @Transactional
  public void delete(User user, UUID id) {
    Board board = findOwnedBoard(user, id);
    boardRepository.delete(board);
  }

  private Board findOwnedBoard(User user, UUID id) {
    return boardRepository.findByIdAndUser_Id(id, user.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
  }

  private JsonNode emptyScene() {
    ObjectNode scene = objectMapper.createObjectNode();
    scene.set("elements", objectMapper.createArrayNode());
    scene.set("appState", objectMapper.createObjectNode());
    scene.set("files", objectMapper.createObjectNode());
    return scene;
  }

  private BoardSummaryDto toSummaryDto(Board board) {
    return new BoardSummaryDto(board.getId(), board.getTitle(), board.getCreatedAt(), board.getUpdatedAt());
  }

  private BoardDto toDto(Board board) {
    return new BoardDto(
        board.getId(),
        board.getTitle(),
        board.getSceneJson(),
        board.getCreatedAt(),
        board.getUpdatedAt()
    );
  }
}
