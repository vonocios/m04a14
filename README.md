# Mr. Dave Idiomas — Guia de Entrega e Integração WordPress

**Projeto:** Site institucional + Área do Aluno + Página de Aula Interativa  
**Cursos:** USpeaK (inglês) · Aquí Tú Hablas (espanhol)  
**Stack atual:** HTML / CSS / JS puro — pronto para integrar no WordPress

---

## Estrutura do projeto

```
/
├── index.html          → Landing page institucional
├── styles.css          → Estilos globais (landing + base do dashboard)
├── script.js           → JS da landing page
│
├── area-aluno.html     → Dashboard do aluno (login + painel)
├── area-aluno.css      → Estilos do dashboard
├── area-aluno.js       → Lógica do dashboard, TTS e progresso
│
├── aula.html           → Página de aula interativa (Lição 08, modelo)
├── aula.css            → Estilos da página de aula
├── aula.js             → TTS por bloco, hover, exercícios, progresso
│
└── imagens/            → Imagens extraídas da apostila Lição 08
    ├── hero_estudante_musica.jpg
    ├── diagrama_like_love_enjoy.jpg
    ├── tabela_present_continuous_hobbies.jpg
    ├── foto_amigos_xadrez.jpg
    ├── ilustracao_hungry_thirsty_tired.jpg
    ├── foto_dialogo_dancando.jpg
    └── exercicio_grid_fotos_hobbies.jpg
```

---

## Como rodar localmente (sem WordPress)

Não precisa de servidor ou build. Basta abrir os arquivos com o **Live Server** do VS Code para evitar bloqueios de CORS no TTS.

1. Instale a extensão **Live Server** no VS Code
2. Clique com botão direito em `index.html` → **Open with Live Server**
3. Para testar a área do aluno, acesse `area-aluno.html` e use **qualquer email + senha**
4. A lição 08 está em `aula.html` e pode ser acessada diretamente

---

## O que já está funcionando

- Landing page com preços reais, WhatsApp e email da escola
- Login simulado (aceita qualquer credencial)
- Dashboard com sidebar, progresso de lições e alerta financeiro
- Página de aula (Lição 08) completa com:
  - Text-to-Speech (TTS) por bloco de conteúdo
  - Hover em palavras e keywords para ouvir a pronúncia
  - Painel de configuração de voz: velocidade, tom, delay, língua
  - Footer fixo com barra de progresso de scroll e botão de conclusão
  - Exercícios interativos com verificação de resposta
  - Hook de "lição concluída" (salva no localStorage)

---

## Ajustes finos que o time precisa fazer

### 1. Imagens no `aula.html`

As imagens foram extraídas da apostila e estão em `imagens/`. Para inserir, adicione as tags após os blocos correspondentes em `aula.html`:

```html
<!-- Após o bloco do Exercício 1 -->
<img src="imagens/exercicio_grid_fotos_hobbies.jpg"
     alt="Grade de fotos: hobbies para descrever"
     class="lesson-img">

<!-- Após o bloco do diagrama de hobbies (Vocabulary) -->
<img src="imagens/diagrama_like_love_enjoy.jpg"
     alt="Diagrama: Like, Love, Enjoy + verbo -ing"
     class="lesson-img">

<!-- Após o Audio 04 (Grammar Part 1) -->
<img src="imagens/foto_amigos_xadrez.jpg"
     alt="Amigos praticando hobbies"
     class="lesson-img lesson-img-small">
```

Adicione em `aula.css`:

```css
.lesson-img {
    width: 100%;
    max-width: 600px;
    border-radius: 12px;
    margin: 1.25rem auto;
    display: block;
    border: 1px solid rgba(255,255,255,.08);
}
.lesson-img-small { max-width: 320px; }
```

---

### 2. Logo real no header

Em `index.html` e `area-aluno.html`, substitua o bloco `.logo` de texto:

