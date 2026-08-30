import { formatarData } from './formatarData';

describe('formatarData', () => {
  it('formata um ISO string em dd/mm/aaaa hh:mm:ss no padrão pt-BR', () => {
    expect(formatarData('2024-01-05T13:04:09Z')).toMatch(
      /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/,
    );
  });

  it('respeita a data informada', () => {
    const resultado = formatarData('2024-03-20T00:00:00Z');

    expect(resultado.startsWith('20/03/2024') || resultado.startsWith('19/03/2024')).toBe(true);
  });
});
