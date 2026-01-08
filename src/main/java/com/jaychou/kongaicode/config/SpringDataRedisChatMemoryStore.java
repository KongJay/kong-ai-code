package com.jaychou.kongaicode.config;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageDeserializer;
import dev.langchain4j.data.message.ChatMessageSerializer;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 使用 Spring Data Redis 实现的 ChatMemoryStore
 * 解决 LangChain4j RedisChatMemoryStore 的认证问题
 */
@Slf4j
@RequiredArgsConstructor
public class SpringDataRedisChatMemoryStore implements ChatMemoryStore {

    private static final String KEY_PREFIX = "langchain4j:chat:";
    
    private final StringRedisTemplate redisTemplate;
    private final long ttlSeconds;

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String key = getKey(memoryId);
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null || json.isEmpty()) {
                return Collections.emptyList();
            }
            return ChatMessageDeserializer.messagesFromJson(json);
        } catch (Exception e) {
            log.error("Failed to get messages for memoryId: {}, error: {}", memoryId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String key = getKey(memoryId);
        try {
            String json = ChatMessageSerializer.messagesToJson(messages);
            redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Failed to update messages for memoryId: {}, error: {}", memoryId, e.getMessage());
        }
    }

    @Override
    public void deleteMessages(Object memoryId) {
        String key = getKey(memoryId);
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Failed to delete messages for memoryId: {}, error: {}", memoryId, e.getMessage());
        }
    }

    private String getKey(Object memoryId) {
        return KEY_PREFIX + memoryId.toString();
    }
}

