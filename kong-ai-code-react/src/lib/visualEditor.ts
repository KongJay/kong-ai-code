/**
 * 可视化编辑器工具类
 * 负责管理iframe内的可视化编辑功能
 * 
 * 注意：跨域场景下的使用
 * 如果 iframe 的内容与父页面不同源（跨域），需要在生成的 HTML 中添加基础接收器脚本：
 * 
 * <script>
 *   // 基础接收器：接收并执行父窗口发送的脚本
 *   window.addEventListener('message', function(event) {
 *     if (event.data && event.data.type === 'INJECT_SCRIPT' && event.data.script) {
 *       try {
 *         new Function(event.data.script)();
 *       } catch (e) {
 *         console.error('执行脚本失败:', e);
 *       }
 *     }
 *   });
 * </script>
 */
export interface ElementInfo {
  tagName: string
  id: string
  className: string
  textContent: string
  selector: string
  pagePath: string
  rect: {
    top: number
    left: number
    width: number
    height: number
  }
}

export interface VisualEditorOptions {
  onElementSelected?: (elementInfo: ElementInfo) => void
  onElementHover?: (elementInfo: ElementInfo) => void
}

export class VisualEditor {
  private iframe: HTMLIFrameElement | null = null
  private isEditMode = false
  private options: VisualEditorOptions
  private hasWarnedCrossOrigin = false

  constructor(options: VisualEditorOptions = {}) {
    this.options = options
    console.log('[VisualEditor] constructor called, initial isEditMode:', this.isEditMode)
  }

