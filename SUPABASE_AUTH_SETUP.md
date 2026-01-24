# Configuração de Autenticação com Google no Supabase

O erro `Unsupported provider: provider is not enabled` ocorre porque o provedor de login do Google não está ativado no painel do seu projeto Supabase.

Para corrigir isso e permitir que os usuários façam login com o Google, siga os passos abaixo:

## 1. Configurar o Projeto no Google Cloud Platform (GCP)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto (ou selecione um existente).
3. Vá para **APIs e Serviços** > **Tela de permissão OAuth**.
   - Selecione **Externo** e clique em **Criar**.
   - Preencha o nome do App (ex: Balão da Informática), email de suporte e dados do desenvolvedor.
   - Clique em **Salvar e Continuar**.
4. Vá para **Credenciais**.
   - Clique em **Criar Credenciais** > **ID do cliente OAuth**.
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Nome: `Supabase Login`.
   - **Origens JavaScript autorizadas**: Adicione a URL do seu site (ex: `http://localhost:3000` para testes e sua URL de produção `https://seu-dominio.com`).
   - **URIs de redirecionamento autorizados**: Você precisará da URL de Callback do Supabase (veja o passo 2).
     - Geralmente é: `https://<SEU-PROJETO-ID>.supabase.co/auth/v1/callback`

## 2. Configurar o Provedor Google no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard).
2. Selecione o seu projeto.
3. No menu lateral esquerdo, vá em **Authentication** > **Providers**.
4. Encontre **Google** na lista e clique para expandir.
5. Ative a opção **Google enabled**.
6. Copie o **Client ID** e o **Client Secret** gerados no passo 1 (Google Cloud) e cole nos campos correspondentes no Supabase.
7. Copie a **Callback URL** mostrada nesta tela do Supabase e adicione-a nas "URIs de redirecionamento autorizados" no Google Cloud Console (passo 1.4).
8. Clique em **Save**.

## 3. Testar

Após salvar, tente fazer login novamente no site. O erro `provider is not enabled` deve desaparecer e o fluxo de login do Google deve iniciar.
