'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type Lang = 'pt' | 'en';

const STORAGE_KEY = 'app_lang';
const LANGUAGE_CHANGE_EVENT = 'app-language-change';

const TRANSLATIONS = {
  pt: {
    appTitle: 'Crud UF - React/Java',
    browserTitle: 'Estado — Demo ao Vivo com Agente de IA',
    languageSwitchLabel: 'Mudar idioma para inglês',
    logoutLabel: 'Sair',
    newStateButton: 'Novo estado',
    siglaHeader: 'Sigla',
    nomeHeader: 'Nome',
    createdHeader: 'Criado',
    updatedHeader: 'Última Alteração',
    actionsHeader: 'Ações',
    statesTitle: 'Estados',
    saveButton: 'Salvar',
    searchLabel: 'Buscar por nome ou sigla',
    searchPlaceholder: 'Buscar por nome ou sigla...',
    noStates: 'Nenhum estado cadastrado.',
    createFirstState: 'Criar o primeiro estado',
    editButton: 'Editar',
    deleteButton: 'Excluir',
    editStateAria: 'Editar estado {abbreviation}',
    deleteStateAria: 'Excluir estado {abbreviation}',
    cancelButton: 'Cancelar',
    confirmButton: 'Confirmar',
    confirmDelete: 'Tem certeza que deseja excluir o estado {abbreviation}?',
    confirmDeleteGeneric: 'Tem certeza que deseja excluir este estado?',
    loginTitle: 'Login',
    userLabel: 'Usuário',
    passwordLabel: 'Senha',
    enterButton: 'Entrar',
    demoCredentialsNote: 'Credenciais de demo (intencionalmente públicas):',
    createTitle: 'Novo estado',
    editTitle: 'Editar estado',
    abbreviationLabel: 'Sigla',
    nameLabel: 'Nome',
    namePlaceholder: 'Digite o nome do estado...',
    invalidState: 'Estado inválido.',
    abbreviationLengthError: 'Digite a sigla do estado com 2 letras.',
    abbreviationFormatError: 'Digite a sigla do estado com 2 letras maiúsculas.',
    abbreviationDuplicateError: 'Já existe um estado cadastrado com essa sigla.',
    nameMinError: 'Digite o nome do estado com pelo menos 3 caracteres.',
    nameMaxError: 'Digite o nome do estado com no máximo 100 caracteres.',
    invalidCredentialsError: 'Usuário ou senha inválidos.',
    loadStatesError: 'Falha ao buscar estados.',
    loadStateError: 'Falha ao buscar estado.',
    addStateError: 'Falha ao adicionar estado.',
    updateStateError: 'Falha ao atualizar estado.',
    deleteStateError: 'Falha ao deletar estado.',
    apiUnavailableMessage:
      'A API está offline (pausada para reduzir custos). Ative-a pelo link abaixo; isso leva cerca de 1 minuto.',
    startApiLink: 'Ativar a API',
    referenceId: 'ID de referência: {id}',
    loading: 'Carregando...',
    frontendVersion: 'front',
    backendVersion: 'back',
    somethingWentWrong: 'Algo deu errado',
    unexpectedError:
      'Ocorreu um erro inesperado ao carregar esta página. Tente voltar para a página inicial.',
    backToHome: 'Voltar para o início',
  },
  en: {
    appTitle: 'State CRUD - React/Java',
    browserTitle: 'Brazilian States — Live AI Agent Demo',
    languageSwitchLabel: 'Switch language to Portuguese',
    logoutLabel: 'Log out',
    newStateButton: 'New state',
    siglaHeader: 'Abbreviation',
    nomeHeader: 'Name',
    createdHeader: 'Created',
    updatedHeader: 'Last Updated',
    actionsHeader: 'Actions',
    statesTitle: 'States',
    saveButton: 'Save',
    searchLabel: 'Search by name or abbreviation',
    searchPlaceholder: 'Search by name or abbreviation...',
    noStates: 'No states registered.',
    createFirstState: 'Create the first state',
    editButton: 'Edit',
    deleteButton: 'Delete',
    editStateAria: 'Edit {abbreviation}',
    deleteStateAria: 'Delete {abbreviation}',
    cancelButton: 'Cancel',
    confirmButton: 'Confirm',
    confirmDelete: 'Are you sure you want to delete {abbreviation}?',
    confirmDeleteGeneric: 'Are you sure you want to delete this state?',
    loginTitle: 'Login',
    userLabel: 'Username',
    passwordLabel: 'Password',
    enterButton: 'Log in',
    demoCredentialsNote: 'Demo credentials (intentionally public):',
    createTitle: 'New state',
    editTitle: 'Edit state',
    abbreviationLabel: 'Abbreviation',
    nameLabel: 'Name',
    namePlaceholder: 'Enter the state name...',
    invalidState: 'Invalid state.',
    abbreviationLengthError: 'Enter the state abbreviation with 2 letters.',
    abbreviationFormatError: 'Enter the state abbreviation with 2 uppercase letters.',
    abbreviationDuplicateError: 'A state with this abbreviation already exists.',
    nameMinError: 'Enter the state name with at least 3 characters.',
    nameMaxError: 'Enter the state name with at most 100 characters.',
    invalidCredentialsError: 'Invalid username or password.',
    loadStatesError: 'Failed to fetch states.',
    loadStateError: 'Failed to fetch state.',
    addStateError: 'Failed to create state.',
    updateStateError: 'Failed to update state.',
    deleteStateError: 'Failed to delete state.',
    apiUnavailableMessage:
      'The API is offline (paused to save cost). Turn it on with the link below; it takes about 1 minute.',
    startApiLink: 'Turn on the API',
    referenceId: 'Reference ID: {id}',
    loading: 'Loading...',
    frontendVersion: 'front',
    backendVersion: 'back',
    somethingWentWrong: 'Something went wrong',
    unexpectedError:
      'An unexpected error occurred while loading this page. Try going back to the home page.',
    backToHome: 'Back to home',
  },
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)['en'];
type TranslationParams = Record<string, string | number>;
export type Translate = (key: TranslationKey, params?: TranslationParams) => string;

