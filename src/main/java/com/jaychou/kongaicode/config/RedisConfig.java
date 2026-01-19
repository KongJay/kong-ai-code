package com.jaychou.kongaicode.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * Redis配置类
 * 修改Redis序列化方式为JSON，避免类名变更导致的反序列化问题
 */
@Configuration
@EnableRedisHttpSession
public class RedisConfig {

    /**
     * 配置Redis序列化器，使用JSON序列化替代JDK序列化
     * 这样可以避免类名变更导致的反序列化问题
     * 添加Java 8日期时间类型的支持
     */
    @Bean
    public RedisSerializer<Object> springSessionDefaultRedisSerializer() {
        // 创建ObjectMapper并注册Java 8日期时间模块
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}