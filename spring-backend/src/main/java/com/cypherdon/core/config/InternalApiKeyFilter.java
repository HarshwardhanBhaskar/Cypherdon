package com.cypherdon.core.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Intercepts requests to internal service-to-service endpoints.
 * If a valid X-Internal-Secret header is present, the request is
 * authenticated as an internal service call (bypassing JWT).
 * If the header is missing or wrong, the request falls through
 * to Spring Security's normal JWT filter and will be rejected.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalApiKeyFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(InternalApiKeyFilter.class);

    @Value("${cypherdon.internal.secret}")
    private String expectedSecret;

    private static final List<String> INTERNAL_PATHS = List.of(
            "/api/emails/queue",
            "/api/ai/"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isInternalPath = INTERNAL_PATHS.stream().anyMatch(path::startsWith);

        if (isInternalPath) {
            String secret = request.getHeader("X-Internal-Secret");
            if (expectedSecret.equals(secret)) {
                // Inject a synthetic authentication so Spring Security allows the request
                var auth = new UsernamePasswordAuthenticationToken(
                        "internal-service", null, List.of()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                logger.debug("Internal service authenticated for path: {}", path);
            }
            // If secret is wrong, we do NOT set authentication.
            // Spring Security's JWT filter will reject it automatically.
        }

        filterChain.doFilter(request, response);
    }
}
