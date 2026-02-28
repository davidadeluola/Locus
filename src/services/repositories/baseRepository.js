export default class BaseRepository {
  constructor() {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract. Extend it and implement methods.');
    }
  }

  findById(id) {
    throw new Error('findById not implemented');
  }

  create(data) {
    throw new Error('create not implemented');
  }

  update(id, data) {
    throw new Error('update not implemented');
  }

  delete(id) {
    throw new Error('delete not implemented');
  }
}
