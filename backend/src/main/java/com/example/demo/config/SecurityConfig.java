package com.example.demo.config;
import java.util.List;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Regras de acesso. Para mudar quem pode o que, e so mexer aqui.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // publico: login, formulario "saber mais" e consulta de imoveis
                .requestMatchers(HttpMethod.POST,
                    "/public/login", "/public/register", "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/imoveis/sabermais/**", "/imoveis/*/contato").permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/imoveis/**", "/bairros/**", "/tipos-imoveis/**", "/fotos/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                // pagina de erro do Spring: sem isso um 400/404 numa rota publica vira 401
                .requestMatchers("/error").permitAll()
                // alterar o status de um imovel: qualquer usuario autenticado (ADMIN ou USER)
                .requestMatchers(HttpMethod.PATCH, "/imoveis/*/status").authenticated()
                // o que sobrou dessas rotas (escrita, usuarios, e-mail de teste): so ADMIN
                .requestMatchers("/imoveis/**", "/bairros/**", "/tipos-imoveis/**",
                    "/fotos/**", "/users/**", "/email/**").hasRole("ADMIN")
                // qualquer outra rota (ex.: /auth/me): precisa estar logado
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(conversor())));

        return http.build();
    }

    @Bean
public CorsConfigurationSource corsConfigurationSource(
@Value("${app.cors.allowed-origins}") List<String> origens) {
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOrigins(origens);
config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
config.setExposedHeaders(List.of("Location"));
config.setMaxAge(3600L);
UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", config);
return source;
}


    // transforma o claim "tipo" do token (ex.: ADMIN) na autoridade ROLE_ADMIN
    private JwtAuthenticationConverter conversor() {
        JwtGrantedAuthoritiesConverter autoridades = new JwtGrantedAuthoritiesConverter();
        autoridades.setAuthoritiesClaimName("tipo");
        autoridades.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(autoridades);
        return conversor;
    }
}
