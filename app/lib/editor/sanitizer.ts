import DOMPurify from 'dompurify';

// Configure DOMPurify for our needs
const purify = DOMPurify();

const ALLOWED_TAGS = [
  'p',
  'br',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'mark',
  'a',
];

const ALLOWED_ATTR = [
  'class',
  'href',
  'style', // For text-align and background-color
];

// Custom hook to allow only safe style values
purify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') {
    const style = data.attrValue as string;

    // Only allow text-align and background-color
    const allowedPatterns = [
      /^text-align:\s*(left|center|right|justify)\s*;?$/i,
      /^background-color:\s*#[0-9a-f]{3,6}\s*;?$/i,
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(style));

    if (!isAllowed) {
      // Remove unsafe style
      delete node.attributes[data.attrName];
      data.attrValue = '';
    }
  }

  if (data.attrName === 'href') {
    // Block javascript: and data: URLs
    const href = data.attrValue as string;
    if (href.startsWith('javascript:') || href.startsWith('data:')) {
      delete node.attributes['href'];
      data.attrValue = '';
    }
  }
});

export function sanitizeHTML(html: string): string {
  if (!html) return '';

  return purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false, // Return string, not TrustedHTML
    SANITIZE_DOM: true,
  });
}

export function sanitizeHTMLStrict(html: string): string {
  // For user-supplied content that needs extra sanitization
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
  });
}
