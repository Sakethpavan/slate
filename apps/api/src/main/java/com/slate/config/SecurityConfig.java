package com.slate.config;

import java.io.IOException;
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
import org.springframework.security.web.header.HeaderWriterFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        ObjectProvider<ClientRegistrationRepository> clientRegistrations,
        @Value("${slate.web-origin}") String webOrigin,
        @Value("${slate.security.dev-user-enabled:false}") boolean devUserEnabled,
        @Value("${server.servlet.session.cookie.domain:}") String cookieDomain
    ) throws Exception {
        
        // Only apply the header rewrite filter if a specific cookie domain is provided in yaml
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            http.addFilterBefore(new ProxyCookieFilter(cookieDomain), HeaderWriterFilter.class);
        }

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
        
        resolver.setAuthorizationRequestCustomizer(customizer -> customizer
                .attributes(attrs -> {})
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

    // Filter now accepts a dynamic domain configuration string at instance execution time
    private static class ProxyCookieFilter implements Filter {
        private final String domain;

        public ProxyCookieFilter(String domain) {
            this.domain = domain;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            chain.doFilter(request, new HttpServletResponseWrapper(httpResponse) {
                @Override
                public void addHeader(String name, String value) {
                    if ("Set-Cookie".equalsIgnoreCase(name) && value.contains("JSESSIONID")) {
                        if (!value.contains("Domain=")) {
                            // Injecting the dynamic property into the raw cookie header string safely
                            value += String.format("; Domain=%s; Secure; SameSite=None; Path=/", domain);
                        }
                    }
                    super.addHeader(name, value);
                }
            });
        }
    }
}
