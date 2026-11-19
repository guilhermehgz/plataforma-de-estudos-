# Preparatório ACS — Canto do Buriti

Plataforma web de apoio à preparação para o concurso de Agente Comunitário de Saúde (ACS) de Canto do Buriti – PI. Reúne materiais de estudo, videoaulas, simulados e acompanhamento do progresso.

## Recursos

- **Início (`index.html`)**: atalhos para as áreas de estudo.
- **Materiais (`materiais.html`)**: conteúdos de Língua Portuguesa, Matemática e Conhecimentos Específicos – ACS, com busca por assunto e videoaulas associadas.
- **Simulados (`simulados.html`)**: prática por disciplina, testes completos configuráveis e seleção de questões por filtros.
- **Meu progresso (`progresso.html`)**: checklist de assuntos, resumo de desempenho, histórico e opções para exportar ou importar dados.
- **Apresentação (`vendas.html`)**: informações sobre a plataforma e formas de solicitar acesso.
- **Login (`login.html`)**: entrada na área de estudos.
- **Gerar usuário (`gerar-usuario.html`)**: ferramenta administrativa para gerar um bloco de usuário a adicionar manualmente.

## Tecnologias

O projeto usa HTML, CSS e JavaScript puro, sem etapa de compilação ou dependências de pacote. O arquivo `style.css` contém estilos compartilhados; `banco-questoes.js` guarda o banco de questões; e `users.js` implementa o login e a navegação protegida no navegador.

## Executar localmente

O site não precisa de instalação de dependências. Para executá-lo, abra um terminal na pasta do projeto e inicie um servidor HTTP local:

```powershell
py -m http.server 8000
```

Se o comando `py` não estiver disponível, tente:

```powershell
python -m http.server 8000
```

Depois, acesse <http://localhost:8000/vendas.html> para ver a apresentação ou <http://localhost:8000/login.html> para entrar. As páginas de estudo redirecionam para o login quando não há uma sessão válida. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

Também é possível usar a extensão Live Server do Visual Studio Code. Acesse por `localhost` ou HTTPS: o login e a geração de usuários usam a API Web Crypto, que pode não funcionar ao abrir os arquivos diretamente com o protocolo `file://`.

## Usuários e dados locais

O login é mantido no navegador usando armazenamento de sessão ou armazenamento local, conforme a opção “Manter conectado”. O progresso também é salvo localmente e não é sincronizado entre navegadores ou dispositivos. Use a exportação da página de progresso para guardar uma cópia dos dados.

Para cadastrar um usuário, use `gerar-usuario.html`, copie o bloco gerado e adicione-o ao array `USERS` em `users.js`. A senha não é incluída em texto puro no bloco, mas os dados de autenticação ficam disponíveis no código entregue ao navegador. **Este mecanismo é apropriado apenas para uma demonstração ou ambiente controlado; não substitui autenticação e armazenamento seguros em um servidor para uso público.**

## Estrutura do projeto

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Página inicial da área do candidato |
| `materiais.html` | Conteúdos, busca e videoaulas |
| `simulados.html` | Simulados e prática de questões |
| `progresso.html` | Acompanhamento e histórico de estudos |
| `login.html` | Formulário de acesso |
| `gerar-usuario.html` | Ferramenta administrativa para gerar usuários |
| `vendas.html` | Página pública de apresentação |
| `style.css` | Estilos compartilhados |
| `users.js` | Autenticação local e controle de acesso às páginas |
| `banco-questoes.js` | Dados das questões dos simulados |

As videoaulas estão associadas aos 67 assuntos de materiais em `materiais.html`. A reprodução incorporada depende da disponibilidade dos vídeos e do acesso ao YouTube.
