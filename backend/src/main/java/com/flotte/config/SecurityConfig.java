package com.flotte.config;

import com.flotte.repository.AppUserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Sécurité volontairement simple pour l'apprentissage :
 * HTTP Basic (identifiant:mot de passe envoyés à chaque requête, encodés en Base64),
 * sans session côté serveur (stateless).
 * => En production : HTTPS obligatoire + idéalement JWT / OIDC (ex. Amazon Cognito).
 */
@Configuration
@EnableMethodSecurity // active @PreAuthorize sur les contrôleurs
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Explique à Spring Security où trouver les utilisateurs : dans notre table app_user. */
    @Bean
    public UserDetailsService userDetailsService(AppUserRepository repo) {
        return username -> repo.findByUsername(username)
                .map(u -> User.withUsername(u.getUsername())
                        .password(u.getPasswordHash())
                        .roles(u.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur inconnu"));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Renvoie un 401 JSON SANS l'en-tête "WWW-Authenticate"
        // (sinon le navigateur afficherait sa propre fenêtre de login).
        AuthenticationEntryPoint unauthorized = (request, response, ex) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"status\":401,\"detail\":\"Identifiants invalides ou absents\"}");
        };

        http
                .csrf(csrf -> csrf.disable()) // API stateless sans cookie de session
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info", "/error").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().denyAll())
                .httpBasic(basic -> basic.authenticationEntryPoint(unauthorized))
                .exceptionHandling(e -> e.authenticationEntryPoint(unauthorized));
        return http.build();
    }
}