  /**
   * 初始化编辑器
   */
  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe
  }

  /**
   * 开启编辑模式
   * 仿照 Vue 版本的简洁实现
   */
  enableEditMode() {
    console.log('[VisualEditor] enableEditMode called, iframe:', !!this.iframe)
    if (!this.iframe) {
      console.warn('[VisualEditor] enableEditMode: iframe not initialized')
      return
    }
    this.isEditMode = true
    console.log('[VisualEditor] enableEditMode: set isEditMode=true, will inject script in 300ms')
    setTimeout(() => {
      console.log('[VisualEditor] enableEditMode: calling injectEditScript')
      this.injectEditScript()
    }, 300)
  }

  /**
   * 关闭编辑模式
   */
  disableEditMode() {
    this.isEditMode = false
    this.sendMessageToIframe({
      type: 'TOGGLE_EDIT_MODE',
      editMode: false,
    })
    // 清除所有编辑状态
    this.sendMessageToIframe({
      type: 'CLEAR_ALL_EFFECTS',
    })
  }

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    if (!this.iframe) {
      console.warn('[VisualEditor] toggleEditMode: iframe not initialized')
      return this.isEditMode
    }

    if (this.isEditMode) {
      this.disableEditMode()
      return false
    }

    this.enableEditMode()
    return true
  }

  /**
   * 强制同步状态并清理
   */
  syncState() {
    if (!this.isEditMode) {
      this.sendMessageToIframe({
        type: 'CLEAR_ALL_EFFECTS',
      })
    }
  }

  /**
   * 清除选中的元素
   */
  clearSelection() {
    this.sendMessageToIframe({
      type: 'CLEAR_SELECTION',
    })
  }

  /**
   * iframe 加载完成时调用
   */
  onIframeLoad() {
    if (this.isEditMode) {
      setTimeout(() => {
        this.injectEditScript()
      }, 500)
    } else {
      // 确保非编辑模式时清理状态
      setTimeout(() => {
        this.syncState()
      }, 500)
    }
  }

  /**
   * 处理来自 iframe 的消息
   */
  handleIframeMessage(event: MessageEvent) {
    if (!event?.data || typeof event.data !== 'object') return
    const { type, data } = event.data as any
    switch (type) {
      case 'ELEMENT_SELECTED':
        if (this.options.onElementSelected && data.elementInfo) {
          this.options.onElementSelected(data.elementInfo)
        }
        break
      case 'ELEMENT_HOVER':
        if (this.options.onElementHover && data.elementInfo) {
          this.options.onElementHover(data.elementInfo)
        }
        break
    }
  }

  /**
   * 向 iframe 发送消息
   */
  private sendMessageToIframe(message: Record<string, any>) {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*')
      console.log('[VisualEditor] 发送消息到 iframe:', message.type)
    } else {
      console.warn('[VisualEditor] 无法发送消息：iframe.contentWindow 不存在')
    }
  }

  /**
   * 注入编辑脚本到 iframe
   */
  private injectEditScript() {
    if (!this.iframe) return

    /**
     * 等待 iframe 加载完成并注入编辑脚本的内部函数
     * 仿照 Vue 版本的简洁实现：简单轮询等待 contentDocument 可用
     */
    let attempts = 0
    const maxAttemptsBeforeFallback = 12 // 12 * 100ms = 1.2s

    const fallbackByPostMessage = (reason: string) => {
      try {
        if (!this.hasWarnedCrossOrigin) {
          this.hasWarnedCrossOrigin = true
          console.warn(
            `[VisualEditor] injectEditScript: fallback to postMessage INJECT_SCRIPT (${reason}). ` +
              'Ensure iframe page has the receiver snippet.'
          )
        }
        const script = this.generateEditScript()
        this.sendMessageToIframe({
          type: 'INJECT_SCRIPT',
          script,
        })
      } catch {
        console.warn('[VisualEditor] injectEditScript: INJECT_SCRIPT postMessage failed')
      }
    }

    const waitForIframeLoad = () => {
      attempts++
      try {
        // 某些浏览器跨域时 contentDocument 不会抛异常，而是直接为 null
        // 如果持续为 null，说明很可能是跨域，直接回退 postMessage 注入
        const hasWindow = !!this.iframe!.contentWindow
        const doc = this.iframe!.contentDocument
        if (hasWindow && !doc && attempts >= maxAttemptsBeforeFallback) {
          fallbackByPostMessage('contentDocument is null (likely cross-origin)')
          return
        }

        if (this.iframe!.contentWindow && doc && doc.head && doc.body) {
          // iframe 已加载完成，可以访问 contentDocument
          const contentDoc = doc
          
          // 检查是否已经注入过编辑脚本（通过检查 script 标签的 id）
          // 如果已经注入过，避免重复注入，直接激活编辑模式即可
          if (contentDoc.getElementById('visual-edit-script')) {
            this.sendMessageToIframe({
              type: 'TOGGLE_EDIT_MODE',
              editMode: true,
            })
            return
          }

          // 如果脚本未注入，开始注入流程
          const script = this.generateEditScript()
          const scriptElement = contentDoc.createElement('script')
          scriptElement.id = 'visual-edit-script'
          scriptElement.textContent = script
          contentDoc.head.appendChild(scriptElement)
          console.log('[VisualEditor] injectEditScript: script injected into iframe (same-origin)')
        } else {
          // iframe 还未加载完成，100ms 后重试
          if (attempts >= maxAttemptsBeforeFallback && hasWindow) {
            // 兜底：加载超时也回退（例如 head/body 一直不可用或被拦截）
            fallbackByPostMessage('iframe document not ready (timeout)')
            return
          }
          setTimeout(waitForIframeLoad, 100)
        }
      } catch {
        // contentDocument 访问抛 SecurityError：跨域，回退为 postMessage 注入
        fallbackByPostMessage('cannot access iframe DOM (SecurityError)')
      }
    }

    waitForIframeLoad()
  }

  /**
   * 生成编辑脚本内容
   */
  private generateEditScript() {
    return `
      (function() {
        let isEditMode = true;
        let currentHoverElement = null;
        let currentSelectedElement = null;

        function injectStyles() {
          if (document.getElementById('edit-mode-styles')) return;
          const style = document.createElement('style');
          style.id = 'edit-mode-styles';
          style.textContent = \`
            .edit-hover {
              outline: 2px dashed #1890ff !important;
              outline-offset: 2px !important;
              cursor: crosshair !important;
              transition: outline 0.2s ease !important;
              position: relative !important;
            }
            .edit-hover::before {
              content: '' !important;
              position: absolute !important;
              top: -4px !important;
              left: -4px !important;
              right: -4px !important;
              bottom: -4px !important;
              background: rgba(24, 144, 255, 0.02) !important;
              pointer-events: none !important;
              z-index: -1 !important;
            }
            .edit-selected {
              outline: 3px solid #52c41a !important;
              outline-offset: 2px !important;
              cursor: default !important;
              position: relative !important;
            }
            .edit-selected::before {
              content: '' !important;
              position: absolute !important;
              top: -4px !important;
              left: -4px !important;
              right: -4px !important;
              bottom: -4px !important;
              background: rgba(82, 196, 26, 0.03) !important;
              pointer-events: none !important;
              z-index: -1 !important;
            }
          \`;
          document.head.appendChild(style);
        }

        // 生成元素选择器
        function generateSelector(element) {
          const path = [];
          let current = element;
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
              selector += '#' + current.id;
              path.unshift(selector);
              break;
            }
            if (current.className) {
              const className = (typeof current.className === 'string')
                ? current.className
                : (current.className && typeof current.className.baseVal === 'string')
                  ? current.className.baseVal
                  : '';
              const classes = className.split(' ').filter(c => c && !c.startsWith('edit-'));
              if (classes.length > 0) {
                selector += '.' + classes.join('.');
              }
            }
            const siblings = Array.from(current.parentElement?.children || []);
            const index = siblings.indexOf(current) + 1;
            selector += ':nth-child(' + index + ')';
            path.unshift(selector);
            current = current.parentElement;
          }
          return path.join(' > ');
        }

        // 获取元素信息
        function getElementInfo(element) {
          const rect = element.getBoundingClientRect();
          // 获取 HTML 文件名后面的部分（查询参数和锚点）
          let pagePath = window.location.search + window.location.hash;
          // 如果没有查询参数和锚点，则显示为空
          if (!pagePath) {
            pagePath = '';
          }

          return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.trim().substring(0, 100) || '',
            selector: generateSelector(element),
            pagePath: pagePath,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        }

        // 清除悬浮效果
        function clearHoverEffect() {
          if (currentHoverElement) {
            currentHoverElement.classList.remove('edit-hover');
            currentHoverElement = null;
          }
        }

        // 清除选中效果
        function clearSelectedEffect() {
          const selected = document.querySelectorAll('.edit-selected');
          selected.forEach(el => el.classList.remove('edit-selected'));
          currentSelectedElement = null;
        }

        let eventListenersAdded = false;

        function addEventListeners() {
           if (eventListenersAdded) return;
           if (!document.body) {
             setTimeout(addEventListeners, 50);
             return;
           }

           const mouseoverHandler = (event) => {
             if (!isEditMode) return;

             const target = event.target;
             if (!(target instanceof Element)) return;
             if (target === currentHoverElement || target === currentSelectedElement) return;
             if (target === document.body || target === document.documentElement) return;
             if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

             clearHoverEffect();
             target.classList.add('edit-hover');
             currentHoverElement = target;
           };

           const mouseoutHandler = (event) => {
             if (!isEditMode) return;

             const target = event.target;
             if (!(target instanceof Element)) return;
             const related = event.relatedTarget;
             if (!related || !(related instanceof Node) || !target.contains(related)) {
               clearHoverEffect();
             }
           };

           const clickHandler = (event) => {
             if (!isEditMode) return;

             event.preventDefault();
             event.stopPropagation();

             const target = event.target;
             if (!(target instanceof Element)) return;
             if (target === document.body || target === document.documentElement) return;
             if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

             clearSelectedEffect();
             clearHoverEffect();

             target.classList.add('edit-selected');
             currentSelectedElement = target;

             const elementInfo = getElementInfo(target);
             try {
               window.parent.postMessage({
                 type: 'ELEMENT_SELECTED',
                 data: { elementInfo }
               }, '*');
             } catch {
               // 静默处理发送失败
             }
           };

           document.body.addEventListener('mouseover', mouseoverHandler, true);
           document.body.addEventListener('mouseout', mouseoutHandler, true);
           document.body.addEventListener('click', clickHandler, true);
           eventListenersAdded = true;
        }

        function setupEventListeners() {
           addEventListeners();
        }

        // 监听父窗口消息
        window.addEventListener('message', (event) => {
           const { type, editMode } = event.data;
           switch (type) {
             case 'TOGGLE_EDIT_MODE':
               isEditMode = editMode;
               if (isEditMode) {
                 injectStyles();
                 setupEventListeners();
                 showEditTip();
               } else {
                 clearHoverEffect();
                 clearSelectedEffect();
               }
               break;
             case 'CLEAR_SELECTION':
               clearSelectedEffect();
               break;
             case 'CLEAR_ALL_EFFECTS':
               isEditMode = false;
               clearHoverEffect();
               clearSelectedEffect();
               const tip = document.getElementById('edit-tip');
               if (tip) tip.remove();
               break;
           }
        });

        function showEditTip() {
           if (document.getElementById('edit-tip')) return;
           if (!document.body) {
             setTimeout(showEditTip, 50);
             return;
           }
           const tip = document.createElement('div');
           tip.id = 'edit-tip';
           tip.innerHTML = '🎯 编辑模式已开启<br/>悬浮查看元素，点击选中元素';
           tip.style.cssText = \`
             position: fixed;
             top: 20px;
             right: 20px;
             background: #1890ff;
             color: white;
             padding: 12px 16px;
             border-radius: 6px;
             font-size: 14px;
             z-index: 9999;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
             animation: fadeIn 0.3s ease;
           \`;
           const style = document.createElement('style');
           style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';
           document.head.appendChild(style);
           document.body.appendChild(tip);
           setTimeout(() => {
             if (tip.parentNode) {
               tip.style.animation = 'fadeIn 0.3s ease reverse';
               setTimeout(() => tip.remove(), 300);
             }
           }, 3000);
        }
        injectStyles();
        setupEventListeners();
        showEditTip();
      })();
    `
  }
}
