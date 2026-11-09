/** Textos dos campos de item, que variam com o tipo da categoria (livros, discos...). */
export interface InventoryLabels {
  title: string;
  titlePlaceholder: string;
  author: string;
  authorPlaceholder: string;
}

const DEFAULT_LABELS: InventoryLabels = {
  title: 'Título',
  titlePlaceholder: 'Digite o título...',
  author: 'Autor',
  authorPlaceholder: 'Digite o autor...'
};

const LABELS_BY_CATEGORY: Record<string, InventoryLabels> = {
  livros: {
    title: 'Título do livro',
    titlePlaceholder: 'Ex.: Dom Casmurro, 1984...',
    author: 'Autor',
    authorPlaceholder: 'Ex.: Machado de Assis, George Orwell...'
  },
  discos: {
    title: 'Nome do álbum',
    titlePlaceholder: 'Ex.: Abbey Road, The Dark Side of the Moon...',
    author: 'Banda/Artista',
    authorPlaceholder: 'Ex.: The Beatles, Pink Floyd...'
  }
};

export function inventoryLabelsFor(categoryName: string | null | undefined): InventoryLabels {
  return LABELS_BY_CATEGORY[(categoryName ?? '').trim().toLowerCase()] ?? DEFAULT_LABELS;
}