const ERROR_KEYS: TranslationKey[] = [
  'invalidState',
  'invalidCredentialsError',
  'loadStatesError',
  'loadStateError',
  'addStateError',
  'updateStateError',
  'deleteStateError',
  'abbreviationLengthError',
  'abbreviationFormatError',
  'abbreviationDuplicateError',
  'nameMinError',
  'nameMaxError',
];

let currentLang: Lang = 'en';

function getStoredLang(): Lang | undefined {
  try {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    return savedLang === 'pt' || savedLang === 'en' ? savedLang : undefined;
  } catch {
    return undefined;
  }
}

function getLangSnapshot(): Lang {
  return getStoredLang() ?? currentLang;
}

function getServerLangSnapshot(): Lang {
  return 'en';
}

function subscribeToLangChanges(onStoreChange: () => void) {
  function handleStorageChange() {
    currentLang = getStoredLang() ?? currentLang;
    onStoreChange();
  }

  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorageChange);
  };
}

interface TranslationContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const defaultTranslate: Translate = (key, params) => {
  let value: string = TRANSLATIONS.en[key];
  for (const [name, replacement] of Object.entries(params ?? {})) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
};

const TranslationContext = createContext<TranslationContextValue>({
  lang: 'en',
  setLang: () => undefined,
  t: defaultTranslate,
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeToLangChanges, getLangSnapshot, getServerLangSnapshot);

  const setLang = useCallback((newLang: Lang) => {
    currentLang = newLang;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // The current selection still works for this session.
    }
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TRANSLATIONS[lang].browserTitle;
  }, [lang]);

  const value = useMemo<TranslationContextValue>(() => {
    const t: Translate = (key, params) => {
      let translation: string = TRANSLATIONS[lang][key];
      for (const [name, replacement] of Object.entries(params ?? {})) {
        translation = translation.replaceAll(`{${name}}`, String(replacement));
      }
      return translation;
    };
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  return useContext(TranslationContext);
}

export function translateKnownError(message: string | undefined, t: Translate): string | undefined {
  if (!message) {
    return message;
  }

  const key = ERROR_KEYS.find(
    (candidate) => message === TRANSLATIONS.en[candidate] || message === TRANSLATIONS.pt[candidate],
  );
  return key ? t(key) : message;
}
