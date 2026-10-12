/// <reference types="vite/client" />

// TinyMCE self-hosted side-effect imports (theme, icons, plugins, lang
// pack) ship no TypeScript declarations; they only need to load.
declare module 'tinymce/models/dom';
declare module 'tinymce/themes/silver';
declare module 'tinymce/icons/default';
declare module 'tinymce/plugins/lists';
declare module 'tinymce-i18n/langs/id.js';
