
# Sistema de Marketing e E-mail Automático - Balão Castelo

Este sistema permite o envio automático de e-mails transacionais e campanhas de marketing.

## 1. Configuração do Banco de Dados (Supabase)

Acesse o Dashboard do Supabase, vá em **SQL Editor** e execute o conteúdo do arquivo `supabase/marketing_schema.sql`.

Isso criará as tabelas:
- `marketing_campaigns`: Armazena as campanhas de e-mail.
- `marketing_subscribers`: Lista de contatos (clientes e inscritos).
- `marketing_logs`: Histórico de envios e erros.

## 2. Configuração de Variáveis de Ambiente (.env.local)

Adicione as seguintes chaves ao seu arquivo `.env.local` (ou configure na Vercel):

```env
# Configurações SMTP (Ex: Brevo, SendGrid, Gmail)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu_email_login@brevo.com
SMTP_PASS=sua_chave_api_smtp

# URL do Site (para links nos e-mails)
NEXT_PUBLIC_SITE_URL=https://balaocastelo.com.br
```

## 3. Funcionalidades

### Painel Administrativo (/admin)
Acesse a aba **Marketing & E-mail** para:
- **Campanhas**: Criar, editar e excluir campanhas de e-mail.
- **Editor**: Editor visual com suporte a HTML e inserção rápida de produtos do catálogo.
- **Agendamento**: Agende envios para data/hora futura.
- **Segmentação**: Envie para todos, apenas compradores ou apenas leads.
- **Inscritos**: Gerencie sua lista de contatos e importe CSVs (formato: `email,nome`).
- **Logs**: Acompanhe o status de envio de cada e-mail.

### E-mails Automáticos
O sistema envia automaticamente:
- **Novo Pedido**: Confirmação para o cliente com detalhes e endereço.
- **Notificação Admin**: Aviso para `balaocastelo@gmail.com` sobre novos pedidos, contatos e cadastros.
- **Boas-vindas**: (Opcional) Ao se cadastrar na newsletter.

### Cron Job (Agendamento)
Para que o agendamento funcione automaticamente na Vercel, configure um Cron Job para chamar a rota:
`GET /api/cron/process-emails`
(Frequência sugerida: a cada 10 ou 30 minutos).

## 4. Testes
- Use o botão **Preview** no editor para ver como o e-mail ficará.
- Use o botão **Enviar Teste** (ícone olho) na lista de campanhas para enviar para seu próprio e-mail antes do disparo final.
