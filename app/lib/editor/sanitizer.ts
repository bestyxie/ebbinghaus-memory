import DOMPurify from 'dompurify';

const purify = typeof window !== 'undefined' ? DOMPurify : null;

const ALLOWED_TAGS = [
  'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u',
  'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'mark', 'a',
];

const ALLOWED_ATTR = ['class', 'href', 'style'];

let hooksRegistered = false;

function registerHooks() {
  if (!purify || hooksRegistered) return;

  purify.addHook('uponSanitizeAttribute', (node: HTMLElement, data: { attrName: string; attrValue: string; attributeName: string }) => {
    if (data.attrName === 'style') {
      const style = data.attrValue as string;
      const allowedPatterns = [
        /^text-align:\s*(left|center|right|justify)\s*;?$/i,
        /^background-color:\s*#[0-9a-f]{3,6}\s*;?$/i,
      ];
      if (!allowedPatterns.some(pattern => pattern.test(style))) {
        data.attrValue = '';
        node.removeAttribute(data.attrName);
      }
    }
    if (data.attrName === 'href') {
      const href = data.attrValue as string;
      if (href.startsWith('javascript:') || href.startsWith('data:')) {
        data.attrValue = '';
        node.removeAttribute('href');
      }
    }
  });

  hooksRegistered = true;
}

export function sanitizeHTML(html: string): string {
  if (!html) return '';

  if (!purify) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  registerHooks();

  return purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
  });
}

export function sanitizeHTMLStrict(html: string): string {
  if (!html) return '';

  if (!purify) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  registerHooks();

  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
  });
}
