package com.cypherdon.core.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1) // Execute after internal API key check or other low-level filters
public class TenantFilter implements Filter {

    private static final UUID DEFAULT_TENANT_ID = UUID.fromString("d3b07384-d113-4956-a5db-257b4457e5e3");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            String tenantHeader = httpRequest.getHeader("X-Tenant-ID");
            UUID tenantId = DEFAULT_TENANT_ID;

            if (tenantHeader != null && !tenantHeader.trim().isEmpty()) {
                try {
                    tenantId = UUID.fromString(tenantHeader);
                } catch (IllegalArgumentException e) {
                    // Invalid UUID format, ignore and fall back to default
                }
            }

            // Set the thread-local context
            TenantContext.setCurrentTenant(tenantId);
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // Clean up thread-local storage to prevent memory leaks
            TenantContext.clear();
        }
    }
}
