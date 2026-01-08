package com.jaychou.kongaicode.controller;

import com.jaychou.kongaicode.constant.AppConstant;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * 静态资源访问
 */
@RestController
@RequestMapping("/static")
public class StaticResourceController {

    // 应用生成根目录（用于浏览）
    private static final String PREVIEW_ROOT_DIR = AppConstant.CODE_OUTPUT_ROOT_DIR;

    /**
     * 给跨域 iframe 用的基础接收器：接收并执行父窗口通过 postMessage 注入的脚本
     * （visualEditor.ts 会发送 type=INJECT_SCRIPT 的消息作为回退方案）
     */
    private static final String VISUAL_EDITOR_RECEIVER_SNIPPET = """
            <script id="visual-editor-receiver">
              window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'INJECT_SCRIPT' && event.data.script) {
                  try {
                    new Function(event.data.script)();
                  } catch (e) {
                    console.error('执行脚本失败:', e);
                  }
                }
              });
            </script>
            """;

    /**
     * 提供静态资源访问，支持目录重定向
     * 访问格式：http://localhost:8123/api/static/{deployKey}[/{fileName}]
     */
    @GetMapping("/{deployKey}/**")
    public ResponseEntity<Resource> serveStaticResource(
            @PathVariable String deployKey,
            HttpServletRequest request) {
        try {
            // 获取资源路径
            String resourcePath = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            resourcePath = resourcePath.substring(("/static/" + deployKey).length());
            // 如果是目录访问（不带斜杠），重定向到带斜杠的URL
            if (resourcePath.isEmpty()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add("Location", request.getRequestURI() + "/");
                return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
            }
            // 默认返回 index.html
            if (resourcePath.equals("/")) {
                resourcePath = "/index.html";
            }
            // 构建文件路径
            String filePath = PREVIEW_ROOT_DIR + "/" + deployKey + resourcePath;
            File file = new File(filePath);
            // 检查文件是否存在
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 对 HTML 做一次“接收器脚本”注入，保证跨域 iframe 也能通过 postMessage 注入可视化编辑脚本
            if (filePath.endsWith(".html")) {
                String html = Files.readString(file.toPath(), StandardCharsets.UTF_8);
                if (!html.contains("id=\"visual-editor-receiver\"")) {
                    html = injectReceiverSnippetIntoHtml(html);
                }
                byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
                Resource resource = new ByteArrayResource(bytes);
                return ResponseEntity.ok()
                        .header("Content-Type", "text/html; charset=UTF-8")
                        .body(resource);
            }

            // 返回文件资源
            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .header("Content-Type", getContentTypeWithCharset(filePath))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 根据文件扩展名返回带字符编码的 Content-Type
     */
    private String getContentTypeWithCharset(String filePath) {
        if (filePath.endsWith(".html")) return "text/html; charset=UTF-8";
        if (filePath.endsWith(".css")) return "text/css; charset=UTF-8";
        if (filePath.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (filePath.endsWith(".png")) return "image/png";
        if (filePath.endsWith(".jpg")) return "image/jpeg";
        return "application/octet-stream";
    }

    /**
     * 将接收器脚本尽量注入到 </head> 前，其次 </body> 前，否则追加到末尾
     */
    private String injectReceiverSnippetIntoHtml(String html) {
        String lower = html.toLowerCase();
        int headClose = lower.lastIndexOf("</head>");
        if (headClose >= 0) {
            return html.substring(0, headClose) + VISUAL_EDITOR_RECEIVER_SNIPPET + html.substring(headClose);
        }
        int bodyClose = lower.lastIndexOf("</body>");
        if (bodyClose >= 0) {
            return html.substring(0, bodyClose) + VISUAL_EDITOR_RECEIVER_SNIPPET + html.substring(bodyClose);
        }
        return html + VISUAL_EDITOR_RECEIVER_SNIPPET;
    }
}
