import { db } from './db';

export async function exportProductsToWXR(filters?: any): Promise<string> {
  const products = await db.product.findMany({ include: { categoryObj: true }, where: filters });

  const itemsXml = products.map(p => {
    const postId = p.id;
    const postName = p.slug;
    const title = escapeXml(p.title);
    const content = wrapCdata(p.content || p.description || '');
    const excerpt = wrapCdata(p.description || '');
    const guid = `https://example.com/?post_type=product&p=${postId}`;
    const productCat = escapeXml(p.categoryObj.name);
    const thumbMeta = '';
    const galleryMeta = '';
    return (
`\n\t<item>
\t\t<title>${title}</title>
\t\t<link>https://example.com/product/${postName}</link>
\t\t<guid isPermaLink="false">${guid}</guid>
\t\t<description></description>
\t\t<content:encoded>${content}</content:encoded>
\t\t<excerpt:encoded>${excerpt}</excerpt:encoded>
\t\t<wp:post_id>${postId}</wp:post_id>
\t\t<wp:post_type>product</wp:post_type>
\t\t<wp:status>publish</wp:status>
\t\t<wp:post_name>${postName}</wp:post_name>
\t\t<category domain="product_cat" nicename="${encodeURIComponent(productCat)}"><![CDATA[${p.categoryObj.name}]]></category>
\t\t<wp:postmeta><wp:meta_key>_sku</wp:meta_key><wp:meta_value><![CDATA[${p.sku}]]></wp:meta_value></wp:postmeta>
\t\t<wp:postmeta><wp:meta_key>_price</wp:meta_key><wp:meta_value><![CDATA[${p.price}]]></wp:meta_value></wp:postmeta>
\t\t<wp:postmeta><wp:meta_key>_stock_status</wp:meta_key><wp:meta_value><![CDATA[${p.isInStock ? 'instock' : 'outofstock'}]]></wp:meta_value></wp:postmeta>
${thumbMeta}${galleryMeta}
\t</item>`);
  }).join('');

  const header = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
\txmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
\t<title>Export</title>
\t<link>https://example.com</link>
\t<description>Products export</description>
\t<wp:wxr_version>1.2</wp:wxr_version>`;

  const footer = `\n</channel>\n</rss>`;

  return header + itemsXml + footer;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapCdata(value: string): string {
  if (!value) return '<![CDATA[]]>';
  return `<![CDATA[${value}]]>`;
}









