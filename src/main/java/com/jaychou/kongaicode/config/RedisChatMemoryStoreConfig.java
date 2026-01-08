package com.jaychou.kongaicode.config;

import cn.hutool.core.util.StrUtil;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis 持久化对话记忆
 * 使用 Spring Data Redis 实现，解决 LangChain4j RedisChatMemoryStore 的认证问题
 */
@Configuration
@ConfigurationProperties(prefix = "spring.data.redis")
@Data
@Slf4j
public class RedisChatMemoryStoreConfig {

    private String host;

    private int port;

    private String password;

    private long ttl;

    @PostConstruct
    public void logConfig() {
        log.info("Redis config - host: {}, port: {}, password: {}, ttl: {}", 
                host, port, StrUtil.isNotBlank(password) ? "***" : "(empty)", ttl);
    }

    @Bean
    public ChatMemoryStore chatMemoryStore(StringRedisTemplate redisTemplate) {
        log.info("Creating SpringDataRedisChatMemoryStore with ttl: {} seconds", ttl);
        return new SpringDataRedisChatMemoryStore(redisTemplate, ttl);
    }
}