```html
<a href="/" class="logo">
    <img src="imagens/logo_uspeak_mrdave.jpg" alt="Mr. Dave Idiomas" height="36">
</a>
```

---

### 3. Dados do aluno para testes

No topo de `area-aluno.js`, edite o objeto `DADOS_ALUNO`:

```js
const DADOS_ALUNO = {
    nome: 'Nome do Aluno',
    email: 'email@aluno.com',
    curso: 'uspeaK',         // 'uspeaK' ou 'aquiTuHablas'
    temDebito: false,        // true = exibe alerta financeiro
    valorDebito: 0,
};
```

---

### 4. Novas lições (a partir da Lição 09)

Para criar uma nova lição:

1. Duplique `aula.html` → renomeie para `aula-m02-l09.html`
2. Troque o conteúdo de cada `<section>` com o material da apostila
3. Em `area-aluno.js`, adicione `url: 'aula-m02-l09.html'` na lição 9 dentro do array `AULAS.uspeaK`
4. Em `aula.js`, troque `const lessonId = 'uspeaK_m02_l08'` para o ID da nova lição

Padrão de IDs: `uspeaK_m01_l01`, `uspeaK_m02_l08`, `uspeaK_m02_l09`, etc.

---

### 5. Formulário de contato

O formulário atual redireciona para o WhatsApp. No WordPress, substitua o `<form>` pelo shortcode do **WPForms** ou **Contact Form 7** e remova o listener correspondente em `script.js` (está marcado com `// WP:`).

---

## Migração para WordPress

Todos os pontos de integração estão marcados com `// WP:` no JS e `<!-- WP: -->` no HTML. Uma busca global por essa string mostra tudo que precisa de atenção.

### Autenticação

O login em `area-aluno.js` aceita qualquer credencial hoje. No WP, substituir por:
```js
// WP: fetch('/wp-json/jwt-auth/v1/token', { method:'POST', ... })
```

### Progresso das lições

Salvo em `localStorage` hoje. No WP, as funções `getProgressoStorage()` e `salvarProgresso()` devem ser substituídas por chamadas à REST API salvando no `usermeta` do usuário.

Em `aula.js`, a função `markComplete()` já tem o comentário:
```js
// WP: POST /wp-json/mrdave/v1/progress { lesson_id, user_id, completed: true }
```

### Dados dinâmicos via PHP

```php
wp_localize_script('area-aluno', 'MRDAVE_DADOS', [
    'nome'       => wp_get_current_user()->display_name,
    'curso'      => get_user_meta(get_current_user_id(), 'curso', true),
    'tem_debito' => get_user_meta(get_current_user_id(), 'tem_debito', true),
]);
```

Em `area-aluno.js`, trocar o objeto `DADOS_ALUNO` por:
```js
const DADOS_ALUNO = window.MRDAVE_DADOS || { nome: 'Aluno', curso: 'uspeaK', temDebito: false };
```

---

## TTS — Suporte por Navegador

| Navegador   | Suporte     |
|-------------|-------------|
| Chrome 33+  | ✅ Completo  |
| Edge 14+    | ✅ Completo  |
| Safari 7+   | ✅ Parcial   |
| Firefox     | ⚠️ Limitado  |

Se o navegador não suportar TTS, os botões são desabilitados automaticamente com um aviso visual.

---

## Contato e WhatsApp

Para atualizar o número ou email da escola, busque globalmente por:
- **WhatsApp:** `5512988336873`
- **E-mail:** `mrdaveidiomas@gmail.com`

---

## Cores e identidade visual

Tudo em variáveis CSS no topo de `styles.css`:

```css
--color-primary:       #6366f1;   /* roxo principal */
--color-accent:        #ec4899;   /* rosa */
--color-secondary:     #f59e0b;   /* amarelo */
--color-bg:            #0f172a;   /* fundo escuro */
```

---

*Mr. Dave Idiomas © 2026 — Desenvolvido por Itallo Carvalho*
