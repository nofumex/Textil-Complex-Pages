import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

type MailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

async function getEmailConfig() {
  const settings = await db.setting.findMany({ where: { key: { in: ['emailSettings'] } } });
  const map = settings.reduce<Record<string, any>>((acc, s) => {
    acc[s.key] = s.type === 'JSON' ? JSON.parse(s.value) : s.value;
    return acc;
  }, {});

  const email = map.emailSettings || {};
  return {
    host: email.smtpHost,
    port: Number(email.smtpPort ?? 587),
    user: email.smtpUser,
    pass: email.smtpPassword,
    from: email.fromEmail || 'noreply@example.com',
  };
}

export async function sendMail(options: MailOptions) {
  const cfg = await getEmailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error('SMTP не настроен');
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  return transporter.sendMail({
    from: cfg.from,
    to: Array.isArray(options.to) ? options.to.join(',') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export function renderOrderEmail(order: any) {
  const itemsHtml = (order.items || [])
    .map((it: any) => `<tr><td style="padding:8px;border:1px solid #eee">${it.product.title}</td><td style="padding:8px;border:1px solid #eee">${it.quantity}</td><td style="padding:8px;border:1px solid #eee">${Number(it.price).toFixed(2)}</td><td style="padding:8px;border:1px solid #eee">${Number(it.total).toFixed(2)}</td></tr>`) // basic inline table
    .join('');
  const html = `
  <div style="font-family:Arial,sans-serif;">
    <h2>Ваш заказ № ${order.orderNumber}</h2>
    <p>Спасибо за покупку! Мы свяжемся с вами для подтверждения.</p>
    <h3>Состав заказа</h3>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Товар</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Кол-во</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Цена</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Сумма</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:12px">Итого к оплате: <strong>${Number(order.total).toFixed(2)}</strong></p>
  </div>`;
  return html;
}

export function renderAdminOrderEmail(order: any, extra?: { addressText?: string | null }) {
  const address = order.address || {};
  const items = order.items || [];
  const itemsRows = items
    .map(
      (it: any) =>
        `<tr>
          <td style="padding:6px;border:1px solid #eee">${it.product?.title || ''}</td>
          <td style="padding:6px;border:1px solid #eee">${it.selectedColor || it.variant?.color || ''}</td>
          <td style="padding:6px;border:1px solid #eee">${it.selectedSize || it.variant?.size || ''}</td>
          <td style="padding:6px;border:1px solid #eee">${it.quantity}</td>
          <td style="padding:6px;border:1px solid #eee">${Number(it.price).toFixed(2)}</td>
          <td style="padding:6px;border:1px solid #eee">${Number(it.total).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const deliveryLabel =
    order.deliveryType === 'PICKUP' ? 'Самовывоз'
    : order.deliveryType === 'COURIER' ? 'Курьер'
    : order.deliveryType === 'TRANSPORT' ? 'Транспортная компания'
    : order.deliveryType || '-';

  const resolvedAddress = (extra?.addressText && extra.addressText.trim().length > 0)
    ? extra.addressText
    : [address.city, address.street, address.house, address.apartment].filter(Boolean).join(' ');

  const html = `
  <div style="font-family:Arial,sans-serif;">
    <h2>Новый заказ № ${order.orderNumber}</h2>
    <h3>Данные клиента</h3>
    <p><strong>Имя:</strong> ${order.firstName || ''} ${order.lastName || ''}</p>
    <p><strong>Компания:</strong> ${order.company || '-'}</p>
    <p><strong>Телефон:</strong> ${order.phone || '-'}</p>
    <p><strong>Email:</strong> ${order.email || '-'}</p>
    <p><strong>Комментарий:</strong> ${order.notes || '-'}</p>
    <p><strong>Тип доставки:</strong> ${deliveryLabel}</p>
    <h3>Адрес доставки</h3>
    <p>${resolvedAddress || '-'}</p>
    <h3>Состав заказа</h3>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Товар</th>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Цвет</th>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Размер</th>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Кол-во</th>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Цена</th>
          <th style="padding:6px;border:1px solid #eee;text-align:left">Сумма</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p style="margin-top:12px">Доставка: <strong>${Number(order.delivery).toFixed(2)}</strong></p>
    <p>Скидка: <strong>${Number(order.discount).toFixed(2)}</strong></p>
    <p>Итого: <strong>${Number(order.total).toFixed(2)}</strong></p>
  </div>`;
  return html;
}



