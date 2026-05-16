package com.slate.controller;

import com.slate.dto.BoardDto;
import com.slate.dto.BoardSummaryDto;
import com.slate.dto.CreateBoardRequest;
import com.slate.dto.UpdateBoardRequest;
import com.slate.entity.User;
import com.slate.service.BoardService;
import com.slate.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
  private final BoardService boardService;
  private final UserService userService;

  public BoardController(BoardService boardService, UserService userService) {
    this.boardService = boardService;
    this.userService = userService;
  }

  @GetMapping
  public List<BoardSummaryDto> list(Authentication authentication) {
    User user = userService.currentUser(authentication);
    return boardService.list(user);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public BoardDto create(@Valid @RequestBody CreateBoardRequest request, Authentication authentication) {
    User user = userService.currentUser(authentication);
    return boardService.create(user, request);
  }

  @GetMapping("/{id}")
  public BoardDto get(@PathVariable UUID id, Authentication authentication) {
    User user = userService.currentUser(authentication);
    return boardService.get(user, id);
  }

  @PutMapping("/{id}")
  public BoardDto update(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateBoardRequest request,
      Authentication authentication
  ) {
    User user = userService.currentUser(authentication);
    return boardService.update(user, id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID id, Authentication authentication) {
    User user = userService.currentUser(authentication);
    boardService.delete(user, id);
  }
}
