import { Struct } from 'domain/entities';
import { FormatterFactory, SupportedFormat } from './formatters';
import { Ketcher } from './ketcher';

class KetcherProvider {
  private ketcherInstance: Ketcher | undefined;

  constructor() {}

  setKetcherInstance(ketcherInstance: Ketcher) {
    this.ketcherInstance = ketcherInstance;
  }

  getKetcher() {
    return this.ketcherInstance;
  }
}

const ketcherProvider = new KetcherProvider();

export { ketcherProvider };

export function getStructure(
  structureFormat = SupportedFormat.rxn,
  formatterFactory: FormatterFactory,
  struct: Struct,
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat);
  return formatter.getStructureFromStructAsync(struct);
}
