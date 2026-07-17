package com.cypherdon.core.config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VettingWebSocketHandler extends TextWebSocketHandler {

    // Maps tenantId -> (sessionId -> session)
    private static final Map<String, Map<String, WebSocketSession>> tenantSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String tenantId = getTenantIdFromQuery(query);
        if (tenantId != null) {
            tenantSessions.computeIfAbsent(tenantId, k -> new ConcurrentHashMap<>()).put(session.getId(), session);
            System.out.println("WebSocket connection established for Tenant: " + tenantId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String query = session.getUri().getQuery();
        String tenantId = getTenantIdFromQuery(query);
        if (tenantId != null) {
            Map<String, WebSocketSession> sessions = tenantSessions.get(tenantId);
            if (sessions != null) {
                sessions.remove(session.getId());
                if (sessions.isEmpty()) {
                    tenantSessions.remove(tenantId);
                }
            }
            System.out.println("WebSocket connection closed for Tenant: " + tenantId);
        }
    }

    public void sendStatusUpdate(String tenantId, String message) {
        Map<String, WebSocketSession> sessions = tenantSessions.get(tenantId);
        if (sessions != null) {
            for (WebSocketSession session : sessions.values()) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(new TextMessage(message));
                    } catch (IOException e) {
                        System.err.println("Failed to send WebSocket message: " + e.getMessage());
                    }
                }
            }
        }
    }

    private String getTenantIdFromQuery(String query) {
        if (query == null) return null;
        String[] params = query.split("&");
        for (String param : params) {
            String[] keyVal = param.split("=");
            if (keyVal.length == 2 && "tenantId".equals(keyVal[0])) {
                return keyVal[1];
            }
        }
        return null;
    }
}
