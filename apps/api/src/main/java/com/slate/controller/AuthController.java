package com.slate.controller;

import com.slate.dto.UserDto;
import com.slate.entity.User;
import com.slate.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
  private final UserService userService;

  public AuthController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public UserDto me(Authentication authentication) {
    User user = userService.currentUser(authentication);
    return userService.toDto(user);
  }
}
