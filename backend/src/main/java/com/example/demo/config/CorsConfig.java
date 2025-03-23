package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Luba päringud kõigilt originidelt (arenduse ajal)
        config.addAllowedOrigin("http://localhost:5173");
        
        // Luba kõik HTTP meetodid
        config.addAllowedMethod("*");
        
        // Luba kõik päised
        config.addAllowedHeader("*");
        
        // Luba credentials (nt küpsised)
        config.setAllowCredentials(true);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 