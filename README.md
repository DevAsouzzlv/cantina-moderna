# Cantina Moderna - Colégio Novo Espaço

Sistema de gestão de cantina escolar desenvolvido com tecnologias modernas e ágeis.

## 🚀 Tecnologias Utilizadas

- **Vite** - Build tool ultrarrápido
- **React 19** - Biblioteca para interfaces de usuário
- **Tailwind CSS 4** - Framework CSS utilitário para estilização
- **Firebase** - Backend as a Service (Autenticação e Firestore)
- **Lucide React** - Biblioteca de ícones modernos

## 📦 Instalação e Execução

1. Clone este repositório:
   \`\`\`bash
   git clone <URL_DO_SEU_REPOSITORIO>
   \`\`\`

2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`

3. Configuração do Firebase:
   Abra o arquivo \`src/firebase-config.js\` e insira as credenciais do seu projeto Firebase na variável \`firebaseConfig\`.

4. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔐 Acesso ao Sistema

O sistema agora utiliza autenticação segura baseada em Email e Senha.
Certifique-se de habilitar o provedor de **E-mail/Senha** no painel do **Firebase Authentication**.

**Usuário Admin Padrão (necessário criar no painel do Firebase ou ajustar o código de registro):**
- Email: admin@cantina.com
- Senha: (Definida no Firebase)

## 📁 Estrutura do Projeto

- \`src/App.jsx\` - Componente principal com as rotas e views.
- \`src/firebase-config.js\` - Configuração do banco de dados e auth.
- \`src/index.css\` - Configuração global do Tailwind CSS.

---
Desenvolvido para o Colégio Novo Espaço.
