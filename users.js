
(function (global) {
    'use strict';

    const SESSION_KEY = 'acsAuthenticatedUser';
    const ITERATIONS = 120000;

    const USERS = [

        {
            email: 'gabriel24nt02@gmail.com',
            name: 'Gabriel',
            salt: 'VMJdQoxEWsPwdBZXCCDZww==',
            passwordHash: 'dhKvUIUCWqKtDUSE8qQnhauDnhBYIXams+2h2lOTJ98='
        },
        {
            email: 'guilhermehg6@gmail.com',
            name: 'Guilherme',
            salt: 'iz2r0pEWFimCVLKWzy2Gfg==',
            passwordHash: 'gCelr0W6DvQVStY5K0LdWXWNDb2YwT0uc2MJbfwvsIw='
        },
        {
            email: 'player.store.hg@gmail.com',
            name: 'naruto',
            salt: '7Q+S1MonpF4G6PafQid5EA==',
            passwordHash: '3sNt/RDfJCiZJuGv7gXnorz2B5cXWw/6JDoVnaekBHQ='
        }
    ];

    const PAGES = [
        { href: 'index.html', label: 'Início' },
        { href: 'materiais.html', label: 'Materiais' },
        { href: 'simulados.html', label: 'Simulados' },
        { href: 'progresso.html', label: 'Meu desempenho' }
    ];

    function normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function encodeBytes(bytes) {
        return btoa(String.fromCharCode(...new Uint8Array(bytes)));
    }

    function decodeBytes(value) {
        return Uint8Array.from(atob(value), character =>
            character.charCodeAt(0)
        );
    }

    async function hashPassword(password, salt) {
        if (!global.crypto || !global.crypto.subtle) {
            throw new Error(
                'Seu navegador não oferece suporte à validação segura. Acesse por HTTPS.'
            );
        }

        const key = await global.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const result = await global.crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256'
        }, key, 256);

        return encodeBytes(result);
    }

    function quoteJavaScriptString(value) {
        return "'" + value
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029') + "'";
    }

    async function generateUserCode({ email, name, password }) {
        const normalizedEmail = normalizeEmail(email);
        const normalizedName = String(name || '').trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            throw new Error('Informe um e-mail válido.');
        }

        if (USERS.some(user => normalizeEmail(user.email) === normalizedEmail)) {
            throw new Error('Este e-mail já está cadastrado na lista USERS.');
        }

        if (!normalizedName) {
            throw new Error('Informe o nome do usuário.');
        }

        if (typeof password !== 'string' || password.length < 8) {
            throw new Error('A senha deve ter pelo menos 8 caracteres.');
        }

        if (!global.crypto || !global.crypto.getRandomValues) {
            throw new Error(
                'Seu navegador não oferece suporte à geração segura. Acesse por HTTPS.'
            );
        }

        const salt = global.crypto.getRandomValues(new Uint8Array(16));
        const passwordHash = await hashPassword(password, salt);

        return `,\n        {\n            email: ${quoteJavaScriptString(normalizedEmail)},\n            name: ${quoteJavaScriptString(normalizedName)},\n            salt: ${quoteJavaScriptString(encodeBytes(salt))},\n            passwordHash: ${quoteJavaScriptString(passwordHash)}\n        }`;
    }

    function setSession(email, remember) {
        const storage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;

        storage.setItem(SESSION_KEY, email);
        otherStorage.removeItem(SESSION_KEY);
    }

    function publicUser(user) {
        return {
            email: user.email,
            name: user.name
        };
    }

    async function login({ email, password, remember = false }) {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            throw new Error('Informe seu e-mail e sua senha.');
        }

        const user = USERS.find(candidate =>
            normalizeEmail(candidate.email) === normalizedEmail
        );

        if (!user) {
            throw new Error('E-mail ou senha incorretos.');
        }

        const submittedHash = await hashPassword(
            password,
            decodeBytes(user.salt)
        );

        if (submittedHash !== user.passwordHash) {
            throw new Error('E-mail ou senha incorretos.');
        }

        setSession(user.email, Boolean(remember));

        return publicUser(user);
    }

    function getCurrentUser() {
        const email =
            localStorage.getItem(SESSION_KEY) ||
            sessionStorage.getItem(SESSION_KEY);

        if (!email) return null;

        const user = USERS.find(candidate =>
            normalizeEmail(candidate.email) === normalizeEmail(email)
        );

        return user ? publicUser(user) : null;
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    }

    function safeReturnPath() {
        const requestedPath = new URLSearchParams(
            global.location.search
        ).get('next');

        const allowedPages = [
            'index.html',
            'materiais.html',
            'simulados.html',
            'progresso.html'
        ];

        if (!requestedPath) return 'index.html';

        try {
            const url = new URL(
                requestedPath,
                global.location.origin
            );

            const page = url.pathname.split('/').pop();

            if (
                url.origin !== global.location.origin ||
                !allowedPages.includes(page)
            ) {
                return 'index.html';
            }

            return page + url.search;
        } catch {
            return 'index.html';
        }
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    function addNavigation(user) {
        if (document.querySelector('.acs-user-nav')) return;

        const nav = createElement('nav', 'acs-user-nav');
        nav.setAttribute('aria-label', 'Navegação principal');

        const brand = createElement(
            'a',
            'acs-user-nav-brand',
            '🎓 Preparatório ACS'
        );

        brand.href = 'index.html';

        const links = createElement('div', 'acs-user-nav-links');

        const currentPage = global.location.pathname
            .split('/')
            .pop();

        PAGES.forEach(({ href, label }) => {
            const link = createElement('a', '', label);

            link.href = href;

            if (currentPage === href) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }

            links.appendChild(link);
        });

        const account = createElement(
            'div',
            'acs-user-nav-account'
        );

        const greeting = createElement(
            'span',
            'acs-user-greeting',
            `Olá, ${user.name}!`
        );

        const salesLink = createElement(
            'a',
            'acs-user-nav-cta',
            'Conheça o acesso'
        );
        salesLink.href = 'vendas.html';

        const logoutButton = createElement(
            'button',
            'acs-user-nav-logout',
            'Sair'
        );

        logoutButton.type = 'button';

        logoutButton.addEventListener('click', () => {
            logout();
            global.location.replace('login.html');
        });

        account.append(greeting, salesLink, logoutButton);

        nav.append(brand, links, account);

        document.body.insertBefore(
            nav,
            document.body.firstChild
        );
    }

    function addStyles() {
        if (document.getElementById('acs-auth-styles')) return;

        const style = document.createElement('style');
        style.id = 'acs-auth-styles';

        style.textContent = `
            .acs-user-nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 18px;
                flex-wrap: wrap;
                padding: 15px 5%;
                background: #102c46;
                color: #fff;
                box-shadow: 0 3px 14px rgba(0,0,0,.13);
                position: relative;
                z-index: 100;
                font-family: Arial, sans-serif;
            }

            .acs-user-nav-brand {
                color: #fff;
                font-size: 19px;
                font-weight: 800;
                text-decoration: none;
                white-space: nowrap;
            }

            .acs-user-nav-links {
                display: flex;
                align-items: center;
                gap: 7px;
                flex-wrap: wrap;
            }

            .acs-user-nav-links a {
                color: #e5edf5;
                text-decoration: none;
                padding: 10px 13px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                transition: .2s ease;
            }

            .acs-user-nav-links a:hover,
            .acs-user-nav-links a.active {
                background: #244b6c;
                color: #fff;
            }

            .acs-user-nav-account {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .acs-user-greeting {
                font-size: 14px;
                font-weight: 700;
                color: #fff;
            }

            .acs-user-nav-cta {
                background: #f5a623;
                color: #172c40;
                text-decoration: none;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 800;
                transition: .2s ease;
            }

            .acs-user-nav-cta:hover {
                background: #ffc45c;
                transform: translateY(-1px);
            }

            .acs-user-nav-logout {
                background: transparent;
                border: 1px solid #91a5b7;
                color: #fff;
                border-radius: 8px;
                padding: 9px 13px;
                cursor: pointer;
                font-weight: 600;
                transition: .2s ease;
            }

            .acs-user-nav-logout:hover {
                background: #244b6c;
            }

            @media (max-width: 760px) {
                .acs-user-nav {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 16px;
                }

                .acs-user-nav-brand {
                    text-align: center;
                }

                .acs-user-nav-links {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                }

                .acs-user-nav-links a {
                    text-align: center;
                    background: rgba(255,255,255,.06);
                }

                .acs-user-nav-account {
                    justify-content: center;
                    flex-wrap: wrap;
                }
            }
        `;

        document.head.appendChild(style);
    }

    global.Users = {
        login,
        generateUserCode,
        getCurrentUser,
        safeReturnPath,
        logout
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.body) return;

        if (document.body.dataset.requiresAuth !== 'true') {
            return;
        }

        const user = getCurrentUser();

        if (!user) {
            const currentPage =
                global.location.pathname.split('/').pop();

            const next = `${currentPage}${global.location.search}`;

            global.location.replace(
                `login.html?next=${encodeURIComponent(next)}`
            );

            return;
        }

        addStyles();
        addNavigation(user);
    });

})(window);
