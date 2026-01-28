package com.jaychou.kongaicode;

import dev.langchain4j.community.store.embedding.redis.spring.RedisEmbeddingStoreAutoConfiguration;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.ai.model.openai.autoconfigure.OpenAiChatAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication(exclude = {
        RedisEmbeddingStoreAutoConfiguration.class,
        OpenAiChatAutoConfiguration.class,
        OpenAiChatAutoConfiguration.class
})
@MapperScan("com.jaychou.kongaicode.mapper")
public class KongAiCodeApplication {

    public static void main(String[] args) {
        SpringApplication.run(KongAiCodeApplication.class, args);
    }
}