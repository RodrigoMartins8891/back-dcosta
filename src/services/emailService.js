import nodemailer from 'nodemailer';
import dotenv      from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // senha de app do Gmail
  },
});

const STATUS_LABELS = {
  'Pendente':   '⏳ Pedido recebido',
  'Concluída':  '✅ Pedido enviado',
  'Cancelado':  '❌ Pedido cancelado',
};

export async function enviarEmailStatus(pedido, emailCliente, nomeCliente) {
  const label = STATUS_LABELS[pedido.status] || pedido.status;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1D9E75; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">OrdenhaParts</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Olá, ${nomeCliente}!</h2>
        <p style="color: #666; font-size: 16px;">
          O status do seu pedido <strong>#${pedido.id}</strong> foi atualizado:
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1D9E75;">
          <h3 style="margin: 0; color: #1D9E75;">${label}</h3>
        </div>

        ${pedido.nf ? `<p style="color: #666;">Nota fiscal: <strong>${pedido.nf}</strong></p>` : ''}

        <p style="color: #666;">
          Prazo de entrega estimado: <strong>${pedido.prazo_dias || 7} dias úteis</strong>
        </p>
      </div>

      <div style="background: #333; padding: 15px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">
          OrdenhaParts — Peças para ordenhadeiras
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"OrdenhaParts" <${process.env.EMAIL_USER}>`,
    to:      emailCliente,
    subject: `Pedido #${pedido.id} — ${label}`,
    html,
  });
}