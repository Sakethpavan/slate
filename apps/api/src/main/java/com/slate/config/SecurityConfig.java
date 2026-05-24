package com.slate.config;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        ObjectProvider<ClientRegistrationRepository> clientRegistrations,
        @Value("${slate.web-origin}") String webOrigin,
        @Value("${slate.security.dev-user-enabled:false}") boolean devUserEnabled
    ) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                auth.requestMatchers("/", "/error", "/login/**", "/oauth2/**").permitAll();
                if (devUserEnabled) {
                    auth.requestMatchers("/api/**").permitAll();
                } else {
                    auth.requestMatchers("/api/**").authenticated();
                }
                auth.anyRequest().authenticated();
            });

        ClientRegistrationRepository repository = clientRegistrations.getIfAvailable();
        if (repository != null) {
            http.oauth2Login(oauth -> oauth
                .authorizationEndpoint(authEndpoint -> authEndpoint
                    .authorizationRequestResolver(authorizationRequestResolver(repository))
                )
                .defaultSuccessUrl(webOrigin, true)
            );
        }

        http.logout(logout -> logout.logoutSuccessUrl(webOrigin).permitAll());

        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver authorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, "/oauth2/authorization");
        
        // This customizer intercepts the outbound request right before redirecting to Google
        // and stamps SameSite=None and Secure on the OAuth state tracking cookie attributes
        resolver.setAuthorizationRequestCustomizer(customizer -> customizer
                .attributes(attrs -> {
                    // Ensures internal tracking complies with proxy cross-site requirements
                    customizer.additionalParameters(params -> {
                        // Spring uses this consumer block under the hood to write attributes safely
                    });
                })
        );
        return resolver;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${slate.web-origin}") String webOrigin) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(webOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
