package com.slate.service;

import com.slate.dto.UserDto;
import com.slate.entity.User;
import com.slate.repository.UserRepository;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final boolean devUserEnabled;

  public UserService(
      UserRepository userRepository,
      @Value("${slate.security.dev-user-enabled:false}") boolean devUserEnabled
  ) {
    this.userRepository = userRepository;
    this.devUserEnabled = devUserEnabled;
  }

  @Transactional
  public User currentUser(Authentication authentication) {
    if (authentication instanceof OAuth2AuthenticationToken token) {
      Map<String, Object> attributes = token.getPrincipal().getAttributes();
      String email = String.valueOf(attributes.get("email"));
      String name = String.valueOf(attributes.getOrDefault("name", email));
      String subject = String.valueOf(attributes.get("sub"));
      String avatarUrl = (String) attributes.get("picture");

      return userRepository.findByEmail(email)
          .map(user -> updateUser(user, name, avatarUrl))
          .orElseGet(() -> createUser("google", subject, email, name, avatarUrl));
    }

    if (devUserEnabled) {
      return userRepository.findByEmail("dev@slate.local")
          .orElseGet(() -> createUser("dev", "local-dev-user", "dev@slate.local", "Local Dev", null));
    }

    throw new IllegalStateException("No authenticated user is available");
  }

  public UserDto toDto(User user) {
    return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getAvatarUrl());
  }

  private User createUser(String provider, String providerUserId, String email, String name, String avatarUrl) {
    User user = new User();
    user.setProvider(provider);
    user.setProviderUserId(providerUserId);
    user.setEmail(email);
    user.setName(name);
    user.setAvatarUrl(avatarUrl);
    return userRepository.save(user);
  }

  private User updateUser(User user, String name, String avatarUrl) {
    user.setName(name);
    user.setAvatarUrl(avatarUrl);
    return user;
  }
}
